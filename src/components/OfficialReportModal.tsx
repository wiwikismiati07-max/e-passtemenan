import React, { useState, useEffect } from 'react';
import { KopSurat } from './KopSurat';
import {
  Printer,
  X,
  Download,
  ShieldCheck,
  CheckCircle2,
  Settings,
  PenLine,
  ChevronDown,
  Edit3,
  Check,
  Trash2,
  RotateCcw,
  FileText,
  FileSpreadsheet,
  Camera,
  Image as ImageIcon,
  Plus,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { StorageService, GURU_BK_OPTIONS, DEFAULT_PEJABAT_CONFIG } from '../services/storage';
import { PejabatSettingsModal } from './PejabatSettingsModal';
import { SignatureCanvas } from './SignatureCanvas';
import { PhotoUploadArea, normalizeImageUrl } from './PhotoUploadArea';
import { exportOfficialReportToWordDoc, exportToExcel, exportElementToPDF, triggerPrintElement } from '../utils/exportUtils';

export interface ReportDataField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

interface OfficialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  judulLaporan: string;
  nomorSurat?: string;
  tanggalSurat?: string;
  fields: ReportDataField[];
  catatanUtama?: {
    judul: string;
    isi: string;
  };
  linkFoto?: string;
  onUpdatePhoto?: (newPhotoUrl: string) => void;
  tandaTangan?: string;
  namaPenandatangan?: string;
  jabatanPenandatangan?: string;
  nipPenandatangan?: string;
  namaMengetahui?: string;
  jabatanMengetahui?: string;
  nipMengetahui?: string;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
  isOpen,
  onClose,
  judulLaporan,
  nomorSurat,
  tanggalSurat,
  fields,
  catatanUtama,
  linkFoto,
  onUpdatePhoto,
  tandaTangan: propTandaTangan,
  namaPenandatangan: propNamaPenandatangan,
  jabatanPenandatangan: propJabatanPenandatangan,
  nipPenandatangan: propNipPenandatangan,
  namaMengetahui: propNamaMengetahui,
  jabatanMengetahui: propJabatanMengetahui,
  nipMengetahui: propNipMengetahui,
}) => {
  const [pejabatConfig, setPejabatConfig] = useState(DEFAULT_PEJABAT_CONFIG);
  const [isPejabatModalOpen, setIsPejabatModalOpen] = useState(false);
  const [isGuruDropdownOpen, setIsGuruDropdownOpen] = useState(false);
  const [isSignCanvasOpen, setIsSignCanvasOpen] = useState<'kepala' | 'guru' | null>(null);

  // Photo management inside modal
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string>(linkFoto || '');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>('');
  const [showFullscreenPhoto, setShowFullscreenPhoto] = useState(false);

  // Local signature overrides: null means use default/prop, '' means explicitly cleared/deleted
  const [localGuruSign, setLocalGuruSign] = useState<string | null>(null);
  const [localKepalaSign, setLocalKepalaSign] = useState<string | null>(null);
  const [modalPendingSign, setModalPendingSign] = useState<string>('');

  const loadConfig = () => {
    const cfg = StorageService.getPejabatConfig();
    setPejabatConfig({ ...cfg });
  };

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setLocalGuruSign(null);
      setLocalKepalaSign(null);
      setLocalPhotoUrl(linkFoto || '');
    }
  }, [isOpen, linkFoto]);

  if (!isOpen) return null;

  const handlePrint = () => {
    triggerPrintElement('official-report-printable-area', judulLaporan);
  };

  const handleDownloadPDF = () => {
    const filename = `${judulLaporan.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    exportElementToPDF('official-report-printable-area', filename);
  };

  const currentDateFormatted =
    tanggalSurat ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  // Effective Kepala Sekolah details
  const effectiveKepalaNama =
    propNamaMengetahui || pejabatConfig.kepalaSekolahNama || 'NUR FADILAH, S.Pd., M.Pd';
  const effectiveKepalaNip =
    propNipMengetahui || pejabatConfig.kepalaSekolahNip || '19860410 201001 2 030';
  const effectiveKepalaJabatan =
    propJabatanMengetahui || pejabatConfig.kepalaSekolahJabatan || 'Kepala UPT SMP Negeri 7 Pasuruan';
  const effectiveKepalaTtd =
    localKepalaSign !== null
      ? localKepalaSign
      : (pejabatConfig.kepalaSekolahTtd || '');

  // Effective Guru Pendamping / Guru BK details
  const effectiveGuruNama =
    propNamaPenandatangan || pejabatConfig.selectedGuruBK || GURU_BK_OPTIONS[0].nama;
  const effectiveGuruNip =
    propNipPenandatangan || pejabatConfig.guruBKNip || GURU_BK_OPTIONS[0].nip;
  const effectiveGuruJabatan =
    propJabatanPenandatangan || 'Guru Pendamping / Guru BK';
  const effectiveGuruTtd =
    localGuruSign !== null
      ? localGuruSign
      : (propTandaTangan !== undefined && propTandaTangan !== ''
          ? propTandaTangan
          : (pejabatConfig.guruBKTtd || ''));

  const handleSelectGuruPreset = (guru: typeof GURU_BK_OPTIONS[0]) => {
    StorageService.savePejabatConfig({
      selectedGuruBK: guru.nama,
      guruBKNip: guru.nip,
      guruBKJabatan: guru.jabatan,
    });
    loadConfig();
    setIsGuruDropdownOpen(false);
  };

  const handleOpenSignCanvas = (target: 'kepala' | 'guru') => {
    setIsSignCanvasOpen(target);
    setModalPendingSign(target === 'kepala' ? effectiveKepalaTtd : effectiveGuruTtd);
  };

  const handleDirectDeleteSign = (target: 'kepala' | 'guru', e: React.MouseEvent) => {
    e.stopPropagation();
    if (target === 'kepala') {
      setLocalKepalaSign('');
      StorageService.savePejabatConfig({ kepalaSekolahTtd: '' });
    } else {
      setLocalGuruSign('');
      StorageService.savePejabatConfig({ guruBKTtd: '' });
    }
    loadConfig();
  };

  const handleSaveModalSign = () => {
    if (isSignCanvasOpen === 'kepala') {
      setLocalKepalaSign(modalPendingSign);
      StorageService.savePejabatConfig({ kepalaSekolahTtd: modalPendingSign });
    } else if (isSignCanvasOpen === 'guru') {
      setLocalGuruSign(modalPendingSign);
      StorageService.savePejabatConfig({ guruBKTtd: modalPendingSign });
    }
    setIsSignCanvasOpen(null);
    loadConfig();
  };

  const handleClearModalSign = () => {
    setModalPendingSign('');
    if (isSignCanvasOpen === 'kepala') {
      setLocalKepalaSign('');
      StorageService.savePejabatConfig({ kepalaSekolahTtd: '' });
    } else if (isSignCanvasOpen === 'guru') {
      setLocalGuruSign('');
      StorageService.savePejabatConfig({ guruBKTtd: '' });
    }
    setIsSignCanvasOpen(null);
    loadConfig();
  };

  const handleOpenPhotoModal = () => {
    setTempPhotoUrl(localPhotoUrl || '');
    setIsPhotoModalOpen(true);
  };

  const handleSavePhotoModal = () => {
    const finalUrl = tempPhotoUrl.trim();
    setLocalPhotoUrl(finalUrl);
    setIsPhotoModalOpen(false);
    if (onUpdatePhoto) {
      onUpdatePhoto(finalUrl);
    }
  };

  const handleRemovePhotoModal = () => {
    setLocalPhotoUrl('');
    setTempPhotoUrl('');
    setIsPhotoModalOpen(false);
    if (onUpdatePhoto) {
      onUpdatePhoto('');
    }
  };

  const handleDownloadWord = () => {
    const cleanFields = fields.map((f) => ({
      label: f.label,
      value:
        f.label.toLowerCase().includes('foto') || f.label.toLowerCase().includes('dokumentasi')
          ? localPhotoUrl
            ? 'Tersedia & Terlampir'
            : 'Tidak Ada Foto'
          : typeof f.value === 'string' || typeof f.value === 'number'
          ? f.value
          : '',
    }));
    exportOfficialReportToWordDoc(
      `${judulLaporan.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      judulLaporan,
      nomorSurat,
      tanggalSurat,
      cleanFields,
      catatanUtama,
      {
        kepalaNama: effectiveKepalaNama,
        kepalaNip: effectiveKepalaNip,
        kepalaJabatan: effectiveKepalaJabatan,
        kepalaTtd: effectiveKepalaTtd,
        guruNama: effectiveGuruNama,
        guruNip: effectiveGuruNip,
        guruJabatan: effectiveGuruJabatan,
        guruTtd: effectiveGuruTtd,
      },
      localPhotoUrl || undefined
    );
  };

  const handleDownloadExcel = () => {
    const headers = ['Informasi / Field', 'Isi Data'];
    const rows = fields.map((f) => [
      f.label,
      f.label.toLowerCase().includes('foto') || f.label.toLowerCase().includes('dokumentasi')
        ? localPhotoUrl || 'Tidak Ada Foto'
        : typeof f.value === 'string' || typeof f.value === 'number'
        ? String(f.value)
        : '',
    ]);
    if (catatanUtama) {
      rows.push([catatanUtama.judul, catatanUtama.isi]);
    }
    rows.push(['Kepala Sekolah', `${effectiveKepalaNama} (NIP. ${effectiveKepalaNip})`]);
    rows.push(['Guru Pendamping', `${effectiveGuruNama} (NIP. ${effectiveGuruNip})`]);

    exportToExcel(
      `${judulLaporan.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      'Laporan Resmi',
      headers,
      rows
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-fadeIn print:max-w-none print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none">
        
        {/* Sticky Toolbar (Hidden during print) */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
              Pratinjau Dokumen Laporan Resmi
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Download Word Button */}
            <button
              type="button"
              onClick={handleDownloadWord}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-all"
              title="Unduh laporan versi Word (.doc)"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Word</span>
            </button>

            {/* Download Excel Button */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-all"
              title="Unduh laporan versi Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Excel</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 transition-all"
              title="Unduh berkas PDF langsung (.pdf)"
            >
              <Download className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Unduh PDF</span>
            </button>
            {/* Quick Guru BK Selector Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsGuruDropdownOpen(!isGuruDropdownOpen)}
                className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 border border-teal-200 dark:border-teal-800 transition-all"
              >
                <span>Guru BK: {effectiveGuruNama.split(',')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isGuruDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 z-30 animate-fadeIn">
                  <span className="text-[10px] font-bold text-slate-400 px-2 py-1 block">
                    PILIH GURU PENDAMPING / BK:
                  </span>
                  {GURU_BK_OPTIONS.map((guru, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectGuruPreset(guru)}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        effectiveGuruNama === guru.nama
                          ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{guru.nama}</div>
                        <div className="text-[10px] text-slate-400">NIP. {guru.nip}</div>
                      </div>
                      {effectiveGuruNama === guru.nama && (
                        <Check className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                    </button>
                  ))}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGuruDropdownOpen(false);
                        setIsPejabatModalOpen(true);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Edit Pejabat & TTD Lengkap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Pejabat Settings Button */}
            <button
              onClick={() => setIsPejabatModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              title="Edit Nama Kepala Sekolah, NIP & Guru BK"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Edit Pejabat</span>
            </button>

            {/* Cetak Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div id="official-report-printable-area" className="p-3 sm:p-8 space-y-4 sm:space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 print:p-0 print:space-y-3 print:text-black">
          {/* 1. KOP SURAT RESMI SMPN 7 PASURUAN */}
          <KopSurat
            judulLaporan={judulLaporan}
            nomorSurat={nomorSurat}
            tanggalSurat={tanggalSurat}
          />

          {/* 2. TABEL DATA LAPORAN RESMI */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:border-black print:rounded-none print:break-inside-avoid shadow-xs">
            <table className="w-full text-xs print:text-[9pt] border-collapse border-none">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 print:bg-slate-100 print:border-black">
                  <th
                    colSpan={2}
                    className="px-3 sm:px-4 py-2 print:py-1 text-left text-xs print:text-[9pt] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 print:text-black"
                  >
                    Rincian Informasi & Data Laporan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-black">
                {fields.map((field, idx) => {
                  const isPhotoField =
                    field.label.toLowerCase().includes('foto') ||
                    field.label.toLowerCase().includes('dokumentasi');

                  let displayValue = field.value;
                  if (isPhotoField) {
                    displayValue = localPhotoUrl ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold print:text-black">
                        <CheckCircle2 className="w-3.5 h-3.5 print:hidden" />
                        <span>Tersedia & Terlampir di bawah</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium print:text-black">
                        <span>Belum Terlampir</span>
                        {onUpdatePhoto && (
                          <button
                            type="button"
                            onClick={handleOpenPhotoModal}
                            className="text-teal-600 dark:text-teal-400 underline font-bold print:hidden"
                          >
                            (Klik untuk melampirkan)
                          </button>
                        )}
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 print:hover:bg-transparent"
                    >
                      <td className="w-[38%] sm:w-[32%] print:w-[32%] px-3 sm:px-4 py-2 print:px-2 print:py-1 font-bold text-slate-600 dark:text-slate-300 print:text-black align-top bg-slate-50/30 dark:bg-slate-900/30 print:bg-transparent border-r border-slate-200 dark:border-slate-800 print:border-black">
                        {field.label}
                      </td>
                      <td className="px-3 sm:px-4 py-2 print:px-2 print:py-1 text-slate-900 dark:text-slate-100 print:text-black align-top font-medium whitespace-pre-wrap leading-relaxed">
                        {displayValue || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 3. CATATAN / URAIAN UTAMA */}
          {catatanUtama && (
            <div className="p-3 sm:p-4 print:p-2 rounded-2xl print:rounded-none border border-slate-200 dark:border-slate-800 print:border-black bg-slate-50/50 dark:bg-slate-800/40 print:bg-transparent space-y-1 text-xs print:text-[9pt] print:break-inside-avoid">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase print:text-black">
                {catatanUtama.judul}
              </h4>
              <p className="text-slate-700 dark:text-slate-300 print:text-black leading-relaxed whitespace-pre-wrap">
                {catatanUtama.isi}
              </p>
            </div>
          )}

          {/* 4. DOKUMENTASI FOTO (RESPONSIF DI HP, LAPTOP & PRINT) */}
          {localPhotoUrl ? (
            <div className="space-y-1.5 text-xs print:text-[9pt] print:break-inside-avoid">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase print:text-black flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-teal-600 print:hidden" />
                  <span>Lampiran Dokumentasi Kegiatan:</span>
                </h4>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => setShowFullscreenPhoto(true)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    title="Perbesar foto tampilan penuh"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Perbesar</span>
                  </button>
                  {onUpdatePhoto && (
                    <>
                      <button
                        type="button"
                        onClick={handleOpenPhotoModal}
                        className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-[11px] font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1 transition-colors"
                        title="Ganti atau perbarui foto ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ganti Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhotoModal}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1 transition-colors"
                        title="Hapus foto dari laporan ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div
                onClick={() => setShowFullscreenPhoto(true)}
                className="rounded-2xl print:rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 print:border-slate-300 max-h-72 sm:max-h-80 print:max-h-52 flex items-center justify-center bg-slate-950/90 print:bg-transparent cursor-pointer group relative shadow-inner mx-auto text-center"
              >
                <img
                  src={normalizeImageUrl(localPhotoUrl)}
                  alt="Dokumentasi Kegiatan"
                  className="max-h-72 sm:max-h-80 print:max-h-48 w-auto max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.02] print:rounded-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center print:hidden">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Klik untuk memperbesar</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border-2 border-dashed border-teal-500/30 dark:border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20 text-center space-y-2 print:hidden">
              <div className="flex items-center justify-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
                <Camera className="w-4 h-4 text-emerald-500" />
                <span>Dokumentasi Foto Belum Dilampirkan</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Foto dokumentasi dapat langsung diambil melalui kamera HP atau diunggah dari galeri/laptop agar otomatis tampil di laporan resmi dan disimpan ke Supabase Cloud Storage.
              </p>
              {onUpdatePhoto && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleOpenPhotoModal}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ambil Foto HP / Unggah Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5. TANDA TANGAN DIGITAL RESMI PADA DUA SISI */}
          <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 print:border-black print:break-inside-avoid">
            <table className="w-full border-none border-collapse text-xs print:text-[9pt] text-center table-fixed m-0 p-0 select-none">
              <tbody>
                <tr>
                  {/* Kolom Kiri: Mengetahui, Kepala UPT SMP Negeri 7 Pasuruan */}
                  <td className="w-1/2 align-top p-1 sm:p-2 print:p-1">
                    <p className="text-slate-600 dark:text-slate-400 print:text-black m-0">Mengetahui,</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 print:text-black m-0 leading-tight">
                      {effectiveKepalaJabatan}
                    </p>

                    {/* Signature Box for Kepala Sekolah */}
                    <div className="relative group mx-auto w-full max-w-[180px] my-1 sm:my-1.5">
                      <div
                        onClick={() => handleOpenSignCanvas('kepala')}
                        className="h-20 sm:h-24 print:h-20 mx-auto w-full border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-1 cursor-pointer hover:border-blue-400 transition-all bg-slate-50/40 dark:bg-slate-800/20 print:border-none print:bg-transparent relative overflow-visible"
                        title="Klik untuk TTD Kepala Sekolah"
                      >
                        {effectiveKepalaTtd && effectiveKepalaTtd.startsWith('data:image') ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            {/* Tanda Tangan Digital Kepala Sekolah */}
                            <img
                              src={effectiveKepalaTtd}
                              alt="Tanda Tangan Kepala Sekolah"
                              className="max-h-full max-w-full object-contain filter dark:invert-0 print:filter-none z-10 relative"
                            />
                            {/* Logo Stempel Sekolah Resmi UPT SMPN 7 Pasuruan (Hanya tampil setelah Kepala Sekolah TTD) */}
                            <img
                              src="https://i.ibb.co.com/wrcwZdrK/STEMPEL.png"
                              alt="Stempel Resmi UPT SMPN 7 Pasuruan"
                              className="absolute left-1/2 top-1/2 -translate-x-[60%] -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 print:w-20 print:h-20 object-contain pointer-events-none opacity-85 z-20 mix-blend-multiply dark:mix-blend-normal print:mix-blend-multiply drop-shadow-xs select-none"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 text-slate-400 print:text-black">
                            <PenLine className="w-4 h-4 text-slate-400 print:hidden" />
                            <span className="text-[10px] font-medium">
                              (Klik untuk TTD)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons on hover/touch */}
                      {effectiveKepalaTtd && effectiveKepalaTtd.startsWith('data:image') && (
                        <div className="flex items-center justify-center gap-1.5 mt-1 print:hidden">
                          <button
                            type="button"
                            onClick={() => handleOpenSignCanvas('kepala')}
                            className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[10px] font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1"
                            title="Ubah tanda tangan"
                          >
                            <PenLine className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDirectDeleteSign('kepala', e)}
                            className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[10px] font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                            title="Hapus tanda tangan ini"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="font-bold text-slate-900 dark:text-slate-100 underline decoration-1 print:text-black m-0 mt-0.5">
                      {effectiveKepalaNama}
                    </p>
                    <p className="text-[10px] sm:text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-400 print:text-black m-0">
                      NIP. {effectiveKepalaNip}
                    </p>
                  </td>

                  {/* Kolom Kanan: Pasuruan, [Tanggal], Guru Pendamping / Guru BK */}
                  <td className="w-1/2 align-top p-1 sm:p-2 print:p-1">
                    <p className="text-slate-600 dark:text-slate-400 print:text-black m-0">
                      Pasuruan, {currentDateFormatted}
                    </p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 print:text-black m-0 leading-tight">
                      {effectiveGuruJabatan}
                    </p>

                    {/* Signature Box for Guru BK / Petugas */}
                    <div className="relative group mx-auto w-full max-w-[180px] my-1 sm:my-1.5">
                      <div
                        onClick={() => handleOpenSignCanvas('guru')}
                        className="h-20 sm:h-24 print:h-20 mx-auto w-full border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-1 cursor-pointer hover:border-teal-400 transition-all bg-slate-50/40 dark:bg-slate-800/20 print:border-none print:bg-transparent"
                        title="Klik untuk TTD Guru Pendamping / BK"
                      >
                        {effectiveGuruTtd && effectiveGuruTtd.startsWith('data:image') ? (
                          <img
                            src={effectiveGuruTtd}
                            alt="Tanda Tangan Guru BK"
                            className="max-h-full max-w-full object-contain filter dark:invert-0 print:filter-none"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 text-slate-400 print:text-black">
                            <PenLine className="w-4 h-4 text-slate-400 print:hidden" />
                            <span className="text-[10px] font-medium">
                              (Klik untuk TTD)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons on hover/touch */}
                      {effectiveGuruTtd && effectiveGuruTtd.startsWith('data:image') && (
                        <div className="flex items-center justify-center gap-1.5 mt-1 print:hidden">
                          <button
                            type="button"
                            onClick={() => handleOpenSignCanvas('guru')}
                            className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-[10px] font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1"
                            title="Ubah tanda tangan"
                          >
                            <PenLine className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDirectDeleteSign('guru', e)}
                            className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[10px] font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                            title="Hapus tanda tangan ini"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="font-bold text-slate-900 dark:text-slate-100 underline decoration-1 print:text-black m-0 mt-0.5">
                      {effectiveGuruNama}
                    </p>
                    <p className="text-[10px] sm:text-[11px] print:text-[8pt] text-slate-600 dark:text-slate-400 print:text-black m-0">
                      {effectiveGuruNip ? `NIP. ${effectiveGuruNip}` : '-'}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Validation Note */}
          <div className="text-[10px] print:text-[7.5pt] text-slate-400 dark:text-slate-500 text-center pt-2 border-t border-slate-100 dark:border-slate-800 print:text-black print:break-inside-avoid">
            Dokumen ini diterbitkan dan ditandatangani secara sah melalui Sistem Inovasi Layanan E-PASS TEMENAN SPANJU UPT SMPN 7 Pasuruan.
          </div>
        </div>
      </div>

      {/* Settings Modal for Pejabat (Kepala Sekolah & Guru BK) */}
      <PejabatSettingsModal
        isOpen={isPejabatModalOpen}
        onClose={() => setIsPejabatModalOpen(false)}
        onSaved={loadConfig}
      />

      {/* In-place Signature Canvas Modal when clicking (Klik untuk TTD) */}
      {isSignCanvasOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  {isSignCanvasOpen === 'kepala'
                    ? `Tanda Tangan: ${effectiveKepalaNama}`
                    : `Tanda Tangan: ${effectiveGuruNama}`}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSignCanvasOpen(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SignatureCanvas
              label="Goreskan tanda tangan pada layar sentuh HP / tablet / mouse laptop:"
              initialValue={modalPendingSign}
              onSave={(dataUrl) => setModalPendingSign(dataUrl)}
              onClear={() => setModalPendingSign('')}
              height={160}
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClearModalSign}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 transition-colors"
                title="Hapus dan kosongkan tanda tangan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus & Kosongkan TTD</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSignCanvasOpen(null)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalSign}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan TTD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Attachment / Upload Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Lampirkan Foto Dokumentasi Kegiatan
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <PhotoUploadArea
              value={tempPhotoUrl}
              onChange={(url) => setTempPhotoUrl(url)}
              label="Dokumentasi Foto Kegiatan (Online Storage Supabase)"
              folder="laporan_resmi"
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
              {localPhotoUrl ? (
                <button
                  type="button"
                  onClick={handleRemovePhotoModal}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Foto</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSavePhotoModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Pasang ke Laporan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {showFullscreenPhoto && localPhotoUrl && (
        <div
          onClick={() => setShowFullscreenPhoto(false)}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <a
              href={normalizeImageUrl(localPhotoUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Tab Baru</span>
            </a>
            <button
              onClick={() => setShowFullscreenPhoto(false)}
              className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-4xl max-h-[85vh] p-2 flex items-center justify-center">
            <img
              src={normalizeImageUrl(localPhotoUrl)}
              alt="Dokumentasi Fullscreen"
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-700"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-slate-400 text-xs mt-3">Klik di mana saja untuk menutup</p>
        </div>
      )}
    </div>
  );
};
