const Requirement = require("../models/Requirement");

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

    res.status(200).json({
      success: true,
      data: requirements,
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
