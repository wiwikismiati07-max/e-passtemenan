import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Calendar,
  Clock,
  Lightbulb,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Download,
  Eye,
  CheckCircle2,
  FileText,
  Activity,
  Image as ImageIcon,
  Send,
  RotateCcw,
  BarChart3,
  Printer,
  PenLine,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../utils/exportUtils';
import { SabtuBeliTehCeri } from '../types';
import { StorageService } from '../services/storage';
import { RencanaInovasiModal } from './RencanaInovasiModal';
import { KopSurat } from './KopSurat';
import { SignatureCanvas } from './SignatureCanvas';
import { PhotoUploadArea } from './PhotoUploadArea';
import { OfficialReportModal } from './OfficialReportModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import confetti from 'canvas-confetti';
import {
  getRealtimeDateISO,
  getRealtimeTimeString,
  formatDateToIndonesian,
} from '../utils/dateUtils';

interface Props {
  initialTab?: 'form' | 'rekap' | 'statistik';
  userRole?: 'admin' | 'siswa';
}

export const SabtuBeliTehCeriForm: React.FC<Props> = ({ initialTab = 'form', userRole = 'admin' }) => {
  const [dataList, setDataList] = useState<SabtuBeliTehCeri[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'rekap' | 'statistik'>(initialTab);
  const [editingItem, setEditingItem] = useState<SabtuBeliTehCeri | null>(null);
  const [viewItem, setViewItem] = useState<SabtuBeliTehCeri | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<SabtuBeliTehCeri | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isInovasiModalOpen, setIsInovasiModalOpen] = useState(false);

  // Form states
  const [dateInput, setDateInput] = useState(() => getRealtimeDateISO());
  const [hariTanggalText, setHariTanggalText] = useState('');
  const [waktu, setWaktu] = useState(() => getRealtimeTimeString());
  const [hasilTemuan1Minggu, setHasilTemuan1Minggu] = useState('');
  const [evaluasiKegiatan, setEvaluasiKegiatan] = useState('');
  const [rencanaInovasi, setRencanaInovasi] = useState('');
  const [linkFoto, setLinkFoto] = useState('');
  const [tandaTangan, setTandaTangan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Format date helper
  const formatDateToIndonesian = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    setHariTanggalText(formatDateToIndonesian(dateInput));
  }, [dateInput]);

  const loadData = () => {
    const list = StorageService.getDb().sabtuBeliTehCeri;
    setDataList([...list]);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pass-temenan-db-updated', loadData);
    return () => window.removeEventListener('pass-temenan-db-updated', loadData);
  }, []);

  const resetForm = () => {
    setDateInput(getRealtimeDateISO());
    setWaktu(getRealtimeTimeString());
    setHasilTemuan1Minggu('');
    setEvaluasiKegiatan('');
    setRencanaInovasi('');
    setLinkFoto('');
    setTandaTangan('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleOpenEdit = (item: SabtuBeliTehCeri) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat mengedit laporan.');
      return;
    }
    setEditingItem(item);
    setHariTanggalText(item.hariTanggal);
    setWaktu(item.waktu);
    setHasilTemuan1Minggu(item.hasilTemuan1Minggu);
    setEvaluasiKegiatan(item.evaluasiKegiatan);
    setRencanaInovasi(item.rencanaInovasi);
    setLinkFoto(item.linkFoto);
    setTandaTangan(item.tandaTangan || '');
    setKeterangan(item.keterangan);
    setActiveTab('form');
  };

  const handleDelete = (item: SabtuBeliTehCeri) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat menghapus laporan.');
      return;
    }
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deleteSabtuBeliTehCeri(deleteTargetItem.id);
      setDeleteTargetItem(null);
      loadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = hariTanggalText || formatDateToIndonesian(dateInput);
    if (!finalDate.trim() || !hasilTemuan1Minggu.trim()) {
      alert('Mohon lengkapi Tanggal dan Hasil Temuan 1 Minggu.');
      return;
    }

    StorageService.saveSabtuBeliTehCeri({
      id: editingItem?.id,
      hariTanggal: finalDate.trim(),
      waktu: waktu.trim(),
      hasilTemuan1Minggu: hasilTemuan1Minggu.trim(),
      evaluasiKegiatan: evaluasiKegiatan.trim(),
      rencanaInovasi: rencanaInovasi.trim(),
      linkFoto: linkFoto.trim(),
      tandaTangan: tandaTangan.trim(),
      keterangan: keterangan.trim(),
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#06b6d4', '#6366f1'],
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    resetForm();
    loadData();
    setActiveTab('rekap');
  };

  const handleExportCSV = () => {
    if (dataList.length === 0) return;
    const headers = ['Hari/Tanggal', 'Waktu', 'Hasil Temuan 1 Minggu', 'Evaluasi Kegiatan', 'Rencana Inovasi', 'Link Foto', 'Keterangan'];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.waktu}"`,
      `"${d.hasilTemuan1Minggu.replace(/"/g, '""')}"`,
      `"${d.evaluasiKegiatan.replace(/"/g, '""')}"`,
      `"${d.rencanaInovasi.replace(/"/g, '""')}"`,
      `"${d.linkFoto}"`,
      `"${d.keterangan.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sabtu-beli-teh-ceri-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Hasil Temuan 1 Minggu', 'Evaluasi Kegiatan', 'Rencana Inovasi/Tindak Lanjut', 'Keterangan', 'Link Foto'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.hasilTemuan1Minggu,
      d.evaluasiKegiatan,
      d.rencanaInovasi,
      d.keterangan || '-',
      d.linkFoto || '-',
    ]);
    exportToExcel(`rekap-sabtu-beli-teh-ceri-${Date.now()}`, 'Sabtu Beli Teh Ceri', headers, rows);
  };

  const handleExportWord = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Hasil Temuan 1 Minggu', 'Evaluasi Kegiatan', 'Rencana Inovasi/Tindak Lanjut', 'Keterangan'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.hasilTemuan1Minggu,
      d.evaluasiKegiatan,
      d.rencanaInovasi,
      d.keterangan || '-',
    ]);
    exportToWord(
      `rekap-sabtu-beli-teh-ceri-${Date.now()}`,
      'REKAPITULASI PROGRAM SABTU BELI TEH CERI',
      headers,
      rows,
      'Sabtu Bersama Mengulik Temuan, Evaluasi Kegiatan, dan Rencana Inovasi - UPT SMPN 7 Pasuruan'
    );
  };

  const filteredList = dataList.filter((item) => {
    return (
      item.hariTanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hasilTemuan1Minggu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evaluasiKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rencanaInovasi.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main Form Container Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Card Header matching screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight uppercase">
                SABTU BELI TEH CERI
              </h2>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Sabtu Bersama Mengulik Temuan Harian Cerita dan Ide
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Formulir
            </button>
            <button
              onClick={() => setActiveTab('rekap')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'rekap'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>Rekapitulasi</span>
              {dataList.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {dataList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('statistik')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'statistik'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Statistik
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Data SABTU BELI TEH CERI berhasil disimpan & tersinkronisasi ke database!</span>
          </div>
        )}

        {/* Tab 1: Form View */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {editingItem && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Mode Mengedit Catatan: {editingItem.hariTanggal}</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="font-bold text-amber-600 hover:underline"
                >
                  Batal Edit
                </button>
              </div>
            )}

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Hari / Tanggal</span>
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Otomatis Terbaca: <strong className="text-emerald-600 dark:text-emerald-400">{hariTanggalText || formatDateToIndonesian(dateInput)}</strong>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Waktu Laporan / Evaluasi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWaktu(getRealtimeTimeString())}
                    className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                    title="Isi otomatis dengan waktu saat ini"
                  >
                    <span>⚡ Waktu Realtime</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  placeholder="Contoh: 09.21 WIB"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Hasil Temuan 1 Minggu */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Hasil Temuan 1 Minggu</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={hasilTemuan1Minggu}
                onChange={(e) => setHasilTemuan1Minggu(e.target.value)}
                rows={3}
                placeholder="Tuliskan temuan kejadian selama 1 minggu, interaksi antar siswa, suasana kelas, atau catatan kedisiplinan..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
                required
              />
            </div>

            {/* Evaluasi Kegiatan */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Evaluasi Kegiatan</span>
              </label>
              <textarea
                value={evaluasiKegiatan}
                onChange={(e) => setEvaluasiKegiatan(e.target.value)}
                rows={3}
                placeholder="Analisis penyebab, efektivitas penanganan piket harian, dan tanggapan siswa..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Rencana Inovasi / Kegiatan with Popup Selector Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Rencana Inovasi / Kegiatan Berikutnya</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsInovasiModalOpen(true)}
                  className="px-3 py-1 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pilih Rencana Inovasi</span>
                </button>
              </div>

              <textarea
                value={rencanaInovasi}
                onChange={(e) => setRencanaInovasi(e.target.value)}
                rows={3}
                placeholder="Ide program perbaikan, kampanye tema anti-bullying, lomba kreatif, atau modul karakter yang akan diterapkan..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Upload Foto Kegiatan matching exact design from image */}
            <div>
              <PhotoUploadArea
                label="LINK FOTO KEGIATAN"
                value={linkFoto}
                onChange={setLinkFoto}
                maxSizeMB={15}
              />
            </div>

            {/* Keterangan Tambahan */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Keterangan Tambahan</span>
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Catatan koordinator / fasilitator..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tanda Tangan Digital pada Layar Sentuh / Mouse */}
            <div className="pt-2">
              <SignatureCanvas
                label="Tanda Tangan Digital Fasilitator / Koordinator (Layar Sentuh HP / Laptop / Mouse)"
                initialValue={tandaTangan}
                onSave={(dataUrl) => setTandaTangan(dataUrl)}
                onClear={() => setTandaTangan('')}
                height={160}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Data Sabtu Beli Teh Ceri'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Rekapitulasi Data */}
        {activeTab === 'rekap' && (
          <div className="mt-6 space-y-6">
            {/* Kop Surat Resmi SMPN 7 Pasuruan */}
            <KopSurat
              judulLaporan="REKAPITULASI EVALUASI MINGGUAN SABTU BELI TEH CERI"
              nomorSurat="421.3/SPANJU-SABTU-TC/2026"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tanggal, temuan, inovasi..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={handleExportWord}
                  className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800"
                  title="Unduh Rekap Laporan Format Microsoft Word (.doc)"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Word</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
                  title="Unduh Rekap Laporan Format Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                  title="Unduh CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('form');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baru</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          {item.hariTanggal}
                        </h4>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {item.waktu}
                        </span>
                      </div>

                      {item.linkFoto && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          <img
                            src={item.linkFoto}
                            alt="Foto"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">
                        Temuan 1 Minggu:
                      </strong>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-3">
                        {item.hasilTemuan1Minggu}
                      </p>
                    </div>

                    {item.rencanaInovasi && (
                      <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900 text-xs">
                        <strong className="text-amber-700 dark:text-amber-400 block mb-1">
                          Rencana Inovasi:
                        </strong>
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                          {item.rencanaInovasi}
                        </p>
                      </div>
                    )}

                    {/* Signature Preview if Available */}
                    {item.tandaTangan && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-400">TTD:</span>
                        <div className="h-7 w-20 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 flex items-center justify-center p-0.5">
                          <img src={item.tandaTangan} alt="TTD" className="h-full object-contain" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                    <button
                      onClick={() => setViewItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Lihat & Cetak Resmi</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Data"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {userRole === 'admin' ? (
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Hapus Data (Khusus Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert('Akses Siswa: Anda dapat menambah dan mengedit data, namun tidak diizinkan untuk menghapus data.')}
                          className="p-2 text-slate-300 dark:text-slate-700 hover:text-rose-500 rounded-xl transition-colors cursor-not-allowed opacity-50"
                          title="Akses Siswa: Tidak bisa menghapus data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredList.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                  Belum ada data refleksi Sabtu Beli Teh Ceri.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Statistik */}
        {activeTab === 'statistik' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Total Sesi Sabtu</span>
                <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">{dataList.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Rencana Inovasi Aktif</span>
                <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
                  {dataList.filter((d) => d.rencanaInovasi.trim().length > 0).length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Dokumentasi Foto</span>
                <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-200 mt-1">
                  {dataList.filter((d) => d.linkFoto && d.linkFoto.trim().length > 0).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetItem}
        title="Hapus Evaluasi Sabtu Beli Teh Ceri"
        message="Apakah Anda yakin ingin menghapus data evaluasi mingguan Sabtu Beli Teh Ceri ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.hasilTemuan1Minggu}` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {/* Rencana Inovasi Modal */}
      <RencanaInovasiModal
        isOpen={isInovasiModalOpen}
        onClose={() => setIsInovasiModalOpen(false)}
        onSelect={(formattedText) => {
          setRencanaInovasi(formattedText);
        }}
        targetFieldName="Rencana Inovasi / Kegiatan"
      />

      {/* Official Printable Report Modal */}
      {viewItem && (
        <OfficialReportModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          judulLaporan="LAPORAN EVALUASI & INOVASI PROGRAM SABTU BELI TEH CERI"
          nomorSurat={`421.3/STC-${viewItem.id.slice(-6).toUpperCase()}/SPANJU/2026`}
          tanggalSurat={viewItem.hariTanggal}
          jabatanPenandatangan="Guru Pendamping / Guru BK"
          linkFoto={viewItem.linkFoto}
          onUpdatePhoto={(newPhotoUrl) => {
            if (viewItem) {
              const updated = { ...viewItem, linkFoto: newPhotoUrl };
              StorageService.saveSabtuBeliTehCeri(updated);
              setViewItem(updated);
              setDataList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            }
          }}
          tandaTangan={viewItem.tandaTangan}
          catatanUtama={
            viewItem.rencanaInovasi
              ? {
                  judul: 'Rencana Inovasi / Tindak Lanjut Terpilih',
                  isi: viewItem.rencanaInovasi,
                }
              : undefined
          }
          fields={[
            { label: 'Hari & Tanggal', value: viewItem.hariTanggal },
            { label: 'Waktu Pelaksanaan', value: viewItem.waktu },
            { label: 'Temuan & Evaluasi 1 Minggu', value: viewItem.hasilTemuan1Minggu, fullWidth: true },
            { label: 'Evaluasi Pelaksanaan Kegiatan', value: viewItem.evaluasiKegiatan || 'Pelaksanaan berjalan kondusif.', fullWidth: true },
            { label: 'Keterangan Tambahan', value: viewItem.keterangan || 'Tidak ada catatan tambahan.', fullWidth: true },
          ]}
        />
      )}
    </div>
  );
};
