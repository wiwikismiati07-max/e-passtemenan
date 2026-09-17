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
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { MateriEdukasiItem } from '../../types';
import { downloadFileSafely, openDocumentSafely } from '../../utils/fileDownloader';
import { triggerPrintElement, exportElementToPDF } from '../../utils/exportUtils';
import { StorageService } from '../../services/storage';
import { KopSurat } from '../KopSurat';
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
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pejabatConfig, setPejabatConfig] = useState(StorageService.getPejabatConfig());

  useEffect(() => {
    if (isOpen) {
      setPejabatConfig(StorageService.getPejabatConfig());
    }
  }, [isOpen]);

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
    const textToCopy = `${materi.judul}\n\n${materi.ringkasan}\n\n${materi.kontenLengkap || ''}\n\nSumber: Media Edukasi Digital Aplikasi SAHABAT Spanju (SMPN 7 Pasuruan)`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    showInModalToast('Teks materi berhasil disalin!');
  };

  const handlePrint = () => {
    if (!materi) return;
    showInModalToast('Mempersiapkan dialog cetak resmi...');
    triggerPrintElement('materi-detail-printable-area', `Materi Edukasi - ${materi.judul}`);
  };

  const handleExportPdf = async () => {
    if (!materi || isExportingPdf) return;
    setIsExportingPdf(true);
    showInModalToast('Membuat berkas PDF dokumen resmi...');
    const cleanFilename = `Materi_${materi.judul.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 45)}_${Date.now()}`;

    try {
      await exportElementToPDF('materi-detail-printable-area', cleanFilename);
      showInModalToast('Dokumen PDF berhasil diunduh ke perangkat.');
      StorageService.incrementUnduhanMedia('materi', materi.id);
      onDownload?.();
    } catch (err) {
      console.warn('Export PDF error, fallback to print dialog:', err);
      showInModalToast('Mengalihkan ke dialog cetak...');
      triggerPrintElement('materi-detail-printable-area', `Materi Edukasi - ${materi.judul}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadFile = () => {
    if (!materi.linkDokumen) {
      handleExportPdf();
      return;
    }
    const cleanFilename = materi.judul
      ? `${materi.judul.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}.pdf`
      : 'dokumen_materi_spanju.pdf';

    downloadFileSafely(materi.linkDokumen, cleanFilename);
    StorageService.incrementUnduhanMedia('materi', materi.id);
    showInModalToast('Berkas dokumen sedang diunduh ke perangkat Anda.');
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

  // Signatory details from config
  const kepalaNama = pejabatConfig.kepalaSekolahNama || 'NUR FADILAH, S.Pd., M.Pd';
  const kepalaNip = pejabatConfig.kepalaSekolahNip || '19860410 201001 2 030';
  const kepalaJabatan = pejabatConfig.kepalaSekolahJabatan || 'Kepala UPT SMP Negeri 7 Pasuruan';
  const kepalaTtd = pejabatConfig.kepalaSekolahTtd || '';

  const guruNama = materi.penulis || pejabatConfig.selectedGuruBK || 'Wiwik Ismiati, S.Pd';
  const guruNip = pejabatConfig.guruBKNip || '19810505 200801 2 018';
  const guruJabatan = pejabatConfig.guruBKJabatan || 'Guru Pendamping BK / Koordinator TPPK';
  const guruTtd = pejabatConfig.guruBKTtd || '';

  // Render Printable Document Card Content
  const renderPrintableDocument = () => (
    <div
      id="materi-detail-printable-area"
      className="bg-white text-slate-900 print:text-black rounded-2xl border border-slate-200 dark:border-slate-700 print:border-none p-6 sm:p-8 print:p-0 shadow-sm space-y-6 print:space-y-4"
    >
      {/* Official Government Kop Surat */}
      <KopSurat
        judulLaporan="DOKUMEN RESMI MATERI EDUKASI"
        nomorSurat={`PPKSP-MAT/SPANJU/${(materi.kategori || 'EDUKASI').toUpperCase().replace(/[^A-Z0-9]/g, '-')}/${materi.id}`}
        tanggalSurat={materi.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      />

      {/* Document Identity & Category Badge */}
      <div className="space-y-2 border-b border-slate-200 print:border-black pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-block px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold uppercase tracking-wider print:border-black print:bg-transparent">
            Kategori: {materi.kategori || 'Materi Edukasi'}
          </span>
          <span className="text-[11px] font-mono text-slate-500 print:text-black">
            Format Berkas: {materi.fileFormat || 'PDF'}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl print:text-[14pt] font-black text-slate-900 print:text-black leading-tight">
          {materi.judul}
        </h2>

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs print:text-[9pt] text-slate-600 print:text-black pt-1">
          {materi.penulis && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600 print:hidden" />
              <span>Penyusun / Narasumber: <strong className="text-slate-900 print:text-black">{materi.penulis}</strong></span>
            </div>
          )}
          {materi.tanggal && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500 print:hidden" />
              <span>Tanggal Terbit: {materi.tanggal}</span>
            </div>
          )}
          {materi.bacaanMenit && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500 print:hidden" />
              <span>Estimasi Waktu Baca: ± {materi.bacaanMenit} menit</span>
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan Intisari Box */}
      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 print:border-black print:bg-transparent space-y-1.5 print:break-inside-avoid">
        <h3 className="text-xs print:text-[10pt] font-black uppercase tracking-wider text-teal-950 print:text-black flex items-center gap-1.5">
          <BookmarkCheck className="w-4 h-4 text-teal-600 print:hidden" />
          <span>Ringkasan Intisari Dokumen:</span>
        </h3>
        <p className="text-xs sm:text-sm print:text-[10pt] text-slate-800 print:text-black leading-relaxed font-sans text-justify">
          {materi.ringkasan}
        </p>
      </div>

      {/* Konten Lengkap Naskah / Uraian Panduan */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs print:text-[10pt] font-black uppercase tracking-wider text-slate-800 print:text-black flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-teal-600 print:hidden" />
          <span>Naskah & Panduan Lengkap:</span>
        </h3>

        {materi.kontenLengkap ? (
          <div className="p-5 sm:p-6 print:p-2 rounded-2xl print:rounded-none bg-slate-50 print:bg-transparent border border-slate-200 print:border-black text-xs sm:text-sm print:text-[9.5pt] text-slate-800 print:text-black leading-relaxed font-sans whitespace-pre-line text-justify">
            {materi.kontenLengkap}
          </div>
        ) : (
          <div className="p-5 print:p-2 rounded-2xl print:rounded-none bg-slate-50 print:bg-transparent border border-slate-200 print:border-black text-xs sm:text-sm print:text-[9.5pt] text-slate-700 print:text-black leading-relaxed space-y-2">
            <p>
              Materi edukasi ini disajikan dalam format berkas digital lengkap (PDF/Dokumen Resmi) dan dapat diakses langsung oleh seluruh siswa, guru, dan wali murid melalui portal Aplikasi SAHABAT Spanju.
            </p>
            {hasDocumentLink && (
              <p className="font-mono text-[11px] print:text-[8pt] text-teal-800 print:text-black break-all">
                Tautan Dokumen Rujukan: {materi.linkDokumen}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tags / Kata Kunci */}
      {materi.tags && materi.tags.length > 0 && (
        <div className="pt-2 border-t border-slate-100 print:border-black print:break-inside-avoid">
          <span className="text-xs print:text-[8.5pt] font-bold text-slate-500 print:text-black block mb-1.5">
            Kata Kunci & Klasifikasi Regulasi:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {materi.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 print:bg-transparent border border-slate-200 print:border-black text-[11px] print:text-[8pt] font-semibold text-slate-700 print:text-black"
              >
                <Tag className="w-3 h-3 text-teal-600 print:hidden" />
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lembar Tanda Tangan & Pengesahan Resmi Dua Sisi */}
      <div className="pt-4 border-t-2 border-slate-900 print:border-black print:break-inside-avoid">
        <table className="w-full border-none border-collapse text-xs print:text-[9pt] text-center table-fixed m-0 p-0 select-none">
          <tbody>
            <tr>
              {/* Kolom Kiri: Tim Penyusun / Guru Pendamping BK / Koordinator TPPK */}
              <td className="w-1/2 align-top p-2 print:p-1">
                <p className="text-slate-600 print:text-black m-0">Pasuruan, {materi.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold text-slate-900 print:text-black m-0 leading-tight">
                  {guruJabatan}
                </p>

                {/* Signature Box */}
                <div className="h-20 sm:h-24 print:h-20 mx-auto w-full max-w-[170px] flex items-center justify-center my-1">
                  {guruTtd && guruTtd.startsWith('data:image') ? (
                    <img
                      src={guruTtd}
                      alt="Tanda Tangan Guru BK"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="h-14 border-b border-dashed border-slate-300 print:border-black w-36 mx-auto flex items-end justify-center pb-1 text-[10px] text-slate-400 print:text-transparent">
                      (Tanda Tangan)
                    </div>
                  )}
                </div>

                <p className="font-bold text-slate-900 print:text-black underline uppercase m-0">
                  {guruNama}
                </p>
                <p className="text-[11px] print:text-[8pt] text-slate-600 print:text-black m-0">
                  NIP. {guruNip}
                </p>
              </td>

              {/* Kolom Kanan: Mengetahui, Kepala UPT SMP Negeri 7 Pasuruan */}
              <td className="w-1/2 align-top p-2 print:p-1">
                <p className="text-slate-600 print:text-black m-0">Mengetahui,</p>
                <p className="font-bold text-slate-900 print:text-black m-0 leading-tight">
                  {kepalaJabatan}
                </p>

                {/* Signature Box with Official Stamp */}
                <div className="relative h-20 sm:h-24 print:h-20 mx-auto w-full max-w-[170px] flex items-center justify-center my-1">
                  {kepalaTtd && kepalaTtd.startsWith('data:image') ? (
                    <img
                      src={kepalaTtd}
                      alt="Tanda Tangan Kepala Sekolah"
                      className="max-h-full max-w-full object-contain relative z-10"
                    />
                  ) : (
                    <div className="h-14 border-b border-dashed border-slate-300 print:border-black w-36 mx-auto flex items-end justify-center pb-1 text-[10px] text-slate-400 print:text-transparent">
                      (Tanda Tangan & Stempel)
                    </div>
                  )}

                  {/* Stempel Resmi Sekolah */}
                  <img
                    src="https://i.ibb.co.com/wrcwZdrK/STEMPEL.png"
                    alt="Stempel Resmi UPT SMPN 7 Pasuruan"
                    className="absolute left-1/2 top-1/2 -translate-x-[60%] -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 print:w-20 print:h-20 object-contain pointer-events-none opacity-85 z-20 mix-blend-multiply select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <p className="font-bold text-slate-900 print:text-black underline uppercase m-0">
                  {kepalaNama}
                </p>
                <p className="text-[11px] print:text-[8pt] text-slate-600 print:text-black m-0">
                  NIP. {kepalaNip}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Digital Footer Verification */}
      <div className="pt-3 border-t border-slate-200 print:border-black flex flex-wrap items-center justify-between text-[9.5px] print:text-[7.5pt] text-slate-500 print:text-black print:break-inside-avoid">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-teal-600 print:hidden" />
          <span>Dokumen Resmi Aplikasi SAHABAT Spanju • UPT SMP Negeri 7 Pasuruan</span>
        </div>
        <div>
          Waktu Cetak: {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>
    </div>
  );

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

            {/* Cetak PDF / Print Button */}
            <button
              onClick={handlePrint}
              title="Cetak Naskah Dokumen Resmi (Buka Dialog Cetak)"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen</span>
            </button>

            {/* Unduh PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              title="Unduh Berkas PDF Dokumen Resmi"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isExportingPdf ? 'Memproses...' : 'Unduh PDF'}</span>
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
                <span>Pratinjau Berkas Digital</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cetak Naskah Resmi Sekarang"
            >
              <Printer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Cetak / PDF</span>
            </button>

            {hasDocumentLink && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Buka Dokumen di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Tab Baru</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Unduh Berkas ke Perangkat"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* VIEW MODE 1: OFFICIAL PRINTABLE DOCUMENT (Visible in reader mode) */}
          {viewTab === 'reader' && (
            <div className="space-y-6">
              {renderPrintableDocument()}
            </div>
          )}

          {/* VIEW MODE 2: INTERACTIVE PDF CANVAS VIEWER */}
          {viewTab === 'embed' && hasDocumentLink && (
            <div className="space-y-3">
              <PdfViewer
                source={materi.linkDokumen!}
                title={materi.judul}
                onDownload={handleDownloadFile}
                onPrint={handlePrint}
              />
            </div>
          )}

          {/* ALWAYS MOUNTED HIDDEN PRINTABLE CONTAINER WHEN IN EMBED MODE */}
          {viewTab === 'embed' && (
            <div className="hidden">
              {renderPrintableDocument()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
            SMPN 7 Pasuruan • Satgas PPKSP & Aplikasi SAHABAT Spanju
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>

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
