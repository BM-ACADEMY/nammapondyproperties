// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Optional if using OTP-only, but kept as per DBML
  phone: { type: String },
  status: { type: String, default: 'active' },
  otp: { type: String }, // For OTP verification
  otpExpires: { type: Date }, // Expiration time for OTP
  isVerified: { type: Boolean, default: false } // Verification status
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
