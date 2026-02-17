// routes/propertyViewRoute.js
const express = require("express");
const router = express.Router();
const {
    recordPropertyView,
    getPropertyViewAnalytics,
} = require("../controllers/propertyViewController");
const { protect } = require("../middleware/authMiddleware");

// Record a view (protected - requires authentication, or can be made public)
// Making it work for both authenticated and guest users
router.post("/:property_id", recordPropertyView);

// Get view analytics (protected - admin only ideally)
router.get("/:property_id/analytics", protect, getPropertyViewAnalytics);

module.exports = router;
