const express = require("express");
const { userAuth} = require("../middleware/auth");
const chatRouter = express.Router();
const Chat = require("../models/chat");
const connectionRequest = require("../models/connectionRequest");

chatRouter.get("/chat/:targetUserId", userAuth, async(req, res)=>{
    try {
        const { targetUserId } = req.params;
        const userId = req.user._id;

        // userId and target should be friends to send msgs
        const isFriend = await connectionRequest.findOne({
          $or:[  {fromUserId: userId,
            toUserId: targetUserId,
            status: "accepted" },
            {fromUserId: targetUserId,
            toUserId: userId,
            status: "accepted" },
        ]
        });

        if (!isFriend) {
      return res.status(403).json({
        message: "You are not connected with this user",
      });
    }
        let chat = await Chat.findOne({
        participants: {$all: [userId, targetUserId]},
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName"
        });
        console.log("chat", chat)
        if(!chat){
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: []
            });
            await chat.save();
        }
        res.status(200).json(chat)
    } catch (error) {
        res.status(400).json({message: error.message })
    }
})



module.exports = chatRouter;