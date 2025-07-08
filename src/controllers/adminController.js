const Booking = require('../models/bookingModel');
const rootDir = require("../utils/path");
const path = require("path");
const Service = require("../models/serviceModel");
const Staff = require("../models/staffModel");
const User = require("../models/userModel");
const Payment = require("../models/paymentModel");
const Review = require("../models/reviewModel");
const Activity = require("../models/activityModel");
const Notification = require("../models/notificationModel");
const sequelize = require("../utils/db");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

exports.getAllBookingPage = async(req, res)=>{
  res.sendFile(path.join(rootDir, "src/views", "admin-dashboard.html"));  
}

exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Convert pagination parameters to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    // Build where condition
    const whereCondition = {};
    if (status && status !== 'all') {
      whereCondition.status = status;
    }
    
    // Get total count for pagination
    const count = await Booking.count({ where: whereCondition });
    
    // Fetch paginated bookings
    const bookings = await Booking.findAll({
      where: whereCondition,
      include: [
        { model: Service, attributes: ['name', 'price'] },
        { model: Staff, attributes: ['name'] },
        { model: User, attributes: ['name', 'email', 'phone'] }
      ],
      order: [['date', 'DESC'], ['time', 'ASC']],
      limit: limitNum,
      offset: offset
    });
    
    // Return with pagination metadata
    res.json({
      total: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      limit: limitNum,
      bookings: bookings
    });
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

/**
 * Get analytics data for admin dashboard
 */
exports.getAnalytics = async (req, res) => {
  try {
    // Get current date and past periods for comparison
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Calculate date from 7 days ago for weekly comparison
    const lastWeekDate = new Date(now);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeek = lastWeekDate.toISOString().split('T')[0];
    
    // Current week start (Sunday)
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(currentWeekStart.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Last week for comparison
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    
    // Total bookings count
    const totalBookings = await Booking.count();
    
    // Bookings this week
    const bookingsThisWeek = await Booking.count({
      where: {
        createdAt: { [Op.gte]: currentWeekStart }
      }
    });
    
    // Bookings last week
    const bookingsLastWeek = await Booking.count({
      where: {
        createdAt: {
          [Op.gte]: previousWeekStart,
          [Op.lt]: currentWeekStart
        }
      }
    });
    
    // Calculate booking trend percentage
    let bookingsTrend = 0;
    if (bookingsLastWeek > 0) {
      bookingsTrend = Math.round(((bookingsThisWeek - bookingsLastWeek) / bookingsLastWeek) * 100);
    }
    
    // Total revenue
    const revenueResult = await Payment.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      where: {
        status: 'success'
      }
    });
    const totalRevenue = Number(revenueResult.getDataValue('total')) || 0;
    
    // Revenue this week
    const revenueThisWeekResult = await Payment.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      where: {
        status: 'success',
        createdAt: { [Op.gte]: currentWeekStart }
      }
    });
    const revenueThisWeek = Number(revenueThisWeekResult.getDataValue('total')) || 0;
    
    // Revenue last week
    const revenueLastWeekResult = await Payment.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      where: {
        status: 'success',
        createdAt: {
          [Op.gte]: previousWeekStart,
          [Op.lt]: currentWeekStart
        }
      }
    });
    const revenueLastWeek = Number(revenueLastWeekResult.getDataValue('total')) || 0;
    
    // Calculate revenue trend percentage
    let revenueTrend = 0;
    if (revenueLastWeek > 0) {
      revenueTrend = Math.round(((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100);
    }
    
    // Active staff count - now using the isActive column
    const activeStaff = await Staff.count({
      where: {
        isActive: true
      }
    });
    
    // Total customers count
    const totalCustomers = await User.count({
      where: {
        role: 'customer'
      }
    });
    
    // New customers this week
    const newCustomers = await User.count({
      where: {
        role: 'customer',
        createdAt: { [Op.gte]: currentWeekStart }
      }
    });
    
    res.json({
      totalBookings,
      bookingsTrend,
      totalRevenue,
      revenueTrend,
      activeStaff,
      totalCustomers,
      newCustomers
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

/**
 * Get all users for admin management with pagination
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    
    // Convert pagination parameters to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    // Build where conditions
    const whereConditions = {};
    
    // Add role filter if specified
    if (role) {
      whereConditions.role = role;
    }
    
    // Add search filter if specified
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Get total count for pagination
    const count = await User.count({ where: whereConditions });
    
    // Get paginated users
    const users = await User.findAll({
      where: whereConditions,
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: offset
    });
    
    // Return with pagination metadata
    res.json({
      total: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      limit: limitNum,
      users: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Create a new user
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });
    
    // Record this activity using Activity model
    await Activity.create({
      userId: req.user.id,
      type: 'user',
      action: 'create',
      message: `Created new ${role} account for ${name}`,
      entityId: newUser.id,
      entityType: 'User'
    });
    
    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Update a user
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, password, role } = req.body;
    
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if email is changed and already exists
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email;
    }
    
    // Check if phone is changed and already exists
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
      user.phone = phone;
    }
    
    // Update user fields
    if (name) user.name = name;
    if (role) user.role = role;
    
    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    
    await user.save();
    
    // Record this activity using Activity model
    await Activity.create({
      userId: req.user.id,
      type: 'user',
      action: 'update',
      message: `Updated user account for ${user.name}`,
      entityId: user.id,
      entityType: 'User'
    });
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Delete a user
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId == req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has bookings
    const userBookings = await Booking.count({ where: { userId } });
    if (userBookings > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with existing bookings. Consider deactivating instead.'
      });
    }
    
    // Record this activity using Activity model
    await Activity.create({
      userId: req.user.id,
      type: 'user',
      action: 'delete',
      message: `Deleted user account for ${user.name}`,
      entityId: user.id,
      entityType: 'User'
    });
    
    // Delete user
    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Get activity logs for admin dashboard with pagination
 */
exports.getActivities = async (req, res) => {
  try {
    const { filter, page = 1, limit = 10 } = req.query;
    
    // Convert pagination parameters to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    let whereCondition = {};
    
    // Apply filter if specified
    if (filter && filter !== 'all') {
      whereCondition.type = filter;
    }
    
    // Get total count for pagination
    const count = await Activity.count({ where: whereCondition });
    
    // Use Activity model to fetch activities with pagination
    const activities = await Activity.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: offset,
      include: [
        {
          model: User,
          as: 'activityUser',
          attributes: ['name']
        }
      ]
    });
    
    // Format activities for the frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      message: activity.message,
      timestamp: activity.createdAt,
      user: activity.activityUser ? activity.activityUser.name : 'System'
    }));

    // Return with pagination metadata
    res.json({
      total: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      limit: limitNum,
      activities: formattedActivities
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

/**
 * Get today's schedule for admin dashboard
 */
exports.getTodaySchedule = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const todayBookings = await Booking.findAll({
      where: {
        date: today
      },
      include: [
        { model: Service, attributes: ['name'] },
        { model: Staff, attributes: ['name'] },
        { model: User, attributes: ['name'] }
      ],
      order: [['time', 'ASC']]
    });
    
    res.json(todayBookings);
  } catch (err) {
    console.error('Error fetching today\'s schedule:', err);
    res.status(500).json({ error: 'Failed to fetch today\'s schedule' });
  }
};

/**
 * Get admin notifications
 */
exports.getAdminNotifications = async (req, res) => {
  try {
    // Get admin user ID
    const adminId = req.user.id;
    
    // Find or create admin notifications
    const notifications = await Notification.findAll({
      where: { userId: adminId },
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{
        model: User,
        as: 'notificationUser',
        attributes: ['name']
      }]
    });
    
    // If no notifications exist, create some initial ones from recent activities
    if (notifications.length === 0) {
      await createInitialAdminNotifications(adminId);
      
      // Fetch the newly created notifications
      const newNotifications = await Notification.findAll({
        where: { userId: adminId },
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [{
          model: User,
          as: 'notificationUser',
          attributes: ['name']
        }]
      });
      
      return res.json(newNotifications);
    }
    
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching admin notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Helper function to create initial admin notifications
 */
async function createInitialAdminNotifications(adminId) {
  try {
    // Create notifications from recent bookings
    const recentBookings = await Booking.findAll({
      limit: 3,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['name'] },
        { model: Service, attributes: ['name'] }
      ]
    });
    
    // Create notifications from pending reviews - we'll handle model inclusion carefully
    let pendingReviews = [];
    try {
      // First try using just userId to avoid association issues
      pendingReviews = await Review.findAll({
        where: { reply: null },
        limit: 2,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'userId', 'staffId', 'rating', 'comment', 'createdAt']
      });
      
      // Separately fetch staff and user data
      if (pendingReviews.length > 0) {
        const staffIds = pendingReviews.map(review => review.staffId);
        const userIds = pendingReviews.map(review => review.userId);
        
        const staffMembers = await Staff.findAll({
          where: { id: { [Op.in]: staffIds } },
          attributes: ['id', 'name']
        });
        
        const reviewUsers = await User.findAll({
          where: { id: { [Op.in]: userIds } },
          attributes: ['id', 'name']
        });
        
        // Create lookup maps
        const staffMap = {};
        staffMembers.forEach(staff => {
          staffMap[staff.id] = staff.name;
        });
        
        const userMap = {};
        reviewUsers.forEach(user => {
          userMap[user.id] = user.name;
        });
        
        // Add the names to the review objects
        pendingReviews = pendingReviews.map(review => {
          const plainReview = review.get({ plain: true });
          plainReview.staffName = staffMap[review.staffId] || 'Unknown Staff';
          plainReview.userName = userMap[review.userId] || 'Unknown User';
          return plainReview;
        });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Continue with empty array if there's an error
    }
    
    // Create booking notifications
    for (let i = 0; i < recentBookings.length; i++) {
      const booking = recentBookings[i];
      await Notification.create({
        userId: adminId,
        type: 'booking',
        message: `New booking for ${booking.Service.name} by ${booking.User.name}`,
        read: i > 0, // Make only the first one unread
        entityId: booking.id,
        entityType: 'Booking'
      });
    }
    
    // Create review notifications
    for (const review of pendingReviews) {
      await Notification.create({
        userId: adminId,
        type: 'review',
        message: `New ${review.rating}-star review for ${review.staffName} from ${review.userName}`,
        read: false,
        entityId: review.id,
        entityType: 'Review'
      });
    }
    
    return true;
  } catch (err) {
    console.error('Error creating initial notifications:', err);
    return false;
  }
}

/**
 * Mark a notification as read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Find notification
    const notification = await Notification.findByPk(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Make sure this notification belongs to the current user
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Update notification
    notification.read = true;
    await notification.save();
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    await Notification.update(
      { read: true },
      { where: { userId: adminId } }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

/**
 * Complete a booking
 */
exports.completeBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Find the booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update status to completed
    booking.status = 'completed';
    await booking.save();
    
    // Log activity
    await Activity.create({
      userId: req.user.id,
      type: 'booking',
      action: 'complete',
      message: `Marked booking #${bookingId} as completed`,
      entityId: bookingId,
      entityType: 'Booking'
    });
    
    res.json({ message: 'Booking marked as completed', booking });
  } catch (err) {
    console.error('Error completing booking:', err);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
};

/**
 * Cancel a booking
 */
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Find the booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update status to cancelled
    booking.status = 'cancelled';
    await booking.save();
    
    // Log activity
    await Activity.create({
      userId: req.user.id,
      type: 'booking',
      action: 'cancel',
      message: `Cancelled booking #${bookingId}`,
      entityId: bookingId,
      entityType: 'Booking'
    });
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

/**
 * Reschedule a booking
 */
exports.rescheduleBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { date, time } = req.body;
    
    // Validate input
    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }
    
    // Find the booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Save previous date/time for activity log
    const previousDate = booking.date;
    const previousTime = booking.time;
    
    // Update booking
    booking.date = date;
    booking.time = time;
    await booking.save();
    
    // Log activity
    await Activity.create({
      userId: req.user.id,
      type: 'booking',
      action: 'reschedule',
      message: `Rescheduled booking #${bookingId} from ${previousDate} ${previousTime} to ${date} ${time}`,
      entityId: bookingId,
      entityType: 'Booking'
    });
    
    // Create notification for the customer
    const customerNotification = await Notification.create({
      userId: booking.userId,
      type: 'booking',
      message: `Your appointment has been rescheduled to ${date} at ${time}`,
      read: false,
      entityId: bookingId,
      entityType: 'Booking'
    });
    
    res.json({ message: 'Booking rescheduled successfully', booking });
  } catch (err) {
    console.error('Error rescheduling booking:', err);
    res.status(500).json({ error: 'Failed to reschedule booking' });
  }
};
