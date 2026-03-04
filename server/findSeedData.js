const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const PropertyType = require("./models/PropertyType");

async function findData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}).limit(5);
        const types = await PropertyType.find({}).limit(5);

        console.log("DATA_START");
        console.log(JSON.stringify({
            users: users.map(u => ({ id: u._id, role: u.role, name: u.name })),
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
