import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  User,
  Download,
  ExternalLink,
  Share2,
  Check,
  FileText,
  BookmarkCheck,
  Tag,
} from 'lucide-react';
import { MateriEdukasiItem } from '../../types';

interface MateriDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  materi: MateriEdukasiItem | null;
  onDownload?: () => void;
}

export const MateriDetailModal: React.FC<MateriDetailModalProps> = ({
  isOpen,
  onClose,
  materi,
  onDownload,
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen || !materi) return null;

  const handleCopySummary = () => {
    const textToCopy = `${materi.judul}\n\n${materi.ringkasan}\n\n${materi.kontenLengkap || ''}\n\nSumber: Media Edukasi Digital E-PASS TEMENAN SPANJU (SMPN 7 Pasuruan)`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getFormatBadge = (fmt?: string) => {
    switch (fmt) {
      case 'PDF':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'SLIDES':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'DOCX':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getFormatBadge(materi.fileFormat)}`}>
                  {materi.fileFormat || 'ARTIKEL'}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {materi.kategori}
                </span>
              </div>
              <p className="text-xs text-slate-400">Dokumentasi Materi Edukasi SPANJU</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopySummary}
              title="Salin Teks Materi"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isCopied ? 'Tersalin' : 'Bagikan'}</span>
            </button>

            <button
              onClick={onClose}
              title="Tutup"
              className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display leading-snug mb-3">
              {materi.judul}
            </h2>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              {materi.penulis && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {materi.penulis}
                  </span>
                </div>
              )}
              {materi.tanggal && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{materi.tanggal}</span>
                </div>
              )}
              {materi.bacaanMenit && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>± {materi.bacaanMenit} menit bacaan</span>
                </div>
              )}
            </div>
          </div>

          {/* Ringkasan Box */}
          <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 mb-1.5 flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-teal-600" />
              Ringkasan Intisari:
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {materi.ringkasan}
            </p>
          </div>

          {/* Konten Lengkap */}
          {materi.kontenLengkap && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Uraian & Panduan Lengkap:
              </h3>
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                {materi.kontenLengkap}
              </div>
            </div>
          )}

          {/* Tags */}
          {materi.tags && materi.tags.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Kata Kunci / Topik:</span>
              <div className="flex flex-wrap gap-1.5">
                {materi.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Tag className="w-3 h-3 text-indigo-500" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            SMPN 7 Pasuruan • Satgas PPKSP & E-PASS TEMENAN
          </div>

          <div className="flex items-center gap-2">
            {materi.linkDokumen && (
              <a
                href={materi.linkDokumen}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onDownload && onDownload()}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Dokumen / Link Resmi</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
