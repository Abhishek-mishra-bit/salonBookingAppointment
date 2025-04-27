const User = require("../models/userModel");
const rootDir = require("../utils/path");
const path = require("path");


exports.getDashboardPage = async (req, res) => {
    res.sendFile(path.join(rootDir,"views","dashboard.html"));

};
exports.getProfile = async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id); // Sequelize find by PK
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching profile" });
    }
  };
  