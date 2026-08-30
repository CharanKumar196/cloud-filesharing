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
// @desc    Get all folders for logged in user (excludes private)
exports.getUserFolders = async (req, res) => {
  try {
    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_private', false)
      .eq('is_archived', false)
      .is('parent_folder_id', null)
      .is('deleted_at', null)
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
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    if (fileErr) throw fileErr;

    // Get subfolders inside the folder
    const { data: subfolders, error: subfolderErr } = await supabase
      .from('folders')
      .select('*')
      .eq('parent_folder_id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('is_private', false)
      .eq('is_archived', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (subfolderErr) throw subfolderErr;

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
      })),
      folders: subfolders.map(f => ({
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

    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', req.params.id);

    if (files && files.length > 0) {
      const { deleteFile: deleteFromS3 } = require('../services/s3Service');
      let totalSizeFreed = 0;

      for (let file of files) {
        if (file.s3_key) {
          await deleteFromS3(file.s3_key);
        }
        totalSizeFreed += file.size || 0;
      }

      await supabase.from('files').delete().eq('folder_id', req.params.id);

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

// @route   PUT /api/folders/:id/move-to-private
// @desc    Move a folder to Private section
exports.moveFolderToPrivate = async (req, res) => {
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

    const { data: updatedFolder, error: updateErr } = await supabase
      .from('folders')
      .update({ is_private: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({ success: true, message: 'Folder moved to Private', folder: updatedFolder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/folders/:id/remove-from-private
// @desc    Move a folder out of Private section
exports.removeFolderFromPrivate = async (req, res) => {
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

    const { data: updatedFolder, error: updateErr } = await supabase
      .from('folders')
      .update({ is_private: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({ success: true, message: 'Folder removed from Private', folder: updatedFolder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/folders/:id/share
// @desc    Generate a share link for a folder
exports.shareFolder = async (req, res) => {
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
      return res.status(403).json({ success: false, message: 'Not authorized to share' });
    }

    const { data: updatedFolder, error: updateErr } = await supabase
      .from('folders')
      .update({ is_public: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared-folder/${updatedFolder.id}`;

    res.status(200).json({
      success: true,
      message: 'Folder shared successfully',
      shareLink,
      folder: updatedFolder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/folders/:id/archive
// @desc    Archive or unarchive a folder
exports.archiveFolder = async (req, res) => {
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
      return res.status(403).json({ success: false, message: 'Not authorized to archive' });
    }

    const { isArchived } = req.body;

    if (isArchived === undefined) {
      return res.status(400).json({ success: false, message: 'isArchived field is required' });
    }

    const { data: updatedFolder, error: updateErr } = await supabase
      .from('folders')
      .update({ is_archived: isArchived })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: isArchived ? 'Folder archived successfully' : 'Folder unarchived successfully',
      folder: updatedFolder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/folders/archived
// @desc    Get archived folders for logged in user
exports.getArchivedFolders = async (req, res) => {
  try {
    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_archived', true)
      .is('deleted_at', null)
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

// @route   PUT /api/folders/:id/move
// @desc    Move a folder into another folder (nested folders)
exports.moveFolderToFolder = async (req, res) => {
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

    const { parentFolderId } = req.body;

    if (parentFolderId === req.params.id) {
      return res.status(400).json({ success: false, message: 'A folder cannot be moved into itself' });
    }

    if (parentFolderId) {
      const { data: targetFolder, error: targetErr } = await supabase
        .from('folders')
        .select('*')
        .eq('id', parentFolderId)
        .maybeSingle();

      if (targetErr || !targetFolder) {
        return res.status(404).json({ success: false, message: 'Target folder not found' });
      }
      if (targetFolder.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to move into this folder' });
      }
    }

    const { data: updatedFolder, error: updateErr } = await supabase
      .from('folders')
      .update({ parent_folder_id: parentFolderId || null })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: 'Folder moved successfully',
      folder: updatedFolder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/folders/private
// @desc    Get all private folders for logged in user
exports.getPrivateFolders = async (req, res) => {
  try {
    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_private', true)
      .is('deleted_at', null)
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