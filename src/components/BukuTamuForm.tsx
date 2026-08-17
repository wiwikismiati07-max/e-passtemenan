import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Calendar,
  Clock,
  User,
  Building2,
  FileSignature,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Download,
  Eye,
  CheckCircle2,
  PenTool,
  BadgeInfo,
} from 'lucide-react';
import { BukuTamu } from '../types';
import { StorageService } from '../services/storage';
import { SignatureCanvas } from './SignatureCanvas';
import { KopSurat } from './KopSurat';
import { OfficialReportModal } from './OfficialReportModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Printer, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToExcel, exportToWord } from '../utils/exportUtils';
import confetti from 'canvas-confetti';
import {
  getRealtimeFullFormattedDate,
  getRealtimeTimeString,
} from '../utils/dateUtils';

interface Props {
  userRole?: 'admin' | 'siswa';
}

export const BukuTamuForm: React.FC<Props> = ({ userRole = 'admin' }) => {
  const [dataList, setDataList] = useState<BukuTamu[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
  const [tandaTangan, setTandaTangan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const loadData = () => {
    const list = StorageService.getDb().bukuTamu;
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
    setTandaTangan('');
    setTindakLanjut('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: BukuTamu) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat mengedit laporan.');
      return;
    }
    setEditingItem(item);
    setHariTanggal(item.hariTanggal);
    setJamKedatangan(item.jamKedatangan);
    setNamaLengkap(item.namaLengkap);
    setNipNik(item.nipNik);
    setJabatan(item.jabatan);
    setInstansiAsal(item.instansiAsal);
    setTujuanKunjungan(item.tujuanKunjungan);
    setTandaTangan(item.tandaTangan);
    setTindakLanjut(item.tindakLanjut);
    setKeterangan(item.keterangan);
    setIsFormOpen(true);
  };

  const handleDelete = (item: BukuTamu) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat menghapus laporan.');
      return;
    }
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deleteBukuTamu(deleteTargetItem.id);
      setDeleteTargetItem(null);
      loadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hariTanggal.trim() || !namaLengkap.trim() || !instansiAsal.trim() || !tujuanKunjungan.trim()) {
      alert('Mohon lengkapi Tanggal, Nama Lengkap, Instansi Asal, dan Tujuan Kunjungan.');
      return;
    }

    StorageService.saveBukuTamu({
      id: editingItem?.id,
      hariTanggal: hariTanggal.trim(),
      jamKedatangan: jamKedatangan.trim(),
      namaLengkap: namaLengkap.trim(),
      nipNik: nipNik.trim(),
      jabatan: jabatan.trim(),
      instansiAsal: instansiAsal.trim(),
      tujuanKunjungan: tujuanKunjungan.trim(),
      tandaTangan,
      tindakLanjut: tindakLanjut.trim(),
      keterangan: keterangan.trim(),
    });

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#06b6d4', '#0891b2', '#0284c7'],
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    setIsFormOpen(false);
    resetForm();
    loadData();
  };

  const handleExportCSV = () => {
    if (dataList.length === 0) return;
    const headers = [
      'Hari/Tanggal',
      'Jam Kedatangan',
      'Nama Lengkap',
      'NIP/NIK',
      'Jabatan',
      'Instansi/Lembaga Asal',
      'Tujuan/Maksud Kunjungan',
      'Tindak Lanjut',
      'Keterangan',
    ];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.jamKedatangan}"`,
      `"${d.namaLengkap.replace(/"/g, '""')}"`,
      `"${d.nipNik.replace(/"/g, '""')}"`,
      `"${d.jabatan.replace(/"/g, '""')}"`,
      `"${d.instansiAsal.replace(/"/g, '""')}"`,
      `"${d.tujuanKunjungan.replace(/"/g, '""')}"`,
      `"${d.tindakLanjut.replace(/"/g, '""')}"`,
      `"${d.keterangan.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buku-tamu-spanju-${Date.now()}.csv`);
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
      'Nama Lengkap',
      'NIP/NIK',
      'Jabatan',
      'Instansi/Lembaga Asal',
      'Maksud Kunjungan',
      'Tindak Lanjut',
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
    exportToExcel(`rekap-buku-tamu-${Date.now()}`, 'Buku Tamu', headers, rows);
  };

  const handleExportWord = () => {
    if (dataList.length === 0) return;
    const headers = [
      'No',
      'Hari/Tanggal',
      'Jam Kedatangan',
      'Nama Lengkap',
      'NIP/NIK',
      'Jabatan',
      'Instansi Asal',
      'Maksud Kunjungan',
      'Tindak Lanjut',
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
    ]);
    exportToWord(
      `rekap-buku-tamu-${Date.now()}`,
      'REKAPITULASI BUKU TAMU & KUNJUNGAN KEDINASAN',
      headers,
      rows,
      'Pencatatan Tamu Kedinasan, Orang Tua/Wali, dan Komite - UPT SMPN 7 Pasuruan'
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
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-6 md:p-8 card-3d-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <BookOpenCheck className="w-3.5 h-3.5 text-cyan-400" />
              Buku Tamu Digital SMPN 7 Pasuruan
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
              BUKU TAMU & KUNJUNGAN
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
              Pencatatan kedatangan tamu kedinasan, orang tua/wali, komite, dan mitra sekolah lengkap dengan identitas, maksud kunjungan, tanda tangan digital interaktif, dan follow-up.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportWord}
              className="px-3.5 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700/80 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Unduh Rekap Laporan Format Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Word</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Unduh Rekap Laporan Format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Unduh CSV"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs btn-3d flex items-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Isi Buku Tamu</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Data BUKU TAMU berhasil disimpan & diperbarui di database!</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama tamu, instansi, tujuan..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-500">Total: {filteredList.length} Tamu Terdaftar</span>
      </div>

      {/* Kop Surat Resmi SMPN 7 Pasuruan */}
      <KopSurat
        judulLaporan="REKAPITULASI BUKU TAMU KEDATANGAN KEDINASAN & MASYARAKAT"
        nomorSurat="421.3/SPANJU-BUKU-TAMU/2026"
      />

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-display flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-400" />
                    {item.namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {item.instansiAsal}
                  </p>
                </div>
                {item.tandaTangan && (
                  <div className="w-12 h-10 bg-slate-950 rounded-lg border border-slate-700 p-1 shrink-0 flex items-center justify-center">
                    <img src={item.tandaTangan} alt="TTD" className="max-h-full object-contain filter invert" />
                  </div>
                )}
              </div>

              {/* Time & Position */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Waktu Kunjungan:</span>
                  <span className="text-slate-300 font-medium">{item.hariTanggal}</span>
                  <span className="text-slate-400 block text-[10px]">{item.jamKedatangan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jabatan:</span>
                  <span className="text-slate-300 font-medium">{item.jabatan || '-'}</span>
                </div>
              </div>

              {/* Tujuan */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs space-y-1">
                <span className="font-semibold text-cyan-400 block">Tujuan Kunjungan:</span>
                <p className="text-slate-300 line-clamp-3 leading-relaxed">{item.tujuanKunjungan}</p>
              </div>

              {/* Tindak Lanjut */}
              {item.tindakLanjut && (
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Tindak Lanjut:</span> {item.tindakLanjut}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs">
              <button
                onClick={() => setViewItem(item)}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 flex items-center gap-1 font-medium transition-colors border border-cyan-500/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat & Cetak Resmi</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edit Data"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {userRole === 'admin' ? (
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Hapus Data (Khusus Admin)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert('Akses Siswa: Anda dapat menambah dan mengedit data, namun tidak diizinkan untuk menghapus data.')}
                    className="p-1.5 text-slate-600 hover:text-rose-500 rounded-lg transition-colors cursor-not-allowed opacity-50"
                    title="Akses Siswa: Tidak bisa menghapus data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetItem}
        title="Hapus Catatan Buku Tamu"
        message="Apakah Anda yakin ingin menghapus catatan kunjungan buku tamu ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.namaLengkap} (${deleteTargetItem.instansiAsal})` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {filteredList.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800">
          <BookOpenCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">Belum ada data kunjungan tamu</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Klik tombol "Isi Buku Tamu" di atas untuk mencatat tamu baru.
          </p>
        </div>
      )}

      {/* Official Printable Report Modal */}
      {viewItem && (
        <OfficialReportModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          judulLaporan="LEMBAR KARTU KUNJUNGAN BUKU TAMU DIGITAL RESMI"
          nomorSurat={`421.3/TAMU-${viewItem.id.slice(-6).toUpperCase()}/SPANJU/2026`}
          tanggalSurat={viewItem.hariTanggal}
          namaPenandatangan={viewItem.namaLengkap}
          jabatanPenandatangan={viewItem.jabatan ? `${viewItem.jabatan} - ${viewItem.instansiAsal}` : `Tamu Kunjungan (${viewItem.instansiAsal})`}
          tandaTangan={viewItem.tandaTangan}
          catatanUtama={{
            judul: 'Maksud dan Tujuan Kunjungan',
            isi: viewItem.tujuanKunjungan,
          }}
          fields={[
            { label: 'Hari / Tanggal Kunjungan', value: viewItem.hariTanggal },
            { label: 'Waktu / Jam Kedatangan', value: viewItem.jamKedatangan },
            { label: 'Nama Lengkap Tamu', value: viewItem.namaLengkap },
            { label: 'NIP / NIK Tamu', value: viewItem.nipNik || '-' },
            { label: 'Jabatan Tamu', value: viewItem.jabatan || '-' },
            { label: 'Instansi / Lembaga Asal', value: viewItem.instansiAsal },
            { label: 'Hasil Koordinasi / Tindak Lanjut', value: viewItem.tindakLanjut || 'Telah diterima dengan baik oleh pihak sekolah.', fullWidth: true },
            { label: 'Keterangan Tambahan', value: viewItem.keterangan || 'Kunjungan berjalan tertib dan lancar.', fullWidth: true },
          ]}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950/80 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white font-display">
                  {editingItem ? 'Edit Catatan Buku Tamu' : 'Form BUKU TAMU DIGITAL'}
                </h2>
                <p className="text-xs text-cyan-400">
                  SMP Negeri 7 Pasuruan - Terbuka tanpa harus login
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 pr-1">
              {/* Waktu */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  1. Waktu Kunjungan:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Hari / Tanggal *
                    </label>
                    <input
                      type="text"
                      value={hariTanggal}
                      onChange={(e) => setHariTanggal(e.target.value)}
                      placeholder="Kamis, 20 Agustus 2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-400">
                        Jam Kedatangan *
                      </label>
                      <button
                        type="button"
                        onClick={() => setJamKedatangan(getRealtimeTimeString())}
                        className="text-[10px] font-extrabold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800 flex items-center gap-1"
                        title="Isi otomatis dengan waktu saat ini"
                      >
                        <span>⚡ Waktu Realtime</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={jamKedatangan}
                      onChange={(e) => setJamKedatangan(e.target.value)}
                      placeholder="09.21 WIB"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Identitas */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  2. Identitas Tamu:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      placeholder="Nama lengkap tamu beserta gelar"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      NIP / NIK (Opsional)
                    </label>
                    <input
                      type="text"
                      value={nipNik}
                      onChange={(e) => setNipNik(e.target.value)}
                      placeholder="Nomor NIP atau NIK"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      placeholder="Contoh: Pengawas / Wali Murid / Narasumber"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Instansi / Lembaga Asal *
                    </label>
                    <input
                      type="text"
                      value={instansiAsal}
                      onChange={(e) => setInstansiAsal(e.target.value)}
                      placeholder="Contoh: Dinas Pendidikan / Universitas / Umum"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Tujuan / Maksud Kunjungan *
                </label>
                <textarea
                  value={tujuanKunjungan}
                  onChange={(e) => setTujuanKunjungan(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan maksud dan agenda kunjungan ke sekolah..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Digital Signature */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Tanda Tangan Digital Tamu
                </label>
                <SignatureCanvas
                  initialValue={tandaTangan}
                  onSave={(dataUrl) => setTandaTangan(dataUrl)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Tindak Lanjut (Follow-up)
                </label>
                <input
                  type="text"
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  placeholder="Tindakan atau kesepakatan tindak lanjut sekolah"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan tambahan penerima tamu"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 btn-3d shadow-lg shadow-cyan-500/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Buku Tamu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
