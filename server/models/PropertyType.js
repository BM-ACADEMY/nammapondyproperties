const mongoose = require("mongoose");

const propertyTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    status: { type: String, default: "active" }, // active, inactive
    visible_to_seller: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PropertyType", propertyTypeSchema);
