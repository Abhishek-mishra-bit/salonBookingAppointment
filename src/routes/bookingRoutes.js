// routes/booking.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require("../middlewares/authMiddleware");
const { customerOnly } = require("../middlewares/roleMiddleware");

router.get('/page', bookingController.getBookingPage);
// Customer routes
router.get('/mine', protect, customerOnly, bookingController.getUserBookings);
router.post('/create', protect, customerOnly, bookingController.createBooking);
router.post('/pay', protect, customerOnly, bookingController.processPayment);
router.patch('/cancel/:bookingId', protect, customerOnly, bookingController.cancelBooking);
router.patch('/reschedule/:bookingId', protect, customerOnly, bookingController.rescheduleBooking);

// Admin/staff routes (if needed)
router.get('/all', protect, bookingController.getAllBookings);
router.get('/user', protect, bookingController.getUserBookings);

module.exports = router;