import React, { useState, useEffect } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { MateriEdukasiItem } from '../../types';
import { downloadFileSafely, openDocumentSafely } from '../../utils/fileDownloader';
import { PdfViewer } from './PdfViewer';

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
  const [toastMsg, setToastMsg] = useState<string>('');

  const showInModalToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Smart view selection: if newly uploaded PDF without text content, open interactive preview by default
  useEffect(() => {
    if (materi) {
      if (materi.linkDokumen && (!materi.kontenLengkap || materi.kontenLengkap.trim().length < 40)) {
        setViewTab('embed');
      } else {
        setViewTab('reader');
      }
    }
  }, [materi]);

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

  const handleDownloadFile = () => {
    if (!materi.linkDokumen) {
      window.print();
      return;
    }
    const cleanFilename = materi.judul
      ? `${materi.judul.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}.pdf`
      : 'dokumen_materi_spanju.pdf';

    downloadFileSafely(materi.linkDokumen, cleanFilename);
    showInModalToast('Berkas sedang diunduh ke perangkat Anda.');
    onDownload?.();
  };

  const handleOpenInNewTab = () => {
    if (!materi.linkDokumen) return;
    const opened = openDocumentSafely(materi.linkDokumen, materi.judul);
    if (!opened) {
      // Fallback to in-app interactive tab if popups are restricted in iframe
      setViewTab('embed');
      showInModalToast('Pratinjau dibuka langsung di dalam aplikasi.');
    }
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
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Naskah & Panduan Teks</span>
            </button>

            {hasDocumentLink && (
              <button
                type="button"
                onClick={() => setViewTab('embed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewTab === 'embed'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Dokumen PDF</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasDocumentLink && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Buka Dokumen di Tab Baru atau Jendela Terpisah"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Tab Baru</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Unduh file dokumen ke perangkat"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas PDF</span>
            </button>
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
                {materi.kontenLengkap ? (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-teal-600" />
                      Naskah & Panduan Lengkap:
                    </h3>
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line shadow-2xs">
                      {materi.kontenLengkap}
                    </div>
                  </div>
                ) : hasDocumentLink ? (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Dokumen ini tersimpan dalam format berkas digital ({materi.fileFormat || 'PDF'}).
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Anda dapat melihat pratinjau visual berkas secara interaktif atau langsung mengunduhnya ke perangkat Anda.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setViewTab('embed')}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Pratinjau PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadFile}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Berkas</span>
                      </button>
                    </div>
                  </div>
                ) : null}

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

          {/* VIEW MODE 2: INTERACTIVE PDF CANVAS VIEWER */}
          {viewTab === 'embed' && hasDocumentLink && (
            <div className="space-y-3">
              <PdfViewer
                source={materi.linkDokumen!}
                title={materi.judul}
                onDownload={handleDownloadFile}
              />
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

      {/* In-Modal Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
