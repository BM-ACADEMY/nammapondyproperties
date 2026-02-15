// controllers/propertyController.js
const mongoose = require("mongoose");
const Property = require("../models/Property");
const WhatsappLead = require("../models/WhatsappLead");

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

    // Handle key_attributes parsing if sent as JSON string
    let key_attributes = req.body.key_attributes;
    if (typeof key_attributes === 'string') {
      try {
        key_attributes = JSON.parse(key_attributes);
      } catch (e) {
        console.error("Error parsing key_attributes:", e);
        key_attributes = [];
      }
    }

    const propertyData = {
      ...req.body,
      seller_id: (req.user && req.user._id) ? req.user._id : req.body.seller_id,
      images: images,
      key_attributes: key_attributes
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
    if (location) query.location = location;
    if (is_verified) query.is_verified = is_verified === 'true';

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchConditions = [{ title: searchRegex }];
      searchConditions.push({ location: searchRegex });
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
    res.json({ message: `Property ${property.is_verified ? "verified" : "unverified"}`, property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFilters = async (req, res) => {
  try {
    const types = await Property.distinct("property_type");
    const approvals = await Property.distinct("approval");
    const locations = await Property.distinct("location");
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

    // Generate smart ranges
    const priceRanges = [];
    const step = 2000000; // 20 Lakhs steps, can be adjusted
    // Or closer to user request "1l- 2l", maybe smaller steps for lower values?
    // Let's use a tiered approach or simple steps for now.
    // Let's do: 0-10L, 10L-20L, ... up to max.

    // Better: Helper to format Indian currency
    const formatPrice = (price) => {
      if (price >= 10000000) return `${(price / 10000000).toFixed(1)}Cr`;
      if (price >= 100000) return `${(price / 100000).toFixed(0)}L`;
      return `${price.toLocaleString()}`;
    };

    // Create custom ranges based on max price
    // Range size: if max < 50L -> 5L steps
    // if max < 2Cr -> 20L steps
    // else -> 50L steps
    let rangeStep = 500000; // Default 5L
    if (maxPrice > 20000000)
      rangeStep = 5000000; // 50L
    else if (maxPrice > 5000000)
      rangeStep = 1000000; // 10L
    else if (maxPrice > 2000000)
      rangeStep = 500000; // 5L
    else rangeStep = 100000; // 1L for very small

    for (let current = 0; current < maxPrice; current += rangeStep) {
      const next = current + rangeStep;
      priceRanges.push({
        label: `${formatPrice(current)} - ${formatPrice(next)}`,
        min: current,
        max: next,
      });
    }
    // Add "Above Max" if needed, or just ensure the loop covers it.

    // Filter out null/undefined/empty values
    const cleanLocations = locations.filter((l) => l);
    const cleanApprovals = approvals.filter((a) => a);

    res.json({
      types: Property.PROPERTY_TYPES, // Use defined constants for types to ensure order/completeness
      approvals:
        cleanApprovals.length > 0 ? cleanApprovals : Property.APPROVAL_TYPES,
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
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (error) {
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
    const types = Property.PROPERTY_TYPES;
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyApprovals = async (req, res) => {
  try {
    const approvals = Property.APPROVAL_TYPES;
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id; // Assumes auth middleware populates req.user

    // 1. Total Properties
    const totalProperties = await Property.countDocuments({ seller_id: sellerId });

    // 2. Active Properties
    const activeProperties = await Property.countDocuments({ seller_id: sellerId, status: 'available' });

    // 3. Total Views (Aggregation)
    const viewsAggregation = await Property.aggregate([
      { $match: { seller_id: new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: null, totalViews: { $sum: "$view_count" } } }
    ]);
    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;

    // 4. Total Leads
    const totalLeads = await WhatsappLead.countDocuments({ seller_id: sellerId });

    // 5. Top Performing Properties
    const topProperties = await Property.find({ seller_id: sellerId })
      .sort({ view_count: -1 })
      .limit(5)
      .select('title view_count status images');

    res.json({
      totalProperties,
      activeProperties,
      totalViews,
      totalLeads,
      topProperties
    });

  } catch (error) {
    console.error("Error fetching seller stats:", error);
    res.status(500).json({ error: error.message });
  }
};
