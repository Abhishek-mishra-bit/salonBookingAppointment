const Staff = require('../models/staffModel');
const rootDir = require("../utils/path");
const path = require("path");


exports.getStaffPage = async (req, res)=>{
    res.sendFile(path.join(rootDir,"views","staff.html"));
};
// ➡ Add New Staff
exports.addStaff = async (req, res) => {
  try {
    const { name, email, phone, specialization } = req.body;

    const staff = await Staff.create({ name, email, phone, specialization });

    res.status(201).json({ message: "Staff added successfully!", staff });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ➡ Get All Staff Members
exports.getAllStaff = async (req, res) => {
  try {
    const staffs = await Staff.findAll();
    res.status(200).json(staffs);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ➡ Update Staff
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization } = req.body;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    await staff.update({ name, email, phone, specialization });

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
