// models/booking.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const Service = require("../models/serviceModel");
const Staff = require("../models/staffModel")
const User = require("../models/userModel");

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'confirmed' // confirmed, cancelled, rescheduled
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending', // pending, paid, failed
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

Booking.belongsTo(Service, { foreignKey: 'serviceId' });
Booking.belongsTo(Staff, { foreignKey: 'staffId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

module.exports = Booking;
