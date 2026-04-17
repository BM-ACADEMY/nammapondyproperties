// controllers/userController.js
const User = require("../models/User");
const Role = require("../models/Role");
const BusinessType = require("../models/BusinessType");
const BuilderProfile = require("../models/BuilderProfile");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Property = require("../models/Property");

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
    const user = await User.findById(req.user.id).populate(["role_id", "businessType", "builderProfile"]);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Include property count for frontend verification checks
    const propertyCount = await Property.countDocuments({ seller: user._id });
    
    // Add propertyCount to the user object (as a plain object property)
    const userData = user.toObject();
    userData.propertyCount = propertyCount;

    res.status(200).json({
      success: true,
      user: userData,
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

    const users = await User.find(query)
      .populate(["role_id", "businessType", "builderProfile"])
      .populate("createdBy", "name");
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
      .select("name phone profile_image role_id isVerified badgeVerified builderProfile businessType")
      .populate(["role_id", "builderProfile", "businessType"])
      .limit(parseInt(limit) || 20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name phone profile_image role_id isVerified badgeVerified builderProfile businessType")
      .populate(["role_id", "builderProfile", "businessType"]);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(["role_id", "businessType", "builderProfile"]);
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

    // Restriction: Badge-verified sellers cannot change their businessType
    const existingUser = await User.findById(userId).populate("builderProfile");
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    if (existingUser.badgeVerified && updateData.businessType && String(updateData.businessType) !== String(existingUser.businessType)) {
      return res.status(403).json({ error: "Badge-verified sellers cannot change their Business Type" });
    }

    // Handle File Uploads (profile_image and company_logo)
    if (req.files) {
      if (req.files.profile_image) {
        updateData.profile_image = `/uploads/profiles/${req.files.profile_image[0].filename}`;
        if (existingUser.profile_image) {
          const oldImagePath = path.join(__dirname, "..", existingUser.profile_image);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
      }
      if (req.files.company_logo) {
        updateData.company_logo = `/uploads/profiles/${req.files.company_logo[0].filename}`;
        if (existingUser.builderProfile && existingUser.builderProfile.companyLogo) {
          const oldLogoPath = path.join(__dirname, "..", existingUser.builderProfile.companyLogo);
          if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
        }
      }
    }

    // Handle Image Deletions
    if (req.body.remove_image === "true" && existingUser.profile_image) {
      const oldImagePath = path.join(__dirname, "..", existingUser.profile_image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      updateData.profile_image = null;
    }
    if (req.body.remove_company_logo === "true" && existingUser.builderProfile && existingUser.builderProfile.companyLogo) {
      const oldLogoPath = path.join(__dirname, "..", existingUser.builderProfile.companyLogo);
      if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
      updateData.company_logo = null;
    }

    // BuilderProfile Upsert Logic
    const isBuilderOrPromoter = existingUser.businessType && 
      (req.user.businessType || existingUser.businessType).name?.match(/Builder|Promoter/i);

    // If we have builder-specific fields or the user is identified as such
    if (req.body.builderDetail) {
      const builderData = typeof req.body.builderDetail === 'string' 
        ? JSON.parse(req.body.builderDetail) 
        : req.body.builderDetail;
      
      if (updateData.company_logo !== undefined) {
        builderData.companyLogo = updateData.company_logo;
      }
      if (updateData.profile_image !== undefined) {
          builderData.profileImage = updateData.profile_image;
      }

      const bp = await BuilderProfile.findOneAndUpdate(
        { user: userId },
        { ...builderData, user: userId },
        { upsert: true, new: true, runValidators: true }
      );
      updateData.builderProfile = bp._id;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { 
      new: true,
      runValidators: true 
    }).populate(["role_id", "businessType", "builderProfile"]);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Emit event if admin updated badgeRequestStatus or badgeVerified
    if (req.body.badgeRequestStatus !== undefined || req.body.badgeVerified !== undefined) {
      const io = req.app.get("socketio");
      if (io) {
        io.to(`seller-${user._id}`).emit("badge-status-changed", {
          badgeRequestStatus: user.badgeRequestStatus,
          badgeVerified: user.badgeVerified,
          message: `Your badge verification request has been ${user.badgeRequestStatus === "none" ? "updated" : user.badgeRequestStatus}.`,
        });
        
        io.to("admin-room").emit("badge-verification-requested", {
          sellerId: user._id,
        }); // Notify other admins
      }
    }

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
    }, { new: true }).populate(["role_id", "businessType"]);

    res.json({ success: true, message: "Upgraded successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(["role_id", "businessType"]);
    if (!user) return res.status(404).json({ error: "User not found" });

    const propertyCount = await Property.countDocuments({ seller: user._id });
    const userData = user.toObject();
    userData.propertyCount = propertyCount;

    res.json({ success: true, token: generateToken(user._id), user: userData });
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

    // Emit event to admin room using app instance
    const io = req.app.get("socketio");
    if (io) {
      io.to("admin-room").emit("badge-verification-requested", {
        sellerId: user._id,
        sellerName: user.name,
        sellerPhone: user.phone,
        message: `New badge verification request from ${user.name || 'Seller'}`,
      });
    }

    res.json({ message: "Verification request sent", status: "pending" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingBadgeRequestsCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ badgeRequestStatus: "pending" });
    res.json({ success: true, count });
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
      isVerified: true, // Admin-created users are pre-verified
      createdBy: req.user.id
    });

    await user.save();
    res.status(201).json({ success: true, message: "User created by admin", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


