import React, { useState } from 'react';
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
  const [saveMessage, setSaveMessage] = useState('');

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
    setSaveMessage('');
  };

  const handleOpenDutaModal = () => {
    setActiveSelectType('duta');
    setSearchQuery('');
    setSaveMessage('');
    
    // Auto populate existing selection from classInfo.dutaAntiBullying
    const currentNames = (classInfo.dutaAntiBullying || '')
      .split(/&|,/)
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean);
      
    const initialIds = students
      .filter((s) => currentNames.includes(s.namaLengkap.toLowerCase()))
      .map((s) => s.id);

    setSelectedStudentIds(initialIds);
    if (initialIds.length === 0 && classInfo.dutaAntiBullying) {
      setCustomDutaInput(classInfo.dutaAntiBullying);
    } else {
      setCustomDutaInput('');
    }
  };

  const handleSelectWali = (teacher: GuruItem) => {
    StorageService.saveClassAssignment(classInfo.namaKelas, teacher.namaLengkap, classInfo.dutaAntiBullying);
    setSaveMessage(`Tersimpan: Wali Kelas ${teacher.namaLengkap}`);
    if (onRefresh) onRefresh();
    setTimeout(() => {
      setActiveSelectType(null);
      setSaveMessage('');
    }, 450);
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

    StorageService.saveClassAssignment(classInfo.namaKelas, classInfo.waliKelas, finalDutaText);
    setSaveMessage('Data Duta Terpilih Berhasil Disimpan!');
    if (onRefresh) onRefresh();
    setTimeout(() => {
      setActiveSelectType(null);
      setSelectedStudentIds([]);
      setCustomDutaInput('');
      setSaveMessage('');
    }, 400);
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

    // Auto-save immediately upon student selection
    if (newIds.length > 0) {
      const selectedNames = students
        .filter((s) => newIds.includes(s.id))
        .map((s) => s.namaLengkap);
      const finalDutaText = selectedNames.join(' & ');
      StorageService.saveClassAssignment(classInfo.namaKelas, classInfo.waliKelas, finalDutaText);
      setSaveMessage('Tersimpan otomatis!');
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div id="class-detail-printable-area" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-xl font-display shadow-2xs">
              {classInfo.namaKelas}
            </div>
            <div>
              <div className="flex items-center gap-2">
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

        {/* Modal Body */}
        <div className="p-5 md:p-6 space-y-5">
          {/* Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                Status Keamanan & Ramah Anak
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                Kelas <strong>{classInfo.namaKelas}</strong> telah memenuhi seluruh kriteria <strong>Zona Hijau Zero Bullying</strong> dengan tingkat kepatuhan <strong>{classInfo.skorKepatuhan}%</strong>. Seluruh siswa telah menandatangani ikrar anti-perundungan.
              </p>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Wali Kelas Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Wali Kelas</span>
                  <button
                    onClick={handleOpenWaliModal}
                    className="p-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors flex items-center gap-1 text-[10px] font-bold"
                    title="Pilih dari Master Data Guru"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Ubah</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1.5">
                  {classInfo.waliKelas}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">Data Guru Master SMPN 7</span>
            </div>

            {/* Duta Anti-Bullying Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Duta Anti-Bullying / Sahabat Sebaya</span>
                  <button
                    onClick={handleOpenDutaModal}
                    className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[10px] font-bold"
                    title="Pilih dari Master Data Siswa"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Ubah</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{classInfo.dutaAntiBullying}</span>
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">Data Siswa Master SMPN 7</span>
            </div>
          </div>

          {/* Ikrar & Slogan Kelas */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                Ikrar & Komitmen Damai Siswa
              </h4>
            </div>
            <p className="text-xs italic font-medium text-amber-800 dark:text-amber-300">
              &quot;{classInfo.ikrarSiswa}&quot;
            </p>
          </div>

          {/* Rekam Statistik Kasus Kelas */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Rekam Laporan & Penanganan Kasus</span>
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Verbal</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{classInfo.kasusVerbal}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Fisik</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{classInfo.kasusFisik}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Relasional</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{classInfo.kasusRelasional}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Siber</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{classInfo.kasusSiber}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between">
              <span>Status Penanganan:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {classInfo.kasusVerbal + classInfo.kasusFisik + classInfo.kasusRelasional + classInfo.kasusSiber === 0
                  ? '🟢 Zero Kasus (Kondusif)'
                  : `🟢 ${classInfo.kasusSelesai} Kasus Terselesaikan Damai`}
              </span>
            </p>
          </div>

          {/* Catatan Observasi & Pengamatan */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan Evaluasi Satgas & Guru BK</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {classInfo.catatanKegiatan}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Profil Kelas</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            Tutup
          </button>
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
              {/* Notification Banner */}
              {saveMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveMessage}</span>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    activeSelectType === 'wali'
                      ? 'Cari nama guru, NIP, atau mapel...'
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
                    <p className="text-center py-8 text-xs text-slate-400">Tidak ada data guru yang cocok.</p>
                  ) : (
                    filteredTeachers.map((teacher) => {
                      const isSelected = classInfo.waliKelas === teacher.namaLengkap;
                      return (
                        <div
                          key={teacher.id}
                          onClick={() => handleSelectWali(teacher)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{teacher.namaLengkap}</span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold flex items-center gap-1 border border-teal-300 dark:border-teal-700">
                                  <Check className="w-3 h-3 text-teal-600" />
                                  Tersimpan
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                              <span className="font-mono">NIP: {teacher.nip}</span>
                              <span>•</span>
                              <span>{teacher.jabatan}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
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
                  <div className="space-y-2 pr-1">
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
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
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
                                    Tersimpan
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                                NISN: {student.nisn}
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
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Atau ketik nama Duta secara manual (misal: Muhammad Arya & Nabila Putri):
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Siswa 1 & Nama Siswa 2"
                      value={customDutaInput}
                      onChange={(e) => setCustomDutaInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    ? `✓ ${selectedStudentIds.length} Siswa Terpilih & Tersimpan`
                    : 'Pilih siswa diatas'
                  : 'Klik nama guru untuk memilih'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSelectType(null);
                    setSaveMessage('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                {activeSelectType === 'duta' && (
                  <button
                    type="button"
                    onClick={handleSaveDutaSelection}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
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
