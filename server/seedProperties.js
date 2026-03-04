const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Property = require("./models/Property");

const SELLER_ID = "69a01ed827a1b128755e7bf9";
const COMMON_CITY = "Pondicherry";
const COMMON_STATE = "Puducherry";
const COMMON_LOCALITY = "White Town";

const propertyTypes = [
    "Flat / Apartment",
    "Independent House / Villa",
    "Plot / Land",
    "Builder Floor",
    "1 RK / Studio Apartment"
];

const cities = ["Chennai", "Bangalore", "Hyderabad", "Coimbatore", "Madurai", "Trichy", "Salem"];
const categories = ["Sell", "Rent"];
const usageTypes = ["Residential", "Commercial"];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const properties = [];

        // Create 3 properties in the same location
        for (let i = 1; i <= 3; i++) {
            properties.push({
                seller: SELLER_ID,
                basicInfo: {
                    title: `Common Location Property ${i}`,
                    description: `Excellent property in the heart of ${COMMON_CITY}`,
                    category: categories[i % 2],
                    usageType: "Residential",
                    propertyType: propertyTypes[i % propertyTypes.length],
                },
                location: {
                    addressLine1: `Street ${i}`,
                    city: COMMON_CITY,
                    state: COMMON_STATE,
                    locality: COMMON_LOCALITY,
                    country: "India",
                    pincode: "605001"
                },
                pricing: {
                    sell: { price: 5000000 + (i * 100000) },
                    rent: { monthlyRent: 15000 + (i * 1000) }
                },
                specifications: {
                    facing: "East",
                    area: { totalArea: 1200 },
                    residential: { bedrooms: 2, bathrooms: 2 }
                },
                status: "Active"
            });
        }

        // Create 7 properties in different locations
        for (let i = 4; i <= 10; i++) {
            properties.push({
                seller: SELLER_ID,
                basicInfo: {
                    title: `Different Location Property ${i}`,
                    description: `Prime property in ${cities[i - 4]}`,
                    category: categories[i % 2],
                    usageType: "Residential",
                    propertyType: propertyTypes[i % propertyTypes.length],
                },
                location: {
                    addressLine1: `Avenue ${i}`,
                    city: cities[i - 4],
                    state: i % 2 === 0 ? "Tamil Nadu" : "Karnataka",
                    locality: "Main Road",
                    country: "India",
                    pincode: "600001"
                },
                pricing: {
                    sell: { price: 4000000 + (i * 200000) },
                    rent: { monthlyRent: 12000 + (i * 1500) }
                },
                specifications: {
                    facing: "North",
                    area: { totalArea: 1000 + (i * 50) },
                    residential: { bedrooms: 3, bathrooms: 3 }
                },
                status: "Active"
            });
        }

        await Property.insertMany(properties);
        console.log("Successfully seeded 10 properties");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
