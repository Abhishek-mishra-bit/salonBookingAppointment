// models/notificationModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const User = require('./userModel');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING, // 'appointment', 'review', 'payment', 'promotion', etc.
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  entityId: {
    type: DataTypes.INTEGER, // ID of the related entity (booking, review, etc.)
    allowNull: true
  },
  entityType: {
    type: DataTypes.STRING, // Model name of the related entity
    allowNull: true
  },
  metadata: {
    type: DataTypes.TEXT, // JSON string with additional data
    allowNull: true,
    get() {
      const value = this.getDataValue('metadata');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('metadata', JSON.stringify(value));
    }
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

// Set up associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Notification;
