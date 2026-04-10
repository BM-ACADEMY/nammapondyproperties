const SubscriptionPlan = require("../models/SubscriptionPlan");

// Get all plans
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ status: "active" });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all plans including inactive
exports.adminGetAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Create/Update Plan
exports.savePlan = async (req, res) => {
  try {
    const { id, name, price, propertyLimit, duration, features, notIncluded, isPopular, status } = req.body;
    
    if (id) {
      const plan = await SubscriptionPlan.findByIdAndUpdate(
        id,
        { name, price, propertyLimit, duration, features, notIncluded, isPopular, status },
        { new: true }
      );
      return res.json({ message: "Plan updated successfully", plan });
    }

    const plan = new SubscriptionPlan({ name, price, propertyLimit, duration, features, notIncluded, isPopular, status });
    await plan.save();
    res.status(201).json({ message: "Plan created successfully", plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Delete Plan (or deactivate)
exports.deletePlan = async (req, res) => {
  try {
    await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
