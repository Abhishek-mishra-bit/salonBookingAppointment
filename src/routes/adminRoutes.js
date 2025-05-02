const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bookingController = require('../controllers/bookingController');


router.get('/page', adminController.getAllBookingPage);
 
router.get('/bookings', adminController.getAllBookings);


module.exports = router;
