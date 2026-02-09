// controllers/whatsappLeadController.js
const WhatsappLead = require('../models/WhatsappLead');

exports.createWhatsappLead = async (req, res) => {
  try {
    const whatsappLead = new WhatsappLead(req.body);
    await whatsappLead.save();
    res.status(201).json(whatsappLead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getWhatsappLeads = async (req, res) => {
  try {
    const whatsappLeads = await WhatsappLead.find().populate('property_id user_id seller_id');
    res.json(whatsappLeads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWhatsappLeadById = async (req, res) => {
  try {
    const whatsappLead = await WhatsappLead.findById(req.params.id).populate('property_id user_id seller_id');
    if (!whatsappLead) return res.status(404).json({ error: 'WhatsappLead not found' });
    res.json(whatsappLead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateWhatsappLead = async (req, res) => {
  try {
    const whatsappLead = await WhatsappLead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!whatsappLead) return res.status(404).json({ error: 'WhatsappLead not found' });
    res.json(whatsappLead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteWhatsappLead = async (req, res) => {
  try {
    const whatsappLead = await WhatsappLead.findByIdAndDelete(req.params.id);
    if (!whatsappLead) return res.status(404).json({ error: 'WhatsappLead not found' });
    res.json({ message: 'WhatsappLead deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

