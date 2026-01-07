const mongoose = require("mongoose");
const validator = require('validator');

const userSchema = new mongoose.Schema(
    {
    firstName: {
        type: String,
        required:true,
        trim: true,
        minLength: 4,
        maxLength: 50
    },
    lastName:{
        type: String,
        trim: true,
        minLength: 4,
        maxLength: 50
    },
    emailId: {
        type: String,
        trim: true,
        lowercase: true,
        required:true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is not valid:"+ value)
            }
        }
    },
    password:{
        type: String,
        required: true,
        minLength: 6,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Password is not strong enough:"+ value)
            }
        }
    },
    age:{
        type: Number,
        min: 18,
        max: 100,
        validate(value){
            if(value < 18){
                throw new Error("Age must be 18 or above")
            }
        }
    },
    gender: {
        type: String,
        validate(value){
            if(!["male", "female", "others"].includes(value)){
                throw new Error("Gender data is not valid")
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/042/332/098/small/default-avatar-profile-icon-grey-photo-placeholder-female-no-photo-images-for-unfilled-user-profile-greyscale-illustration-for-socail-media-web-vector.jpg",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("URL is not valid:")
            }
        }
    },
    about: {
        type: String,
        maxLength: 200,
        default: "This is a bio section of the user!"
    },
    skills: {
        type: [String]
    }
},{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
