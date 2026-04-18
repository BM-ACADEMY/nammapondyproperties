const Razorpay = require("razorpay");
const crypto = require("crypto");
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");
const PaymentHistory = require("../models/PaymentHistory");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const options = {
      amount: plan.price * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Verify Payment & Activate/Upgrade Subscription
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      planId 
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay Signature Mismatch!");
      console.error("Expected:", expectedSignature);
      console.error("Received:", razorpay_signature);
      return res.status(400).json({ error: "Invalid signature" });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    // Calculate dates
    const startDate = new Date();
    let endDate = null;
    if (plan.duration) {
      endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.duration);
    }
    
    console.log("--- Subscription Debug ---");
    console.log("Plan Name:", plan.name);
    console.log("Duration (Days):", plan.duration);
    console.log("Start Date (Raw):", startDate);
    console.log("End Date (Calculated):", endDate);
    console.log("--------------------------");

    // Remove old active subscriptions for this user (as requested)
    await Subscription.deleteMany({ user: req.user._id });

    // Create Subscription record (Current Active Plan)
    const subscription = new Subscription({
      user: req.user._id,
      plan: planId,
      startDate,
      endDate,
      status: "active",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "completed",
      amountPaid: plan.price,
    });

    await subscription.save();

    // Create Payment History record (Permanent)
    const paymentHistory = new PaymentHistory({
      user: req.user._id,
      plan: planId,
      planName: plan.name,
      amountPaid: plan.price,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "completed",
      transactionDate: new Date(),
      expiryDate: endDate
    });

    await paymentHistory.save();

    // Update User's active subscription
    await User.findByIdAndUpdate(req.user._id, {
      activeSubscription: subscription._id,
    });

    res.json({ success: true, message: "Subscription activated successfully", subscription });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get User Subscription
exports.getUserSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      user: req.user._id, 
      status: "active" 
    }).populate("plan");
    
    // On-the-fly expiry check
    if (subscription && subscription.endDate && new Date(subscription.endDate) < new Date()) {
      subscription.status = "expired";
      await subscription.save();
      
      await User.findByIdAndUpdate(req.user._id, {
        activeSubscription: null
      });
      
      return res.json(null);
    }
    
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Admin: Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const history = await PaymentHistory.find()
      .populate("user", "name phone email")
      .populate("plan", "name price")
      .sort({ transactionDate: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// 5. Seller: Get My Payment History
exports.getMyPaymentHistory = async (req, res) => {
  try {
    const history = await PaymentHistory.find({ user: req.user._id })
      .populate("plan", "name price")
      .sort({ transactionDate: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
