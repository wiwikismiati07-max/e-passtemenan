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
} from 'lucide-react';
import { StorageService, GURU_BK_OPTIONS, DEFAULT_PEJABAT_CONFIG } from '../services/storage';
import { PejabatSettingsModal } from './PejabatSettingsModal';
import { SignatureCanvas } from './SignatureCanvas';
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
    }
  }, [isOpen]);

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

  const handleDownloadWord = () => {
    const cleanFields = fields.map((f) => ({
      label: f.label,
      value: typeof f.value === 'string' || typeof f.value === 'number' ? f.value : '',
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
      }
    );
  };

  const handleDownloadExcel = () => {
    const headers = ['Informasi / Field', 'Isi Data'];
    const rows = fields.map((f) => [
      f.label,
      typeof f.value === 'string' || typeof f.value === 'number' ? String(f.value) : '',
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
        <div id="official-report-printable-area" className="p-4 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 print:p-0 print:text-black">
          {/* 1. KOP SURAT RESMI SMPN 7 PASURUAN */}
          <KopSurat
            judulLaporan={judulLaporan}
            nomorSurat={nomorSurat}
            tanggalSurat={tanggalSurat}
          />

          {/* 2. TABEL DATA LAPORAN */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:border-black">
            <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 print:bg-slate-100 print:border-black">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 print:text-black">
                Rincian Informasi & Data Laporan
              </h4>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs print:divide-black">
              {fields.map((field, idx) => (
                <div
                  key={idx}
                  className={`grid ${field.fullWidth ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} p-3 gap-1 sm:gap-4`}
                >
                  <span className="font-bold text-slate-600 dark:text-slate-400 sm:col-span-1 print:text-black">
                    {field.label}
                  </span>
                  <div className="text-slate-900 dark:text-slate-100 sm:col-span-2 font-medium print:text-black whitespace-pre-wrap">
                    {field.value || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. CATATAN / URAIAN UTAMA */}
          {catatanUtama && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 text-xs print:bg-white print:border-black">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase print:text-black">
                {catatanUtama.judul}
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap print:text-black">
                {catatanUtama.isi}
              </p>
            </div>
          )}

          {/* 4. DOKUMENTASI FOTO */}
          {linkFoto && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase print:text-black">
                Lampiran Dokumentasi Kegiatan:
              </h4>
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-72 print:max-h-60 flex items-center justify-center bg-slate-950">
                <img
                  src={linkFoto}
                  alt="Dokumentasi"
                  className="max-h-72 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* 5. TANDA TANGAN DIGITAL RESMI PADA DUA SISI */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 print:border-black">
            <div className="grid grid-cols-2 gap-6 text-xs text-center">
              
              {/* Kolom Kiri: Mengetahui, Kepala UPT SMP Negeri 7 Pasuruan */}
              <div className="space-y-1">
                <p className="text-slate-600 dark:text-slate-400 print:text-black">Mengetahui,</p>
                <p className="font-bold text-slate-900 dark:text-slate-100 print:text-black">
                  {effectiveKepalaJabatan}
                </p>

                {/* Signature Box for Kepala Sekolah */}
                <div className="relative group mx-auto w-full max-w-[200px]">
                  <div
                    onClick={() => handleOpenSignCanvas('kepala')}
                    className="h-24 sm:h-28 mx-auto w-full border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:border-blue-400 transition-all bg-slate-50/40 dark:bg-slate-800/20 print:border-none print:bg-transparent relative overflow-visible"
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
                          className="absolute left-1/2 top-1/2 -translate-x-[65%] -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 object-contain pointer-events-none opacity-85 z-20 mix-blend-multiply dark:mix-blend-normal print:mix-blend-multiply drop-shadow-xs select-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-slate-400 print:text-black">
                        <PenLine className="w-5 h-5 text-slate-400 print:hidden" />
                        <span className="text-[11px] font-medium print:text-[10px]">
                          (Klik untuk TTD)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons on hover/touch */}
                  {effectiveKepalaTtd && effectiveKepalaTtd.startsWith('data:image') && (
                    <div className="flex items-center justify-center gap-1.5 mt-1.5 print:hidden">
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
                        <span>Hapus TTD</span>
                      </button>
                    </div>
                  )}
                </div>

                <p className="font-bold text-slate-900 dark:text-slate-100 underline decoration-1 print:text-black mt-2">
                  {effectiveKepalaNama}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 print:text-black">
                  NIP. {effectiveKepalaNip}
                </p>
              </div>

              {/* Kolom Kanan: Pasuruan, [Tanggal], Guru Pendamping / Guru BK */}
              <div className="space-y-1">
                <p className="text-slate-600 dark:text-slate-400 print:text-black">
                  Pasuruan, {currentDateFormatted}
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100 print:text-black">
                  {effectiveGuruJabatan}
                </p>

                {/* Signature Box for Guru BK / Petugas */}
                <div className="relative group mx-auto w-full max-w-[200px]">
                  <div
                    onClick={() => handleOpenSignCanvas('guru')}
                    className="h-24 sm:h-28 mx-auto w-full border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:border-teal-400 transition-all bg-slate-50/40 dark:bg-slate-800/20 print:border-none print:bg-transparent"
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
                        <PenLine className="w-5 h-5 text-slate-400 print:hidden" />
                        <span className="text-[11px] font-medium print:text-[10px]">
                          (Klik untuk TTD)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons on hover/touch */}
                  {effectiveGuruTtd && effectiveGuruTtd.startsWith('data:image') && (
                    <div className="flex items-center justify-center gap-1.5 mt-1.5 print:hidden">
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
                        <span>Hapus TTD</span>
                      </button>
                    </div>
                  )}
                </div>

                <p className="font-bold text-slate-900 dark:text-slate-100 underline decoration-1 print:text-black mt-2">
                  {effectiveGuruNama}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 print:text-black">
                  NIP. {effectiveGuruNip}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Validation Note */}
          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center pt-2 border-t border-slate-100 dark:border-slate-800 print:text-black">
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
    </div>
  );
};
