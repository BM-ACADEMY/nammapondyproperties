// controllers/propertyController.js
const mongoose = require("mongoose");
const Property = require("../models/Property");
const WhatsappLead = require("../models/WhatsappLead");

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
    } = req.query;
    const query = {};

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
    const PropertyType = require("../models/PropertyType");
    const ApprovalType = require("../models/ApprovalType");

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
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { view_count: 1 } },
      { new: true },
    );
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json({ view_count: property.view_count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyTypes = async (req, res) => {
  try {
    const PropertyType = require("../models/PropertyType");
    const types = await PropertyType.find({ status: "active" }).select(
      "name -_id",
    );
    res.json(types.map((t) => t.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyApprovals = async (req, res) => {
  try {
    const ApprovalType = require("../models/ApprovalType");
    const approvals = await ApprovalType.find({ status: "active" }).select(
      "name -_id",
    );
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
