import React, { useState } from 'react';
import {
  Calendar,
  Coffee,
  Trees,
  Music,
  ShieldAlert,
  BookOpenCheck,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Users,
  GraduationCap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { AppDatabase } from '../types';
import { RencanaInovasiModal } from './RencanaInovasiModal';
import { BullyingTrendChart } from './BullyingTrendChart';
import { ClassGreenZoneMatrix } from './ClassGreenZoneMatrix';

interface DashboardOverviewProps {
  db: AppDatabase;
  onNavigate: (viewKey: string) => void;
  onOpenLinkModal?: () => void;
  onOpenSupabaseModal: () => void;
  onOpenBackupModal: () => void;
  onRefresh?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  db,
  onNavigate,
  onRefresh,
}) => {
  const [isInovasiModalOpen, setIsInovasiModalOpen] = useState(false);

  const stats = [
    {
      title: 'Sabtu Beli Teh Ceri',
      count: db.sabtuBeliTehCeri?.length || 0,
      icon: Sparkles,
      tag: 'Inovasi',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40',
      target: 'sabtu-teh-ceri',
    },
    {
      title: 'Kebun Luas Berseri',
      count: db.kebunLuasBerseri?.length || 0,
      icon: Trees,
      tag: 'Bulanan',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40',
      target: 'kebun-berseri',
    },
    {
      title: 'Senandung Serasi',
      count: db.senandungSerasi?.length || 0,
      icon: Music,
      tag: 'Literasi',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40',
      target: 'senandung-serasi',
    },
    {
      title: 'Piket Harian',
      count: db.piketHarian?.length || 0,
      icon: Calendar,
      tag: 'Rutin',
      textColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40',
      target: 'piket-harian',
    },
    {
      title: 'E-Lapor Perundungan',
      count: db.eLaporPerundungan?.length || 0,
      icon: ShieldAlert,
      tag: 'Darurat',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40',
      target: 'e-lapor',
    },
    {
      title: 'Buku Tamu Digital',
      count: db.bukuTamu?.length || 0,
      icon: BookOpenCheck,
      tag: 'Layanan',
      textColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/40',
      target: 'buku-tamu',
    },
    {
      title: 'Master Siswa',
      count: db.masterSiswa?.length || 0,
      icon: Users,
      tag: 'Siswa',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40',
      target: 'master-siswa',
    },
    {
      title: 'Master Guru',
      count: db.masterGuru?.length || 0,
      icon: GraduationCap,
      tag: 'Guru',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40',
      target: 'master-guru',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* 1. Quick Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ringkasan Data & Administrasi
          </h2>
          <span className="text-[11px] text-slate-400">
            Klik kartu untuk membuka menu
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(st.target)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm ${st.bgColor} group cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs ${st.textColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {st.tag}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                  {st.count}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                    {st.title}
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">
              Pusat Data & Evaluasi Ramah Anak SPANJU
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Integrasi Real-time: Grafik Tren Bulanan • 24 Kelas Zona Hijau No Bullying
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Sinkronkan data dengan Supabase untuk menyamakan tampilan HP & Laptop"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkron Cloud</span>
            </button>
          )}

          <button
            onClick={() => setIsInovasiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Bank Rencana Inovasi</span>
          </button>
        </div>
      </div>

      {/* 2. GRAFIK TREN PENINGKATAN & PENURUNAN KASUS */}
      <BullyingTrendChart db={db} />

      {/* 3. ZONA HIJAU NO BULLYING & KEKERASAN DI SETIAP KELAS */}
      <ClassGreenZoneMatrix db={db} onRefresh={onRefresh} />

      {/* Rencana Inovasi Popup Modal */}
      <RencanaInovasiModal
        isOpen={isInovasiModalOpen}
        onClose={() => setIsInovasiModalOpen(false)}
        onSelect={(formattedText) => {
          navigator.clipboard.writeText(formattedText);
          alert(
            'Template rencana inovasi telah disalin ke clipboard! Anda dapat menempelkannya di formulir Sabtu Beli Teh Ceri atau Kebun Luas Berseri.'
          );
        }}
        targetFieldName="Koleksi Rencana Inovasi"
      />
    </div>
  );
};
