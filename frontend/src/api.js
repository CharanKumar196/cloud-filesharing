const API_URL = 'http://localhost:5000/api';

// ============================================
// AUTH ENDPOINTS
// ============================================

export const register = async (fullName, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password })
  });
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const sendVerification = async (email) => {
  const response = await fetch(`${API_URL}/auth/send-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

export const verifyCode = async (email, code) => {
  const response = await fetch(`${API_URL}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  return response.json();
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

export const verifyResetCode = async (email, code) => {
  const response = await fetch(`${API_URL}/auth/verify-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  return response.json();
};

export const resetPassword = async (email, code, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword })
  });
  return response.json();
};

// ============================================
// FILE ENDPOINTS
// ============================================

// Replace your existing uploadFile function in api.js with this one.
// Added: folderId param (4th), appended to formData so uploads land in the
// right folder instead of always going to root.

// Fix: append folderId BEFORE file in the FormData.
// Most Express upload middleware (multer) needs non-file fields to arrive
// before the file field in the multipart stream, or req.body.folderId
// won't be populated on the backend — even though the frontend sent it.

export const uploadFile = async (file, token, onProgress, folderId) => {
  const formData = new FormData();
  if (folderId) formData.append('folderId', folderId); // <-- moved before file
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        if (onProgress) onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload error'));
    });

    xhr.open('POST', `${API_URL}/files/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};

export const getFiles = async (token) => {
  const response = await fetch(`${API_URL}/files`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const getFileDetails = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const downloadFile = async (fileId, token) => {
  try {
    const response = await fetch(`${API_URL}/files/${fileId}/download`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Download error:', err);
    throw err;
  }
};

export const deleteFile = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const updateFile = async (fileId, isPublic, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ isPublic })
  });
  return response.json();
};

export const searchFiles = async (query, token) => {
  const response = await fetch(`${API_URL}/files/search/${query}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const getStorageInfo = async (token) => {
  const response = await fetch(`${API_URL}/files/storage/info`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const getRecentFiles = async (token) => {
  const response = await fetch(`${API_URL}/files/archived`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Edit Profile
export const editProfile = (token, profileData) => {
  return fetch('http://localhost:5000/api/auth/edit-profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  }).then(res => res.json());
};

// Change Password
export const changePassword = (token, passwords) => {
  return fetch('http://localhost:5000/api/auth/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(passwords)
  }).then(res => res.json());
};

// Create Feedback
export const createFeedback = (token, feedbackData) => {
  return fetch('http://localhost:5000/api/feedback/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(feedbackData)
  }).then(res => res.json());
};
// ============================================
// NOTIFICATIONS API
// ============================================
const NOTIFICATIONS_BASE = 'http://localhost:5000/api/notifications';

export const sendNotification = async (token, { title, message, type }) => {
  const res = await fetch(`${NOTIFICATIONS_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, message, type }),
  });
  return res.json();
};

export const getNotifications = async (token) => {
  const res = await fetch(`${NOTIFICATIONS_BASE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const markNotificationRead = async (token, notificationId) => {
  const res = await fetch(`${NOTIFICATIONS_BASE}/${notificationId}/read`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
// ============================================
// FILE OPERATIONS - RENAME, ARCHIVE, SHARE
// ============================================

export const renameFile = async (fileId, newFileName, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/rename`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ newFileName })
  });
  return response.json();
};

export const archiveFile = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/archive`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isArchived: true })
  });
  return response.json();
};

export const unarchiveFile = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/archive`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isArchived: false })
  });
  return response.json();
};

export const shareFile = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// ============================================
// PRIVATE SECTION ENDPOINTS
// ============================================

export const setPrivatePin = async (pin, token) => {
  const response = await fetch(`${API_URL}/auth/set-private-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ pin })
  });
  return response.json();
};

export const verifyPrivatePin = async (pin, token) => {
  const response = await fetch(`${API_URL}/auth/verify-private-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ pin })
  });
  return response.json();
};

export const checkPrivatePinExists = async (token) => {
  const response = await fetch(`${API_URL}/auth/check-private-pin`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const moveFileToPrivate = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/move-to-private`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const removeFileFromPrivate = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/remove-from-private`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const getPrivateFiles = async (token) => {
  const response = await fetch(`${API_URL}/files/private`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const moveFolderToPrivate = async (folderId, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}/move-to-private`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const removeFolderFromPrivate = async (folderId, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}/remove-from-private`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const getPrivateFolders = async (token) => {
  const response = await fetch(`${API_URL}/folders/private`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
// ============================================
// FOLDER ENDPOINTS
// ============================================
export const createFolder = async (name, token) => {
  const response = await fetch(`${API_URL}/folders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  return response.json();
};

export const getFolders = async (token) => {
  const response = await fetch(`${API_URL}/folders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const getFolderFiles = async (folderId, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}/files`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const renameFolder = async (folderId, newName, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}/rename`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ newName })
  });
  return response.json();
};

export const deleteFolder = async (folderId, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
export const shareFolder = async (folderId, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}/share`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const archiveFolder = async (folderId, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}/archive`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isArchived: true })
  });
  return response.json();
};

export const unarchiveFolder = async (folderId, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}/archive`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isArchived: false })
  });
  return response.json();
};

export const getArchivedFolders = async (token) => {
  const response = await fetch(`${API_URL}/folders/archived`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const moveFolderToFolder = async (folderId, parentFolderId, token) => {
  const response = await fetch(`${API_URL}/folders/${folderId}/move`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ parentFolderId })
  });
  return response.json();
};
export const moveFileToFolder = async (fileId, folderId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/move`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ folderId })
  });
  return response.json();
};

export const getArchivedFiles = async (token) => {
  const response = await fetch(`${API_URL}/files/archived`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Get public file details (no auth needed)
export const getPublicFile = async (fileId) => {
  const response = await fetch(`${API_URL}/files/public/${fileId}`);
  return response.json();
};

/*
  ADD THESE FUNCTIONS TO YOUR EXISTING frontend/src/api.js

  These follow the same fetch + Authorization Bearer token pattern your
  other functions already use. Adjust the base URL / fetch style to match
  exactly how your other functions (getFiles, deleteFile, etc.) are written —
  I don't have your actual api.js, so match its existing conventions.

  Base URL used below: http://localhost:5000/api/trash
  Change this if your backend uses a different port/prefix.
*/

const TRASH_BASE = 'http://localhost:5000/api/trash';

// Soft-delete a file: moves it to Trash (does NOT touch S3 yet)
export async function moveFileToTrash(fileId, token) {
  const res = await fetch(`${TRASH_BASE}/file/${fileId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Soft-delete a folder (and everything inside it): moves it to Trash
export async function moveFolderToTrash(folderId, token) {
  const res = await fetch(`${TRASH_BASE}/folder/${folderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Get everything currently in Trash for this user
export async function getTrashItems(token) {
  const res = await fetch(`${TRASH_BASE}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Restore a file out of Trash back to where it was
export async function restoreFileFromTrash(fileId, token) {
  const res = await fetch(`${TRASH_BASE}/file/${fileId}/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Restore a folder out of Trash back to where it was
export async function restoreFolderFromTrash(folderId, token) {
  const res = await fetch(`${TRASH_BASE}/folder/${folderId}/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Permanently delete a single file (DB row + S3 object)
export async function permanentlyDeleteFile(fileId, token) {
  const res = await fetch(`${TRASH_BASE}/file/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Permanently delete a single folder (and its contents)
export async function permanentlyDeleteFolder(folderId, token) {
  const res = await fetch(`${TRASH_BASE}/folder/${folderId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Permanently delete everything currently in Trash
export async function emptyTrash(token) {
  const res = await fetch(`${TRASH_BASE}/empty`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
// ============================================
// ADMIN API
// ============================================
const ADMIN_BASE = 'http://localhost:5000/api/admin';

export const checkIsAdmin = async (token) => {
  const res = await fetch(`${ADMIN_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { success: false, isAdmin: false };
  return res.json();
};

export const getAdminOverview = async (token) => {
  const res = await fetch(`${ADMIN_BASE}/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getAdminFeedback = async (token, { rating, reviewed } = {}) => {
  const params = new URLSearchParams();
  if (rating) params.set('rating', rating);
  if (reviewed !== undefined) params.set('reviewed', reviewed);
  const res = await fetch(`${ADMIN_BASE}/feedback?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const markFeedbackReviewed = async (token, id, reviewed) => {
  const res = await fetch(`${ADMIN_BASE}/feedback/${id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reviewed }),
  });
  return res.json();
};

export const getAdminTrash = async (token) => {
  const res = await fetch(`${ADMIN_BASE}/trash`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getAdminPurgeLog = async (token) => {
  const res = await fetch(`${ADMIN_BASE}/trash/purge-log`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getAdminSettings = async (token) => {
  const res = await fetch(`${ADMIN_BASE}/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const updateAdminSettings = async (token, settings) => {
  const res = await fetch(`${ADMIN_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
  return res.json();
};