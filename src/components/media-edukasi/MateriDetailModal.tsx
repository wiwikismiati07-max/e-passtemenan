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
  Eye,
  Printer,
  FileCheck,
  Sparkles,
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
  const [viewTab, setViewTab] = useState<'reader' | 'embed'>('reader');

  if (!isOpen || !materi) return null;

  const handleCopySummary = () => {
    const textToCopy = `${materi.judul}\n\n${materi.ringkasan}\n\n${materi.kontenLengkap || ''}\n\nSumber: Media Edukasi Digital E-PASS TEMENAN SPANJU (SMPN 7 Pasuruan)`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
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

  const hasDocumentLink = !!materi.linkDokumen;
  const isBase64Pdf = materi.linkDokumen?.startsWith('data:application/pdf') || materi.linkDokumen?.startsWith('data:');
  const isHttpUrl = materi.linkDokumen?.startsWith('http');

  // If remote HTTP and not direct PDF, we can also prepare google docs viewer or direct iframe
  const embedUrl = isHttpUrl
    ? materi.linkDokumen.endsWith('.pdf')
      ? materi.linkDokumen
      : `https://docs.google.com/viewer?url=${encodeURIComponent(materi.linkDokumen)}&embedded=true`
    : materi.linkDokumen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500 text-slate-950 shadow-md shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getFormatBadge(
                    materi.fileFormat
                  )}`}
                >
                  {materi.fileFormat || 'PDF'}
                </span>
                <span className="text-xs font-semibold text-teal-200 truncate">
                  {materi.kategori || 'Dokumen Edukasi'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white truncate max-w-sm sm:max-w-lg mt-0.5">
                {materi.judul}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              title="Salin Teks / Informasi"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isCopied ? 'Tersalin' : 'Bagikan'}</span>
            </button>

            <button
              onClick={handlePrint}
              title="Cetak Dokumen"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>

            <button
              onClick={onClose}
              title="Tutup"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action & View Switcher Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewTab('reader')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewTab === 'reader'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Naskah & Format PDF</span>
            </button>

            {hasDocumentLink && (
              <button
                type="button"
                onClick={() => setViewTab('embed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewTab === 'embed'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Berkas Interaktif</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasDocumentLink && (
              <a
                href={materi.linkDokumen}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onDownload?.()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Tab Baru</span>
              </a>
            )}

            <a
              href={materi.linkDokumen || '#'}
              download={
                materi.judul ? `${materi.judul.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'dokumen_materi.pdf'
              }
              onClick={(e) => {
                if (!materi.linkDokumen) {
                  e.preventDefault();
                  window.print();
                } else {
                  onDownload?.();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas PDF</span>
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* VIEW MODE 1: RICH FORMATTED DOCUMENT READER */}
          {viewTab === 'reader' && (
            <div className="space-y-6">
              {/* Document Paper Container (styled like an official A4 document) */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
                {/* Official Letterhead Header */}
                <div className="border-b-2 border-slate-900 dark:border-slate-300 pb-4 text-center space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-teal-800 dark:text-teal-300">
                    PEMERINTAH KOTA PASURUAN • DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </p>
                  <h1 className="text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white tracking-wide">
                    UPT SATUAN PENDIDIKAN SMP NEGERI 7 PASURUAN
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    TIM PENCEGAHAN DAN PENANGANAN KEKERASAN (TPPK) • INOVASI PASS TEMENAN
                  </p>
                </div>

                {/* Title & Metadata Box */}
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold">
                    DOKUMEN RESMI / MATERI EDUKASI
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {materi.judul}
                  </h2>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                    {materi.penulis && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {materi.penulis}
                        </span>
                      </div>
                    )}
                    {materi.tanggal && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>Diterbitkan: {materi.tanggal}</span>
                      </div>
                    )}
                    {materi.bacaanMenit && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Estimasi Baca: ± {materi.bacaanMenit} menit</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ringkasan Intisari Box */}
                <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-teal-600" />
                    Ringkasan Intisari Dokumen:
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {materi.ringkasan}
                  </p>
                </div>

                {/* Konten Lengkap Naskah / Uraian Regulasi */}
                {materi.kontenLengkap && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-teal-600" />
                      Naskah & Panduan Lengkap:
                    </h3>
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line shadow-2xs">
                      {materi.kontenLengkap}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {materi.tags && materi.tags.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 block mb-2">
                      Kata Kunci & Topik Terkait:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {materi.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                          <Tag className="w-3 h-3 text-teal-600" />
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: INTERACTIVE EMBED / IFRAME / OBJECT VIEWER */}
          {viewTab === 'embed' && hasDocumentLink && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {materi.judul}
                    </p>
                    <p className="text-[11px] text-teal-700 dark:text-teal-300">
                      Pratinjau Berkas {materi.fileFormat || 'PDF'}
                    </p>
                  </div>
                </div>

                <a
                  href={materi.linkDokumen}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Layar Penuh</span>
                </a>
              </div>

              {/* Embed Frame */}
              <div className="w-full h-[60vh] min-h-[420px] bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner">
                {isBase64Pdf ? (
                  <object
                    data={materi.linkDokumen}
                    type="application/pdf"
                    className="w-full h-full border-none"
                  >
                    <iframe
                      src={materi.linkDokumen}
                      title={materi.judul}
                      className="w-full h-full border-none"
                    />
                  </object>
                ) : (
                  <iframe
                    src={embedUrl}
                    title={materi.judul}
                    className="w-full h-full border-none"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
            SMPN 7 Pasuruan • Satgas PPKSP & PASS TEMENAN
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
