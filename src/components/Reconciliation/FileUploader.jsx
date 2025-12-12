import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FileUploader({ onFilesUploaded, mode = 'shopee', uploadedFiles = {} }) {
  const [files, setFiles] = useState({ platform: null, accurate: null });
  const [dragActive, setDragActive] = useState({ platform: false, accurate: false });
  const [errors, setErrors] = useState({ platform: '', accurate: '' });
  const platformInputRef = useRef(null);
  const accurateInputRef = useRef(null);

  const platformConfig = {
    shopee: 'Shopee',
    tiktok: 'TikTok',
    lazada: 'Lazada'
  };

  const platformLabel = platformConfig[mode] || 'Marketplace';

  const validateFile = (file) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      return 'Invalid file format';
    }

    if (file.size > 10 * 1024 * 1024) {
      return 'File too large (max 10MB)';
    }

    return '';
  };

  const handleFile = (file, type) => {
    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, [type]: error }));
      return;
    }

    setFiles(prev => ({ ...prev, [type]: file }));
    setErrors(prev => ({ ...prev, [type]: '' }));
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], type);
    }
  };

  const handleChange = (e, type) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], type);
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setErrors(prev => ({ ...prev, [type]: '' }));
    if (type === 'platform' && platformInputRef.current) {
      platformInputRef.current.value = '';
    } else if (type === 'accurate' && accurateInputRef.current) {
      accurateInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (files.platform && files.accurate) {
      onFilesUploaded(files.platform, files.accurate);
    }
  };

  const renderFileUploadArea = (type, label, icon) => {
    const file = files[type];
    const error = errors[type];
    const isDragging = dragActive[type];
    const inputRef = type === 'platform' ? platformInputRef : accurateInputRef;
    const uploadedInfo = uploadedFiles[type];

    return (
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">{label} File</label>

        <div
          onDragEnter={(e) => handleDrag(e, type)}
          onDragLeave={(e) => handleDrag(e, type)}
          onDragOver={(e) => handleDrag(e, type)}
          onDrop={(e) => handleDrop(e, type)}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 text-center",
            isDragging && "border-orange-400 bg-orange-50",
            !isDragging && !file && !error && "border-gray-200 bg-gray-50 hover:border-gray-300",
            file && "border-green-200 bg-green-50",
            error && "border-red-200 bg-red-50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleChange(e, type)}
            className="hidden"
          />

          {!file ? (
            <div className="py-3">
              <div className="flex justify-center mb-2">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-600 font-medium mb-2">
                {isDragging ? 'Drop your file' : 'Drop file or click to browse'}
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Browse
              </button>
            </div>
          ) : (
            <div className="py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(type)}
                  className="flex-shrink-0 p-1 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 font-medium mt-2">{error}</p>
          )}
        </div>

        {uploadedInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs">
            <p className="text-blue-900 font-medium">
              📊 {uploadedInfo.sheets} sheet{uploadedInfo.sheets > 1 ? 's' : ''} • {uploadedInfo.rows.toLocaleString()} rows
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderFileUploadArea('platform', platformLabel, <FileSpreadsheet className="w-5 h-5" />)}
      {renderFileUploadArea('accurate', 'Accurate', <FileSpreadsheet className="w-5 h-5" />)}

      <button
        onClick={handleUpload}
        disabled={!files.platform || !files.accurate}
        className={cn(
          "w-full h-10 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2",
          files.platform && files.accurate
            ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-60"
        )}
      >
        <Zap className="w-4 h-4" />
        Process Reconciliation
      </button>
    </div>
  );
}

import { Zap } from 'lucide-react';
