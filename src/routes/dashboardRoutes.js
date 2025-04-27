const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/page", dashboardController.getDashboardPage);
router.get("/auth/profile", protect,dashboardController.getProfile);

module.exports = router;
