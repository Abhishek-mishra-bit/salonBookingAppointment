const User = require("../models/userModel");
const rootDir = require("../utils/path");
const path = require("path");
const sequelize = require("../utils/db");
const { Op } = require("sequelize");
const Booking = require("../models/bookingModel");
const Service = require("../models/serviceModel");
const Staff = require("../models/staffModel");
const Review = require("../models/reviewModel");

exports.getDashboardPage = async (req, res) => {
    try {
      // req.user should be populated by protect middleware
      const user = req.user;
      const  userId = user?.id;
      if (!userId) return res.status(401).send("Unauthorized");

      if (user.role === 'admin') {
        return res.sendFile(path.join(rootDir, 'src/views', 'admin-dashboard.html'));
      } else if (user.role === 'customer') {
        return res.sendFile(path.join(rootDir, 'src/views', 'customer-dashboard.html'));
      } else if (user.role === 'staff') {
        return res.sendFile(path.join(rootDir, 'src/views', 'staff-dashboard.html'));
      } else {
        // fallback for any other role
        return res.sendFile(path.join(rootDir, 'src/views', 'dashboard.html'));
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

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    
    // Find the user
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Check if email is changed and already exists
    if (email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }
    
    // Check if phone is changed and already exists
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ where: { phone } });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
    }
    
    // Update user
    user.name = name;
    user.email = email;
    if (phone) user.phone = phone;
    
    await user.save();
    
    // Return updated user data
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Get past appointments for the user
exports.getPastAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Find all past appointments
    const bookings = await Booking.findAll({
      where: {
        userId: userId,
        [Op.or]: [
          // Before today
          { date: { [Op.lt]: currentDate } },
          // Today but with completed status
          { 
            date: currentDate,
            status: 'completed'
          }
        ]
      },
      include: [
        {
          model: Service,
          attributes: ['id', 'name', 'price']
        },
        {
          model: Staff,
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    
    // Get all reviews by this user to check which appointments have been reviewed
    const reviews = await Review.findAll({
      where: { userId: userId },
      attributes: ['bookingId']
    });
    
    // Set of bookingIds that have been reviewed
    const reviewedBookings = new Set(reviews.map(review => review.bookingId));
    
    // Map bookings to include hasReview flag
    const formattedBookings = bookings.map(booking => {
      const bookingData = booking.toJSON();
      return {
        ...bookingData,
        hasReview: reviewedBookings.has(booking.id)
      };
    });
    
    res.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching past appointments:", error);
    res.status(500).json({ message: "Error fetching past appointments" });
  }
};

// Get notifications for the user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's upcoming appointments for appointment reminders
    const upcomingAppointments = await Booking.findAll({
      where: {
        userId: userId,
        status: 'confirmed',
        date: {
          [Op.gte]: new Date().toISOString().split('T')[0]
        }
      },
      include: [
        {
          model: Service,
          attributes: ['name']
        },
        {
          model: Staff,
          attributes: ['name']
        }
      ],
      limit: 5,
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    
    // Create notification objects
    const notifications = [];
    
    // Add appointment notifications
    upcomingAppointments.forEach(appointment => {
      const apptDate = new Date(`${appointment.date}T${appointment.time}`);
      const now = new Date();
      
      // Calculate days difference
      const timeDiff = apptDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Only add notification if appointment is within the next 3 days
      if (daysDiff <= 3) {
        let timeMessage = '';
        if (daysDiff === 0) {
          timeMessage = 'today';
        } else if (daysDiff === 1) {
          timeMessage = 'tomorrow';
        } else {
          timeMessage = `in ${daysDiff} days`;
        }
        
        notifications.push({
          id: `appt-${appointment.id}`,
          type: 'appointment',
          read: false,
          message: `You have an appointment for ${appointment.Service.name} with ${appointment.Staff.name} ${timeMessage} at ${appointment.time}.`,
          date: now
        });
      }
    });
    
    // Add a promotional notification (sample)
    notifications.push({
      id: 'promo-1',
      type: 'promotion',
      read: false,
      message: 'Special discount on all hair services this weekend!',
      date: new Date()
    });
    
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Mark a notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // In a real implementation, you would update the notification in the database
    // For now, just return success
    
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
};
  