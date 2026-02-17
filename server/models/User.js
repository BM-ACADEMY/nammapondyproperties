// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // or const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    phone: { type: String },
    status: { type: String, default: "active" },
    otp: { type: String },
    otpExpires: { type: Date },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    profile_image: { type: String }, // URL or path to image
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    customId: { type: String, unique: true },
    userId: { type: String, unique: true },
    referralCode: { type: String, unique: true },
    businessType: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessType" },
  },
  { timestamps: true },
);

// Hash password before saving (only if password is modified)
// models/User.js
userSchema.pre("save", async function () {
  // Only hash if password was modified / is new
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Generate userId if not exists
  if (!this.userId) {
    this.userId = "USR" + Math.floor(100000 + Math.random() * 900000); // Simple random ID
  }

  // Generate referralCode if not exists
  if (!this.referralCode) {
    this.referralCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
  }
});
// Add a method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
