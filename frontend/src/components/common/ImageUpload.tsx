import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFiles = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      // the backend UploadsController expects parameter name 'file'
      formData.append('file', file);

      const response = await api.post('/Uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onChange(response.data.url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative w-full h-40 rounded-lg border-2 border-slate-200 overflow-hidden group">
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white text-rose-600 rounded-full hover:bg-rose-50 transition-colors shadow-sm"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer transition-colors ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files[0]);
              }
            }}
            accept="image/jpeg, image/png, image/gif, image/webp"
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500 text-center">
              <UploadCloud className={`w-10 h-10 mb-2 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
              <p className="text-sm font-medium mb-1">
                <span className="text-indigo-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-rose-500 text-xs mt-1.5 font-medium flex items-center gap-1"><X className="w-3 h-3" /> {error}</p>}
    </div>
  );
};

export default ImageUpload;
