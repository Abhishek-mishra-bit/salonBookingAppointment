const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const {adminOnly} = require("../middlewares/roleMiddleware");

// Admin dashboard pages
router.get('/page',protect,adminOnly, adminController.getAllBookingPage);

// Bookings management
router.get('/bookings', protect, adminOnly, adminController.getAllBookings);

// Analytics endpoints
router.get('/analytics', protect, adminOnly, adminController.getAnalytics);

// User management
router.get('/users', protect, adminOnly, adminController.getAllUsers);
router.post('/users', protect, adminOnly, adminController.createUser);
router.put('/users/:id', protect, adminOnly, adminController.updateUser);
router.delete('/users/:id', protect, adminOnly, adminController.deleteUser);

// Activity tracking
router.get('/activities', protect, adminOnly, adminController.getActivities);

// Today's schedule
router.get('/today-schedule', protect, adminOnly, adminController.getTodaySchedule);

// Admin notifications
router.get('/notifications', protect, adminOnly, adminController.getAdminNotifications);
router.put('/notifications/read/:id', protect, adminOnly, adminController.markNotificationRead);
router.put('/notifications/read-all', protect, adminOnly, adminController.markAllNotificationsRead);

module.exports = router;
