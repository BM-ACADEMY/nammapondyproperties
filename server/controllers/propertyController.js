// controllers/propertyController.js
const mongoose = require("mongoose");
const Property = require("../models/Property");
const WhatsappLead = require("../models/WhatsappLead");
const PropertyView = require("../models/PropertyView");
const fs = require("fs");
const path = require("path");
const PropertyType = require("../models/PropertyType");
const ApprovalType = require("../models/ApprovalType");
const User = require("../models/User");

const parseJSON = (data) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  return data;
};

exports.createProperty = async (req, res) => {
  try {
    console.log("Create Property Request Body:", req.body);
    console.log("Create Property Files:", req.files);

    // Check property limit for sellers
    if (
      req.user &&
      req.user.role_id &&
      req.user.role_id.role_name === "seller"
    ) {
      const propertyCount = await Property.countDocuments({
        seller_id: req.user._id,
      });
      if (propertyCount >= 2) {
        // Delete uploaded files if any, to avoid accumulating garbage
        if (req.files && req.files.length > 0) {
          req.files.forEach((file) => {
            try {
              fs.unlinkSync(
                path.join(__dirname, "../uploads/properties", file.filename),
              );
            } catch (err) {
              console.error("Error deleting file:", err);
            }
          });
        }
        return res
          .status(403)
          .json({ error: "You can only upload 2 properties." });
      }
    }

    // Handle Images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        image_url: `/uploads/properties/${file.filename}`,
      }));
    }

    const location = parseJSON(req.body.location);
    const key_attributes = parseJSON(req.body.key_attributes);

    const propertyData = {
      ...req.body,
      location, // Use parsed location
      key_attributes,
      seller_id: req.user && req.user._id ? req.user._id : req.body.seller_id,
      images: images,
    };

    const property = new Property(propertyData);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    console.error("Create Property Error:", error); // Log full error
    res.status(500).json({ error: error.message }); // Send 500 with message to see it in frontend
  }
};

exports.getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      search,
      location,
      minPrice,
      maxPrice,
      approval,
      is_verified,
      seller_id, // Add seller_id to destructuring
    } = req.query;
    const query = {};

    // Handle role based filtering
    if (req.query.role === "seller") {
      const Role = require("../models/Role"); // Ensure Role model exists
      // If Role model is simple { name: String }
      const sellerRoleDoc = await Role.findOne({
        name: { $regex: /^seller$/i },
      });
      if (sellerRoleDoc) {
        const User = require("../models/User");
        const sellers = await User.find({
          role_id: sellerRoleDoc._id,
        }).distinct("_id");
        query.seller_id = { $in: sellers };
      }
    }
    // Filter by seller_id if provided
    if (seller_id) {
      if (seller_id === "me") {
        // Explicitly check for 'me' string.
        // req.user might be available if route is protected or optional auth middleware is used.
        // AdminProperties uses this, so it should be protected or context provided.
        // If req.user is undefined, this fails.
        // The route /fetch-all-property is NOT protected in propertyRoute.js (line 16).
        // I need to use `protect` middleware or manually decode token if I want 'me' to work,
        // OR passing the ID explicitly from frontend.
        // passing ID from frontend is easier for now: frontend sends `seller_id=<actual_id>`.
        // But `AdminProperties` sends `seller_id=me`.
        // I should make `fetch-all-property` user aware.
        // But I can't easily change route protection without breaking public access.
        // FIX: Client side should send actual User ID for "Our Properties" if public endpoint is used.
        // backend: If 'me' is sent and no user, ignore or return empty?
        // Actually, `req.user` is only populated if `protect` middleware is present.
        // I will modify `propertyRoute.js` to use `optionalProtect` or similar, OR just rely on frontend sending the ID.
        // Sending ID from frontend is safer for public route.

        // However, for the reported error: "Failed to load properties".
        // If req.user is undefined, `req.user._id` crashes.
        if (req.user) {
          query.seller_id = req.user._id;
        }
      } else {
        query.seller_id = seller_id;
      }
    }

    // Fix: Handle 'type' filter
    if (type) query.property_type = type;

    if (approval) query.approval = approval;
    if (location) query["location.city"] = location;
    if (is_verified) query.is_verified = is_verified === "true";

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchConditions = [{ title: searchRegex }];
      searchConditions.push({ "location.address_line_1": searchRegex });
      searchConditions.push({ "location.city": searchRegex });
      searchConditions.push({ "location.state": searchRegex });
      query.$or = searchConditions;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query)
      .populate("seller_id")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Property.countDocuments(query);

    res.json({
      properties,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProperties: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    property.is_verified = !property.is_verified;
    await property.save();
    res.json({
      message: `Property ${property.is_verified ? "verified" : "unverified"}`,
      property,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFilters = async (req, res) => {
  try {
    const types = await PropertyType.distinct("name", { status: "active" });
    const approvals = await ApprovalType.distinct("name", { status: "active" });
    // Fetch distinct cities instead of full location objects to prevent frontend crashes
    const locations = await Property.distinct("location.city");
    const priceStats = await Property.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const minPrice = priceStats[0]?.minPrice || 0;
    const maxPrice = priceStats[0]?.maxPrice || 10000000;

    // Better: Helper to format Indian currency
    const formatPrice = (price) => {
      if (price >= 10000000) return `${(price / 10000000).toFixed(1)}Cr`;
      if (price >= 100000) return `${(price / 100000).toFixed(0)}L`;
      return `${price.toLocaleString()}`;
    };

    // Custom Logic for Smart Ranges based on user request ("1.1 to 1.4 -> round to 1.5")
    // Use smaller steps for lower values.
    const priceRanges = [];

    const generateRanges = (start, end, step) => {
      for (let current = start; current < end; current += step) {
        const next = current + step;
        priceRanges.push({
          label: `${formatPrice(current)} - ${formatPrice(next)}`,
          min: current,
          max: next,
        });
      }
    };

    if (maxPrice <= 2000000) {
      // Max is 20L, use 2L steps
      generateRanges(0, maxPrice + 200000, 200000);
    } else if (maxPrice <= 5000000) {
      // Max is 50L.
      generateRanges(0, 2000000, 200000); // 0-20L in 2L steps (10 items)
      generateRanges(2000000, maxPrice + 500000, 500000); // 20L+ in 5L steps
    } else {
      // Max is high.
      generateRanges(0, 2000000, 500000); // 0-20L in 5L steps
      generateRanges(2000000, 5000000, 500000); // 20-50L in 5L steps
      generateRanges(5000000, Math.min(maxPrice, 20000000), 2500000); // 50L-2Cr in 25L steps

      if (maxPrice > 20000000) {
        generateRanges(20000000, maxPrice + 5000000, 5000000); // >2Cr in 50L steps
      }
    }

    // Filter out null/undefined/empty values
    const cleanLocations = locations.filter((l) => l);

    res.json({
      types: types,
      approvals: approvals,
      locations: cleanLocations,
      priceRanges,
      maxPrice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "seller_id",
    );
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    console.log("Update Property Body:", req.body);

    const { id } = req.params;
    let property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Security Check: If user is seller, ensure they own the property
    if (req.user.role && req.user.role.name === "seller") {
      if (property.seller_id.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ error: "You are not authorized to update this property" });
      }
    }

    // Helper to parse JSON fields
    const parseJSON = (data) => {
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }
      return data;
    };

    // Handle Location parsing
    if (req.body.location) {
      req.body.location = parseJSON(req.body.location);
    }

    // Handle Key Attributes parsing
    if (req.body.key_attributes) {
      req.body.key_attributes = parseJSON(req.body.key_attributes);
    }

    // Handle Image Deletion
    const imagesToDelete = parseJSON(req.body.images_to_delete) || [];
    if (imagesToDelete.length > 0) {
      // Find images to delete
      const invalidImages = property.images.filter((img) =>
        imagesToDelete.includes(img._id.toString()),
      );

      // Delete files from filesystem
      invalidImages.forEach((img) => {
        try {
          // Construct full path. img.image_url is like "/uploads/properties/filename.jpg"
          // We need path from valid root.
          // Assuming app runs from 'server' dir or we used path.join before.
          // In createProperty: path.join(__dirname, '../uploads/properties', file.filename)
          // img.image_url includes /uploads/properties/
          const filePath = path.join(__dirname, "..", img.image_url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error(`Failed to delete image file: ${img.image_url}`, err);
        }
      });

      // Filter out deleted images from property
      property.images = property.images.filter(
        (img) => !imagesToDelete.includes(img._id.toString()),
      );
    }

    // Handle New Images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        image_url: `/uploads/properties/${file.filename}`,
      }));
      property.images.push(...newImages);
    }

    // Update other fields
    const updates = { ...req.body };
    delete updates.images; // Don't overwrite images array directly
    delete updates.images_to_delete;

    // Prevent overriding existing complex objects with undefined/null if not sent
    if (!updates.location) delete updates.location;
    if (!updates.key_attributes) delete updates.key_attributes;

    Object.assign(property, updates);

    await property.save();
    res.json(property);
  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.incrementViewCount = async (req, res) => {
  try {
    const propertyId = req.params.id;
    // Get IP address (handle proxies)
    const ip =
      (req.headers["x-forwarded-for"] || req.connection.remoteAddress)
        ?.split(",")[0]
        .trim() || "unknown";

    // Check for recent view (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingView = await PropertyView.findOne({
      property_id: propertyId,
      ip_address: ip,
      viewed_at: { $gte: last24Hours },
    });

    if (existingView) {
      // View exists roughly within 24h, do not increment.
      // Return current count.
      const property = await Property.findById(propertyId).select("view_count");
      if (!property)
        return res.status(404).json({ error: "Property not found" });
      return res.json({ view_count: property.view_count });
    }

    // Create new view record
    await PropertyView.create({
      property_id: propertyId,
      ip_address: ip,
    });

    // Increment view count
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $inc: { view_count: 1 } },
      { new: true },
    );
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json({ view_count: property.view_count });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyTypes = async (req, res) => {
  try {
    const { role } = req.query;

    const query = { status: "active" };
    if (role === "seller") {
      query.visible_to_seller = true;
    }

    const types = await PropertyType.find(query).select("name -_id");
    res.json(types.map((t) => t.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyApprovals = async (req, res) => {
  try {
    const { role } = req.query;

    const query = { status: "active" };
    if (role === "seller") {
      query.visible_to_seller = true;
    }

    const approvals = await ApprovalType.find(query).select("name -_id");
    res.json(approvals.map((a) => a.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id; // Assumes auth middleware populates req.user

    // 1. Total Properties
    const totalProperties = await Property.countDocuments({
      seller_id: sellerId,
    });

    // 2. Active Properties
    const activeProperties = await Property.countDocuments({
      seller_id: sellerId,
      status: "available",
    });

    // 3. Total Views (Aggregation)
    const viewsAggregation = await Property.aggregate([
      { $match: { seller_id: new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: null, totalViews: { $sum: "$view_count" } } },
    ]);
    const totalViews =
      viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;

    // 4. Total Leads
    const totalLeads = await WhatsappLead.countDocuments({
      seller_id: sellerId,
    });

    // 5. Top Performing Properties
    const topProperties = await Property.find({ seller_id: sellerId })
      .sort({ view_count: -1 })
      .limit(5)
      .select("title view_count status images");

    res.json({
      totalProperties,
      activeProperties,
      totalViews,
      totalLeads,
      topProperties,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const Enquiry = require("../models/WhatsappLead");

    // 1. Total Users
    const totalUsers = await User.countDocuments();

    // 2. Total Properties
    const totalProperties = await Property.countDocuments();

    // 3. Pending Approvals (properties pending admin approval)
    const pendingApprovals = await Property.countDocuments({
      is_verified: false,
    });

    // 4. Total Views (All Properties)
    const viewsAggregation = await Property.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$view_count" } } },
    ]);
    const siteVisits =
      viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;

    // 5. Total Enquiries
    const totalEnquiries = await Enquiry.countDocuments();

    // 6. Property Distribution by Type
    const propertyDistribution = await Property.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    const propertyData = propertyDistribution.map((item) => ({
      name: item._id || "Other",
      value: item.count,
    }));

    // 7. Pending Properties (for table)
    const pendingProperties = await Property.find({ is_verified: false })
      .populate("seller_id", "name")
      .limit(5)
      .select("title seller_id is_verified createdAt")
      .sort({ createdAt: -1 });

    // 8. Recent Activity
    const recentProperties = await Property.find()
      .populate("seller_id", "name")
      .limit(5)
      .select("title seller_id createdAt")
      .sort({ createdAt: -1 });

    const recentActivity = recentProperties.map((prop) => ({
      title: `New Property "${prop.title}" added`,
      seller: prop.seller_id?.name || "Unknown",
      time: prop.createdAt,
    }));

    res.json({
      totalUsers,
      totalProperties,
      pendingApprovals,
      siteVisits,
      totalEnquiries,
      propertyData,
      pendingProperties: pendingProperties.map((p) => ({
        key: p._id,
        property: p.title,
        seller: p.seller_id?.name || "Unknown",
        status: "Pending",
        id: p._id,
      })),
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: error.message });
  }
};
