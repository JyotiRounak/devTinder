const express = require('express');
const connecttoDatabase = require("./config/database");
const User = require('./models/user');
const {vaildateSignupData} = require("./utils/validation");
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const { userAuth} = require("./middleware/auth");
const app = express();
app.use(express.json());
app.use(cookieParser());
//
app.post("/signup", async(req, res)=>{
    try {
    // validation of data
    vaildateSignupData(req);

    const { firstName, lastName, emailId, password} = req.body;

    // encryption of password can be done here
    const passwordHash = await bcrypt.hash(password, 10);
    // creating a new instance of user model
    const user = new User({
        firstName, 
        lastName, 
        emailId, 
        password: passwordHash
    });
    await user.save();
    res.send("User signup successfully");
        
    } catch (error) {
        res.status(400).send("Error:" + error.message);
    }

});

app.post("/login", async(req, res)=>{
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
            res.send("user logged in successfully");
        }
        else{
            res.status(400).send("Invalid credentials");
        }
         
    } catch (error) {
        res.status(400).send("Error:"+ error.message);
    }

});

// get profile of user
app.get("/profile", userAuth, async(req, res)=>{
    try {
        const user = req.user;
        res.send(user);

    } catch (error) {
        res.status(400).send("Error:"+ error.message);
    }

});

// create send connection request
app.post("/sendConnectionRequest", userAuth, async(req, res)=>{
    try {
        const user = req.user;
        res.send(user.firstName + " send connect request");
        
    } catch (error) {
         res.status(400).send("Error:"+ error.message);
    }
});
// get user by emailid
app.get("/getuser", async(req, res)=>{
   try {
    const user = await User.findOne({emailId : req.body.emailId});
    if(!user){
        return res.status(400).send("Error finding user");
    }
    else{
    res.send(user);
    }
   } catch (error) {
    res.status(400).send("Error finding user:" + error.message);
   }
});

// get the feed of users all users
app.get("/feed", async(req, res)=>{
   try {
    const user = await User.find({});
    if(user.length === 0){
        return res.status(400).send("No users found");
    }
    else{
    res.send(user);
    }
   } catch (error) {
    res.status(400).send("Error finding user:" + error.message);
   }
});

// delete the user
app.delete("/user", async(req, res)=>{
   try {
    const user = await User.findByIdAndDelete({_id: req.body.userId});
    // const user = await User.findByIdAndDelete(req.body.userId);
    res.send("user deleted successfully");
   } catch (error) {
    res.status(400).send("Error finding user:" + error.message);
   }
});

// update the user
app.patch("/user/:userId", async(req, res)=>{
    const userId = req.params.userId;
    const data = req.body;
    const ALLOWED_UPDATES = ["photoUrl", "about", "skills", "gender", "age"];
    const isUpdateAllowed = Object.keys(data).every((k)=> ALLOWED_UPDATES.includes(k));
    if(!isUpdateAllowed){
        throw new Error("updating is not allowed to the fields")
    }
    if(data.skills.length > 10){
        throw new Error("skills cannot be more than 10")
    }
   try {
    const user = await User.findByIdAndUpdate({_id: userId}, data, {runValidators: true});
    // const user = await User.findByIdAndDelete(req.body.userId);
    res.send("user updated successfully");
   } catch (error) {
    res.status(400).send("updating failed:"+ error.message);
   }
});

// handle auth middleware for all requests Get, post, put, delete, patch
app.use('/admin', (req, res, next)=>{
    console.log("This is the admin middleware");
});

// order of the routes matters a lot
app.use("/hello", (req, res, next)=>{
    
    console.log("This is the hello route");
    throw new Error("xxxx")
    next();
}, (req, res)=>{
    res.send("Hello world 2");
});

app.use("/", (err, req, res, next)=>{
    if(err){
        res.status(500).send("something went wrong")
    }
});

connecttoDatabase()
.then(()=>{
    console.log("successfully connected to database");
    app.listen(3000, ()=>{
        console.log("server is listening on port 3000");
    })
})
.catch((err)=>{
    console.log("error connecting to database", err);
})