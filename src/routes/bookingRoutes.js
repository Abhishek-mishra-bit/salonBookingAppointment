// routes/booking.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/page', bookingController.getBookingPage);
router.post('/create', bookingController.createBooking);
router.get('/all', bookingController.getAllBookings);
// 🆕 Cancel booking
router.patch('/cancel/:bookingId', bookingController.cancelBooking);

// 🆕 Reschedule booking
router.patch('/reschedule/:bookingId', bookingController.rescheduleBooking);

module.exports = router;
