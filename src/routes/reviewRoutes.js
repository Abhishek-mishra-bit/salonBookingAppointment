const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middlewares/authMiddleware'); // JWT auth middleware

router.get('/submit/:bookingId', reviewController.getReviewPage);
router.post('/add', reviewController.addReview);
router.get('/staff/:staffId', reviewController.getReviewsByStaff);
router.post('/reply/:reviewId', reviewController.replyToReview);

module.exports = router;