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

    if (!email && !phone) {
      return res.status(400).json({ error: "Email or Phone is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Phone";
      return res.status(400).json({ error: `${field} already in use` });
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
      email,
      phone,
      password,
      role_id: userRole._id,
      businessType: req.body.businessType || null,
      isVerified: true, // Auto-verify for immediate login
      customId,
      referralCode,
    });

    await user.save();

    // Generate token for auto-login
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: { ...user.toObject(), password: undefined },
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

    if (req.query.businessType) {
      query.businessType = req.query.businessType;
    }

    const users = await User.find(query)
      .populate("role_id")
      .populate("businessType");
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
      .select("name email phone profile_image businessType role_id isVerified") // Select only public fields
      .populate("businessType")
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
      .select("name email phone profile_image businessType role_id isVerified") // Select only public fields
      .populate("businessType")
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
      .populate("role_id")
      .populate("businessType");
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

    // Sanitize businessType if it's an empty string to prevent ObjectId casting error
    if (updateData.businessType === "") {
      updateData.businessType = null;
    }

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
      .populate("role_id")
      .populate("businessType");
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
  const { email, phone, otpEmail } = req.body;
  const identifier = email || phone;
  try {
    const user = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Use otpEmail if provided, otherwise fallback to user's registered email
    const targetEmail = otpEmail || user.email;
    if (!targetEmail) {
      return res.status(400).json({
        error: "No email provided for OTP",
        requiresEmail: true,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric OTP
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();

    await sendEmail(
      targetEmail,
      "Your OTP Code",
      `Your OTP is ${otp}. It expires in 10 minutes.`,
    );
    res.json({
      message: "OTP sent to email",
      email: targetEmail,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;
  try {
    const user = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Persist recovery email if user doesn't have one
    if (!user.email && email) {
      user.email = email;
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, phone, password, verifiedViaOtp } = req.body;
  const loginIdentifier = email || phone;

  try {
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { phone: loginIdentifier }],
    })
      .select("+password")
      .populate("role_id")
      .populate("businessType");
    if (!user) return res.status(401).json({ error: "User not found" });
    if (!user.isVerified)
      return res.status(403).json({ error: "Account not verified" });

    let authenticated = false;

    if (verifiedViaOtp === true) {
      // Came from OTP flow → already verified in verifyOtp
      authenticated = true;
    } else if (password) {
      authenticated = await user.comparePassword(password);
    }

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
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email })
      .populate("role_id")
      .populate("businessType");

    if (!user) {
      // Get default "user" role
      const userRole = await Role.findOne({ role_name: "user" });
      if (!userRole) {
        return res.status(500).json({ error: "Default user role not found" });
      }

      // Create new user if not exists
      user = new User({
        name,
        email,
        isVerified: true,
        role_id: userRole._id,
        googleId,
        profile_image: picture,
      });
      await user.save();
      user = await User.findById(user._id).populate("role_id");
    } else {
      // Sync profile image if missing and provided by Google
      let updated = false;
      if (!user.profile_image && picture) {
        user.profile_image = picture;
        updated = true;
      }
      // Sync googleId if missing
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    res.json({
      success: true,
      message: "Google login successful",
      user: { ...user.toObject(), password: undefined },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(400).json({ error: "Google authentication failed" });
  }
};

// Add this new function
// controllers/userController.js → resetPassword

exports.resetPassword = async (req, res) => {
  const { email, phone, newPassword } = req.body;

  try {
    const user = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Persist recovery email if user doesn't have one
    if (!user.email && email) {
      user.email = email;
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Account not verified. Please verify first." });
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
      .populate("role_id")
      .populate("businessType");
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
      role_id: sellerRole._id,
      businessType: businessType,
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .populate("role_id")
      .populate("businessType");

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
      .populate("role_id")
      .populate("businessType");
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
