const File = require('../models/File');
const User = require('../models/User');
const { uploadFile, getDownloadUrl, deleteFile: deleteFromS3 } = require('../services/s3Service');

// @route   POST /api/files/upload
// @desc    Upload a file to S3
exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileObj = req.files.file;
    const user = await User.findById(req.user.id);

    // Check storage limit
    if (user.storageUsed + fileObj.size > user.storageLimit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Storage limit exceeded' 
      });
    }

    // Create S3 key: userId/filename-timestamp
    const timestamp = Date.now();
    const s3Key = `${req.user.id}/${timestamp}-${fileObj.name}`;

    // Upload to S3
    await uploadFile(s3Key, fileObj.data, fileObj.mimetype);

    // Save file metadata to MongoDB
   const newFile = new File({
  userId: req.user.id,
  filename: fileObj.name,
  originalName: fileObj.name,
  size: fileObj.size,
  mimeType: fileObj.mimetype,
  s3Key: s3Key,
  uploadedAt: Date.now()
});

    await newFile.save();

    // Update user storage
    user.storageUsed += fileObj.size;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: newFile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files
// @desc    Get all files for logged in user
// @route   GET /api/files
// @desc    Get all files for logged in user
exports.getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id, folderId: null, isArchived: false })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      files: files.map(f => ({
        _id: f._id,
        filename: f.filename,
        fileSize: f.size,
        uploadDate: f.uploadedAt,
        isPublic: f.isPublic,
        isArchived: f.isArchived || false,
        mimeType: f.mimeType
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files/:id
// @desc    Get single file details
exports.getFileDetails = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file or it's public
    if (file.userId.toString() !== req.user.id && !file.isPublic) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      file
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files/:id/download
// @desc    Get signed download URL for file
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file or it's public
    if (file.userId.toString() !== req.user.id && !file.isPublic) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get signed URL from S3
    const downloadUrl = await getDownloadUrl(file.s3Key);

    res.status(200).json({
      success: true,
      downloadUrl,
      filename: file.filename
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files/search/:query
// @desc    Search files by name
exports.searchFiles = async (req, res) => {
  try {
    const { query } = req.params;

    const files = await File.find({
      userId: req.user.id,
      filename: { $regex: query, $options: 'i' }
    });

    res.status(200).json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/user/storage
// @desc    Get user storage information
exports.getStorageInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const files = await File.find({ userId: req.user.id });

    let totalSize = 0;
    files.forEach(file => {
      totalSize += file.size;
    });

    const storageLimit = user.storageLimit;
    const storageUsed = totalSize;
    const storageRemaining = storageLimit - storageUsed;
    const percentageUsed = (storageUsed / storageLimit) * 100;

    res.status(200).json({
      success: true,
      storageUsed,  // ← Top level
      storageLimit,  // ← Top level
      storageRemaining,
      percentageUsed: percentageUsed.toFixed(2),
      fileCount: files.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files/recent
// @desc    Get recent files
exports.getRecentFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id, folderId: null })
      .sort({ uploadedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      files: files.map(f => ({
        _id: f._id,
        filename: f.filename,
        fileSize: f.size,  // ← Map size to fileSize
        uploadDate: f.uploadedAt,  // ← Map uploadedAt to uploadDate
        isPublic: f.isPublic,
        isArchived: f.isArchived || false,
        mimeType: f.mimeType
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/files/:id
// @desc    Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }

    // Delete from AWS S3
    await deleteFromS3(file.s3Key);

    // Delete from MongoDB
    await File.findByIdAndDelete(req.params.id);

    // Update user storage
    const user = await User.findById(req.user.id);
    user.storageUsed = Math.max(0, user.storageUsed - file.size);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/files/:id
// @desc    Update file details (rename, description, etc)
exports.updateFile = async (req, res) => {
  try {
    let file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { filename, description, isPublic } = req.body;

    if (filename) file.filename = filename;
    if (description) file.description = description;
    if (isPublic !== undefined) file.isPublic = isPublic;
    file.updatedAt = Date.now();

    await file.save();

    res.status(200).json({
      success: true,
      message: 'File updated successfully',
      file
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/files/:id/rename
// @desc    Rename a file
exports.renameFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to rename' });
    }

    const { newFileName } = req.body;

    if (!newFileName || newFileName.trim() === '') {
      return res.status(400).json({ success: false, message: 'New filename cannot be empty' });
    }

    file.filename = newFileName;
    file.updatedAt = Date.now();
    await file.save();

    res.status(200).json({
      success: true,
      message: 'File renamed successfully',
      file: {
        _id: file._id,
        filename: file.filename,
        fileSize: file.size,
        uploadDate: file.uploadedAt,
        isPublic: file.isPublic,
        isArchived: file.isArchived || false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/files/:id/archive
// @desc    Archive or unarchive a file
exports.archiveFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to archive' });
    }

    const { isArchived } = req.body;

    if (isArchived === undefined) {
      return res.status(400).json({ success: false, message: 'isArchived field is required' });
    }

    file.isArchived = isArchived;
    file.updatedAt = Date.now();
    await file.save();

    res.status(200).json({
      success: true,
      message: isArchived ? 'File archived successfully' : 'File unarchived successfully',
      file: {
        _id: file._id,
        filename: file.filename,
        fileSize: file.size,
        uploadDate: file.uploadedAt,
        isPublic: file.isPublic,
        isArchived: file.isArchived || false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/files/:id/share
// @desc    Generate a share link for a file
exports.shareFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to share' });
    }

    // Make file public
    file.isPublic = true;
    file.updatedAt = Date.now();
    await file.save();

    // Generate share link (frontend can use this ID to create the full URL)
    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${file._id}`;

    res.status(200).json({
      success: true,
      message: 'File shared successfully',
      shareLink,
      file: {
        _id: file._id,
        filename: file.filename,
        fileSize: file.size,
        uploadDate: file.uploadedAt,
        isPublic: file.isPublic,
        isArchived: file.isArchived || false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/files/:id/move
// @desc    Move a file to a folder
exports.moveFileToFolder = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { folderId } = req.body;

    // If folderId is provided, verify user owns the folder
    if (folderId) {
      const Folder = require('../models/Folder');
      const folder = await Folder.findById(folderId);
      
      if (!folder) {
        return res.status(404).json({ success: false, message: 'Folder not found' });
      }

      if (folder.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to move to this folder' });
      }
    }

    file.folderId = folderId || null; // null means root level
    file.updatedAt = Date.now();
    await file.save();

    res.status(200).json({
      success: true,
      message: 'File moved successfully',
      file: {
        _id: file._id,
        filename: file.filename,
        fileSize: file.size,
        uploadDate: file.uploadedAt,
        isPublic: file.isPublic,
        isArchived: file.isArchived || false,
        folderId: file.folderId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files/public/:fileId
// @desc    Get public file details (no auth required)
exports.getPublicFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if file is public
    if (!file.isPublic) {
      return res.status(403).json({ success: false, message: 'This file is not shared' });
    }

    res.status(200).json({
      success: true,
      file: {
        _id: file._id,
        filename: file.filename,
        fileSize: file.size,
        uploadDate: file.uploadedAt,
        mimeType: file.mimeType,
        isPublic: file.isPublic
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files/public/:fileId/download
// @desc    Download a public/shared file (no auth required)
exports.getPublicFileDownload = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if file is public
    if (!file.isPublic) {
      return res.status(403).json({ success: false, message: 'This file is not shared' });
    }

    // Get signed URL from S3
    const downloadUrl = await getDownloadUrl(file.s3Key);

    res.status(200).json({
      success: true,
      downloadUrl,
      filename: file.filename
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @route   GET /api/files/archived
// @desc    Get archived files for logged in user
exports.getArchivedFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id, isArchived: true })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      files: files.map(f => ({
        _id: f._id,
        filename: f.filename,
        fileSize: f.size,
        uploadDate: f.uploadedAt,
        isPublic: f.isPublic,
        isArchived: f.isArchived || false,
        mimeType: f.mimeType
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};