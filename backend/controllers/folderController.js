const Folder = require('../models/Folder');
const File = require('../models/File');
const User = require('../models/User');

// @route   POST /api/folders
// @desc    Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    const newFolder = new Folder({
      name,
      userId: req.user.id,
      description: description || '',
      color: color || '#4A90E2'
    });

    await newFolder.save();

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder: {
        _id: newFolder._id,
        name: newFolder.name,
        description: newFolder.description,
        color: newFolder.color,
        createdAt: newFolder.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/folders
// @desc    Get all folders for logged in user
exports.getUserFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: folders.length,
      folders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/folders/:id/files
// @desc    Get files inside a folder
exports.getFolderFiles = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Check if user owns folder
    if (folder.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const files = await File.find({ folderId: req.params.id, userId: req.user.id })
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

// @route   PUT /api/folders/:id
// @desc    Update folder (name, description, color)
exports.updateFolder = async (req, res) => {
  try {
    let folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Check if user owns folder
    if (folder.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { name, description, color } = req.body;

    if (name) folder.name = name;
    if (description !== undefined) folder.description = description;
    if (color) folder.color = color;
    folder.updatedAt = Date.now();

    await folder.save();

    res.status(200).json({
      success: true,
      message: 'Folder updated successfully',
      folder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/folders/:id
// @desc    Delete a folder and all files inside it
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Check if user owns folder
    if (folder.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }

    // Get all files in this folder
    const files = await File.find({ folderId: req.params.id });

    // Delete files from S3 and database
    const { deleteFile: deleteFromS3 } = require('../services/s3Service');
    for (let file of files) {
      await deleteFromS3(file.s3Key);
      await File.findByIdAndDelete(file._id);

      // Update user storage
      const user = await User.findById(req.user.id);
      user.storageUsed = Math.max(0, user.storageUsed - file.size);
      await user.save();
    }

    // Delete the folder
    await Folder.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/folders/:id/rename
// @desc    Rename a folder
exports.renameFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Check if user owns folder
    if (folder.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { newName } = req.body;

    if (!newName || newName.trim() === '') {
      return res.status(400).json({ success: false, message: 'New folder name cannot be empty' });
    }

    folder.name = newName;
    folder.updatedAt = Date.now();
    await folder.save();

    res.status(200).json({
      success: true,
      message: 'Folder renamed successfully',
      folder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};