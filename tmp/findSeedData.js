const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../server/.env") });

const User = require("../server/models/User");
const PropertyType = require("../server/models/PropertyType");

async function findData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne({ role: "seller" });
        const types = await PropertyType.find({ status: "active" }).limit(5);

        console.log("DATA_START");
        console.log(JSON.stringify({
            sellerId: user ? user._id : null,
            propertyTypes: types.map(t => t.name)
        }, null, 2));
        console.log("DATA_END");

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findData();
