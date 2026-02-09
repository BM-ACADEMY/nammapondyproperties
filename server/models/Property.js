// models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  area_size: { type: String },
  property_type: { type: String },
  status: { type: String, default: 'available' },
  is_verified: { type: Boolean, default: false },
  images: [{ image_url: { type: String } }] // Embedded array for images
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
