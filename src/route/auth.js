const express = require("express");
const {vaildateSignupData} = require("../utils/validation");
const User = require('../models/user');
const validator = require('validator');
const authRouter = express.Router();

//
authRouter.post("/signup", async(req, res)=>{
    try {
    // validation of data
    vaildateSignupData(req);

    const { firstName, lastName, emailId, password} = req.body;

    // creating a new instance of user model
    const user = new User({
        firstName, 
        lastName, 
        emailId, 
        password
    });
    const savedUser = await user.save();
    // create a jwt token
    const token = await savedUser.getJwt();
    // add the token to cookie and send back the response to user
    res.cookie("token", token, { expires: new Date(Date.now() + 900000), httpOnly: true });
    res.json({message: "User signup successfully", data: savedUser});
        
    } catch (error) {
        res.status(400).send(error.message);
    }

});

authRouter.post("/login", async(req, res)=>{
    try {
        const { emailId, password} = req.body;

        if(!validator.isEmail(emailId)){
            throw new Error("Invalid credentials");
        }
        const user = await User.findOne({ emailId});
         if(!user){
            return res.status(400).send("user is not present with this emailId");
        }
        const isPasswordValid = await user.verifyPassword(password);
        if(isPasswordValid){
            // create a jwt token
            const token = await user.getJwt();
            // add the token to cookie and send back the response to user
            res.cookie("token", token, { expires: new Date(Date.now() + 900000), httpOnly: true });
            res.status(200).json({data: user});
        }
        else{
            res.status(400).send("Invalid credentials");
        }
         
    } catch (error) {
        res.status(400).send(error.message);
    }

});

authRouter.post("/logout", async(req, res)=>{
    res
    .cookie("token", null, { expires: new Date(Date.now())})
    .send("User logout successfully");
});

module.exports = authRouter;