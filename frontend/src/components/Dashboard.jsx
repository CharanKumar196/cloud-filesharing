import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { getFiles, uploadFile, deleteFile, getStorageInfo, getRecentFiles, renameFile, archiveFile, unarchiveFile, shareFile, getFolders, createFolder, renameFolder, deleteFolder, getFolderFiles, moveFileToFolder } from '../api';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import FeedbackModal from './FeedbackModal';
import PreviewModal from './PreviewModal';

export default function Dashboard({ token, onLogout }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [storageInfo, setStorageInfo] = useState({ storageUsed: 0, storageLimit: 5 * 1024 * 1024 * 1024 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  const [archivedFiles, setArchivedFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([{ name: 'My Files', id: null }]);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const name = localStorage.getItem('userName') || 'User';
    const email = localStorage.getItem('userEmail') || 'user@example.com';
    setUserName(name);
    setUserEmail(email);
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!showFileMenu) {
        setLoading(true);
      }

      const [filesData, storageData, recentData, foldersData] = await Promise.all([
        getFiles(token),
        getStorageInfo(token),
        getRecentFiles(token),
        getFolders(token)
      ]);

      const allFiles = filesData.files || [];
      setFiles(allFiles.filter(f => !f.isArchived));
      setArchivedFiles(allFiles.filter(f => f.isArchived));
      setStorageInfo(storageData || { storageUsed: 0, storageLimit: 5 * 1024 * 1024 * 1024 });
      setRecentFiles(recentData.files || []);
      setFolders(foldersData.folders || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      if (!showFileMenu) {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 25, 85));
      }, 150);

      await uploadFile(file, token);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        loadDashboardData();
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      alert('❌ Upload failed: ' + error.message);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Delete this file permanently?')) {
      try {
        await deleteFile(fileId, token);
        loadDashboardData();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleArchive = async (fileId) => {
    try {
      const response = await archiveFile(fileId, token);
      if (response.success) {
        alert('✅ ' + response.message);
        loadDashboardData();
      } else {
        alert('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error('Archive error:', error);
      alert('❌ Failed to archive file');
    }
  };

  const handleUnarchive = async (fileId) => {
    try {
      const response = await unarchiveFile(fileId, token);
      if (response.success) {
        alert('✅ ' + response.message);
        loadDashboardData();
      } else {
        alert('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error('Unarchive error:', error);
      alert('❌ Failed to unarchive file');
    }
  };

  const handleRename = async (fileId, currentFileName) => {
    const newName = prompt('Enter new filename:', currentFileName);
    if (newName && newName.trim() !== '' && newName !== currentFileName) {
      try {
        const response = await renameFile(fileId, newName, token);
        if (response.success) {
          alert('✅ File renamed successfully!');
          loadDashboardData();
        } else {
          alert('❌ Error: ' + response.message);
        }
      } catch (error) {
        console.error('Rename error:', error);
        alert('❌ Failed to rename file');
      }
    }
  };

  const handleShare = async (fileId, fileName) => {
    try {
      const response = await shareFile(fileId, token);
      if (response.success) {
        const shareLink = response.shareLink;
        navigator.clipboard.writeText(shareLink);
        alert('✅ Share link copied to clipboard!\n\n' + shareLink);
        loadDashboardData();
      } else {
        alert('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('❌ Failed to share file');
    }
  };

  const handleMoveToFolder = async (fileId, fileName) => {
    if (folders.length === 0) {
      alert('❌ No folders available. Create a folder first!');
      return;
    }

    const folderList = folders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
    const folderNumber = prompt(
      `Select folder to move "${fileName}" into:\n\n${folderList}\n\n(Enter number or leave empty for root)`,
      ''
    );

    if (folderNumber === null) return;

    let targetFolderId = null;
    if (folderNumber && folderNumber.trim() !== '') {
      const index = parseInt(folderNumber) - 1;
      if (index >= 0 && index < folders.length) {
        targetFolderId = folders[index]._id;
      } else {
        alert('❌ Invalid folder number!');
        return;
      }
    }

    try {
      const response = await moveFileToFolder(fileId, targetFolderId, token);
      if (response.success) {
        alert('✅ File moved successfully!');
        loadDashboardData();
      } else {
        alert('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error('Move file error:', error);
      alert('❌ Failed to move file');
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim() !== '') {
      try {
        const response = await createFolder(folderName, token);
        if (response.success) {
          alert('✅ Folder created successfully!');
          loadDashboardData();
        } else {
          alert('❌ Error: ' + response.message);
        }
      } catch (error) {
        console.error('Create folder error:', error);
        alert('❌ Failed to create folder');
      }
    }
  };

  const handleOpenFolder = async (folderId) => {
    try {
      const response = await getFolderFiles(folderId, token);
      if (response.success) {
        setCurrentFolder(folderId);
        const folderName = folders.find(f => f._id === folderId)?.name || 'Folder';
        setFolderPath([...folderPath, { name: folderName, id: folderId }]);
        setFiles(response.files || []);
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  const handleBackFolder = () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      setCurrentFolder(newPath[newPath.length - 1].id);
      loadDashboardData();
    }
  };

  const handleRenameFolder = async (folderId, currentName) => {
    const newName = prompt('Enter new folder name:', currentName);
    if (newName && newName.trim() !== '' && newName !== currentName) {
      try {
        const response = await renameFolder(folderId, newName, token);
        if (response.success) {
          alert('✅ Folder renamed successfully!');
          loadDashboardData();
        } else {
          alert('❌ Error: ' + response.message);
        }
      } catch (error) {
        console.error('Rename folder error:', error);
        alert('❌ Failed to rename folder');
      }
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Delete this folder and all files inside? This cannot be undone!')) {
      try {
        const response = await deleteFolder(folderId, token);
        if (response.success) {
          alert('✅ Folder deleted successfully!');
          loadDashboardData();
        } else {
          alert('❌ Error: ' + response.message);
        }
      } catch (error) {
        console.error('Delete folder error:', error);
        alert('❌ Failed to delete folder');
      }
    }
  };

  let filteredFiles = files.filter(f =>
    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (file) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  if (activeFilter === 'images') {
    filteredFiles = filteredFiles.filter(f => f.filename.match(/\.(jpg|jpeg|png|gif)$/i));
  } else if (activeFilter === 'documents') {
    filteredFiles = filteredFiles.filter(f => f.filename.match(/\.(pdf|docx|doc|txt)$/i));
  } else if (activeFilter === 'media') {
    filteredFiles = filteredFiles.filter(f => f.filename.match(/\.(mp4|avi|mov|mkv|mp3)$/i));
  }

  const displayFiles = activeTab === 'files' ? filteredFiles : archivedFiles;

  const storageUsed = storageInfo?.storageUsed || 0;
  const storageLimit = storageInfo?.storageLimit || (5 * 1024 * 1024 * 1024);
  const storagePercent = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;
  const storageUsedGB = ((storageUsed || 0) / (1024 * 1024 * 1024)).toFixed(2);
  const storageLimitGB = ((storageLimit || 0) / (1024 * 1024 * 1024)).toFixed(2);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.max(1, bytes)) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️';
    if (filename.match(/\.(pdf)$/i)) return '📄';
    if (filename.match(/\.(docx|doc|txt)$/i)) return '📝';
    if (filename.match(/\.(zip|rar|7z)$/i)) return '📦';
    if (filename.match(/\.(mp4|avi|mov|mkv)$/i)) return '🎬';
    return '📁';
  };

  const getStorageByType = (fileList, pattern) => {
    return fileList
      .filter(f => f.filename.match(pattern))
      .reduce((sum, f) => sum + (f.fileSize || 0), 0);
  };

  const toggleMenu = (id) => {
    setShowFileMenu(showFileMenu === id ? null : id);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">My Files</h1>
        </div>
        <div className="header-right">
          <div className="search-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="user-menu-wrapper" ref={dropdownRef}>
            <button
              className="user-profile-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              title={userName}
            >
              <div className="user-avatar-small">{userName.charAt(0).toUpperCase()}</div>
              <span className="user-name-short">{userName}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {showUserDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">{userName.charAt(0).toUpperCase()}</div>
                  <div className="dropdown-user-info">
                    <p className="dropdown-name">{userName}</p>
                    <p className="dropdown-email">{userEmail}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-blue-400 hover:bg-gray-800 rounded transition"
                >
                  <span>✏️</span> Edit Profile
                </button>

                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-blue-400 hover:bg-gray-800 rounded transition"
                >
                  <span>🔒</span> Change Password
                </button>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-blue-400 hover:bg-gray-800 rounded transition"
                >
                  <span>💬</span> Feedback
                </button>

                <button className="dropdown-item logout" onClick={() => {
                  setShowUserDropdown(false);
                  onLogout();
                }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Storage</h3>
            <div className="storage-display">
              <div className="storage-circle">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" className="storage-bg" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    className="storage-ring"
                    style={{
                      strokeDasharray: `${(storagePercent / 100) * 339.3} 339.3`
                    }}
                  />
                  <text x="60" y="60" className="storage-text">
                    {storagePercent.toFixed(0)}%
                  </text>
                </svg>
              </div>
              <p className="storage-info">{storageUsedGB} GB of {storageLimitGB} GB</p>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Quick Actions</h3>
            <button className="action-btn upload-btn" onClick={() => fileInputRef.current?.click()}>
              📤 Upload File
            </button>
            <button className="action-btn folder-btn" onClick={handleCreateFolder}>
              📁 New Folder
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden-input"
            />
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">File Types</h3>
            <div className="file-stats">
              <div className="stat-item">
                <span className="stat-icon">🖼️</span>
                <span className="stat-text">Images</span>
                <span className="stat-value">{files.filter(f => f.filename.match(/\.(jpg|jpeg|png|gif)$/i)).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📄</span>
                <span className="stat-text">Documents</span>
                <span className="stat-value">{files.filter(f => f.filename.match(/\.(pdf|docx|doc|txt)$/i)).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📦</span>
                <span className="stat-text">Archives</span>
                <span className="stat-value">{files.filter(f => f.filename.match(/\.(zip|rar|7z)$/i)).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🎬</span>
                <span className="stat-text">Media</span>
                <span className="stat-value">{files.filter(f => f.filename.match(/\.(mp4|avi|mov|mkv)$/i)).length}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="dashboard-content">
          <div className="content-tabs">
            <button
              className={`tab ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              📁 Files ({files.length + folders.length})
            </button>
            <button
              className={`tab ${activeTab === 'archives' ? 'active' : ''}`}
              onClick={() => setActiveTab('archives')}
            >
              🗂️ Archives ({archivedFiles.length})
            </button>
          </div>

          {folderPath.length > 1 && (
            <div className="breadcrumb-nav" style={{ padding: '10px 0', marginBottom: '10px' }}>
              {folderPath.map((pathItem, index) => (
                <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {index > 0 && <span style={{ color: '#888' }}>/</span>}
                  <button
                    onClick={() => {
                      const newPath = folderPath.slice(0, index + 1);
                      setFolderPath(newPath);
                      setCurrentFolder(newPath[newPath.length - 1].id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4A90E2',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '14px'
                    }}
                  >
                    {pathItem.name}
                  </button>
                </span>
              ))}
              {folderPath.length > 1 && (
                <button
                  onClick={handleBackFolder}
                  style={{
                    marginLeft: '10px',
                    background: '#4A90E2',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ← Back
                </button>
              )}
            </div>
          )}

          {uploading && (
            <div className="upload-progress-container">
              <div className="upload-progress">
                <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="upload-progress-text">Uploading... {uploadProgress.toFixed(0)}%</p>
            </div>
          )}

          <div className="files-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your files...</p>
              </div>
            ) : activeTab === 'archives' ? (
              archivedFiles.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-icon">📭</p>
                  <p className="empty-text">No archived files.</p>
                </div>
              ) : (
                <div className="files-list">
                  {displayFiles.map(file => (
                    <div key={file._id} className="file-card">
                      <div className="file-card-header">
                        <span className="file-type-icon">{getFileIcon(file.filename)}</span>
                        <div className="file-card-title">
                          <p className="file-name" title={file.filename}>
                            {file.filename}
                          </p>
                          <p className="file-meta">
                            {formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}
                          </p>
                        </div>
                      </div>

                      <div className="file-card-actions">
                        <div className="file-menu-container">
                          <button
                            className="file-menu-btn"
                            onClick={() => toggleMenu(file._id)}
                            title="More options"
                          >
                            ⋮
                          </button>

                          {showFileMenu === file._id && (
                            <div className="file-menu">
                              <button className="menu-item" onClick={() => { handleShare(file._id, file.filename); toggleMenu(null); }}>🔗 Share</button>
                              <button className="menu-item" onClick={() => { handlePreview(file); toggleMenu(null); }}>👁️ Preview</button>
                              <button className="menu-item" onClick={() => { handleMoveToFolder(file._id, file.filename); toggleMenu(null); }}>📂 Move to Folder</button>
                              <button className="menu-item" onClick={() => { handleRename(file._id, file.filename); toggleMenu(null); }}>✏️ Rename</button>
                              <button className="menu-item" onClick={() => { handleUnarchive(file._id); toggleMenu(null); }}>↩️ Unarchive</button>
                              <button className="menu-item delete" onClick={() => { handleDelete(file._id); toggleMenu(null); }}>🗑️ Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (folders.length === 0 && displayFiles.length === 0) ? (
              <div className="empty-state">
                <p className="empty-icon">📭</p>
                <p className="empty-text">No files yet. Upload your first file!</p>
              </div>
            ) : (
              <div className="files-list">
                {currentFolder === null && !activeFilter && folders.map(folder => (
                  <div key={folder._id} className="file-card" style={{ borderLeft: `4px solid ${folder.color || '#4A90E2'}` }}>
                    <div className="file-card-header" onClick={() => handleOpenFolder(folder._id)} style={{ cursor: 'pointer' }}>
                      <span className="file-type-icon">📂</span>
                      <div className="file-card-title">
                        <p className="file-name" title={folder.name}>
                          {folder.name}
                        </p>
                        <p className="file-meta">
                          Folder • {formatDate(folder.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="file-card-actions">
                      <div className="file-menu-container">
                        <button
                          className="file-menu-btn"
                          onClick={() => toggleMenu(folder._id)}
                          title="More options"
                        >
                          ⋮
                        </button>

                        {showFileMenu === folder._id && (
                          <div className="file-menu">
                            <button className="menu-item" onClick={() => { handleRenameFolder(folder._id, folder.name); toggleMenu(null); }}>✏️ Rename</button>
                            <button className="menu-item delete" onClick={() => { handleDeleteFolder(folder._id); toggleMenu(null); }}>🗑️ Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {displayFiles.map(file => (
                  <div key={file._id} className="file-card">
                    <div className="file-card-header">
                      <span className="file-type-icon">{getFileIcon(file.filename)}</span>
                      <div className="file-card-title">
                        <p className="file-name" title={file.filename}>
                          {file.filename}
                        </p>
                        <p className="file-meta">
                          {formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}
                        </p>
                      </div>
                    </div>

                    <div className="file-card-actions">
                      <div className="file-menu-container">
                        <button
                          className="file-menu-btn"
                          onClick={() => toggleMenu(file._id)}
                          title="More options"
                        >
                          ⋮
                        </button>

                        {showFileMenu === file._id && (
                          <div className="file-menu">
                            <button className="menu-item" onClick={() => { handleShare(file._id, file.filename); toggleMenu(null); }}>🔗 Share</button>
                            <button className="menu-item" onClick={() => { handlePreview(file); toggleMenu(null); }}>👁️ Preview</button>
                            <button className="menu-item" onClick={() => { handleRename(file._id, file.filename); toggleMenu(null); }}>✏️ Rename</button>
                            <button className="menu-item" onClick={() => { handleArchive(file._id); toggleMenu(null); }}>📦 Archive</button>
                            <button className="menu-item delete" onClick={() => { handleDelete(file._id); toggleMenu(null); }}>🗑️ Delete</button>
                            <button className="menu-item" onClick={() => { handleMoveToFolder(file._id, file.filename); toggleMenu(null); }}>📂 Move to Folder</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="storage-breakdown">
            <h3 className="breakdown-title">Storage Breakdown</h3>
            <div className="breakdown-grid">
              <div className="breakdown-card" onClick={() => setActiveFilter(activeFilter === 'images' ? null : 'images')} style={{ cursor: 'pointer', opacity: activeFilter === 'images' ? 1 : 0.7, borderBottom: activeFilter === 'images' ? '3px solid #4A90E2' : 'none', transition: 'all 0.3s' }}>
                <div className="breakdown-header"><span className="breakdown-icon">🖼️</span><span className="breakdown-name">Images</span></div>
                <p className="breakdown-size">{formatFileSize(getStorageByType(files, /\.(jpg|jpeg|png|gif)$/i))}</p>
              </div>

              <div className="breakdown-card" onClick={() => setActiveFilter(activeFilter === 'documents' ? null : 'documents')} style={{ cursor: 'pointer', opacity: activeFilter === 'documents' ? 1 : 0.7, borderBottom: activeFilter === 'documents' ? '3px solid #4A90E2' : 'none', transition: 'all 0.3s' }}>
                <div className="breakdown-header"><span className="breakdown-icon">📄</span><span className="breakdown-name">Documents</span></div>
                <p className="breakdown-size">{formatFileSize(getStorageByType(files, /\.(pdf|docx|doc|txt)$/i))}</p>
              </div>

              <div className="breakdown-card" onClick={() => setActiveFilter(activeFilter === 'archived' ? null : 'archived')} style={{ cursor: 'pointer', opacity: activeFilter === 'archived' ? 1 : 0.7, borderBottom: activeFilter === 'archived' ? '3px solid #4A90E2' : 'none', transition: 'all 0.3s' }}>
                <div className="breakdown-header"><span className="breakdown-icon">📦</span><span className="breakdown-name">Archived Files</span></div>
                <p className="breakdown-size">{formatFileSize(archivedFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0))}</p>
              </div>

              <div className="breakdown-card" onClick={() => setActiveFilter(activeFilter === 'media' ? null : 'media')} style={{ cursor: 'pointer', opacity: activeFilter === 'media' ? 1 : 0.7, borderBottom: activeFilter === 'media' ? '3px solid #4A90E2' : 'none', transition: 'all 0.3s' }}>
                <div className="breakdown-header"><span className="breakdown-icon">🎬</span><span className="breakdown-name">Media</span></div>
                <p className="breakdown-size">{formatFileSize(getStorageByType(files, /\.(mp4|avi|mov|mkv|mp3)$/i))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} userEmail={userEmail} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <PreviewModal file={previewFile} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} token={token} />
    </div>
  );
}