import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  hint?: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  aspect?: 'square' | 'portrait' | 'landscape';
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  hint,
  value,
  onChange,
  aspect = 'portrait',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onChange(e.target.result);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const aspectClass =
    aspect === 'square'
      ? 'aspect-square'
      : aspect === 'portrait'
      ? 'aspect-[3/4]'
      : 'aspect-[16/9]';

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
          {label}
        </label>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      {value ? (
        <div
          className={`relative group rounded-2xl overflow-hidden border border-white/10 ${aspectClass} bg-dark-900 shadow-glass`}
        >
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} /> Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                title="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle size={10} /> Ready
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${aspectClass} flex flex-col items-center justify-center p-6 text-center ${
            isDragging
              ? 'border-red-brand bg-red-950/20 shadow-red-glow'
              : 'border-white/10 hover:border-red-brand/50 hover:bg-white/[0.02]'
          } bg-dark-850/50 backdrop-blur-md`}
        >
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3 text-red-brand group-hover:scale-110 transition-transform">
            {loading ? (
              <RefreshCw size={20} className="animate-spin text-red-brand" />
            ) : (
              <Upload size={20} />
            )}
          </div>
          <p className="text-sm font-medium text-gray-200">
            {loading ? 'Processing Photo...' : 'Click or Drag & Drop'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
        </div>
      )}
    </div>
  );
};

