const mongoose = require("mongoose");

const propertyTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    status: { type: String, default: "active", index: true }, // active, inactive
    visible_to_seller: { type: Boolean, default: true, index: true },
    image_url: { type: String }, // URL for property type image
    key_attributes: [{ type: String }], // Array of attribute names (e.g., "Bedrooms")
  },
  { timestamps: true },
);

module.exports = mongoose.model("PropertyType", propertyTypeSchema);
