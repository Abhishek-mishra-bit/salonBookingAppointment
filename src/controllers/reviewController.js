
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const path = require('path');
const rootDir = require('../utils/path');

exports.getReviewPage = (req, res) => {
    res.sendFile(path.join(rootDir, 'views', 'review.html'));
  };

// ⭐ Add a Review
exports.addReview = async (req, res) => {
  try {
    const { bookingId, staffId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user already reviewed this booking
    const existing = await Review.findOne({ where: { bookingId, userId } });
    if (existing) {
      return res.status(400).json({ message: 'Review already submitted.' });
    }

    const review = await Review.create({ bookingId, userId, staffId, rating, comment });
    res.status(201).json(review);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// ⭐ Get All Reviews for a Staff Member
exports.getReviewsByStaff = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const reviews = await Review.findAll({ where: { staffId } });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
};

// ⭐ Reply to a Review (Admin/Staff)
exports.replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.reply = reply;
    await review.save();
    res.json({ message: 'Reply added', review });
  } catch (err) {
    console.error('Reply error:', err);
    res.status(500).json({ error: 'Failed to reply to review' });
  }
};
