const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Protected routes
router.post('/create', protect, authController.createFeedback);
router.get('/my-feedback', protect, authController.getUserFeedback);
router.get('/all', protect, authController.getAllFeedback);

module.exports = router;