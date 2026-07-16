const express = require('express');
const router = express.Router();
const { 
  uploadFile, 
  getUserFiles, 
  downloadFile, 
  getFileDetails, 
  searchFiles, 
  deleteFile, 
  updateFile,
  getStorageInfo,
  getRecentFiles,
  renameFile,
  archiveFile,
  shareFile,
  moveFileToFolder,
  getPublicFile,
  getPublicFileDownload,
  getArchivedFiles
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

// Get public file details (NO AUTH REQUIRED)
router.get('/public/:fileId', getPublicFile);

// Get public file download (NO AUTH REQUIRED)
router.get('/public/:fileId/download', getPublicFileDownload);

// Upload file
router.post('/upload', protect, uploadFile);

// Get all files
router.get('/', protect, getUserFiles);
router.get('/archived', protect, getArchivedFiles);

// ✅ SPECIFIC ROUTES FIRST (before /:id)
router.get('/recent', protect, getRecentFiles);
router.get('/storage/info', protect, getStorageInfo);
router.get('/search/:query', protect, searchFiles);

// ✅ THEN GENERIC ROUTES (with :id parameter)
router.get('/:id/download', protect, downloadFile);
router.get('/:id', protect, getFileDetails);

// Rename file
router.put('/:id/rename', protect, renameFile);

// Archive/Unarchive file
router.put('/:id/archive', protect, archiveFile);

// Share file
router.post('/:id/share', protect, shareFile);

// Move file to folder
router.put('/:id/move', protect, moveFileToFolder);

// Delete file
router.delete('/:id', protect, deleteFile);

// Update file
router.put('/:id', protect, updateFile);

module.exports = router;