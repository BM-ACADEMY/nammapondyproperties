const cron = require("node-cron");
const Property = require("../models/Property");
const fs = require("fs");
const path = require("path");

const initCronJobs = () => {
    // Schedule task to run every day at midnight (00:00)
    cron.schedule("0 0 * * *", async () => {
        console.log("🕒 Running daily cleanup for expired properties (1+ days)...");

        try {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            // 1. Find properties older than 1 day
            const expiredProperties = await Property.find({
                createdAt: { $lt: oneDayAgo }
            });

            if (expiredProperties.length === 0) {
                console.log("✅ No expired properties found.");
                return;
            }

            console.log(`Found ${expiredProperties.length} expired properties. Cleaning up...`);

            // 2. Cleanup associated image files from the filesystem
            for (const property of expiredProperties) {
                if (property.images && property.images.length > 0) {
                    for (const img of property.images) {
                        if (img.image_url) {
                            // Convert URL /uploads/properties/filename to actual path
                            const fileName = path.basename(img.image_url);
                            const filePath = path.join(__dirname, "../uploads/properties", fileName);

                            try {
                                if (fs.existsSync(filePath)) {
                                    fs.unlinkSync(filePath);
                                    // console.log(`Deleted image: ${fileName}`);
                                }
                            } catch (err) {
                                console.error(`Error deleting file ${filePath}:`, err);
                            }
                        }
                    }
                }
            }

            // 3. Delete property records from database
            const deleteResult = await Property.deleteMany({
                _id: { $in: expiredProperties.map(p => p._id) }
            });

            console.log(`✅ Successfully deleted ${deleteResult.deletedCount} properties and their files.`);
        } catch (error) {
            console.error("❌ Error in property cleanup cron job:", error);
        }
    });

    console.log("🚀 Property cleanup cron job initialized (Daily at midnight)");
};

module.exports = { initCronJobs };
