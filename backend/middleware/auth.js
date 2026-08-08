const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// ============================================
// PROTECT MIDDLEWARE
// @desc    Verify JWT token and attach user to request
// @usage   Use on protected routes
// ============================================
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from Supabase using decoded ID
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, username, phone, bio, storage_used, storage_limit')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};