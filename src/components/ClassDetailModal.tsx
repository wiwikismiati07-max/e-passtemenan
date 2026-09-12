import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  FileCheck,
} from 'lucide-react';
import { ClassZoneInfo } from '../data/classZoneData';
import { AppDatabase, GuruItem, SiswaItem } from '../types';
import { StorageService } from '../services/storage';
import { triggerPrintElement, exportElementToPDF } from '../utils/exportUtils';
import { KopSurat } from './KopSurat';

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
  const [dutaClassFilter, setDutaClassFilter] = useState<'current' | 'all' | 'selected'>('current');

  // Editable Form States
  const [waliKelas, setWaliKelas] = useState('');
  const [dutaAntiBullying, setDutaAntiBullying] = useState('');
  const [ikrarSiswa, setIkrarSiswa] = useState('');
  const [catatanKegiatan, setCatatanKegiatan] = useState('');
  const [deklarasiDamai, setDeklarasiDamai] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Printing & PDF export states
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'doc'>('form');

  // Track the current class id to avoid wiping state on unrelated prop re-renders
  const currentClassRef = useRef<string | null>(null);

  const pejabatConfig = StorageService.getPejabatConfig();
  const kepalaNama = pejabatConfig?.kepalaSekolahNama || 'NUR FADILAH, S.Pd., M.Pd';
  const kepalaNip = pejabatConfig?.kepalaSekolahNip || '19860410 201001 2 030';
  const kepalaJabatan = pejabatConfig?.kepalaSekolahJabatan || 'Kepala UPT SMP Negeri 7 Pasuruan';

  const showPrintFeedback = (msg: string) => {
    setPrintFeedback(msg);
    setTimeout(() => {
      setPrintFeedback((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  useEffect(() => {
    if (isOpen && classInfo) {
      if (currentClassRef.current !== classInfo.namaKelas) {
        currentClassRef.current = classInfo.namaKelas;
        const assigned = db?.classAssignments?.[classInfo.namaKelas];
        setWaliKelas(assigned?.waliKelas || classInfo.waliKelas || '');
        setDutaAntiBullying(assigned?.dutaAntiBullying || classInfo.dutaAntiBullying || '');
        setIkrarSiswa(assigned?.ikrarSiswa || classInfo.ikrarSiswa || '');
        setCatatanKegiatan(assigned?.catatanKegiatan || classInfo.catatanKegiatan || '');
        setDeklarasiDamai(
          assigned?.deklarasiDamai !== undefined
            ? assigned.deklarasiDamai
            : classInfo.deklarasiDamai !== undefined
            ? classInfo.deklarasiDamai
            : true
        );
        setIsEditing(false);
        setIsSavedSuccess(false);
        setSaveMessage(null);
        setActiveTab('form');
        setPrintFeedback(null);
      }
    } else if (!isOpen) {
      currentClassRef.current = null;
      setIsSavedSuccess(false);
      setSaveMessage(null);
      setPrintFeedback(null);
    }
  }, [isOpen, classInfo?.namaKelas]);

  if (!isOpen || !classInfo) return null;

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    showPrintFeedback('Mempersiapkan dokumen cetak resmi...');
    try {
      await triggerPrintElement(
        'class-detail-printable-area',
        `Profil Zona Ramah Anak Kelas ${classInfo.namaKelas}`,
        () => {
          showPrintFeedback('Dialog cetak browser otomatis menyimpan dokumen PDF resmi ke perangkat Anda.');
        }
      );
    } catch (err) {
      console.warn('Print trigger error, auto-fallback to PDF:', err);
      handleExportPdf();
    } finally {
      setTimeout(() => setIsPrinting(false), 1000);
    }
  };

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    showPrintFeedback('Membuat dan mengunduh berkas PDF resmi dokumen kelas...');
    const cleanFilename = `Profil_Zona_Hijau_Kelas_${classInfo.namaKelas.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    try {
      const success = await exportElementToPDF('class-detail-printable-area', cleanFilename);
      if (success) {
        showPrintFeedback('✓ Berkas PDF resmi berhasil diunduh ke perangkat Anda.');
      } else {
        showPrintFeedback('Mencoba membuka dialog cetak langsung...');
        triggerPrintElement('class-detail-printable-area', `Profil Kelas ${classInfo.namaKelas}`);
      }
    } catch (err) {
      console.error('Export PDF error:', err);
      showPrintFeedback('Mengalihkan ke dialog cetak...');
      triggerPrintElement('class-detail-printable-area', `Profil Kelas ${classInfo.namaKelas}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const teachers = db?.masterGuru || [];
  const students = db?.masterSiswa || [];

  const isCurrentClassStudent = (s: SiswaItem) => {
    if (!classInfo?.namaKelas) return false;
    const target = classInfo.namaKelas.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
    const studentCls = (s.kelas || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
    if (studentCls === target) return true;
    const romanMap: Record<string, string> = { vii: '7', viii: '8', ix: '9' };
    let normalizedStudent = studentCls;
    let normalizedTarget = target;
    for (const [rom, num] of Object.entries(romanMap)) {
      if (normalizedStudent.startsWith(rom)) normalizedStudent = normalizedStudent.replace(rom, num);
      if (normalizedTarget.startsWith(rom)) normalizedTarget = normalizedTarget.replace(rom, num);
    }
    return normalizedStudent === normalizedTarget;
  };

  const studentsInCurrentClass = students.filter(isCurrentClassStudent);

  const filteredTeachers = teachers.filter(
    (g) =>
      !searchQuery.trim() ||
      g.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.mapel && g.mapel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStudentsForDuta = () => {
    let pool: SiswaItem[] = students;
    if (dutaClassFilter === 'current' && studentsInCurrentClass.length > 0) {
      pool = studentsInCurrentClass;
    } else if (dutaClassFilter === 'selected') {
      pool = students.filter((s) => selectedStudentIds.includes(s.id));
    } else {
      pool = [...students].sort((a, b) => {
        const aCur = isCurrentClassStudent(a) ? 1 : 0;
        const bCur = isCurrentClassStudent(b) ? 1 : 0;
        if (aCur !== bCur) return bCur - aCur;
        return a.namaLengkap.localeCompare(b.namaLengkap);
      });
    }

    if (!searchQuery.trim()) return pool;
    const q = searchQuery.toLowerCase();
    return pool.filter(
      (s) =>
        s.namaLengkap.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q)
    );
  };

  const filteredStudents = getStudentsForDuta();

  const handleOpenWaliModal = () => {
    setActiveSelectType('wali');
    setSearchQuery('');
  };

  const handleOpenDutaModal = () => {
    setActiveSelectType('duta');
    setSearchQuery('');
    setDutaClassFilter(studentsInCurrentClass.length > 0 ? 'current' : 'all');

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
    const chosenName = teacher.namaLengkap;
    setWaliKelas(chosenName);
    StorageService.saveClassAssignment(classInfo.namaKelas, {
      waliKelas: chosenName,
      dutaAntiBullying: dutaAntiBullying || classInfo.dutaAntiBullying,
      ikrarSiswa: ikrarSiswa || classInfo.ikrarSiswa,
      catatanKegiatan: catatanKegiatan || classInfo.catatanKegiatan,
      deklarasiDamai,
    });
    window.dispatchEvent(new Event('pass-temenan-db-updated'));
    if (onRefresh) onRefresh();

    setSaveMessage({
      text: `✓ Wali Kelas (${chosenName}) berhasil disimpan & tersinkron!`,
      type: 'success',
    });
    setIsSavedSuccess(true);

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
    StorageService.saveClassAssignment(classInfo.namaKelas, {
      waliKelas: waliKelas || classInfo.waliKelas,
      dutaAntiBullying: finalDutaText,
      ikrarSiswa: ikrarSiswa || classInfo.ikrarSiswa,
      catatanKegiatan: catatanKegiatan || classInfo.catatanKegiatan,
      deklarasiDamai,
    });
    window.dispatchEvent(new Event('pass-temenan-db-updated'));
    if (onRefresh) onRefresh();

    setSaveMessage({
      text: `✓ Duta Anti-Bullying (${finalDutaText}) berhasil disimpan & tersinkron!`,
      type: 'success',
    });
    setIsSavedSuccess(true);

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

  const handleSaveAll = async (autoClose: boolean = false) => {
    if (!classInfo) return;
    setIsSaving(true);
    try {
      const finalWali = (waliKelas || classInfo.waliKelas).trim();
      const finalDuta = (dutaAntiBullying || classInfo.dutaAntiBullying).trim();
      const finalIkrar = (ikrarSiswa || classInfo.ikrarSiswa).trim();
      const finalCatatan = (catatanKegiatan || classInfo.catatanKegiatan).trim();

      StorageService.saveClassAssignment(classInfo.namaKelas, {
        waliKelas: finalWali,
        dutaAntiBullying: finalDuta,
        ikrarSiswa: finalIkrar,
        catatanKegiatan: finalCatatan,
        deklarasiDamai,
      });

      // Notify entire app of the database update
      window.dispatchEvent(new Event('pass-temenan-db-updated'));

      if (onRefresh) {
        onRefresh();
      }

      setIsSavedSuccess(true);
      setSaveMessage({
        text: `✓ Data Zona Hijau Kelas ${classInfo.namaKelas} berhasil disimpan ke sistem & Cloud!`,
        type: 'success',
      });
      setIsEditing(false);

      if (autoClose) {
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setTimeout(() => {
          setIsSavedSuccess(false);
        }, 3500);
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[94vh] sm:max-h-[92vh] overflow-y-auto shadow-2xl animate-scaleUp flex flex-col relative">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-4 sm:p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-xl font-display shadow-2xs shrink-0">
              {classInfo.namaKelas}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs: Form vs Format Cetak Resmi */}
        <div className="px-4 sm:px-6 pt-2.5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'form'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Form & Rincian Kelas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doc')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'doc'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pratinjau Format Cetak (Kop Surat)</span>
          </button>
        </div>

        {/* Print & PDF Notification Banner */}
        {printFeedback && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-teal-600 text-white text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 shrink-0" />
              <span>{printFeedback}</span>
            </div>
            <button
              onClick={() => setPrintFeedback(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Success / Error Notification Banner */}
        {saveMessage && (
          <div
            className={`mx-5 md:mx-6 mt-4 p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              saveMessage.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600'
                : 'bg-rose-500 text-white border-rose-600 dark:bg-rose-600'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-white shrink-0" />
              )}
              <span className="leading-snug">{saveMessage.text}</span>
            </div>
            <button
              onClick={() => setSaveMessage(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className={`p-5 md:p-6 space-y-5 flex-1 ${activeTab === 'form' ? 'block' : 'hidden'}`}>
          {/* Quick Edit Toggle & Status Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                  Zona Hijau Zero Bullying • Kepatuhan {classInfo.skorKepatuhan}%
                </h4>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                  Data kelas terhubung langsung ke dashboard monitoring & database Supabase Cloud.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-slate-700 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
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
                    onClick={() => handleSaveAll(false)}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
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
                    className="px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-900 border border-teal-300 dark:border-teal-700 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
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
                    className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
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
                  className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
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
                  className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
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

        {/* DEDICATED OFFICIAL PRINTABLE DOCUMENT (Visible in doc preview mode, off-screen in form mode) */}
        <div
          className={
            activeTab === 'doc'
              ? 'p-4 sm:p-6 space-y-4 bg-slate-100 dark:bg-slate-950 flex-1 overflow-y-auto'
              : 'fixed -left-[9999px] -top-[9999px] w-[800px] pointer-events-none opacity-0 z-[-1]'
          }
        >
          {activeTab === 'doc' && (
            <div className="flex items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Pratinjau Dokumen Siap Cetak (Standar Resmi Kemendikbudristek)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting || isExportingPdf}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPrinting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                  <span>{isPrinting ? 'Menyiapkan...' : 'Cetak Dokumen'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isPrinting || isExportingPdf}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExportingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{isExportingPdf ? 'Mengunduh...' : 'Unduh PDF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* THE ACTUAL PRINTABLE NODE */}
          <div
            id="class-detail-printable-area"
            className="bg-white text-slate-900 print:text-black p-6 sm:p-8 md:p-10 space-y-5 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:space-y-4 max-w-[210mm] mx-auto"
          >
            {/* 1. Official School Kop Surat */}
            <KopSurat
              judulLaporan={`LEMBAR PROFIL ZONA RAMAH ANAK KELAS ${classInfo.namaKelas}`}
              nomorSurat={`421.3/PPKSP-KL${classInfo.namaKelas}/SPANJU/${new Date().getFullYear()}`}
              tanggalSurat={new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />

            {/* 2. Judul Dokumen Resmi */}
            <div className="text-center border-b-2 border-slate-900 pb-3 pt-1 print:border-black">
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-900 print:text-black font-serif">
                PROFIL ZONA RAMAH ANAK & LAPORAN PREVENTIF PERUNDUNGAN
              </h2>
              <h3 className="text-xs sm:text-sm font-extrabold text-emerald-800 print:text-black uppercase mt-0.5">
                UPT SMP NEGERI 7 PASURUAN • TAHUN AJARAN 2025/2026
              </h3>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 print:border-black print:bg-transparent text-xs font-bold uppercase">
                <span>Status Kepatuhan: 🟢 Zona Hijau Zero Bullying ({classInfo.skorKepatuhan}%)</span>
              </div>
            </div>

            {/* 3. Tabel Identitas & Pembina Kelas */}
            <div className="border border-slate-300 print:border-black rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs print:text-[9.5pt] border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200 print:border-black bg-slate-50 print:bg-transparent">
                    <td className="w-1/3 py-2 px-3 font-bold text-slate-700 print:text-black">Rombongan Belajar (Kelas)</td>
                    <td className="py-2 px-3 font-extrabold text-slate-900 print:text-black">Kelas {classInfo.namaKelas}</td>
                  </tr>
                  <tr className="border-b border-slate-200 print:border-black">
                    <td className="py-2 px-3 font-bold text-slate-700 print:text-black">Wali Kelas</td>
                    <td className="py-2 px-3 font-bold text-slate-900 print:text-black">{waliKelas || classInfo.waliKelas || 'CAHYO KURNIANTO, S.Pd'}</td>
                  </tr>
                  <tr className="border-b border-slate-200 print:border-black bg-slate-50 print:bg-transparent">
                    <td className="py-2 px-3 font-bold text-slate-700 print:text-black">Duta Anti-Bullying / Sahabat Sebaya</td>
                    <td className="py-2 px-3 font-bold text-slate-900 print:text-black">{dutaAntiBullying || classInfo.dutaAntiBullying || 'Perwakilan Rombel'}</td>
                  </tr>
                  <tr className="border-b border-slate-200 print:border-black">
                    <td className="py-2 px-3 font-bold text-slate-700 print:text-black">Jumlah Siswa Terdaftar</td>
                    <td className="py-2 px-3 text-slate-900 print:text-black">{studentsInCurrentClass.length > 0 ? `${studentsInCurrentClass.length} Siswa` : '32 Siswa'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-700 print:text-black">Deklarasi Damai Kelas</td>
                    <td className="py-2 px-3 text-emerald-800 print:text-black font-bold">
                      {deklarasiDamai ? '✓ Telah Ditandatangani Seluruh Siswa & Terverifikasi Aktif' : 'Dalam Proses'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Ikrar Damai Siswa */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 print:border-black print:bg-transparent">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 print:text-black mb-1">
                Ikrar Damai & Komitmen Bersama Siswa Kelas {classInfo.namaKelas}:
              </h4>
              <p className="text-xs print:text-[9.5pt] text-slate-800 print:text-black italic leading-relaxed">
                "{ikrarSiswa || classInfo.ikrarSiswa || 'Kami siswa berjanji menjunjung tinggi rasa persaudaraan, saling menghargai tanpa memandang perbedaan, menolak segala bentuk perundungan, dan siap menjadi sahabat bagi sesama.'}"
              </p>
            </div>

            {/* 5. Tabel Rekapitulasi Kasus Bullying */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 print:text-black">
                Rekapitulasi Monitoring Kasus Bullying & Kekerasan:
              </h4>
              <table className="w-full text-xs print:text-[9pt] border border-slate-300 print:border-black border-collapse text-center">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-300 print:border-black font-bold">
                    <th className="py-2 px-2 border-r border-slate-300 print:border-black">Bullying Verbal</th>
                    <th className="py-2 px-2 border-r border-slate-300 print:border-black">Bullying Fisik</th>
                    <th className="py-2 px-2 border-r border-slate-300 print:border-black">Bullying Relasional</th>
                    <th className="py-2 px-2 border-r border-slate-300 print:border-black">Bullying Siber</th>
                    <th className="py-2 px-2">Kasus Selesai Damai</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold text-slate-800 print:text-black">
                    <td className="py-2 px-2 border-r border-slate-300 print:border-black">{classInfo.kasusVerbal}</td>
                    <td className="py-2 px-2 border-r border-slate-300 print:border-black">{classInfo.kasusFisik}</td>
                    <td className="py-2 px-2 border-r border-slate-300 print:border-black">{classInfo.kasusRelasional}</td>
                    <td className="py-2 px-2 border-r border-slate-300 print:border-black">{classInfo.kasusSiber}</td>
                    <td className="py-2 px-2 text-emerald-700 print:text-black font-extrabold">{classInfo.kasusSelesai}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[11px] text-slate-500 print:text-black italic">
                * Status: {classInfo.kasusVerbal + classInfo.kasusFisik + classInfo.kasusRelasional + classInfo.kasusSiber === 0 ? 'Zero Kasus (Lingkungan Kelas Sangat Aman & Kondusif)' : 'Kasus telah tertangani secara tuntas melalui mediasi damai TPPK.'}
              </p>
            </div>

            {/* 6. Catatan Program Preventif Kelas */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 print:text-black">
                Catatan Kegiatan & Aksi Preventif Kelas:
              </h4>
              <div className="p-3 rounded-xl border border-slate-200 print:border-black text-xs print:text-[9.5pt] text-slate-800 print:text-black leading-relaxed whitespace-pre-line bg-slate-50 print:bg-transparent">
                {catatanKegiatan || classInfo.catatanKegiatan || 'Pojok Curhat Sebaya aktif, sosialisasi anti-perundungan berkala saat jam wali kelas, dan piket bersama menciptakan suasana belajar yang ramah dan inklusif.'}
              </div>
            </div>

            {/* 7. Blok Tanda Tangan Resmi Kepala Sekolah & Wali Kelas */}
            <div className="pt-4 border-t border-slate-300 print:border-black print:break-inside-avoid">
              <table className="w-full border-none border-collapse text-xs print:text-[9pt] text-center table-fixed">
                <tbody>
                  <tr>
                    {/* Wali Kelas */}
                    <td className="w-1/2 align-top p-2">
                      <p className="text-slate-600 print:text-black m-0">Mengetahui,</p>
                      <p className="font-bold text-slate-900 print:text-black m-0">Wali Kelas {classInfo.namaKelas}</p>
                      <div className="h-16 flex items-center justify-center">
                        <span className="text-xs italic text-slate-400 print:text-black">( Tanda Tangan )</span>
                      </div>
                      <p className="font-bold text-slate-900 print:text-black underline uppercase m-0">
                        {waliKelas || classInfo.waliKelas || 'CAHYO KURNIANTO, S.Pd'}
                      </p>
                      <p className="text-[10px] text-slate-500 print:text-black m-0">NIP. -</p>
                    </td>

                    {/* Kepala Sekolah */}
                    <td className="w-1/2 align-top p-2">
                      <p className="text-slate-600 print:text-black m-0">
                        Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="font-bold text-slate-900 print:text-black m-0">
                        {kepalaJabatan}
                      </p>
                      <div className="h-16 relative flex items-center justify-center">
                        <img
                          src="https://i.ibb.co.com/wrcwZdrK/STEMPEL.png"
                          alt="Stempel Resmi UPT SMPN 7 Pasuruan"
                          className="absolute left-1/2 top-1/2 -translate-x-[55%] -translate-y-1/2 w-20 h-20 object-contain opacity-85 select-none pointer-events-none mix-blend-multiply"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-xs italic text-slate-400 print:text-black z-10">( Tanda Tangan )</span>
                      </div>
                      <p className="font-bold text-slate-900 print:text-black underline uppercase m-0">
                        {kepalaNama}
                      </p>
                      <p className="text-[10px] text-slate-500 print:text-black m-0">NIP. {kepalaNip}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer with Explicit Save & Export Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-900/90 sticky bottom-0 z-20 backdrop-blur-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Cetak dokumen resmi ke printer atau simpan PDF lewat browser"
            >
              {isPrinting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{isPrinting ? 'Menyiapkan Cetak...' : 'Cetak Profil'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isPrinting || isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Unduh berkas PDF resmi dokumen Profil Kelas ke perangkat Anda"
            >
              {isExportingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              )}
              <span>{isExportingPdf ? 'Mengunduh PDF...' : 'Unduh PDF Resmi'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Tutup
            </button>

            {activeTab === 'form' && (
              <button
                type="button"
                onClick={() => handleSaveAll(false)}
                disabled={isSaving}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                  isSavedSuccess
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-300 scale-105'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 active:scale-95'
                }`}
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : isSavedSuccess ? (
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                <span>
                  {isSaving
                    ? 'Menyimpan ke Cloud...'
                    : isSavedSuccess
                    ? '✓ Tersimpan & Tersinkron!'
                    : 'Simpan Data Zona Hijau'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SELECTION POPUP MODAL (Wali Kelas / Duta Anti-Bullying) */}
      {activeSelectType && (
        <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl md:max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/95 dark:bg-slate-800/80 shrink-0 gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 shadow-2xs">
                  {activeSelectType === 'wali' ? <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                    {activeSelectType === 'wali'
                      ? `Pilih Wali Kelas ${classInfo.namaKelas}`
                      : `Pilih Duta Anti-Bullying / Sahabat Sebaya ${classInfo.namaKelas}`}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {activeSelectType === 'wali'
                      ? 'Pilih guru pembimbing dari Master Data Guru SMPN 7 Pasuruan'
                      : 'Pilih 1 atau 2 sahabat sebaya dari Master Siswa atau ketik manual'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSelectType(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Controls Bar */}
            <div className="px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    activeSelectType === 'wali'
                      ? 'Cari nama guru, NIP, atau mata pelajaran...'
                      : 'Cari nama siswa, NISN, atau kelas...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Duta Class Quick Filters */}
              {activeSelectType === 'duta' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setDutaClassFilter('current')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                      dutaClassFilter === 'current'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Kelas {classInfo.namaKelas}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        dutaClassFilter === 'current'
                          ? 'bg-black/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {studentsInCurrentClass.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDutaClassFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                      dutaClassFilter === 'all'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Semua Siswa</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        dutaClassFilter === 'all'
                          ? 'bg-black/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {students.length}
                    </span>
                  </button>
                  {selectedStudentIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDutaClassFilter('selected')}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                        dutaClassFilter === 'selected'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Terpilih ({selectedStudentIds.length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Main Scrollable List Area (Single Scroll Container - No Double Scrollbars!) */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-2 min-h-0">
              {activeSelectType === 'wali' ? (
                filteredTeachers.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs sm:text-sm text-slate-400">Tidak ada data guru yang cocok.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Anda dapat menambah data di Master Guru atau gunakan pencarian lain.
                    </p>
                  </div>
                ) : (
                  filteredTeachers.map((teacher) => {
                    const isSelected = (waliKelas || classInfo.waliKelas) === teacher.namaLengkap;
                    return (
                      <div
                        key={teacher.id}
                        onClick={() => handleSelectWali(teacher)}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-600 ring-2 ring-teal-500/20 shadow-xs'
                            : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-teal-600 text-white shadow-2xs'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {teacher.namaLengkap
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase() || 'G'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {teacher.namaLengkap}
                              </span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold flex items-center gap-1 border border-teal-300 dark:border-teal-700 shrink-0">
                                  <Check className="w-3 h-3 text-teal-600" />
                                  Terpilih
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
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
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-600 hover:text-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isSelected ? 'Terpilih' : 'Pilih'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs sm:text-sm text-slate-400">Tidak ada data siswa yang cocok.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Coba ubah kata kunci pencarian atau beralih ke tab &quot;Semua Siswa&quot;.
                  </p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {student.namaLengkap
                            .split(' ')
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {student.namaLengkap}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                              Kelas {student.kelas}
                            </span>
                            {isChecked && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-700 shrink-0">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Terpilih
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate">
                            NISN: {student.nisn || '-'}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Manual Duta Input Fallback */}
            {activeSelectType === 'duta' && (
              <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Atau ketik nama Duta secara manual:
                  </label>
                  <span className="text-[10px] text-slate-400">Jika nama belum ada di Master</span>
                </div>
                <input
                  type="text"
                  placeholder="Misal: Muhammad Arya & Nabila Putri"
                  value={customDutaInput}
                  onChange={(e) => setCustomDutaInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                />
              </div>
            )}

            {/* Sticky Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-800/90 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {activeSelectType === 'duta' ? (
                  selectedStudentIds.length > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{selectedStudentIds.length} dari maks. 2 Siswa Terpilih</span>
                    </span>
                  ) : customDutaInput.trim() ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Nama manual siap disimpan</span>
                    </span>
                  ) : (
                    <span>Pilih maksimal 2 siswa diatas</span>
                  )
                ) : (
                  <span>Pilih guru pembina kelas</span>
                )}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSelectType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                {activeSelectType === 'duta' && (
                  <button
                    type="button"
                    onClick={handleSaveDutaSelection}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
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
