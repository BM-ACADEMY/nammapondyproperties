const mongoose = require("mongoose");
const Property = require("./models/Property");
require("dotenv").config();

const checkProperties = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const total = await Property.countDocuments();
    const verified = await Property.countDocuments({ is_verified: true });
    const unverified = await Property.countDocuments({
      is_verified: { $ne: true },
    });
    const available = await Property.countDocuments({ status: "available" });

    console.log("--- Property Stats ---");
    console.log(`Total Properties: ${total}`);
    console.log(`Verified Properties: ${verified}`);
    console.log(`Unverified Properties: ${unverified}`);
    console.log(`Available Properties: ${available}`);

    if (verified > 0) {
      const verifiedProperties = await Property.find({
        is_verified: true,
      }).limit(5);
      console.log("--- Sample Verified Properties ---");
      verifiedProperties.forEach((p) =>
        console.log(`- ${p.title} (Status: ${p.status})`),
      );
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
  }
};

checkProperties();
