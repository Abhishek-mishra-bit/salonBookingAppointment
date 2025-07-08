// controllers/bookingController.js
const Booking = require('../models/bookingModel');
const rootDir = require("../utils/path");
const path = require("path");
const Service = require("../models/serviceModel");
const Staff = require("../models/staffModel")

exports.getBookingPage = async (req, res) =>{
    res.sendFile(path.join(rootDir,"src/views","booking.html"));    
}

exports.createBooking = async (req, res) => {
  try {
    
    const { serviceId, staffId, date, time } = req.body;
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const booking = await Booking.create({
      serviceId,
      staffId,
      userId: req.user.id,
      date,
      time,
      status: 'pending',
      paymentStatus: 'pending',
      amountPaid: service.price
    });

    
    res.status(201).json({ 
      message: 'Booking created successfully!', 
      booking,
      servicePrice: service.price
    });
  } catch (err) {
    console.error('Booking Error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get bookings for the logged-in customer only
exports.getUserBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Only fetch bookings for the logged-in customer
    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: Service, 
          attributes: ['id', 'name', 'price'] 
        },
        { 
          model: Staff, 
          attributes: ['id', 'name', 'specialization', 'avgRating'] 
        }
      ],
      order: [['date', 'DESC']],
      limit,
      offset
    });

    res.json({
      appointments: bookings,
      totalCount: count
    });
  } catch (err) {
    console.error('Fetching bookings failed:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Process Payment
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;
      

    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Update payment status
    booking.paymentStatus = 'paid';
    booking.transactionId = transactionId;
    booking.paymentDate = new Date();
    await booking.save();

    res.json({ 
      message: 'Payment successful!', 
      bookingId: booking.id,
      transactionId: booking.transactionId
    });
  } catch (err) {
    console.error('Payment Error:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

// Get user's bookings with payment status
exports.getUserBookings = async (req, res) => {
  try {
    

    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: Service, 
          attributes: ['id', 'name', 'price'] 
        },
        { 
          model: Staff, 
          attributes: ['id', 'name', 'specialization'] 
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(bookings);
  } catch (err) {
    console.error('Fetching bookings failed:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
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
