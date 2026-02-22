const mongoose = require("mongoose");

const marketingPlanSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        price: { type: String, required: true }, // e.g. "₹4,999" or "Custom"
        description: { type: String, required: true },
        features: [{ type: String }],
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MarketingPlan", marketingPlanSchema);
