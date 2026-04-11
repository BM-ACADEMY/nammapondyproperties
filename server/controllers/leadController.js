const SharedLead = require("../models/SharedLead");
const Subscription = require("../models/Subscription");
const Requirement = require("../models/Requirement");

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

    // 2. Find leads shared with this plan
    // We only show leads where the seller was in the "sharedWith" list or if it's open to the plan
    const sharedLeads = await SharedLead.find({
      plan: activeSubscription.plan,
    })
      .populate({
        path: "requirement",
        select: "category usageType propertyType preferredLocation minBudget maxBudget propertyPreferences createdAt",
      })
      .populate("acceptedBy", "name")
      .sort({ createdAt: -1 });

    // Transform data to hide contact info if not accepted by THIS seller
    const transformedLeads = sharedLeads.map((lead) => {
      const isAccepted = lead.status === "accepted" || lead.status === "closed";
      const isAcceptedByMe = lead.acceptedBy && lead.acceptedBy._id.toString() === userId.toString();

      return {
        _id: lead._id,
        requirement: lead.requirement,
        status: lead.status,
        acceptedBy: lead.acceptedBy ? lead.acceptedBy.name : null,
        isAcceptedByMe: !!isAcceptedByMe,
        // Only show contact info if accepted by me
        contactInfo: isAcceptedByMe ? {
          fullName: lead.requirement.fullName, // Note: Need to populate or fetch Requirement again for full details
          email: lead.requirement.email,
          phoneNumber: lead.requirement.phoneNumber
        } : null
      };
    });

    // To get contact info, we need to populate full requirement fields but only for the accepted one
    // Let's refine the population
    const fullLeads = await Promise.all(sharedLeads.map(async (lead) => {
      const isAcceptedByMe = lead.acceptedBy && lead.acceptedBy._id.toString() === userId.toString();
      
      let reqDetails = { ...lead.requirement._doc };
      
      if (!isAcceptedByMe) {
        // Remove sensitive fields
        delete reqDetails.fullName;
        delete reqDetails.email;
        delete reqDetails.phoneNumber;
      } else {
        // If accepted by me, fetch the actual full requirement to be sure
        const fullReq = await Requirement.findById(lead.requirement._id);
        reqDetails = fullReq;
      }

      return {
        _id: lead._id,
        requirement: reqDetails,
        status: lead.status,
        acceptedBy: lead.acceptedBy ? lead.acceptedBy.name : null,
        isAcceptedByMe,
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
