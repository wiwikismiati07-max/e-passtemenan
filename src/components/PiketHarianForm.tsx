import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  School,
  FileSearch,
  Image as ImageIcon,
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  Send,
  RotateCcw,
  BarChart3,
  Printer,
  PenLine,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../utils/exportUtils';
import { PiketHarian } from '../types';
import { StorageService, GURU_BK_OPTIONS } from '../services/storage';
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

export const PiketHarianForm: React.FC<Props> = ({ initialTab = 'form', userRole = 'admin' }) => {
  const [dataList, setDataList] = useState<PiketHarian[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'rekap' | 'statistik'>(initialTab);
  const [editingItem, setEditingItem] = useState<PiketHarian | null>(null);
  const [viewItem, setViewItem] = useState<PiketHarian | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<PiketHarian | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form Fields
  const [dateInput, setDateInput] = useState(() => getRealtimeDateISO());
  const [hariTanggalText, setHariTanggalText] = useState('');
  const [waktu, setWaktu] = useState(() => getRealtimeTimeString());
  const [namaAnggota, setNamaAnggota] = useState('');
  const [kelas, setKelas] = useState('');
  const [hasilTemuan, setHasilTemuan] = useState('');
  const [linkFoto, setLinkFoto] = useState('');
  const [tandaTangan, setTandaTangan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Sync initialTab when navigation changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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
    const list = StorageService.getDb().piketHarian || [];
    setDataList([...list]);
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      await StorageService.syncToSupabase();
      await StorageService.fetchFromSupabase();
      loadData();
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pass-temenan-db-updated', loadData);
    return () => window.removeEventListener('pass-temenan-db-updated', loadData);
  }, []);

  const resetForm = () => {
    setDateInput(getRealtimeDateISO());
    setWaktu(getRealtimeTimeString());
    setNamaAnggota('');
    setKelas('');
    setHasilTemuan('');
    setLinkFoto('');
    setTandaTangan('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleOpenEdit = (item: PiketHarian) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat mengedit laporan.');
      return;
    }
    setEditingItem(item);
    setHariTanggalText(item.hariTanggal);
    setWaktu(item.waktu);
    setNamaAnggota(item.namaAnggota);
    setKelas(item.kelas);
    setHasilTemuan(item.hasilTemuan);
    setLinkFoto(item.linkFoto);
    setTandaTangan(item.tandaTangan || '');
    setKeterangan(item.keterangan);
    setActiveTab('form');
  };

  const handleDelete = (item: PiketHarian) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat menghapus laporan.');
      return;
    }
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deletePiketHarian(deleteTargetItem.id);
      setDeleteTargetItem(null);
      loadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = hariTanggalText || formatDateToIndonesian(dateInput);
    if (!finalDate.trim() || !namaAnggota.trim() || !hasilTemuan.trim()) {
      alert('Mohon lengkapi Tanggal, Nama Anggota/Petugas, dan Hasil Temuan.');
      return;
    }

    StorageService.savePiketHarian({
      id: editingItem?.id,
      hariTanggal: finalDate.trim(),
      waktu: waktu.trim(),
      namaAnggota: namaAnggota.trim(),
      kelas: kelas.trim() || 'Tim Piket SPANJU',
      hasilTemuan: hasilTemuan.trim(),
      linkFoto: linkFoto.trim(),
      tandaTangan: tandaTangan.trim(),
      keterangan: keterangan.trim(),
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#6366f1'],
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    resetForm();
    loadData();
    setActiveTab('rekap');
  };

  const handleExportCSV = () => {
    if (dataList.length === 0) return;
    const headers = ['Hari/Tanggal', 'Waktu', 'Nama Anggota/Petugas', 'Kelas/Pokja', 'Hasil Temuan', 'Link Foto', 'Keterangan'];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.waktu}"`,
      `"${d.namaAnggota.replace(/"/g, '""')}"`,
      `"${d.kelas.replace(/"/g, '""')}"`,
      `"${d.hasilTemuan.replace(/"/g, '""')}"`,
      `"${d.linkFoto}"`,
      `"${d.keterangan.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `piket-harian-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Nama Petugas', 'Kelas/Pokja', 'Hasil Temuan', 'Keterangan', 'Link Foto'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.namaAnggota,
      d.kelas,
      d.hasilTemuan,
      d.keterangan || '-',
      d.linkFoto || '-',
    ]);
    exportToExcel(`rekap-piket-harian-${Date.now()}`, 'Piket Harian', headers, rows);
  };

  const handleExportWord = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Nama Petugas', 'Kelas/Pokja', 'Hasil Temuan', 'Keterangan'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.namaAnggota,
      d.kelas,
      d.hasilTemuan,
      d.keterangan || '-',
    ]);
    exportToWord(
      `rekap-piket-harian-${Date.now()}`,
      'REKAPITULASI LAPORAN PIKET HARIAN SATGAS ANTI PERUNDUNGAN',
      headers,
      rows,
      'UPT SMP Negeri 7 Pasuruan'
    );
  };

  const filteredList = dataList.filter((item) => {
    if (!item) return false;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.hariTanggal || '').toLowerCase().includes(q) ||
      (item.namaAnggota || '').toLowerCase().includes(q) ||
      (item.hasilTemuan || '').toLowerCase().includes(q) ||
      (item.kelas || '').toLowerCase().includes(q) ||
      (item.keterangan || '').toLowerCase().includes(q);

    const matchesKelas =
      filterKelas === 'ALL' ||
      (item.kelas || '').toLowerCase().includes(filterKelas.toLowerCase());

    return matchesSearch && matchesKelas;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main Card Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Header matching screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight uppercase">
                PIKET HARIAN
              </h2>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Administrasi Program Pass Temenan SMPN 7 Pasuruan
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-sm'
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
            <span>Data Piket Harian berhasil disimpan & diperbarui di database!</span>
          </div>
        )}

        {/* Tab 1: Form View */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {editingItem && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
                <span className="font-semibold">Mode Mengedit Catatan: {editingItem.hariTanggal}</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Batal Edit
                </button>
              </div>
            )}

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Hari / Tanggal</span>
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Otomatis Terbaca: <strong className="text-blue-600 dark:text-blue-400">{hariTanggalText || formatDateToIndonesian(dateInput)}</strong>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Waktu Piket / Pengawasan</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWaktu(getRealtimeTimeString())}
                    className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1"
                    title="Isi otomatis dengan waktu saat ini"
                  >
                    <span>⚡ Waktu Realtime</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  placeholder="Contoh: 09.21 WIB atau 06.30 - 14.00 WIB"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Nama & Kelas Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Nama Anggota / Guru / Kader Piket</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaAnggota}
                  onChange={(e) => setNamaAnggota(e.target.value)}
                  placeholder="Contoh: Ahmad Rizki (Kader PASS Temenan), Ibu Siti, M.Pd"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-blue-600" />
                  <span>Kelas / Pokja / Jabatan</span>
                </label>
                <input
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Contoh: Kelas VIII-A / Pokja Kedisiplinan / Tim TPPK"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Hasil Temuan */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-blue-600" />
                <span>Hasil Temuan & Catatan Pemantauan Piket</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={hasilTemuan}
                onChange={(e) => setHasilTemuan(e.target.value)}
                rows={3}
                placeholder="Catatan kedisiplinan gerbang sekolah, sambutan 5S ramah anak, situasi istirahat, deteksi potensi konflik, atau suasana kondusif..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 leading-relaxed"
                required
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
                placeholder="Catatan tindak lanjut langsung..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tanda Tangan Langsung di Layar Sentuh / Mouse */}
            <div className="pt-2">
              <SignatureCanvas
                label="Tanda Tangan Digital Petugas Piket (Layar Sentuh HP / Tablet / Touchscreen Laptop / Mouse)"
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
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Data Piket Harian'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Rekapitulasi Data */}
        {activeTab === 'rekap' && (
          <div className="mt-6 space-y-6">
            {/* Kop Surat Resmi SMPN 7 Pasuruan */}
            <KopSurat
              judulLaporan="REKAPITULASI LAPORAN PIKET HARIAN SATGAS ANTI PERUNDUNGAN"
              nomorSurat="421.3/SPANJU-PKT/2026"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tanggal, nama, kelas, temuan..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="ALL">Semua Kelas</option>
                  <option value="VII">Kelas VII</option>
                  <option value="VIII">Kelas VIII</option>
                  <option value="IX">Kelas IX</option>
                  <option value="Pokja">Pokja / OSIS</option>
                </select>

                <button
                  onClick={handleSyncCloud}
                  disabled={isSyncing}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                    isSyncing
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                  }`}
                  title="Sinkronkan data dengan Cloud Supabase (HP ⇄ Laptop)"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Cloud'}</span>
                </button>

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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {filteredList.length === 0 ? (
              <div className="py-12 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center bg-slate-50/50 dark:bg-slate-800/30">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  {searchQuery ? 'Data Tidak Ditemukan' : 'Belum Ada Data Rekapitulasi Piket Harian'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                  {searchQuery
                    ? `Tidak ada laporan yang sesuai dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                    : 'Belum ada agenda piket harian satgas yang tersimpan di perangkat ini. Anda dapat menginput laporan baru atau menarik data yang diinput dari perangkat lain.'}
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('form');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Isi Form Piket Harian</span>
                  </button>
                  <button
                    onClick={handleSyncCloud}
                    disabled={isSyncing}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <RefreshCw className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyinkronkan...' : 'Tarik & Sinkronkan Data Cloud'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredList.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {item.hariTanggal}
                          </h4>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {item.waktu}
                          </span>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {item.kelas}
                        </span>
                      </div>

                      <div className="text-xs">
                        <span className="text-slate-400 font-semibold block">Petugas Piket:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{item.namaAnggota}</p>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs">
                        <strong className="text-blue-700 dark:text-blue-400 block mb-1">
                          Temuan Piket:
                        </strong>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-3">
                          {item.hasilTemuan}
                        </p>
                      </div>

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
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Lihat & Cetak Resmi</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Statistik */}
        {activeTab === 'statistik' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Total Catatan Piket</span>
                <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-200 mt-1">{dataList.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Dokumentasi Foto</span>
                <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
                  {dataList.filter((d) => d.linkFoto && d.linkFoto.trim().length > 0).length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300">Petugas Terdaftar</span>
                <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-200 mt-1">
                  {new Set(dataList.map((d) => d.namaAnggota)).size}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetItem}
        title="Hapus Data Piket Harian"
        message="Apakah Anda yakin ingin menghapus catatan piket harian ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.namaAnggota} (${deleteTargetItem.kelas})` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {/* Official Printable Report Modal */}
      {viewItem && (
        <OfficialReportModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          judulLaporan="BERITA ACARA & LAPORAN PIKET HARIAN SATGAS ANTI-PERUNDUNGAN"
          nomorSurat={`421.3/PKT-${viewItem.id.slice(-6).toUpperCase()}/SPANJU/2026`}
          tanggalSurat={viewItem.hariTanggal}
          namaPenandatangan={viewItem.namaAnggota}
          jabatanPenandatangan={`Petugas Piket (${viewItem.kelas})`}
          linkFoto={viewItem.linkFoto}
          onUpdatePhoto={(newPhotoUrl) => {
            if (viewItem) {
              const updated = { ...viewItem, linkFoto: newPhotoUrl };
              StorageService.savePiketHarian(updated);
              setViewItem(updated);
              setDataList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            }
          }}
          tandaTangan={viewItem.tandaTangan}
          fields={[
            { label: 'Hari & Tanggal', value: viewItem.hariTanggal },
            { label: 'Waktu Pelaksanaan', value: viewItem.waktu },
            { label: 'Nama Petugas Piket', value: viewItem.namaAnggota },
            { label: 'Kelas / Unit Pokja', value: viewItem.kelas },
            { label: 'Hasil Temuan & Pengamatan', value: viewItem.hasilTemuan, fullWidth: true },
            { label: 'Keterangan / Tindak Lanjut', value: viewItem.keterangan || 'Tidak ada catatan tambahan.', fullWidth: true },
          ]}
        />
      )}
    </div>
  );
};
