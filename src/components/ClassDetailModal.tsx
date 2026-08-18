import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  HeartHandshake,
  BookOpen,
  Sparkles,
  Printer,
  Calendar,
  Edit2,
  Search,
  Check,
  GraduationCap,
  Save,
  RefreshCw,
  Cloud,
  Database,
  FileText,
  AlertCircle,
  Undo2,
} from 'lucide-react';
import { ClassZoneInfo } from '../data/classZoneData';
import { AppDatabase, GuruItem, SiswaItem } from '../types';
import { StorageService } from '../services/storage';
import { triggerPrintElement } from '../utils/exportUtils';

interface ClassDetailModalProps {
  classInfo: ClassZoneInfo | null;
  isOpen: boolean;
  onClose: () => void;
  db?: AppDatabase;
  onRefresh?: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  classInfo,
  isOpen,
  onClose,
  db,
  onRefresh,
}) => {
  const [activeSelectType, setActiveSelectType] = useState<'wali' | 'duta' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [customDutaInput, setCustomDutaInput] = useState('');

  // Editable Form States
  const [waliKelas, setWaliKelas] = useState('');
  const [dutaAntiBullying, setDutaAntiBullying] = useState('');
  const [ikrarSiswa, setIkrarSiswa] = useState('');
  const [catatanKegiatan, setCatatanKegiatan] = useState('');
  const [deklarasiDamai, setDeklarasiDamai] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (classInfo) {
      setWaliKelas(classInfo.waliKelas || '');
      setDutaAntiBullying(classInfo.dutaAntiBullying || '');
      setIkrarSiswa(classInfo.ikrarSiswa || '');
      setCatatanKegiatan(classInfo.catatanKegiatan || '');
      setDeklarasiDamai(classInfo.deklarasiDamai !== undefined ? classInfo.deklarasiDamai : true);
      setSaveMessage(null);
      setIsEditing(false);
    }
  }, [classInfo, isOpen]);

  if (!isOpen || !classInfo) return null;

  const handlePrint = () => {
    triggerPrintElement('class-detail-printable-area', `Profil Kelas ${classInfo.namaKelas}`);
  };

  const teachers = db?.masterGuru || [];
  const students = db?.masterSiswa || [];

  const filteredTeachers = teachers.filter(
    (g) =>
      !searchQuery.trim() ||
      g.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.mapel && g.mapel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredStudents = students.filter(
    (s) =>
      !searchQuery.trim() ||
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kelas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenWaliModal = () => {
    setActiveSelectType('wali');
    setSearchQuery('');
  };

  const handleOpenDutaModal = () => {
    setActiveSelectType('duta');
    setSearchQuery('');

    // Auto populate existing selection from dutaAntiBullying
    const currentNames = (dutaAntiBullying || classInfo.dutaAntiBullying || '')
      .split(/&|,/)
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean);

    const initialIds = students
      .filter((s) => currentNames.includes(s.namaLengkap.toLowerCase()))
      .map((s) => s.id);

    setSelectedStudentIds(initialIds);
    if (initialIds.length === 0 && dutaAntiBullying) {
      setCustomDutaInput(dutaAntiBullying);
    } else {
      setCustomDutaInput('');
    }
  };

  const handleSelectWali = (teacher: GuruItem) => {
    setWaliKelas(teacher.namaLengkap);
    const res = StorageService.saveClassAssignment(classInfo.namaKelas, {
      waliKelas: teacher.namaLengkap,
      dutaAntiBullying,
      ikrarSiswa,
      catatanKegiatan,
      deklarasiDamai,
    });
    if (onRefresh) onRefresh();
    setSaveMessage({
      text: `Wali Kelas ${teacher.namaLengkap} berhasil disimpan!`,
      type: 'success',
    });
    setTimeout(() => {
      setActiveSelectType(null);
    }, 350);
  };

  const handleSaveDutaSelection = () => {
    let finalDutaText = '';
    if (selectedStudentIds.length > 0) {
      const selectedNames = students
        .filter((s) => selectedStudentIds.includes(s.id))
        .map((s) => s.namaLengkap);
      finalDutaText = selectedNames.join(' & ');
    } else if (customDutaInput.trim()) {
      finalDutaText = customDutaInput.trim();
    } else {
      alert('Pilih setidaknya satu siswa atau ketik nama duta anti-bullying.');
      return;
    }

    setDutaAntiBullying(finalDutaText);
    const res = StorageService.saveClassAssignment(classInfo.namaKelas, {
      waliKelas,
      dutaAntiBullying: finalDutaText,
      ikrarSiswa,
      catatanKegiatan,
      deklarasiDamai,
    });
    if (onRefresh) onRefresh();
    setSaveMessage({
      text: `Duta Anti-Bullying (${finalDutaText}) berhasil disimpan!`,
      type: 'success',
    });
    setTimeout(() => {
      setActiveSelectType(null);
      setSelectedStudentIds([]);
      setCustomDutaInput('');
    }, 350);
  };

  const toggleStudentSelection = (id: string) => {
    let newIds: string[] = [];
    if (selectedStudentIds.includes(id)) {
      newIds = selectedStudentIds.filter((i) => i !== id);
    } else {
      if (selectedStudentIds.length >= 2) {
        alert('Maksimal 2 siswa yang dapat dipilih sebagai Duta / Sahabat Sebaya.');
        return;
      }
      newIds = [...selectedStudentIds, id];
    }
    setSelectedStudentIds(newIds);
  };

  const handleSaveAll = async () => {
    if (!classInfo) return;
    setIsSaving(true);
    try {
      const res = StorageService.saveClassAssignment(classInfo.namaKelas, {
        waliKelas: waliKelas.trim() || classInfo.waliKelas,
        dutaAntiBullying: dutaAntiBullying.trim() || classInfo.dutaAntiBullying,
        ikrarSiswa: ikrarSiswa.trim(),
        catatanKegiatan: catatanKegiatan.trim(),
        deklarasiDamai,
      });

      if (onRefresh) {
        onRefresh();
      }

      setSaveMessage({
        text: `✓ Perubahan data Zona Hijau Kelas ${classInfo.namaKelas} berhasil disimpan permanen!`,
        type: 'success',
      });
      setIsEditing(false);

      setTimeout(() => {
        setSaveMessage(null);
      }, 4000);
    } catch (e: any) {
      setSaveMessage({
        text: `Gagal menyimpan: ${e?.message || 'Terjadi kesalahan sistem'}`,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToOriginal = () => {
    setWaliKelas(classInfo.waliKelas);
    setDutaAntiBullying(classInfo.dutaAntiBullying);
    setIkrarSiswa(classInfo.ikrarSiswa);
    setCatatanKegiatan(classInfo.catatanKegiatan);
    setDeklarasiDamai(classInfo.deklarasiDamai ?? true);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div id="class-detail-printable-area" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl animate-scaleUp">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-xl font-display shadow-2xs">
              {classInfo.namaKelas}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                  Profil Zona Ramah Anak Kelas {classInfo.namaKelas}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  🟢 ZONA HIJAU
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                UPT SMP Negeri 7 Pasuruan • Bebas Perundungan & Kekerasan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Status Notification */}
        {saveMessage && (
          <div
            className={`mx-5 md:mx-6 mt-4 p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{saveMessage.text}</span>
            </div>
            <button
              onClick={() => setSaveMessage(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 md:p-6 space-y-5">
          {/* Quick Edit Toggle & Status Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                  Zona Hijau Zero Bullying • Kepatuhan {classInfo.skorKepatuhan}%
                </h4>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                  Data kelas terhubung langsung ke dashboard monitoring & database Supabase.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-slate-700 shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Mode Edit Kelas</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleResetToOriginal}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Sekarang'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Wali Kelas Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Wali Kelas
                  </span>
                  <button
                    onClick={handleOpenWaliModal}
                    className="px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-900 border border-teal-300 dark:border-teal-700 transition-colors flex items-center gap-1 text-[11px] font-bold"
                    title="Pilih dari Master Data Guru"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Pilih Guru</span>
                  </button>
                </div>

                {isEditing ? (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={waliKelas}
                      onChange={(e) => setWaliKelas(e.target.value)}
                      placeholder="Nama Lengkap Wali Kelas & Gelar..."
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Ketik langsung atau klik tombol &quot;Pilih Guru&quot; diatas
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{waliKelas || classInfo.waliKelas}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Wali Kelas Terdaftar SMPN 7 Pasuruan</span>
                  </div>
                )}
              </div>
            </div>

            {/* Duta Anti-Bullying Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Duta Anti-Bullying / Sahabat Sebaya
                  </span>
                  <button
                    onClick={handleOpenDutaModal}
                    className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 transition-colors flex items-center gap-1 text-[11px] font-bold"
                    title="Pilih dari Master Data Siswa"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Pilih Siswa</span>
                  </button>
                </div>

                {isEditing ? (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={dutaAntiBullying}
                      onChange={(e) => setDutaAntiBullying(e.target.value)}
                      placeholder="Nama Duta 1 & Nama Duta 2..."
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Ketik langsung atau klik tombol &quot;Pilih Siswa&quot; diatas
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{dutaAntiBullying || classInfo.dutaAntiBullying}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Sahabat Sebaya Terpilih Rombel {classInfo.namaKelas}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ikrar & Slogan Kelas */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Ikrar & Komitmen Damai Siswa Kelas {classInfo.namaKelas}
                </h4>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Ubah Ikrar</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                rows={2}
                value={ikrarSiswa}
                onChange={(e) => setIkrarSiswa(e.target.value)}
                placeholder="Tuliskan ikrar & komitmen damai siswa kelas ini..."
                className="w-full p-2.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            ) : (
              <p className="text-xs italic font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
                &quot;{ikrarSiswa || classInfo.ikrarSiswa}&quot;
              </p>
            )}
          </div>

          {/* Catatan Observasi & Pengamatan Satgas */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Catatan Evaluasi Satgas & Guru BK</span>
              </span>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Ubah Catatan</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                rows={3}
                value={catatanKegiatan}
                onChange={(e) => setCatatanKegiatan(e.target.value)}
                placeholder="Tuliskan evaluasi kondisi kelas, penataan deklarasi damai, atau hasil monitoring satgas..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {catatanKegiatan || classInfo.catatanKegiatan}
              </p>
            )}
          </div>

          {/* Rekam Statistik Kasus Kelas */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Rekam Laporan & Penanganan Kasus Real-time</span>
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block font-medium">Verbal</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{classInfo.kasusVerbal}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block font-medium">Fisik</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{classInfo.kasusFisik}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block font-medium">Relasional</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{classInfo.kasusRelasional}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block font-medium">Siber</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{classInfo.kasusSiber}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between">
              <span>Status Penanganan Kasus:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {classInfo.kasusVerbal + classInfo.kasusFisik + classInfo.kasusRelasional + classInfo.kasusSiber === 0
                  ? '🟢 Zero Kasus (Kondusif & Aman)'
                  : `🟢 ${classInfo.kasusSelesai} Kasus Terselesaikan Damai`}
              </span>
            </p>
          </div>
        </div>

        {/* Modal Footer with Explicit Save Button */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70 sticky bottom-0 z-10 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Profil</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Tutup
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Menyimpan ke Cloud...' : 'Simpan Data Zona Hijau'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SELECTION POPUP MODAL (Wali Kelas / Duta Anti-Bullying) */}
      {activeSelectType && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  {activeSelectType === 'wali' ? <GraduationCap className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {activeSelectType === 'wali'
                    ? `Pilih Wali Kelas ${classInfo.namaKelas} dari Master Guru`
                    : `Pilih Duta Anti-Bullying / Sahabat Sebaya ${classInfo.namaKelas} dari Master Siswa`}
                </h3>
              </div>
              <button
                onClick={() => setActiveSelectType(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    activeSelectType === 'wali'
                      ? 'Cari nama guru, NIP, atau mata pelajaran...'
                      : 'Cari nama siswa, NISN, atau kelas...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Selection Content */}
              {activeSelectType === 'wali' ? (
                <div className="space-y-2 pr-1">
                  {filteredTeachers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-400">Tidak ada data guru yang cocok.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Anda dapat menambah master data guru di menu Master Guru atau ketik nama secara manual di form edit.
                      </p>
                    </div>
                  ) : (
                    filteredTeachers.map((teacher) => {
                      const isSelected = (waliKelas || classInfo.waliKelas) === teacher.namaLengkap;
                      return (
                        <div
                          key={teacher.id}
                          onClick={() => handleSelectWali(teacher)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{teacher.namaLengkap}</span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold flex items-center gap-1 border border-teal-300 dark:border-teal-700">
                                  <Check className="w-3 h-3 text-teal-600" />
                                  Terpilih
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                              <span className="font-mono">NIP: {teacher.nip || '-'}</span>
                              <span>•</span>
                              <span>{teacher.jabatan || 'Guru'}</span>
                              {teacher.mapel && (
                                <>
                                  <span>•</span>
                                  <span className="text-teal-600 dark:text-teal-400 font-medium">{teacher.mapel}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Pilih</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pilih 1 atau 2 siswa dari Master Data Siswa sebagai Duta Anti-Bullying / Sahabat Sebaya kelas {classInfo.namaKelas}:
                  </p>
                  <div className="space-y-2 pr-1 max-h-60 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">Tidak ada data siswa yang cocok.</p>
                    ) : (
                      filteredStudents.map((student) => {
                        const isChecked = selectedStudentIds.includes(student.id);
                        return (
                          <div
                            key={student.id}
                            onClick={() => toggleStudentSelection(student.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                                <span>{student.namaLengkap}</span>
                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                  Kelas {student.kelas}
                                </span>
                                {isChecked && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-700">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    Terpilih
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                                NISN: {student.nisn || '-'}
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Manual Duta Input Fallback */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Atau ketik nama Duta secara manual (misal: Muhammad Arya & Nabila Putri):
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Siswa 1 & Nama Siswa 2"
                      value={customDutaInput}
                      onChange={(e) => setCustomDutaInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* STICKY FOOTER ACTION BUTTONS */}
            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {activeSelectType === 'duta'
                  ? selectedStudentIds.length > 0
                    ? `✓ ${selectedStudentIds.length} Siswa Terpilih`
                    : 'Pilih siswa diatas'
                  : 'Pilih guru pembina kelas'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSelectType(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Tutup
                </button>
                {activeSelectType === 'duta' && (
                  <button
                    type="button"
                    onClick={handleSaveDutaSelection}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Duta Terpilih</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
