/*
  Trash auto-purge job — permanently deletes anything that's been
  in Trash for more than 15 days (DB row + S3 object).
  Runs once a day at 3:00 AM server time.
*/
const cron = require('node-cron');
const { supabase } = require('../config/supabase');
const { s3, S3_BUCKET } = require('../services/s3Service');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const TRASH_DAYS = 15;

async function purgeExpiredTrash() {
  const cutoff = new Date(Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000).toISOString();

  try {
    // ---- Files older than 15 days in Trash ----
    const { data: expiredFiles, error: filesErr } = await supabase
      .from('files')
      .select('*')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', cutoff);

    if (filesErr) throw filesErr;

    for (const file of expiredFiles || []) {
      if (file.s3_key) {
        try {
          await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: file.s3_key }));
        } catch (s3Err) {
          console.error(`Failed to delete S3 object for file ${file.id}:`, s3Err);
        }
      }
    }

    if (expiredFiles && expiredFiles.length > 0) {
      const ids = expiredFiles.map(f => f.id);
      await supabase.from('files').delete().in('id', ids);
    }

    // ---- Folders older than 15 days in Trash ----
    const { data: expiredFolders, error: foldersErr } = await supabase
      .from('folders')
      .select('*')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', cutoff);

    if (foldersErr) throw foldersErr;

    for (const folder of expiredFolders || []) {
      const { data: filesInFolder } = await supabase
        .from('files')
        .select('*')
        .eq('folder_id', folder.id);

      for (const file of filesInFolder || []) {
        if (file.s3_key) {
          try {
            await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: file.s3_key }));
          } catch (s3Err) {
            console.error(`Failed to delete S3 object for file ${file.id}:`, s3Err);
          }
        }
      }

      await supabase.from('files').delete().eq('folder_id', folder.id);
    }

    if (expiredFolders && expiredFolders.length > 0) {
      const ids = expiredFolders.map(f => f.id);
      await supabase.from('folders').delete().in('id', ids);
    }

    console.log(
      `[Trash purge] Removed ${expiredFiles?.length || 0} file(s) and ${expiredFolders?.length || 0} folder(s) older than ${TRASH_DAYS} days.`
    );
  } catch (err) {
    console.error('[Trash purge] Failed:', err);
  }
}

// Runs every day at 3:00 AM
cron.schedule('0 3 * * *', purgeExpiredTrash);

module.exports = { purgeExpiredTrash };