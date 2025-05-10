const User = require("../models/userModel");
const rootDir = require("../utils/path");
const path = require("path");

exports.getDashboardPage = async (req, res) => {
    try {
      // req.user should be populated by protect middleware
      const user = req.user;
      const  userId = user?.id;
      if (!userId) return res.status(401).send("Unauthorized");

      if (user.role === 'admin') {
        return res.sendFile(path.join(rootDir, 'views', 'admin-dashboard.html'));
      } else if (user.role === 'customer') {
        return res.sendFile(path.join(rootDir, 'views', 'customer-dashboard.html'));
      } else if (user.role === 'staff') {
        return res.sendFile(path.join(rootDir, 'views', 'staff-dashboard.html'));
      } else {
        // fallback for any other role
        return res.sendFile(path.join(rootDir, 'views', 'dashboard.html'));
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error loading dashboard');
    }
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
  