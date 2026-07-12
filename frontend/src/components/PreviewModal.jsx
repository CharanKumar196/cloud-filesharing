import React, { useState, useEffect } from 'react';
import { downloadFile } from '../api';

export default function PreviewModal({ file, isOpen, onClose, token }) {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadPreview();
    }
  }, [isOpen, file]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await downloadFile(file._id, token);
      if (response.success) {
        setDownloadUrl(response.downloadUrl);
      } else {
        setError('Failed to load preview');
      }
    } catch (err) {
      setError('Error loading file');
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (filename) => {
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) return 'image';
    if (filename.match(/\.(pdf)$/i)) return 'pdf';
    if (filename.match(/\.(mp4|avi|mov|mkv)$/i)) return 'video';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.max(1, bytes)) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  const fileType = file ? getFileType(file.filename) : 'other';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1a1f2e',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#4A90E2',
            color: 'white',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Header */}
        <h2 style={{ color: 'white', marginBottom: '10px' }}>{file?.filename}</h2>
        <p style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>
          {formatFileSize(file?.fileSize)}
        </p>

        {/* Preview Content */}
        <div style={{ marginBottom: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              ⏳ Loading preview...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
              ❌ {error}
            </div>
          ) : !downloadUrl ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Preview not available
            </div>
          ) : fileType === 'image' ? (
            <div style={{ textAlign: 'center' }}>
              <img
                src={downloadUrl}
                alt={file.filename}
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  borderRadius: '8px'
                }}
              />
            </div>
          ) : fileType === 'pdf' ? (
            <div style={{ textAlign: 'center' }}>
              <iframe
                src={downloadUrl}
                style={{
                  width: '100%',
                  height: '600px',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title="PDF Preview"
              />
            </div>
          ) : fileType === 'video' ? (
            <div style={{ textAlign: 'center' }}>
              <video
                src={downloadUrl}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  borderRadius: '8px'
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              📁 This file type cannot be previewed
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={() => window.open(downloadUrl, '_blank')}
          disabled={!downloadUrl}
          style={{
            width: '100%',
            background: downloadUrl ? '#4A90E2' : '#666',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            cursor: downloadUrl ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          📥 Download File
        </button>
      </div>
    </div>
  );
}