const express = require("express");
const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

// get all the pending connection request for the login user
userRouter.get("/user/requests/recieved", userAuth, async(req, res)=>{
    try {
        const loggedInUser = req.user;
        const connectRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName","age", "gender", "photoUrl", "about", "skills"]);
         
        res.json({ message: "Connection requests fetched successfully", data: connectRequests});  
        
    } catch (error) {
        res.status(400).send("Error+", error.message);
    }

});

// connection 
userRouter.get("/user/connections", userAuth, async(req, res)=>{
     try {
        const logggedInUser = req.user;
        //rounak => jyoti => accepted
        //jyoti => mayank => accepted

        const connectionRequests= await ConnectionRequest.find({
            $or:[
                { toUserId: logggedInUser._id, status: "accepted"},
                {fromUserId: logggedInUser._id, status: "accepted"}
            ]
        }).populate("fromUserId", ["firstName", "lastName","age", "gender", "photoUrl", "about", "skills"])
        .populate("toUserId",  ["firstName", "lastName","age", "gender", "photoUrl", "about", "skills"]);
        const data = connectionRequests.map( (row)=> {
            if(row.fromUserId._id.toString() === logggedInUser._id.toString()){
                return row.toUserId;
            }
            else{
                return row.fromUserId;
            }
     });
         res.json({data });
        
     } catch (error) {
         res.status(400).send("Error:"+ error.message);
     }
});

// feed api
userRouter.get("/user/feed", userAuth, async(req, res)=>{
    try{
        // user can see all the other users cards except:
        // user should not see this own card
        // user should not see the cards of the user whom he/she has ignored
        // user should also not see the card whom he has accepted and have connnection
        // user should not see the cards of the user whom he send connection request
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page -1)*limit;

        // Build filter object
        const filters = {};
        // gender filter
        if(req.query.gender){
            filters.gender = req.query.gender;
        }
        // min age filter
        if(req.query.minAge){
            filters.age = { $gte: parseInt(req.query.minAge)}
        }
        // max age filter
        if(req.query.maxAge){
            filters.age.$lte = parseInt(req.query.maxAge)
        }
        // skills filter
        if(req.query.skills){
            filters.skills = { $in: [req.query.skills]}
        }

        // find all connection request which eihter i have sent or recieved
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id}, // either i have sendt connection request
                {toUserId: loggedInUser._id}, // either i have recieved connection request
            ]
        }).select("fromUserId toUserId");

        const hideUserFromFeed = new Set();
        connectionRequests.forEach(req=>{
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        });
        const users = await User.find({
           $and:[{
            _id: { $nin: Array.from(hideUserFromFeed)},
           },
          { _id: {$ne: loggedInUser._id}},
          filters
        ]
        }).select("firstName lastName photoUrl age gender about skills").skip(skip).limit(limit);
        res.send(users);
    }
    catch(error){
        res.status(400).send("Error: "+ error.message);
    }
})

module.exports = userRouter;