const express = require("express");
const router = express.Router();
const propertyTypeController = require("../controllers/propertyTypeController");
const { protect, admin } = require("../middleware/authMiddleware");
const uploadResource = require("../middleware/propertyTypeUploadMiddleware");

router
  .route("/")
  .get(propertyTypeController.getPropertyTypes)
  .post(protect, admin, uploadResource.single("image"), propertyTypeController.createPropertyType);

router
  .route("/:id")
  .get(propertyTypeController.getPropertyTypeById)
  .put(protect, admin, uploadResource.single("image"), propertyTypeController.updatePropertyType)
  .delete(protect, admin, propertyTypeController.deletePropertyType);

module.exports = router;
