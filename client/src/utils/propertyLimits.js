/**
 * Centralized utility to check property listing limits based on user role, 
 * business type, verification status, and subscription plans.
 */
export const checkPropertyListingLimit = (user, overrideCount) => {
  if (!user) return { canPost: false, reason: "login_required" };

  const role = (user.role_id?.role_name || user.role?.name || "").toUpperCase();
  if (role === "ADMIN") return { canPost: true };

  const currentCount = overrideCount !== undefined ? overrideCount : (user.propertyCount || 0);
  
  // 1. Unverified Restriction
  // All unverified users are restricted to exactly ONE listing.
  if (!user.badgeVerified && currentCount >= 1) {
    const isPending = user.badgeRequestStatus === "pending";
    return {
      canPost: false,
      reason: "unverified",
      message: isPending 
        ? "Your verification is under process wait 24hrs" 
        : "First complete your profile, once verified your profile then only you listing other properties",
      currentCount,
      limit: 1
    };
  }

  // 2. Role-Based Limits & Subscriptions
  let limit = 3; // Default fallback for Agents/Owners
  let planName = "Free";

  // If user has an active subscription, use its limit (populated via getMe/refreshToken)
  if (user.activeSubscription && user.activeSubscription.plan) {
    limit = user.activeSubscription.plan.propertyLimit;
    planName = user.activeSubscription.plan.name;
  } else {
    // Role-based limits for Free Tier
    const businessType = user.businessType?.name || "";
    if (businessType.match(/Builder|Promoter/i)) {
      limit = 1; // Builders get 1 free listing
    } else if (businessType.match(/Agent|Owner/i)) {
      limit = 3; // Agents/Owners get 3 free listings
    }
  }

  // Default redirect path for all upgrade/limit issues
  const redirectPath = "/seller/upgrade-plan";

  // Final check against the calculated limit
  // Note: limit of -1 usually indicates unlimited in many backend systems
  if (limit !== -1 && currentCount >= limit) {
    return {
      canPost: false,
      reason: "limit_reached",
      message: `Your ${planName} plan allows only ${limit} properties. Please upgrade your plan for more uploads.`,
      currentCount,
      limit,
      redirectPath
    };
  }

  return { 
    canPost: true, 
    currentCount, 
    limit,
    message: "Within limits",
    redirectPath: null
  };
};
