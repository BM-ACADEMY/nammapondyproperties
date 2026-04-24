const mongoose = require("mongoose");

const otherServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // Can store Lucide icon name or image URL
      default: "Layers",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    link: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtherService", otherServiceSchema);
