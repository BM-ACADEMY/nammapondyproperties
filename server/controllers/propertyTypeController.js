const PropertyType = require("../models/PropertyType");

exports.createPropertyType = async (req, res) => {
  try {
    const { name, status, visible_to_seller, key_attributes } = req.body;
    const propertyType = new PropertyType({
      name,
      status,
      visible_to_seller,
      key_attributes,
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
    const propertyType = await PropertyType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!propertyType)
      return res.status(404).json({ error: "Property Type not found" });
    res.json(propertyType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePropertyType = async (req, res) => {
  try {
    const propertyType = await PropertyType.findByIdAndDelete(req.params.id);
    if (!propertyType)
      return res.status(404).json({ error: "Property Type not found" });
    res.json({ message: "Property Type deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
