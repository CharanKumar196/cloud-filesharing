const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a folder name']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folderId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Folder',
  default: null // null means file is at root level
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#4A90E2' // Default blue color
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Folder', folderSchema);