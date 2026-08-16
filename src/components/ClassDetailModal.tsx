import React from 'react';
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
} from 'lucide-react';
import { ClassZoneInfo } from '../data/classZoneData';
import { triggerPrintElement } from '../utils/exportUtils';

interface ClassDetailModalProps {
  classInfo: ClassZoneInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  classInfo,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !classInfo) return null;

  const handlePrint = () => {
    triggerPrintElement('class-detail-printable-area', `Profil Kelas ${classInfo.namaKelas}`);
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
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Wali Kelas</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {classInfo.waliKelas}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Duta Anti-Bullying / Sahabat Sebaya</span>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{classInfo.dutaAntiBullying}</span>
              </p>
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
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
