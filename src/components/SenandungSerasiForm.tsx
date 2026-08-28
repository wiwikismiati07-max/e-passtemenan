import React, { useState, useEffect } from 'react';
import {
  Music,
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
  BookOpen,
  Layers,
} from 'lucide-react';
import { SenandungSerasi } from '../types';
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

export const SenandungSerasiForm: React.FC<Props> = ({
  initialTab = 'form',
  userRole = 'admin',
}) => {
  const [dataList, setDataList] = useState<SenandungSerasi[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'rekap'>(initialTab);
  const [editingItem, setEditingItem] = useState<SenandungSerasi | null>(null);
  const [viewItem, setViewItem] = useState<SenandungSerasi | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<SenandungSerasi | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [hariTanggal, setHariTanggal] = useState(() => getRealtimeFullFormattedDate());
  const [waktu, setWaktu] = useState(() => getRealtimeTimeString());
  const [pesanDisampaikan, setPesanDisampaikan] = useState('');
  const [linkFoto, setLinkFoto] = useState('');
  const [tandaTangan, setTandaTangan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Synchronize initialTab if parent changes it
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadData = () => {
    const list = StorageService.getDb().senandungSerasi || [];
    setDataList([...list]);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pass-temenan-db-updated', loadData);
    return () => window.removeEventListener('pass-temenan-db-updated', loadData);
  }, []);

  const resetForm = () => {
    setHariTanggal(getRealtimeFullFormattedDate());
    setWaktu(getRealtimeTimeString());
    setPesanDisampaikan('');
    setLinkFoto('');
    setTandaTangan('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleOpenEdit = (item: SenandungSerasi) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat mengedit laporan.');
      return;
    }
    setEditingItem(item);
    setHariTanggal(item.hariTanggal);
    setWaktu(item.waktu);
    setPesanDisampaikan(item.pesanDisampaikan);
    setLinkFoto(item.linkFoto || '');
    setTandaTangan(item.tandaTangan || '');
    setKeterangan(item.keterangan || '');
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hariTanggal || !waktu || !pesanDisampaikan) {
      alert('Mohon lengkapi Hari/Tanggal, Waktu, dan Pesan yang Disampaikan!');
      return;
    }

    const payload = {
      ...(editingItem ? { id: editingItem.id } : {}),
      hariTanggal,
      waktu,
      pesanDisampaikan,
      linkFoto,
      tandaTangan,
      keterangan,
    };

    StorageService.saveSenandungSerasi(payload);
    loadData();
    resetForm();
    setSavedSuccess(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleDelete = (item: SenandungSerasi) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat menghapus data.');
      return;
    }
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deleteSenandungSerasi(deleteTargetItem.id);
      loadData();
      setDeleteTargetItem(null);
    }
  };

  const handleExportCSV = () => {
    if (dataList.length === 0) return;
    const headers = ['Hari/Tanggal', 'Waktu', 'Pesan Yang Disampaikan', 'Foto Dokumentasi', 'Keterangan'];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.waktu}"`,
      `"${d.pesanDisampaikan.replace(/"/g, '""')}"`,
      `"${d.linkFoto ? (d.linkFoto.startsWith('data:') ? 'Foto Terlampir (Base64)' : d.linkFoto) : '-'}"`,
      `"${d.keterangan.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `senandung-serasi-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Pesan Yang Disampaikan / Materi Siaran', 'Foto Dokumentasi', 'Keterangan / Sasaran'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.pesanDisampaikan,
      d.linkFoto ? (d.linkFoto.startsWith('data:') ? 'Foto Terlampir' : d.linkFoto) : '-',
      d.keterangan || '-',
    ]);
    exportToExcel(`rekap-senandung-serasi-${Date.now()}`, 'Senandung Serasi', headers, rows);
  };

  const handleExportWord = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Pesan Yang Disampaikan / Materi Siaran', 'Foto Dokumentasi', 'Keterangan / Sasaran'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.pesanDisampaikan,
      d.linkFoto ? (d.linkFoto.startsWith('data:') ? 'Foto Terlampir' : d.linkFoto) : '-',
      d.keterangan || '-',
    ]);
    exportToWord(
      `rekap-senandung-serasi-${Date.now()}`,
      'REKAPITULASI SIARAN & AFIRMASI SENANDUNG SERASI',
      headers,
      rows,
      'Pesan Mendukung Ramah Anak dan Siaran Literasi Pagi - UPT SMPN 7 Pasuruan'
    );
  };

  const filteredList = dataList.filter((item) => {
    return (
      item.hariTanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pesanDisampaikan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 border border-purple-500/30 p-5 sm:p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              Salam & Pesan Mendukung Ramah dan Berliterasi
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
              SENANDUNG SERASI
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Kompilasi pesan salam penyemangat, kata-kata mutiara penguat karakter, afirmasi ramah anak, dan materi siaran literasi pagi SPANJU.
            </p>
          </div>

          {/* Quick Export Actions */}
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
              <Download className="w-4 h-4 text-purple-400" />
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
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>{editingItem ? 'Edit Senandung Serasi' : 'Formulir Input Pesan Baru'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Rekapitulasi Data ({dataList.length})</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Pesan SENANDUNG SERASI berhasil disimpan ke database!</span>
        </div>
      )}

      {/* TAB 1: FORMULIR INPUT LANGSUNG */}
      {activeTab === 'form' && (
        <div className="bg-white dark:bg-slate-900 border border-purple-500/30 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                {editingItem ? 'Edit Data Senandung Serasi' : 'Formulir Input Siaran & Afirmasi Karakter'}
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Pesan salam penyemangat dan motivasi ramah anak UPT SMPN 7 Pasuruan
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
                  Hari / Tanggal *
                </label>
                <input
                  type="text"
                  value={hariTanggal}
                  onChange={(e) => setHariTanggal(e.target.value)}
                  placeholder="Jumat, 28 Agustus 2026"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Waktu Penyiaran / Apel *
                  </label>
                  <button
                    type="button"
                    onClick={() => setWaktu(getRealtimeTimeString())}
                    className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1 cursor-pointer"
                    title="Isi otomatis dengan jam sekarang"
                  >
                    <span>⚡ Waktu Sekarang</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  placeholder="06.45 WIB"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Pesan / Kata Mutiara / Materi Siaran Yang Disampaikan *
              </label>
              <textarea
                value={pesanDisampaikan}
                onChange={(e) => setPesanDisampaikan(e.target.value)}
                placeholder="Tuliskan pesan afirmasi positif, hadist/kutipan inspiratif, atau salam ramah anak yang disiarkan..."
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Sasaran / Media Penyiaran
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Seluruh Siswa Kelas 7-9 via Audio Sentral & Apel Pagi"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhotoUploadArea
                label="Foto Dokumentasi Penyiaran / Apel"
                value={linkFoto}
                onChange={setLinkFoto}
                folder="senandung_serasi"
              />

              <div>
                <SignatureCanvas
                  label="Tanda Tangan Digital Penyiar / Petugas"
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
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingItem ? 'Simpan Perubahan' : 'Kirim & Simpan Data'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REKAPITULASI DATA */}
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
                placeholder="Cari pesan afirmasi, kata mutiara..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Total: {filteredList.length} Pesan Motivasi</span>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('form');
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baru</span>
              </button>
            </div>
          </div>

          {/* Kop Surat Resmi */}
          <KopSurat
            judulLaporan="REKAPITULASI PROGRAM SENANDUNG SERASI (LITERASI & AFIRMASI RAMAH ANAK)"
            nomorSurat="421.3/SPANJU-SENANDUNG-SERASI/2026"
          />

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.hariTanggal}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.waktu}
                    </span>
                  </div>

                  <blockquote className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed bg-purple-50/50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    "{item.pesanDisampaikan}"
                  </blockquote>

                  {item.linkFoto && (
                    <div
                      className="mt-3 rounded-xl overflow-hidden border border-purple-200 dark:border-purple-500/20 bg-slate-950 max-h-40 flex items-center justify-center relative group/img cursor-pointer"
                      onClick={() => setViewItem(item)}
                      title="Klik untuk melihat foto dalam laporan lengkap"
                    >
                      <img
                        src={normalizeImageUrl(item.linkFoto)}
                        alt="Foto Dokumentasi Senandung Serasi"
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover/img:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {item.keterangan && (
                    <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">{item.keterangan}</span>
                    </div>
                  )}

                  {item.tandaTangan && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">TTD:</span>
                      <div className="h-6 w-16 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-0.5">
                        <img src={item.tandaTangan} alt="TTD" className="h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setViewItem(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 flex items-center gap-1 font-bold transition-colors border border-purple-200 dark:border-purple-800 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Lihat & Cetak</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Data"
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
              <Music className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Belum ada pesan Senandung Serasi</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Beralih ke tab "Formulir Input Pesan Baru" untuk membagikan pesan literasi & kebaikan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetItem}
        title="Hapus Pesan Senandung Serasi"
        message="Apakah Anda yakin ingin menghapus catatan pesan Senandung Serasi ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.pesanDisampaikan}` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {/* Official Printable Report Modal */}
      {viewItem && (
        <OfficialReportModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          judulLaporan="LAPORAN MATERI SIARAN SENANDUNG SERASI (LITERASI & AFIRMASI KARAKTER)"
          nomorSurat={`421.3/SS-${viewItem.id.slice(-6).toUpperCase()}/SPANJU/2026`}
          tanggalSurat={viewItem.hariTanggal}
          jabatanPenandatangan="Guru Pendamping / Guru BK"
          tandaTangan={viewItem.tandaTangan}
          linkFoto={viewItem.linkFoto}
          onUpdatePhoto={(newPhotoUrl) => {
            if (viewItem) {
              const updated = { ...viewItem, linkFoto: newPhotoUrl };
              StorageService.saveSenandungSerasi(updated);
              setViewItem(updated);
              setDataList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            }
          }}
          catatanUtama={{
            judul: 'Naskah Pesan & Afirmasi Karakter Yang Disiarkan',
            isi: `"${viewItem.pesanDisampaikan}"`,
          }}
          fields={[
            { label: 'Hari & Tanggal', value: viewItem.hariTanggal },
            { label: 'Waktu Penyiaran', value: viewItem.waktu },
            { label: 'Media Penyiaran / Tempat', value: viewItem.keterangan || 'Audio Sentral Sekolah & Apel Pagi', fullWidth: true },
            { label: 'Dokumentasi Foto', value: viewItem.linkFoto ? 'Tersedia & Terlampir di bawah' : 'Tidak Ada Foto', fullWidth: false },
          ]}
        />
      )}
    </div>
  );
};
