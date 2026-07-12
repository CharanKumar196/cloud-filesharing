const express = require('express');
const router = express.Router();
const {
  createFolder,
  getUserFolders,
  getFolderFiles,
  updateFolder,
  deleteFolder,
  renameFolder
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

// Create folder
router.post('/', protect, createFolder);

// Get all folders for user
router.get('/', protect, getUserFolders);

// Get files inside a folder
router.get('/:id/files', protect, getFolderFiles);

// Rename folder
router.put('/:id/rename', protect, renameFolder);

// Update folder
router.put('/:id', protect, updateFolder);

// Delete folder
router.delete('/:id', protect, deleteFolder);

module.exports = router;