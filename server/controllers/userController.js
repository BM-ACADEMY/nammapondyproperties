// controllers/userController.js

const User = require("../models/User");
const Role = require("../models/Role");
const BusinessType = require("../models/BusinessType");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper function (keep or improve with env variables)
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ← or use your preferred service
    auth: {
      user: process.env.USER_EMAIL, // ← changed
      pass: process.env.USER_PASS, // better to use app password
    },
  });

  await transporter.sendMail({
    from: process.env.USER_EMAIL, // ← changed
    to,
    subject,
    text,
  });
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({ error: "Phone number already in use" });
    }

    // Get Role
    let roleName = "user";
    if (
      req.body.role === "seller" ||
      req.body.role === "agent" ||
      req.body.role === "builder" ||
      req.body.role === "owner"
    ) {
      roleName = "seller";
    }

    const userRole = await Role.findOne({ role_name: roleName });
    let role_id;
    if (!userRole) {
      const defaultRole = await Role.findOne({ role_name: "user" });
      if (!defaultRole)
        return res.status(500).json({ error: "Default user role not found" });
      role_id = defaultRole._id;
    } else {
      role_id = userRole._id;
    }

    const customId = `USER-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const referralCode = `REF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const user = new User({
      name: name || "User",
      email, // Optional now
      phone,
      password,
      role_id: role_id,
      businessType: req.body.businessType || null,
      isVerified: true, // Auto-verify as we are not using OTP/Email verification anymore
      customId,
      referralCode,
    });

    await user.save();

    // Populate for response
    const populatedUser = await User.findById(user._id)
      .populate("role_id");

    // Generate token for auto-login
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: { ...populatedUser.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};

    if (role) {
      const roleDoc = await Role.findOne({ role_name: role.toLowerCase() });
      if (roleDoc) {
        query.role_id = roleDoc._id;
      } else {
        // If role name given but not found, return empty list or error?
        // Let's return empty list to be safe
        return res.json([]);
      }
    }


    const users = await User.find(query)
      .populate("role_id");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicUsers = async (req, res) => {
  try {
    const { businessType, limit } = req.query;
    let query = { isVerified: true }; // Only show verified users publicly

    if (businessType) {
      query.businessType = businessType;
    } else {
      // If no business type, maybe filtering by role?
      // For now, require businessType or return all verified professionals logic if needed
      // but the UI sends businessType.
    }

    // Optional: filter by role 'seller' if we want to be strict
    const sellerRole = await Role.findOne({ role_name: "seller" });
    if (sellerRole) {
      // We might want to include 'agent', 'builder' roles if they exist separately
      // But based on previous logic, they map to 'seller' role with different businessType
      query.role_id = sellerRole._id;
    }

    const users = await User.find(query)
      .select("name email phone profile_image role_id isVerified badgeVerified") // Select only public fields
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
      .select("name email phone profile_image role_id isVerified badgeVerified") // Select only public fields
      .populate("role_id");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("role_id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let updateData = req.body;


    // Check if image was uploaded
    if (req.file) {
      updateData.profile_image = `/uploads/profiles/${req.file.filename}`;

      // Delete old image if exists
      const oldUser = await User.findById(userId);
      if (oldUser && oldUser.profile_image) {
        const oldImagePath = path.join(__dirname, "..", oldUser.profile_image);
        // Check if file exists before deleting
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
      }
    } else if (
      req.body.remove_image === "true" ||
      req.body.remove_image === true
    ) {
      // Handle image removal
      const oldUser = await User.findById(userId);
      if (oldUser && oldUser.profile_image) {
        const oldImagePath = path.join(__dirname, "..", oldUser.profile_image);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
      }
      updateData.profile_image = null; // Or empty string, depending on schema requirements (if required, this fails)
      // Schema says: profile_image: { type: String } (not required by default unless specified)
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    })
      .populate("role_id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message =
        field === "phone"
          ? "This mobile number is already registered with another account."
          : field === "email"
            ? "This email address is already registered."
            : `Duplicate value for ${field}`;
      return res.status(400).json({ error: message });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete profile image if exists
    if (user.profile_image) {
      const imagePath = path.join(__dirname, "..", user.profile_image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error("Failed to delete user image:", err);
        }
      }
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  res.status(410).json({ error: "OTP service is deprecated. Use password login." });
};

exports.verifyOtp = async (req, res) => {
  res.status(410).json({ error: "OTP service is deprecated. Use password login." });
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password are required" });
    }

    const user = await User.findOne({ phone })
      .select("+password")
      .populate("role_id");

    if (!user) return res.status(401).json({ error: "User not found" });

    const authenticated = await user.comparePassword(password);

    if (!authenticated) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return token / user data...
    res.json({
      success: true,
      message: "Login successful",
      user: { ...user.toObject(), password: undefined },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    }).populate("role_id");

    if (!user) {
      // Find Default Role
      const userRole = await Role.findOne({ role_name: "user" });

      const customId = `USER-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const referralCode = `REF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

      user = new User({
        name,
        email,
        googleId,
        profile_image: picture,
        role_id: userRole?._id,
        isVerified: true,
        customId,
        referralCode,
        // No password or phone initially for Google users
      });
      await user.save();

      // Populate for response
      user = await User.findById(user._id).populate("role_id");
    } else {
      // Update googleId if not present (case where email matched)
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profile_image) user.profile_image = picture;
        await user.save();
      }
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ error: "Google Authentication failed" });
  }
};

// Add this new function
// controllers/userController.js → resetPassword

exports.resetPassword = async (req, res) => {
  const { phone, newPassword } = req.body;

  try {
    if (!phone || !newPassword) {
      return res.status(400).json({ error: "Phone and new password are required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("role_id");
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Find Role
    // Default to 'user' if not specified, or use the one provided (e.g., 'seller')
    const roleName = role ? role.toLowerCase() : "user";
    const userRole = await Role.findOne({ role_name: roleName });
    if (!userRole) {
      return res.status(400).json({ error: `Role '${roleName}' not found` });
    }

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password, // hashed by pre-save
      role_id: userRole._id,
      isVerified: true, // Admin created users are verified by default
      badgeVerified: req.body.badgeVerified || false,
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully by Admin",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

// Wishlist Controller Methods
exports.addToWishlist = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user.id;

  console.log(`[Wishlist] Adding ${propertyId} for user ${userId}`);

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if checks string vs ObjectId correctly
    const isAlreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === propertyId,
    );

    if (isAlreadyInWishlist) {
      console.log(`[Wishlist] Property ${propertyId} already in wishlist`);
      return res.status(400).json({ message: "Property already in wishlist" });
    }

    user.wishlist.push(propertyId);
    await user.save();

    console.log(`[Wishlist] Added. New count: ${user.wishlist.length}`);

    res
      .status(200)
      .json({ message: "Property added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error(`[Wishlist Error] Add:`, error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user.id;

  console.log(`[Wishlist] Removing ${propertyId} for user ${userId}`);

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    await user.save();

    console.log(`[Wishlist] Removed. New count: ${user.wishlist.length}`);

    res.status(200).json({
      message: "Property removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(`[Wishlist Error] Remove:`, error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getWishlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("wishlist");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.upgradeToSeller = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessType, name, phone } = req.body;

    // Find Seller Role
    const sellerRole = await Role.findOne({ role_name: "seller" });
    if (!sellerRole) {
      return res
        .status(500)
        .json({ error: "Seller role configuration missing" });
    }

    // Verify BusinessType exists
    if (businessType) {
      const btExists = await BusinessType.findById(businessType);
      if (!btExists)
        return res.status(400).json({ error: "Invalid Business Type" });
    }

    const updateData = {
      role_id: sellerRoleId._id,
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .populate("role_id");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      message: "Upgraded to Seller successfully",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message =
        field === "phone"
          ? "This mobile number is already registered with another account."
          : field === "email"
            ? "This email address is already registered."
            : `Duplicate value for ${field}`;
      return res.status(400).json({ error: message });
    }
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("role_id");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getSellersByPropertyBusinessType = async (req, res) => {
  try {
    const { businessTypeId } = req.params;
    const Property = require("../models/Property");

    // Find all properties with the given business type and get unique sellers
    const sellersIds = await Property.find({ businessType: businessTypeId }).distinct("seller");

    // Fetch the user details for these sellers
    const sellers = await User.find({ _id: { $in: sellersIds } })
      .select("name email phone profile_image role_id isVerified badgeVerified")
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

    if (user.badgeRequestStatus === "pending") {
      return res.status(400).json({ error: "Verification request is already pending" });
    }
    if (user.badgeVerified) {
      return res.status(400).json({ error: "You are already verified" });
    }

    user.badgeRequestStatus = "pending";
    await user.save();

    res.json({ message: "Verification request sent successfully", status: "pending" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
