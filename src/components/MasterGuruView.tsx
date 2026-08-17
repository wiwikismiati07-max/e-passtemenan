import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  Search,
  FileSpreadsheet,
  CheckSquare,
  Square,
  X,
  Save,
  AlertCircle,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';
import { GuruItem } from '../types';
import { StorageService } from '../services/storage';
import * as XLSX from 'xlsx';

interface MasterGuruViewProps {
  db: {
    masterGuru: GuruItem[];
  };
  onRefresh: () => void;
}

export const MasterGuruView: React.FC<MasterGuruViewProps> = ({ db, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('Semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<GuruItem | null>(null);
  
  // Form State
  const [nip, setNip] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jabatan, setJabatan] = useState('Guru Mata Pelajaran');
  const [mapel, setMapel] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [keterangan, setKeterangan] = useState('Aktif');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const jabatanOptions = ['Semua', 'Kepala Sekolah', 'Guru Pendamping / Guru BK', 'Guru Mata Pelajaran', 'Wakasek', 'Pembina OSIS'];

  // Filtered teachers
  const filteredTeachers = (db.masterGuru || []).filter((g) => {
    const matchesSearch =
      !searchQuery.trim() ||
      g.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.mapel && g.mapel.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesJabatan = selectedJabatan === 'Semua' || g.jabatan === selectedJabatan;

    return matchesSearch && matchesJabatan;
  });

  const handleOpenAddModal = () => {
    setEditingGuru(null);
    setNip('');
    setNamaLengkap('');
    setJabatan('Guru Mata Pelajaran');
    setMapel('');
    setNoHp('');
    setEmail('');
    setKeterangan('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guru: GuruItem) => {
    setEditingGuru(guru);
    setNip(guru.nip);
    setNamaLengkap(guru.namaLengkap);
    setJabatan(guru.jabatan || 'Guru Mata Pelajaran');
    setMapel(guru.mapel || '');
    setNoHp(guru.noHp || '');
    setEmail(guru.email || '');
    setKeterangan(guru.keterangan || 'Aktif');
    setIsModalOpen(true);
  };

  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      alert('Nama lengkap guru wajib diisi.');
      return;
    }

    StorageService.saveGuru({
      id: editingGuru ? editingGuru.id : undefined,
      nip: nip.trim() || ('19' + Math.floor(Math.random() * 9000000000 + 1000000000)),
      namaLengkap: namaLengkap.trim(),
      jabatan,
      mapel: mapel.trim(),
      noHp: noHp.trim(),
      email: email.trim(),
      keterangan: keterangan.trim(),
    });

    setIsModalOpen(false);
    onRefresh();
  };

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    id?: string;
    name?: string;
    count?: number;
  }>({ isOpen: false, type: 'single' });

  const handleOpenDeleteSingle = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      id,
      name,
    });
  };

  const handleOpenDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: 'bulk',
      count: selectedIds.length,
    });
  };

  const confirmDelete = () => {
    if (deleteModal.type === 'single' && deleteModal.id) {
      StorageService.deleteGuru(deleteModal.id);
      setSelectedIds((prev) => prev.filter((i) => i !== deleteModal.id));
    } else if (deleteModal.type === 'bulk') {
      StorageService.deleteMultipleGuru(selectedIds);
      setSelectedIds([]);
    }
    setDeleteModal({ isOpen: false, type: 'single' });
    onRefresh();
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTeachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTeachers.map((g) => g.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Excel Export Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIP: '198311162009042003',
        'Nama Lengkap': 'Contoh Guru, S.Pd',
        Jabatan: 'Guru Mata Pelajaran',
        Mapel: 'Matematika',
        'No. HP': '081234567890',
        Email: 'guru@smpn7pasuruan.sch.id',
        Keterangan: 'Aktif / Wali Kelas 7A',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Guru');
    XLSX.writeFile(wb, 'Template_Master_Guru_SMPN7.xlsx');
  };

  // Export Active Data to Excel
  const handleExportExcel = () => {
    if (filteredTeachers.length === 0) {
      alert('Tidak ada data guru untuk diekspor.');
      return;
    }
    const exportData = filteredTeachers.map((g, idx) => ({
      No: idx + 1,
      NIP: g.nip,
      'Nama Lengkap': g.namaLengkap,
      Jabatan: g.jabatan,
      Mapel: g.mapel || '-',
      'No. HP': g.noHp || '-',
      Email: g.email || '-',
      Keterangan: g.keterangan || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Guru SPANJU');
    XLSX.writeFile(wb, `Data_Master_Guru_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Handle Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (rawData.length === 0) {
          alert('File Excel kosong atau format tidak dikenali.');
          return;
        }

        const mappedRows = rawData.map((row) => ({
          nip: String(row.NIP || row.nip || row.Nip || ''),
          namaLengkap: String(row['Nama Lengkap'] || row.namaLengkap || row.Nama || row.nama || ''),
          jabatan: String(row.Jabatan || row.jabatan || 'Guru Mata Pelajaran'),
          mapel: String(row.Mapel || row.mapel || row['Mata Pelajaran'] || ''),
          noHp: String(row['No. HP'] || row.noHp || row.NoHP || row.telepon || ''),
          email: String(row.Email || row.email || ''),
          keterangan: String(row.Keterangan || row.keterangan || 'Import Excel'),
        }));

        const result = StorageService.importGuruBatch(mappedRows);
        alert(`Berhasil mengimpor data guru!\n- Ditambahkan baru: ${result.added}\n- Diperbarui: ${result.updated}`);
        onRefresh();
      } catch (err: any) {
        alert(`Gagal membaca file Excel: ${err?.message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Actions Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-extrabold text-[11px] uppercase tracking-wider">
              MANAJEMEN GURU & STAF
            </span>
            <span className="text-xs font-bold text-slate-500">Total: {db.masterGuru.length} Pendidik</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-display">
            Master Data Guru & Pegawai SMPN 7 Pasuruan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola data guru, unggah rekap dari file Excel (.xlsx), edit, atau hapus data dengan mudah dan aman.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition-all shadow-2xs"
            title="Unggah data dari file Excel"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition-all shadow-2xs"
            title="Unduh Template Excel Kosong"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Template .XLSX</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-2xs"
            title="Ekspor data saat ini ke Excel"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all shadow-teal-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama guru, NIP, mapel, atau email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold shrink-0">
            <span>Jabatan:</span>
            <select
              value={selectedJabatan}
              onChange={(e) => setSelectedJabatan(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {jabatanOptions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleOpenDeleteBulk}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container (10 rows limit with vertical scroll & sticky header) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTeachers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Tidak ada data guru yang ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau unggah data baru dari file Excel.</p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-800 shadow-sm">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-teal-600">
                      {selectedIds.length === filteredTeachers.length && filteredTeachers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">NIP / Identitas</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Jabatan</th>
                  <th className="p-4">Mata Pelajaran</th>
                  <th className="p-4">Kontak & Email</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                {filteredTeachers.map((g, idx) => {
                  const isSelected = selectedIds.includes(g.id);
                  return (
                    <tr
                      key={g.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-teal-50/60 dark:bg-teal-950/30' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <button onClick={() => handleToggleSelect(g.id)} className="text-slate-400 hover:text-teal-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {g.nip}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">{g.namaLengkap}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 text-[11px]">
                          <Briefcase className="w-3 h-3" />
                          {g.jabatan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {g.mapel || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          {g.noHp && (
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{g.noHp}</span>
                            </div>
                          )}
                          {g.email && (
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
                              <Mail className="w-3 h-3 text-blue-600" />
                              <span className="truncate max-w-[160px]">{g.email}</span>
                            </div>
                          )}
                          {!g.noHp && !g.email && <span className="text-slate-400">-</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-600 dark:text-slate-400">{g.keterangan || '-'}</span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(g)}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
                            title="Edit Data Guru"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteSingle(g.id, g.namaLengkap)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                            title="Hapus Data Guru"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {editingGuru ? 'Edit Data Guru & Pegawai' : 'Tambah Guru & Pegawai Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuru} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">NIP / Nomor Identitas</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 198311162009042003"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan di Sekolah</label>
                  <select
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {jabatanOptions.filter((j) => j !== 'Semua').map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Wiwik Ismiati, S.Pd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mata Pelajaran Diampu</label>
                  <input
                    type="text"
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    placeholder="Contoh: Matematika / Bimbingan Konseling"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: guru@smpn7pasuruan.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Tugas Tambahan</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Wali Kelas 7A / Pembina OSIS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Konfirmasi Hapus Data Guru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {deleteModal.type === 'single'
                ? `Apakah Anda yakin ingin menghapus data guru "${deleteModal.name}"? Tindakan ini tidak dapat dibatalkan.`
                : `Apakah Anda yakin ingin menghapus ${deleteModal.count} data guru yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all w-full"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
