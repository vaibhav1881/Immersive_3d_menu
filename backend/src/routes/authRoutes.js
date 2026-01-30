const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect, validateRegister, validateLogin } = require('../middleware');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/password', protect, authController.changePassword);
router.post('/otp/request', protect, authController.requestOTP);
router.post('/otp/verify', protect, authController.verifyOTP);
router.post('/logout', protect, authController.logout);

module.exports = router;
