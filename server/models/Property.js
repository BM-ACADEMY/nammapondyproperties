// models/Property.js
const mongoose = require("mongoose");
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
    location: {
      address_line_1: { type: String },
      address_line_2: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      pincode: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    area_size: { type: String },
    property_type: { type: String, required: true }, // Dynamic now
    status: { type: String, default: "available" },
    is_verified: { type: Boolean, default: false },
    images: [{ image_url: { type: String } }], // Embedded array for images
    view_count: { type: Number, default: 0 },
    approval: { type: String }, // Dynamic now
    key_attributes: [{ key: String, value: String }], // Array of key-value pairs
    advertiseOnSocialMedia: { type: Boolean, default: false }, // Advertisement opt-in
    isSold: { type: Boolean, default: false },
    soldPrice: { type: Number }, // Optional sold price
  },
  { timestamps: true },
);

const Property = mongoose.model("Property", propertySchema);
// Property.PROPERTY_TYPES = PROPERTY_TYPES; // Deprecated
// Property.APPROVAL_TYPES = APPROVAL_TYPES; // Deprecated

module.exports = Property;
