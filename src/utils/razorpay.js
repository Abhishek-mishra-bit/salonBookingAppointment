const Razorpay = require("razorpay");
require("dotenv").config();

const razorpayInstance =  new Razorpay({
  key_id: process.env.RAZORPAY_KEYID,
  key_secret: process.env.RAZORPAY_KEYSECRET,
});

module.exports = razorpayInstance;