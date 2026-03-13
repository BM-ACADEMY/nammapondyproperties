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
const BusinessType = require("../models/BusinessType");

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
        seller: req.user._id,
      });
      if (propertyCount >= 5) {
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
          .json({ error: "You can only upload 5 properties." });
      }
    }

    // Handle Images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        image_url: `/uploads/properties/${file.filename}`,
      }));
    }

    // Arrays might come as strings or arrays depending on frontend
    const amenities = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : (req.body.amenities || []);

    const removeEmptyStrings = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === "") {
          delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          removeEmptyStrings(obj[key]);
        }
      });
      return obj;
    };

    const location = removeEmptyStrings(parseJSON(req.body.location) || {});
    const basicInfo = removeEmptyStrings(parseJSON(req.body.basicInfo) || {});
    const pricing = removeEmptyStrings(parseJSON(req.body.pricing) || {});
    const specifications = removeEmptyStrings(parseJSON(req.body.specifications) || {});
    const legal = removeEmptyStrings(parseJSON(req.body.legal) || {});

    const propertyData = {
      ...req.body,
      basicInfo,
      pricing,
      specifications,
      legal,
      amenities,
      location, // Use parsed location
      seller: req.user && req.user._id ? req.user._id : req.body.seller,
      media: {
        images: images.map(img => img.image_url),
        featuredImage: images.length > 0 ? images[0].image_url : ""
      },
      status: "Active",
      isVerified: true,
    };

    const property = new Property(propertyData);
    await property.save();

    // Role Automation: Upgrade 'user' to 'seller' after first post
    if (req.user && req.user.role_id) {
      const Role = require("../models/Role");
      const currentRole = await Role.findById(req.user.role_id);

      if (currentRole && currentRole.role_name === "user") {
        const sellerRole = await Role.findOne({ role_name: "seller" });
        if (sellerRole) {
          await User.findByIdAndUpdate(req.user._id, {
            role_id: sellerRole._id,
          });
          console.log(`User ${req.user._id} upgraded to SELLER role`);
        }
      }
    }

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
      random, // New: Randomize results
      businessType, // New: Filter by seller's business type
      isVerified, // Renamed from is_verified
      seller_id,
      excludeId,
      isSold,
      category,
    } = req.query;
    const queryConditions = [];

    // 1. Role / Ownership
    if (req.query.role) {
      const Role = require("../models/Role");
      const targetRole = req.query.role.toLowerCase();
      const roleDoc = await Role.findOne({ role_name: { $regex: new RegExp(`^${targetRole}$`, "i") } });
      if (roleDoc) {
        const usersWithRole = await User.find({ role_id: roleDoc._id }).distinct("_id");
        queryConditions.push({ seller: { $in: usersWithRole } });
      }
    }

    if (seller_id) {
      if (seller_id === "me" && req.user) {
        queryConditions.push({ seller: req.user._id });
      } else if (seller_id !== "me") {
        queryConditions.push({ seller: seller_id });
      }
    }

    // 2. Business Type
    if (businessType) {
      const bTypeArray = businessType.split(',').map(id => id.trim());
      queryConditions.push({ businessType: { $in: bTypeArray } });
    }

    // 3. Status / Verification
    if (excludeId) {
      queryConditions.push({
        _id: mongoose.isValidObjectId(excludeId) ? { $ne: new mongoose.Types.ObjectId(excludeId) } : { $ne: excludeId }
      });
    }

    if (isSold !== undefined) {
      if (isSold === "false") {
        queryConditions.push({ isSold: { $in: [false, undefined, null] } });
      } else if (isSold === "true") {
        queryConditions.push({ isSold: true });
      }
    }

    if (isVerified) {
      queryConditions.push({ isVerified: isVerified === "true" });
    }

    // 4. Property Specifications
    if (type) {
      const typeArray = type.split(',').map(t => t.trim());
      queryConditions.push({ "basicInfo.propertyType": { $in: typeArray } });
    }
    if (approval) {
      const approvalArray = approval.split(',').map(a => a.trim());
      queryConditions.push({ "basicInfo.approvalType": { $in: approvalArray } });
    }
    if (category) {
      const categoryArray = category.split(',').map(c => c.trim());
      queryConditions.push({ "basicInfo.category": { $in: categoryArray } });
    }

    if (location) {
      queryConditions.push({
        $or: [
          { "location.city": { $regex: location, $options: "i" } },
          { "location.locality": { $regex: location, $options: "i" } },
          { "location.state": { $regex: location, $options: "i" } },
          { "location.subArea": { $regex: location, $options: "i" } }
        ]
      });
    }

    // 5. Advanced Search
    if (search) {
      const tokens = search.split(/[\s,]+/).filter(t => t.length > 0);

      if (tokens.length > 0) {
        // 1. Create conditions for each individual token (AND logic)
        const tokenConditions = await Promise.all(tokens.map(async (token) => {
          const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const tokenRegex = { $regex: escapedToken, $options: "i" };

          // Find sellers matching this specific token
          const matchingSellers = await User.find({
            $or: [
              { name: tokenRegex },
              { phone: tokenRegex },
              { email: tokenRegex }
            ]
          }).distinct("_id");

          // Find business types matching this specific token
          const matchingBusinessTypes = await BusinessType.find({
            name: tokenRegex
          }).distinct("_id");

          const searchOr = [
            { "basicInfo.title": tokenRegex },
            { "basicInfo.description": tokenRegex },
            { "location.addressLine1": tokenRegex },
            { "location.addressLine2": tokenRegex },
            { "location.city": tokenRegex },
            { "location.locality": tokenRegex },
            { "location.subArea": tokenRegex },
            { "location.state": tokenRegex },
            { "location.pincode": tokenRegex },
            { "basicInfo.propertyType": tokenRegex },
            { "basicInfo.approvalType": tokenRegex },
            { "basicInfo.usageType": tokenRegex },
            { "basicInfo.category": tokenRegex },
            { "legal.propertyStatus": tokenRegex },
            { "specifications.facing": tokenRegex },
            { "specifications.residential.furnishing": tokenRegex },
            { "specifications.commercial.suitableFor": tokenRegex },
            { "specifications.utilities.waterSupply": tokenRegex },
            { "amenities": tokenRegex }
          ];

          if (matchingBusinessTypes.length > 0) {
            searchOr.push({ businessType: { $in: matchingBusinessTypes } });
          }

          // Smart Numeric Search
          const numericValue = parseInt(token.replace(/\D/g, ''));
          if (!isNaN(numericValue) && token.match(/^\d+$/)) {
            searchOr.push({ "specifications.builtupArea": numericValue });
            searchOr.push({ "specifications.residential.bedrooms": numericValue });
            searchOr.push({ "specifications.residential.bathrooms": numericValue });
          }

          return { $or: searchOr };
        }));

        // 2. Create a condition for the FULL search string (as-is)
        const escapedFullSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const fullSearchRegex = { $regex: escapedFullSearch, $options: "i" };

        const matchingBusinessTypesFull = await BusinessType.find({
          name: fullSearchRegex
        }).distinct("_id");

        const fullSearchOr = [
          { "basicInfo.title": fullSearchRegex },
          { "basicInfo.description": fullSearchRegex },
          { "location.city": fullSearchRegex },
          { "location.locality": fullSearchRegex },
          { "location.subArea": fullSearchRegex },
          { "amenities": fullSearchRegex }
        ];

        if (matchingBusinessTypesFull.length > 0) {
          fullSearchOr.push({ businessType: { $in: matchingBusinessTypesFull } });
        }

        // Combine: Match the full phrase OR match all tokens
        queryConditions.push({
          $or: [
            { $or: fullSearchOr },
            { $and: tokenConditions }
          ]
        });
      }
    }

    // 6. Price Range
    if (minPrice || maxPrice) {
      const priceQuery = {};
      if (minPrice) priceQuery.$gte = Number(minPrice);
      if (maxPrice) priceQuery.$lte = Number(maxPrice);

      queryConditions.push({
        $or: [
          { "pricing.sell.price": priceQuery },
          { "pricing.rent.monthlyRent": priceQuery }
        ]
      });
    }

    // Build Final Query
    const query = queryConditions.length > 0 ? { $and: queryConditions } : {};

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
      properties = await Property.populate(randomDocs, [
        {
          path: "seller",
          populate: { path: "role_id" },
        },
        { path: "businessType" },
      ]);

      // For random, total pages/count might be less relevant or just use total count matches
      count = await Property.countDocuments(query);
    } else {
      properties = await Property.find(query)
        .populate([
          {
            path: "seller",
            populate: { path: "role_id" },
          },
          { path: "businessType" },
        ])
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
    property.isVerified = !property.isVerified;
    await property.save();
    res.json({
      message: `Property ${property.isVerified ? "verified" : "unverified"}`,
      property,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFilters = async (req, res) => {
  try {
    const types = await PropertyType.find({ status: "active" }).select(
      "name hasRooms hasFloor hasPlot hasCommercial",
    );
    const approvals = await ApprovalType.distinct("name", { status: "active" });
    // Fetch distinct cities, localities, and sub-areas
    const cities = await Property.distinct("location.city");
    const localities = await Property.distinct("location.locality");
    const subAreas = await Property.distinct("location.subArea");

    // const locations = [...new Set([...cities, ...localities, ...subAreas])];
    const locations = [...new Set([...cities])];

    const priceStats = await Property.aggregate([
      {
        $group: {
          _id: null,
          maxPrice: {
            $max: {
              $cond: [
                { $ifNull: ["$pricing.sell.price", false] },
                "$pricing.sell.price",
                { $ifNull: ["$pricing.rent.monthlyRent", 0] }
              ]
            }
          },
        },
      },
    ]);

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

    const categories = Property.schema.path("basicInfo.category").enumValues;
    res.json({
      types: types,
      categories: categories,
      approvals: approvals,
      locations: cleanLocations,
      cities: cities.filter((c) => c),
      localities: localities.filter((l) => l),
      subAreas: subAreas.filter((s) => s),
      priceRanges,
      maxPrice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate([
      {
        path: "seller",
        populate: { path: "role_id" },
      },
      { path: "businessType" },
    ]);
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let query = { slug: slug };

    // Support old links by allowing fallback to ID if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug: slug }, { _id: slug }] };
    }

    const property = await Property.findOne(query).populate([
      {
        path: "seller",
        populate: { path: "role_id" },
      },
      { path: "businessType" },
    ]);
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecommendedProperties = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    const limit = 6;
    let recommended = [];

    // 1. Try Nearby Search (10km) if coordinates exist
    if (property.location?.coordinates?.lat && property.location?.coordinates?.lng) {
      const lng = parseFloat(property.location.coordinates.lng);
      const lat = parseFloat(property.location.coordinates.lat);

      if (!isNaN(lng) && !isNaN(lat)) {
        recommended = await Property.find({
          _id: { $ne: id },
          status: "Active",
          isSold: { $ne: true },
          "location.locationPoint": {
            $near: {
              $geometry: { type: "Point", coordinates: [lng, lat] },
              $maxDistance: 10000 // 10km in meters
            }
          }
        }).limit(limit).populate([
          {
            path: "seller",
            populate: { path: "role_id" },
          },
          { path: "businessType" },
        ]);
      }
    }

    // 2. Fallback if not enough properties found or no coordinates
    if (recommended.length < 3) {
      const existingIds = recommended.map(p => p._id);
      existingIds.push(new mongoose.Types.ObjectId(id));

      const queryConditions = [
        { _id: { $nin: existingIds } },
        { status: "Active" },
        { isSold: { $ne: true } },
        { "basicInfo.category": property.basicInfo?.category }
      ];

      // Match by locality or city
      const locationOr = [];
      if (property.location?.locality) locationOr.push({ "location.locality": { $regex: property.location.locality, $options: "i" } });
      if (property.location?.city) locationOr.push({ "location.city": { $regex: property.location.city, $options: "i" } });

      if (locationOr.length > 0) {
        queryConditions.push({ $or: locationOr });
      }

      // Match by price range (+/- 30% for wider fallback)
      const price = property.pricing?.sell?.price || property.pricing?.rent?.monthlyRent;
      if (price) {
        const minPrice = price * 0.7;
        const maxPrice = price * 1.3;
        queryConditions.push({
          $or: [
            { "pricing.sell.price": { $gte: minPrice, $lte: maxPrice } },
            { "pricing.rent.monthlyRent": { $gte: minPrice, $lte: maxPrice } }
          ]
        });
      }

      const fallbackProperties = await Property.find({ $and: queryConditions })
        .limit(limit - recommended.length)
        .populate([
          {
            path: "seller",
            populate: { path: "role_id" },
          },
          { path: "businessType" },
        ]);

      recommended = [...recommended, ...fallbackProperties];
    }

    // 3. Last resort fallback: just similar properties in same category
    if (recommended.length < 3) {
      const existingIds = recommended.map(p => p._id);
      existingIds.push(new mongoose.Types.ObjectId(id));

      const lastResort = await Property.find({
        _id: { $nin: existingIds },
        status: "Active",
        isSold: { $ne: true },
        "basicInfo.category": property.basicInfo?.category
      })
        .limit(limit - recommended.length)
        .populate([
          {
            path: "seller",
            populate: { path: "role_id" },
          },
          { path: "businessType" },
        ]);

      recommended = [...recommended, ...lastResort];
    }

    res.json(recommended);
  } catch (error) {
    console.error("Recommended Properties Error:", error);
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
      if (property.seller.toString() !== req.user._id.toString()) {
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

    // Handle Image Deletion
    const imagesToDelete = parseJSON(req.body.images_to_delete) || [];
    if (imagesToDelete.length > 0) {
      // Find images to delete
      const invalidImages = (property.media?.images || []).filter((img) =>
        imagesToDelete.includes(img)
      );

      // Delete files from filesystem
      invalidImages.forEach((img) => {
        try {
          const filePath = path.join(__dirname, "..", img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error(`Failed to delete image file: ${img}`, err);
        }
      });
    }

    const currentImages = property.media?.images || [];
    const remainingImages = currentImages.filter(img => !imagesToDelete.includes(img));

    // Handle New Images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/properties/${file.filename}`);
      remainingImages.push(...newImages);
    }

    // Parse nested structures
    const removeEmptyStrings = (obj) => {
      if (!obj) return obj;
      Object.keys(obj).forEach(key => {
        if (obj[key] === "") {
          delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          removeEmptyStrings(obj[key]);
        }
      });
      return obj;
    };

    const parsedBasicInfo = removeEmptyStrings(parseJSON(req.body.basicInfo));
    const parsedPricing = removeEmptyStrings(parseJSON(req.body.pricing));
    const parsedSpecs = removeEmptyStrings(parseJSON(req.body.specifications));
    const parsedLegal = removeEmptyStrings(parseJSON(req.body.legal));
    const parsedAmenities = typeof req.body.amenities === 'string' ? parseJSON(req.body.amenities) : req.body.amenities;

    const updates = { ...req.body };
    delete updates.images;
    delete updates.images_to_delete;

    // Apply nested parsing
    if (updates.location) updates.location = removeEmptyStrings(parseJSON(updates.location));
    if (parsedBasicInfo) updates.basicInfo = { ...property.basicInfo, ...parsedBasicInfo };
    if (parsedPricing) updates.pricing = { ...property.pricing, ...parsedPricing };
    if (parsedSpecs) updates.specifications = { ...property.specifications, ...parsedSpecs };
    if (parsedLegal) updates.legal = { ...property.legal, ...parsedLegal };
    if (parsedAmenities) updates.amenities = parsedAmenities;

    // Save Media
    updates.media = {
      ...(property.media || {}),
      images: remainingImages,
      featuredImage: remainingImages.length > 0 ? remainingImages[0] : ""
    };

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

    // Delete associated image files from filesystem
    if (property.images && property.images.length > 0) {
      property.images.forEach((img) => {
        try {
          const filePath = path.join(__dirname, "..", img.image_url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error(`Failed to delete image file: ${img.image_url}`, err);
        }
      });
    }

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
      // Already viewed recently, don't increment
      const property = await Property.findById(propertyId).select("view_count");
      return res.json({ view_count: property?.view_count || 0 });
    }

    // Record new view record
    await PropertyView.create({
      property_id: propertyId,
      ip_address: ip,
    });

    // Increment view count by 50
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $inc: { view_count: 50 } },
      { new: true },
    );
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json({ view_count: property.view_count });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAmenities = async (req, res) => {
  try {
    const amenities = [
      "Lift",
      "Car Parking",
      "Bike Parking",
      "Visitor Parking",
      "Power Backup",
      "24x7 Water Supply",
      "CCTV Surveillance",
      "24x7 Security",
      "Intercom",
      "Fire Safety System",
      "Gated Community",
      "Gym",
      "Swimming Pool",
      "Club House",
      "Party Hall",
      "Jogging Track",
      "Garden",
      "Children Play Area",
      "WiFi",
      "Laundry Service",
      "Housekeeping",
      "Rainwater Harvesting",
      "Solar Power",
      "Balcony",
      "Modular Kitchen",
      "Food Included",
      "AC Room",
      "Conference Room",
      "Pantry",
      "Corner Plot",
      "Street Light",
    ];
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// getPropertyTypes removed

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
    const properties = await Property.find({ seller: sellerId }).select(
      "status isVerified isSold view_count basicInfo.title start_date",
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
          seller: new mongoose.Types.ObjectId(sellerId),
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
      seller: sellerId,
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
        seller: sellerId,
      })) +
      (await require("../models/WhatsappLead").countDocuments({
        seller: sellerId,
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
      isVerified: false,
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
          seller: req.user._id,
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
      (await Enquiry.countDocuments({ seller: req.user._id })) +
      (await require("../models/WhatsappLead").countDocuments({
        seller: req.user._id,
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
      .populate("seller", "name")
      .limit(5)
      .select("basicInfo.title seller isVerified createdAt status")
      .sort({ createdAt: -1 });

    // Recent Enquiries (Only for this admin/seller to avoid leaking others' leads)
    const recentEnquiries = await Enquiry.find({ seller: req.user._id })
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
        title: p.basicInfo?.title,
        seller: p.seller?.name || "Unknown",
        status: p.isVerified ? p.status : "Pending Approval",
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
exports.updateViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { view_count } = req.body;

    if (view_count === undefined || view_count < 0) {
      return res.status(400).json({ error: "Invalid view count" });
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { view_count },
      { new: true },
    );

    if (!property) return res.status(404).json({ error: "Property not found" });

    res.json({
      message: "View count updated successfully",
      view_count: property.view_count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
