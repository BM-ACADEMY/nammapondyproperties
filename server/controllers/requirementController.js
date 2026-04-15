const Requirement = require("../models/Requirement");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const SharedLead = require("../models/SharedLead");

// Create a new requirement
exports.createRequirement = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      category,
      usageType,
      propertyType,
      preferredLocation,
      minBudget,
      maxBudget,
      propertyPreferences,
      message,
    } = req.body;

    // Optional: attach user ID if authenticated
    const userId = req.user ? req.user.id : null;

    const newRequirement = new Requirement({
      fullName,
      phoneNumber,
      email,
      category,
      usageType,
      propertyType,
      preferredLocation,
      minBudget,
      maxBudget,
      propertyPreferences,
      message,
      user: userId,
    });

    const savedRequirement = await newRequirement.save();

    res.status(201).json({
      success: true,
      data: savedRequirement,
      message: "Requirement submitted successfully!",
    });
  } catch (error) {
    console.error("Error creating requirement:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not submit requirement.",
    });
  }
};

// Get all requirements (Admin only)
exports.getRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    // Enhance requirements with sharing info (who accepted it)
    const enhancedRequirements = await Promise.all(
      requirements.map(async (reqDoc) => {
        const sharedInfo = await SharedLead.findOne({ 
          requirement: reqDoc._id, 
          status: "accepted" 
        }).populate("acceptedBy", "name email phone");

        return {
          ...reqDoc.toObject(),
          acceptedBy: sharedInfo ? sharedInfo.acceptedBy : null,
          isShared: !!(await SharedLead.exists({ requirement: reqDoc._id })),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enhancedRequirements,
    });
  } catch (error) {
    console.error("Error fetching requirements:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch requirements.",
    });
  }
};

// Update requirement status (Admin only)
exports.updateRequirementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Contacted", "Closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const requirement = await Requirement.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: requirement,
      message: `Status updated to ${status}.`,
    });
  } catch (error) {
    console.error("Error updating requirement status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not update status.",
    });
  }
};

// Delete requirement (Admin only)
exports.deleteRequirement = async (req, res) => {
  try {
    const { id } = req.params;

    const requirement = await Requirement.findByIdAndDelete(id);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Requirement deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting requirement:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not delete requirement.",
    });
  }
};

// Get subscription stats for lead sharing (Admin)
exports.getSubscriptionStats = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ status: "active" });
    
    const stats = await Promise.all(
      plans.map(async (plan) => {
        // Find active subscriptions for this plan
        const activeSubscriptions = await Subscription.find({
          plan: plan._id,
          status: "active",
          endDate: { $gt: new Date() },
        }).populate("user", "name email phone");

        const sellers = activeSubscriptions
          .filter(sub => sub.user)
          .map(sub => ({
            id: sub.user._id,
            name: sub.user.name || "Unnamed Seller",
            email: sub.user.email,
            phone: sub.user.phone,
          }));

        return {
          planId: plan._id,
          planName: plan.name,
          sellerCount: sellers.length,
          sellers: sellers,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch subscription stats.",
    });
  }
};

// Share requirement with a subscription plan (Admin)
exports.shareRequirement = async (req, res) => {
  try {
    const { id } = req.params; // Requirement ID
    const { planId } = req.body;

    const requirement = await Requirement.findById(id);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found.",
      });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found.",
      });
    }

    // Check if the lead is already accepted by anyone in any plan
    const alreadyAccepted = await SharedLead.findOne({ 
      requirement: id, 
      status: "accepted" 
    });
    
    if (alreadyAccepted) {
      return res.status(400).json({
        success: false,
        message: "This deal is already closed/accepted by a seller and cannot be reshared.",
      });
    }

    // Find active sellers for this plan to record who it was shared with
    const activeSubscriptions = await Subscription.find({
      plan: planId,
      status: "active",
      endDate: { $gt: new Date() },
    });
    
    const sellerIds = activeSubscriptions.map(sub => sub.user);

    // Create or update SharedLead
    // If already shared with this plan, we might want to update or error. 
    // Request says "The lead is shared with all sellers under that selected plan only."
    let sharedLead = await SharedLead.findOne({ requirement: id, plan: planId });
    
    if (sharedLead) {
      return res.status(400).json({
        success: false,
        message: "This lead has already been shared with this plan.",
      });
    }

    sharedLead = new SharedLead({
      requirement: id,
      plan: planId,
      sharedWith: sellerIds,
      status: "pending",
    });

    await sharedLead.save();

    // Emit Socket.io event to all sellers in this plan
    const io = req.app.get("socketio");
    if (io) {
      // We can emit to a room specific to the plan, or individual sellers
      // The user index.js mentions join-seller-room (seller-ID)
      // Since we want all sellers in the plan to see it, we can either emit to all or specific rooms
      sellerIds.forEach(sellerId => {
        io.to(`seller-${sellerId}`).emit("new-lead-shared", {
          leadId: sharedLead._id,
          requirement: {
            category: requirement.category,
            usageType: requirement.usageType,
            propertyType: requirement.propertyType,
            preferredLocation: requirement.preferredLocation,
            propertyPreferences: requirement.propertyPreferences,
            message: requirement.message,
          },
        });
      });
    }

    res.status(200).json({
      success: true,
      message: `Lead shared successfully with ${plan.name} plan users.`,
    });
  } catch (error) {
    console.error("Error sharing requirement:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not share requirement.",
    });
  }
};
