const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

// Dashboard pages
router.get("/page", protect, dashboardController.getDashboardPage);

// Profile management
router.get("/auth/profile", protect, dashboardController.getProfile);
router.put("/profile/update", protect, dashboardController.updateProfile);

// Appointments
router.get("/appointments/past", protect, dashboardController.getPastAppointments);

// Notifications
router.get("/notifications", protect, dashboardController.getNotifications);
router.put("/notifications/read/:id", protect, dashboardController.markNotificationRead);

module.exports = router;
