const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Please provide a filename']
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true
  },
  s3Url: {
    type: String,
    required: false
  },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
    folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
    fileType: {
      type: String,
      enum: ['image', 'document', 'video', 'audio', 'other'],
      default: 'other'
    },
  description: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('File', fileSchema);