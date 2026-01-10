const validator = require('validator');
const vaildateSignupData = (req)=>{
    const { firstName, lastName, emailId, password} = req.body;
    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    if(!trimmedFirstName || trimmedFirstName.length < 4 || trimmedFirstName.length > 50){
        throw new Error("First name is required and should be between 4 and 50 characters");
    }
    else if(!trimmedLastName || trimmedLastName.length < 4 || trimmedLastName.length > 50){
        throw new Error("Last name is required and should be between 4 and 50 characters");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Email is not valid")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Password is not strong enough")
    }
}

const validateProfileEditData = (req)=>{
    const ALLOWERED_UPDATES = ["photUrl", "age", "about", "skills", "gender"];
    const isUpdateAllowed = Object.keys(req.body).every((k)=> ALLOWERED_UPDATES.includes(k));
    return true;
}

module.exports = { vaildateSignupData, validateProfileEditData};