const express = require("express");
const router = express.Router();
const requirementController = require("../controllers/requirementController");
const { protect, admin, optionalProtect } = require("../middleware/authMiddleware");

// @route   POST /api/requirements
// @desc    Submit a new requirement
// @access  Public/Optional Auth (to attach user ID)
router.post("/", optionalProtect, requirementController.createRequirement);

// @route   GET /api/requirements
// @desc    Get all requirements
// @access  Admin
router.get("/", protect, admin, requirementController.getRequirements);

// @route   PATCH /api/requirements/:id
// @desc    Update requirement status
// @access  Admin
router.patch("/:id", protect, admin, requirementController.updateRequirementStatus);

// @route   DELETE /api/requirements/:id
// @desc    Delete a requirement
// @access  Admin
router.delete("/:id", protect, admin, requirementController.deleteRequirement);

module.exports = router;
