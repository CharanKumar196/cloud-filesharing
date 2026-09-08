const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  sendNotification,
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');

router.post('/send', protect, isAdmin, sendNotification); // admin only
router.get('/', protect, getNotifications);                // any logged-in user
router.post('/:notificationId/read', protect, markAsRead); // any logged-in user

module.exports = router;