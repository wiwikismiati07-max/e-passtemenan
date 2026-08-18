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
  RefreshCw,
  Code,
  Copy,
  Check,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { GuruItem } from '../types';
import { StorageService } from '../services/storage';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

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
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSavingSelected, setIsSavingSelected] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<GuruItem | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);

  // Sync state
  const [isFetchingSupabase, setIsFetchingSupabase] = useState(false);
  const [supabaseNotice, setSupabaseNotice] = useState<string | null>(null);

  // Excel Import Staging Modal
  const [importModal, setImportModal] = useState<{
    isOpen: boolean;
    fileName: string;
    rows: Array<Omit<GuruItem, 'id'>>;
    mode: 'overwrite' | 'merge';
  }>({
    isOpen: false,
    fileName: '',
    rows: [],
    mode: 'overwrite',
  });
  
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

  const masterGuruSql = StorageService.getSupabaseMasterGuruSQLScript();

  // Manual pull from Supabase
  const handleFetchFromSupabase = async () => {
    setIsFetchingSupabase(true);
    setSupabaseNotice(null);
    try {
      const res = await StorageService.fetchFromSupabase();
      if (res.success) {
        onRefresh();
        const guruCount = res.counts?.['master_guru'] ?? db.masterGuru.length;
        setSupabaseNotice(`Berhasil sinkronisasi dari Supabase! Total ${guruCount} data guru.`);
        setTimeout(() => setSupabaseNotice(null), 5000);
      } else {
        alert(`Gagal mengambil data dari Supabase: ${res.message}`);
      }
    } catch (e: any) {
      alert(`Error sinkronisasi: ${e?.message || e}`);
    } finally {
      setIsFetchingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(masterGuruSql);
    setIsCopiedSql(true);
    setTimeout(() => setIsCopiedSql(false), 3000);
  };

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

  const handleSaveSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsSavingSelected(true);
    
    StorageService.saveDb();

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0d9488', '#14b8a6', '#5eead4'],
    });

    setSaveNotice(`✓ Berhasil Menyimpan! Status ${selectedIds.length} data guru terpilih telah tersimpan di sistem.`);
    setIsSavingSelected(false);
    onRefresh();
    setTimeout(() => setSaveNotice(null), 4500);
  };

  // Excel Export Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIP: '198311162009042003',
        'Nama Lengkap': 'Wiwik Ismiati, S.Pd',
        Jabatan: 'Guru Mata Pelajaran',
        Mapel: 'Matematika',
        'No. HP': '081234567890',
        Email: 'guru@smpn7pasuruan.sch.id',
        Keterangan: 'Aktif / Wali Kelas 7A',
      },
      {
        NIP: '197505121999031002',
        'Nama Lengkap': 'Bambang Sudarsono, M.Pd',
        Jabatan: 'Wakasek',
        Mapel: 'Bahasa Indonesia',
        'No. HP': '081234567891',
        Email: 'bambang@smpn7pasuruan.sch.id',
        Keterangan: 'Wakasek Kesiswaan',
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

  // Handle Excel Upload Selection
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

        const mappedRows = rawData
          .map((row) => ({
            nip: String(row.NIP || row.nip || row.Nip || '').trim(),
            namaLengkap: String(row['Nama Lengkap'] || row.namaLengkap || row.Nama || row.nama || '').trim(),
            jabatan: String(row.Jabatan || row.jabatan || 'Guru Mata Pelajaran').trim(),
            mapel: String(row.Mapel || row.mapel || row['Mata Pelajaran'] || '').trim(),
            noHp: String(row['No. HP'] || row.noHp || row.NoHP || row.telepon || '').trim(),
            email: String(row.Email || row.email || '').trim(),
            keterangan: String(row.Keterangan || row.keterangan || 'Import Excel').trim(),
          }))
          .filter((row) => row.namaLengkap.length > 0);

        if (mappedRows.length === 0) {
          alert('Tidak ada baris data guru dengan nama lengkap yang valid dalam file Excel tersebut.');
          return;
        }

        // Open option modal for Overwrite vs Merge
        setImportModal({
          isOpen: true,
          fileName: file.name,
          rows: mappedRows,
          mode: 'overwrite',
        });
      } catch (err: any) {
        alert(`Gagal membaca file Excel: ${err?.message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // Execute Excel Import based on selected mode
  const handleExecuteImport = () => {
    if (importModal.rows.length === 0) return;
    const overwrite = importModal.mode === 'overwrite';
    const result = StorageService.importGuruBatch(importModal.rows, importModal.mode);
    setImportModal({ isOpen: false, fileName: '', rows: [], mode: 'overwrite' });
    onRefresh();
    alert(
      `Sukses Impor Excel Data Guru & Staf!\n` +
      `- Mode: ${overwrite ? 'Tindih / Ganti Semua Data Lama' : 'Gabungkan / Update Data'}\n` +
      `- Data berhasil diimpor: ${result.added} guru\n` +
      `- Total guru terdaftar saat ini: ${result.total} orang`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Top Banner / Actions Card */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-bold tracking-wide uppercase">
                <Briefcase className="w-4 h-4 text-teal-300" />
                MANAJEMEN PENDIDIK & STAF
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                {db.masterGuru.length} Guru / Staf Terdaftar
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Master Data Guru & Pegawai SMPN 7 Pasuruan
            </h2>
            <p className="text-teal-200 text-sm mt-1 max-w-2xl">
              Kelola data seluruh guru dan staf pengajar. Unggah rekap Excel (.xlsx) dengan opsi tindih data lama, buat tabel di Supabase SQL, atau sinkronkan data cloud secara otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleFetchFromSupabase}
              disabled={isFetchingSupabase}
              className="px-3.5 py-2 rounded-xl bg-teal-600/60 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-2 transition-all border border-teal-400/40 shadow-sm"
              title="Tarik atau muat data guru terbaru dari Supabase"
            >
              <RefreshCw className={`w-4 h-4 text-amber-300 ${isFetchingSupabase ? 'animate-spin' : ''}`} />
              <span>{isFetchingSupabase ? 'Memuat Supabase...' : 'Tarik dari Supabase'}</span>
            </button>

            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all border border-amber-400/40 shadow-sm"
              title="Lihat & Salin Coding SQL untuk tabel master_guru di Supabase"
            >
              <Code className="w-4 h-4 text-amber-400" />
              <span>SQL Supabase</span>
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
              title="Unggah data dari file Excel (Tindih/Gabung)"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Excel</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20"
              title="Ekspor data saat ini ke Excel"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Export</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-white text-teal-900 hover:bg-teal-50 text-xs font-extrabold flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Tambah Guru</span>
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
            <>
              <button
                onClick={handleSaveSelected}
                disabled={isSavingSelected}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/30 transition-all active:scale-95"
                title="Simpan data guru yang dipilih"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan ({selectedIds.length}) Terpilih</span>
              </button>

              <button
                onClick={handleOpenDeleteBulk}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
            </>
          )}

          <div className="text-xs font-semibold text-slate-500">
            Menampilkan <span className="text-teal-600 dark:text-teal-400 font-bold">{filteredTeachers.length}</span> dari {db.masterGuru.length} guru
          </div>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3.5 bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-700 rounded-2xl text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Main Table Container */}
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-white">{g.namaLengkap}</span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950/90 dark:text-teal-300 border border-teal-300 dark:border-teal-700 shadow-2xs animate-in fade-in zoom-in-95 duration-200">
                              <Check className="w-3 h-3 text-teal-600 dark:text-teal-400 stroke-[3]" />
                              Tersimpan
                            </span>
                          )}
                        </div>
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

      {/* SQL Script Generator Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Coding SQL Tabel Master Guru Supabase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jalankan script ini di menu <strong>SQL Editor</strong> pada dashboard Supabase Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Petunjuk Pembuatan Tabel di Supabase:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-amber-900 dark:text-amber-300">
                  <li>Buka project Supabase Anda di <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-bold text-amber-700 dark:text-amber-300">supabase.com</a></li>
                  <li>Buka menu <strong>SQL Editor</strong> di sidebar kiri</li>
                  <li>Klik <strong>New Query</strong>, lalu paste coding SQL di bawah ini</li>
                  <li>Klik tombol hijau <strong>Run</strong> untuk mengeksekusi</li>
                  <li>Tabel <code className="font-mono font-bold">master_guru</code> akan terbuat lengkap dengan RLS policy aman!</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between bg-slate-800 text-slate-300 text-[11px] font-mono px-4 py-2 rounded-t-xl border border-slate-700">
                  <span>schema_master_guru.sql</span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-sm"
                  >
                    {isCopiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-b-xl border border-t-0 border-slate-800 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                  {masterGuruSql}
                </pre>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setIsSqlModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                >
                  Tutup
                </button>
                <button
                  onClick={handleCopySql}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  {isCopiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopiedSql ? 'Sudah Tersalin ke Clipboard' : 'Salin Semua SQL'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Staging / Option Modal */}
      {importModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Opsi Impor Excel Data Guru & Staf
                  </h3>
                  <p className="text-xs text-slate-500">
                    File: <span className="font-semibold text-teal-600 dark:text-teal-400">{importModal.fileName}</span> ({importModal.rows.length} data terdeteksi)
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
                      ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="importModeGuru"
                    checked={importModal.mode === 'overwrite'}
                    onChange={() => setImportModal((prev) => ({ ...prev, mode: 'overwrite' }))}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        Tindih / Ganti Semua Data Lama
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                        Rekomendasi
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Menghapus data contoh/lama dan menggantinya sepenuhnya dengan {importModal.rows.length} guru/staf dari file Excel Anda.
                    </p>
                  </div>
                </label>

                {/* Option 2: Merge (Gabungkan) */}
                <label
                  onClick={() => setImportModal((prev) => ({ ...prev, mode: 'merge' }))}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    importModal.mode === 'merge'
                      ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="importModeGuru"
                    checked={importModal.mode === 'merge'}
                    onChange={() => setImportModal((prev) => ({ ...prev, mode: 'merge' }))}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      Gabungkan / Update Data (Merge)
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Tetap mempertahankan data yang sudah ada. Guru dengan NIP/Nama yang sama akan diperbarui, dan data baru akan ditambahkan.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Setelah impor selesai, jika Supabase terhubung dan tabel <code className="font-mono font-bold">master_guru</code> telah dibuat, data akan otomatis disinkronkan ke cloud.
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
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Proses Impor ({importModal.rows.length} Guru)</span>
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

