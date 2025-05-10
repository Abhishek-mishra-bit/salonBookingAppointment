const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const rootDir = require("../utils/path");
const path = require("path");


exports.getRegisterationPage=async(req, res)=>{
    res.sendFile(path.join(rootDir, "views", "signup.html"));
}

exports.getLoginPage = async(req, res)=>{
    res.sendFile(path.join(rootDir, "views", "login.html"));
}
exports.register = async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;

    // Accept role from query string if not in body
    if (!role && req.query.role) {
      role = req.query.role;
    }
    const allowedRoles = ['customer', 'staff', 'admin'];
    if (!role) role = 'customer';
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    res.status(201).json({ message: "Registration successful", user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Check role if provided
    

    const token = generateToken(user);
    // Set JWT as HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    // Respond with user info only (no token)
    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
};


