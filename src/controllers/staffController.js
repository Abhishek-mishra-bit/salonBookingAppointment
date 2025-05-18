const Staff = require('../models/staffModel');
const Review = require('../models/reviewModel');
const { fn, col } = require('sequelize');
const rootDir = require("../utils/path");
const path = require("path");


exports.getStaffPage = async (req, res)=>{
    res.sendFile(path.join(rootDir,"src/views","staff.html"));
};
// ➡ Add New Staff
exports.addStaff = async (req, res) => {
  try {
    const { name, email, phone, specialization, isActive } = req.body;

    const staff = await Staff.create({ name, email, phone, specialization, isActive });

    res.status(201).json({ message: "Staff added successfully!", staff });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ➡ Get All Staff Members
exports.getAllStaff = async (req, res) => {
  try {
    const staffRows = await Staff.findAll({
      attributes: {
        include: [
          // Compute the average of rating as avgRating
          [ fn('AVG', col('rating')), 'avgRating' ]
        ]
      },
      include: [{
        model: Review,
        as: 'Reviews',
        attributes: [],   // no need to select any Review columns
        required: false   // LEFT JOIN so staff with no reviews are included
      }],
      group: ['Staff.id']  // group by staff ID to aggregate reviews
    });

    // Format results: parse the avg (it comes as string/number) and default if null
    const staffList = staffRows.map(staff => {
      // Destructure fields from staff instance
      const { id, name, specialization, email } = staff;
      let avg = staff.getDataValue('avgRating');
      let rating = (avg !== null) 
                   ? parseFloat(avg).toFixed(1)         // round to 1 decimal
                   : 'No ratings yet';                  // default text
      return { id, name, specialization, email, avgRating: rating };
    });

    res.json(staffList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching staff' });
  }
}

// ➡ Update Staff
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, isActive } = req.body;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // Update with all fields from request body, including available status
    await staff.update({ name, email, phone, specialization, isActive });

    res.status(200).json({ message: "Staff updated successfully!", staff });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ➡ Delete Staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    await staff.destroy();

    res.status(200).json({ message: "Staff deleted successfully!" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ➡ Get Staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findByPk(id, {
      include: [{
        model: Review,
        attributes: ['rating', 'comment', 'createdAt'],
        required: false
      }]
    });
    
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }
    
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff details" });
  }
};
