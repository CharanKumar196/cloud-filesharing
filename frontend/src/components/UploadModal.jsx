import React, { useState, useRef } from 'react';
import './UploadModal.css';

/*
  Drag-and-drop upload modal.

  Props:
    isOpen        - whether the modal is visible
    onClose       - called when the person closes the modal
    onUploadFile  - async (file, onProgress) => response — uploads ONE file,
                    calling onProgress(percent) as it streams. Dashboard.jsx
                    supplies this (handles folder/Private/Archive placement).
    onAllComplete - called once, after every file in the current batch has
                    finished (success or failure), so Dashboard can refresh
                    the view.
*/

const IconCloudUpload = (props) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 16l-4-4-4 4" />
    <path d="M12 12v9" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const IconFileGeneric = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
  </svg>
);

const IconCheckCircle = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4 12 14.01l-3-3" />
  </svg>
);

const IconAlertCircle = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconX = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB, matches the "up to 2 GB per file" copy

let nextQueueId = 1;

export default function UploadModal({ isOpen, onClose, onUploadFile, onAllComplete }) {
  const [queue, setQueue] = useState([]); // [{ id, file, progress, status: 'uploading'|'done'|'error', errorMessage }]
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const pendingCountRef = useRef(0);

  if (!isOpen) return null;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.max(1, bytes)) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const updateItem = (id, patch) => {
    setQueue(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
  };

  const startUpload = (item) => {
    pendingCountRef.current += 1;

    onUploadFile(item.file, (percent) => updateItem(item.id, { progress: percent }))
      .then(() => {
        updateItem(item.id, { progress: 100, status: 'done' });
      })
      .catch((err) => {
        updateItem(item.id, { status: 'error', errorMessage: err?.message || 'Upload failed' });
      })
      .finally(() => {
        pendingCountRef.current -= 1;
        if (pendingCountRef.current === 0 && onAllComplete) {
          onAllComplete();
        }
      });
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    const newItems = incoming
      .filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`❌ "${file.name}" is over the 2 GB limit and won't be uploaded.`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: nextQueueId++,
        file,
        progress: 0,
        status: 'uploading',
        errorMessage: '',
      }));

    if (newItems.length === 0) return;

    setQueue((prev) => [...prev, ...newItems]);
    newItems.forEach(startUpload);
  };

  const removeItem = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleClose = () => {
    setQueue([]);
    onClose();
  };

  const isAnyUploading = queue.some((item) => item.status === 'uploading');

  return (
    <div className="upload-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="upload-modal-card">
        <div className="upload-modal-header">
          <div>
            <h2 className="upload-modal-title">Upload files</h2>
            <p className="upload-modal-subtitle">Files are encrypted in transit and at rest.</p>
          </div>
          <button className="upload-modal-close" onClick={handleClose}>
            <IconX />
          </button>
        </div>

        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onClick={handleBrowseClick}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <IconCloudUpload className="upload-dropzone-icon" />
          <p className="upload-dropzone-title">Drag &amp; drop files here</p>
          <p className="upload-dropzone-sub">or click to browse · up to 2 GB per file</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="upload-hidden-input"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {queue.length > 0 && (
          <div className="upload-queue">
            {queue.map((item) => (
              <div key={item.id} className="upload-queue-item">
                <span className="upload-queue-icon"><IconFileGeneric /></span>
                <div className="upload-queue-info">
                  <div className="upload-queue-row">
                    <p className="upload-queue-name" title={item.file.name}>{item.file.name}</p>
                    {item.status === 'done' && <IconCheckCircle className="upload-status-icon done" />}
                    {item.status === 'error' && <IconAlertCircle className="upload-status-icon error" />}
                    {item.status !== 'uploading' && (
                      <button className="upload-queue-remove" onClick={() => removeItem(item.id)}>
                        <IconX />
                      </button>
                    )}
                  </div>
                  <div className="upload-queue-bar">
                    <div
                      className={`upload-queue-fill ${item.status}`}
                      style={{ width: `${item.status === 'error' ? 100 : item.progress}%` }}
                    ></div>
                  </div>
                  <p className="upload-queue-meta">
                    {item.status === 'error'
                      ? item.errorMessage
                      : `${formatFileSize(item.file.size)}${item.status === 'uploading' ? ` · ${Math.round(item.progress)}%` : ''}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="upload-modal-actions">
          <button className="upload-modal-close-btn" onClick={handleClose}>
            Close
          </button>
          <button className="upload-modal-select-btn" onClick={handleBrowseClick} disabled={isAnyUploading}>
            Select files
          </button>
        </div>
      </div>
    </div>
  );
}