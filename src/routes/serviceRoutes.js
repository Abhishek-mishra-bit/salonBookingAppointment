const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { customerOnly } = require("../middlewares/roleMiddleware");
const { createService, getServices, updateService, deleteService, getServicesPage } = require("../controllers/serviceController");

// Customer: view services page and list
router.get("/page", protect, customerOnly, getServicesPage );
router.get("/", protect, customerOnly, getServices);

// Admin: manage services (add, update, delete)
router.post("/", protect, createService); // add adminOnly if needed
router.patch("/:id", protect, updateService); // add adminOnly if needed
router.delete("/:id", protect, deleteService); // add adminOnly if needed

module.exports = router;
