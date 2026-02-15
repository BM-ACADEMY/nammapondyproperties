
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Auth Routes
router.post('/register', userController.createUser); // Alias for consistency
router.post('/create-user', userController.createUser); // Legacy support
router.post('/login', userController.login);
router.get('/me', protect, userController.getMe);
router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);
router.post('/reset-password', userController.resetPassword);

// User Management Routes (Protected)
router.get('/fetch-all-user', protect, userController.getUsers); // Legacy support
router.get('/get-all-users', protect, userController.getUsers);

router.get('/fetch-user-by-id/:id', protect, userController.getUserById); // Legacy support
router.get('/get-user-by-id/:id', protect, userController.getUserById);

router.put('/update-user-by-id/:id', protect, upload.single('profile_image'), userController.updateUser);

router.delete('/delete-user-by-id/:id', protect, userController.deleteUser);

// Admin Routes
router.post('/create-user-by-admin', protect, userController.createUserByAdmin);

module.exports = router;
