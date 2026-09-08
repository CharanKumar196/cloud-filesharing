const supabase = require('../config/supabase');

// @desc    Admin sends a broadcast notification to all users
// @route   POST /api/notifications/send
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: title.trim(),
        message: message.trim(),
        type: type || 'info',
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, notification: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notifications with read status for the logged-in user
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const { data: reads } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', req.user.id);

    const readIds = new Set((reads || []).map(r => r.notification_id));
    const withReadStatus = notifications.map(n => ({
      ...n,
      isRead: readIds.has(n.id)
    }));

    res.json({ success: true, notifications: withReadStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a notification as read for the logged-in user
// @route   POST /api/notifications/:notificationId/read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { error } = await supabase
      .from('notification_reads')
      .upsert({ notification_id: notificationId, user_id: req.user.id });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};