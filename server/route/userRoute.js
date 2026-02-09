// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create a new user
router.post('/create-user', userController.createUser);
// Get all users
router.get('/fetch-all-user', userController.getUsers);
// Get a user by ID
router.get('/fetch-user-by-id/:id', userController.getUserById);
// Update a user
router.put('/update-user-by-id/:id', userController.updateUser);
// Delete a user
router.delete('/delete-user-by-id/:id', userController.deleteUser);
// Send OTP for email verification/login
router.post('/send-otp', userController.sendOtp);
// Verify OTP
router.post('/verify-otp', userController.verifyOtp);
// Login with email and OTP (after verification)
router.post('/login', userController.login);

module.exports = router;
