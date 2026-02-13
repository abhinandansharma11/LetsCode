const validator =require("validator");

// req.body 

const validate = (data)=>{
   
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    // require a minimum length of 8 to match the frontend form
    if(!validator.isLength(data.password, { min: 8 }))
        throw new Error("Weak Password: password must be at least 8 characters long");
}

module.exports = validate;