import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { getFiles, uploadFile, deleteFile, getStorageInfo, getRecentFiles, getArchivedFiles, renameFile, archiveFile, unarchiveFile, shareFile, getFolders, createFolder, renameFolder, deleteFolder, getFolderFiles, moveFileToFolder, setPrivatePin, verifyPrivatePin, checkPrivatePinExists, moveFileToPrivate, removeFileFromPrivate, getPrivateFiles, moveFolderToPrivate, removeFolderFromPrivate, getPrivateFolders, shareFolder, archiveFolder, unarchiveFolder, getArchivedFolders, moveFolderToFolder } from '../api';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import FeedbackModal from './FeedbackModal';
import PreviewModal from './PreviewModal';
import CloudLogo from '../components/CloudLogo';

export default function Dashboard({ token, onLogout }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [storageInfo, setStorageInfo] = useState({ storageUsed: 0, storageLimit: 5 * 1024 * 1024 * 1024 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userName, setUserName] = useState('User');
  const [showSidebar, setShowSidebar] = useState(false);
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  const [archivedFiles, setArchivedFiles] = useState([]);
  const [archivedFolders, setArchivedFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([{ name: 'My Files', id: null }]);
  const [recentFiles, setRecentFiles] = useState([]);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [privateFiles, setPrivateFiles] = useState([]);
  const [privateFolders, setPrivateFolders] = useState([]);
  const [isPrivateUnlocked, setIsPrivateUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState('verify'); // 'verify' or 'set'
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [privateCurrentFolder, setPrivateCurrentFolder] = useState(null);
  const [privateFolderPath, setPrivateFolderPath] = useState([{ name: 'Private', id: null }]);
  const [privateFolderFiles, setPrivateFolderFiles] = useState([]);

  useEffect(() => {
    loadDashboardData();
    const name = localStorage.getItem('userName') || 'User';
    const email = localStorage.getItem('userEmail') || 'user@example.com';
    setUserName(name);
    setUserEmail(email);
  }, []);

  // ✅ NEW: Close menu when clicking outside file-card
  useEffect(() => {
  const handleClickOutside = (e) => {
    // Don't close if clicking on file-menu or file-menu-btn
    if (showFileMenu && !e.target.closest('.file-menu') && !e.target.closest('.file-menu-btn')) {
      setShowFileMenu(null);
    }
  };
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [showFileMenu]);
useEffect(() => {
  const handleClickOutsideDropdown = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowUserDropdown(false);
    }
  };
  document.addEventListener('click', handleClickOutsideDropdown);
  return () => document.removeEventListener('click', handleClickOutsideDropdown);
}, []);
useEffect(() => {
  const handleClickOutsideSidebar = (e) => {
    if (
      showSidebar &&
      sidebarRef.current &&
      !sidebarRef.current.contains(e.target) &&
      !e.target.closest('.sidebar-menu-btn')
    ) {
      setShowSidebar(false);
    }
  };
  document.addEventListener('click', handleClickOutsideSidebar);
  return () => document.removeEventListener('click', handleClickOutsideSidebar);
}, [showSidebar]);

const loadDashboardData = async () => {
  try {
    if (!showFileMenu) {
      setLoading(true);
    }

    const [filesData,storageData, recentData, foldersData, archivedData, archivedFoldersData] = await Promise.all([
    getFiles(token),
    getStorageInfo(token),
    getRecentFiles(token),
    getFolders(token),
    getArchivedFiles(token),
    getArchivedFolders(token)
    ]);

  setFiles(filesData.files || []);
  setArchivedFiles(archivedData.files || []);
  setStorageInfo(storageData || { storageUsed: 0, storageLimit: 5 * 1024 * 1024 * 1024 });
  setRecentFiles(recentData.files || []);
  setFolders(foldersData.folders || []);
  setArchivedFolders(archivedFoldersData.folders || []);
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
      setFolders(response.folders || []);
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
  const handleShareFolder = async (folderId, folderName) => {
  try {
    const response = await shareFolder(folderId, token);
    if (response.success) {
      navigator.clipboard.writeText(response.shareLink);
      alert('✅ Share link copied to clipboard!\n\n' + response.shareLink);
      loadDashboardData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    console.error('Share folder error:', error);
    alert('❌ Failed to share folder');
  }
};

const handleArchiveFolder = async (folderId) => {
  try {
    const response = await archiveFolder(folderId, token);
    if (response.success) {
      alert('✅ ' + response.message);
      loadDashboardData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    console.error('Archive folder error:', error);
    alert('❌ Failed to archive folder');
  }
};

const handleUnarchiveFolder = async (folderId) => {
  try {
    const response = await unarchiveFolder(folderId, token);
    if (response.success) {
      alert('✅ ' + response.message);
      loadDashboardData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    console.error('Unarchive folder error:', error);
    alert('❌ Failed to unarchive folder');
  }
};

const handleMoveFolderToAnotherFolder = async (folderId, folderName) => {
  const otherFolders = folders.filter(f => f._id !== folderId);
  if (otherFolders.length === 0) {
    alert('❌ No other folders available to move into!');
    return;
  }

  const folderList = otherFolders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
  const folderNumber = prompt(
    `Select folder to move "${folderName}" into:\n\n${folderList}\n\n(Enter number or leave empty for root)`,
    ''
  );

  if (folderNumber === null) return;

  let targetFolderId = null;
  if (folderNumber && folderNumber.trim() !== '') {
    const index = parseInt(folderNumber) - 1;
    if (index >= 0 && index < otherFolders.length) {
      targetFolderId = otherFolders[index]._id;
    } else {
      alert('❌ Invalid folder number!');
      return;
    }
  }

  try {
    const response = await moveFolderToFolder(folderId, targetFolderId, token);
    if (response.success) {
      alert('✅ Folder moved successfully!');
      loadDashboardData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    console.error('Move folder error:', error);
    alert('❌ Failed to move folder');
  }
};
  let filteredFiles = files.filter(f =>
    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPrivateSection = async () => {
  try {
    const result = await checkPrivatePinExists(token);
    if (result.hasPin) {
      setPinMode('verify');
    } else {
      setPinMode('set');
    }
    setPinInput('');
    setPinConfirmInput('');
    setPinError('');
    setShowPinModal(true);
  } catch (error) {
    console.error('Error checking PIN:', error);
  }
};

const handlePinSubmit = async () => {
  setPinError('');

  if (pinMode === 'set') {
    if (pinInput.length < 4) {
      setPinError('PIN must be at least 4 characters');
      return;
    }
    if (pinInput !== pinConfirmInput) {
      setPinError('PINs do not match');
      return;
    }
    try {
      const result = await setPrivatePin(pinInput, token);
      if (result.success) {
        setShowPinModal(false);
        await loadPrivateData();
        setIsPrivateUnlocked(true);
        setActiveTab('private');
      } else {
        setPinError(result.message);
      }
    } catch (error) {
      setPinError('Failed to set PIN');
    }
  } else {
    try {
      const result = await verifyPrivatePin(pinInput, token);
      if (result.success) {
        setShowPinModal(false);
        await loadPrivateData();
        setIsPrivateUnlocked(true);
        setActiveTab('private');
      } else {
        setPinError(result.message);
      }
    } catch (error) {
      setPinError('Incorrect PIN');
    }
  }
};

const loadPrivateData = async () => {
  try {
    const [filesRes, foldersRes] = await Promise.all([
      getPrivateFiles(token),
      getPrivateFolders(token)
    ]);
    setPrivateFiles(filesRes.files || []);
    setPrivateFolders(foldersRes.folders || []);
  } catch (error) {
    console.error('Error loading private data:', error);
  }
};
const handleOpenPrivateFolder = async (folderId) => {
  try {
    const response = await getFolderFiles(folderId, token);
    if (response.success) {
      setPrivateCurrentFolder(folderId);
      const folderName = privateFolders.find(f => f._id === folderId)?.name || 'Folder';
      setPrivateFolderPath([...privateFolderPath, { name: folderName, id: folderId }]);
      setPrivateFolderFiles(response.files || []);
    }
  } catch (error) {
    console.error('Error opening private folder:', error);
  }
};

const handleBackPrivateFolder = () => {
  if (privateFolderPath.length > 1) {
    const newPath = privateFolderPath.slice(0, -1);
    setPrivateFolderPath(newPath);
    if (newPath.length === 1) {
      setPrivateCurrentFolder(null);
      setPrivateFolderFiles([]);
    } else {
      setPrivateCurrentFolder(newPath[newPath.length - 1].id);
    }
  }
};
const handleMoveToPrivate = async (fileId) => {
  try {
    const response = await moveFileToPrivate(fileId, token);
    if (response.success) {
      alert('✅ Moved to Private');
      loadDashboardData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    alert('❌ Failed to move to Private');
  }
};

const handleRemoveFromPrivate = async (fileId) => {
  try {
    const response = await removeFileFromPrivate(fileId, token);
    if (response.success) {
      alert('✅ Removed from Private');
      loadPrivateData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    alert('❌ Failed to remove from Private');
  }
};
const handleMoveToPrivateFolder = async (fileId, fileName) => {
  const availableFolders = privateFolders.filter(f => f._id !== privateCurrentFolder);

  if (availableFolders.length === 0) {
    alert('❌ No folders available inside Private. Create one first!');
    return;
  }

  const folderList = availableFolders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
  const folderNumber = prompt(
    `Select folder to move "${fileName}" into:\n\n${folderList}\n\n(Enter number or leave empty for root)`,
    ''
  );

  if (folderNumber === null) return;

  let targetFolderId = null;
  if (folderNumber && folderNumber.trim() !== '') {
    const index = parseInt(folderNumber) - 1;
    if (index >= 0 && index < availableFolders.length) {
      targetFolderId = availableFolders[index]._id;
    } else {
      alert('❌ Invalid folder number!');
      return;
    }
  }

  try {
    const response = await moveFileToFolder(fileId, targetFolderId, token);
    if (response.success) {
      alert('✅ File moved successfully!');
      if (privateCurrentFolder !== null) {
        const refreshed = await getFolderFiles(privateCurrentFolder, token);
        setPrivateFolderFiles(refreshed.files || []);
      }
      loadPrivateData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    console.error('Move file error:', error);
    alert('❌ Failed to move file');
  }
};
const handleMoveFolderToPrivate = async (folderId) => {
  try {
    const response = await moveFolderToPrivate(folderId, token);
    if (response.success) {
      alert('✅ Folder moved to Private');
      loadDashboardData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    alert('❌ Failed to move folder to Private');
  }
};

const handleRemoveFolderFromPrivate = async (folderId) => {
  try {
    const response = await removeFolderFromPrivate(folderId, token);
    if (response.success) {
      alert('✅ Folder removed from Private');
      loadPrivateData();
    } else {
      alert('❌ Error: ' + response.message);
    }
  } catch (error) {
    alert('❌ Failed to remove folder from Private');
  }
};
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
  else if (activeFilter === 'archived') {
    filteredFiles = archivedFiles.filter(f =>
      f.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

 const toggleMenu = (id, e) => {
  if (e) {
    e.stopPropagation();
  }
  setShowFileMenu(showFileMenu === id ? null : id);
};

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <button
            className="sidebar-menu-btn"
            onClick={() => setShowSidebar(!showSidebar)}
            title="Menu"
  >
    ☰
  </button>
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
              autoComplete="off"
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
                    className="dropdown-item"
                >
                  <span>✏️</span> Edit Profile
                </button>

                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                    className="dropdown-item"
                >
                  <span>🔒</span> Change Password
                </button>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                    className="dropdown-item"
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
        <aside ref={sidebarRef} className={`dashboard-sidebar ${showSidebar ? 'open' : 'closed'}`}>
          

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
              <div 
                className="stat-item" 
                onClick={() => {
                  if (activeTab === 'private' && isPrivateUnlocked) {
                    setActiveTab('files');
                    setIsPrivateUnlocked(false);
                  } else {
                    handleOpenPrivateSection();
                  }
                }}
                style={{ cursor: 'pointer' }}
            >
                <span className="stat-icon">🔒</span>
                <span className="stat-text">Private</span>
                <span className="stat-value">{privateFiles.length + privateFolders.length}</span>
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
            🗂️ Archives ({archivedFiles.length + archivedFolders.length})
            </button>
          </div>

          {folderPath.length > 1 && (
  <div className="folder-header-card">
    <div className="folder-header-info">
      <h2 className="folder-header-title">
        {folderPath[folderPath.length - 1].name}
      </h2>
      <div className="folder-header-breadcrumb">
        {folderPath.map((pathItem, index) => {
          const isLast = index === folderPath.length - 1;
          return (
            <span key={index} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-sep">/</span>}
              <button
                onClick={() => {
                  const newPath = folderPath.slice(0, index + 1);
                  setFolderPath(newPath);
                  setCurrentFolder(newPath[newPath.length - 1].id);
                }}
                className={`breadcrumb-link ${isLast ? 'active' : ''}`}
              >
                {pathItem.name}
              </button>
            </span>
          );
        })}
      </div>
    </div>

    <button onClick={handleBackFolder} className="folder-back-btn">
      <span className="back-arrow">←</span> Back
    </button>
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
) : activeTab === 'private' && isPrivateUnlocked ? (
  <>
    <div className="folder-header-card">
      <div className="folder-header-info">
        <h2 className="folder-header-title">🔒 Private</h2>
      </div>
      <button
        onClick={() => {
          setActiveTab('files');
          setIsPrivateUnlocked(false);
          setPrivateCurrentFolder(null);
          setPrivateFolderPath([{ name: 'Private', id: null }]);
          setPrivateFolderFiles([]);
        }}
        className="folder-back-btn"
      >
        <span className="back-arrow">←</span> Exit Private
      </button>
    </div>

    {privateFolderPath.length > 1 && (
      <div className="folder-header-card">
        <div className="folder-header-info">
          <h2 className="folder-header-title">
            {privateFolderPath[privateFolderPath.length - 1].name}
          </h2>
          <div className="folder-header-breadcrumb">
            {privateFolderPath.map((pathItem, index) => {
              const isLast = index === privateFolderPath.length - 1;
              return (
                <span key={index} className="breadcrumb-item">
                  {index > 0 && <span className="breadcrumb-sep">/</span>}
                  <button
                    onClick={() => {
                      const newPath = privateFolderPath.slice(0, index + 1);
                      setPrivateFolderPath(newPath);
                      setPrivateCurrentFolder(newPath.length === 1 ? null : newPath[newPath.length - 1].id);
                    }}
                    className={`breadcrumb-link ${isLast ? 'active' : ''}`}
                  >
                    {pathItem.name}
                  </button>
                </span>
              );
            })}
          </div>
        </div>
        <button onClick={handleBackPrivateFolder} className="folder-back-btn">
          <span className="back-arrow">←</span> Back
        </button>
      </div>
    )}

    {privateCurrentFolder !== null ? (
      privateFolderFiles.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p className="empty-text">This folder is empty.</p>
        </div>
      ) : (
        <div className="files-list">
          {privateFolderFiles.map(file => (
            <div key={file._id} className="file-card">
              <div className="file-card-header" onDoubleClick={() => handlePreview(file)} style={{ cursor: 'pointer' }}>
                <span className="file-type-icon">{getFileIcon(file.filename)}</span>
                <div className="file-card-title">
                  <p className="file-name" title={file.filename}>{file.filename}</p>
                  <p className="file-meta">{formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}</p>
                </div>
              </div>
              <div className="file-card-actions">
                <div className="file-menu-container">
                  <button
                    className="file-menu-btn"
                    onClick={(e) => { e.stopPropagation(); toggleMenu(file._id, e); }}
                    title="More options"
                  >
                    ⋮
                  </button>
                  {showFileMenu === file._id && (
                    <div className="file-menu">
                      <button className="menu-item" onClick={() => { handleShare(file._id, file.filename); toggleMenu(null); }}>🔗 Share</button>
                      <button className="menu-item" onClick={() => { handlePreview(file); toggleMenu(null); }}>👁️ Preview</button>
                      <button className="menu-item" onClick={() => { handleRename(file._id, file.filename); toggleMenu(null); }}>✏️ Rename</button>
                      <button className="menu-item" onClick={() => { handleMoveToPrivateFolder(file._id, file.filename); toggleMenu(null); }}>📂 Move to Folder</button>
                      <button className="menu-item delete" onClick={() => { handleDelete(file._id); toggleMenu(null); }}>🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    ) : privateFiles.length === 0 && privateFolders.length === 0 ? (
      <div className="empty-state">
        <p className="empty-icon">🔒</p>
        <p className="empty-text">Nothing in Private yet.</p>
      </div>
    ) : (
      <div className="files-list">
        {privateCurrentFolder === null && privateFolders.map(folder => (
          <div key={folder._id} className="file-card" style={{ borderLeft: `4px solid ${folder.color || '#4A90E2'}` }}>
            <div className="file-card-header" onDoubleClick={() => handleOpenPrivateFolder(folder._id)} style={{ cursor: 'pointer' }}>
              <span className="file-type-icon">📂</span>
              <div className="file-card-title">
                <p className="file-name" title={folder.name}>{folder.name}</p>
                <p className="file-meta">Folder • {formatDate(folder.createdAt)}</p>
              </div>
            </div>
            <div className="file-card-actions">
              <div className="file-menu-container">
                <button
                  className="file-menu-btn"
                  onClick={(e) => { e.stopPropagation(); toggleMenu(folder._id, e); }}
                  title="More options"
                >
                  ⋮
                </button>
                {showFileMenu === folder._id && (
                  <div className="file-menu">
                  <button className="menu-item" onClick={() => { handleShareFolder(folder._id, folder.name); toggleMenu(null); }}>🔗 Share</button>
                  <button className="menu-item" onClick={() => { handleRenameFolder(folder._id, folder.name); toggleMenu(null); }}>✏️ Rename</button>
                  <button className="menu-item" onClick={() => { handleMoveFolderToAnotherFolder(folder._id, folder.name); toggleMenu(null); }}>📂 Move to Folder</button>
                  <button className="menu-item" onClick={() => { handleRemoveFolderFromPrivate(folder._id); toggleMenu(null); }}>🔓 Remove from Private</button>
                  <button className="menu-item delete" onClick={() => { handleDeleteFolder(folder._id); toggleMenu(null); }}>🗑️ Delete</button>
                  </div>
          )}
              </div>
            </div>
          </div>
        ))}

        {privateFiles.map(file => (
          <div key={file._id} className="file-card">
            <div className="file-card-header" onDoubleClick={() => handlePreview(file)} style={{ cursor: 'pointer' }}>
              <span className="file-type-icon">{getFileIcon(file.filename)}</span>
              <div className="file-card-title">
                <p className="file-name" title={file.filename}>{file.filename}</p>
                <p className="file-meta">{formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}</p>
              </div>
            </div>
            <div className="file-card-actions">
              <div className="file-menu-container">
                <button
                  className="file-menu-btn"
                  onClick={(e) => { e.stopPropagation(); toggleMenu(file._id, e); }}
                  title="More options"
                >
                  ⋮
                </button>
                {showFileMenu === file._id && (
                  <div className="file-menu">
                    <button className="menu-item" onClick={() => { handleShare(file._id, file.filename); toggleMenu(null); }}>🔗 Share</button>
                    <button className="menu-item" onClick={() => { handlePreview(file); toggleMenu(null); }}>👁️ Preview</button>
                    <button className="menu-item" onClick={() => { handleRename(file._id, file.filename); toggleMenu(null); }}>✏️ Rename</button>
                    <button className="menu-item" onClick={() => { handleMoveToPrivateFolder(file._id, file.filename); toggleMenu(null); }}>📂 Move to Folder</button>
                    <button className="menu-item" onClick={() => { handleRemoveFromPrivate(file._id); toggleMenu(null); }}>🔓 Remove from Private</button>
                    <button className="menu-item delete" onClick={() => { handleDelete(file._id); toggleMenu(null); }}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </>
      ) : activeTab === 'archives' ? (
      archivedFiles.length === 0 && archivedFolders.length === 0 ? (
      <div className="empty-state">
      <p className="empty-icon">📭</p>
      <p className="empty-text">No archived items.</p>
    </div>
  ) : (
    <div className="files-list">
      {archivedFolders.map(folder => (
        <div key={folder._id} className="file-card" style={{ borderLeft: `4px solid ${folder.color || '#4A90E2'}` }}>
          <div className="file-card-header">
            <span className="file-type-icon">📂</span>
            <div className="file-card-title">
              <p className="file-name" title={folder.name}>{folder.name}</p>
              <p className="file-meta">Folder • {formatDate(folder.createdAt)}</p>
            </div>
          </div>
          <div className="file-card-actions">
            <div className="file-menu-container">
              <button
                className="file-menu-btn"
                onClick={(e) => { e.stopPropagation(); toggleMenu(folder._id, e); }}
                title="More options"
              >
                ⋮
              </button>
              {showFileMenu === folder._id && (
                <div className="file-menu">
                  <button className="menu-item" onClick={() => { handleRenameFolder(folder._id, folder.name); toggleMenu(null); }}>✏️ Rename</button>
                  <button className="menu-item" onClick={() => { handleUnarchiveFolder(folder._id); toggleMenu(null); }}>↩️ Unarchive</button>
                  <button className="menu-item delete" onClick={() => { handleDeleteFolder(folder._id); toggleMenu(null); }}>🗑️ Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {displayFiles.map(file => (
                    <div key={file._id} className="file-card">
                      <div className="file-card-header" onDoubleClick={() => handlePreview(file)} style={{ cursor: 'pointer' }}>
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
                              <button className="menu-item" onClick={() => { handleMoveToPrivate(file._id); toggleMenu(null); }}>🔒 Move to Private</button>
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
                {!activeFilter && folders.map(folder => (
                  <div key={folder._id} className="file-card" style={{ borderLeft: `4px solid ${folder.color || '#4A90E2'}` }}>
                    <div className="file-card-header" onDoubleClick={() => handleOpenFolder(folder._id)} style={{ cursor: 'pointer' }}>                      <span className="file-type-icon">📂</span>
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
                         <button className="menu-item" onClick={() => { handleShareFolder(folder._id, folder.name); toggleMenu(null); }}>🔗 Share</button>
                         <button className="menu-item" onClick={() => { handleRenameFolder(folder._id, folder.name); toggleMenu(null); }}>✏️ Rename</button>
                          <button className="menu-item" onClick={() => { handleArchiveFolder(folder._id); toggleMenu(null); }}>📦 Archive</button>
                          <button className="menu-item" onClick={() => { handleMoveFolderToAnotherFolder(folder._id, folder.name); toggleMenu(null); }}>📂 Move to Folder</button>
                          <button className="menu-item" onClick={() => { handleMoveFolderToPrivate(folder._id); toggleMenu(null); }}>🔒 Move to Private</button>
                          <button className="menu-item delete" onClick={() => { handleDeleteFolder(folder._id); toggleMenu(null); }}>🗑️ Delete</button>
                         </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {displayFiles.map(file => (
                  <div key={file._id} className="file-card">
                    <div className="file-card-header" onDoubleClick={() => handlePreview(file)} style={{ cursor: 'pointer' }}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(file._id, e);
                          }}
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
                            <button className="menu-item" onClick={() => { handleMoveToPrivate(file._id); toggleMenu(null); }}>🔒 Move to Private</button>
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
                <p className="breakdown-size">{formatFileSize(getStorageByType(activeTab === 'archives' ? archivedFiles : files, /\.(jpg|jpeg|png|gif)$/i))}</p>
              </div>

              <div className="breakdown-card" onClick={() => setActiveFilter(activeFilter === 'documents' ? null : 'documents')} style={{ cursor: 'pointer', opacity: activeFilter === 'documents' ? 1 : 0.7, borderBottom: activeFilter === 'documents' ? '3px solid #4A90E2' : 'none', transition: 'all 0.3s' }}>
                <div className="breakdown-header"><span className="breakdown-icon">📄</span><span className="breakdown-name">Documents</span></div>
                <p className="breakdown-size">{formatFileSize(getStorageByType(activeTab === 'archives' ? archivedFiles : files, /\.(pdf|docx|doc|txt)$/i))}</p>
              </div>

              <div className="breakdown-card" onClick={() => setActiveFilter(activeFilter === 'archived' ? null : 'archived')} style={{ cursor: 'pointer', opacity: activeFilter === 'archived' ? 1 : 0.7, borderBottom: activeFilter === 'archived' ? '3px solid #4A90E2' : 'none', transition: 'all 0.3s' }}>
                <div className="breakdown-header"><span className="breakdown-icon">📦</span><span className="breakdown-name">Archived Files</span></div>
                <p className="breakdown-size">{formatFileSize(archivedFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0))}</p>
              </div>

              <div className="breakdown-card" onClick={() => setActiveFilter(activeFilter === 'media' ? null : 'media')} style={{ cursor: 'pointer', opacity: activeFilter === 'media' ? 1 : 0.7, borderBottom: activeFilter === 'media' ? '3px solid #4A90E2' : 'none', transition: 'all 0.3s' }}>
                <div className="breakdown-header"><span className="breakdown-icon">🎬</span><span className="breakdown-name">Media</span></div>
                <p className="breakdown-size">{formatFileSize(getStorageByType(activeTab === 'archives' ? archivedFiles : files, /\.(mp4|avi|mov|mkv|mp3)$/i))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} userEmail={userEmail} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <PreviewModal file={previewFile} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} token={token} />
      {showPinModal && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 2000
  }}>
    <div style={{ background: '#1a1f2e', borderRadius: '12px', padding: '30px', width: '90%', maxWidth: '360px' }}>
      <h2 style={{ color: 'white', marginBottom: '10px' }}>
        {pinMode === 'set' ? '🔒 Set Private PIN' : '🔒 Enter Private PIN'}
      </h2>
      <p style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>
        {pinMode === 'set' ? 'Create a PIN to protect your Private section.' : 'Enter your PIN to unlock Private.'}
      </p>
      <input
        type="password"
        placeholder="Enter PIN"
        value={pinInput}
        autoComplete="new-password"
        onChange={(e) => setPinInput(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', marginBottom: '10px' }}
      />
      {pinMode === 'set' && (
        <input
          type="password"
          placeholder="Confirm PIN"
          value={pinConfirmInput}
          autoComplete="new-password"
          onChange={(e) => setPinConfirmInput(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', marginBottom: '10px' }}
        />
      )}
      {pinError && <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '10px' }}>{pinError}</p>}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setShowPinModal(false)} style={{ flex: 1, padding: '10px', background: '#444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        <button onClick={handlePinSubmit} style={{ flex: 1, padding: '10px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {pinMode === 'set' ? 'Set PIN' : 'Unlock'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}