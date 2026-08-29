import React, { useState, useEffect } from 'react';
import { downloadFile } from '../api';
import './PreviewModal.css';

export default function PreviewModal({
  file,
  isOpen,
  onClose,
  token,
  owner = 'You',
  onShare,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, file]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      setDownloadUrl(null);
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

  const getReadableType = (filename) => {
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) return 'Image';
    if (filename.match(/\.(pdf)$/i)) return 'PDF';
    if (filename.match(/\.(docx|doc|txt)$/i)) return 'Document';
    if (filename.match(/\.(zip|rar|7z)$/i)) return 'Archive';
    if (filename.match(/\.(mp4|avi|mov|mkv)$/i)) return 'Video';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.max(1, bytes)) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  const fileType = file ? getFileType(file.filename) : 'other';

  return (
    <div className="preview-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="preview-card">
        {/* Header */}
        <div className="preview-header">
          <h2 className="preview-title">{file?.filename}</h2>
          <button className="preview-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Preview area with prev/next */}
        <div className="preview-body">
          {hasPrev && (
            <button className="preview-nav-btn prev" onClick={onPrev} title="Previous file">‹</button>
          )}

          <div className="preview-content">
            {loading ? (
              <div className="preview-status">⏳ Loading preview...</div>
            ) : error ? (
              <div className="preview-status error">❌ {error}</div>
            ) : !downloadUrl ? (
              <div className="preview-status">Preview not available</div>
            ) : fileType === 'image' ? (
              <img src={downloadUrl} alt={file.filename} className="preview-image" />
            ) : fileType === 'pdf' ? (
              <iframe src={downloadUrl} className="preview-iframe" title="PDF Preview" />
            ) : fileType === 'video' ? (
              <video src={downloadUrl} controls className="preview-video" />
            ) : (
              <div className="preview-unsupported">
                <div className="preview-unsupported-icon">📁</div>
                <p>Preview not available — download to view this file.</p>
              </div>
            )}
          </div>

          {hasNext && (
            <button className="preview-nav-btn next" onClick={onNext} title="Next file">›</button>
          )}
        </div>

        {/* Metadata row */}
        <div className="preview-meta-row">
          <div className="preview-meta-item">
            <span className="preview-meta-label">Type</span>
            <span className="preview-meta-value">{file ? getReadableType(file.filename) : '—'}</span>
          </div>
          <div className="preview-meta-item">
            <span className="preview-meta-label">Size</span>
            <span className="preview-meta-value">{formatFileSize(file?.fileSize)}</span>
          </div>
          <div className="preview-meta-item">
            <span className="preview-meta-label">Modified</span>
            <span className="preview-meta-value">{formatDate(file?.uploadDate)}</span>
          </div>
          <div className="preview-meta-item">
            <span className="preview-meta-label">Owner</span>
            <span className="preview-meta-value">{owner}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="preview-actions">
          {onShare && (
            <button className="preview-share-btn" onClick={onShare}>
              🔗 Share
            </button>
          )}
          <button
            className="preview-download-btn"
            onClick={() => window.open(downloadUrl, '_blank')}
            disabled={!downloadUrl}
          >
            ⬇️ Download
          </button>
        </div>
      </div>
    </div>
  );
}