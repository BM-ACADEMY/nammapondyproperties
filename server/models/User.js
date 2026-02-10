// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');     // or const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  phone: { type: String },
  status: { type: String, default: 'active' },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving (only if password is modified)
// models/User.js
userSchema.pre('save', async function () {
  // Only hash if password was modified / is new
  if (!this.isModified('password')) {
    return;           // ← just return (no next needed)
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No need to call next() — Mongoose waits for the promise to resolve
  } catch (error) {
    throw error;      // ← throw to stop save and propagate error
    // OR: return Promise.reject(error);
  }
});
// Add a method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
