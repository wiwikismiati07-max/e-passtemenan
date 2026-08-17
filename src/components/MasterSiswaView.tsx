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
} from 'lucide-react';
import { SiswaItem } from '../types';
import { StorageService } from '../services/storage';
import * as XLSX from 'xlsx';

interface MasterSiswaViewProps {
  db: {
    masterSiswa: SiswaItem[];
  };
  onRefresh: () => void;
}

export const MasterSiswaView: React.FC<MasterSiswaViewProps> = ({ db, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [selectedGender, setSelectedGender] = useState('Semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<SiswaItem | null>(null);
  
  // Form State
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [kelas, setKelas] = useState('7A');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');
  const [keterangan, setKeterangan] = useState('Aktif');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const kelasOptions = ['Semua', '7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];

  // Filtered students
  const filteredStudents = (db.masterSiswa || []).filter((s) => {
    const matchesSearch =
      !searchQuery.trim() ||
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis && s.nis.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.alamat && s.alamat.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = selectedClass === 'Semua' || s.kelas === selectedClass;
    const matchesGender = selectedGender === 'Semua' || s.jenisKelamin === selectedGender;

    return matchesSearch && matchesClass && matchesGender;
  });

  const handleOpenAddModal = () => {
    setEditingSiswa(null);
    setNisn('');
    setNis('');
    setNamaLengkap('');
    setKelas('7A');
    setJenisKelamin('L');
    setAlamat('');
    setNoHp('');
    setKeterangan('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (siswa: SiswaItem) => {
    setEditingSiswa(siswa);
    setNisn(siswa.nisn);
    setNis(siswa.nis || '');
    setNamaLengkap(siswa.namaLengkap);
    setKelas(siswa.kelas || '7A');
    setJenisKelamin(siswa.jenisKelamin || 'L');
    setAlamat(siswa.alamat || '');
    setNoHp(siswa.noHp || '');
    setKeterangan(siswa.keterangan || 'Aktif');
    setIsModalOpen(true);
  };

  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      alert('Nama lengkap siswa wajib diisi.');
      return;
    }

    StorageService.saveSiswa({
      id: editingSiswa ? editingSiswa.id : undefined,
      nisn: nisn.trim() || ('00' + Math.floor(Math.random() * 90000000 + 10000000)),
      nis: nis.trim() || String(Math.floor(Math.random() * 9000 + 1000)),
      namaLengkap: namaLengkap.trim(),
      kelas,
      jenisKelamin,
      alamat: alamat.trim(),
      noHp: noHp.trim(),
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
      StorageService.deleteSiswa(deleteModal.id);
      setSelectedIds((prev) => prev.filter((i) => i !== deleteModal.id));
    } else if (deleteModal.type === 'bulk') {
      StorageService.deleteMultipleSiswa(selectedIds);
      setSelectedIds([]);
    }
    setDeleteModal({ isOpen: false, type: 'single' });
    onRefresh();
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Excel Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!jsonRows || jsonRows.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.');
          return;
        }

        const formattedRows = jsonRows.map((row) => {
          const getVal = (keys: string[]) => {
            for (const k of keys) {
              const foundKey = Object.keys(row).find((rk) => rk.toLowerCase().includes(k.toLowerCase()));
              if (foundKey !== undefined) return row[foundKey];
            }
            return '';
          };

          return {
            nisn: String(getVal(['nisn']) || ''),
            nis: String(getVal(['nis', 'induk']) || ''),
            namaLengkap: String(getVal(['nama', 'namalengkap', 'nama siswa']) || ''),
            kelas: String(getVal(['kelas']) || '7A'),
            jenisKelamin: String(getVal(['jk', 'jenis kelamin', 'kelamin', 'gender']) || 'L'),
            alamat: String(getVal(['alamat', 'add']) || ''),
            noHp: String(getVal(['hp', 'telepon', 'telp', 'whatsapp', 'wa']) || ''),
            keterangan: String(getVal(['ket', 'keterangan', 'status']) || 'Import Excel'),
          };
        });

        const result = StorageService.importSiswaBatch(formattedRows);
        onRefresh();
        alert(`Berhasil mengimpor data siswa dari Excel!\n- Ditambahkan: ${result.added} siswa\n- Diperbarui: ${result.updated} siswa`);
      } catch (err: any) {
        alert(`Gagal memproses file Excel: ${err?.message}`);
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : db.masterSiswa;
    const exportData = dataToExport.map((s, idx) => ({
      No: idx + 1,
      NISN: s.nisn,
      NIS: s.nis || '',
      'Nama Lengkap': s.namaLengkap,
      Kelas: s.kelas,
      'Jenis Kelamin (L/P)': s.jenisKelamin,
      Alamat: s.alamat || '',
      'No HP': s.noHp || '',
      Keterangan: s.keterangan || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Siswa SMPN 7');
    XLSX.writeFile(workbook, `Data_Siswa_SMPN7_${selectedClass}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NISN: '0081234561',
        NIS: '1001',
        'Nama Lengkap': 'Ahmad Fauzi Ramadhan',
        Kelas: '7A',
        'Jenis Kelamin (L/P)': 'L',
        Alamat: 'Jl. Panglima Sudirman No. 45, Pasuruan',
        'No HP': '081234567890',
        Keterangan: 'Aktif',
      },
      {
        NISN: '0081234562',
        NIS: '1002',
        'Nama Lengkap': 'Siti Nur Aisyah',
        Kelas: '7A',
        'Jenis Kelamin (L/P)': 'P',
        Alamat: 'Jl. Dr. Wahidin No. 12, Pasuruan',
        'No HP': '081234567891',
        Keterangan: 'Aktif',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
    XLSX.writeFile(workbook, 'Template_Master_Siswa_SMPN7.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold tracking-wide uppercase mb-3">
              <GraduationCap className="w-4 h-4 text-indigo-300" />
              DATABASE AKADEMIK
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Form Master Data Siswa</h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Kelola data seluruh siswa UPT SMP Negeri 7 Pasuruan. Unggah data massal dari file Excel (.xlsx), edit, atau hapus data dengan mudah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20"
              title="Unduh Template Excel Kosong"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Template Excel</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
              title="Upload Data dari Excel"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Excel</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20"
              title="Export data ke Excel"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-extrabold flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, NIS, atau alamat siswa..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {kelasOptions.map((k) => (
                <option key={k} value={k}>{k === 'Semua' ? 'Semua Kelas' : `Kelas ${k}`}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">JK:</span>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semua">Semua JK</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Total: <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredStudents.length}</span> siswa
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleOpenDeleteBulk}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Tidak ada data siswa ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau unggah data baru dari file Excel.</p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-800 shadow-sm">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-indigo-600">
                      {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">No</th>
                  <th className="p-4">NISN / NIS</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">JK</th>
                  <th className="p-4">Alamat</th>
                  <th className="p-4">No. HP</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredStudents.map((s, idx) => {
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <button onClick={() => toggleSelectOne(s.id)} className="text-slate-400 hover:text-indigo-600">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">{idx + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{s.nisn}</div>
                        {s.nis && <div className="text-[11px] text-slate-400">NIS: {s.nis}</div>}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{s.namaLengkap}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
                          {s.kelas}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            s.jenisKelamin === 'L'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300'
                          }`}
                        >
                          {s.jenisKelamin}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={s.alamat}>
                        {s.alamat || '-'}
                      </td>
                      <td className="p-4 text-xs text-slate-600 dark:text-slate-400">{s.noHp || '-'}</td>
                      <td className="p-4">
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {s.keterangan || 'Aktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteSingle(s.id, s.namaLengkap)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                            title="Hapus Data Siswa"
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  {editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSiswa} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor NISN *
                  </label>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Contoh: 0081234561"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 1001"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama lengkap sesuai rapor"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas *
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {kelasOptions.filter((k) => k !== 'Semua').map((k) => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Rumah
                </label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Alamat domisili siswa"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Keterangan / Status
                  </label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Aktif, Pengurus, dll"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingSiswa ? 'Simpan Perubahan' : 'Tambah Siswa'}</span>
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
              Konfirmasi Hapus Data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {deleteModal.type === 'single'
                ? `Apakah Anda yakin ingin menghapus data siswa "${deleteModal.name}"? Tindakan ini tidak dapat dibatalkan.`
                : `Apakah Anda yakin ingin menghapus ${deleteModal.count} data siswa yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
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
