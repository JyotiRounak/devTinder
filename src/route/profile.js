const express = require("express");
const { userAuth} = require("../middleware/auth");
const { validateProfileEditData } = require("../utils/validation");
const {verifyPassword} = require("../models/user");
const profileRouter = express.Router();

// get profile of user
profileRouter.get("/profile/view", userAuth, async(req, res)=>{
    try {
        const user = req.user;
        res.send(user);

    } catch (error) {
        res.status(400).send("Error:"+ error.message);
    }
});
// edit profile
profileRouter.patch("/profile/edit", userAuth, async(req, res)=>{
    try {
        if(!validateProfileEditData(req)){
            throw new Error("invalid updates")
        };
        const user = req.user; 
        Object.keys(req.body).forEach((k)=>{
            user[k] = req.body[k];
        });
        console.log(user);
        await user.save();
        res.json(
            {message: "Profile updated successfully", 
            data: user
        });
    } catch (error) {
        res.status(400).send("Error:"+ error.message);
    }
});

profileRouter.patch("/profile/password", userAuth, async(req, res)=>{
    try {
      const user = req.user;
      const { password, newPassword} = req.body;
      const isPasswordValid = await user.verifyPassword(password);
      if(!isPasswordValid){
        throw new Error("invalid password")
      }
      user.password = newPassword;
      await user.save();
      res.send("Password updated successfully");
        
    } catch (error) {
         res.status(400).send("Error:"+ error.message);
    }
});

module.exports = profileRouter;