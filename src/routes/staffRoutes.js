const express = require("express");
const router = express.Router();
const { addStaff, getAllStaff, updateStaff, deleteStaff, getStaffPage, getStaffById } = require("../controllers/staffController");
// If you have an auth middleware to protect these routes, import it as well:
const { protect } = require("../middlewares/authMiddleware");

// Protect all staff routes (optional, based on your project requirements)
router.get("/page", getStaffPage);
router.post("/", protect, addStaff);
router.get("/", protect, getAllStaff);
router.put("/:id", protect, updateStaff);
router.delete("/:id", protect, deleteStaff);

// Get staff by ID
router.get("/:id", protect, getStaffById);

module.exports = router;
