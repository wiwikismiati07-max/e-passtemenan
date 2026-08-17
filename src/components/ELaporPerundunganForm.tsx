import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Calendar,
  Clock,
  User,
  School,
  AlertCircle,
  FileCheck2,
  Lock,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Download,
  Eye,
  CheckCircle2,
  HeartHandshake,
  Activity,
  Layers,
  Printer,
  PenLine,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../utils/exportUtils';
import { ELaporPerundungan, StatusLaporan } from '../types';
import { StorageService } from '../services/storage';
import { KopSurat } from './KopSurat';
import { SignatureCanvas } from './SignatureCanvas';
import { OfficialReportModal } from './OfficialReportModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import confetti from 'canvas-confetti';
import {
  getRealtimeFullFormattedDate,
  getRealtimeTimeString,
} from '../utils/dateUtils';

interface Props {
  userRole?: 'admin' | 'siswa';
}

export const ELaporPerundunganForm: React.FC<Props> = ({ userRole = 'admin' }) => {
  const [dataList, setDataList] = useState<ELaporPerundungan[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
  const [tandaTangan, setTandaTangan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const loadData = () => {
    const list = StorageService.getDb().eLaporPerundungan;
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
    setTandaTangan('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
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
    setPenyadaran(item.penyadaran);
    setPencegahan(item.pencegahan);
    setPenangananRespon(item.penangananRespon);
    setPelaporan(item.pelaporan);
    setTindakLanjut(item.tindakLanjut);
    setStatus(item.status);
    setTandaTangan(item.tandaTangan || '');
    setKeterangan(item.keterangan);
    setIsFormOpen(true);
  };

  const handleDelete = (item: ELaporPerundungan) => {
    if (userRole !== 'admin') {
      alert('Akses Ditolak: Hanya akun Admin yang dapat menghapus laporan.');
      return;
    }
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deleteELapor(deleteTargetItem.id);
      setDeleteTargetItem(null);
      loadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hariTanggal.trim() || !namaSiswa.trim() || !kronologi.trim()) {
      alert('Mohon lengkapi Hari/Tanggal, Nama Siswa, dan Kronologi Kejadian.');
      return;
    }

    StorageService.saveELapor({
      id: editingItem?.id,
      hariTanggal: hariTanggal.trim(),
      waktuKejadian: waktuKejadian.trim(),
      namaSiswa: namaSiswa.trim(),
      kelas: kelas.trim(),
      kronologi: kronologi.trim(),
      penyadaran: penyadaran.trim(),
      pencegahan: pencegahan.trim(),
      penangananRespon: penangananRespon.trim(),
      pelaporan: pelaporan.trim(),
      tindakLanjut: tindakLanjut.trim(),
      status,
      tandaTangan: tandaTangan.trim(),
      keterangan: keterangan.trim(),
    });

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ef4444', '#f97316', '#eab308'],
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
      'Waktu Kejadian',
      'Nama Siswa',
      'Kelas',
      'Kronologi Kejadian',
      'Penyadaran',
      'Pencegahan',
      'Penanganan Respon',
      'Pelaporan',
      'Tindak Lanjut',
      'Status',
      'Keterangan',
    ];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.waktuKejadian}"`,
      `"${d.namaSiswa.replace(/"/g, '""')}"`,
      `"${d.kelas.replace(/"/g, '""')}"`,
      `"${d.kronologi.replace(/"/g, '""')}"`,
      `"${d.penyadaran.replace(/"/g, '""')}"`,
      `"${d.pencegahan.replace(/"/g, '""')}"`,
      `"${d.penangananRespon.replace(/"/g, '""')}"`,
      `"${d.pelaporan.replace(/"/g, '""')}"`,
      `"${d.tindakLanjut.replace(/"/g, '""')}"`,
      `"${d.status}"`,
      `"${d.keterangan.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `e-lapor-perundungan-spanju-${Date.now()}.csv`);
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
      'Tindak Lanjut',
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
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Proses Investigasi':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Mediasi':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Selesai':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
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
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 p-6 md:p-8 card-3d-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Layanan Perlindungan Ramah Anak SPANJU
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
              E-LAPOR PERUNDUNGAN & KEKERASAN SPANJU
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
              Sistem pelaporan dan penanganan kasus terintegrasi 4 pilar (Penyadaran, Pencegahan, Penanganan Respon, dan Pelaporan). Siapapun dapat membuat atau mengupdate laporan tanpa harus login.
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
              <Download className="w-4 h-4 text-rose-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs btn-3d flex items-center gap-2 shadow-lg shadow-rose-500/30"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buat Laporan Baru</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Laporan E-LAPOR berhasil disimpan & diupdate ke database!</span>
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
            placeholder="Cari siswa, kronologi kejadian..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Status Penanganan:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Laporan Baru">Laporan Baru</option>
            <option value="Proses Investigasi">Proses Investigasi</option>
            <option value="Mediasi">Mediasi</option>
            <option value="Selesai">Selesai</option>
          </select>
          <span className="text-xs text-slate-500 ml-2">Total: {filteredList.length} Laporan</span>
        </div>
      </div>

      {/* Kop Surat Resmi SMPN 7 Pasuruan */}
      <KopSurat
        judulLaporan="REKAPITULASI LAPORAN LAYANAN PENGADUAN & PENANGANAN PERUNDUNGAN (E-LAPOR)"
        nomorSurat="421.3/SPANJU-E-LAPOR-PERUNDUNGAN/2026"
      />

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.kelas}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5 font-display flex items-center gap-1.5">
                    <User className="w-4 h-4 text-rose-400" />
                    {item.namaSiswa}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{item.hariTanggal}</span>
                    <span>•</span>
                    <span>{item.waktuKejadian}</span>
                  </p>
                </div>
              </div>

              {/* Kronologi */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-rose-400 block mb-1">Kronologi Kejadian / Konflik:</span>
                <p className="text-slate-300 leading-relaxed line-clamp-3">{item.kronologi}</p>
              </div>

              {/* 4 Pilar Mini Summary */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block">Penyadaran:</span>
                  <span className="text-slate-300 truncate block">{item.penyadaran || '-'}</span>
                </div>
                <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block">Pencegahan:</span>
                  <span className="text-slate-300 truncate block">{item.pencegahan || '-'}</span>
                </div>
              </div>

              {/* Tindak Lanjut */}
              {item.tindakLanjut && (
                <div className="p-2.5 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-xs">
                  <span className="font-semibold text-emerald-400 block mb-0.5">Tindak Lanjut:</span>
                  <p className="text-slate-300 line-clamp-2">{item.tindakLanjut}</p>
                </div>
              )}

              {/* Signature Preview if Available */}
              {item.tandaTangan && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">TTD Petugas BK:</span>
                  <div className="h-6 w-16 border border-slate-700 rounded bg-slate-950 flex items-center justify-center p-0.5">
                    <img src={item.tandaTangan} alt="TTD" className="h-full object-contain" />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs">
              <button
                onClick={() => setViewItem(item)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center gap-1 font-medium transition-colors border border-rose-500/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat & Cetak Resmi</span>
              </button>

              <div className="flex items-center gap-2">
                {userRole === 'admin' ? (
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Update Laporan (Khusus Admin)"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert('Akses Siswa: Anda tidak memiliki wewenang untuk mengedit atau menghapus laporan. Silakan hubungi Admin.')}
                    className="p-1.5 text-slate-600 hover:text-white rounded-lg transition-colors cursor-not-allowed opacity-50"
                    title="Akses Siswa: Tidak bisa mengedit atau menghapus laporan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {userRole === 'admin' ? (
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Hapus Laporan (Khusus Admin)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert('Akses Siswa: Anda tidak memiliki wewenang untuk mengedit atau menghapus laporan. Silakan hubungi Admin.')}
                    className="p-1.5 text-slate-600 hover:text-rose-500 rounded-lg transition-colors cursor-not-allowed opacity-50"
                    title="Akses Siswa: Tidak bisa mengedit atau menghapus laporan"
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
        title="Hapus Laporan Perundungan"
        message="Apakah Anda yakin ingin menghapus data laporan perundungan ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.namaSiswa} (${deleteTargetItem.kelas})` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {filteredList.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">Belum ada data laporan perundungan</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Lingkungan sekolah terpantau aman dan kondusif.
          </p>
        </div>
      )}

      {/* Official Printable Report Modal */}
      {viewItem && (
        <OfficialReportModal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          judulLaporan="BERITA ACARA LAPORAN PENANGANAN PERUNDUNGAN & KEKERASAN (E-LAPOR)"
          nomorSurat={`421.3/E-LAPOR-${viewItem.id.slice(-6).toUpperCase()}/SPANJU/2026`}
          tanggalSurat={viewItem.hariTanggal}
          namaPenandatangan="Tim Penanganan Kekerasan SPANJU"
          jabatanPenandatangan="Guru BK / Satgas TPPK SMPN 7 Pasuruan"
          tandaTangan={viewItem.tandaTangan}
          catatanUtama={{
            judul: 'Kronologi Kejadian / Konflik',
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

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl shadow-rose-950/80 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white font-display">
                  {editingItem ? 'Edit / Update E-Lapor Perundungan' : 'Form E-LAPOR PERUNDUNGAN & KEKERASAN'}
                </h2>
                <p className="text-xs text-rose-400">
                  Perlindungan Siswa dan Penanganan Terpadu - SMPN 7 Pasuruan
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Hari / Tanggal *
                  </label>
                  <input
                    type="text"
                    value={hariTanggal}
                    onChange={(e) => setHariTanggal(e.target.value)}
                    placeholder="Rabu, 19 Agustus 2026"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Waktu Kejadian *
                    </label>
                    <button
                      type="button"
                      onClick={() => setWaktuKejadian(getRealtimeTimeString())}
                      className="text-[10px] font-extrabold text-rose-400 hover:text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800 flex items-center gap-1"
                      title="Isi otomatis dengan waktu saat ini"
                    >
                      <span>⚡ Waktu Realtime</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={waktuKejadian}
                    onChange={(e) => setWaktuKejadian(e.target.value)}
                    placeholder="09.21 WIB"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Status Penanganan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusLaporan)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
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
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Nama Siswa (Pelapor / Korban / Terkait) *
                  </label>
                  <input
                    type="text"
                    value={namaSiswa}
                    onChange={(e) => setNamaSiswa(e.target.value)}
                    placeholder="Nama siswa atau inisial"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Contoh: VII-B / VIII-D"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Kronologi Kejadian / Konflik *
                </label>
                <textarea
                  value={kronologi}
                  onChange={(e) => setKronologi(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan alur peristiwa, tempat kejadian, pihak yang terlibat, dan duduk perkara..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* 4 Pilar Mechanism Fields */}
              <div className="space-y-3 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                  Mekanisme Kegiatan Penanganan:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      1. Kegiatan Penyadaran
                    </label>
                    <select
                      value={penyadaran}
                      onChange={(e) => setPenyadaran(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Pilih Kegiatan Penyadaran --</option>
                      <option value="Langkah edukasi empati & konseling">Langkah edukasi empati & konseling</option>
                      <option value="Sosialisasi pencegahan perundungan di kelas">Sosialisasi pencegahan perundungan di kelas</option>
                      <option value="Bimbingan konseling kelompok sebaya">Bimbingan konseling kelompok sebaya</option>
                      <option value="Penguatan karakter profil pelajar Pancasila">Penguatan karakter profil pelajar Pancasila</option>
                      <option value="Edukasi bahaya perundungan verbal & siber">Edukasi bahaya perundungan verbal & siber</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      2. Kegiatan Pencegahan
                    </label>
                    <select
                      value={pencegahan}
                      onChange={(e) => setPencegahan(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Pilih Kegiatan Pencegahan --</option>
                      <option value="Upaya preventif & patroli berkala area sekolah">Upaya preventif & patroli berkala area sekolah</option>
                      <option value="Kampanye anti perundungan di lingkungan sekolah">Kampanye anti perundungan di lingkungan sekolah</option>
                      <option value="Pengawasan ketat di sudut rawan dan kantin">Pengawasan ketat di sudut rawan dan kantin</option>
                      <option value="Pembentukan satgas & duta anti perundungan">Pembentukan satgas & duta anti perundungan</option>
                      <option value="Pemasangan poster edukasi anti kekerasan">Pemasangan poster edukasi anti kekerasan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      3. Kegiatan Penanganan Respon
                    </label>
                    <select
                      value={penangananRespon}
                      onChange={(e) => setPenangananRespon(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Pilih Kegiatan Penanganan Respon --</option>
                      <option value="Tindakan cepat tanggap guru & tim BK">Tindakan cepat tanggap guru & tim BK</option>
                      <option value="Mediasi damai kekeluargaan segera">Mediasi damai kekeluargaan segera</option>
                      <option value="Pendampingan psikologis dan pemulihan korban">Pendampingan psikologis dan pemulihan korban</option>
                      <option value="Penertiban dan pembinaan sanksi edukatif">Penertiban dan pembinaan sanksi edukatif</option>
                      <option value="Koordinasi penanganan darurat dengan pembina">Koordinasi penanganan darurat dengan pembina</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      4. Kegiatan Pelaporan
                    </label>
                    <select
                      value={pelaporan}
                      onChange={(e) => setPelaporan(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Pilih Kegiatan Pelaporan --</option>
                      <option value="Pencatatan rekam kasus & koordinasi wali kelas">Pencatatan rekam kasus & koordinasi wali kelas</option>
                      <option value="Pelaporan resmi kepada Kepala Sekolah & Pengawas">Pelaporan resmi kepada Kepala Sekolah & Pengawas</option>
                      <option value="Koordinasi lintas pihak dengan orang tua/wali murid">Koordinasi lintas pihak dengan orang tua/wali murid</option>
                      <option value="Arsip dokumentasi penanganan kasus terpadu">Arsip dokumentasi penanganan kasus terpadu</option>
                      <option value="Penyusunan berita acara laporan selesai">Penyusunan berita acara laporan selesai</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Tindak Lanjut (Solusi & Hasil Kesepakatan)
                </label>
                <textarea
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Telah dilakukan mediasi kekeluargaan dan pembuatan surat komitmen persahabatan..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
                  placeholder="Catatan tambahan penanganan"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Tanda Tangan Digital Touchscreen / Mouse */}
              <div className="pt-2">
                <SignatureCanvas
                  label="Tanda Tangan Digital Petugas Penanganan / Guru BK (Layar Sentuh HP / Laptop / Mouse)"
                  initialValue={tandaTangan}
                  onSave={(dataUrl) => setTandaTangan(dataUrl)}
                  onClear={() => setTandaTangan('')}
                  height={150}
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
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-rose-500 text-slate-950 hover:bg-rose-400 btn-3d shadow-lg shadow-rose-500/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {editingItem ? 'Simpan Perubahan' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
