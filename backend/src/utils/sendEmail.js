const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOtpEmail = async ({ to, name, otp, type }) => {
  const subject = type === "verify" 
    ? "Verify your WECode account" 
    : "Reset your WECode password";

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #1a1a1a; color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
      <h2 style="color: #4CAF50;">Hello ${name},</h2>
      <p style="font-size: 16px;">Here is your OTP for ${type === "verify" ? "account verification" : "password reset"}:</p>
      <div style="background-color: #333333; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #aaaaaa;">Valid for 10 minutes.</p>
      <p style="font-size: 14px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    html,
  };

  await sgMail.send(msg);
};

module.exports = {
  sendOtpEmail
};
