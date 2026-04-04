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
        path: "seller",
        populate: { path: "role_id" },
      });

      // Filter out properties where seller is ADMIN
      const expiredProperties = allExpiredProperties.filter((property) => {
        const roleName = property.seller?.role_id?.role_name?.toUpperCase();
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
        const title = property.basicInfo?.title || "Untitled Property";

        // Notify seller via WebSocket before deletion
        if (io && property.seller) {
          io.to(`seller-${property.seller._id}`).emit("property-expired", {
            message: `Your property "${title}" has expired and has been removed.`,
            propertyId: property._id,
            title: title,
          });
        }

        // Cleanup associated image files from the filesystem
        const imagesToDelete = [];
        if (property.media?.featuredImage) imagesToDelete.push(property.media.featuredImage);
        if (property.media?.images && Array.isArray(property.media.images)) {
          imagesToDelete.push(...property.media.images);
        }
        if (property.media?.floorPlan) imagesToDelete.push(property.media.floorPlan);

        for (const imageUrl of imagesToDelete) {
          if (imageUrl) {
            const fileName = path.basename(imageUrl);
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
