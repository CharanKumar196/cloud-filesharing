const supabase = require('../config/supabase');
const { deleteFile: deleteFromS3 } = require('../services/s3Service');

// ============================================
// MOVE TO TRASH (soft delete)
// ============================================

// @route   POST /api/trash/file/:id
// @desc    Move a single file to Trash
exports.moveFileToTrash = async (req, res) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { data: updatedFile, error: updateErr } = await supabase
      .from('files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: 'File moved to Trash',
      file: updatedFile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/trash/folder/:id
// @desc    Move a folder (and files directly inside it) to Trash
exports.moveFolderToTrash = async (req, res) => {
  try {
    const { data: folder, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    if (folder.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const now = new Date().toISOString();

    const { data: updatedFolder, error: updateErr } = await supabase
      .from('folders')
      .update({ deleted_at: now })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Soft-delete files directly inside this folder too
    await supabase
      .from('files')
      .update({ deleted_at: now })
      .eq('folder_id', req.params.id)
      .eq('user_id', req.user.id);

    res.status(200).json({
      success: true,
      message: 'Folder moved to Trash',
      folder: updatedFolder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// LIST TRASH
// ============================================

// @route   GET /api/trash
// @desc    Get everything currently in Trash for this user
exports.getTrashItems = async (req, res) => {
  try {
    const { data: files, error: filesErr } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', req.user.id)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (filesErr) throw filesErr;

    const { data: folders, error: foldersErr } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', req.user.id)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (foldersErr) throw foldersErr;

    res.status(200).json({
      success: true,
      files: files.map(f => ({
        _id: f.id,
        filename: f.filename,
        fileSize: f.size,
        deletedAt: f.deleted_at,
        mimeType: f.mime_type
      })),
      folders: folders.map(f => ({
        _id: f.id,
        name: f.name,
        deletedAt: f.deleted_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// RESTORE
// ============================================

// @route   POST /api/trash/file/:id/restore
exports.restoreFileFromTrash = async (req, res) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { data: updatedFile, error: updateErr } = await supabase
      .from('files')
      .update({ deleted_at: null })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({ success: true, message: 'File restored', file: updatedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/trash/folder/:id/restore
exports.restoreFolderFromTrash = async (req, res) => {
  try {
    const { data: folder, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    if (folder.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { data: updatedFolder, error: updateErr } = await supabase
      .from('folders')
      .update({ deleted_at: null })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Restore files that were inside this folder
    await supabase
      .from('files')
      .update({ deleted_at: null })
      .eq('folder_id', req.params.id)
      .eq('user_id', req.user.id);

    res.status(200).json({ success: true, message: 'Folder restored', folder: updatedFolder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// PERMANENT DELETE
// ============================================

// @route   DELETE /api/trash/file/:id
exports.permanentlyDeleteFile = async (req, res) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (file.s3_key) {
      await deleteFromS3(file.s3_key);
    }

    await supabase.from('files').delete().eq('id', req.params.id);

    // Free up storage
    const { data: user } = await supabase
      .from('users')
      .select('storage_used')
      .eq('id', req.user.id)
      .single();

    if (user) {
      const newStorageUsed = Math.max(0, (user.storage_used || 0) - (file.size || 0));
      await supabase
        .from('users')
        .update({ storage_used: newStorageUsed })
        .eq('id', req.user.id);
    }

    res.status(200).json({ success: true, message: 'File permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/trash/folder/:id
exports.permanentlyDeleteFolder = async (req, res) => {
  try {
    const { data: folder, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    if (folder.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', req.params.id);

    let totalSizeFreed = 0;

    for (const file of files || []) {
      if (file.s3_key) {
        await deleteFromS3(file.s3_key);
      }
      totalSizeFreed += file.size || 0;
    }

    await supabase.from('files').delete().eq('folder_id', req.params.id);
    await supabase.from('folders').delete().eq('id', req.params.id);

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

    res.status(200).json({ success: true, message: 'Folder permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/trash/empty
// @desc    Permanently delete everything currently in Trash for this user
exports.emptyTrash = async (req, res) => {
  try {
    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', req.user.id)
      .not('deleted_at', 'is', null);

    let totalSizeFreed = 0;

    for (const file of files || []) {
      if (file.s3_key) {
        await deleteFromS3(file.s3_key);
      }
      totalSizeFreed += file.size || 0;
    }

    const { data: folders } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', req.user.id)
      .not('deleted_at', 'is', null);

    if (files && files.length > 0) {
      await supabase.from('files').delete().in('id', files.map(f => f.id));
    }

    if (folders && folders.length > 0) {
      await supabase.from('folders').delete().in('id', folders.map(f => f.id));
    }

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

    res.status(200).json({
      success: true,
      message: `Trash emptied: ${files?.length || 0} file(s), ${folders?.length || 0} folder(s) removed`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};