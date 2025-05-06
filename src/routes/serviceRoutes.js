const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { createService, getServices, updateService, deleteService, getServicesPage } = require("../controllers/serviceController");

// Protect all service routes
router.get("/page", getServicesPage );

router.post("/", protect, createService);
router.get("/",protect, getServices);
router.patch("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;
