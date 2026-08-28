import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Calendar,
  Printer,
  FileText,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  Edit2,
  User,
  Layers,
} from 'lucide-react';
import { ELaporPerundungan, StatusLaporan } from '../types';
import { StorageService } from '../services/storage';
import { PhotoUploadArea, normalizeImageUrl } from './PhotoUploadArea';
import { SignatureCanvas } from './SignatureCanvas';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { KopSurat } from './KopSurat';
import { OfficialReportModal } from './OfficialReportModal';
import { exportToExcel, exportToWord } from '../utils/exportUtils';
import confetti from 'canvas-confetti';
import {
  getRealtimeFullFormattedDate,
  getRealtimeTimeString,
} from '../utils/dateUtils';

interface Props {
  initialTab?: 'form' | 'rekap';
  userRole?: 'admin' | 'siswa';
}

export const ELaporPerundunganForm: React.FC<Props> = ({
  initialTab = 'form',
  userRole = 'admin',
}) => {
  const [dataList, setDataList] = useState<ELaporPerundungan[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'rekap'>(initialTab);
  const [editingItem, setEditingItem] = useState<ELaporPerundungan | null>(null);
  const [viewItem, setViewItem] = useState<ELaporPerundungan | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<ELaporPerundungan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [hariTanggal, setHariTanggal] = useState(() => getRealtimeFullFormattedDate());
  const [waktuKejadian, setWaktuKejadian] = useState(() => getRealtimeTimeString());
  const [namaSiswa, setNamaSiswa] = useState('');
  const [kelas, setKelas] = useState('');
  const [kronologi, setKronologi] = useState('');
  const [penyadaran, setPenyadaran] = useState('');
  const [pencegahan, setPencegahan] = useState('');
  const [penangananRespon, setPenangananRespon] = useState('');
  const [pelaporan, setPelaporan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [status, setStatus] = useState<StatusLaporan>('Laporan Baru');
  const [linkFoto, setLinkFoto] = useState('');
  const [tandaTangan, setTandaTangan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadData = () => {
    const list = StorageService.getDb().eLaporPerundungan || [];
    setDataList([...list]);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pass-temenan-db-updated', loadData);
    return () => window.removeEventListener('pass-temenan-db-updated', loadData);
  }, []);

  const resetForm = () => {
    setHariTanggal(getRealtimeFullFormattedDate());
    setWaktuKejadian(getRealtimeTimeString());
    setNamaSiswa('');
    setKelas('');
    setKronologi('');
    setPenyadaran('');
    setPencegahan('');
    setPenangananRespon('');
    setPelaporan('');
    setTindakLanjut('');
    setStatus('Laporan Baru');
    setLinkFoto('');
    setTandaTangan('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleOpenEdit = (item: ELaporPerundungan) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat mengedit laporan.');
      return;
    }
    setEditingItem(item);
    setHariTanggal(item.hariTanggal);
    setWaktuKejadian(item.waktuKejadian);
    setNamaSiswa(item.namaSiswa);
    setKelas(item.kelas);
    setKronologi(item.kronologi);
    setPenyadaran(item.penyadaran || '');
    setPencegahan(item.pencegahan || '');
    setPenangananRespon(item.penangananRespon || '');
    setPelaporan(item.pelaporan || '');
    setTindakLanjut(item.tindakLanjut || '');
    setStatus(item.status);
    setLinkFoto(item.linkFoto || '');
    setTandaTangan(item.tandaTangan || '');
    setKeterangan(item.keterangan || '');
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hariTanggal || !waktuKejadian || !namaSiswa || !kronologi) {
      alert('Mohon lengkapi data wajib (Hari/Tanggal, Waktu Kejadian, Nama Siswa, dan Kronologi)!');
      return;
    }

    const payload = {
      ...(editingItem ? { id: editingItem.id } : {}),
      hariTanggal,
      waktuKejadian,
      namaSiswa,
      kelas,
      kronologi,
      penyadaran,
      pencegahan,
      penangananRespon,
      pelaporan,
      tindakLanjut,
      status,
      linkFoto,
      tandaTangan,
      keterangan,
    };

    StorageService.saveELapor(payload);
    loadData();
    resetForm();
    setSavedSuccess(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleDelete = (item: ELaporPerundungan) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat menghapus data.');
      return;
    }
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deleteELaporPerundungan(deleteTargetItem.id);
      loadData();
      setDeleteTargetItem(null);
    }
  };

  const handleExportCSV = () => {
    if (dataList.length === 0) return;
    const headers = [
      'Hari/Tanggal',
      'Waktu Kejadian',
      'Nama Siswa/Korban',
      'Kelas',
      'Kronologi Kejadian',
      'Penyadaran',
      'Pencegahan',
      'Penanganan Respon',
      'Pelaporan',
      'Tindak Lanjut & Solusi',
      'Status Laporan',
      'Keterangan',
    ];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.waktuKejadian}"`,
      `"${d.namaSiswa.replace(/"/g, '""')}"`,
      `"${d.kelas.replace(/"/g, '""')}"`,
      `"${d.kronologi.replace(/"/g, '""')}"`,
      `"${(d.penyadaran || '').replace(/"/g, '""')}"`,
      `"${(d.pencegahan || '').replace(/"/g, '""')}"`,
      `"${(d.penangananRespon || '').replace(/"/g, '""')}"`,
      `"${(d.pelaporan || '').replace(/"/g, '""')}"`,
      `"${(d.tindakLanjut || '').replace(/"/g, '""')}"`,
      `"${d.status}"`,
      `"${(d.keterangan || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `e-lapor-perundungan-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (dataList.length === 0) return;
    const headers = [
      'No',
      'Hari/Tanggal',
      'Waktu Kejadian',
      'Nama Siswa/Korban',
      'Kelas',
      'Kronologi Kejadian',
      'Penyadaran',
      'Pencegahan',
      'Penanganan Respon',
      'Pelaporan',
      'Tindak Lanjut & Solusi',
      'Status Laporan',
      'Keterangan',
    ];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktuKejadian,
      d.namaSiswa,
      d.kelas,
      d.kronologi,
      d.penyadaran || '-',
      d.pencegahan || '-',
      d.penangananRespon || '-',
      d.pelaporan || '-',
      d.tindakLanjut || '-',
      d.status,
      d.keterangan || '-',
    ]);
    exportToExcel(`rekap-e-lapor-perundungan-${Date.now()}`, 'E-Lapor Perundungan', headers, rows);
  };

  const handleExportWord = () => {
    if (dataList.length === 0) return;
    const headers = [
      'No',
      'Hari/Tanggal',
      'Waktu Kejadian',
      'Nama Siswa/Korban',
      'Kelas',
      'Kronologi Kejadian',
      'Penanganan Respon',
      'Status Laporan',
    ];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktuKejadian,
      d.namaSiswa,
      d.kelas,
      d.kronologi,
      d.penangananRespon || '-',
      d.status,
    ]);
    exportToWord(
      `rekap-e-lapor-perundungan-${Date.now()}`,
      'REKAPITULASI LAPORAN E-LAPOR PERUNDUNGAN & KEKERASAN',
      headers,
      rows,
      'Sistem Penanganan Terintegrasi Layanan Perlindungan Ramah Anak SPANJU - UPT SMPN 7 Pasuruan'
    );
  };

  const getStatusBadge = (st: StatusLaporan) => {
    switch (st) {
      case 'Laporan Baru':
        return 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40';
      case 'Proses Investigasi':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40';
      case 'Mediasi':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/40';
      case 'Selesai':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40';
      default:
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/40';
    }
  };

  const filteredList = dataList.filter((item) => {
    const matchesSearch =
      item.hariTanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kronologi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-900 border border-rose-500/30 p-5 sm:p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Layanan Perlindungan Ramah Anak SPANJU
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
              E-LAPOR PERUNDUNGAN & KEKERASAN
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Sistem pelaporan dan penanganan kasus 4 pilar (Penyadaran, Pencegahan, Penanganan Respon, dan Pelaporan).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportWord}
              className="px-3 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh Rekap Laporan Format Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Word</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh Rekap Laporan Format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh CSV"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector: Form vs Rekap */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => {
            setActiveTab('form');
            if (!editingItem) resetForm();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'form'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{editingItem ? 'Edit Laporan Kasus' : 'Formulir Pengaduan / Input Kasus'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Rekapitulasi Kasus ({dataList.length})</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Laporan E-LAPOR berhasil disimpan ke database!</span>
        </div>
      )}

      {/* TAB 1: FORMULIR INPUT LANGSUNG */}
      {activeTab === 'form' && (
        <div className="bg-white dark:bg-slate-900 border border-rose-500/30 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                {editingItem ? 'Edit / Update E-Lapor Perundungan' : 'Formulir E-LAPOR PERUNDUNGAN & KEKERASAN'}
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                Perlindungan Siswa dan Penanganan Terpadu 4 Pilar - UPT SMPN 7 Pasuruan
              </p>
            </div>
            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Hari / Tanggal *
                </label>
                <input
                  type="text"
                  value={hariTanggal}
                  onChange={(e) => setHariTanggal(e.target.value)}
                  placeholder="Jumat, 28 Agustus 2026"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Waktu Kejadian *
                  </label>
                  <button
                    type="button"
                    onClick={() => setWaktuKejadian(getRealtimeTimeString())}
                    className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1 cursor-pointer"
                    title="Isi otomatis dengan waktu saat ini"
                  >
                    <span>⚡ Waktu Sekarang</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={waktuKejadian}
                  onChange={(e) => setWaktuKejadian(e.target.value)}
                  placeholder="09.21 WIB"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Status Penanganan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusLaporan)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Laporan Baru">Laporan Baru</option>
                  <option value="Proses Investigasi">Proses Investigasi</option>
                  <option value="Mediasi">Mediasi</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Nama Siswa / Korban / Terkait *
                </label>
                <input
                  type="text"
                  value={namaSiswa}
                  onChange={(e) => setNamaSiswa(e.target.value)}
                  placeholder="Nama lengkap atau inisial siswa..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Contoh: 7A, 8B, 9C"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Kronologi Kejadian / Deskripsi Masalah *
              </label>
              <textarea
                value={kronologi}
                onChange={(e) => setKronologi(e.target.value)}
                placeholder="Jelaskan secara rinci kronologi kejadian, tempat, dan pihak yang terlibat..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            {/* 4 Pilar Penanganan */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider block">
                Empat Pilar Penanganan & Solusi Damai
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    1. Kegiatan Penyadaran (Empati / Konseling)
                  </label>
                  <input
                    type="text"
                    value={penyadaran}
                    onChange={(e) => setPenyadaran(e.target.value)}
                    placeholder="Bimbingan empati personal oleh BK..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    2. Kegiatan Pencegahan (Patroli / Edukasi)
                  </label>
                  <input
                    type="text"
                    value={pencegahan}
                    onChange={(e) => setPencegahan(e.target.value)}
                    placeholder="Patroli satgas & edukasi teman sebaya..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    3. Penanganan Respon (Tindakan Cepat & Mediasi)
                  </label>
                  <input
                    type="text"
                    value={penangananRespon}
                    onChange={(e) => setPenangananRespon(e.target.value)}
                    placeholder="Mediasi bersama wali kelas & pemulihan..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    4. Kegiatan Pelaporan (Administrasi Satgas)
                  </label>
                  <input
                    type="text"
                    value={pelaporan}
                    onChange={(e) => setPelaporan(e.target.value)}
                    placeholder="Dokumentasi & laporan ke pimpinan..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hasil Tindak Lanjut & Kesepakatan Damai
                </label>
                <input
                  type="text"
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  placeholder="Hasil kesepakatan damai, komitmen saling menghargai..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhotoUploadArea
                label="Foto Dokumentasi Kasus / Mediasi"
                value={linkFoto}
                onChange={setLinkFoto}
                folder="e_lapor"
              />

              <div>
                <SignatureCanvas
                  label="Tanda Tangan Digital Guru / Pelapor"
                  initialValue={tandaTangan}
                  onSave={setTandaTangan}
                  onClear={() => setTandaTangan('')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Isian
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingItem ? 'Simpan Perubahan Laporan' : 'Kirim & Simpan Laporan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REKAPITULASI KASUS */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa, kelas, kronologi..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="Laporan Baru">Laporan Baru</option>
                <option value="Proses Investigasi">Proses Investigasi</option>
                <option value="Mediasi">Mediasi</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Total: {filteredList.length} Kasus</span>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('form');
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Laporan Baru</span>
              </button>
            </div>
          </div>

          {/* Kop Surat Resmi */}
          <KopSurat
            judulLaporan="REKAPITULASI PENANGANAN KASUS & E-LAPOR PERUNDUNGAN"
            nomorSurat="421.3/SPANJU-E-LAPOR/2026"
          />

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-rose-400 dark:hover:border-rose-500/50 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.hariTanggal}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.namaSiswa}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Kelas: {item.kelas || '-'} • Waktu: {item.waktuKejadian}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Kronologi Singkat:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {item.kronologi}
                    </p>
                  </div>

                  {item.tindakLanjut && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl mb-3">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        Hasil Tindak Lanjut:
                      </span>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 truncate">
                        {item.tindakLanjut}
                      </p>
                    </div>
                  )}

                  {item.linkFoto && (
                    <div
                      className="rounded-xl overflow-hidden border border-rose-200 dark:border-rose-500/20 bg-slate-950 max-h-36 flex items-center justify-center cursor-pointer mb-3"
                      onClick={() => setViewItem(item)}
                    >
                      <img
                        src={normalizeImageUrl(item.linkFoto)}
                        alt="Foto Dokumentasi E-Lapor"
                        className="w-full h-28 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setViewItem(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 flex items-center gap-1 font-bold transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Lihat & Cetak</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Laporan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {userRole === 'admin' ? (
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Data (Khusus Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert('Akses Siswa: Anda tidak diizinkan untuk menghapus data.')}
                        className="p-1.5 text-slate-400 rounded-lg opacity-40 cursor-not-allowed"
                        title="Hanya Admin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredList.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Tidak ada data laporan perundungan</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Beralih ke tab "Formulir Pengaduan" jika ingin mencatat laporan baru.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetItem}
        title="Hapus Laporan E-Lapor"
        message="Apakah Anda yakin ingin menghapus data laporan perundungan ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.namaSiswa}` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {/* Official Printable Report Modal */}
      {viewItem && (
        <OfficialReportModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          judulLaporan="BERITA ACARA & LAPORAN PENANGANAN E-LAPOR PERUNDUNGAN"
          nomorSurat={`421.3/ELAPOR-${viewItem.id.slice(-6).toUpperCase()}/SPANJU/2026`}
          tanggalSurat={viewItem.hariTanggal}
          jabatanPenandatangan="Satgas Anti Perundungan / Guru BK"
          tandaTangan={viewItem.tandaTangan}
          linkFoto={viewItem.linkFoto}
          onUpdatePhoto={(newPhotoUrl) => {
            if (viewItem) {
              const updated = { ...viewItem, linkFoto: newPhotoUrl };
              StorageService.saveELapor(updated);
              setViewItem(updated);
              setDataList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            }
          }}
          catatanUtama={{
            judul: 'Kronologi Kejadian & Pokok Masalah',
            isi: viewItem.kronologi,
          }}
          fields={[
            { label: 'Hari & Tanggal', value: viewItem.hariTanggal },
            { label: 'Waktu Kejadian', value: viewItem.waktuKejadian },
            { label: 'Nama Siswa Terkait', value: viewItem.namaSiswa },
            { label: 'Kelas', value: viewItem.kelas || '-' },
            { label: 'Status Penanganan', value: viewItem.status },
            { label: '1. Kegiatan Penyadaran (Empati/Konseling)', value: viewItem.penyadaran || 'Telah diberikan konseling empati.', fullWidth: true },
            { label: '2. Kegiatan Pencegahan (Patroli/Edukasi)', value: viewItem.pencegahan || 'Monitoring berkala oleh satgas.', fullWidth: true },
            { label: '3. Kegiatan Penanganan Respon (Tindakan Cepat)', value: viewItem.penangananRespon || 'Mediasi langsung dan pemulihan psikologis.', fullWidth: true },
            { label: '4. Kegiatan Pelaporan (Dokumentasi Resmi)', value: viewItem.pelaporan || 'Tercatat dalam rekam penanganan sekolah.', fullWidth: true },
            { label: 'Hasil Tindak Lanjut & Solusi Damai', value: viewItem.tindakLanjut || 'Siswa sepakat damai dan saling menghormati.', fullWidth: true },
            { label: 'Catatan Tambahan', value: viewItem.keterangan || 'Kondisi telah kondusif.', fullWidth: true },
          ]}
        />
      )}
    </div>
  );
};
