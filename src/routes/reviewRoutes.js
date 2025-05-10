const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require("../middlewares/authMiddleware");

router.get('/submit', reviewController.getReviewPage);
router.post('/add',protect, reviewController.addReview);
router.get('/staff/:staffId',protect, reviewController.getReviewsByStaff);
router.post('/reply/:reviewId',protect, reviewController.replyToReview);

module.exports = router;