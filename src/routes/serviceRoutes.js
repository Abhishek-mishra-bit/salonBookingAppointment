const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { customerOnly, adminOnly } = require("../middlewares/roleMiddleware");
const { createService, getServices, updateService, deleteService, getServicesPage } = require("../controllers/serviceController");

// View services page - accessible to all authenticated users
router.get("/page", protect, getServicesPage );

// Get list of services - accessible to customers and admins
router.get("/", protect, getServices);

// Admin: manage services (add, update, delete)
router.post("/", protect, adminOnly, createService);
router.patch("/:id", protect, adminOnly, updateService);
router.delete("/:id", protect, adminOnly, deleteService);

module.exports = router;
