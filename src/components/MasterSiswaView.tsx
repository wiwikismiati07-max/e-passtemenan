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
  RefreshCw,
  Database,
  Check,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { SiswaItem } from '../types';
import { StorageService } from '../services/storage';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

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
  const [isFetchingSupabase, setIsFetchingSupabase] = useState(false);
  const [supabaseNotice, setSupabaseNotice] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [isSavingSelected, setIsSavingSelected] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<SiswaItem | null>(null);

  // Excel Import Staging Modal
  const [importModal, setImportModal] = useState<{
    isOpen: boolean;
    fileName: string;
    rows: any[];
    mode: 'overwrite' | 'merge';
  }>({
    isOpen: false,
    fileName: '',
    rows: [],
    mode: 'overwrite',
  });
  
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
    setSelectedIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((i) => i !== id) : [...prev, id];
      return updated;
    });
  };

  // Simpan Terpilih Handler
  const handleSaveSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsSavingSelected(true);
    
    // Save to local storage ensuring timestamp and state integrity
    StorageService.saveDb();
    
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#059669', '#34d399', '#6366f1'],
    });

    setSaveNotice(`✓ Berhasil Menyimpan! Status ${selectedIds.length} data siswa terpilih telah tersimpan di sistem.`);
    setIsSavingSelected(false);
    onRefresh();
    setTimeout(() => setSaveNotice(''), 4500);
  };

  // Pull from Supabase
  const handleFetchFromSupabase = async () => {
    setIsFetchingSupabase(true);
    setSupabaseNotice('');
    const res = await StorageService.fetchFromSupabase();
    setIsFetchingSupabase(false);
    if (res.success) {
      setSupabaseNotice(res.message);
      onRefresh();
      setTimeout(() => setSupabaseNotice(''), 5000);
    } else {
      alert(res.message);
    }
  };

  // Excel Upload Handler: Read file & open confirmation modal
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
        }).filter((r) => r.namaLengkap.trim() !== '');

        if (formattedRows.length === 0) {
          alert('Tidak ada baris data siswa yang valid di file Excel.');
          return;
        }

        // Open staging modal
        setImportModal({
          isOpen: true,
          fileName: file.name,
          rows: formattedRows,
          mode: 'overwrite', // default tindih data lama
        });
      } catch (err: any) {
        alert(`Gagal memproses file Excel: ${err?.message}`);
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = () => {
    if (importModal.rows.length === 0) return;
    const result = StorageService.importSiswaBatch(importModal.rows, importModal.mode);
    setImportModal({ isOpen: false, fileName: '', rows: [], mode: 'overwrite' });
    onRefresh();
    alert(
      `Sukses Impor Excel Data Siswa!\n` +
      `- Mode: ${importModal.mode === 'overwrite' ? 'Tindih / Ganti Semua Data Lama' : 'Gabungkan / Update Data'}\n` +
      `- Data berhasil diimpor: ${result.added} siswa baru\n` +
      `- Total siswa sekarang: ${result.total} siswa terdaftar`
    );
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
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold tracking-wide uppercase">
                <GraduationCap className="w-4 h-4 text-indigo-300" />
                DATABASE AKADEMIK
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                {db.masterSiswa?.length || 0} Siswa Terdaftar
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Form Master Data Siswa</h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Kelola data seluruh siswa UPT SMP Negeri 7 Pasuruan. Unggah data massal dari file Excel (.xlsx) dengan opsi tindih data lama, edit, atau sinkronkan dengan database cloud Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleFetchFromSupabase}
              disabled={isFetchingSupabase}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 transition-all border border-indigo-400/40 shadow-sm"
              title="Muat atau tarik data siswa terbaru dari Supabase"
            >
              <RefreshCw className={`w-4 h-4 text-amber-300 ${isFetchingSupabase ? 'animate-spin' : ''}`} />
              <span>{isFetchingSupabase ? 'Memuat Supabase...' : 'Tarik dari Supabase'}</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20"
              title="Unduh Template Excel Kosong"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Template</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
              title="Upload Data dari Excel (Tindih/Gabung)"
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
              <span>Export</span>
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

        {supabaseNotice && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{supabaseNotice}</span>
          </div>
        )}
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

          {/* Filter Kelas */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">Kelas:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {kelasOptions.map((k) => (
                <option key={k} value={k}>
                  {k === 'Semua' ? 'Semua Kelas' : `Kelas ${k}`}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Gender */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">Gender:</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semua">Semua (L & P)</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={handleSaveSelected}
                disabled={isSavingSelected}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                title="Simpan data siswa yang telah dipilih"
              >
                <Save className="w-4 h-4" />
                <span>Simpan ({selectedIds.length}) Terpilih</span>
              </button>

              <button
                onClick={handleOpenDeleteBulk}
                className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900 transition-all hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus ({selectedIds.length}) Terpilih</span>
              </button>
            </>
          )}

          <div className="text-xs font-semibold text-slate-500">
            Menampilkan <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredStudents.length}</span> dari {db.masterSiswa?.length || 0} siswa
          </div>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

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
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{s.namaLengkap}</span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                              Tersimpan
                            </span>
                          )}
                        </div>
                      </td>
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
      {/* Excel Import Staging / Option Modal */}
      {importModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Opsi Impor Excel Data Siswa
                  </h3>
                  <p className="text-xs text-slate-500">
                    File: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{importModal.fileName}</span> ({importModal.rows.length} siswa terdeteksi)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportModal({ isOpen: false, fileName: '', rows: [], mode: 'overwrite' })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Pilih bagaimana data dari file Excel ini akan dimasukkan ke database sistem:
              </p>

              <div className="space-y-3">
                {/* Option 1: Overwrite (Tindih Semua) */}
                <label
                  onClick={() => setImportModal((prev) => ({ ...prev, mode: 'overwrite' }))}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    importModal.mode === 'overwrite'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={importModal.mode === 'overwrite'}
                    onChange={() => setImportModal((prev) => ({ ...prev, mode: 'overwrite' }))}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        Tindih / Ganti Semua Data Lama
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                        Rekomendasi
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Menghapus data contoh/lama dan menggantinya sepenuhnya dengan {importModal.rows.length} siswa dari file Excel Anda. Sangat cocok jika Anda mengunggah daftar lengkap sekolah.
                    </p>
                  </div>
                </label>

                {/* Option 2: Merge (Gabungkan) */}
                <label
                  onClick={() => setImportModal((prev) => ({ ...prev, mode: 'merge' }))}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    importModal.mode === 'merge'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={importModal.mode === 'merge'}
                    onChange={() => setImportModal((prev) => ({ ...prev, mode: 'merge' }))}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      Gabungkan / Update Data (Merge)
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Tetap mempertahankan data yang sudah ada. Siswa dengan NISN/NIS yang sama akan diperbarui, dan siswa baru akan ditambahkan.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Setelah impor selesai, jika Supabase terhubung, data akan otomatis disinkronkan ke tabel <code className="font-mono font-bold">master_siswa</code> di database cloud.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setImportModal({ isOpen: false, fileName: '', rows: [], mode: 'overwrite' })}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Proses Impor ({importModal.rows.length} Siswa)</span>
                </button>
              </div>
            </div>
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
