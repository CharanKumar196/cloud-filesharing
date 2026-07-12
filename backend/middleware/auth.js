const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};