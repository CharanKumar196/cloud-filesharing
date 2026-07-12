const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  fullName: {
  type: String,
  required: false  // ✅ OPTIONAL
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  storageLimit: {
    type: Number,
    default: 5 * 1024 * 1024 * 1024 // 5  u7 GB default
  },
  storageUsed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetCode: {
    type: String,
    default: null
  },
  resetCodeExpiry: {
    type: Date,
    default: null
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);