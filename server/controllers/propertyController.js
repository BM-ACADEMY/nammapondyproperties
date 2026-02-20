// controllers/propertyController.js
const mongoose = require("mongoose");
const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");
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
      seller_id,
      excludeId, // New: Exclude a specific property ID
      isSold, // New: Filter by sold status
      random, // New: Randomize results
    } = req.query;
    const query = {};

    // Handle role based filtering
    if (req.query.role === "seller") {
      const Role = require("../models/Role");
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

    if (seller_id) {
      if (seller_id === "me") {
        if (req.user) {
          query.seller_id = req.user._id;
        }
      } else {
        query.seller_id = seller_id;
      }
    }

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    if (isSold !== undefined) {
      // If isSold is 'false', we want properties where isSold is strictly false or doesn't exist
      if (isSold === "false") {
        query.isSold = { $in: [false, undefined, null] };
      } else if (isSold === "true") {
        query.isSold = true;
      }
    }

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

    let properties;
    let count;

    if (random === "true") {
      // Use aggregation for random sampling
      const pipeline = [
        { $match: query },
        { $sample: { size: Number(limit) } },
      ];

      // Since we need to populate seller_id, we can look it up or use a separate populate step
      // Aggregate returns plain objects, not Mongoose documents, but Property.populate works on them.
      const randomDocs = await Property.aggregate(pipeline);
      properties = await Property.populate(randomDocs, { path: "seller_id" });

      // For random, total pages/count might be less relevant or just use total count matches
      count = await Property.countDocuments(query);
    } else {
      properties = await Property.find(query)
        .populate("seller_id")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      count = await Property.countDocuments(query);
    }

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

    const types = await PropertyType.find(query).select(
      "name key_attributes -_id",
    );
    res.json(types);
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
    const sellerId = req.user.id;
    const { range = "30d" } = req.query; // Default to last 30 days

    // Calculate Date Range
    let dateFrom = new Date();
    if (range === "7d") dateFrom.setDate(dateFrom.getDate() - 7);
    else if (range === "30d") dateFrom.setDate(dateFrom.getDate() - 30);
    else if (range === "90d") dateFrom.setDate(dateFrom.getDate() - 90);
    else if (range === "all") dateFrom = new Date(0); // All time

    // 1. Property Status Breakdown
    const properties = await Property.find({ seller_id: sellerId }).select(
      "status is_verified isSold view_count title start_date",
    );

    const totalProperties = properties.length;
    const activeProperties = properties.filter(
      (p) => p.status === "available" && !p.isSold,
    ).length;
    const soldProperties = properties.filter((p) => p.isSold).length;
    const pendingProperties = properties.filter((p) => !p.is_verified).length;

    // 2. Views Over Time (Aggegration from PropertyView)
    // We need to match views for properties owned by this seller
    const sellerPropertyIds = properties.map((p) => p._id);

    const viewsOverTime = await PropertyView.aggregate([
      {
        $match: {
          property_id: { $in: sellerPropertyIds },
          viewed_at: { $gte: dateFrom },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewed_at" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Enquiries Over Time (Aggregation from Enquiry)
    const enquiriesOverTime = await Enquiry.aggregate([
      {
        $match: {
          seller_id: new mongoose.Types.ObjectId(sellerId),
          createdAt: { $gte: dateFrom },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4. Merge Data for Chart
    // Create a map of all dates in range to ensure continuous line
    const chartData = [];
    const today = new Date();
    let currentDate = new Date(dateFrom);

    // If "all" time, we might need a dynamic start, but for now let's use the actual data start or just fallback to 30d if no data
    if (range === "all") {
      // Find earliest date from data or default to 30 days ago
      // For chart cleanliness, let's limit "all" to last 6 months if no specific requirement
      dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - 6);
      currentDate = new Date(dateFrom);
    }

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];

      const viewData = viewsOverTime.find((v) => v._id === dateStr);
      const enquiryData = enquiriesOverTime.find((e) => e._id === dateStr);

      chartData.push({
        date: dateStr,
        views: viewData ? viewData.count : 0,
        enquiries: enquiryData ? enquiryData.count : 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 5. Recent Activity (Enquiries)
    const recentEnquiries = await Enquiry.find({
      seller_id: sellerId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("property_id", "title")
      .populate("user_id", "name email phoneNumber");

    // 6. Top Properties
    const topProperties = properties
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 5);

    // Total Views (Sum of all time or range? Usually dashboard header shows all time, chart shows range)
    // Let's keep total stats as ALL TIME for the cards, and chart as RANGE
    const totalViewsAllTime = properties.reduce(
      (sum, p) => sum + (p.view_count || 0),
      0,
    );
    const totalLeadsAllTime =
      (await Enquiry.countDocuments({
        seller_id: sellerId,
      })) +
      (await WhatsappLead.countDocuments({
        seller_id: sellerId,
      }));

    res.json({
      summary: {
        totalProperties,
        activeProperties,
        soldProperties,
        pendingProperties,
        totalViews: totalViewsAllTime,
        totalLeads: totalLeadsAllTime,
      },
      chartData,
      recentEnquiries,
      topProperties,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const Enquiry = require("../models/Enquiry");
    const Role = require("../models/Role"); // Ensure Role model is required
    const { range = "30d" } = req.query;

    // Calculate Date Range
    let dateFrom = new Date();
    if (range === "7d") dateFrom.setDate(dateFrom.getDate() - 7);
    else if (range === "30d") dateFrom.setDate(dateFrom.getDate() - 30);
    else if (range === "90d") dateFrom.setDate(dateFrom.getDate() - 90);
    else if (range === "all") dateFrom = new Date(0);

    // 1. User Stats (Total, Sellers, Buyers)
    const totalUsers = await User.countDocuments();

    // Find Role IDs
    const sellerRole = await Role.findOne({ role_name: { $regex: /seller/i } });
    const userRole = await Role.findOne({ role_name: { $regex: /user/i } }); // Or buyer
    const adminRole = await Role.findOne({ role_name: { $regex: /admin/i } });

    const totalSellers = sellerRole
      ? await User.countDocuments({ role_id: sellerRole._id })
      : 0;
    const totalBuyers = userRole
      ? await User.countDocuments({ role_id: userRole._id })
      : 0; // Assuming 'user' role is buyer

    // 2. Property Stats
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({
      status: "available",
    });
    const soldProperties = await Property.countDocuments({ isSold: true });
    const pendingApprovals = await Property.countDocuments({
      is_verified: false,
    });

    // 3. Views Aggregation (Global, Time-Series)
    const viewsOverTime = await PropertyView.aggregate([
      {
        $match: {
          viewed_at: { $gte: dateFrom },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewed_at" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalViewsAllTime = await PropertyView.estimatedDocumentCount(); // Faster than countDocuments or aggregation if huge

    // 4. Enquiries Aggregation (Global, Time-Series)
    const enquiriesOverTime = await Enquiry.aggregate([
      {
        $match: {
          seller_id: req.user._id,
          createdAt: { $gte: dateFrom },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalEnquiries =
      (await Enquiry.countDocuments({ seller_id: req.user._id })) +
      (await require("../models/WhatsappLead").countDocuments({
        seller_id: req.user._id,
      }));

    // 5. Merge Chart Data
    const chartData = [];
    const today = new Date();
    let currentDate = new Date(dateFrom);

    if (range === "all") {
      dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - 6);
      currentDate = new Date(dateFrom);
    }

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const viewData = viewsOverTime.find((v) => v._id === dateStr);
      const enquiryData = enquiriesOverTime.find((e) => e._id === dateStr);

      chartData.push({
        date: dateStr,
        views: viewData ? viewData.count : 0,
        enquiries: enquiryData ? enquiryData.count : 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 6. Recent Activity
    // New Users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role_id createdAt")
      .populate("role_id", "role_name");

    // Recent Properties
    const recentProperties = await Property.find()
      .populate("seller_id", "name")
      .limit(5)
      .select("title seller_id is_verified createdAt status")
      .sort({ createdAt: -1 });

    // Recent Enquiries (Only for this admin/seller to avoid leaking others' leads)
    const recentEnquiries = await Enquiry.find({ seller_id: req.user._id })
      .populate("property_id", "title")
      .populate("user_id", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      summary: {
        totalUsers,
        totalSellers,
        totalBuyers,
        totalProperties,
        activeProperties,
        soldProperties,
        pendingApprovals,
        totalViews: totalViewsAllTime,
        totalEnquiries,
      },
      chartData,
      recentUsers: recentUsers.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role_id?.role_name || "Unknown",
        joinedAt: u.createdAt,
      })),
      recentProperties: recentProperties.map((p) => ({
        _id: p._id,
        title: p.title,
        seller: p.seller_id?.name || "Unknown",
        status: p.is_verified ? p.status : "Pending Approval",
        createdAt: p.createdAt,
      })),
      recentEnquiries: recentEnquiries.map((e) => ({
        _id: e._id,
        user: e.user_id?.name || "Guest",
        property: e.property_id?.title || "Unknown Property",
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: error.message });
  }
};
