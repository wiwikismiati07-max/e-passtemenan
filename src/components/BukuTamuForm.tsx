import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Printer,
  FileText,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  Edit2,
  Building,
  User,
  Layers,
} from 'lucide-react';
import { BukuTamu } from '../types';
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

export const BukuTamuForm: React.FC<Props> = ({
  initialTab = 'form',
  userRole = 'admin',
}) => {
  const [dataList, setDataList] = useState<BukuTamu[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'rekap'>(initialTab);
  const [editingItem, setEditingItem] = useState<BukuTamu | null>(null);
  const [viewItem, setViewItem] = useState<BukuTamu | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<BukuTamu | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [hariTanggal, setHariTanggal] = useState(() => getRealtimeFullFormattedDate());
  const [jamKedatangan, setJamKedatangan] = useState(() => getRealtimeTimeString());
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nipNik, setNipNik] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [instansiAsal, setInstansiAsal] = useState('');
  const [tujuanKunjungan, setTujuanKunjungan] = useState('');
  const [linkFoto, setLinkFoto] = useState('');
  const [tandaTangan, setTandaTangan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadData = () => {
    const list = StorageService.getDb().bukuTamu || [];
    setDataList([...list]);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pass-temenan-db-updated', loadData);
    return () => window.removeEventListener('pass-temenan-db-updated', loadData);
  }, []);

  const resetForm = () => {
    setHariTanggal(getRealtimeFullFormattedDate());
    setJamKedatangan(getRealtimeTimeString());
    setNamaLengkap('');
    setNipNik('');
    setJabatan('');
    setInstansiAsal('');
    setTujuanKunjungan('');
    setLinkFoto('');
    setTandaTangan('');
    setTindakLanjut('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleOpenEdit = (item: BukuTamu) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat mengedit buku tamu.');
      return;
    }
    setEditingItem(item);
    setHariTanggal(item.hariTanggal);
    setJamKedatangan(item.jamKedatangan);
    setNamaLengkap(item.namaLengkap);
    setNipNik(item.nipNik || '');
    setJabatan(item.jabatan || '');
    setInstansiAsal(item.instansiAsal);
    setTujuanKunjungan(item.tujuanKunjungan);
    setLinkFoto(item.linkFoto || '');
    setTandaTangan(item.tandaTangan || '');
    setTindakLanjut(item.tindakLanjut || '');
    setKeterangan(item.keterangan || '');
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hariTanggal || !jamKedatangan || !namaLengkap || !instansiAsal || !tujuanKunjungan) {
      alert('Mohon lengkapi data wajib (Hari/Tanggal, Jam, Nama Tamu, Instansi, dan Tujuan Kunjungan)!');
      return;
    }

    const payload = {
      ...(editingItem ? { id: editingItem.id } : {}),
      hariTanggal,
      jamKedatangan,
      namaLengkap,
      nipNik,
      jabatan,
      instansiAsal,
      tujuanKunjungan,
      linkFoto,
      tandaTangan,
      tindakLanjut,
      keterangan,
    };

    StorageService.saveBukuTamu(payload);
    loadData();
    resetForm();
    setSavedSuccess(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleDelete = (item: BukuTamu) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat menghapus data.');
      return;
    }
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deleteBukuTamu(deleteTargetItem.id);
      loadData();
      setDeleteTargetItem(null);
    }
  };

  const handleExportCSV = () => {
    if (dataList.length === 0) return;
    const headers = [
      'Hari/Tanggal',
      'Jam Kedatangan',
      'Nama Lengkap Tamu',
      'NIP/NIK',
      'Jabatan',
      'Instansi Asal',
      'Tujuan Kunjungan',
      'Tindak Lanjut / Diterima Oleh',
      'Keterangan',
    ];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.jamKedatangan}"`,
      `"${d.namaLengkap.replace(/"/g, '""')}"`,
      `"${(d.nipNik || '').replace(/"/g, '""')}"`,
      `"${(d.jabatan || '').replace(/"/g, '""')}"`,
      `"${d.instansiAsal.replace(/"/g, '""')}"`,
      `"${d.tujuanKunjungan.replace(/"/g, '""')}"`,
      `"${(d.tindakLanjut || '').replace(/"/g, '""')}"`,
      `"${(d.keterangan || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buku-tamu-digital-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (dataList.length === 0) return;
    const headers = [
      'No',
      'Hari/Tanggal',
      'Jam Kedatangan',
      'Nama Lengkap Tamu',
      'NIP/NIK',
      'Jabatan',
      'Instansi Asal',
      'Tujuan Kunjungan / Keperluan',
      'Diterima Oleh / Tindak Lanjut',
      'Keterangan',
    ];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.jamKedatangan,
      d.namaLengkap,
      d.nipNik || '-',
      d.jabatan || '-',
      d.instansiAsal,
      d.tujuanKunjungan,
      d.tindakLanjut || '-',
      d.keterangan || '-',
    ]);
    exportToExcel(`rekap-buku-tamu-${Date.now()}`, 'Buku Tamu Digital', headers, rows);
  };

  const handleExportWord = () => {
    if (dataList.length === 0) return;
    const headers = [
      'No',
      'Hari/Tanggal',
      'Jam',
      'Nama Lengkap Tamu',
      'Instansi Asal',
      'Tujuan Kunjungan',
      'Diterima Oleh',
    ];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.jamKedatangan,
      d.namaLengkap,
      d.instansiAsal,
      d.tujuanKunjungan,
      d.tindakLanjut || '-',
    ]);
    exportToWord(
      `rekap-buku-tamu-${Date.now()}`,
      'REKAPITULASI BUKU TAMU DIGITAL & KUNJUNGAN DINAS',
      headers,
      rows,
      'Sistem Administrasi Tamu & Pelayanan Publik UPT SMPN 7 Pasuruan'
    );
  };

  const filteredList = dataList.filter((item) => {
    return (
      item.hariTanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instansiAsal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tujuanKunjungan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-slate-900 border border-teal-500/30 p-5 sm:p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <BookOpenCheck className="w-3.5 h-3.5 text-teal-400" />
              Layanan Tamu & Administrasi Terpadu
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
              BUKU TAMU DIGITAL
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Pencatatan tamu dinas, orang tua siswa, dan instansi luar di UPT SMPN 7 Pasuruan lengkap dengan tanda tangan digital & foto.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportWord}
              className="px-3 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh Rekap Format Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Word</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh Rekap Format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh CSV"
            >
              <Download className="w-4 h-4 text-teal-400" />
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
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BookOpenCheck className="w-4 h-4" />
          <span>{editingItem ? 'Edit Data Tamu' : 'Formulir Input Buku Tamu'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Rekapitulasi Kunjungan ({dataList.length})</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Data Buku Tamu berhasil disimpan ke database!</span>
        </div>
      )}

      {/* TAB 1: FORMULIR INPUT BUKU TAMU */}
      {activeTab === 'form' && (
        <div className="bg-white dark:bg-slate-900 border border-teal-500/30 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                {editingItem ? 'Edit Data Kunjungan Tamu' : 'Formulir Registrasi Kunjungan Tamu'}
              </h2>
              <p className="text-xs text-teal-600 dark:text-teal-400">
                Pencatatan kehadiran tamu dinas & masyarakat di UPT SMPN 7 Pasuruan
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Hari / Tanggal Kunjungan *
                </label>
                <input
                  type="text"
                  value={hariTanggal}
                  onChange={(e) => setHariTanggal(e.target.value)}
                  placeholder="Jumat, 28 Agustus 2026"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Jam Kedatangan *
                  </label>
                  <button
                    type="button"
                    onClick={() => setJamKedatangan(getRealtimeTimeString())}
                    className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 hover:underline bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 flex items-center gap-1 cursor-pointer"
                    title="Isi otomatis dengan waktu saat ini"
                  >
                    <span>⚡ Waktu Sekarang</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={jamKedatangan}
                  onChange={(e) => setJamKedatangan(e.target.value)}
                  placeholder="08.30 WIB"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Nama Lengkap Tamu *
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama lengkap tamu..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  NIP / NIK
                </label>
                <input
                  type="text"
                  value={nipNik}
                  onChange={(e) => setNipNik(e.target.value)}
                  placeholder="Nomor identitas (opsional)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Pengawas / Wali Murid / Narasumber"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Instansi / Asal Lembaga *
              </label>
              <input
                type="text"
                value={instansiAsal}
                onChange={(e) => setInstansiAsal(e.target.value)}
                placeholder="Contoh: Dinas Pendidikan dan Kebudayaan Kota Pasuruan / Umum"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Maksud & Tujuan Kunjungan *
              </label>
              <textarea
                value={tujuanKunjungan}
                onChange={(e) => setTujuanKunjungan(e.target.value)}
                placeholder="Jelaskan maksud dan tujuan kedatangan secara ringkas..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Diterima Oleh / Pihak Sekolah
                </label>
                <input
                  type="text"
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  placeholder="Contoh: Kepala Sekolah / Waka Kesiswaan / Guru BK"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan tambahan hasil pertemuan (opsional)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhotoUploadArea
                label="Foto Tamu / Dokumentasi Kunjungan"
                value={linkFoto}
                onChange={setLinkFoto}
                folder="buku_tamu"
              />

              <div>
                <SignatureCanvas
                  label="Tanda Tangan Digital Tamu"
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
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingItem ? 'Simpan Perubahan' : 'Kirim & Simpan Buku Tamu'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REKAPITULASI BUKU TAMU */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          {/* Search Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama tamu, instansi, tujuan..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Total: {filteredList.length} Tamu</span>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('form');
                }}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tamu Baru</span>
              </button>
            </div>
          </div>

          {/* Kop Surat Resmi */}
          <KopSurat
            judulLaporan="REKAPITULASI BUKU TAMU DIGITAL & KUNJUNGAN DINAS"
            nomorSurat="421.3/SPANJU-BUKU-TAMU/2026"
          />

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-teal-400 dark:hover:border-teal-500/50 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.hariTanggal}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.jamKedatangan}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.namaLengkap}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.jabatan || 'Tamu'} {item.nipNik ? `(NIP: ${item.nipNik})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-semibold mb-2">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.instansiAsal}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Maksud & Tujuan:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {item.tujuanKunjungan}
                    </p>
                  </div>

                  {item.tindakLanjut && (
                    <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 rounded-xl mb-3">
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                        Diterima Oleh:
                      </span>
                      <p className="text-xs text-teal-800 dark:text-teal-300 truncate">
                        {item.tindakLanjut}
                      </p>
                    </div>
                  )}

                  {item.linkFoto && (
                    <div
                      className="rounded-xl overflow-hidden border border-teal-200 dark:border-teal-500/20 bg-slate-950 max-h-36 flex items-center justify-center cursor-pointer mb-3"
                      onClick={() => setViewItem(item)}
                    >
                      <img
                        src={normalizeImageUrl(item.linkFoto)}
                        alt="Foto Dokumentasi Tamu"
                        className="w-full h-28 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setViewItem(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-teal-700 dark:text-teal-300 flex items-center gap-1 font-bold transition-colors border border-teal-200 dark:border-teal-800 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Lihat & Cetak</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Data Tamu"
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
              <BookOpenCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Belum ada catatan buku tamu</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Beralih ke tab "Formulir Input Buku Tamu" untuk mencatat tamu baru.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetItem}
        title="Hapus Catatan Buku Tamu"
        message="Apakah Anda yakin ingin menghapus catatan kunjungan tamu ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.namaLengkap} (${deleteTargetItem.instansiAsal})` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {/* Official Printable Report Modal */}
      {viewItem && (
        <OfficialReportModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          judulLaporan="LEMBAR KUNJUNGAN BUKU TAMU DIGITAL SPANJU"
          nomorSurat={`421.3/TAMU-${viewItem.id.slice(-6).toUpperCase()}/SPANJU/2026`}
          tanggalSurat={viewItem.hariTanggal}
          jabatanPenandatangan="Petugas Piket / Penerima Tamu"
          tandaTangan={viewItem.tandaTangan}
          linkFoto={viewItem.linkFoto}
          onUpdatePhoto={(newPhotoUrl) => {
            if (viewItem) {
              const updated = { ...viewItem, linkFoto: newPhotoUrl };
              StorageService.saveBukuTamu(updated);
              setViewItem(updated);
              setDataList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            }
          }}
          catatanUtama={{
            judul: 'Maksud dan Keperluan Kunjungan',
            isi: viewItem.tujuanKunjungan,
          }}
          fields={[
            { label: 'Hari & Tanggal', value: viewItem.hariTanggal },
            { label: 'Jam Kedatangan', value: viewItem.jamKedatangan },
            { label: 'Nama Lengkap Tamu', value: viewItem.namaLengkap },
            { label: 'NIP / NIK', value: viewItem.nipNik || '-' },
            { label: 'Jabatan Tamu', value: viewItem.jabatan || '-' },
            { label: 'Instansi / Asal Lembaga', value: viewItem.instansiAsal, fullWidth: true },
            { label: 'Diterima Oleh / Tindak Lanjut', value: viewItem.tindakLanjut || 'Pihak Sekolah', fullWidth: true },
            { label: 'Catatan Pertemuan', value: viewItem.keterangan || 'Kunjungan terlaksana dengan baik.', fullWidth: true },
          ]}
        />
      )}
    </div>
  );
};
