const SharedLead = require("../models/SharedLead");
const Subscription = require("../models/Subscription");
const Requirement = require("../models/Requirement");
const User = require("../models/User");
const SubscriptionPlan = require("../models/SubscriptionPlan");

// Get leads shared with the seller's current plan
exports.getSharedLeads = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get seller's active subscription to identify their plan
    const activeSubscription = await Subscription.findOne({
      user: userId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!activeSubscription) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No active subscription found. Subscribe to see leads.",
      });
    }

    // Identify all plan variants with the same name as the seller's plan
    const sellerPlan = await SubscriptionPlan.findById(activeSubscription.plan);
    const allMatchingPlans = await SubscriptionPlan.find({ 
      name: sellerPlan.name,
      status: "active" 
    });
    const planIds = allMatchingPlans.map(p => p._id);

    // 2. Find leads shared with any of these plan variants
    const sharedLeads = await SharedLead.find({
      plan: { $in: planIds },
    })
      .populate({
        path: "requirement",
        select: "fullName phoneNumber email category usageType propertyType preferredLocation minBudget maxBudget propertyPreferences message createdAt" ,
      })
      .populate("acceptedBy", "name")
      .sort({ createdAt: -1 });

    // 3. Fetch current user with business type for visibility logic
    const currentUser = await User.findById(userId).populate("businessType");
    const sellerBusinessType = currentUser.businessType?.name || "";
    const isBuilder = /Builder|Promoter/i.test(sellerBusinessType);
    const isAgent = /Agent/i.test(sellerBusinessType);

    // Filter and Transform data
    const filteredLeads = sharedLeads.filter(lead => {
      // 1. If it's already accepted by someone else or closed, don't show it at all
      if (lead.status !== "pending" && (!lead.acceptedBy || lead.acceptedBy._id.toString() !== userId.toString())) {
        return false;
      }

      // 2. Strict Role Matching Logic:
      // Priority 1: Builders Only
      if (lead.matchPriority === 1 && !isBuilder) return false;
      // Priority 2 & 3: Agents Only
      if ((lead.matchPriority === 2 || lead.matchPriority === 3) && !isAgent) return false;

      return true;
    });

    const fullLeads = await Promise.all(filteredLeads.map(async (lead) => {
      const isAcceptedByMe = lead.acceptedBy && lead.acceptedBy._id.toString() === userId.toString();
      
      // Visibility Logic:
      // 1. If accepted by me -> Always show details
      // 2. If it is an EXACT MATCH -> Show details
      let showFullDetails = isAcceptedByMe || lead.matchType === "exact";
      
      let reqDetails = { ...lead.requirement._doc };
      
      if (!showFullDetails) {
        // Mask sensitive fields
        reqDetails.fullName = "Contact Masked";
        reqDetails.email = "masked@example.com";
        reqDetails.phoneNumber = "XXXXXXXXXX";
        // Also remove from the object to be safe if client logic depends on presence
      }

      return {
        _id: lead._id,
        requirement: reqDetails,
        status: lead.status,
        acceptedBy: lead.acceptedBy ? lead.acceptedBy.name : null,
        isAcceptedByMe,
        matchType: lead.matchType,
        matchPriority: lead.matchPriority,
        showFullDetails,
        createdAt: lead.createdAt
      };
    }));

    res.status(200).json({
      success: true,
      data: fullLeads,
    });
  } catch (error) {
    console.error("Error fetching shared leads:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch leads.",
    });
  }
};

// Accept a shared lead
exports.acceptLead = async (req, res) => {
  try {
    const { id } = req.params; // SharedLead ID
    const userId = req.user.id;

    // 1. Verify seller has the right plan for this lead
    const lead = await SharedLead.findById(id).populate("plan");
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    const activeSubscription = await Subscription.findOne({
      user: userId,
      plan: lead.plan._id,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!activeSubscription) {
      return res.status(403).json({
        success: false,
        message: "You do not have an active subscription for this plan.",
      });
    }

    // 1.5 Verify Business Type matches lead priority
    const user = await User.findById(userId).populate("businessType");
    const businessType = user.businessType?.name || "";
    const isBuilder = /Builder|Promoter/i.test(businessType);
    const isAgent = /Agent/i.test(businessType);

    if (lead.matchPriority === 1 && !isBuilder) {
      return res.status(403).json({ success: false, message: "This lead is exclusively for Builders." });
    }
    if ((lead.matchPriority === 2 || lead.matchPriority === 3) && !isAgent) {
      return res.status(403).json({ success: false, message: "This lead is reserved for Agents." });
    }

    // 2. Atomically accept the lead
    const updatedLead = await SharedLead.findOneAndUpdate(
      { _id: id, status: "pending" },
      { 
        status: "accepted", 
        acceptedBy: userId 
      },
      { new: true }
    ).populate("requirement");

    if (!updatedLead) {
      // If no lead found with status pending, it means someone else already accepted it
      const alreadyAcceptedLead = await SharedLead.findById(id).populate("acceptedBy", "name");
      return res.status(400).json({
        success: false,
        message: "Deal Closed: This lead has already been accepted by another seller.",
        acceptedBy: alreadyAcceptedLead.acceptedBy ? alreadyAcceptedLead.acceptedBy.name : "another seller"
      });
    }

    // 3. Update the parent Requirement status to "Closed"
    await Requirement.findByIdAndUpdate(updatedLead.requirement._id, { status: "Closed" });

    // 4. Close all other platforms' shared leads for this same requirement
    // This ensures that if the lead was shared with multiple plans, it's closed for everyone
    await SharedLead.updateMany(
      { 
        requirement: updatedLead.requirement._id, 
        _id: { $ne: id },
        status: "pending"
      },
      { 
        status: "closed",
        acceptedBy: userId
      }
    );

    // 4. Emit Socket.io events to notify everyone who saw this lead
    const io = req.app.get("socketio");
    if (io) {
      // Find all SharedLead records for this requirement to get all seller IDs
      const allSharedLeads = await SharedLead.find({ 
        requirement: updatedLead.requirement._id 
      }).select("sharedWith");
      
      const allSellersToNotify = new Set();
      allSharedLeads.forEach(sl => {
        sl.sharedWith.forEach(sid => allSellersToNotify.add(sid.toString()));
      });

      // Notify everyone except the current user
      allSellersToNotify.forEach(sellerId => {
        if (sellerId !== userId.toString()) {
          io.to(`seller-${sellerId}`).emit("lead-accepted-by-other", {
            requirementId: updatedLead.requirement._id,
            leadId: id, // Original accepted lead ID
            status: "closed",
            acceptedBy: req.user.name || "Another Seller"
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      data: updatedLead,
      message: "Lead accepted successfully! You can now view the contact details.",
    });
  } catch (error) {
    console.error("Error accepting lead:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not accept lead.",
    });
  }
};
