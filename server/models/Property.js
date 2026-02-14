// models/Property.js
const mongoose = require("mongoose");

const PROPERTY_TYPES = ["Plot", "Villa", "Apartment", "Commercial"];
const APPROVAL_TYPES = ["DTCP", "RERA", "PPA", "CMDA",];

const propertySchema = new mongoose.Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    area_size: { type: String },
    property_type: { type: String, enum: PROPERTY_TYPES, required: true },
    status: { type: String, default: "available" },
    is_verified: { type: Boolean, default: false },
    images: [{ image_url: { type: String } }], // Embedded array for images
    view_count: { type: Number, default: 0 },
    approval: { type: String, enum: APPROVAL_TYPES }, // e.g., 'DTCP', 'RERA', 'None'
  },
  { timestamps: true },
);

const Property = mongoose.model("Property", propertySchema);
Property.PROPERTY_TYPES = PROPERTY_TYPES;
Property.APPROVAL_TYPES = APPROVAL_TYPES;

module.exports = Property;
