// routes/websiteSettingRoutes.js
const express = require('express');
const router = express.Router();
const websiteSettingController = require('../controllers/websiteSettingController');

// Create a new website setting
router.post('/create-website-setting', websiteSettingController.createWebsiteSetting);
// Get all website settings
router.get('/fetch-all-website-setting', websiteSettingController.getWebsiteSettings);
// Get a website setting by ID
router.get('/fetch-website-setting-by-id/:id', websiteSettingController.getWebsiteSettingById);
// Update a website setting
router.put('/update-website-setting-by-id/:id', websiteSettingController.updateWebsiteSetting);
// Delete a website setting
router.delete('/delete-website-setting-by-id/:id', websiteSettingController.deleteWebsiteSetting);

module.exports = router;
