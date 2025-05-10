const Service = require("../models/serviceModel");
const rootDir = require("../utils/path");
const path = require("path");
const { Op } = require('sequelize');
const Booking = require("../models/bookingModel") 

exports.getServicesPage = async(req, res)=>{
    res.sendFile(path.join(rootDir,"views","services.html"));
};

// Add Service
exports.createService = async (req, res) => {
  try {
    console.log('Service creation request received:', req.body);
    const { name, description, price, duration } = req.body;
    
    // Validate input
    if (!name || !price || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const service = await Service.create({ name, description, price, duration });
    console.log('Service created successfully:', service);
    res.status(201).json(service);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ message: "Error creating service", error: err.message });
  }
};

// Get All Services
// Get all services (admin: all, customer: active only)
exports.getServices = async (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      // Admin: show all services
      const services = await Service.findAll();
      return res.json(services);
    }
    // Customer: show only active services (add status if your model supports it)
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching services" });
  }
};

// Get Paid Services
exports.getPaidServices = async (req, res) => {
  try {    
    const bookings = await Booking.findAll({
      where: {
        userId: req.user.id,
        paymentStatus: 'paid'
      },
      include: [{
        model: Service,
        attributes: ['id', 'name', 'price']
      }]
    });

    const paidServices = bookings.map(booking => booking.Service);
    res.json(paidServices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching paid services" });
  }
};

// Update Service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    await service.update({ name, description, price, duration });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating service" });
  }
};

// Delete Service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    await service.destroy();
    res.json({ message: "Service deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting service" });
  }
};
