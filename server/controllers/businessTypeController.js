// controllers/businessTypeController.js
const BusinessType = require("../models/BusinessType");

exports.createBusinessType = async (req, res) => {
  try {
    const { name, status } = req.body;
    const businessType = new BusinessType({ name, status });
    await businessType.save();
    res.status(201).json(businessType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBusinessTypes = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const businessTypes = await BusinessType.find(query);
    res.json(businessTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBusinessTypeById = async (req, res) => {
  try {
    const businessType = await BusinessType.findById(req.params.id);
    if (!businessType)
      return res.status(404).json({ error: "Business Type not found" });
    res.json(businessType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBusinessType = async (req, res) => {
  try {
    const businessType = await BusinessType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!businessType)
      return res.status(404).json({ error: "Business Type not found" });
    res.json(businessType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBusinessType = async (req, res) => {
  try {
    const businessType = await BusinessType.findByIdAndDelete(req.params.id);
    if (!businessType)
      return res.status(404).json({ error: "Business Type not found" });
    res.json({ message: "Business Type deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
