const express = require('express');
const PayRouter = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();



PayRouter.post("/order", async (req, res) => {
try {
    const instance = new Razorpay({
        key_id: process.env.RZR_KEY_ID ,
        key_secret: process.env.RZR_KEY_SECRET,
    });

    const options = {
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: crypto.randomBytes(10).toString("hex"),
    }

    instance.orders.create(options, (err, order)=>{
        if(err){
            console.log(err);
            return res.status(500).json({message: `something went wrong`})
        }
        res.status(200).send({data: order})
    })
} catch (error) {
    console.log(error);
    res.status(500).json({message: `Internal Server Error`})
}
})


PayRouter.post("/verify", async (req, res) => {
    try {
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body
        const sign = razorpay_order_id + "|" +razorpay_payment_id
        const expectedSign = crypto.createHmac("sha256", process.env.KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

        if(razorpay_signature === expectedSign) {
            return res.status(200).json({message: "Payment verified successfully"})
        }else{
            return res.status(400).json({message: "Payment rejected due to invalid signature"});
        }
    } catch (error) {
        
    }
})

module.exports = PayRouter;