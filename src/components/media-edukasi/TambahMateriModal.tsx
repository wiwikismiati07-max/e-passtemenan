import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { MateriEdukasiItem } from '../../types';

interface TambahMateriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TambahMateriModal: React.FC<TambahMateriModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [judul, setJudul] = useState('');
  const [linkDokumen, setLinkDokumen] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeText, setFileSizeText] = useState('');
  const [formatDokumen, setFormatDokumen] = useState<'PDF' | 'DOCX' | 'SLIDES' | 'ARTIKEL'>('PDF');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      setFormatDokumen('PDF');
    } else if (ext === 'docx' || ext === 'doc') {
      setFormatDokumen('DOCX');
    } else if (ext === 'pptx' || ext === 'ppt') {
      setFormatDokumen('SLIDES');
    } else {
      setFormatDokumen('PDF');
    }

    setFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSizeText(`${sizeInMB} MB`);

    // Auto-fill title from clean filename
    if (!judul.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setJudul(cleanName);
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const res = await StorageService.uploadPhotoToSupabase(file, 'media-edukasi');
      if (res.url) {
        setLinkDokumen(res.url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLinkDokumen(reader.result as string);
          setIsUploading(false);
        };
        reader.onerror = () => {
          setErrorMessage('Gagal memproses file. Silakan masukkan tautan URL dokumen.');
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLinkDokumen(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!linkDokumen.trim()) {
      setErrorMessage('Harap pilih file dokumen / PDF atau masukkan link URL dokumen.');
      return;
    }

    const titleToUse = judul.trim() || fileName || 'Dokumen Materi / Regulasi Baru';

    const newMateriItem: MateriEdukasiItem = {
      id: `mat-${Date.now()}`,
      judul: titleToUse,
      kategori: 'Regulasi & Dokumen Resmi',
      ringkasan: `Dokumen berkas ${formatDokumen}: ${titleToUse}. Siap diunduh dan dibaca untuk pedoman pencegahan kekerasan sekolah.`,
      penulis: 'Satgas Aplikasi SAHABAT Spanju',
      tanggal: new Date().toISOString().split('T')[0],
      linkDokumen: linkDokumen.trim(),
      fileFormat: formatDokumen,
      bacaanMenit: 5,
      tags: ['Dokumen', 'PDF', 'Regulasi'],
      unduhanCount: 0,
    };

    StorageService.saveMediaEdukasiItem('materi', newMateriItem);

    // Reset Form
    setJudul('');
    setLinkDokumen('');
    setFileName('');
    setFileSizeText('');

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500 text-slate-950 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Upload Dokumen / PDF
              </h2>
              <p className="text-xs text-teal-200">
                Pilih file PDF atau masukkan link dokumen
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Pilih File PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                inputMode === 'url'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Link URL / Drive</span>
            </button>
          </div>

          {/* File Upload Box */}
          {inputMode === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40'
                  : linkDokumen
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.pptx,.ppt,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <RefreshCw className="w-7 h-7 text-teal-600 animate-spin" />
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400">
                    Memproses file dokumen...
                  </p>
                </div>
              ) : linkDokumen ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      File Siap: {fileName || 'Dokumen PDF'}
                    </p>
                    {fileSizeText && (
                      <p className="text-[11px] text-slate-500">{fileSizeText}</p>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 underline">
                    Klik untuk ganti file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Klik untuk memilih file PDF dari perangkat
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Mendukung PDF, DOCX, SLIDES (Maks. 25MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL Input */}
          {inputMode === 'url' && (
            <div className="space-y-1">
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={linkDokumen}
                  onChange={(e) => setLinkDokumen(e.target.value)}
                  placeholder="https://... link file PDF atau Google Drive publik"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Judul Dokumen */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Judul Dokumen / Regulasi
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Judul dokumen (otomatis terisi dari nama file)"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Simpan & Tampilkan PDF</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
