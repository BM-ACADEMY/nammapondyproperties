// controllers/userController.js
const User = require("../models/User");
const Role = require("../models/Role");
const BusinessType = require("../models/BusinessType");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return res.status(400).json({ error: "Please enter a valid 10-digit phone number" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes duration

  try {
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user automatically for first-time OTP request
      const userRole = await Role.findOne({ role_name: "user" });
      const customId = `USER-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

      user = new User({
        phone,
        role_id: userRole?._id,
        isVerified: false,
        customId,
        name: "User" // Default name
      });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via BulkSMSPlans API
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    const smsMessage = `Your OTP for ABM GROUPS verification is ${otp}. It is valid for 10 minutes. Do not share this OTP with anyone.`;
    const smsUrl = process.env.BULKSMS_API_URL
      .replace("{{phone}}", formattedPhone)
      .replace("{{message}}", encodeURIComponent(smsMessage));

    try {
      await axios.get(smsUrl);
      console.log(`SMS sent successfully to ${phone}`);
    } catch (smsError) {
      console.error("SMS Gateway Error:", smsError.message);
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Send Error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await User.findOne({
      phone,
      otp,
      otpExpires: { $gt: Date.now() },
    }).populate("role_id");

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("role_id");
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, verified } = req.query;
    let query = {};

    if (role) {
      const roleDoc = await Role.findOne({ role_name: role.toLowerCase() });
      if (roleDoc) query.role_id = roleDoc._id;
      else return res.json([]);
    }

    if (verified !== undefined) {
      query.isVerified = verified === "true";
    }

    const users = await User.find(query).populate("role_id");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicUsers = async (req, res) => {
  try {
    const { businessType, limit } = req.query;
    let query = { isVerified: true };

    if (businessType) query.businessType = businessType;

    const sellerRole = await Role.findOne({ role_name: "seller" });
    if (sellerRole) query.role_id = sellerRole._id;

    const users = await User.find(query)
      .select("name phone profile_image role_id isVerified badgeVerified")
      .populate("role_id")
      .limit(parseInt(limit) || 20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name phone profile_image role_id isVerified badgeVerified")
      .populate("role_id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role_id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let updateData = { ...req.body };

    // Handle array fields that might come as strings from FormData
    if (typeof updateData.expertise === "string") {
      try {
        updateData.expertise = JSON.parse(updateData.expertise);
      } catch (e) {
        updateData.expertise = updateData.expertise.split(",").map(item => item.trim()).filter(Boolean);
      }
    }

    if (typeof updateData.languages === "string") {
      try {
        updateData.languages = JSON.parse(updateData.languages);
      } catch (e) {
        updateData.languages = updateData.languages.split(",").map(item => item.trim()).filter(Boolean);
      }
    }

    // Handle numeric fields
    if (updateData.experience) {
      updateData.experience = Number(updateData.experience);
    }

    if (req.file) {
      updateData.profile_image = `/uploads/profiles/${req.file.filename}`;
      const oldUser = await User.findById(userId);
      if (oldUser && oldUser.profile_image) {
        const oldImagePath = path.join(__dirname, "..", oldUser.profile_image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    } else if (req.body.remove_image === "true") {
      const oldUser = await User.findById(userId);
      if (oldUser && oldUser.profile_image) {
        const oldImagePath = path.join(__dirname, "..", oldUser.profile_image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updateData.profile_image = null;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { 
      new: true,
      runValidators: true 
    }).populate("role_id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Phone number already in use" });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.profile_image) {
      const imagePath = path.join(__dirname, "..", user.profile_image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Wishlist methods
exports.addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.wishlist.some(id => id.toString() === propertyId)) {
      return res.status(400).json({ message: "Property already in wishlist" });
    }
    user.wishlist.push(propertyId);
    await user.save();
    res.status(200).json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.wishlist = user.wishlist.filter(id => id.toString() !== propertyId);
    await user.save();
    res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.upgradeToSeller = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessType, name, phone } = req.body;

    const sellerRole = await Role.findOne({ role_name: "seller" });
    if (!sellerRole) return res.status(500).json({ error: "Seller role missing" });

    if (businessType) {
      const btExists = await BusinessType.findById(businessType);
      if (!btExists) return res.status(400).json({ error: "Invalid Business Type" });
    }

    const user = await User.findByIdAndUpdate(userId, {
      role_id: sellerRole._id,
      name,
      phone,
      businessType
    }, { new: true }).populate("role_id");

    res.json({ success: true, message: "Upgraded successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("role_id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, token: generateToken(user._id), user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getSellersByPropertyBusinessType = async (req, res) => {
  try {
    const { businessTypeId } = req.params;
    const Property = require("../models/Property");
    const sellersIds = await Property.find({ businessType: businessTypeId }).distinct("seller");
    const sellers = await User.find({ _id: { $in: sellersIds } })
      .select("name phone profile_image role_id isVerified badgeVerified")
      .populate("role_id");
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestBadgeVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.badgeRequestStatus === "pending") return res.status(400).json({ error: "Request already pending" });
    user.badgeRequestStatus = "pending";
    await user.save();
    res.json({ message: "Verification request sent", status: "pending" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, phone, role_id } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ error: "User already exists with this phone number" });

    const user = new User({
      name,
      phone,
      role_id,
      isVerified: true // Admin-created users are pre-verified
    });

    await user.save();
    res.status(201).json({ success: true, message: "User created by admin", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Google credential is required" });

  try {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email }).populate("role_id");

    if (!user) {
      const userRole = await Role.findOne({ role_name: "user" });
      const customId = `USER-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      user = await User.create({
        email,
        name,
        googleId,
        profile_image: picture,
        role_id: userRole?._id,
        isVerified: true,
        customId,
      });
      user = await User.findById(user._id).populate("role_id");
    } else if (!user.googleId) {
      // Link Google account to existing email user
      user.googleId = googleId;
      if (!user.profile_image) user.profile_image = picture;
      await user.save();
      user = await User.findById(user._id).populate("role_id");
    }

    const token = generateToken(user._id);
    res.json({ success: true, message: "Google login successful", user, token });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(401).json({ error: "Invalid Google credential" });
  }
};
