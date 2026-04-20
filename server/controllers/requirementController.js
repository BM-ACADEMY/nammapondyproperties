const Requirement = require("../models/Requirement");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const SharedLead = require("../models/SharedLead");
const Property = require("../models/Property");
const BusinessType = require("../models/BusinessType");

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

    // Emit socket event for real-time notification
    const io = req.app.get("socketio");
    if (io) {
      io.to("admin-room").emit("new-requirement", {
        requirementId: savedRequirement._id,
        fullName: savedRequirement.fullName,
        message: `New requirement posted by ${savedRequirement.fullName}`,
      });
    }

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

// Helper function to build the property matching query
const getPropertyMatchQuery = (sellerId, requirement) => {
  if (!requirement) return null;

  const isRent = requirement.category === "Rent";
  const minBudget = requirement.minBudget || 0;
  const maxBudget = requirement.maxBudget || Infinity;

  const priceField = isRent ? "pricing.rent.monthlyRent" : "pricing.sell.price";
  const minPriceField = isRent ? "pricing.rent.minRent" : "pricing.sell.minPrice";
  const maxPriceField = isRent ? "pricing.rent.maxRent" : "pricing.sell.maxPrice";

  // Base query
  const matchQuery = {
    seller: sellerId,
    status: "Active",
    "basicInfo.category": requirement.category,
    "basicInfo.usageType": requirement.usageType,
    "basicInfo.propertyType": requirement.propertyType,
    $and: [
      {
        $or: [
          { [priceField]: { $gte: minBudget, $lte: maxBudget } },
          {
            [minPriceField]: { $lte: maxBudget },
            [maxPriceField]: { $gte: minBudget }
          }
        ]
      }
    ]
  };

  // Add Location matching if preferredLocation is provided
  if (requirement.preferredLocation && requirement.preferredLocation.trim() !== "") {
    const locTerm = requirement.preferredLocation.trim();
    const locRegex = new RegExp(locTerm, "i");
    matchQuery.$and.push({
      $or: [
        { "location.city": locRegex },
        { "location.locality": locRegex },
        { "location.subArea": locRegex }
      ]
    });
  }

  return matchQuery;
};

// Get subscription stats for lead sharing (Admin)
exports.getSubscriptionStats = async (req, res) => {
  try {
    const { requirementId } = req.query;
    let requirement = null;
    
    if (requirementId) {
      requirement = await Requirement.findById(requirementId);
    }

    const allPlans = await SubscriptionPlan.find({ status: "active" });
    
    // Group sub-plans by name to avoid duplicate entries in the UI
    const planGroups = {};
    allPlans.forEach(p => {
      if (!planGroups[p.name]) planGroups[p.name] = [];
      planGroups[p.name].push(p);
    });

    // Find if at least one Builder matches globally for Priority 1 logic
    let hasGlobalBuilderMatch = false;

    const stats = await Promise.all(
      Object.entries(planGroups).map(async ([planName, plansInGroup]) => {
        const planIds = plansInGroup.map(p => p._id);
        
        // Find active subscriptions for any plan in this group
        const activeSubscriptions = await Subscription.find({
          plan: { $in: planIds },
          status: "active",
          endDate: { $gt: new Date() },
        }).populate({
          path: "user",
          select: "name email phone businessType",
          populate: { path: "businessType", select: "name" }
        });

        const sellers = await Promise.all(activeSubscriptions
          .filter(sub => sub.user)
          .map(async (sub) => {
            const user = sub.user;
            const businessType = user.businessType?.name || "";
            const isBuilder = /Builder|Promoter/i.test(businessType);
            const isAgent = /Agent/i.test(businessType);

            let isMatch = false;
            let matchPriority = 3; // Default: No match
            let matchingProperties = [];

            if (requirement) {
              const matchQuery = getPropertyMatchQuery(user._id, requirement);
              const props = await Property.find(matchQuery).select("basicInfo.title");
              
              if (props.length > 0) {
                isMatch = true;
                matchPriority = isBuilder ? 1 : isAgent ? 2 : 3;
                if (isBuilder) hasGlobalBuilderMatch = true;
                matchingProperties = props.map(p => p.basicInfo.title);
              }
            }

            return {
              id: user._id,
              name: user.name || "Unnamed Seller",
              email: user.email,
              phone: user.phone,
              businessType: businessType,
              isBuilder,
              isAgent,
              isMatch,
              matchPriority,
              matchingProperties
            };
          }));

        return {
          planId: plansInGroup[0]._id, // Representative ID for frontend reference
          planName: planName,
          sellerCount: sellers.length,
          sellers: sellers,
          // Plan level matches
          hasBuilderMatch: sellers.some(s => s.isBuilder && s.isMatch),
          hasAgentMatch: sellers.some(s => s.isAgent && s.isMatch),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        stats,
        hasGlobalBuilderMatch
      },
    });
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch subscription stats.",
    });
  }
};

// Share requirement with one or more subscription plans (Admin)
exports.shareRequirement = async (req, res) => {
  try {
    const { id } = req.params; // Requirement ID
    let { planId, planIds, matchType, matchPriority } = req.body;
    
    // Coerce matchPriority to number to avoid type mismatch bugs (e.g. "3" === 3 is false)
    matchPriority = Number(matchPriority) || 3;

    const requirement = await Requirement.findById(id);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found.",
      });
    }

    // Determine target plans
    let targetPlanIds = [];
    if (planIds && Array.isArray(planIds)) {
      targetPlanIds = planIds;
    } else if (planId) {
      targetPlanIds = [planId];
    }

    if (targetPlanIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No subscription plans provided.",
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

    const results = [];
    const io = req.app.get("socketio");

    for (const pId of targetPlanIds) {
      const selectedPlan = await SubscriptionPlan.findById(pId);
      if (!selectedPlan) continue;

      // Find all plan variants with the same name
      const allMatchingPlans = await SubscriptionPlan.find({ 
        name: selectedPlan.name,
        status: "active" 
      });
      const allPlanVariantIds = allMatchingPlans.map(p => p._id);

      // Check if already shared with this specific plan
      const existingShare = await SharedLead.findOne({ requirement: id, plan: pId });
      if (existingShare) {
        results.push({ plan: selectedPlan.name, status: "already_shared" });
        continue;
      }

      // Find active sellers for all plan variants
      const activeSubscriptions = await Subscription.find({
        plan: { $in: allPlanVariantIds },
        status: "active",
        endDate: { $gt: new Date() },
      }).populate({
        path: "user",
        select: "name businessType",
        populate: { path: "businessType", select: "name" }
      });
      
      let sellerIds = [];

      // Improved Priority matching logic with property-level verification
      if (matchPriority === 1) {
        // Priority 1: ONLY Builders matching the criteria
        const builderSubs = activeSubscriptions.filter(sub => sub.user && /Builder|Promoter/i.test(sub.user.businessType?.name));
        for (const sub of builderSubs) {
          const matchQuery = getPropertyMatchQuery(sub.user._id, requirement);
          if (await Property.exists(matchQuery)) {
            sellerIds.push(sub.user._id);
          }
        }
      } else if (matchPriority === 2) {
        // Priority 2: ONLY Agents matching the criteria
        const agentSubs = activeSubscriptions.filter(sub => sub.user && /Agent/i.test(sub.user.businessType?.name));
        for (const sub of agentSubs) {
          const matchQuery = getPropertyMatchQuery(sub.user._id, requirement);
          if (await Property.exists(matchQuery)) {
            sellerIds.push(sub.user._id);
          }
        }
      } else if (matchPriority === 3) {
        // Priority 3 (Fallback): ALL Agents in the plan (regardless of match, per requirements)
        sellerIds = activeSubscriptions
          .filter(sub => sub.user && /Agent/i.test(sub.user.businessType?.name))
          .map(sub => sub.user._id);
      } else {
        // Safe fallback - shouldn't usually be hit
        sellerIds = activeSubscriptions
          .filter(sub => sub.user && /Agent/i.test(sub.user.businessType?.name))
          .map(sub => sub.user._id);
      }

      if (sellerIds.length === 0) {
        results.push({ plan: selectedPlan.name, status: "no_sellers" });
        continue;
      }

      const sharedLead = new SharedLead({
        requirement: id,
        plan: pId,
        sharedWith: sellerIds,
        status: "pending",
        matchType: matchType || "not-exact",
        matchPriority: matchPriority || 3
      });

      await sharedLead.save();

      // Notify sellers
      if (io) {
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
      results.push({ plan: selectedPlan.name, status: "success", count: sellerIds.length });
    }

    const successCount = results.filter(r => r.status === "success").length;
    
    if (successCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to share lead with any of the selected plans.",
        details: results
      });
    }

    res.status(200).json({
      success: true,
      message: `Lead shared successfully with ${successCount} plan(s).`,
      details: results
    });
  } catch (error) {
    console.error("Error sharing requirement:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not share requirement.",
    });
  }
};

