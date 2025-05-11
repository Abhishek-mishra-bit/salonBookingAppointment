// Migration script to update the database schema
const sequelize = require('../utils/db');
const { DataTypes } = require('sequelize');

// Function to check if a column exists in a table
async function columnExists(tableName, columnName, transaction) {
  try {
    const [results] = await sequelize.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${columnName}'`,
      { transaction }
    );
    return results[0].count > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
}

async function runMigration() {
  const transaction = await sequelize.transaction();

  try {
    console.log('Starting database schema migration...');

    // 1. Add new fields to Staff table one by one, checking if they exist first
    console.log('Adding new columns to Staff table...');
    
    // Check and add isActive column
    if (!(await columnExists('staffs', 'isActive', transaction))) {
      await sequelize.query('ALTER TABLE staffs ADD COLUMN isActive BOOLEAN DEFAULT true', { transaction });
      console.log('Added isActive column to staffs table');
    }
    
    // Check and add workingDays column
    if (!(await columnExists('staffs', 'workingDays', transaction))) {
      await sequelize.query('ALTER TABLE staffs ADD COLUMN workingDays TEXT', { transaction });
      console.log('Added workingDays column to staffs table');
    }
    
    // Check and add workHoursStart column
    if (!(await columnExists('staffs', 'workHoursStart', transaction))) {
      await sequelize.query('ALTER TABLE staffs ADD COLUMN workHoursStart VARCHAR(10)', { transaction });
      console.log('Added workHoursStart column to staffs table');
    }
    
    // Check and add workHoursEnd column
    if (!(await columnExists('staffs', 'workHoursEnd', transaction))) {
      await sequelize.query('ALTER TABLE staffs ADD COLUMN workHoursEnd VARCHAR(10)', { transaction });
      console.log('Added workHoursEnd column to staffs table');
    }

    // 2. Create Activities table if it doesn't exist
    console.log('Creating Activities table...');
    const [activityTables] = await sequelize.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'activities'",
      { transaction }
    );

    if (activityTables[0].count === 0) {
      await sequelize.query(`
        CREATE TABLE activities (
          id INTEGER PRIMARY KEY AUTO_INCREMENT,
          userId INTEGER,
          type VARCHAR(50) NOT NULL,
          action VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          entityId INTEGER,
          entityType VARCHAR(50),
          metadata TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
        )
      `, { transaction });
      console.log('Activities table created');
    } else {
      console.log('Activities table already exists');
    }

    // 3. Create Notifications table if it doesn't exist
    console.log('Creating Notifications table...');
    const [notificationTables] = await sequelize.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'notifications'",
      { transaction }
    );

    if (notificationTables[0].count === 0) {
      await sequelize.query(`
        CREATE TABLE notifications (
          id INTEGER PRIMARY KEY AUTO_INCREMENT,
          userId INTEGER NOT NULL,
          type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          \`read\` BOOLEAN DEFAULT false,
          entityId INTEGER,
          entityType VARCHAR(50),
          metadata TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `, { transaction });
      console.log('Notifications table created');
    } else {
      console.log('Notifications table already exists');
    }

    // Commit transaction
    await transaction.commit();
    console.log('Database migration completed successfully!');
    return true;
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error('Migration failed:', error);
    return false;
  }
}

// Run this script directly
if (require.main === module) {
  runMigration()
    .then(success => {
      if (success) {
        console.log('✅ Schema update completed successfully!');
      } else {
        console.log('❌ Schema update failed.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error during migration:', err);
      process.exit(1);
    });
}

module.exports = runMigration;
