const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
