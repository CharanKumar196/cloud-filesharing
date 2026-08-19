const express = require('express');
const router = express.Router();
const {
  createFolder,
  getUserFolders,
  getFolderFiles,
  updateFolder,
  deleteFolder,
  renameFolder,
  moveFolderToPrivate,
  removeFolderFromPrivate,
  getPrivateFolders,
  shareFolder,
  archiveFolder,
  getArchivedFolders,
  moveFolderToFolder
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

// Create folder
router.post('/', protect, createFolder);

// Get all folders for user
router.get('/', protect, getUserFolders);

// Get private folders (must be before /:id routes)
router.get('/private', protect, getPrivateFolders);

// Get archived folders (must be before /:id routes)
router.get('/archived', protect, getArchivedFolders);

// Get files inside a folder
router.get('/:id/files', protect, getFolderFiles);

// Move folder to/from Private
router.put('/:id/move-to-private', protect, moveFolderToPrivate);
router.put('/:id/remove-from-private', protect, removeFolderFromPrivate);

// Share folder
router.post('/:id/share', protect, shareFolder);

// Archive/Unarchive folder
router.put('/:id/archive', protect, archiveFolder);

// Move folder into another folder
router.put('/:id/move', protect, moveFolderToFolder);

// Rename folder
router.put('/:id/rename', protect, renameFolder);

// Update folder
router.put('/:id', protect, updateFolder);

// Delete folder
router.delete('/:id', protect, deleteFolder);

module.exports = router;