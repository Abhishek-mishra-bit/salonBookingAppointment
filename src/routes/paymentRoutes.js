const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");


router.post("/create-order",protect, paymentController.createOrder);
router.post("/confirm-payment",protect, paymentController.confirmPayment);

module.exports = router;
