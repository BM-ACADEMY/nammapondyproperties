const PropertyType = require("../models/PropertyType");

exports.createPropertyType = async (req, res) => {
    try {
        const propertyType = new PropertyType(req.body);
        await propertyType.save();
        res.status(201).json(propertyType);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "A property type with this name already exists." });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.getPropertyTypes = async (req, res) => {
    try {
        const { status, usageType } = req.query;
        const query = {};
        if (status) query.status = status;
        if (usageType) query.usageType = usageType;

        const propertyTypes = await PropertyType.find(query).sort({ name: 1 });
        res.json(propertyTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPropertyTypeById = async (req, res) => {
    try {
        const propertyType = await PropertyType.findById(req.params.id);
        if (!propertyType) return res.status(404).json({ error: "Property type not found" });
        res.json(propertyType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePropertyType = async (req, res) => {
    try {
        const propertyType = await PropertyType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!propertyType) return res.status(404).json({ error: "Property type not found" });
        res.json(propertyType);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "A property type with this name already exists." });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.deletePropertyType = async (req, res) => {
    try {
        const propertyType = await PropertyType.findByIdAndDelete(req.params.id);
        if (!propertyType) return res.status(404).json({ error: "Property type not found" });
        res.json({ message: "Property type deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
