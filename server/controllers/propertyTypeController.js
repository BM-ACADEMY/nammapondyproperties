const PropertyType = require("../models/PropertyType");
const fs = require("fs");
const path = require("path");

exports.createPropertyType = async (req, res) => {
  try {
    const { name, status, visible_to_seller, key_attributes } = req.body;

    // Case-insensitive uniqueness check
    const existingType = await PropertyType.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingType) {
      if (req.file) {
        // Delete uploaded file if duplicate is found
        const filePath = path.join(__dirname, "..", "uploads", "propertyTypes", req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({ error: "Property Type with this name already exists" });
    }

    let image_url = "";
    if (req.file) {
      image_url = `/uploads/propertyTypes/${req.file.filename}`;
    }

    const propertyType = new PropertyType({
      name,
      status,
      visible_to_seller,
      key_attributes,
      image_url,
    });
    await propertyType.save();
    res.status(201).json(propertyType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPropertyTypes = async (req, res) => {
  try {
    const { status, visible_to_seller } = req.query;
    const query = {};
    if (status) query.status = status;
    if (visible_to_seller !== undefined)
      query.visible_to_seller = visible_to_seller === "true";

    const propertyTypes = await PropertyType.find(query);
    res.json(propertyTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyTypeById = async (req, res) => {
  try {
    const propertyType = await PropertyType.findById(req.params.id);
    if (!propertyType)
      return res.status(404).json({ error: "Property Type not found" });
    res.json(propertyType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePropertyType = async (req, res) => {
  try {
    const propertyType = await PropertyType.findById(req.params.id);
    if (!propertyType)
      return res.status(404).json({ error: "Property Type not found" });

    const { name } = req.body;
    if (name && name !== propertyType.name) {
      // Case-insensitive uniqueness check
      const existingType = await PropertyType.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: req.params.id },
      });

      if (existingType) {
        if (req.file) {
          // Delete uploaded file if duplicate is found
          const filePath = path.join(__dirname, "..", "uploads", "propertyTypes", req.file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        return res.status(400).json({ error: "Property Type with this name already exists" });
      }
    }

    // Handle Image Update
    if (req.file) {
      // Delete old image if exists
      if (propertyType.image_url) {
        const oldPath = path.join(__dirname, "..", propertyType.image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      req.body.image_url = `/uploads/propertyTypes/${req.file.filename}`;
    }

    Object.assign(propertyType, req.body);
    await propertyType.save();
    res.json(propertyType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePropertyType = async (req, res) => {
  try {
    const propertyType = await PropertyType.findById(req.params.id);
    if (!propertyType)
      return res.status(404).json({ error: "Property Type not found" });

    // Delete image if exists
    if (propertyType.image_url) {
      const imagePath = path.join(__dirname, "..", propertyType.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await PropertyType.findByIdAndDelete(req.params.id);
    res.json({ message: "Property Type deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
