const Payment = require("../models/paymentModel");
const Booking = require('../models/bookingModel');
const razorpay = require("../utils/razorpay");

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // in paisa (e.g., ₹500 = 50000)

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_order_${Math.random() * 1000}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.status(201).json({ success: true, order,  key_id: process.env.RAZORPAY_KEYID  });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, error: "Order creation failed" });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { order_id, payment_id, status } = req.body;
    console.log("💰 Payment confirmed:", order_id, payment_id, status);
    // Save this info to DB if needed
    res.json({ success: true });
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json({ success: false, error: "Payment confirmation failed" });
  }
};
