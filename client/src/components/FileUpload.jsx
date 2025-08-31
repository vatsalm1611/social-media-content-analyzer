import React, { useRef, useState } from 'react';

export default function FileUpload({ onFile, loading }) {
  const inputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileSelect = (files) => {
    const file = files?.[0];
    if (!file) return;

    const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!isValidType) {
      alert('Please upload a PDF or image file.');
      return;
    }
    onFile(file);
  };

  return (
    <div
      className={`dropzone ${isHovering ? 'hover' : ''} ${loading ? 'disabled' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
      onDragLeave={() => setIsHovering(false)}
      onDrop={(e) => { e.preventDefault(); setIsHovering(false); handleFileSelect(e.dataTransfer.files); }}
      onClick={() => !loading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <div>
        <strong>Drag & drop</strong> a PDF or image here, or <span className="link">browse</span>.
      </div>
      <small>Max 20MB • PDF / PNG / JPG</small>
    </div>
  );
}
