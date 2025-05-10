const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const cookieParser = require('cookie-parser');

exports.protect = async (req, res, next) => {
  try {
    // Try to get token from Authorization header
    let token = req.headers.authorization;
    // If not found, try to get it from cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    console.log("token is ::", token);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
