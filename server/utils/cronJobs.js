const cron = require("node-cron");
const Property = require("../models/Property");
const fs = require("fs");
const path = require("path");

const initCronJobs = (io) => {
  // Schedule task to run every day at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log(
      "🕒 Running daily cleanup for expired properties (21+ days)...",
    );

    try {
      const twentyOneDaysAgo = new Date();
      twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);

      // 1. Find properties older than 21 days
      const allExpiredProperties = await Property.find({
        createdAt: { $lt: twentyOneDaysAgo },
      }).populate({
        path: "seller_id",
        populate: { path: "role_id" },
      });

      // Filter out properties where seller is ADMIN
      const expiredProperties = allExpiredProperties.filter((property) => {
        const roleName = property.seller_id?.role_id?.role_name?.toUpperCase();
        return roleName !== "ADMIN";
      });

      if (expiredProperties.length === 0) {
        // console.log("✅ No expired properties found for cleanup.");
        return;
      }

      console.log(
        `Found ${expiredProperties.length} expired properties. Cleaning up...`,
      );

      // 2. Cleanup and Notify
      for (const property of expiredProperties) {
        // Notify seller via WebSocket before deletion
        if (io && property.seller_id) {
          io.to(`seller-${property.seller_id._id}`).emit("property-expired", {
            message: `Your property "${property.title}" has expired and has been removed.`,
            propertyId: property._id,
            title: property.title,
          });
        }

        // Cleanup associated image files from the filesystem
        if (property.images && property.images.length > 0) {
          for (const img of property.images) {
            if (img.image_url) {
              const fileName = path.basename(img.image_url);
              const filePath = path.join(
                __dirname,
                "../uploads/properties",
                fileName,
              );

              try {
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
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
        _id: { $in: expiredProperties.map((p) => p._id) },
      });

      console.log(
        `✅ Successfully deleted ${deleteResult.deletedCount} properties and their files.`,
      );
    } catch (error) {
      console.error("❌ Error in property cleanup cron job:", error);
    }
  });

  console.log(
    "🚀 Property cleanup cron job initialized (21-day validity, Daily at midnight)",
  );
};
module.exports = { initCronJobs };
