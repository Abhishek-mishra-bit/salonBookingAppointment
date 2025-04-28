// controllers/bookingController.js
const Booking = require('../models/bookingModel');
const jwt = require('jsonwebtoken');
const rootDir = require("../utils/path");
const path = require("path");
const Service = require("../models/serviceModel");
const Staff = require("../models/staffModel")

exports.getBookingPage = async (req, res) =>{
    res.sendFile(path.join(rootDir,"views","booking.html"));
    
}

exports.createBooking = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { serviceId, staffId, date, time } = req.body;

    const booking = await Booking.create({
      serviceId,
      staffId,
      userId: decoded.id,
      date,
      time
    });

    res.status(201).json({ message: 'Booking successful!', booking });
  } catch (err) {
    console.error('Booking Error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
          include: [
            { model: Service, attributes: ['id', 'name'] },  
            { model: Staff, attributes: ['id', 'name'] }    
          ]
        });
    
        res.json(bookings);
      } catch (err) {
    console.error('Fetching bookings failed:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// 🆕 Cancel Appointment
exports.cancelBooking = async (req, res) => {
    try {
      const { bookingId } = req.params;
  
      const booking = await Booking.findByPk(bookingId);
  
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      booking.status = "cancelled";
      await booking.save();
  
      res.json({ message: "Booking cancelled successfully!" });
    } catch (err) {
      console.error('Cancel Booking Error:', err);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  };
  
  // 🆕 Reschedule Appointment
exports.rescheduleBooking = async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { date, time } = req.body;
  
      const booking = await Booking.findByPk(bookingId);
  
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      booking.date = date;
      booking.time = time;
      booking.status = "rescheduled";
      await booking.save();
  
      res.json({ message: "Booking rescheduled successfully!" });
    } catch (err) {
      console.error('Reschedule Booking Error:', err);
      res.status(500).json({ error: 'Failed to reschedule booking' });
    }
};
