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
    <div style={{ minHeight: '100vh', background: '#0f1419', color: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>📤 Shared File</h1>
          <p style={{ color: '#999', fontSize: '14px' }}>
            Someone shared a file with you
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>⏳</div>
            <p>Loading file...</p>
          </div>
        ) : error ? (
          <div style={{
            background: '#1a1f2e',
            border: '1px solid #ff4444',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>❌</div>
            <h2 style={{ marginBottom: '10px' }}>File Not Found</h2>
            <p style={{ color: '#999', marginBottom: '20px' }}>{error}</p>
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#4A90E2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Go Home
            </button>
          </div>
        ) : file ? (
          <div style={{
            background: '#1a1f2e',
            border: '1px solid #4A90E2',
            borderRadius: '12px',
            padding: '30px'
          }}>
            {/* File Info */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px' }}>
                {getFileIcon(file.filename)}
              </div>
              <h2 style={{ marginBottom: '10px', wordBreak: 'break-all' }}>
                {file.filename}
              </h2>
              <p style={{ color: '#999', marginBottom: '20px' }}>
                {formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                width: '100%',
                background: downloading ? '#666' : '#4A90E2',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: downloading ? 'not-allowed' : 'pointer',
                marginBottom: '15px',
                transition: 'background 0.3s'
              }}
            >
              {downloading ? '⏳ Downloading...' : '📥 Download File'}
            </button>

            <p style={{
              color: '#999',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              ✅ This file was shared with you. You can download it without logging in.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}