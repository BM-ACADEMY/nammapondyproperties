const express = require("express");
const router = express.Router();
const propertyTypeController = require("../controllers/propertyTypeController");
const { protect, admin } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(propertyTypeController.getPropertyTypes)
  .post(protect, admin, propertyTypeController.createPropertyType);

router
  .route("/:id")
  .get(propertyTypeController.getPropertyTypeById)
  .put(protect, admin, propertyTypeController.updatePropertyType)
  .delete(protect, admin, propertyTypeController.deletePropertyType);

module.exports = router;
