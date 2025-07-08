const cron = require("node-cron");
const { sendEmail } = require("../utils/mailer");
const Service = require("../models/serviceModel");
const Staff = require("../models/staffModel");
const Booking = require('../models/bookingModel');
const { Op } = require("sequelize");
const User = require("../models/userModel");


// Every day at 8AM
cron.schedule("0 8 * * *", async () => {
  console.log("Sending appointment reminders...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const bookings = await Booking.findAll({
      where: {
        date: tomorrow.toISOString().slice(0, 10),
        status: "confirmed",
      },
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Service, attributes: ["name"] },
      ],
    });

    for (const booking of bookings) {
      const emailHtml = `
        <h3>Hi ${booking.User.name},</h3>
        <p>This is a reminder for your upcoming appointment:</p>
        <ul>
          <li><strong>Service:</strong> ${booking.Service.name}</li>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
        </ul>
        <p>Thank you for choosing our salon! ✂️</p>
      `;

      await sendEmail({
        to: booking.User.email,
        subject: "Appointment Reminder - Salon Booking",
        html: emailHtml,
      });
    }
  } catch (err) {
    console.error("❌ Error sending reminders:", err);
  }
});
