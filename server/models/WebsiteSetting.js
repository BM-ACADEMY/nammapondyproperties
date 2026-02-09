// models/WebsiteSetting.js
const mongoose = require('mongoose');

const websiteSettingSchema = new mongoose.Schema({
  site_name: { type: String, required: true },
  contact_email: { type: String },
  contact_phone: { type: String },
  address: { type: String },
  footer_text: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);
