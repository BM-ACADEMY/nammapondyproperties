const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const Property = require("./models/Property");

const verifyFix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Check what property types actually exist in the DB
    const distinctTypes = await Property.distinct("property_type");
    console.log("Distinct Property Types in DB:", distinctTypes);

    if (distinctTypes.length === 0) {
      console.log("No properties found in DB to test with.");
      process.exit(0);
    }

    // 2. Test the API logic by simulating a query
    // We can't easily test the API endpoint via HTTP without running the server,
    // but we can test the query logic with Mongoose directly, which is what the controller does.

    const testType = distinctTypes[0];
    console.log(`\nTesting query for type: "${testType}"`);

    const query = { property_type: testType };
    const count = await Property.countDocuments(query);
    console.log(`Found ${count} properties with type "${testType}"`);

    const allCount = await Property.countDocuments({});
    console.log(`Total properties in DB: ${allCount}`);

    if (count > 0 && count < allCount) {
      console.log("SUCCESS: Filter is working (subset returned).");
    } else if (count === allCount) {
      console.log(
        "WARNING: Filter returned ALL properties. This might be correct if all properties are of this type, but verify manually.",
      );
    } else {
      console.log("ERROR: Filter returned 0 results, but we know types exist.");
    }
  } catch (error) {
    console.error("Verification Error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

verifyFix();
