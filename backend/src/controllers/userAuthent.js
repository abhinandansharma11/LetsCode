const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")
const { sendOtpEmail } = require("../utils/sendEmail");
const { generateAndStoreOtp, verifyOtp, canResendOtp } = require("../utils/otpHelper");


const register = async (req,res)=>{

    try{
        // validate the data;

      validate(req.body);
      const {firstName, emailId, password}  = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ emailId });
      if (existingUser) {
        // If exists but not verified, allow them to get new OTP
        if (!existingUser.isEmailVerified) {
          try {
            const otp = await generateAndStoreOtp(existingUser._id, "email");
            await sendOtpEmail({ to: emailId, name: existingUser.firstName, otp, type: "verify" });
          } catch (emailErr) {
            console.log("Email sending failed:", emailErr.message);
          }
          return res.status(200).json({
            message: "Account exists. OTP sent to your email for verification.",
            userId: existingUser._id
          });
        }
        // If already verified, reject
        return res.status(409).json({ message: "Email already registered. Please login." });
      }

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'user'

     const user = await User.create(req.body);

     // Try to send OTP email, but don't fail registration if it fails
     let emailSent = false;
     try {
       const otp = await generateAndStoreOtp(user._id, "email");
       await sendOtpEmail({ to: emailId, name: firstName, otp, type: "verify" });
       emailSent = true;
     } catch (emailErr) {
       console.log("Email sending failed:", emailErr.message);
       // Email failed but user is created - they can use resend OTP
     }

     res.status(201).json({
        message: emailSent ? "OTP sent to your email" : "Registration successful. Please request OTP on verification page.",
        userId: user._id
    });
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});

        // Check if user exists
        if(!user) {
            return res.status(401).json({ message: "No account found with this email." });
        }

        const match = await bcrypt.compare(password, user.password);

        if(!match) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (user.isEmailVerified === false) {
            return res.status(403).json({ message: "Email not verified", userId: user._id });
        }

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        res.status(401).json({ message: "Login failed. Please try again." });
    }
}


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);


        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
    //   if(req.result.role!='admin')
    //     throw new Error("Invalid Credentials");  
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    // userSchema delete
    await User.findByIdAndDelete(userId);

    // Submission se bhi delete karo...
    
    // await Submission.deleteMany({userId});
    
    res.status(200).send("Deleted Successfully");

    }
    catch(err){
      
    }
}

const verifyEmail = async (req, res, next) => {
    try {
        const { userId, otp } = req.body;
        const result = await verifyOtp(userId, "email", otp);
        
        if (!result.valid) {
            if (result.reason === "expired") {
                return res.status(410).json({ message: "OTP has expired. Please request a new one." });
            }
            return res.status(400).json({ message: "Invalid OTP" });
        }
        
        await User.findByIdAndUpdate(userId, { isEmailVerified: true });
        res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
        next(err);
    }
};

const resendOtp = async (req, res, next) => {
    try {
        const { userId, type } = req.body; // type: "email" | "reset"
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const canResend = await canResendOtp(userId, type);
        if (!canResend) {
            return res.status(429).json({ message: "Please wait before requesting a new OTP" });
        }

        const otp = await generateAndStoreOtp(userId, type);

        try {
          await sendOtpEmail({
              to: user.emailId,
              name: user.firstName,
              otp,
              type: type === "email" ? "verify" : "reset"
          });
          res.status(200).json({ message: "OTP sent successfully" });
        } catch (emailErr) {
          console.log("Email sending failed:", emailErr.message);
          res.status(503).json({ message: "Failed to send email. Please try again later." });
        }
    } catch (err) {
        next(err);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ emailId: email });
        
        if (user) {
            const otp = await generateAndStoreOtp(user._id, "reset");
            await sendOtpEmail({ to: email, name: user.firstName, otp, type: "reset" });
        }
        
        // Return 200 even if user not found to avoid email enumeration
        res.status(200).json({ message: "If this email exists, an OTP has been sent", userId: user ? user._id : null });
    } catch (err) {
        next(err);
    }
};

const verifyResetOtp = async (req, res, next) => {
    try {
        const { userId, otp } = req.body;
        const result = await verifyOtp(userId, "reset", otp);
        
        if (!result.valid) {
            if (result.reason === "expired") {
                return res.status(410).json({ message: "OTP has expired. Please request a new one." });
            }
            return res.status(400).json({ message: "Invalid OTP" });
        }
        
        const resetToken = jwt.sign(
            { userId, purpose: "password-reset" },
            process.env.JWT_KEY,
            { expiresIn: "5m" }
        );
        
        res.status(200).json({ message: "OTP verified", resetToken });
    } catch (err) {
        next(err);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;
        
        // Verify token
        const payload = jwt.verify(resetToken, process.env.JWT_KEY);
        if (payload.purpose !== "password-reset") {
            return res.status(400).json({ message: "Invalid token purpose" });
        }
        
        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(payload.userId, { password: hashedPassword });
        
        // Blacklist token
        await redisClient.set(`token:${resetToken}`, 'Blocked');
        await redisClient.expireAt(`token:${resetToken}`, payload.exp);
        
        res.status(200).json({ message: "Password reset successful. Please login." });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(410).json({ message: "Reset token has expired." });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: "Invalid reset token." });
        }
        next(err);
    }
};

module.exports = {
    register, 
    login,
    logout,
    adminRegister,
    deleteProfile,
    verifyEmail,
    resendOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword
};