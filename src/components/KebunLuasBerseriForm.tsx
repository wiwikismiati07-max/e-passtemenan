import React, { useState, useEffect } from 'react';
import {
  Trees,
  Calendar,
  Clock,
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
  FileCheck,
  AlertTriangle,
  Layers,
  UserCheck,
  RotateCcw,
  Send,
  Printer,
  PenLine,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../utils/exportUtils';
import { KebunLuasBerseri, RTLItem } from '../types';
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

export const KebunLuasBerseriForm: React.FC<Props> = ({ initialTab = 'form', userRole = 'admin' }) => {
  const [dataList, setDataList] = useState<KebunLuasBerseri[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'rekap' | 'statistik'>(initialTab);
  const [editingItem, setEditingItem] = useState<KebunLuasBerseri | null>(null);
  const [viewItem, setViewItem] = useState<KebunLuasBerseri | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<KebunLuasBerseri | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isInovasiModalOpen, setIsInovasiModalOpen] = useState(false);

  // Form states
  const [dateInput, setDateInput] = useState(() => getRealtimeDateISO());
  const [hariTanggalText, setHariTanggalText] = useState('');
  const [waktu, setWaktu] = useState(() => getRealtimeTimeString());
  const [evaluasiBerhasil, setEvaluasiBerhasil] = useState('');
  const [kendalaSolusi, setKendalaSolusi] = useState('');
  const [hasilInovasi, setHasilInovasi] = useState('');
  const [produkKreatif, setProdukKreatif] = useState('');
  const [rtlList, setRtlList] = useState<RTLItem[]>([
    { id: '1', pic: '', target: '', deadline: '' },
  ]);
  const [tandaTangan, setTandaTangan] = useState('');
  const [keterangan, setKeterangan] = useState('');

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
    const list = StorageService.getDb().kebunLuasBerseri;
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
    setEvaluasiBerhasil('');
    setKendalaSolusi('');
    setHasilInovasi('');
    setProdukKreatif('');
    setRtlList([{ id: '1', pic: '', target: '', deadline: '' }]);
    setTandaTangan('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleAddRTL = () => {
    setRtlList((prev) => [
      ...prev,
      { id: Date.now().toString(), pic: '', target: '', deadline: '' },
    ]);
  };

  const handleRemoveRTL = (id: string) => {
    if (rtlList.length <= 1) return;
    setRtlList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateRTL = (id: string, field: keyof RTLItem, val: string) => {
    setRtlList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleOpenEdit = (item: KebunLuasBerseri) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat mengedit laporan.');
      return;
    }
    setEditingItem(item);
    setHariTanggalText(item.hariTanggal);
    setWaktu(item.waktu);
    setEvaluasiBerhasil(item.evaluasiBerhasil);
    setKendalaSolusi(item.kendalaSolusi);
    setHasilInovasi(item.hasilInovasi);
    setProdukKreatif(item.produkKreatif);
    setRtlList(
      item.rtlList && item.rtlList.length > 0
        ? item.rtlList
        : [{ id: '1', pic: '', target: '', deadline: '' }]
    );
    setTandaTangan(item.tandaTangan || '');
    setKeterangan(item.keterangan);
    setActiveTab('form');
  };

  const handleDelete = (item: KebunLuasBerseri) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat menghapus laporan.');
      return;
    }
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deleteKebunLuasBerseri(deleteTargetItem.id);
      setDeleteTargetItem(null);
      loadData();
    }
  };

  const handleExportCSV = () => {
    if (dataList.length === 0) return;
    const headers = ['Hari/Tanggal', 'Waktu', 'Evaluasi Berhasil', 'Kendala & Solusi', 'Hasil Inovasi', 'Produk Kreatif', 'Keterangan'];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.waktu}"`,
      `"${d.evaluasiBerhasil.replace(/"/g, '""')}"`,
      `"${d.kendalaSolusi.replace(/"/g, '""')}"`,
      `"${d.hasilInovasi.replace(/"/g, '""')}"`,
      `"${d.produkKreatif.replace(/"/g, '""')}"`,
      `"${d.keterangan.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kebun-luas-berseri-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Evaluasi Berhasil', 'Kendala & Solusi', 'Hasil Inovasi', 'Produk Kreatif', 'Keterangan'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.evaluasiBerhasil,
      d.kendalaSolusi,
      d.hasilInovasi,
      d.produkKreatif,
      d.keterangan || '-',
    ]);
    exportToExcel(`rekap-kebun-luas-berseri-${Date.now()}`, 'Kebun Luas Berseri', headers, rows);
  };

  const handleExportWord = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Evaluasi Berhasil', 'Kendala & Solusi', 'Hasil Inovasi', 'Produk Kreatif', 'Keterangan'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.evaluasiBerhasil,
      d.kendalaSolusi,
      d.hasilInovasi,
      d.produkKreatif,
      d.keterangan || '-',
    ]);
    exportToWord(
      `rekap-kebun-luas-berseri-${Date.now()}`,
      'REKAPITULASI EVALUASI & INOVASI BULANAN KEBUN LUAS BERSERI',
      headers,
      rows,
      'Kegiatan Bulanan Evaluasi, Solusi Kendala, dan Inovasi Produk - UPT SMPN 7 Pasuruan'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = hariTanggalText || formatDateToIndonesian(dateInput);
    if (!finalDate.trim() || !evaluasiBerhasil.trim()) {
      alert('Mohon lengkapi Tanggal dan Hal yang Sudah Berjalan Baik.');
      return;
    }

    StorageService.saveKebunLuasBerseri({
      id: editingItem?.id,
      hariTanggal: finalDate.trim(),
      waktu: waktu.trim(),
      evaluasiBerhasil: evaluasiBerhasil.trim(),
      kendalaSolusi: kendalaSolusi.trim(),
      hasilInovasi: hasilInovasi.trim(),
      produkKreatif: produkKreatif.trim(),
      rtlList: rtlList.filter((r) => r.pic.trim() || r.target.trim()),
      tandaTangan: tandaTangan.trim(),
      keterangan: keterangan.trim(),
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#059669', '#34d399'],
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    resetForm();
    loadData();
    setActiveTab('rekap');
  };

  const filteredList = dataList.filter((item) => {
    return (
      item.hariTanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evaluasiBerhasil.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hasilInovasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.produkKreatif.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight uppercase">
                KEBUN LUAS BERSERI
              </h2>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Kegiatan Bulanan Evaluasi, Berinovasi & Kreatif
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
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Data KEBUN LUAS BERSERI berhasil disimpan ke database!</span>
          </div>
        )}

        {/* Tab 1: Form View */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {editingItem && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold">Mode Mengedit: {editingItem.hariTanggal}</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Batal Edit
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Hari / Tanggal Rapat Pleno</span>
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Otomatis Terbaca: <strong className="text-emerald-600">{hariTanggalText || formatDateToIndonesian(dateInput)}</strong>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Waktu Kegiatan Bulanan</span>
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
                  placeholder="09.21 WIB"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Evaluasi Berhasil */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Evaluasi Program: Hal yang Berjalan Baik</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={evaluasiBerhasil}
                onChange={(e) => setEvaluasiBerhasil(e.target.value)}
                rows={3}
                placeholder="Pencapaian 1 bulan terakhir, respon positif siswa, penurunan insiden perundungan..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
                required
              />
            </div>

            {/* Kendala & Solusi */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Kendala Lapangan & Solusi Alternatif</span>
              </label>
              <textarea
                value={kendalaSolusi}
                onChange={(e) => setKendalaSolusi(e.target.value)}
                rows={3}
                placeholder="Hambatan operasional, koordinasi antar kelas, dan solusi yang disepakati..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Hasil Inovasi with Popup Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Hasil Inovasi / Kegiatan Baru yang Diluncurkan</span>
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
                value={hasilInovasi}
                onChange={(e) => setHasilInovasi(e.target.value)}
                rows={3}
                placeholder="Program baru yang disahkan: misal Pojok Curhat Sebaya, Kampanye Digital Pekanan..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Upload Foto Dokumentasi Kegiatan / Produk Kreatif */}
            <div>
              <PhotoUploadArea
                label="Upload Foto Kegiatan / Produk Inovasi (Opsional)"
                value={produkKreatif}
                onChange={setProdukKreatif}
                maxSizeMB={15}
              />
            </div>

            {/* Rencana Tindak Lanjut (RTL) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tabel Rencana Tindak Lanjut (RTL)</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddRTL}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div className="space-y-2">
                {rtlList.map((rtl, index) => (
                  <div key={rtl.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={rtl.pic}
                      onChange={(e) => handleUpdateRTL(rtl.id, 'pic', e.target.value)}
                      placeholder="PIC / Penanggung Jawab"
                      className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={rtl.target}
                      onChange={(e) => handleUpdateRTL(rtl.id, 'target', e.target.value)}
                      placeholder="Target Kegiatan / Output"
                      className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={rtl.deadline}
                      onChange={(e) => handleUpdateRTL(rtl.id, 'deadline', e.target.value)}
                      placeholder="Tenggat Waktu"
                      className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRTL(rtl.id)}
                      className="md:col-span-1 p-2 text-slate-400 hover:text-rose-500 flex justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tanda Tangan Digital pada Layar Sentuh / Mouse */}
            <div className="pt-2">
              <SignatureCanvas
                label="Tanda Tangan Digital Koordinator Bulanan / Tim Inovasi (Layar Sentuh HP / Laptop / Mouse)"
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
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Send className="w-4 h-4" />
                <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Data Kebun Luas Berseri'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Rekapitulasi Data */}
        {activeTab === 'rekap' && (
          <div className="mt-6 space-y-6">
            {/* Kop Surat Resmi SMPN 7 Pasuruan */}
            <KopSurat
              judulLaporan="REKAPITULASI EVALUASI & INOVASI BULANAN KEBUN LUAS BERSERI"
              nomorSurat="421.3/SPANJU-KEBUN-BERSERI/2026"
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tanggal, evaluasi, inovasi..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-4 py-2 text-xs"
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
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">
                        Capaian Berhasil:
                      </strong>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-3">
                        {item.evaluasiBerhasil}
                      </p>
                    </div>

                    {item.hasilInovasi && (
                      <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200/60 dark:border-teal-900 text-xs">
                        <strong className="text-teal-700 dark:text-teal-400 block mb-1">
                          Inovasi Baru:
                        </strong>
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                          {item.hasilInovasi}
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

                    <div className="flex items-center gap-2">
                      {userRole === 'admin' ? (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-white cursor-pointer"
                          title="Edit (Khusus Admin)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert('Akses Siswa: Anda tidak memiliki wewenang untuk mengedit atau menghapus laporan. Silakan hubungi Admin.')}
                          className="p-1.5 text-slate-300 dark:text-slate-700 hover:text-emerald-500 rounded-lg transition-colors cursor-not-allowed opacity-50"
                          title="Akses Siswa: Tidak bisa mengedit atau menghapus laporan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
                          onClick={() => alert('Akses Siswa: Anda tidak memiliki wewenang untuk mengedit atau menghapus laporan. Silakan hubungi Admin.')}
                          className="p-2 text-slate-300 dark:text-slate-700 hover:text-rose-500 rounded-xl transition-colors cursor-not-allowed opacity-50"
                          title="Akses Siswa: Tidak bisa mengedit atau menghapus laporan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetItem}
        title="Hapus Agenda Kebun Luas Berseri"
        message="Apakah Anda yakin ingin menghapus agenda evaluasi bulanan ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.evaluasiBerhasil}` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {/* Rencana Inovasi Modal */}
      <RencanaInovasiModal
        isOpen={isInovasiModalOpen}
        onClose={() => setIsInovasiModalOpen(false)}
        onSelect={(formattedText) => setHasilInovasi(formattedText)}
        targetFieldName="Hasil Inovasi / Kegiatan Baru"
      />

      {/* Official Printable Report Modal */}
      {viewItem && (
        <OfficialReportModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          judulLaporan="LAPORAN BULANAN EVALUASI & INOVASI KEBUN LUAS BERSERI"
          nomorSurat={`421.3/KLB-${viewItem.id.slice(-6).toUpperCase()}/SPANJU/2026`}
          tanggalSurat={viewItem.hariTanggal}
          jabatanPenandatangan="Guru Pendamping / Guru BK"
          linkFoto={viewItem.produkKreatif}
          tandaTangan={viewItem.tandaTangan}
          catatanUtama={
            viewItem.hasilInovasi
              ? {
                  judul: 'Hasil Inovasi / Kegiatan Baru Terpilih',
                  isi: viewItem.hasilInovasi,
                }
              : undefined
          }
          fields={[
            { label: 'Hari & Tanggal', value: viewItem.hariTanggal },
            { label: 'Waktu Pelaksanaan', value: viewItem.waktu },
            { label: 'Capaian yang Berjalan Baik', value: viewItem.evaluasiBerhasil, fullWidth: true },
            { label: 'Kendala & Solusi Pemecahan', value: viewItem.kendalaSolusi || 'Tidak ada kendala berarti.', fullWidth: true },
            { label: 'Produk Kreatif / Hasil Karya', value: viewItem.produkKreatif || 'Karya siswa & display sekolah.', fullWidth: true },
            {
              label: 'Rencana Tindak Lanjut (RTL)',
              value:
                viewItem.rtlList && viewItem.rtlList.length > 0
                  ? viewItem.rtlList.map((r, i) => `${i + 1}. [${r.pic || 'Tim'}] ${r.target} (Deadline: ${r.deadline || '-'})`).join('\n')
                  : 'Sesuai agenda bulanan tim.',
              fullWidth: true,
            },
            { label: 'Keterangan Tambahan', value: viewItem.keterangan || 'Tidak ada catatan tambahan.', fullWidth: true },
          ]}
        />
      )}
    </div>
  );
};
