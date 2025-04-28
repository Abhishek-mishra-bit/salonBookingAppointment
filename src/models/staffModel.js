// models/staff.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db'); // Your sequelize instance

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'staffs',
  timestamps: true
});

module.exports = Staff;
