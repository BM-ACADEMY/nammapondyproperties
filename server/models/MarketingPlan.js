const mongoose = require("mongoose");

const marketingPlanSchema = new mongoose.Schema(
    {
        serviceName: { type: String, required: true },
        priceRange: { type: String, required: true },
        description: { type: String, required: true },
        isPopular: { type: Boolean, default: false },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MarketingPlan", marketingPlanSchema);
