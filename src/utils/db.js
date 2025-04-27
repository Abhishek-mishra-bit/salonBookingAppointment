require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DEFAULT_DATABASE_NAME,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
  }
);

sequelize
  .authenticate()
  .then((res) => console.log("Database connected successfully"))
  .catch((err) => console.log("Error connection to database:" + err));

module.exports = sequelize;
