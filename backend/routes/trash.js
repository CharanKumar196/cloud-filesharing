const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const trashController = require('../controllers/trashController');

// All trash routes require login
router.use(protect);

// Move to trash
router.post('/file/:id', trashController.moveFileToTrash);
router.post('/folder/:id', trashController.moveFolderToTrash);

// List trash
router.get('/', trashController.getTrashItems);

// Restore
router.post('/file/:id/restore', trashController.restoreFileFromTrash);
router.post('/folder/:id/restore', trashController.restoreFolderFromTrash);

// Permanent delete
router.delete('/empty', trashController.emptyTrash);
router.delete('/file/:id', trashController.permanentlyDeleteFile);
router.delete('/folder/:id', trashController.permanentlyDeleteFolder);

module.exports = router;