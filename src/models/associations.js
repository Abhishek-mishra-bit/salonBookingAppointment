const User = require('./userModel');
const Service = require('./serviceModel');
const Staff = require('./staffModel');
const Booking = require('./bookingModel');
const Review = require('./reviewModel');
const Payment = require('./paymentModel');
const Activity = require('./activityModel');
const Notification = require('./notificationModel');

// User Associations
User.hasMany(Booking, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId' });
User.hasMany(Payment, { foreignKey: 'userId' });

// Service Associations
Service.hasMany(Booking, { foreignKey: 'serviceId' });

// Staff Associations
Staff.hasMany(Booking, { foreignKey: 'staffId' });
Staff.hasMany(Review, { foreignKey: 'staffId' });

// Booking Associations
Booking.belongsTo(User, { foreignKey: 'userId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });
Booking.belongsTo(Staff, { foreignKey: 'staffId' });
Booking.hasOne(Payment, { foreignKey: 'bookingId' });

// Review Associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
Review.belongsTo(Staff, { foreignKey: 'staffId' });
Staff.hasMany(Review, { foreignKey: 'staffId' });

// Payment Associations
Payment.belongsTo(User, { foreignKey: 'userId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

// Activity Associations
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notification Associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId' });

module.exports = {
    User,
    Service,
    Staff,
    Booking,
    Review,
    Payment,
    Activity,
    Notification
};
