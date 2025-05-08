  const Payment = require("../models/paymentModel");
  const Booking = require('../models/bookingModel');
  const razorpay = require("../utils/razorpay");
  const Razorpay = require("razorpay");


  exports.createOrder = async (req, res) => {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEYID,
      key_secret: process.env.RAZORPAY_KEYSECRET,
    });
    
    try {
      
      const { bookingId, amount } = req.body;
      const options = {
        amount,
        currency: "INR",
      };      

      const order = await instance.orders.create(options);

      // Save order info in Payment table
      await Payment.create({
        userId: req.user.id,
        bookingId,
        razorpayOrderId: order.id,
        amount,
        status: 'pending',
      });

      res.status(200).json({
        success: true,
        orderId: order.id,
        amount,
        key_id: process.env.RAZORPAY_KEYID,
        bookingId:bookingId,
      });
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      res.status(500).json({ success: false, error: "Order creation failed" });
    }
  };



  exports.confirmPayment = async (req, res) => {    
    try {
      const {
        bookingId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      } = req.body;
      

      // Update payment info
      const paymentRecord = await Payment.findOne({
        where: {
          razorpayOrderId: razorpay_order_id,
          bookingId
        }
      });

      if (!paymentRecord) {
        return res.status(404).json({ error: 'Payment record not found' });
      }

      await paymentRecord.update({
        razorpayPaymentId: razorpay_payment_id,
        status: 'success',
      });

      // Update the original booking
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      await booking.update({
        status: "confirmed",
        paymentStatus: "paid",
        transactionId: razorpay_payment_id,
        paymentDate: new Date()
      });
      res.status(200).json({ success: true, booking });
    } catch (err) {
      console.error("Error confirming payment:", err);
      res.status(500).json({ success: false, error: "Payment confirmation failed" });
    }
  };

