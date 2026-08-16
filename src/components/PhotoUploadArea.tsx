import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, RefreshCw, Link as LinkIcon, Eye, CheckCircle2 } from 'lucide-react';

interface PhotoUploadAreaProps {
  label?: string;
  value?: string;
  onChange: (dataUrlOrUrl: string) => void;
  maxSizeMB?: number;
  className?: string;
}

export const PhotoUploadArea: React.FC<PhotoUploadAreaProps> = ({
  label = 'Upload Foto Kegiatan (Opsional)',
  value = '',
  onChange,
  maxSizeMB = 15,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compress & read image to base64
  const processImageFile = (file: File) => {
    setErrorMsg(null);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setIsUrlMode(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label with Green Camera Icon matching screenshot */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 cursor-pointer">
          <Camera className="w-4 h-4 text-emerald-500" />
          <span>{label}</span>
        </label>
        
        {/* Toggle Mode URL/Upload */}
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{isUrlMode ? 'Unggah dari Perangkat' : 'Gunakan Link URL'}</span>
        </button>
      </div>

      {/* URL Input Mode if chosen */}
      {isUrlMode ? (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Tempel link foto (https://i.ibb.co/... atau link Google Drive)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUrlMode(false)}
              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-500"
            >
              Terapkan Link
            </button>
          </div>
        </div>
      ) : value ? (
        /* Preview Card when an image is loaded */
        <div className="relative border-2 border-emerald-400/50 dark:border-emerald-500/40 rounded-2xl p-3 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center gap-4 transition-all">
          <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <img
              src={value}
              alt="Foto Kegiatan"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Foto Kegiatan Berhasil Dimuat</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {value.startsWith('data:') ? 'Foto siap tersimpan di laporan & dicetak' : value}
            </p>
            <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <RefreshCw className="w-3 h-3 text-teal-600" />
                <span>Ganti Foto</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-800"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus Foto</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dashed Upload Box matching Screenshot */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-teal-500 hover:bg-teal-50/20 dark:hover:bg-teal-950/10'
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-teal-600">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-xs font-semibold">Memproses foto...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-teal-500" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Klik untuk mengunggah foto dari perangkat
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Maks. {maxSizeMB}MB (JPG/PNG)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {errorMsg && (
        <p className="text-[11px] text-rose-500 font-medium">{errorMsg}</p>
      )}
    </div>
  );
};
