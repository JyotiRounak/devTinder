
const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const getSecretRoomId = ({userId, targetUserId})=>{
    return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
}

const initializeSocket = (server)=>{
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
        }
    });
    io.on("connection", (socket)=>{
        // handle events
        socket.on("joinChat", ({firstName, userId, targetUserId})=>{
            const roomId = getSecretRoomId({userId, targetUserId});
            console.log(firstName + " Joining roon: " + roomId)
            socket.join(roomId);

        });
        socket.on("sendMessage", async({firstName, lastName, userId, targetUserId, text})=>{
            
            // save message to database
            try{
                const roomId = getSecretRoomId({userId, targetUserId});
               let chat = await Chat.findOne({
                participants: {$all: [userId, targetUserId]},
            });
            if(!chat){
                chat = new Chat({
                    participants: [userId, targetUserId],
                    messages: []
                });
            }
            chat.messages.push({senderId: userId, text });
            io.to(roomId).emit("messageReceived", {firstName, lastName, text});
            await chat.save();
            }
            catch(error){
                console.warn(error)
            }
            
            
        });
        socket.on("disconnect", ()=>{
            
        })
    });
    
}

module.exports = initializeSocket;