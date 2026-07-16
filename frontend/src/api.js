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

export const uploadFile = async (file, token, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
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