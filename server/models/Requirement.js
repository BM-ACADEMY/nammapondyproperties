const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Rent", "Sell/Buy"],
      required: true,
    },
    usageType: {
      type: String,
      enum: ["Residential", "Commercial"],
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    preferredLocation: {
      type: String,
      trim: true,
    },
    minBudget: {
      type: Number,
    },
    maxBudget: {
      type: Number,
    },
    propertyPreferences: {
      type: String,
      trim: true,
    },
    heardFrom: {
      type: String,
      enum: ["Social Media", "Reference", "Google"],
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Closed"],
      default: "Pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referralSource: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Requirement", requirementSchema);
