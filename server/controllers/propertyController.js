// controllers/propertyController.js
const Property = require("../models/Property");

exports.createProperty = async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    } = req.query;
    const query = {};

    if (type) query.property_type = type;
    if (approval) query.approval = approval;
    if (location) query.location = location; // Exact match for location filter

    if (search) {
      // Search only in title and description, or if location is not selected, also location
      const searchRegex = { $regex: search, $options: "i" };
      const searchConditions = [{ title: searchRegex }];
      // Only search location if not explicitly filtered?
      // Actually usually user expects search to work broadly.
      // But if 'location' filter is set, 'search' might be for keyword.
      // Let's keep it broad for 'search'.
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
