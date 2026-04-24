const OtherService = require("../models/OtherService");

// @desc    Create a new other service
// @route   POST /api/other-services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { title, description, icon, status, link } = req.body;
    const service = await OtherService.create({
      title,
      description,
      icon,
      status,
      link,
    });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all other services
// @route   GET /api/other-services
// @access  Private/Admin
const getAllServices = async (req, res) => {
  try {
    const services = await OtherService.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update an other service
// @route   PUT /api/other-services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  try {
    const service = await OtherService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete an other service
// @route   DELETE /api/other-services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  try {
    const service = await OtherService.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createService,
  getAllServices,
  updateService,
  deleteService,
};
