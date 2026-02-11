const mongoose = require("mongoose");
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

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
        max: 70,
        validate(value){
            if(value < 18){
                throw new Error("Age must be 18 or above")
            }
        }
    },
    gender: {
        type: String,
        enum:{
            values: ["female", "male", "others"],
            message: `{VALUE} is not valid gender type`
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
    photoPublicId: {
    type: String,
    default: null,
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

userSchema.methods.getJwt = async function(){
    const user = this;
    const token = await jwt.sign({_id: user._id}, process.env.JWT_SECRET, { expiresIn: "1d"});
    return token;

}
userSchema.methods.verifyPassword = async function(passwordInput){
    const user = this;
    const hashPassword = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInput, hashPassword);
    return isPasswordValid;
}
userSchema.pre("save", async function(){
    if(!this.isModified("password")){
      return;
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
});
module.exports = mongoose.model("User", userSchema);
