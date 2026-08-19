const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES
// ============================================

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-verification', authController.sendVerification);
router.post('/verify-code', authController.verifyCode);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);

// ============================================
// PROTECTED ROUTES
// ============================================

router.put('/edit-profile', protect, authController.editProfile);
router.put('/change-password', protect, authController.changePassword);
router.get('/me', protect, authController.getMe);
// Private PIN routes
router.post('/set-private-pin', protect, authController.setPrivatePin);
router.post('/verify-private-pin', protect, authController.verifyPrivatePin);
router.get('/check-private-pin', protect, authController.checkPrivatePinExists);

module.exports = router;