const cron = require("node-cron");
const Property = require("../models/Property");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Requirement = require("../models/Requirement");
const SharedLead = require("../models/SharedLead");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const fs = require("fs");
const path = require("path");

const initCronJobs = (io) => {
  // Schedule task to run every minute for automated lead sharing
  cron.schedule("*/5 * * * * *", async () => {
    // console.log("🕒 Checking lead sharing timers...");
    try {
      const requirementsInProgress = await Requirement.find({ 
        sharingStatus: "in-progress" 
      });

      if (requirementsInProgress.length === 0) return;

      const { internalShareLeadWithPlanName } = require("../controllers/requirementController");

      for (const req of requirementsInProgress) {
        // 1. Check if lead has been accepted
        const acceptedLead = await SharedLead.findOne({ 
          requirement: req._id, 
          status: "accepted" 
        });

        if (acceptedLead) {
          req.sharingStatus = "completed";
          await req.save();
          console.log(`✅ Lead sharing completed for requirement ${req._id} (Accepted)`);
          continue;
        }

        // 2. Check if timer has expired
        const now = new Date();
        const startTime = new Date(req.sharingConfig.startTime);
        const timerInMinutes = req.sharingConfig.timer;
        const diffInMinutes = (now - startTime) / (1000 * 60);

        if (diffInMinutes >= timerInMinutes) {
          const plans = req.sharingConfig.plans || [];
          const currentPlanName = plans[req.sharingConfig.currentPlanIndex];
          console.log(`⏭ Timer expired for ${currentPlanName}. Marking as "Deal Closed (Plan Level)" and moving to next...`);
          
          // Mark the current plan's share as "Deal Closed (Plan Level)"
          const matchingPlans = await SubscriptionPlan.find({ name: currentPlanName });
          const planIds = matchingPlans.map(p => p._id);
          
          await SharedLead.updateMany(
            { requirement: req._id, plan: { $in: planIds }, status: "pending" },
            { status: "Deal Closed (Plan Level)" }
          );

          let nextIndex = req.sharingConfig.currentPlanIndex + 1;
          let success = false;

          while (nextIndex < plans.length && !success) {
            const nextPlan = plans[nextIndex];
            console.log(`⏭ Attempting to move to next plan: ${nextPlan} for requirement ${req._id}`);
            
            const result = await internalShareLeadWithPlanName(req._id, nextPlan, io, 3);
            
            if (result.status === "success") {
              success = true;
              req.sharingConfig.currentPlanIndex = nextIndex;
              req.sharingConfig.startTime = now;
              req.markModified("sharingConfig");
              await req.save();
              console.log(`✅ Successfully moved to ${nextPlan} (Requirement: ${req._id})`);
              if (io) {
                io.emit("admin-lead-updated", { requirementId: req._id });
                io.emit("lead-expired-for-plan", { requirementId: req._id });
              }
            } else {
              console.log(`⚠️ No sellers in ${nextPlan}, skipping to next...`);
              nextIndex++;
            }
          }

          if (!success) {
            // No more plans with agents left
            req.sharingStatus = "expired";
            req.status = "Closed";
            req.markModified("sharingStatus");
            await req.save();

            // Move all pending shared leads for this requirement to "closed"
            // This moves them from "New Leads" to "History/Closed" for the sellers
            await SharedLead.updateMany(
              { requirement: req._id, status: "pending" },
              { status: "Deal Closed (Plan Level)" }
            );

            // Notify sellers via socket to refresh their lists
            if (io) {
              io.emit("admin-lead-updated", { requirementId: req._id });
              io.emit("lead-expired-for-plan", { requirementId: req._id });
            }

            console.log(`❌ All plans exhausted for requirement ${req._id}. Marked as unclaimed and closed for sellers.`);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in lead sharing cron job:", error);
    }
  });

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
  
  // Schedule task to run every 30 minutes for subscription expiry
  cron.schedule("*/30 * * * *", async () => {
    console.log("🕒 Running periodic check for expired subscriptions...");
    try {
      const now = new Date();
      // 1. Find all active subscriptions that have passed their end date
      const expiredSubscriptions = await Subscription.find({
        status: "active",
        endDate: { $lt: now }
      }).populate({
        path: "user",
        populate: { path: "builderProfile" }
      }).populate("plan");

      if (expiredSubscriptions.length === 0) {
        // console.log("✅ No expired subscriptions found.");
        return;
      }

      console.log(`Found ${expiredSubscriptions.length} expired subscriptions. Processing...`);

      for (const sub of expiredSubscriptions) {
        // 2. Mark subscription as expired
        sub.status = "expired";
        await sub.save();

        // 3. Update user: set activeSubscription to null (fall back to default)
        await User.findByIdAndUpdate(sub.user, {
          activeSubscription: null
        });

        // 4. Send Email Notification
        const { sendSubscriptionExpiredNotification } = require("./emailService");
        if (sub.user) {
          await sendSubscriptionExpiredNotification(sub.user, sub);
        }
        
        console.log(`User ${sub.user._id} subscription expired and moved to default plan.`);
      }

      console.log(`✅ Successfully processed ${expiredSubscriptions.length} expired subscriptions.`);
    } catch (error) {
      console.error("❌ Error in subscription expiry cron job:", error);
    }
  });

  // Schedule task to run every hour for subscription expiry warning (7 days)
  cron.schedule("0 * * * *", async () => {
    console.log("🕒 Running periodic check for subscriptions expiring in 7 days...");
    try {
      const sevenDaysFromNowStart = new Date();
      sevenDaysFromNowStart.setDate(sevenDaysFromNowStart.getDate() + 7);
      sevenDaysFromNowStart.setHours(0, 0, 0, 0);

      const sevenDaysFromNowEnd = new Date();
      sevenDaysFromNowEnd.setDate(sevenDaysFromNowEnd.getDate() + 7);
      sevenDaysFromNowEnd.setHours(23, 59, 59, 999);

      // 1. Find all active subscriptions that expire in 7 days
      const expiringSubscriptions = await Subscription.find({
        status: "active",
        endDate: { $gte: sevenDaysFromNowStart, $lte: sevenDaysFromNowEnd }
      }).populate({
        path: "user",
        populate: { path: "builderProfile" }
      }).populate("plan");

      if (expiringSubscriptions.length === 0) {
        // console.log("✅ No subscriptions expiring in 7 days.");
        return;
      }

      console.log(`Found ${expiringSubscriptions.length} subscriptions expiring in 7 days. Sending warnings...`);

      const { sendSubscriptionExpiryWarning } = require("./emailService");

      for (const sub of expiringSubscriptions) {
        if (sub.user) {
          await sendSubscriptionExpiryWarning(sub.user, sub, 7);
        }
      }

      console.log(`✅ Successfully sent ${expiringSubscriptions.length} subscription expiry warnings.`);
    } catch (error) {
      console.error("❌ Error in subscription expiry warning cron job:", error);
    }
  });

  // Schedule task to run every hour for subscription expiry warning (1 day)
  cron.schedule("15 * * * *", async () => {
    console.log("🕒 Running periodic check for subscriptions expiring in 1 day...");
    try {
      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date();
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // 1. Find all active subscriptions that expire tomorrow
      const expiringSubscriptions = await Subscription.find({
        status: "active",
        endDate: { $gte: tomorrowStart, $lte: tomorrowEnd }
      }).populate({
        path: "user",
        populate: { path: "builderProfile" }
      }).populate("plan");

      if (expiringSubscriptions.length === 0) {
        // console.log("✅ No subscriptions expiring tomorrow.");
        return;
      }

      console.log(`Found ${expiringSubscriptions.length} subscriptions expiring tomorrow. Sending final warnings...`);

      const { sendSubscriptionExpiryWarning } = require("./emailService");

      for (const sub of expiringSubscriptions) {
        if (sub.user) {
          await sendSubscriptionExpiryWarning(sub.user, sub, 1);
        }
      }

      console.log(`✅ Successfully sent ${expiringSubscriptions.length} final subscription expiry warnings.`);
    } catch (error) {
      console.error("❌ Error in subscription expiry warning (1 day) cron job:", error);
    }
  });


  console.log(
    "🚀 Property & Subscription cron jobs initialized.",
  );
};
module.exports = { initCronJobs };
