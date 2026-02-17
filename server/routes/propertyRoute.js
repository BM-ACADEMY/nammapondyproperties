// routes/propertyRoutes.js
const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const { protect } = require("../middleware/authMiddleware");
const propertyUpload = require("../middleware/propertyUploadMiddleware");

// Create a new property
router.post(
  "/create-property",
  protect,
  propertyUpload.array("images", 10),
  propertyController.createProperty,
);
// Get all properties
router.get("/fetch-all-property", propertyController.getProperties);
// Get a property by ID
router.get("/fetch-property-by-id/:id", propertyController.getPropertyById);
// Update a property
router.put(
  "/update-property-by-id/:id",
  protect,
  propertyUpload.array("images", 10),
  propertyController.updateProperty,
);
// Delete a property
router.delete("/delete-property-by-id/:id", propertyController.deleteProperty);
// Increment view count
router.put("/increment-view-count/:id", propertyController.incrementViewCount);
// Verify property
router.put("/verify-property/:id", protect, propertyController.verifyProperty);
// Get property types
router.get("/property-types", propertyController.getPropertyTypes);
// Get approval types
router.get("/approval-types", propertyController.getPropertyApprovals);
// Get all filters (types, approvals, locations, maxPrice)
router.get("/filters", propertyController.getFilters);

// Get Seller Stats (Protected)
router.get("/seller-stats", protect, propertyController.getSellerStats);

// Get Admin Stats (Protected)
router.get("/admin-stats", protect, propertyController.getAdminStats);

module.exports = router;
