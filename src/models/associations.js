const User = require('./userModel');
const Service = require('./serviceModel');
const Staff = require('./staffModel');
const Booking = require('./bookingModel');
const Review = require('./reviewModel');
const Payment = require('./paymentModel');

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
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Staff, { foreignKey: 'staffId' });

// Payment Associations
Payment.belongsTo(User, { foreignKey: 'userId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

module.exports = {
    User,
    Service,
    Staff,
    Booking,
    Review,
    Payment
};
