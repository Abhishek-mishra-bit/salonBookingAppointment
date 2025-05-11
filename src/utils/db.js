require("dotenv").config();
const { Sequelize } = require("sequelize");

// Support for various deployment platforms
let sequelize;

// Check if using deployment platform with DATABASE_URL
if (process.env.DATABASE_URL) {
  // For Render PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local development configuration (still using MySQL for local development)
  sequelize = new Sequelize(
    process.env.DB_NAME || process.env.DEFAULT_DATABASE_NAME || 'salon_booking',
    process.env.DB_USER || process.env.MYSQL_USER || 'root',
    process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    {
      dialect: "mysql",
      host: process.env.DB_HOST || "localhost",
    }
  );
}

sequelize
  .authenticate()
  .then((res) => console.log("Database connected successfully"))
  .catch((err) => console.log("Error connection to database:" + err));

module.exports = sequelize;
