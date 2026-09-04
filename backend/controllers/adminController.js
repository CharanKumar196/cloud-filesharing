/*
  Save as: backend/controllers/adminController.js
*/

const supabase = require('../config/supabase');

// @route   GET /api/admin/me
exports.checkAdmin = async (req, res) => {
  res.status(200).json({ success: true, isAdmin: true });
};

// @route   GET /api/admin/overview
exports.getOverview = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalUsers },
      { count: newSignupsWeek },
      { count: newSignupsMonth },
      { data: allFiles },
      { count: totalFolders },
      { count: activeSharedLinks },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
      supabase.from('files').select('size, filename, uploaded_at').is('deleted_at', null),
      supabase.from('folders').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('files').select('*', { count: 'exact', head: true }).eq('is_public', true).is('deleted_at', null),
    ]);

    const totalFiles = allFiles?.length || 0;
    const totalStorageUsed = (allFiles || []).reduce((sum, f) => sum + (Number(f.size) || 0), 0);

    const isType = (filename, pattern) => pattern.test(filename || '');
    const imagesSize = (allFiles || []).filter(f => isType(f.filename, /\.(jpg|jpeg|png|gif)$/i)).reduce((s, f) => s + (Number(f.size) || 0), 0);
    const documentsSize = (allFiles || []).filter(f => isType(f.filename, /\.(pdf|docx|doc|txt)$/i)).reduce((s, f) => s + (Number(f.size) || 0), 0);
    const videosSize = (allFiles || []).filter(f => isType(f.filename, /\.(mp4|avi|mov|mkv|mp3)$/i)).reduce((s, f) => s + (Number(f.size) || 0), 0);
    const archivesSize = (allFiles || []).filter(f => isType(f.filename, /\.(zip|rar|7z)$/i)).reduce((s, f) => s + (Number(f.size) || 0), 0);
    const otherSize = Math.max(0, totalStorageUsed - imagesSize - documentsSize - videosSize - archivesSize);

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(d.toISOString().slice(0, 10));
    }
    const dailyTotals = {};
    days.forEach(d => (dailyTotals[d] = 0));
    (allFiles || []).forEach(f => {
      const day = (f.uploaded_at || '').slice(0, 10);
      if (dailyTotals[day] !== undefined) dailyTotals[day] += Number(f.size) || 0;
    });
    let running = 0;
    const storageTrend = days.map(day => {
      running += dailyTotals[day];
      return { date: day, cumulativeBytes: running };
    });

    res.status(200).json({
      success: true,
      totalUsers: totalUsers || 0,
      newUsersWeek: newSignupsWeek || 0,
      newUsersMonth: newSignupsMonth || 0,
      totalFiles,
      totalStorageUsed,
      totalFolders: totalFolders || 0,
      sharedLinksActive: activeSharedLinks || 0,
      storageTrend,
      breakdown: {
        images: imagesSize,
        documents: documentsSize,
        videos: videosSize,
        archives: archivesSize,
        other: otherSize,
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/feedback?rating=1&reviewed=false
exports.getFeedbackList = async (req, res) => {
  try {
    let query = supabase.from('feedback').select('*, users(full_name, email)').order('created_at', { ascending: false });

    if (req.query.rating) query = query.eq('rating', Number(req.query.rating));
    if (req.query.reviewed === 'true') query = query.eq('is_reviewed', true);
    else if (req.query.reviewed === 'false') query = query.eq('is_reviewed', false);

    const { data: feedback, error } = await query;
    if (error) throw error;

    res.status(200).json({
      success: true,
      count: feedback.length,
      feedback: feedback.map(f => ({
        id: f.id,
        subject: f.subject,
        message: f.message,
        rating: f.rating,
        reviewed: f.is_reviewed || false,
        created_at: f.created_at,
        users: { fullName: f.users?.full_name || null, email: f.users?.email || null },
      })),
    });
  } catch (error) {
    console.error('Admin feedback list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/admin/feedback/:id/review
// body: { reviewed: true|false }
exports.markFeedbackReviewed = async (req, res) => {
  try {
    const { reviewed } = req.body;
    const { data, error } = await supabase
      .from('feedback')
      .update({ is_reviewed: !!reviewed, reviewed_at: reviewed ? new Date().toISOString() : null })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Feedback updated', feedback: data });
  } catch (error) {
    console.error('Admin mark feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const TRASH_DAYS = 15;
function daysLeft(deletedAt) {
  const deletedTime = new Date(deletedAt).getTime();
  const purgeTime = deletedTime + TRASH_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((purgeTime - Date.now()) / (24 * 60 * 60 * 1000)));
}

// @route   GET /api/admin/trash
exports.getPlatformTrash = async (req, res) => {
  try {
    const [{ data: files, error: filesErr }, { data: folders, error: foldersErr }] = await Promise.all([
      supabase.from('files').select('*, users(full_name, email)').not('deleted_at', 'is', null),
      supabase.from('folders').select('*, users(full_name, email)').not('deleted_at', 'is', null),
    ]);
    if (filesErr || foldersErr) throw filesErr || foldersErr;

    res.status(200).json({
      success: true,
      files: (files || []).map(f => ({
        id: f.id,
        filename: f.filename,
        fileSize: f.size,
        deletedAt: f.deleted_at,
        daysLeft: daysLeft(f.deleted_at),
        users: { fullName: f.users?.full_name || null, email: f.users?.email || null },
      })),
      folders: (folders || []).map(f => ({
        id: f.id,
        name: f.name,
        deletedAt: f.deleted_at,
        daysLeft: daysLeft(f.deleted_at),
        users: { fullName: f.users?.full_name || null, email: f.users?.email || null },
      })),
    });
  } catch (error) {
    console.error('Admin trash overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/trash/purge-log
exports.getPurgeLog = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trash_purge_log')
      .select('*, users(full_name, email)')
      .order('purged_at', { ascending: false })
      .limit(200);
    if (error) throw error;

    res.status(200).json({
      success: true,
      log: (data || []).map(entry => ({
        id: entry.id,
        item_type: entry.item_type,
        item_name: entry.item_name,
        deleted_at: entry.deleted_at,
        purged_at: entry.purged_at,
        users: { fullName: entry.users?.full_name || null, email: entry.users?.email || null },
      })),
    });
  } catch (error) {
    console.error('Admin purge log error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/settings
exports.getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase.from('platform_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    res.status(200).json({
      success: true,
      settings: {
        default_storage_limit: data.default_storage_limit,
        allow_signups: data.allow_signups,
        maintenance_mode: data.maintenance_mode,
      },
    });
  } catch (error) {
    console.error('Admin get settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
  try {
    const { defaultStorageLimit, allowSignups, maintenanceMode } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (defaultStorageLimit !== undefined) updates.default_storage_limit = defaultStorageLimit;
    if (allowSignups !== undefined) updates.allow_signups = allowSignups;
    if (maintenanceMode !== undefined) updates.maintenance_mode = maintenanceMode;

    const { data, error } = await supabase.from('platform_settings').update(updates).eq('id', 1).select().single();
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Settings updated',
      settings: {
        default_storage_limit: data.default_storage_limit,
        allow_signups: data.allow_signups,
        maintenance_mode: data.maintenance_mode,
      },
    });
  } catch (error) {
    console.error('Admin update settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};