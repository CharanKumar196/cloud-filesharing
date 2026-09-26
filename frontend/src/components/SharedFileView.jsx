import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicFile, downloadFile } from '../api';
import './Dashboard.css';

export default function SharedFileView() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadPublicFile();
  }, [fileId]);

  const loadPublicFile = async () => {
    try {
      setLoading(true);
      const response = await getPublicFile(fileId);
      
      if (response.success) {
        setFile(response.file);
        setError(null);
      } else {
        setError(response.message || 'File not found');
        setFile(null);
      }
    } catch (err) {
      setError('Error loading file: ' + err.message);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      setDownloading(true);
      // Call download endpoint (uses public access)
      const response = await fetch(`http://localhost:5000/api/files/public/${fileId}/download`);
      const data = await response.json();
      
      if (data.success) {
        // Open download URL
        window.location.href = data.downloadUrl;
      } else {
        alert('❌ Download failed: ' + data.message);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (filename) => {
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️';
    if (filename.match(/\.(pdf)$/i)) return '📄';
    if (filename.match(/\.(docx|doc|txt)$/i)) return '📝';
    if (filename.match(/\.(zip|rar|7z)$/i)) return '📦';
    if (filename.match(/\.(mp4|avi|mov|mkv)$/i)) return '🎬';
    return '📁';
  };

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

  return (
  <div className="shared-file-page">
    <div className="shared-file-container">
      {/* Header */}
      <div className="shared-file-header">
        <h1 className="shared-file-title">📤 Shared File</h1>
        <p className="shared-file-subtitle">
          Someone shared a file with you
        </p>
      </div>

      {loading ? (
        <div className="shared-file-loading">
          <div className="shared-file-loading-icon">⏳</div>
          <p>Loading file...</p>
        </div>
      ) : error ? (
        <div className="shared-file-error-card">
          <div className="shared-file-error-icon">❌</div>
          <h2 className="shared-file-error-title">File Not Found</h2>
          <p className="shared-file-error-text">{error}</p>
          <button className="shared-file-home-btn" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      ) : file ? (
        <div className="shared-file-card">
          {/* File Info */}
          <div className="shared-file-info">
            <div className="shared-file-icon">
              {getFileIcon(file.filename)}
            </div>
            <h2 className="shared-file-name">
              {file.filename}
            </h2>
            <p className="shared-file-meta">
              {formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}
            </p>
          </div>

          {/* Download Button */}
          <button
            className="shared-file-download-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? '⏳ Downloading...' : '📥 Download File'}
          </button>

          <p className="shared-file-footer-note">
            ✅ This file was shared with you. You can download it without logging in.
          </p>
        </div>
      ) : null}
    </div>
  </div>
);
}