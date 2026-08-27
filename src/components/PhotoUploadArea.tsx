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
  Sparkles,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

interface PhotoUploadAreaProps {
  label?: string;
  value?: string;
  onChange: (dataUrlOrUrl: string) => void;
  maxSizeMB?: number;
  className?: string;
}

// Convert Google Drive & Dropbox links into direct renderable image URLs
export const normalizeImageUrl = (raw: string): string => {
  const url = raw.trim();
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

// Sample high-quality documentation images for quick demonstration
const SAMPLE_PHOTOS = [
  {
    title: 'Siaran Radio Sekolah & Afirmasi Karakter',
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Kegiatan Apel Pagi & Deklarasi Anti Perundungan',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop',
  },
];

export const PhotoUploadArea: React.FC<PhotoUploadAreaProps> = ({
  label = 'Upload Foto Kegiatan (Opsional)',
  value = '',
  onChange,
  maxSizeMB = 15,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Reset image load error when value changes
  useEffect(() => {
    setImgLoadError(false);
  }, [value]);

  // Handle Ctrl+V / Paste image from clipboard
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

  // Compress & read image to base64
  const processImageFile = (file: File) => {
    setErrorMsg(null);
    setImgLoadError(false);

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`Ukuran file melebihi batas maksimal ${maxSizeMB}MB.`);
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsLoading(false);
        return;
      }

      // Automatically scale down super-huge phone camera images to save memory
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            onChange(compressed);
            setIsLoading(false);
            return;
          }
        }
        onChange(result);
        setIsLoading(false);
      };
      img.onerror = () => {
        onChange(result);
        setIsLoading(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca file gambar.');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input so same file can be selected again
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
    setUrlInput('');
    setImgLoadError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      const directUrl = normalizeImageUrl(urlInput);
      onChange(directUrl);
      setIsUrlMode(false);
      setUrlInput('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label with Green Camera Icon matching theme */}
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <label className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 cursor-pointer">
          <Camera className="w-4 h-4 text-emerald-500" />
          <span>{label}</span>
        </label>
        
        {/* Toggle Mode URL/Upload */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUrlMode(!isUrlMode)}
            className="text-[11px] text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 transition-colors font-medium"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{isUrlMode ? 'Unggah dari Perangkat' : 'Gunakan Link URL / Drive'}</span>
          </button>
        </div>
      </div>

      {/* URL Input Mode if chosen */}
      {isUrlMode ? (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            Tempel Tautan Foto (Mendukung Google Drive, Imgur, Dropbox, dll):
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
              placeholder="Contoh: https://drive.google.com/file/d/... atau https://i.ibb.co/..."
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 shrink-0"
            >
              Terapkan
            </button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              *Tautan Google Drive publik akan otomatis dikonversi menjadi gambar.
            </span>
            <button
              type="button"
              onClick={() => setIsUrlMode(false)}
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Kembali ke Mode File
            </button>
          </div>
        </div>
      ) : value ? (
        /* Preview Card when an image is loaded */
        <div className="relative border-2 border-emerald-400/50 dark:border-emerald-500/40 rounded-2xl p-3.5 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center gap-4 transition-all">
          <div
            className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 relative group cursor-pointer"
            onClick={() => setShowPreviewModal(true)}
            title="Klik untuk melihat foto ukuran penuh"
          >
            {imgLoadError ? (
              <div className="p-2 text-center text-rose-400 space-y-1">
                <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
                <span className="text-[10px] block">Gagal memuat foto</span>
              </div>
            ) : (
              <img
                src={value}
                alt="Foto Kegiatan"
                onError={() => setImgLoadError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[10px] font-bold">
              <Eye className="w-3.5 h-3.5" />
              <span>Perbesar</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 justify-center sm:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Foto Kegiatan Berhasil Dimuat & Siap Tampil</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 break-all">
              {value.startsWith('data:') ? 'Foto terkompresi tersimpan di database lokal & cloud' : value}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <FolderOpen className="w-3 h-3 text-teal-600" />
                <span>Pilih Galeri</span>
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-teal-200 dark:border-teal-800"
              >
                <Camera className="w-3 h-3 text-teal-600" />
                <span>Kamera HP</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-800"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus Foto</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Action Box when no image is loaded yet */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all ${
            isDragging
              ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-teal-500'
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-teal-600 py-4">
              <RefreshCw className="w-7 h-7 animate-spin" />
              <span className="text-xs font-bold">Mengompres & Memproses Foto...</span>
            </div>
          ) : (
            <div className="space-y-3 w-full max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-500 mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Unggah Foto Dokumentasi Kegiatan
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Mendukung Kamera HP, File Galeri, Drag & Drop, atau Paste (Ctrl+V)
                </p>
              </div>

              {/* Action Buttons for easy 1-click photo selection */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Pilih File / Galeri</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-500" />
                  <span>Buka Kamera HP</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange(SAMPLE_PHOTOS[0].url)}
                  className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold flex items-center gap-1 border border-purple-500/20 transition-all"
                  title="Gunakan contoh foto siaran untuk demonstrasi"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Contoh Foto Siaran</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input for Gallery / File Explorer */}
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

      {errorMsg && (
        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}

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
              src={value}
              alt="Foto Kegiatan Penuh"
              className="max-h-[75vh] w-auto object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div className="w-full flex items-center justify-between pt-3 px-2">
              <span className="text-xs text-slate-300 font-medium">
                Pratinjau Foto Dokumentasi Kegiatan
              </span>
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
      )}
    </div>
  );
};

