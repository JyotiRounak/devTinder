const cron = require("node-cron");
const connectionRequest = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const { sendEmail } = require("../utils/sendEmail");

cron.schedule("0 8 * * *", async()=>{
    // send emails to all the people who got request last day
    try{
       const yesterdayDate = subDays(new Date(), 1);
       const yesterdayStart = startOfDay(yesterdayDate);
       const yesterdayEnd = endOfDay(yesterdayDate);
        //pending request
        const pendingRequestsOfYesterday = await connectionRequest.find({
            status: "interested",
            createdAt: {
               $gte: yesterdayStart,
               $lt: yesterdayEnd,
            },
        }).populate("fromUserId toUserId")

        const listofEmails = [...new Set(pendingRequestsOfYesterday.map((req)=> req.toUserId.emailId))];

        for( const email of listofEmails ){
            try {
                const res = await sendEmail.run(`New Friend Request Pending for` +  email,
                    "There are so many friend request pendings, please login to devTinder.in and accept or reject the request"
                );
                console.log(res);
            } catch (error) {
                console.log(error);
            }
        }

    }
    catch(error){
        console.warn(error)
    }
})