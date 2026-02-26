const mongoose = require("mongoose");
const Property = require("./models/Property");
require("dotenv").config();

const verifyAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await Property.updateMany(
      {},
      { $set: { is_verified: true } },
    );
    console.log(
      `Updated ${result.modifiedCount} properties to verified status.`,
    );
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

verifyAll();
