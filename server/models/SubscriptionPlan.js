const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true, 
      enum: ["Free", "Standard", "Premium"] 
    },
    price: { type: Number, required: true },
    propertyLimit: { 
      type: Number, 
      required: true, 
      default: 3 
    }, // -1 or high number for unlimited
    duration: { 
      type: Number, 
      required: false, // Optional for lifetime plans
      default: 30 
    }, // Duration in days
    features: [{ type: String }],
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
