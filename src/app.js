const express = require('express');
const connecttoDatabase = require("./config/database");
const User = require('./models/user');
const app = express();
app.use(express.json());
//
app.post("/signup", async(req, res)=>{
    // creating a new instance of user model
    const user = new User(req.body);
    try {

    await user.save();
    res.send("User signup successfully");
        
    } catch (error) {
        res.status(400).send("Error signing up user");
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
    res.status(400).send("Error finding user");
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
    res.status(400).send("Error finding user");
   }
});

// delete the user
app.delete("/user", async(req, res)=>{
   try {
    const user = await User.findByIdAndDelete({_id: req.body.userId});
    // const user = await User.findByIdAndDelete(req.body.userId);
    res.send("user deleted successfully");
   } catch (error) {
    res.status(400).send("Error finding user");
   }
});

// update the user
app.patch("/user", async(req, res)=>{
   try {
    const user = await User.findByIdAndUpdate(req.body.userId, req.body);
    // const user = await User.findByIdAndDelete(req.body.userId);
    res.send("user updated successfully");
   } catch (error) {
    res.status(400).send("Error finding user");
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