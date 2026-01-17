const express = require("express");
const paymentRouter = express.Router();
const { userAuth} = require("../middleware/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payments");
const {membershipAmount} = require("../utils/constant");
// create order
paymentRouter.post("/payment/create", userAuth, async(req, res)=>{

    const {membershipType} = req.body;
    const {firstName, lastName, emailId}= req.user;

    try {
          const order = await razorpayInstance.orders.create({
            "amount": membershipAmount[membershipType]*100,
            "currency": "INR",
            "receipt": "receipt#1",
            "partial_payment": false,
            "notes": {
                "firstName": firstName,
                "lastName": lastName,
                "emailId": emailId,
                "membershipType": membershipType
            }
          });

          // save it in my database
          const payment = new Payment({
              userId: req.user._id,
              orderId: order.id,
              status: order.status,
              amount: order.amount,
              currency: order.currency,
              receipt: order.receipt,
              notes: order.notes,
          });

          const savedpayment = await payment.save();

          // send back the order detail to frontend
          res.json({...savedpayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID});
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }

});








module.exports = paymentRouter;