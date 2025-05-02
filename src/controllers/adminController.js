const Booking = require('../models/bookingModel');
const rootDir = require("../utils/path");
const path = require("path");
const Service = require("../models/serviceModel");
const Staff = require("../models/staffModel");
const User = require("../models/userModel");

exports.getAllBookingPage = async(req, res)=>{
  res.sendFile(path.join(rootDir, "views", "admin-appointments.html"));  
}

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Service, attributes: ['name'] },
        { model: Staff, attributes: ['name'] },
        { model: User, attributes: ['name'] }  // Add user name (customer)
      ]
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

