// models/activityModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const User = require('./userModel');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null for system activities
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING, // 'booking', 'user', 'payment', 'review', etc.
    allowNull: false
  },
  action: {
    type: DataTypes.STRING, // 'create', 'update', 'delete', etc.
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER, // ID of the related entity (booking, user, etc.)
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
  tableName: 'activities',
  timestamps: true
});

// Set up associations
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Activity;
