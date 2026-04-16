// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    name: { type: String, required: false },
    phone: { type: String, unique: true, sparse: true }, // unique for phone-base users
    status: { type: String, default: "active" },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    badgeVerified: { type: Boolean, default: false },
    badgeRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    profile_image: { type: String }, // URL or path to image
    rating: { type: Number, default: 4.5 },
    testimonialCount: { type: Number, default: 0 },
    availabilityStatus: { type: String, default: "Available" },
    nextAvailableSlot: { type: Date },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    customId: { type: String, unique: true, sparse: true },
    userId: { type: String, unique: true, sparse: true },
    referralCode: { type: String, unique: true, sparse: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    activeSubscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    businessType: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessType" },
    builderProfile: { type: mongoose.Schema.Types.ObjectId, ref: "BuilderProfile" },
  },
  { timestamps: true },
);

// Pre-save middleware for generating IDs
userSchema.pre("save", async function () {
  // Generate userId if not exists
  if (!this.userId) {
    this.userId = "USR" + Math.floor(100000 + Math.random() * 900000);
  }

  // Generate referralCode if not exists
  if (!this.referralCode) {
    this.referralCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
  }
});

module.exports = mongoose.model("User", userSchema);
