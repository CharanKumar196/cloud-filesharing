/*
  Save as: backend/routes/admin.js
  Mount in your main server file:
      app.use('/api/admin', require('./routes/admin'));
*/

const express = require('express');
const router = express.Router();
const {
  checkAdmin,
  getOverview,
  getFeedbackList,
  markFeedbackReviewed,
  getPlatformTrash,
  getPurgeLog,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Every route below requires: logged in (protect) AND is_admin = true (isAdmin)
router.use(protect, isAdmin);

router.get('/me', checkAdmin);
router.get('/overview', getOverview);

router.get('/feedback', getFeedbackList);
router.put('/feedback/:id/review', markFeedbackReviewed);

router.get('/trash', getPlatformTrash);
router.get('/trash/purge-log', getPurgeLog);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;