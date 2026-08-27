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
  Cloud,
  CloudUpload,
  ExternalLink,
  Check,
  Copy,
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
  label = 'Upload Foto Kegiatan (Simpan Online di Supabase)',
  value = '',
  onChange,
  folder = 'dokumentasi',
  maxSizeMB = 15,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Memproses foto...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

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

  // Process image: optimize resolution then upload to Supabase Storage Bucket
  const processImageFile = async (file: File) => {
    setErrorMsg(null);
    setImgLoadError(false);

    // Resilient check for mobile phone photos (which sometimes have empty or generic MIME types)
    const isImage =
      !file.type ||
      file.type.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|jfif|svg)$/i.test(file.name);

    if (!isImage) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`Ukuran file melebihi batas maksimal ${maxSizeMB}MB.`);
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Mengompresi & mengoptimalkan resolusi foto HP...');

    try {
      // 1. Compress image to clean, compact ~50KB - 80KB target size
      const compressed = await compressImage(file, 1000, 0.75);

      // 2. Immediately set compressed dataUrl so UI updates instantly & local storage never runs out of quota
      onChange(compressed.dataUrl);

      // 3. Concurrently upload to Supabase Cloud Storage if available
      const client = StorageService.getSupabaseClient();
      if (client) {
        setLoadingStatus('Mengunggah ke Supabase Cloud Storage (Online)...');
        const uploadRes = await StorageService.uploadPhotoToSupabase(compressed.blob, folder);
        if (uploadRes.url) {
          onChange(uploadRes.url);
          setErrorMsg(null);
        } else {
          console.warn('Supabase storage upload notice:', uploadRes.error);
        }
      }
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Compression error fallback:', err);
      // Fallback: read directly as data URL if canvas compression fails
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

  const handleMigrateCurrentToOnline = async () => {
    if (!value || !value.startsWith('data:')) return;
    setIsLoading(true);
    setLoadingStatus('Mengunggah foto lokal ke Supabase Cloud Storage...');
    const res = await StorageService.uploadBase64ToSupabase(value, folder);
    if (res.url) {
      onChange(res.url);
      setErrorMsg(null);
    } else {
      setErrorMsg(`Gagal mengunggah online: ${res.error}`);
    }
    setIsLoading(false);
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
    setErrorMsg(null);
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

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const isOnlineUrl = Boolean(value && (value.startsWith('http://') || value.startsWith('https://')));
  const isSupabaseStorageUrl = Boolean(value && value.includes('supabase.co/storage/'));

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label with Green Camera Icon matching theme */}
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <label className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 cursor-pointer">
          <Camera className="w-4 h-4 text-emerald-500" />
          <span>{label}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-0.5 border border-emerald-300 dark:border-emerald-800">
            <Cloud className="w-2.5 h-2.5" />
            <span>Online Supabase</span>
          </span>
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
            Tempel Tautan Foto Online (Supabase Storage, Google Drive, Imgur, dll):
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
              placeholder="Contoh: https://...supabase.co/storage/v1/object/public/... atau https://drive.google.com/..."
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
              Kembali ke Mode Unggah File
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
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 justify-center sm:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Foto Kegiatan Berhasil Dimuat</span>
              {isSupabaseStorageUrl ? (
                <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                  <Cloud className="w-3 h-3" />
                  <span>Online Supabase Cloud Storage</span>
                </span>
              ) : isOnlineUrl ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <span>Online Cloud URL</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleMigrateCurrentToOnline}
                  className="px-2 py-0.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold flex items-center gap-1 transition-all shadow-sm"
                  title="Klik untuk mengunggah foto lokal ini ke Supabase Cloud Storage"
                >
                  <CloudUpload className="w-3 h-3" />
                  <span>Unggah ke Supabase Online</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 justify-center sm:justify-start">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                {value.startsWith('data:') ? 'Lokal Base64 (Klik tombol kuning untuk simpan Online ke Supabase)' : value}
              </p>
              {isOnlineUrl && (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 text-slate-500 hover:text-teal-600 rounded"
                  title="Salin Link Foto"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <FolderOpen className="w-3 h-3 text-teal-600" />
                <span>Ganti Galeri</span>
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
              <span className="text-xs font-bold">{loadingStatus}</span>
              <span className="text-[10px] text-slate-400">Menyimpan langsung ke Supabase Cloud Storage (Online)</span>
            </div>
          ) : (
            <div className="space-y-3 w-full max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-500 mx-auto flex items-center justify-center">
                <CloudUpload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Unggah Foto Dokumentasi Kegiatan (Simpan Online)
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Foto langsung disimpan online di <b>Supabase Cloud Storage</b> (tidak membebani memori lokal)
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
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>Pemberitahuan Supabase Storage</span>
          </div>
          <p className="pl-5 leading-relaxed">{errorMsg}</p>
        </div>
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
            <div className="w-full flex items-center justify-between pt-3 px-2 flex-wrap gap-2">
              <span className="text-xs text-slate-300 font-medium truncate max-w-sm">
                {isSupabaseStorageUrl ? '✓ Foto Tersimpan Online di Supabase Cloud Storage' : 'Pratinjau Foto Dokumentasi Kegiatan'}
              </span>
              <div className="flex items-center gap-2">
                {isOnlineUrl && (
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-semibold flex items-center gap-1"
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
