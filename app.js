const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./src/utils/db");

const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes")
const serviceRoutes = require("./src/routes/serviceRoutes");
const staffRoutes = require("./src/routes/staffRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes")


// Built-in Express middleware for parsing JSON
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, "src", "public")));

app.use("/api", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/staff", staffRoutes);
app.use('/api/booking', bookingRoutes);




sequelize
  .sync({ force: false })
  .then((res) => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => console.log("Error connection to database:" + err));
