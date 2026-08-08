const supabase = require('../config/supabase');

// @route   POST /api/folders
// @desc    Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    const { data: newFolder, error } = await supabase
      .from('folders')
      .insert([
        {
          name: name.trim(),
          user_id: req.user.id,
          description: description || '',
          color: color || '#4A90E2'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder: {
        _id: newFolder.id,
        name: newFolder.name,
        description: newFolder.description,
        color: newFolder.color,
        createdAt: newFolder.created_at
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
    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: folders.length,
      folders: folders.map(f => ({
        _id: f.id,
        name: f.name,
        description: f.description,
        color: f.color,
        createdAt: f.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/folders/:id/files
// @desc    Get files inside a folder
exports.getFolderFiles = async (req, res) => {
  try {
    // Check if folder exists and user owns it
    const { data: folder, error: folderErr } = await supabase
      .from('folders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (folderErr || !folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    if (folder.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get files inside the folder
    const { data: files, error: fileErr } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', req.params.id)
      .eq('user_id', req.user.id)
      .order('uploaded_at', { ascending: false });

    if (fileErr) throw fileErr;

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

// @route   PUT /api/folders/:id
// @desc    Update folder (name, description, color)
exports.updateFolder = async (req, res) => {
  try {
    const { data: folder, error: fetchErr } = await supabase
      .from('folders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    if (folder.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { name, description, color } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color) updates.color = color;

    const { data: updatedFolder, error: updateErr } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: 'Folder updated successfully',
      folder: updatedFolder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/folders/:id
// @desc    Delete a folder and all files inside it
exports.deleteFolder = async (req, res) => {
  try {
    const { data: folder, error: fetchErr } = await supabase
      .from('folders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    if (folder.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }

    // Get all files in this folder
    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', req.params.id);

    // Delete files from S3 and database
    if (files && files.length > 0) {
      const { deleteFile: deleteFromS3 } = require('../services/s3Service');
      let totalSizeFreed = 0;

      for (let file of files) {
        if (file.s3_key) {
          await deleteFromS3(file.s3_key);
        }
        totalSizeFreed += file.size || 0;
      }

      // Delete files from Supabase database table
      await supabase.from('files').delete().eq('folder_id', req.params.id);

      // Update user storage
      if (totalSizeFreed > 0) {
        const { data: user } = await supabase
          .from('users')
          .select('storage_used')
          .eq('id', req.user.id)
          .single();

        if (user) {
          const newStorageUsed = Math.max(0, (user.storage_used || 0) - totalSizeFreed);
          await supabase
            .from('users')
            .update({ storage_used: newStorageUsed })
            .eq('id', req.user.id);
        }
      }
    }

    // Delete the folder from database
    const { error: deleteFolderErr } = await supabase
      .from('folders')
      .delete()
      .eq('id', req.params.id);

    if (deleteFolderErr) throw deleteFolderErr;

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
    const { data: folder, error: fetchErr } = await supabase
      .from('folders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    if (folder.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { newName } = req.body;

    if (!newName || newName.trim() === '') {
      return res.status(400).json({ success: false, message: 'New folder name cannot be empty' });
    }

    const { data: updatedFolder, error: renameErr } = await supabase
      .from('folders')
      .update({ name: newName.trim() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (renameErr) throw renameErr;

    res.status(200).json({
      success: true,
      message: 'Folder renamed successfully',
      folder: updatedFolder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};