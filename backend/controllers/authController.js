const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail } = require('../services/emailService');

// ============================================
// REGISTER
// @route   POST /api/auth/register
// @desc    Register a new user
// ============================================
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ 
      fullName, 
      email, 
      password: hashedPassword,
      username: email.split('@')[0]
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id, 
        fullName: user.fullName,
        email: user.email 
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// LOGIN
// @route   POST /api/auth/login
// @desc    Login user and return token
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        fullName: user.fullName,
        email: user.email 
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// GET ME
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// ============================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// SEND VERIFICATION EMAIL
// @route   POST /api/auth/send-verification
// @desc    Send email verification code for signup
// ============================================
exports.sendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (!global.verificationCodes) {
      global.verificationCodes = {};
    }
    
    global.verificationCodes[email] = {
      code: verificationCode,
      expiry: Date.now() + 600000
    };

    console.log(`\n📧 VERIFICATION CODE FOR ${email}: ${verificationCode}\n`);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      email: email
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// VERIFY CODE (for signup)
// @route   POST /api/auth/verify-code
// @desc    Verify the email verification code
// ============================================
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and code are required' 
      });
    }

    if (!global.verificationCodes || !global.verificationCodes[email]) {
      return res.status(400).json({ 
        success: false, 
        message: 'No verification code found for this email' 
      });
    }

    const { code: storedCode, expiry } = global.verificationCodes[email];

    if (storedCode !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }

    if (Date.now() > expiry) {
      delete global.verificationCodes[email];
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Code verified successfully',
      verified: true
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// FORGOT PASSWORD
// @route   POST /api/auth/forgot-password
// @desc    Send password reset code to email
// ============================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetCode = resetCode;
    user.resetCodeExpiry = Date.now() + 300000;
    await user.save();

    console.log(`\n🔐 PASSWORD RESET CODE FOR ${email}: ${resetCode}\n`);

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
      email: email
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// VERIFY RESET CODE
// @route   POST /api/auth/verify-reset-code
// @desc    Verify the reset code is valid
// ============================================
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and code are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }

    if (Date.now() > user.resetCodeExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code has expired. Please request a new one' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Code verified successfully',
      verified: true
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// RESET PASSWORD
// @route   POST /api/auth/reset-password
// @desc    Reset password using reset code
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, code, and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset code' 
      });
    }

    if (Date.now() > user.resetCodeExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset code has expired. Please request a new one' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// LOGOUT
// @route   POST /api/auth/logout
// @desc    Logout user (token invalidation on frontend)
// ============================================
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// EDIT PROFILE
// @route   PUT /api/auth/edit-profile
// @desc    Update user profile information
// ============================================
exports.editProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { fullName, phone, bio } = req.body;

    if (!fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name is required' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { fullName, phone, bio },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};

// ============================================
// CHANGE PASSWORD
// @route   PUT /api/auth/change-password
// @desc    Change user password
// ============================================
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New passwords do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const user = await User.findById(id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error changing password', 
      error: error.message 
    });
  }
};

const Feedback = require('../models/Feedback');

// ============================================
// CREATE FEEDBACK
// @route   POST /api/feedback/create
// @desc    Submit user feedback
// ============================================
exports.createFeedback = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { subject, message, rating } = req.body;

    if (!subject || !message || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject, message, and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    const user = await User.findById(userId);

    const feedback = new Feedback({
      userId,
      userName: user.fullName,
      userEmail: user.email,
      subject,
      message,
      rating
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting feedback', 
      error: error.message 
    });
  }
};

// ============================================
// GET ALL FEEDBACK (Admin)
// @route   GET /api/feedback/all
// @desc    Get all user feedback
// ============================================
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      feedback,
      total: feedback.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching feedback', 
      error: error.message 
    });
  }
};

// ============================================
// GET USER FEEDBACK
// @route   GET /api/feedback/my-feedback
// @desc    Get current user's feedback
// ============================================
exports.getUserFeedback = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const feedback = await Feedback.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'User feedback retrieved successfully',
      feedback,
      total: feedback.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching feedback', 
      error: error.message 
    });
  }
};

module.exports = {
  register: exports.register,
  login: exports.login,
  getMe: exports.getMe,
  sendVerification: exports.sendVerification,
  verifyCode: exports.verifyCode,
  forgotPassword: exports.forgotPassword,
  verifyResetCode: exports.verifyResetCode,
  resetPassword: exports.resetPassword,
  logout: exports.logout,
  editProfile: exports.editProfile,
  changePassword: exports.changePassword,
  createFeedback: exports.createFeedback,
  getAllFeedback: exports.getAllFeedback,
  getUserFeedback: exports.getUserFeedback
};