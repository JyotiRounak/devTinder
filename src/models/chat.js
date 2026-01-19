const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        reuired: true
    },
    text: {
        type: String,
        reuired: true
    }

}, { timestamps: true});

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }],
    messages: [messageSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model("Chat", chatSchema);