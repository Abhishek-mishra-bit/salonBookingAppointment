// routes/booking.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require("../middlewares/authMiddleware");

router.get('/page', bookingController.getBookingPage);
router.post('/create', protect, bookingController.createBooking);
router.get('/all', protect, bookingController.getAllBookings);
router.get('/user', protect, bookingController.getUserBookings);
router.post('/pay', protect, bookingController.processPayment);
// Cancel booking
router.patch('/cancel/:bookingId', protect, bookingController.cancelBooking);

// Reschedule booking
router.patch('/reschedule/:bookingId', protect, bookingController.rescheduleBooking);

module.exports = router;