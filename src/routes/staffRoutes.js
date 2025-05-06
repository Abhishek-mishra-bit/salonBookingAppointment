const express = require("express");
const router = express.Router();
const { addStaff, getAllStaff, updateStaff, deleteStaff, getStaffPage } = require("../controllers/staffController");
// If you have an auth middleware to protect these routes, import it as well:
const { protect } = require("../middlewares/authMiddleware");

// Protect all staff routes (optional, based on your project requirements)
router.get("/page", getStaffPage);
router.post("/", protect, addStaff);
router.get("/", protect, getAllStaff);
router.patch("/:id", protect, updateStaff);
router.delete("/:id", protect, deleteStaff);

// Get staff by ID
router.get("/:id", protect, async (req, res) => {
    try {
        const staff = await Staff.findByPk(req.params.id, {
            include: [
                {
                    model: Review,
                    attributes: ['rating', 'comment', 'createdAt'],
                    required: false
                }
            ]
        });
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

module.exports = router;
