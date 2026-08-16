import React, { useState, useEffect } from 'react';
import {
  Music,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Download,
  Eye,
  CheckCircle2,
  Quote,
  Heart,
  Volume2,
  BookOpen,
  Printer,
  PenLine,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../utils/exportUtils';
import { SenandungSerasi } from '../types';
import { StorageService } from '../services/storage';
import { RencanaInovasiModal } from './RencanaInovasiModal';
import { KopSurat } from './KopSurat';
import { SignatureCanvas } from './SignatureCanvas';
import { OfficialReportModal } from './OfficialReportModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import confetti from 'canvas-confetti';
import {
  getRealtimeFullFormattedDate,
  getRealtimeTimeString,
} from '../utils/dateUtils';

export const SenandungSerasiForm: React.FC = () => {
  const [dataList, setDataList] = useState<SenandungSerasi[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SenandungSerasi | null>(null);
  const [viewItem, setViewItem] = useState<SenandungSerasi | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<SenandungSerasi | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isInovasiModalOpen, setIsInovasiModalOpen] = useState(false);

  // Form states
  const [hariTanggal, setHariTanggal] = useState(() => getRealtimeFullFormattedDate());
  const [waktu, setWaktu] = useState(() => getRealtimeTimeString());
  const [pesanDisampaikan, setPesanDisampaikan] = useState('');
  const [tandaTangan, setTandaTangan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const loadData = () => {
    const list = StorageService.getDb().senandungSerasi;
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
    setTandaTangan('');
    setKeterangan('');
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: SenandungSerasi) => {
    setEditingItem(item);
    setHariTanggal(item.hariTanggal);
    setWaktu(item.waktu);
    setPesanDisampaikan(item.pesanDisampaikan);
    setTandaTangan(item.tandaTangan || '');
    setKeterangan(item.keterangan);
    setIsFormOpen(true);
  };

  const handleDelete = (item: SenandungSerasi) => {
    setDeleteTargetItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetItem) {
      StorageService.deleteSenandungSerasi(deleteTargetItem.id);
      setDeleteTargetItem(null);
      loadData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hariTanggal.trim() || !pesanDisampaikan.trim()) {
      alert('Mohon lengkapi Hari/Tanggal dan Pesan Yang Disampaikan.');
      return;
    }

    StorageService.saveSenandungSerasi({
      id: editingItem?.id,
      hariTanggal: hariTanggal.trim(),
      waktu: waktu.trim(),
      pesanDisampaikan: pesanDisampaikan.trim(),
      tandaTangan: tandaTangan.trim(),
      keterangan: keterangan.trim(),
    });

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8b5cf6', '#a855f7', '#d946ef'],
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    setIsFormOpen(false);
    resetForm();
    loadData();
  };

  const handleExportCSV = () => {
    if (dataList.length === 0) return;
    const headers = ['Hari/Tanggal', 'Waktu', 'Pesan Yang Disampaikan', 'Keterangan'];
    const rows = dataList.map((d) => [
      `"${d.hariTanggal}"`,
      `"${d.waktu}"`,
      `"${d.pesanDisampaikan.replace(/"/g, '""')}"`,
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
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Pesan Yang Disampaikan / Materi Siaran', 'Keterangan / Sasaran'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.pesanDisampaikan,
      d.keterangan || '-',
    ]);
    exportToExcel(`rekap-senandung-serasi-${Date.now()}`, 'Senandung Serasi', headers, rows);
  };

  const handleExportWord = () => {
    if (dataList.length === 0) return;
    const headers = ['No', 'Hari/Tanggal', 'Waktu', 'Pesan Yang Disampaikan / Materi Siaran', 'Keterangan / Sasaran'];
    const rows = dataList.map((d, i) => [
      i + 1,
      d.hariTanggal,
      d.waktu,
      d.pesanDisampaikan,
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
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-6 md:p-8 card-3d-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              Salam & Pesan Mendukung Ramah dan Berliterasi
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
              SENANDUNG SERASI
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
              Kompilasi pesan salam penyemangat, kata-kata mutiara penguat karakter, afirmasi ramah anak, dan materi siaran literasi pagi di lingkungan SMPN 7 Pasuruan.
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
              <Download className="w-4 h-4 text-purple-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs btn-3d flex items-center gap-2 shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Senandung Serasi</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Pesan SENANDUNG SERASI berhasil disimpan & diperbarui di database!</span>
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
            placeholder="Cari pesan afirmasi, kata mutiara..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <span className="text-xs text-slate-500">Total: {filteredList.length} Pesan Motivasi</span>
      </div>

      {/* Kop Surat Resmi SMPN 7 Pasuruan */}
      <KopSurat
        judulLaporan="REKAPITULASI PROGRAM SENANDUNG SERASI (LITERASI & AFIRMASI RAMAH ANAK)"
        nomorSurat="421.3/SPANJU-SENANDUNG-SERASI/2026"
      />

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    {item.hariTanggal}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {item.waktu}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>

              {/* Quote Message Box */}
              <div className="mt-4 relative p-4 bg-gradient-to-br from-purple-950/30 to-slate-950 rounded-xl border border-purple-500/20 text-slate-200">
                <Quote className="w-6 h-6 text-purple-500/40 absolute -top-2 -left-1" />
                <p className="text-xs italic leading-relaxed pt-2">
                  {item.pesanDisampaikan}
                </p>
              </div>

              {item.keterangan && (
                <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{item.keterangan}</span>
                </div>
              )}

              {/* Signature Preview if Available */}
              {item.tandaTangan && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400">TTD Penyiar:</span>
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
                className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 flex items-center gap-1 font-medium transition-colors border border-purple-500/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat & Cetak</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Edit Data"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40 transition-colors"
                  title="Hapus Data"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetItem}
        title="Hapus Pesan Senandung Serasi"
        message="Apakah Anda yakin ingin menghapus catatan pesan Senandung Serasi ini?"
        itemDescription={deleteTargetItem ? `${deleteTargetItem.hariTanggal} - ${deleteTargetItem.pesanDisampaikan}` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetItem(null)}
      />

      {filteredList.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800">
          <Music className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">Belum ada pesan Senandung Serasi</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Klik tombol "Tambah Senandung Serasi" di atas untuk membagikan pesan literasi & kebaikan.
          </p>
        </div>
      )}

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
          catatanUtama={{
            judul: 'Naskah Pesan & Afirmasi Karakter Yang Disiarkan',
            isi: `"${viewItem.pesanDisampaikan}"`,
          }}
          fields={[
            { label: 'Hari & Tanggal', value: viewItem.hariTanggal },
            { label: 'Waktu Penyiaran', value: viewItem.waktu },
            { label: 'Media Penyiaran / Tempat', value: viewItem.keterangan || 'Audio Sentral Sekolah & Apel Pagi', fullWidth: true },
          ]}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl shadow-purple-950/80 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white font-display">
                  {editingItem ? 'Edit Senandung Serasi' : 'Form SENANDUNG SERASI'}
                </h2>
                <p className="text-xs text-purple-400">
                  Salam dan Pesan Mendukung Ramah dan Berliterasi - SPANJU
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Hari / Tanggal *
                  </label>
                  <input
                    type="text"
                    value={hariTanggal}
                    onChange={(e) => setHariTanggal(e.target.value)}
                    placeholder="Jumat, 21 Agustus 2026"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Waktu *
                    </label>
                    <button
                      type="button"
                      onClick={() => setWaktu(getRealtimeTimeString())}
                      className="text-[10px] font-extrabold text-pink-400 hover:text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-800 flex items-center gap-1"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Pesan Yang Disampaikan (Kutipan / Nilai Karakter) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsInovasiModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/40 rounded-lg transition-all shadow-sm group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
                    <span>Pilih Tema / Slogan</span>
                  </button>
                </div>
                <textarea
                  value={pesanDisampaikan}
                  onChange={(e) => setPesanDisampaikan(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan kata motivasi, salam ramah, penguatan nilai toleransi, atau pesan literasi pagi..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Keterangan (Media Penyiaran / Pengirim)
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Disiarkan via Audio Sentral Sekolah saat Apel Ramah Anak"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Tanda Tangan Digital Touchscreen / Mouse */}
              <div className="pt-2">
                <SignatureCanvas
                  label="Tanda Tangan Digital Penyiar / Fasilitator (Layar Sentuh HP / Laptop / Mouse)"
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
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-purple-500 text-slate-950 hover:bg-purple-400 btn-3d shadow-lg shadow-purple-500/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {editingItem ? 'Simpan Perubahan' : 'Simpan ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Rencana Inovasi Popup Modal */}
      <RencanaInovasiModal
        isOpen={isInovasiModalOpen}
        onClose={() => setIsInovasiModalOpen(false)}
        onSelect={(formattedText) => setPesanDisampaikan(formattedText)}
        currentValue={pesanDisampaikan}
        targetFieldName="Pesan / Tema Karakter (Senandung Serasi)"
      />
    </div>
  );
};
