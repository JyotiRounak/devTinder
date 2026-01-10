const express = require('express');
const connecttoDatabase = require("./config/database");
const User = require('./models/user');
const cookieParser = require('cookie-parser');
const authRouter = require("./route/auth");
const profileRouter = require("./route/profile");
const requestRouter = require("./route/request");
const userRouter = require('./route/user');
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

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