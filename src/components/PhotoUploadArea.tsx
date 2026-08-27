import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle,
  FolderOpen,
  Cloud,
  CloudUpload,
  ExternalLink,
  Check,
  Copy,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { compressImage } from '../utils/imageCompressor';

interface PhotoUploadAreaProps {
  label?: string;
  value?: string;
  onChange: (dataUrlOrUrl: string) => void;
  folder?: string;
  maxSizeMB?: number;
  className?: string;
}

// Convert Google Drive & Dropbox links into direct renderable image URLs
export const normalizeImageUrl = (raw: string): string => {
  const url = (raw || '').trim();
  if (!url) return '';

  // Google Drive sharing links
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  // Dropbox links
  if (url.includes('dropbox.com')) {
    return url.replace('dl=0', 'raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
  }

  return url;
};

export const PhotoUploadArea: React.FC<PhotoUploadAreaProps> = ({
  label = 'LINK FOTO KEGIATAN',
  value = '',
  onChange,
  folder = 'dokumentasi',
  maxSizeMB = 15,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Memproses foto...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sync internal input value when external value changes
  useEffect(() => {
    setImgLoadError(false);
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      setUrlInputValue(value);
    } else if (!value) {
      setUrlInputValue('');
    }
  }, [value]);

  // Handle Ctrl+V / Paste image or URL from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Process image: optimize resolution then upload to Supabase Storage Bucket
  const processImageFile = async (file: File) => {
    setErrorMsg(null);
    setImgLoadError(false);

    const isImage =
      !file.type ||
      file.type.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|jfif|svg)$/i.test(file.name);

    if (!isImage) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`Ukuran file melebihi batas maksimal ${maxSizeMB}MB.`);
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Mengompresi & mengoptimalkan resolusi foto...');

    try {
      // 1. Compress image to clean, compact ~50KB - 80KB target size
      const compressed = await compressImage(file, 1000, 0.75);

      // 2. Set local compressed dataUrl immediately for instant preview
      onChange(compressed.dataUrl);

      // 3. Concurrently upload to Supabase Cloud Storage if available
      const client = StorageService.getSupabaseClient();
      if (client) {
        setLoadingStatus('Mengunggah ke Supabase Cloud Storage (Online)...');
        const uploadRes = await StorageService.uploadPhotoToSupabase(compressed.blob, folder);
        if (uploadRes.url) {
          onChange(uploadRes.url);
          setUrlInputValue(uploadRes.url);
          setErrorMsg(null);
        } else {
          console.warn('Supabase storage upload notice:', uploadRes.error);
        }
      }
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Compression error fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange(result);
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setErrorMsg('Gagal membaca file foto.');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setUrlInputValue(rawVal);
    if (rawVal.trim()) {
      const normalized = normalizeImageUrl(rawVal);
      onChange(normalized);
    } else {
      onChange('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInputValue('');
    setImgLoadError(false);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const isOnlineUrl = Boolean(value && (value.startsWith('http://') || value.startsWith('https://')));
  const isSupabaseStorageUrl = Boolean(value && value.includes('supabase.co/storage/'));

  // Clean label presentation
  const displayLabel = label.toUpperCase().includes('FOTO') ? label : `LINK FOTO KEGIATAN - ${label}`;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border border-blue-100/80 dark:border-slate-800 bg-blue-50/20 dark:bg-slate-900/40 rounded-2xl p-4 sm:p-5 transition-all ${
        isDragging ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
      } ${className}`}
    >
      {/* 1. Header Row matching user's reference */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
            {displayLabel}
          </span>
          {isSupabaseStorageUrl && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
              <Cloud className="w-2.5 h-2.5" />
              <span>Online Cloud</span>
            </span>
          )}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
          Bisa Input Link URL atau Upload Foto
        </span>
      </div>

      {/* 2. Main Content Grid (Left input & actions + Right preview box) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: URL Input and Upload Button */}
        <div className="md:col-span-8 lg:col-span-9 space-y-3">
          {/* Link URL Input Field */}
          <div className="relative flex items-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-2xs">
            <LinkIcon className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="url"
              value={value && value.startsWith('data:') ? '[Foto Diunggah dari Perangkat]' : urlInputValue}
              onChange={handleUrlInputChange}
              placeholder="https://... (URL foto Google Drive / Imgur / web)"
              readOnly={Boolean(value && value.startsWith('data:'))}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden"
            />
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-slate-400 hover:text-rose-500 p-1 text-xs font-semibold shrink-0"
                title="Hapus / Reset Foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
              <span>{isLoading ? 'Memproses...' : 'Upload Foto dari Perangkat'}</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Ambil foto langsung dengan Kamera HP"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Kamera HP</span>
            </button>

            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
              Format JPG, PNG, WEBP
            </span>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium pt-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{loadingStatus}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Photo Preview Box */}
        <div className="md:col-span-4 lg:col-span-3 flex items-center justify-center md:justify-end">
          {value ? (
            /* Has Photo State */
            <div className="w-full sm:w-44 md:w-full h-28 sm:h-32 rounded-2xl border border-blue-200 dark:border-blue-800 bg-slate-900 overflow-hidden relative group shadow-xs">
              {imgLoadError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-rose-400 bg-slate-900">
                  <AlertCircle className="w-6 h-6 mb-1 text-rose-400" />
                  <span className="text-[10px]">Gagal memuat link foto</span>
                </div>
              ) : (
                <img
                  src={normalizeImageUrl(value)}
                  alt="Pratinjau Foto Kegiatan"
                  onError={() => setImgLoadError(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-white">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                >
                  <Eye className="w-3 h-3" />
                  <span>Lihat Penuh</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                    title="Ganti Foto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  {isOnlineUrl && (
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                      title="Salin URL Foto"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs transition-colors"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State matching image reference */
            <div className="w-full sm:w-44 md:w-full h-28 sm:h-32 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 flex flex-col items-center justify-center p-3 text-center transition-all">
              <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5] mb-1.5" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Belum ada foto
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input for Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden File Input for Direct Mobile Camera */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Fullscreen Photo Lightbox Modal */}
      {showPreviewModal && value && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-2 relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={normalizeImageUrl(value)}
              alt="Foto Kegiatan Penuh"
              className="max-h-[75vh] w-auto object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div className="w-full flex items-center justify-between pt-3 px-2 flex-wrap gap-2">
              <span className="text-xs text-slate-300 font-medium truncate max-w-sm">
                {isSupabaseStorageUrl
                  ? '✓ Foto Tersimpan Online di Supabase Cloud Storage'
                  : 'Pratinjau Foto Dokumentasi Kegiatan'}
              </span>
              <div className="flex items-center gap-2">
                {isOnlineUrl && (
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Tersalin!' : 'Salin URL'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
