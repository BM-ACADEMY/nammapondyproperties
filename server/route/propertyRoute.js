// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// Create a new property
router.post('/create-property', propertyController.createProperty);
// Get all properties
router.get('/fetch-all-property', propertyController.getProperties);
// Get a property by ID
router.get('/fetch-property-by-id/:id', propertyController.getPropertyById);
// Update a property
router.put('/update-property-by-id/:id', propertyController.updateProperty);
// Delete a property
router.delete('/delete-property-by-id/:id', propertyController.deleteProperty);

module.exports = router;
