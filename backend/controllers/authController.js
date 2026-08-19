const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail, sendAccountLockedEmail, sendVerificationEmail, sendLoginNotificationEmail } = require('../services/emailService'); 
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 20;
 
// ============================================
// REGISTER
// @route   POST /api/auth/register
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
 
    // Check if user exists in Supabase
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
 
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
 
    // Insert user into Supabase
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        full_name: fullName,
        email: email,
        password: hashedPassword,
        username: email.split('@')[0]
      }])
      .select('id, full_name, email')
      .single();
 
    if (error) throw error;
 
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
 
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { 
        id: newUser.id, 
        fullName: newUser.full_name,
        email: newUser.email 
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
 
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
 
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
 
    const now = new Date();
 
    // 1. Check if account is currently locked
    if (user.locked_until && new Date(user.locked_until) > now) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - now) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked due to multiple failed attempts. Try again in ${minutesLeft} minute(s).`
      });
    }
 
    // 2. If lock expired, reset counter before continuing
    if (user.locked_until && new Date(user.locked_until) <= now) {
      await supabase
        .from('users')
        .update({ failed_login_attempts: 0, locked_until: null })
        .eq('id', user.id);
      user.failed_login_attempts = 0;
    }
 
    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
 
    if (!isMatch) {
      const newAttempts = (user.failed_login_attempts || 0) + 1;
 
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(now.getTime() + LOCK_MINUTES * 60000).toISOString();
 
        await supabase
          .from('users')
          .update({ failed_login_attempts: newAttempts, locked_until: lockUntil })
          .eq('id', user.id);
 
        sendAccountLockedEmail(user.email, LOCK_MINUTES); // fire-and-forget
 
        return res.status(423).json({
          success: false,
          message: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes. Check your email.`
        });
      }
 
      await supabase
        .from('users')
        .update({ failed_login_attempts: newAttempts })
        .eq('id', user.id);
 
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`
      });
    }
 
    // 4. Success — reset counters
    // 4. Success — reset counters
    await supabase
      .from('users')
      .update({ failed_login_attempts: 0, locked_until: null })
      .eq('id', user.id);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Send login notification email (fire-and-forget)
    sendLoginNotificationEmail(user.email, user.full_name, {
      timestamp: new Date().toLocaleString(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
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
// ============================================
exports.getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, username, phone, bio, storage_used, storage_limit')
      .eq('id', req.user.id)
      .single();
 
    if (error) throw error;
 
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

    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

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

    await sendVerificationEmail(email, verificationCode);
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
// VERIFY CODE
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
// ============================================
// ============================================
// FORGOT PASSWORD
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

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 300000).toISOString();

    await supabase
      .from('users')
      .update({
        reset_code: resetCode,
        reset_code_expiry: expiryDate
      })
      .eq('id', user.id);

    await sendPasswordResetEmail(email, resetCode);

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
 
    const { data: user } = await supabase
      .from('users')
      .select('reset_code, reset_code_expiry')
      .eq('email', email)
      .maybeSingle();
 
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
 
    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }
 
    if (new Date() > new Date(user.reset_code_expiry)) {
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
 
    const { data: user } = await supabase
      .from('users')
      .select('id, reset_code, reset_code_expiry')
      .eq('email', email)
      .maybeSingle();
 
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
 
    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset code' 
      });
    }
 
    if (new Date() > new Date(user.reset_code_expiry)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset code has expired. Please request a new one' 
      });
    }
 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
 
    await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_code: null,
        reset_code_expiry: null
      })
      .eq('id', user.id);
 
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
 
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, full_name, email, phone, bio')
      .single();
 
    if (error) throw error;
 
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
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

    const { data: user } = await supabase
      .from('users')
      .select('password, password_updated_at')
      .eq('id', id)
      .single();

    // Enforce 3-day cooldown between password changes
    const COOLDOWN_DAYS = 3;
    if (user.password_updated_at) {
      const lastChanged = new Date(user.password_updated_at);
      const now = new Date();
      const daysSinceChange = (now - lastChanged) / (1000 * 60 * 60 * 24);

      if (daysSinceChange < COOLDOWN_DAYS) {
        const daysLeft = Math.ceil(COOLDOWN_DAYS - daysSinceChange);
        return res.status(429).json({
          success: false,
          message: `You can only change your password once every ${COOLDOWN_DAYS} days. Please try again in ${daysLeft} day(s).`
        });
      }
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        password_updated_at: new Date().toISOString()
      })
      .eq('id', id);

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
// ============================================
// CREATE FEEDBACK
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
 
    const { data: user } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', userId)
      .single();
 
    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert([{
        user_id: userId,
        user_name: user ? user.full_name : '',
        user_email: user ? user.email : '',
        subject,
        message,
        rating
      }])
      .select()
      .single();
 
    if (error) throw error;
 
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
// ============================================
exports.getAllFeedback = async (req, res) => {
  try {
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
 
    if (error) throw error;
 
    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      feedback,
      total: feedback ? feedback.length : 0
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
// ============================================
exports.getUserFeedback = async (req, res) => {
  try {
    const { id: userId } = req.user;
 
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
 
    if (error) throw error;
 
    res.status(200).json({
      success: true,
      message: 'User feedback retrieved successfully',
      feedback,
      total: feedback ? feedback.length : 0
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
// SET PRIVATE PIN
// ============================================
exports.setPrivatePin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'PIN must be at least 4 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    await supabase
      .from('users')
      .update({ private_pin: hashedPin })
      .eq('id', req.user.id);

    res.status(200).json({ success: true, message: 'Private PIN set successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// VERIFY PRIVATE PIN
// ============================================
exports.verifyPrivatePin = async (req, res) => {
  try {
    const { pin } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('private_pin')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.private_pin) {
      return res.status(400).json({ success: false, message: 'No private PIN set yet' });
    }

    const isMatch = await bcrypt.compare(pin, user.private_pin);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect PIN' });
    }

    res.status(200).json({ success: true, message: 'PIN verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CHECK IF PIN EXISTS
// ============================================
exports.checkPrivatePinExists = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('private_pin')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, hasPin: !!user.private_pin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  getUserFeedback: exports.getUserFeedback,
  setPrivatePin: exports.setPrivatePin,
  verifyPrivatePin: exports.verifyPrivatePin,
  checkPrivatePinExists: exports.checkPrivatePinExists,
};
 






