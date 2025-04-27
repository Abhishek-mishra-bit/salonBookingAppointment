const Service = require("../models/serviceModel");
const rootDir = require("../utils/path");
const path = require("path");

exports.getServicesPage = async(req, res)=>{
    res.sendFile(path.join(rootDir,"views","services.html"));
};

// Add Service
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    const service = await Service.create({ name, description, price, duration });
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating service" });
  }
};

// Get All Services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching services" });
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
