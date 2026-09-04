import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { getFiles, uploadFile, deleteFile, getStorageInfo, getRecentFiles, getArchivedFiles, renameFile, archiveFile, unarchiveFile, shareFile, getFolders, createFolder, renameFolder, deleteFolder, getFolderFiles, moveFileToFolder, setPrivatePin, verifyPrivatePin, checkPrivatePinExists, moveFileToPrivate, removeFileFromPrivate, getPrivateFiles, moveFolderToPrivate, removeFolderFromPrivate, getPrivateFolders, shareFolder, archiveFolder, unarchiveFolder, getArchivedFolders, moveFolderToFolder, editProfile, moveFileToTrash, moveFolderToTrash, getTrashItems, restoreFileFromTrash, restoreFolderFromTrash, permanentlyDeleteFile, permanentlyDeleteFolder, emptyTrash } from '../api';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import { createFeedback } from '../api';
import FeedbackModal from './FeedbackModal';
import PreviewModal from './PreviewModal';
import UploadModal from './UploadModal';
import { useTheme } from '../context/ThemeContext';
import CloudLogo from '../components/CloudLogo';

// ---- Simple line-style icons (replace emoji for a cleaner look) ----
const IconFiles = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    <path d="M9 3h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
  </svg>
);
const IconLock = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconArchive = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="3" width="20" height="5" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);
const IconTrash = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);
const IconSettings = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);
const IconDrive = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="22" y1="12" x2="2" y2="12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    <line x1="6" y1="16" x2="6.01" y2="16" />
    <line x1="10" y1="16" x2="10.01" y2="16" />
  </svg>
);
const IconVideo = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M22 8.5v7l-6-3.5 6-3.5Z" />
  </svg>
);
const IconImage = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
const IconFileText = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);
const IconPackage = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="M3.27 6.96 12 12l8.73-5.04" />
    <path d="M12 22.08V12" />
  </svg>
);
const IconFolder = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />
  </svg>
);
const IconSun = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const IconMoon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);
const IconGridView = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconListView = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconUser = (props) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBell = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
const IconKey = (props) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);
const IconMessage = (props) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </svg>
);
const IconLogOut = (props) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconShare = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
  </svg>
);
const IconEdit = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const IconEye = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconRotateCcw = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const IconUnlock = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const IconRestore = IconRotateCcw;
const IconDeleteForever = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <line x1="10" y1="11" x2="14" y2="15" />
    <line x1="14" y1="11" x2="10" y2="15" />
  </svg>
);

const IconFolderPlus = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

export default function Dashboard({ token, onLogout }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [storageInfo, setStorageInfo] = useState({ storageUsed: 0, storageLimit: 5 * 1024 * 1024 * 1024 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
  const [previewFileList, setPreviewFileList] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [privateFiles, setPrivateFiles] = useState([]);
  const [privateFolders, setPrivateFolders] = useState([]);
  const [isPrivateUnlocked, setIsPrivateUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState('verify'); // 'verify' or 'set'
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [privateCurrentFolder, setPrivateCurrentFolder] = useState(null);
  const [privateFolderPath, setPrivateFolderPath] = useState([{ name: 'Private', id: null }]);
  const [privateFolderFiles, setPrivateFolderFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [settingsSubTab, setSettingsSubTab] = useState('profile');
  const [profileFullName, setProfileFullName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifShareActivity, setNotifShareActivity] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [notifSavedMessage, setNotifSavedMessage] = useState('');
  const [trashItems, setTrashItems] = useState({ files: [], folders: [] });
  const [trashLoading, setTrashLoading] = useState(false);
  const [selectedTrashIds, setSelectedTrashIds] = useState([]);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
  const [feedbackSentMessage, setFeedbackSentMessage] = useState('');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadDashboardData();
    const name = localStorage.getItem('userName') || 'User';
    const email = localStorage.getItem('userEmail') || 'user@example.com';
    setUserName(name);
    setUserEmail(email);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
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

      const [filesData, storageData, recentData, foldersData, archivedData, archivedFoldersData] = await Promise.all([
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

  // Uploads one file, placing it in the right spot depending on where the
  // person is browsing (My Files folder / Private / Archive). Used by both
  // the classic hidden file input and the new drag-and-drop UploadModal.
  // Calls onProgress(percent) as the upload streams.
  const uploadSingleFile = async (file, onProgress) => {
    const targetFolderId = activeTab === 'files' ? currentFolder : null;

    const uploadResponse = await uploadFile(file, token, onProgress, targetFolderId);

    const newFileId =
      uploadResponse?.file?._id ||
      uploadResponse?.file?.id ||
      uploadResponse?.fileId ||
      uploadResponse?._id ||
      null;

    if (activeTab === 'private' && newFileId) {
      try {
        await moveFileToPrivate(newFileId, token);
        if (privateCurrentFolder) {
          await moveFileToFolder(newFileId, privateCurrentFolder, token);
        }
      } catch (err) {
        console.error('Failed to move uploaded file into Private:', err);
      }
    } else if (activeTab === 'archives' && newFileId) {
      try {
        await archiveFile(newFileId, token);
      } catch (err) {
        console.error('Failed to archive uploaded file:', err);
      }
    }

    return uploadResponse;
  };

  // Refreshes whichever view is currently open after one or more uploads finish.
  const refreshAfterUpload = async () => {
    const targetFolderId = activeTab === 'files' ? currentFolder : null;

    if (activeTab === 'files' && targetFolderId) {
      const response = await getFolderFiles(targetFolderId, token);
      if (response.success) {
        setFiles(response.files || []);
        setFolders(response.folders || []);
      }
    } else if (activeTab === 'private') {
      if (privateCurrentFolder) {
        const refreshed = await getFolderFiles(privateCurrentFolder, token);
        setPrivateFolderFiles(refreshed.files || []);
      } else {
        await loadPrivateData();
      }
      loadDashboardData();
    } else {
      loadDashboardData();
    }
  };

  // Classic single-file input handler (kept for the hidden <input>, still
  // used as a fallback / for any leftover direct triggers).
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      await uploadSingleFile(file, (percent) => setUploadProgress(percent));
      setUploadProgress(100);
      setTimeout(async () => {
        setUploading(false);
        setUploadProgress(0);
        await refreshAfterUpload();
      }, 400);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      alert('❌ Upload failed: ' + error.message);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Move this file to Trash?')) {
      try {
        await moveFileToTrash(fileId, token);
        loadDashboardData();
      } catch (error) {
        console.error('Delete error:', error);
        alert('❌ Failed to move file to Trash');
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
    if (window.confirm('Move this folder and everything inside it to Trash?')) {
      try {
        const response = await moveFolderToTrash(folderId, token);
        if (response.success) {
          loadDashboardData();
        } else {
          alert('❌ Error: ' + response.message);
        }
      } catch (error) {
        console.error('Delete folder error:', error);
        alert('❌ Failed to move folder to Trash');
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
      setShowPin(false);
      setShowPinConfirm(false);
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
    // Figure out which list of files this preview should navigate through,
    // based on where the person is browsing right now.
    let list;
    if (activeTab === 'private') {
      list = privateCurrentFolder !== null ? privateFolderFiles : privateFiles;
    } else if (activeTab === 'archives') {
      list = archivedFiles;
    } else if (activeTab === 'shared') {
      list = files.filter(f => f.shareLink);
    } else {
      list = filteredFiles;
    }
    const idx = list.findIndex(f => f._id === file._id);
    setPreviewFileList(list);
    setPreviewIndex(idx >= 0 ? idx : 0);
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const goToPreviewIndex = (newIndex) => {
    if (newIndex < 0 || newIndex >= previewFileList.length) return;
    setPreviewIndex(newIndex);
    setPreviewFile(previewFileList[newIndex]);
  };

  // ---- Trash page handlers ----
  const loadTrashData = async () => {
    setTrashLoading(true);
    try {
      const result = await getTrashItems(token);
      setTrashItems({ files: result.files || [], folders: result.folders || [] });
      setSelectedTrashIds([]);
    } catch (error) {
      console.error('Error loading trash:', error);
    } finally {
      setTrashLoading(false);
    }
  };

  const toggleSelectTrashItem = (id) => {
    setSelectedTrashIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const allTrashIds = () => [
    ...trashItems.files.map(f => f._id),
    ...trashItems.folders.map(f => f._id),
  ];

  const toggleSelectAllTrash = () => {
    const all = allTrashIds();
    setSelectedTrashIds(prev => (prev.length === all.length ? [] : all));
  };

  const handleRestoreTrashItem = async (id, type) => {
    try {
      if (type === 'file') {
        await restoreFileFromTrash(id, token);
      } else {
        await restoreFolderFromTrash(id, token);
      }
      loadTrashData();
      loadDashboardData();
    } catch (error) {
      alert('❌ Failed to restore item');
    }
  };

  const handlePermanentDeleteTrashItem = async (id, type) => {
    if (!window.confirm('Permanently delete this? This cannot be undone.')) return;
    try {
      if (type === 'file') {
        await permanentlyDeleteFile(id, token);
      } else {
        await permanentlyDeleteFolder(id, token);
      }
      loadTrashData();
    } catch (error) {
      alert('❌ Failed to permanently delete item');
    }
  };

  const handleDeleteSelectedTrash = async () => {
    if (selectedTrashIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedTrashIds.length} selected item(s)? This cannot be undone.`)) return;
    try {
      const fileIds = trashItems.files.filter(f => selectedTrashIds.includes(f._id)).map(f => f._id);
      const folderIds = trashItems.folders.filter(f => selectedTrashIds.includes(f._id)).map(f => f._id);
      await Promise.all([
        ...fileIds.map(id => permanentlyDeleteFile(id, token)),
        ...folderIds.map(id => permanentlyDeleteFolder(id, token)),
      ]);
      loadTrashData();
    } catch (error) {
      alert('❌ Failed to delete selected items');
    }
  };

  const handleEmptyTrash = async () => {
    if (allTrashIds().length === 0) return;
    if (!window.confirm('Permanently delete everything in Trash? This cannot be undone.')) return;
    try {
      await emptyTrash(token);
      loadTrashData();
    } catch (error) {
      alert('❌ Failed to empty Trash');
    }
  };

  const trashDaysLeft = (deletedAt) => {
    if (!deletedAt) return 15;
    const deletedTime = new Date(deletedAt).getTime();
    const expiresTime = deletedTime + 15 * 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((expiresTime - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  const handleSubmitFeedback = async () => {
  if (!feedbackSubject.trim() || !feedbackMessage.trim()) {
    setFeedbackSentMessage('Please fill in subject and message.');
    setTimeout(() => setFeedbackSentMessage(''), 2500);
    return;
  }
  try {
    const res = await createFeedback(token, {
      subject: feedbackSubject,
      message: feedbackMessage,
      rating: feedbackRating,
    });
    if (res.success) {
      setFeedbackSentMessage('Thanks for your feedback!');
      setFeedbackSubject('');
      setFeedbackMessage('');
      setFeedbackRating(5);
    } else {
      setFeedbackSentMessage(res.message || 'Failed to send feedback.');
    }
  } catch (err) {
    setFeedbackSentMessage('Something went wrong. Please try again.');
  }
  setTimeout(() => setFeedbackSentMessage(''), 2500);
};

  const handleSaveInlineProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');
    try {
      const response = await editProfile(token, {
        fullName: profileFullName,
        phone: profilePhone,
        bio: profileBio
      });
      if (response.success) {
        setProfileMessage('Profile updated successfully!');
        const newName = response.user?.fullName || profileFullName;
        setUserName(newName);
        localStorage.setItem('userName', newName);
      } else {
        setProfileError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setProfileError('Failed to update profile');
    }
    setProfileSaving(false);
  };

  if (activeFilter === 'images') {
    filteredFiles = filteredFiles.filter(f => f.filename.match(/\.(jpg|jpeg|png|gif)$/i));
  } else if (activeFilter === 'documents') {
    filteredFiles = filteredFiles.filter(f => f.filename.match(/\.(pdf|docx|doc|txt)$/i));
  } else if (activeFilter === 'media') {
    filteredFiles = filteredFiles.filter(f => f.filename.match(/\.(mp4|avi|mov|mkv|mp3)$/i));
  } else if (activeFilter === 'archived') {
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

  const isImageFile = (filename) => !!filename.match(/\.(jpg|jpeg|png|gif)$/i);

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

  // Navigate between sidebar sections, resetting Private lock when leaving it
  const navigateTab = (tab) => {
    setShowSidebar(false);
    setActiveFilter(null);
    if (tab === 'private') {
      handleOpenPrivateSection();
      return;
    }
    if (activeTab === 'private' && isPrivateUnlocked) {
      setIsPrivateUnlocked(false);
    }
    if (tab === 'settings') {
      setProfileFullName(userName);
      setProfileMessage('');
      setProfileError('');
      setSettingsSubTab('profile');
    }
    if (tab === 'trash') {
      loadTrashData();
    }
    setActiveTab(tab);
  };

  // Jump straight into a specific Settings sub-tab (used by the user dropdown menu)
  const goToSettingsTab = (subTab) => {
    setShowUserDropdown(false);
    setShowSidebar(false);
    setActiveFilter(null);
    if (activeTab === 'private' && isPrivateUnlocked) {
      setIsPrivateUnlocked(false);
    }
    setProfileFullName(userName);
    setProfileMessage('');
    setProfileError('');
    setSettingsSubTab(subTab);
    setActiveTab('settings');
  };

  // ---- Storage breakdown (per-category) ----
  const breakdownSourceFiles = activeTab === 'archives' ? archivedFiles : files;
  const imagesSize = getStorageByType(breakdownSourceFiles, /\.(jpg|jpeg|png|gif)$/i);
  const documentsSize = getStorageByType(breakdownSourceFiles, /\.(pdf|docx|doc|txt)$/i);
  const archivesSize = getStorageByType(breakdownSourceFiles, /\.(zip|rar|7z)$/i);
  const videosSize = getStorageByType(breakdownSourceFiles, /\.(mp4|avi|mov|mkv|mp3)$/i);
  const knownSize = imagesSize + documentsSize + archivesSize + videosSize;
  const otherSize = Math.max(0, storageUsed - knownSize);

  const breakdownCategories = [
    { key: 'videos', label: 'Videos', icon: <IconVideo />, size: videosSize, color: '#0ea5e9' },
    { key: 'images', label: 'Images', icon: <IconImage />, size: imagesSize, color: '#22c3a6' },
    { key: 'documents', label: 'Documents', icon: <IconFileText />, size: documentsSize, color: '#2563eb' },
    { key: 'archives', label: 'Archives', icon: <IconPackage />, size: archivesSize, color: '#0f2f4f' },
    { key: 'other', label: 'Other', icon: <IconFolder />, size: otherSize, color: '#cbd5e1' },
  ];

  const renderStorageBreakdownInner = () => (
    <>
      <div className="storage-card-header">
        <span className="storage-card-icon"><IconDrive /></span>
        <div className="storage-card-title-group">
          <p className="storage-card-title">Storage breakdown</p>
          <p className="storage-card-sub">{storageUsedGB} GB of {storageLimitGB} GB used</p>
        </div>
        <span className="storage-percent-badge">{storagePercent.toFixed(0)}%</span>
      </div>

      <div className="storage-total-bar">
        <div className="storage-total-fill" style={{ width: `${Math.min(storagePercent, 100)}%` }}></div>
      </div>

      {breakdownCategories.map(cat => {
        const pct = storageUsed > 0 ? (cat.size / storageUsed) * 100 : 0;
        return (
          <div key={cat.key} className="storage-category">
            <div className="storage-category-row">
              <span className="storage-category-label"><span className="storage-category-icon">{cat.icon}</span> {cat.label}</span>
              <span className="storage-category-value">{formatFileSize(cat.size)}</span>
            </div>
            <div className="storage-category-bar">
              <div className="storage-category-fill" style={{ width: `${Math.min(pct, 100)}%`, background: cat.color }}></div>
            </div>
          </div>
        );
      })}
    </>
  );

  // ---- Reusable tile renderers (used across Files / Archives / Private) ----
  const renderFolderTile = (folder, menuItems, onOpen) => (
    <div key={folder._id} className="grid-tile folder-tile">
      <div
        className="tile-thumb folder-thumb"
        style={{ borderColor: folder.color || undefined }}
        onDoubleClick={onOpen}
      >
        <span className="tile-thumb-icon">📁</span>
        <span className="tile-badge">FOLDER</span>
      </div>
      <div className="tile-info">
        <p className="tile-name" title={folder.name}>{folder.name}</p>
        <p className="tile-meta">Folder • {formatDate(folder.createdAt)}</p>
      </div>
      <div className="tile-footer">
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
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  className={`menu-item ${item.danger ? 'delete' : ''}`}
                  onClick={() => { item.onClick(); toggleMenu(null); }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFileTile = (file, menuItems, onOpen) => (
    <div key={file._id} className="grid-tile file-tile">
      <div className="tile-thumb file-thumb" onDoubleClick={onOpen}>
        <span className="tile-thumb-icon">{getFileIcon(file.filename)}</span>
        <span className="tile-badge">{isImageFile(file.filename) ? 'IMG' : 'FILE'}</span>
      </div>
      <div className="tile-info">
        <p className="tile-name" title={file.filename}>{file.filename}</p>
        <p className="tile-meta">{formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}</p>
      </div>
      <div className="tile-footer">
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
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  className={`menu-item ${item.danger ? 'delete' : ''}`}
                  onClick={() => { item.onClick(); toggleMenu(null); }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const sidebarNavItems = [
    { key: 'files', label: 'My Files', icon: <IconFiles />, count: files.length + folders.length },
    { key: 'private', label: 'Private', icon: <IconLock />, count: privateFiles.length + privateFolders.length },
    { key: 'archives', label: 'Archive', icon: <IconArchive />, count: archivedFiles.length + archivedFolders.length },
    { key: 'trash', label: 'Trash', icon: <IconTrash />, count: trashItems.files.length + trashItems.folders.length },
    { key: 'settings', label: 'Settings', icon: <IconSettings />, count: null },
  ];

  const currentBreadcrumb = activeTab === 'private' ? privateFolderPath : folderPath;
  const currentPageTitle =
    activeTab === 'files' ? 'My Files' :
    activeTab === 'private' ? 'Private' :
    activeTab === 'shared' ? 'Shared' :
    activeTab === 'archives' ? 'Archive' :
    activeTab === 'trash' ? 'Trash' : 'Settings';

  const currentItemCount =
    activeTab === 'files' ? files.length + folders.length :
    activeTab === 'private' ? privateFiles.length + privateFolders.length :
    activeTab === 'archives' ? archivedFiles.length + archivedFolders.length :
    activeTab === 'shared' ? files.filter(f => f.shareLink).length : 0;

  return (
    <div className="dashboard-container">
      {/* ===== Top App Header ===== */}
      <header className="app-header">
        <div className="app-header-left">
          <button
          className={`sidebar-menu-btn mobile-only ${showSidebar ? 'active' : ''}`}
          onClick={() => setShowSidebar(!showSidebar)}
          title="Menu"
        >
          ☰
        </button>
          <div className="app-logo">
            <CloudLogo width={28} height={28} color="#0ea5e9" />
            <span className="app-logo-text">Cloud File Sharing</span>
          </div>
        </div>

        <div className="search-container">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoComplete="off"
          />
        </div>

        <button
          className="notification-bell-btn"
          onClick={() => goToSettingsTab('notifications')}
          title="Notifications"
        >
          <IconBell />
        </button>
        <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
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
              <button onClick={() => goToSettingsTab('profile')} className="dropdown-item">
                <IconUser /> Edit profile
              </button>
              <button onClick={() => goToSettingsTab('security')} className="dropdown-item">
                <IconKey /> Change password
              </button>
              <button onClick={() => goToSettingsTab('feedback')} className="dropdown-item">
                <IconMessage /> Feedback
              </button>
              <button className="dropdown-item logout" onClick={() => {
                setShowUserDropdown(false);
                onLogout();
              }}>
                <IconLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        {/* ===== Sidebar Navigation ===== */}
        <aside ref={sidebarRef} className={`app-sidebar ${showSidebar ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            {sidebarNavItems.map(item => (
              <button
                key={item.key}
                className={`sidebar-nav-item ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => navigateTab(item.key)}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
                {item.count !== null && <span className="sidebar-nav-count">{item.count}</span>}
              </button>
            ))}
          </nav>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden-input"
          />
        </aside>
        {showSidebar && (
          <div
            className="sidebar-overlay"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* ===== Main Content ===== */}
        <main className="app-main">
          {/* Breadcrumb */}
          <div className="breadcrumb-row">
            <button
              className="breadcrumb-crumb link"
              onClick={() => {
                setFolderPath([{ name: 'My Files', id: null }]);
                setCurrentFolder(null);
                navigateTab('files');
                loadDashboardData();
              }}
            >
              Home
            </button>
            {activeTab === 'files' && folderPath.map((p, i) => (
              <React.Fragment key={i}>
                <span className="breadcrumb-arrow">›</span>
                <button
                  className="breadcrumb-crumb link"
                  onClick={() => {
                    const newPath = folderPath.slice(0, i + 1);
                    setFolderPath(newPath);
                    setCurrentFolder(newPath[newPath.length - 1].id);
                    if (i === 0) loadDashboardData();
                  }}
                >
                  {p.name}
                </button>
              </React.Fragment>
            ))}
            {activeTab === 'private' && privateFolderPath.map((p, i) => (
              <React.Fragment key={i}>
                <span className="breadcrumb-arrow">›</span>
                <span className="breadcrumb-crumb">{p.name}</span>
              </React.Fragment>
            ))}
            {activeTab !== 'files' && activeTab !== 'private' && (
              <>
                <span className="breadcrumb-arrow">›</span>
                <span className="breadcrumb-crumb">{currentPageTitle}</span>
              </>
            )}
          </div>

          {/* Page title row */}
          <div className="page-title-row">
            <div className="page-title-left">
              <h1 className="page-title">{currentPageTitle}</h1>
              <p className="page-subtitle">{currentItemCount} items</p>
            </div>
            <div className="page-title-right">
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <IconGridView />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <IconListView />
                </button>
              </div>
              {activeTab === 'files' && (
                <button className="new-folder-btn" onClick={handleCreateFolder}>
                  <IconFolderPlus /> New Folder
                </button>
              )}
              {activeTab !== 'trash' && (
                <button className="upload-btn-primary" onClick={() => setIsUploadModalOpen(true)}>
                  ☁️ Upload
                </button>
              )}
            </div>
          </div>

          {uploading && (
            <div className="upload-progress-container">
              <div className="upload-progress">
                <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="upload-progress-text">Uploading... {uploadProgress.toFixed(0)}%</p>
            </div>
          )}

          <div className={`content-grid-wrapper ${(activeTab === 'settings' || activeTab === 'trash') ? 'settings-mode' : ''}`}>
            {/* ===== Files grid area ===== */}
            <div className={`files-grid-area ${viewMode === 'list' ? 'list-view' : ''}`}>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading your files...</p>
                </div>

              ) : activeTab === 'private' ? (
                !isPrivateUnlocked ? (
                  <div className="empty-state">
                    <p className="empty-icon">🔒</p>
                    <p className="empty-text">Enter your PIN to view Private files.</p>
                  </div>
                ) : privateCurrentFolder !== null ? (
                  privateFolderFiles.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-icon">📭</p>
                      <p className="empty-text">This folder is empty.</p>
                    </div>
                  ) : (
                    <div className="tile-grid">
                      {privateFolderFiles.map(file => renderFileTile(file, [
                        { label: <><IconShare /> Share</>, onClick: () => handleShare(file._id, file.filename) },
                        { label: <><IconEye /> Preview</>, onClick: () => handlePreview(file) },
                        { label: <><IconEdit /> Rename</>, onClick: () => handleRename(file._id, file.filename) },
                        { label: <><IconFolder /> Move to Folder</>, onClick: () => handleMoveToPrivateFolder(file._id, file.filename) },
                        { label: <><IconTrash /> Delete</>, onClick: () => handleDelete(file._id), danger: true },
                      ], () => handlePreview(file)))}
                    </div>
                  )
                ) : privateFiles.length === 0 && privateFolders.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-icon">🔒</p>
                    <p className="empty-text">Nothing in Private yet.</p>
                  </div>
                ) : (
                  <div className="tile-grid">
                    {privateFolders.map(folder => renderFolderTile(folder, [
                      { label: <><IconShare /> Share</>, onClick: () => handleShareFolder(folder._id, folder.name) },
                      { label: <><IconEdit /> Rename</>, onClick: () => handleRenameFolder(folder._id, folder.name) },
                      { label: <><IconFolder /> Move to Folder</>, onClick: () => handleMoveFolderToAnotherFolder(folder._id, folder.name) },
                      { label: <><IconUnlock /> Remove from Private</>, onClick: () => handleRemoveFolderFromPrivate(folder._id) },
                      { label: <><IconTrash /> Delete</>, onClick: () => handleDeleteFolder(folder._id), danger: true },
                    ], () => handleOpenPrivateFolder(folder._id)))}
                    {privateFiles.map(file => renderFileTile(file, [
                      { label: <><IconShare /> Share</>, onClick: () => handleShare(file._id, file.filename) },
                      { label: <><IconEye /> Preview</>, onClick: () => handlePreview(file) },
                      { label: <><IconEdit /> Rename</>, onClick: () => handleRename(file._id, file.filename) },
                      { label: <><IconFolder /> Move to Folder</>, onClick: () => handleMoveToPrivateFolder(file._id, file.filename) },
                      { label: <><IconUnlock /> Remove from Private</>, onClick: () => handleRemoveFromPrivate(file._id) },
                      { label: <><IconTrash /> Delete</>, onClick: () => handleDelete(file._id), danger: true },
                    ], () => handlePreview(file)))}
                  </div>
                )

              ) : activeTab === 'archives' ? (
                archivedFiles.length === 0 && archivedFolders.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-icon">📭</p>
                    <p className="empty-text">No archived items.</p>
                  </div>
                ) : (
                  <div className="tile-grid">
                    {archivedFolders.map(folder => renderFolderTile(folder, [
                      { label: <><IconEdit /> Rename</>, onClick: () => handleRenameFolder(folder._id, folder.name) },
                      { label: <><IconRotateCcw /> Unarchive</>, onClick: () => handleUnarchiveFolder(folder._id) },
                      { label: <><IconTrash /> Delete</>, onClick: () => handleDeleteFolder(folder._id), danger: true },
                    ], () => {}))}
                    {displayFiles.map(file => renderFileTile(file, [
                      { label: <><IconShare /> Share</>, onClick: () => handleShare(file._id, file.filename) },
                      { label: <><IconEye /> Preview</>, onClick: () => handlePreview(file) },
                      { label: <><IconFolder /> Move to Folder</>, onClick: () => handleMoveToFolder(file._id, file.filename) },
                      { label: <><IconLock /> Move to Private</>, onClick: () => handleMoveToPrivate(file._id) },
                      { label: <><IconEdit /> Rename</>, onClick: () => handleRename(file._id, file.filename) },
                      { label: <><IconRotateCcw /> Unarchive</>, onClick: () => handleUnarchive(file._id) },
                      { label: <><IconTrash /> Delete</>, onClick: () => handleDelete(file._id), danger: true },
                    ], () => handlePreview(file)))}
                  </div>
                )

              ) : activeTab === 'shared' ? (
                files.filter(f => f.shareLink).length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-icon">🔗</p>
                    <p className="empty-text">You haven't shared any files yet.</p>
                  </div>
                ) : (
                  <div className="tile-grid">
                    {files.filter(f => f.shareLink).map(file => renderFileTile(file, [
                      { label: <><IconShare /> Copy Link</>, onClick: () => { navigator.clipboard.writeText(file.shareLink); alert('✅ Link copied!'); } },
                      { label: <><IconEye /> Preview</>, onClick: () => handlePreview(file) },
                    ], () => handlePreview(file)))}
                  </div>
                )

              ) : activeTab === 'trash' ? (
                trashLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading Trash...</p>
                  </div>
                ) : trashItems.files.length === 0 && trashItems.folders.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-icon">🗑️</p>
                    <p className="empty-text">Trash is empty.</p>
                  </div>
                ) : (
                  <>
                    <div className="trash-toolbar">
                      <label className="trash-select-all">
                        <input
                          type="checkbox"
                          checked={selectedTrashIds.length > 0 && selectedTrashIds.length === allTrashIds().length}
                          onChange={toggleSelectAllTrash}
                        />
                        Select all
                      </label>
                      <div className="trash-toolbar-actions">
                        {selectedTrashIds.length > 0 && (
                          <button className="trash-delete-selected-btn" onClick={handleDeleteSelectedTrash}>
                            <IconDeleteForever /> Delete selected ({selectedTrashIds.length})
                          </button>
                        )}
                        <button className="trash-empty-btn" onClick={handleEmptyTrash}>
                          <IconDeleteForever /> Delete all
                        </button>
                      </div>
                    </div>
                    <p className="trash-notice">Items are permanently deleted 15 days after being moved to Trash.</p>

                    <div className="tile-grid">
                      {trashItems.folders.map(folder => (
                        <div key={folder._id} className="grid-tile folder-tile trash-tile">
                          <label className="trash-tile-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedTrashIds.includes(folder._id)}
                              onChange={() => toggleSelectTrashItem(folder._id)}
                            />
                          </label>
                          <div className="tile-thumb folder-thumb">
                            <span className="tile-thumb-icon">📁</span>
                            <span className="tile-badge">FOLDER</span>
                          </div>
                          <div className="tile-info">
                            <p className="tile-name" title={folder.name}>{folder.name}</p>
                            <p className="tile-meta">{trashDaysLeft(folder.deletedAt)} days left</p>
                          </div>
                          <div className="tile-footer">
                            <div className="file-menu-container">
                              <button
                                className="file-menu-btn"
                                onClick={(e) => { e.stopPropagation(); toggleMenu(folder._id, e); }}
                              >
                                ⋮
                              </button>
                              {showFileMenu === folder._id && (
                                <div className="file-menu">
                                  <button className="menu-item" onClick={() => { handleRestoreTrashItem(folder._id, 'folder'); toggleMenu(null); }}>
                                    <IconRestore /> Restore
                                  </button>
                                  <button className="menu-item delete" onClick={() => { handlePermanentDeleteTrashItem(folder._id, 'folder'); toggleMenu(null); }}>
                                    <IconDeleteForever /> Delete forever
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {trashItems.files.map(file => (
                        <div key={file._id} className="grid-tile file-tile trash-tile">
                          <label className="trash-tile-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedTrashIds.includes(file._id)}
                              onChange={() => toggleSelectTrashItem(file._id)}
                            />
                          </label>
                          <div className="tile-thumb file-thumb">
                            <span className="tile-thumb-icon">{getFileIcon(file.filename)}</span>
                            <span className="tile-badge">{isImageFile(file.filename) ? 'IMG' : 'FILE'}</span>
                          </div>
                          <div className="tile-info">
                            <p className="tile-name" title={file.filename}>{file.filename}</p>
                            <p className="tile-meta">{formatFileSize(file.fileSize)} • {trashDaysLeft(file.deletedAt)} days left</p>
                          </div>
                          <div className="tile-footer">
                            <div className="file-menu-container">
                              <button
                                className="file-menu-btn"
                                onClick={(e) => { e.stopPropagation(); toggleMenu(file._id, e); }}
                              >
                                ⋮
                              </button>
                              {showFileMenu === file._id && (
                                <div className="file-menu">
                                  <button className="menu-item" onClick={() => { handleRestoreTrashItem(file._id, 'file'); toggleMenu(null); }}>
                                    <IconRestore /> Restore
                                  </button>
                                  <button className="menu-item delete" onClick={() => { handlePermanentDeleteTrashItem(file._id, 'file'); toggleMenu(null); }}>
                                    <IconDeleteForever /> Delete forever
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )

              ) : activeTab === 'settings' ? (
                <div className="settings-page">
                  {/* Profile summary card */}
                  <div className="settings-profile-card">
                    <div className="settings-avatar-large">{userName.charAt(0).toUpperCase()}</div>
                    <div className="settings-profile-info">
                      <p className="settings-profile-name">{userName}</p>
                      <p className="settings-profile-email">{userEmail}</p>
                    </div>
                    <button className="settings-change-photo-btn" disabled title="Coming soon">
                      Change photo
                    </button>
                  </div>

                  {/* Sub tabs */}
                  <div className="settings-tabs">
                    <button
                      className={`settings-tab-btn ${settingsSubTab === 'profile' ? 'active' : ''}`}
                      onClick={() => setSettingsSubTab('profile')}
                    >
                      👤 Profile
                    </button>
                    <button
                      className={`settings-tab-btn ${settingsSubTab === 'security' ? 'active' : ''}`}
                      onClick={() => setSettingsSubTab('security')}
                    >
                      🔑 Security
                    </button>
                    <button
                      className={`settings-tab-btn ${settingsSubTab === 'notifications' ? 'active' : ''}`}
                      onClick={() => setSettingsSubTab('notifications')}
                    >
                      🔔 Notifications
                    </button>
                    <button
                      className={`settings-tab-btn ${settingsSubTab === 'storage' ? 'active' : ''}`}
                      onClick={() => setSettingsSubTab('storage')}
                    >
                      💾 Storage
                    </button>
                    <button
                      className={`settings-tab-btn ${settingsSubTab === 'feedback' ? 'active' : ''}`}
                      onClick={() => setSettingsSubTab('feedback')}
                    >
                      💬 Feedback
                    </button>
                  </div>

                  {/* Profile sub-tab */}
                  {settingsSubTab === 'profile' && (
                    <div className="settings-section-card">
                      <h3 className="settings-section-title">Personal information</h3>
                      <p className="settings-section-desc">This is how your name appears on shared files.</p>

                      {profileError && <div className="settings-alert error">{profileError}</div>}
                      {profileMessage && <div className="settings-alert success">{profileMessage}</div>}

                      <form onSubmit={handleSaveInlineProfile}>
                        <div className="settings-form-grid">
                          <div className="settings-field">
                            <label className="settings-field-label">Full name</label>
                            <input
                              className="settings-field-input"
                              type="text"
                              value={profileFullName}
                              onChange={(e) => setProfileFullName(e.target.value)}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div className="settings-field">
                            <label className="settings-field-label">Email</label>
                            <input
                              className="settings-field-input"
                              type="email"
                              value={userEmail}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="settings-field">
                          <label className="settings-field-label">Phone (Optional)</label>
                          <input
                            className="settings-field-input"
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div className="settings-field">
                          <label className="settings-field-label">Bio</label>
                          <textarea
                            className="settings-field-input"
                            rows="3"
                            value={profileBio}
                            onChange={(e) => setProfileBio(e.target.value)}
                            placeholder="Tell us about yourself"
                          />
                        </div>

                        <button type="submit" className="settings-save-btn" disabled={profileSaving}>
                          {profileSaving ? 'Saving...' : 'Save changes'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Security sub-tab */}
                  {settingsSubTab === 'security' && (
                    <div className="settings-section-card">
                      <h3 className="settings-section-title">Password &amp; access</h3>
                      <p className="settings-section-desc">Keep your account protected with a strong password.</p>

                      <div className="settings-field">
                        <label className="settings-field-label">Current password</label>
                        <input
                          className="settings-field-input"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="settings-form-grid">
                        <div className="settings-field">
                          <label className="settings-field-label">New password</label>
                          <input
                            className="settings-field-input"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="settings-field">
                          <label className="settings-field-label">Confirm password</label>
                          <input
                            className="settings-field-input"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <button
                        className="settings-save-btn"
                        onClick={() => setIsChangePasswordOpen(true)}
                      >
                        Update password
                      </button>

                      <div className="settings-divider"></div>

                      <div className="settings-toggle-row">
                        <div>
                          <p className="settings-toggle-title">🛡️ Two-factor authentication</p>
                          <p className="settings-toggle-desc">Require a one-time code from your authenticator app at sign in.</p>
                        </div>
                        <button
                          className={`settings-switch ${twoFactorEnabled ? 'on' : ''}`}
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                          title="Not connected to backend yet"
                        >
                          <span className="settings-switch-knob"></span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notifications sub-tab */}
                  {settingsSubTab === 'notifications' && (
                    <div className="settings-section-card">
                      <h3 className="settings-section-title">Notifications</h3>
                      <p className="settings-section-desc">Choose what we email you about.</p>

                      <div className="settings-toggle-row">
                        <div>
                          <p className="settings-toggle-title">Share activity</p>
                          <p className="settings-toggle-desc">When someone opens or comments on a shared file.</p>
                        </div>
                        <button
                          className={`settings-switch ${notifShareActivity ? 'on' : ''}`}
                          onClick={() => setNotifShareActivity(!notifShareActivity)}
                        >
                          <span className="settings-switch-knob"></span>
                        </button>
                      </div>

                      <div className="settings-toggle-row">
                        <div>
                          <p className="settings-toggle-title">Weekly digest</p>
                          <p className="settings-toggle-desc">A summary of uploads and storage each Monday.</p>
                        </div>
                        <button
                          className={`settings-switch ${notifWeeklyDigest ? 'on' : ''}`}
                          onClick={() => setNotifWeeklyDigest(!notifWeeklyDigest)}
                        >
                          <span className="settings-switch-knob"></span>
                        </button>
                      </div>

                      {notifSavedMessage && <div className="settings-alert success">{notifSavedMessage}</div>}

                      <button
                        className="settings-save-btn"
                        onClick={() => {
                          setNotifSavedMessage('Preferences saved!');
                          setTimeout(() => setNotifSavedMessage(''), 2000);
                        }}
                      >
                        Save preferences
                      </button>
                    </div>
                  )}

                  {/* Storage sub-tab */}
                  {settingsSubTab === 'storage' && (
                    <div className="settings-storage-grid">
                      <div className="settings-section-card">
                        {renderStorageBreakdownInner()}
                      </div>
                      <div className="settings-section-card settings-plan-card">
                        <h3 className="settings-section-title">Plan</h3>
                        <p className="settings-section-desc">You are on the Free plan.</p>
                        <p className="settings-plan-note">Need more room? Upgrade for more storage, extended file history and password-protected links.</p>
                        <button className="settings-save-btn" onClick={() => alert('Upgrade flow coming soon!')}>
                          Upgrade plan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback sub-tab */}
                  {settingsSubTab === 'feedback' && (
                    <div className="settings-section-card">
                      <h3 className="settings-section-title">Send Feedback</h3>
                      <p className="settings-section-desc">Help us improve! Share your thoughts and suggestions.</p>

                      <div className="settings-field">
                        <label className="settings-field-label">Subject</label>
                        <input
                          className="settings-field-input"
                          type="text"
                          value={feedbackSubject}
                          onChange={(e) => setFeedbackSubject(e.target.value)}
                          placeholder="Brief subject"
                        />
                      </div>

                      <div className="settings-field">
                        <label className="settings-field-label">Your Feedback</label>
                        <textarea
                          className="settings-field-input"
                          rows="4"
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          placeholder="Share your thoughts, suggestions, or bug reports"
                        />
                      </div>

                      <div className="settings-field">
                        <label className="settings-field-label">Rating: {feedbackHoverRating || feedbackRating}/5</label>
                        <div className="settings-star-row">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={`settings-star ${(feedbackHoverRating || feedbackRating) >= star ? 'filled' : ''}`}
                              onMouseEnter={() => setFeedbackHoverRating(star)}
                              onMouseLeave={() => setFeedbackHoverRating(0)}
                              onClick={() => setFeedbackRating(star)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      {feedbackSentMessage && <div className="settings-alert success">{feedbackSentMessage}</div>}

                      <button
                        className="settings-save-btn"
                        onClick={handleSubmitFeedback}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}

                  <button className="settings-logout-btn" onClick={onLogout}>
                    🚪 Logout
                  </button>
                </div>

              ) : (folders.length === 0 && displayFiles.length === 0) ? (
                <div className="empty-state">
                  <p className="empty-icon">📭</p>
                  <p className="empty-text">No files yet. Upload your first file!</p>
                </div>
              ) : (
                <div className="tile-grid">
                  {!activeFilter && folders.map(folder => renderFolderTile(folder, [
                    { label: <><IconShare /> Share</>, onClick: () => handleShareFolder(folder._id, folder.name) },
                    { label: <><IconEdit /> Rename</>, onClick: () => handleRenameFolder(folder._id, folder.name) },
                    { label: <><IconArchive /> Archive</>, onClick: () => handleArchiveFolder(folder._id) },
                    { label: <><IconFolder /> Move to Folder</>, onClick: () => handleMoveFolderToAnotherFolder(folder._id, folder.name) },
                    { label: <><IconLock /> Move to Private</>, onClick: () => handleMoveFolderToPrivate(folder._id) },
                    { label: <><IconTrash /> Delete</>, onClick: () => handleDeleteFolder(folder._id), danger: true },
                  ], () => handleOpenFolder(folder._id)))}

                  {displayFiles.map(file => renderFileTile(file, [
                    { label: <><IconShare /> Share</>, onClick: () => handleShare(file._id, file.filename) },
                    { label: <><IconEye /> Preview</>, onClick: () => handlePreview(file) },
                    { label: <><IconEdit /> Rename</>, onClick: () => handleRename(file._id, file.filename) },
                    { label: <><IconArchive /> Archive</>, onClick: () => handleArchive(file._id) },
                    { label: <><IconFolder /> Move to Folder</>, onClick: () => handleMoveToFolder(file._id, file.filename) },
                    { label: <><IconLock /> Move to Private</>, onClick: () => handleMoveToPrivate(file._id) },
                    { label: <><IconTrash /> Delete</>, onClick: () => handleDelete(file._id), danger: true },
                  ], () => handlePreview(file)))}
                </div>
              )}
            </div>

            {/* ===== Storage breakdown card (hidden on Settings — shown inside Storage sub-tab instead) ===== */}
            {activeTab !== 'settings' && activeTab !== 'trash' && (
              <aside className="storage-card">
                {renderStorageBreakdownInner()}
              </aside>
            )}

          </div>
        </main>
      </div>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} userEmail={userEmail} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <PreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        token={token}
        owner={userName}
        onShare={() => previewFile && handleShare(previewFile._id, previewFile.filename)}
        onPrev={() => goToPreviewIndex(previewIndex - 1)}
        onNext={() => goToPreviewIndex(previewIndex + 1)}
        hasPrev={previewIndex > 0}
        hasNext={previewIndex < previewFileList.length - 1}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadFile={uploadSingleFile}
        onAllComplete={refreshAfterUpload}
      />

      {showPinModal && (
        <div className="pin-modal-overlay">
          <div className="pin-modal-card">
            <h2 className="pin-modal-title">
              <IconLock className="pin-modal-icon" />
              {pinMode === 'set' ? 'Set Private PIN' : 'Enter Private PIN'}
            </h2>
            <p className="pin-modal-subtitle">
              {pinMode === 'set' ? 'Create a PIN to protect your Private section.' : 'Enter your PIN to unlock Private.'}
            </p>

            <div className="pin-input-wrapper">
              <input
                type={showPin ? 'text' : 'password'}
                placeholder="Enter PIN"
                value={pinInput}
                autoComplete="new-password"
                onChange={(e) => setPinInput(e.target.value)}
                className="pin-input"
              />
              <button type="button" className="pin-input-toggle" onClick={() => setShowPin((prev) => !prev)}>
                {showPin ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {pinMode === 'set' && (
              <div className="pin-input-wrapper">
                <input
                  type={showPinConfirm ? 'text' : 'password'}
                  placeholder="Confirm PIN"
                  value={pinConfirmInput}
                  autoComplete="new-password"
                  onChange={(e) => setPinConfirmInput(e.target.value)}
                  className="pin-input"
                />
                <button type="button" className="pin-input-toggle" onClick={() => setShowPinConfirm((prev) => !prev)}>
                  {showPinConfirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            )}

            {pinError && <p className="pin-error-text">{pinError}</p>}

            <div className="pin-modal-actions">
              <button onClick={() => setShowPinModal(false)} className="pin-btn-cancel">Cancel</button>
              <button onClick={handlePinSubmit} className="pin-btn-confirm">
                {pinMode === 'set' ? 'Set PIN' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}