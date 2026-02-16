// controllers/userController.js

const User = require("../models/User");
const Role = require("../models/Role");
const BusinessType = require("../models/BusinessType");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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

    // Check if email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Get default "user" role
    // Get Role
    let roleName = "user";
    if (
      req.body.role === "seller" ||
      req.body.role === "agent" ||
      req.body.role === "builder" ||
      req.body.role === "owner"
    ) {
      // Using 'seller' as the main role for all business types for now, or we can use specific roles if they exist.
      // The user request says: "business type-owner,builder,agent(this only for seller only)"
      // It seems 'seller' is the role, and 'businessType' distinguishes them.
      roleName = "seller";
    }

    const userRole = await Role.findOne({ role_name: roleName });
    if (!userRole) {
      // Fallback to user if seller role not found (shouldn't happen if seeded)
      // Or create it? No, better to error or fallback.
      // Let's try to find 'user' again if 'seller' failed
      const defaultRole = await Role.findOne({ role_name: "user" });
      if (!defaultRole)
        return res.status(500).json({ error: "Default user role not found" });
      role_id = defaultRole._id;
    } else {
      role_id = userRole._id;
    }

    // Generate random customId (e.g., USER-123456)
    const customId = `USER-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // Generate random referralCode (e.g., REF-XYZ123)
    const referralCode = `REF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create user – password will be hashed automatically by pre-save hook
    const user = new User({
      name,
      email,
      phone,
      password, // ← will be hashed in pre('save')
      role_id: userRole._id,
      businessType: req.body.businessType || null,
      isVerified: false,
      customId,
      referralCode,
    });

    await user.save();

    // Generate and send OTP for email verification
    const otp = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      email,
      "Verify Your Email - OTP",
      `Welcome! Your OTP is: ${otp}\nIt expires in 10 minutes.`,
    );

    res.status(201).json({
      message: "Account created. Please verify your email with the OTP sent.",
      email: user.email,
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

    const users = await User.find(query).populate("role_id");
    res.json(users);
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
    let updateData = req.body;

    console.log("Update User Request:");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("req.file:", req.file);
    console.log("req.body:", JSON.stringify(req.body, null, 2));

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
    }).populate("role_id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
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
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char OTP
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();

    await sendEmail(
      email,
      "Your OTP Code",
      `Your OTP is ${otp}. It expires in 10 minutes.`,
    );
    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
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
  const { email, password, verifiedViaOtp } = req.body;

  try {
    const user = await User.findOne({ email })
      .select("+password")
      .populate("role_id");
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

// Add this new function
// controllers/userController.js → resetPassword

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Account not verified. Please verify first." });
    }

    // Optional: add more password strength rules here if needed

    user.password = newPassword; // ← will be hashed by pre-save hook
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
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

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.wishlist.includes(propertyId)) {
      return res.status(400).json({ message: "Property already in wishlist" });
    }

    user.wishlist.push(propertyId);
    await user.save();

    res
      .status(200)
      .json({ message: "Property added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    await user.save();

    res.status(200).json({
      message: "Property removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("role_id");
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
