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
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  workingDays: {
    type: DataTypes.STRING, // Stored as JSON string e.g. "[0,1,2,3,4]" for Mon-Fri
    allowNull: true,
    get() {
      const value = this.getDataValue('workingDays');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('workingDays', JSON.stringify(value));
    }
  },
  workHoursStart: {
    type: DataTypes.STRING, // Store as "09:00"
    allowNull: true
  },
  workHoursEnd: {
    type: DataTypes.STRING, // Store as "17:00"
    allowNull: true
  }
}, {
  tableName: 'staffs',
  timestamps: true
});

// Just export the model - associations are handled in associations.js
module.exports = Staff;
