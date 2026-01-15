const express = require("express");
const { userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const requestRouter = express.Router();
const { sendEmail } = require("../utils/sendEmail");

// create send connection request
requestRouter.post("/request/send/:status/:toUserId", userAuth, async(req, res)=>{
    try {
         const fromUserId = req.user._id;
         const toUserId = req.params.toUserId;
         const status = req.params.status;

         const ALLOWED_STATUS= ["interested", "ignored"];
         if(!ALLOWED_STATUS.includes(status)){
            throw new Error("Invalid status");
         }
         // check if toUser exists or not
         const toUser = await User.findById(toUserId);
         if(!toUser){
            throw new Error("User not found")
         }
         // check if the existing request is there
         const existingRequest = await ConnectionRequest.findOne({ 
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
         });
         if(existingRequest){
            throw new Error("Connection request already exists");
         }
         const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
         });
         const data = await connectionRequest.save();
         const emailRes = await sendEmail.run(
            `You just got a new connection request from ${req.user.firstName}`,
            req.user.firstName + " is " + status + " to " + toUser.firstName, data);
         
         res.json({ message: req.user.firstName + " is " + status + " to " + toUser.firstName, data})
        
    } catch (error) {
         res.status(400).send("Error:"+ error.message);
    }
});

// create 
requestRouter.post("/request/review/:status/:requestId", userAuth, async(req, res)=>{
   try {
      const loggedInUser = req.user;
      const {status, requestId} = req.params;
      // validate the status
      const ALLOWED_STATUS= ["accepted", "rejected"];
      const isValidStatus = ALLOWED_STATUS.includes(status);
      if(!isValidStatus){
         return res.status(400).send("Invalid status");
      }
      // jyoti => rounak
      // loggedInuser === toUserId
      // status = interested
      // requestId should a valid one

      const connectionRequest = await ConnectionRequest.findOne({
         _id: requestId,
         toUserId: loggedInUser._id,
         status: "interested"
      });
      if(!connectionRequest){
         throw new Error("Connection request not found");
      }
       connectionRequest.status = status;
       await connectionRequest.save();
       res.json({ message: `Connection request ${status} by ${loggedInUser.firstName}`, data: connectionRequest});
      
   } catch (error) {
      res.status(400).send("Error:"+ error.message);
   }

});
module.exports = requestRouter;