const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/auth/register", authController.getRegisterationPage);
router.get("/auth/login", authController.getLoginPage);

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

const { protect } = require("../middlewares/authMiddleware");
router.post('/auth/logout', protect,authController.logout);






module.exports = router;
 