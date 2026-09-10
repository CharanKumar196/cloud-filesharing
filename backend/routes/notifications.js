const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  sendNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');

router.post('/send', protect, isAdmin, sendNotification);
router.get('/', protect, getNotifications);
router.post('/:notificationId/read', protect, markAsRead);
router.delete('/:notificationId', protect, isAdmin, deleteNotification);
router.delete('/', protect, isAdmin, deleteAllNotifications);

module.exports = router;