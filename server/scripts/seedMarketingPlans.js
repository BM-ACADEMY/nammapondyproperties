const mongoose = require("mongoose");
require("dotenv").config();
const MarketingPlan = require("../models/MarketingPlan");

const plans = [
    {
        name: "Basic",
        price: "₹4,999",
        description: "Launch your property with basic social media and portal exposure.",
        features: [
            "Social media story post",
            "Standard listing placement",
            "Lead notification via WhatsApp",
            "7-day promotion duration"
        ],
        status: "active"
    },
    {
        name: "Growth",
        price: "₹9,999",
        description: "Expand your reach with premium placement and targeted ads.",
        features: [
            "Featured listing for 15 days",
            "Targeted Meta (Facebook/Instagram) ads",
            "Priority lead support",
            "Weekly analytics report"
        ],
        status: "active"
    },
    {
        name: "Builder",
        price: "Custom Pricing",
        description: "Customized digital marketing strategy for luxury or bulk properties.",
        features: [
            "Professional property video tour",
            "Google Search & Display ads",
            "Dedicated account manager",
            "Influencer collaboration options"
        ],
        status: "active"
    }
];

const seedPlans = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/realestate";
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB...");

        for (const plan of plans) {
            await MarketingPlan.findOneAndUpdate(
                { name: plan.name },
                plan,
                { upsert: true, new: true }
            );
            console.log(`Plan ${plan.name} seeded.`);
        }

        console.log("All plans seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding plans:", error);
        process.exit(1);
    }
};

seedPlans();
