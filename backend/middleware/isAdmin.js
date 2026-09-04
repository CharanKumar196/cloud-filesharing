/*
  Admin-only route guard. Use AFTER your existing `protect` middleware,
  since it relies on req.user already being set.

  Save as: backend/middleware/isAdmin.js
*/

const supabase = require('../config/supabase');

module.exports = async function isAdmin(req, res, next) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.is_admin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};