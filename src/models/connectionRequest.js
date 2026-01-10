const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({

    fromUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    status:{
        type: String,
        required:true,
        enum:{
            values: ["interested", "ignored", "accepted", "rejected"],
            message: `{VALUE} is not valid status`
        }
    }
},
{ timestamps: true });

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1}, { unique: true});

connectionRequestSchema.pre("save", async function(){
     const connectionRequest = this;
     // any pre save operations can be added here
     // check if the fromUserId is same as toUserId
     if(!connectionRequest.fromUserId || !connectionRequest.toUserId){
        return;
    }
     if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
       throw new Error("cannot send connection request to self");
     }
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);

