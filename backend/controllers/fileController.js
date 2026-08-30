const supabase = require('../config/supabase');
const { uploadFile, getDownloadUrl, deleteFile: deleteFromS3 } = require('../services/s3Service');

// @route   POST /api/files/upload
// @desc    Upload a file to S3
exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileObj = req.files.file;

    // NEW: read folderId sent from the frontend (may be undefined/empty for root uploads)
    const folderId = (req.body && req.body.folderId) || null;

    // If a folderId was sent, verify the user actually owns that folder
    // before saving the file into it (same check your moveFileToFolder route does).
    if (folderId) {
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .maybeSingle();

      if (folderError || !folder) {
        return res.status(404).json({ success: false, message: 'Folder not found' });
      }
      if (folder.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to upload to this folder' });
      }
    }

    // Fetch user storage info from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('storage_used, storage_limit')
      .eq('id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check storage limit
    if (user.storage_used + fileObj.size > user.storage_limit) {
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

    // Save file metadata to Supabase — NOW includes folder_id
    const { data: newFile, error: fileError } = await supabase
      .from('files')
      .insert([{
        user_id: req.user.id,
        filename: fileObj.name,
        original_name: fileObj.name,
        size: fileObj.size,
        mime_type: fileObj.mimetype,
        s3_key: s3Key,
        folder_id: folderId,          // <-- the actual fix
        uploaded_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (fileError) throw fileError;

    // Update user storage in Supabase
    await supabase
      .from('users')
      .update({ storage_used: user.storage_used + fileObj.size })
      .eq('id', req.user.id);

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
exports.getUserFiles = async (req, res) => {
  try {
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', req.user.id)
      .is('folder_id', null)
      .eq('is_archived', false)
      .eq('is_private', false)
      .is('deleted_at', null)          // ADD THIS LINE
      .order('uploaded_at', { ascending: false });
  
    if (error) throw error;

    res.status(200).json({
      success: true,
      count: files.length,
      files: files.map(f => ({
        _id: f.id,
        filename: f.filename,
        fileSize: f.size,
        uploadDate: f.uploaded_at,
        isPublic: f.is_public,
        isArchived: f.is_archived || false,
        mimeType: f.mime_type
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
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file or it's public
    if (file.user_id !== req.user.id && !file.is_public) {
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
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file or it's public
    if (file.user_id !== req.user.id && !file.is_public) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get signed URL from S3
    const downloadUrl = await getDownloadUrl(file.s3_key);

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

    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', req.user.id)
      .ilike('filename', `%${query}%`);

    if (error) throw error;

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
    const { data: user } = await supabase
      .from('users')
      .select('storage_limit')
      .eq('id', req.user.id)
      .single();

    const { data: files } = await supabase
      .from('files')
      .select('size')
      .eq('user_id', req.user.id);

    let totalSize = 0;
    if (files) {
      files.forEach(file => {
        totalSize += Number(file.size);
      });
    }

    const storageLimit = user ? user.storage_limit : 0;
    const storageUsed = totalSize;
    const storageRemaining = storageLimit - storageUsed;
    const percentageUsed = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

    res.status(200).json({
      success: true,
      storageUsed,
      storageLimit,
      storageRemaining,
      percentageUsed: percentageUsed.toFixed(2),
      fileCount: files ? files.length : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files/recent
// @desc    Get recent files
exports.getRecentFiles = async (req, res) => {
  try {
    const { data: files, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', req.user.id)
    .is('folder_id', null)
    .eq('is_private', false)
    .is('deleted_at', null)          // ADD THIS LINE
    .order('uploaded_at', { ascending: false })
    .limit(10);

    if (error) throw error;

    res.status(200).json({
      success: true,
      files: files.map(f => ({
        _id: f.id,
        filename: f.filename,
        fileSize: f.size,
        uploadDate: f.uploaded_at,
        isPublic: f.is_public,
        isArchived: f.is_archived || false,
        mimeType: f.mime_type
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
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }

    // Delete from AWS S3
    await deleteFromS3(file.s3_key);

    // Delete from Supabase
    await supabase
      .from('files')
      .delete()
      .eq('id', req.params.id);

    // Update user storage
    const { data: user } = await supabase
      .from('users')
      .select('storage_used')
      .eq('id', req.user.id)
      .single();

    if (user) {
      const newStorageUsed = Math.max(0, user.storage_used - file.size);
      await supabase
        .from('users')
        .update({ storage_used: newStorageUsed })
        .eq('id', req.user.id);
    }

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
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { filename, description, isPublic } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (filename !== undefined) updates.filename = filename;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.is_public = isPublic;

    const { data: updatedFile, error: updateError } = await supabase
      .from('files')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'File updated successfully',
      file: updatedFile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/files/:id/rename
// @desc    Rename a file
exports.renameFile = async (req, res) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to rename' });
    }

    const { newFileName } = req.body;

    if (!newFileName || newFileName.trim() === '') {
      return res.status(400).json({ success: false, message: 'New filename cannot be empty' });
    }

    const { data: updatedFile, error: updateError } = await supabase
      .from('files')
      .update({
        filename: newFileName,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'File renamed successfully',
      file: {
        _id: updatedFile.id,
        filename: updatedFile.filename,
        fileSize: updatedFile.size,
        uploadDate: updatedFile.uploaded_at,
        isPublic: updatedFile.is_public,
        isArchived: updatedFile.is_archived || false
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
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to archive' });
    }

    const { isArchived } = req.body;

    if (isArchived === undefined) {
      return res.status(400).json({ success: false, message: 'isArchived field is required' });
    }

    const { data: updatedFile, error: updateError } = await supabase
      .from('files')
      .update({
        is_archived: isArchived,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: isArchived ? 'File archived successfully' : 'File unarchived successfully',
      file: {
        _id: updatedFile.id,
        filename: updatedFile.filename,
        fileSize: updatedFile.size,
        uploadDate: updatedFile.uploaded_at,
        isPublic: updatedFile.is_public,
        isArchived: updatedFile.is_archived || false
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
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to share' });
    }

    // Make file public in Supabase
    const { data: updatedFile, error: updateError } = await supabase
      .from('files')
      .update({
        is_public: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${updatedFile.id}`;

    res.status(200).json({
      success: true,
      message: 'File shared successfully',
      shareLink,
      file: {
        _id: updatedFile.id,
        filename: updatedFile.filename,
        fileSize: updatedFile.size,
        uploadDate: updatedFile.uploaded_at,
        isPublic: updatedFile.is_public,
        isArchived: updatedFile.is_archived || false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/files/:id/move-to-private
exports.moveFileToPrivate = async (req, res) => {
  try {
    const { data: file, error: fetchErr } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { data: updatedFile, error: updateErr } = await supabase
      .from('files')
      .update({ is_private: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({ success: true, message: 'File moved to Private', file: updatedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/files/:id/remove-from-private
exports.removeFileFromPrivate = async (req, res) => {
  try {
    const { data: file, error: fetchErr } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { data: updatedFile, error: updateErr } = await supabase
      .from('files')
      .update({ is_private: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({ success: true, message: 'File removed from Private', file: updatedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/files/private
exports.getPrivateFiles = async (req, res) => {
  try {
    const { data: files, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('is_private', true)
    .is('deleted_at', null)          // ADD THIS LINE
    .order('uploaded_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: files.length,
      files: files.map(f => ({
        _id: f.id,
        filename: f.filename,
        fileSize: f.size,
        uploadDate: f.uploaded_at,
        isPublic: f.is_public,
        isArchived: f.is_archived || false,
        mimeType: f.mime_type
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @route   PUT /api/files/:id/move
// @desc    Move a file to a folder
exports.moveFileToFolder = async (req, res) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user owns file
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { folderId } = req.body;

    // If folderId is provided, verify user owns the folder
    if (folderId) {
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .maybeSingle();
      
      if (folderError || !folder) {
        return res.status(404).json({ success: false, message: 'Folder not found' });
      }

      if (folder.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to move to this folder' });
      }
    }

    const { data: updatedFile, error: updateError } = await supabase
      .from('files')
      .update({
        folder_id: folderId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'File moved successfully',
      file: {
        _id: updatedFile.id,
        filename: updatedFile.filename,
        fileSize: updatedFile.size,
        uploadDate: updatedFile.uploaded_at,
        isPublic: updatedFile.is_public,
        isArchived: updatedFile.is_archived || false,
        folderId: updatedFile.folder_id
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
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.fileId)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if file is public
    if (!file.is_public) {
      return res.status(403).json({ success: false, message: 'This file is not shared' });
    }

    res.status(200).json({
      success: true,
      file: {
        _id: file.id,
        filename: file.filename,
        fileSize: file.size,
        uploadDate: file.uploaded_at,
        mimeType: file.mime_type,
        isPublic: file.is_public
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
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.fileId)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if file is public
    if (!file.is_public) {
      return res.status(403).json({ success: false, message: 'This file is not shared' });
    }

    // Get signed URL from S3
    const downloadUrl = await getDownloadUrl(file.s3_key);

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
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_archived', true)
      .eq('is_private', false)
      .is('deleted_at', null)          // ADD THIS LINE
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: files.length,
      files: files.map(f => ({
        _id: f.id,
        filename: f.filename,
        fileSize: f.size,
        uploadDate: f.uploaded_at,
        isPublic: f.is_public,
        isArchived: f.is_archived || false,
        mimeType: f.mime_type
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};