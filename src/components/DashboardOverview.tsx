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
  TrendingDown,
  Table,
  Sparkles,
  Award,
  RefreshCw,
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
  onOpenSupabaseModal,
  onOpenBackupModal,
  onRefresh,
}) => {
  const [isInovasiModalOpen, setIsInovasiModalOpen] = useState(false);

  const stats = [
    {
      title: 'Piket Harian',
      count: db.piketHarian.length,
      icon: Calendar,
      tag: 'SMPN 7',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50',
      target: 'piket-harian',
    },
    {
      title: 'Sabtu Beli Teh Ceri',
      count: db.sabtuBeliTehCeri.length,
      icon: Coffee,
      tag: 'INOVASI',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
      target: 'sabtu-teh-ceri',
    },
    {
      title: 'Kebun Luas Berseri',
      count: db.kebunLuasBerseri.length,
      icon: Trees,
      tag: 'BULANAN',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
      target: 'kebun-berseri',
    },
    {
      title: 'Senandung Serasi',
      count: db.senandungSerasi.length,
      icon: Music,
      tag: 'PESAN',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50',
      target: 'senandung-serasi',
    },
    {
      title: 'E-Lapor Perundungan',
      count: db.eLaporPerundungan.length,
      icon: ShieldAlert,
      tag: 'DARURAT',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
      target: 'e-lapor',
    },
    {
      title: 'Buku Tamu Digital',
      count: db.bukuTamu.length,
      icon: BookOpenCheck,
      tag: 'LAYANAN',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/50',
      target: 'buku-tamu',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Quick Stats Grid - Ringkasan Administrasi Program */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(st.target)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${st.bgColor} group`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${st.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {st.tag}
                </span>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                {st.count}
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate mt-0.5">
                {st.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Action Bar with Quick Shortcuts & Bank Rencana Inovasi */}
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
              Integrasi Real-time: Grafik Tren Bulanan • 24 Kelas Zona Hijau
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Sinkronkan data dengan Supabase untuk menyamakan tampilan HP & Laptop"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkron HP & Laptop</span>
            </button>
          )}

          <button
            onClick={() => setIsInovasiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Bank Rencana Inovasi</span>
          </button>
        </div>
      </div>

      {/* 2. GRAFIK TREN PENINGKATAN & PENURUNAN KASUS (BULLYING & KEKERASAN) */}
      <BullyingTrendChart db={db} />

      {/* 3. ZONA HIJAU NO BULLYING & KEKERASAN DI SETIAP KELAS (7A - 7H, 8A - 8H, 9A - 9H) */}
      <ClassGreenZoneMatrix db={db} onRefresh={onRefresh} />

      {/* Rencana Inovasi Popup Modal */}
      <RencanaInovasiModal
        isOpen={isInovasiModalOpen}
        onClose={() => setIsInovasiModalOpen(false)}
        onSelect={(formattedText) => {
          navigator.clipboard.writeText(formattedText);
          alert('Template rencana inovasi telah disalin ke clipboard! Anda dapat menempelkannya di formulir Sabtu Beli Teh Ceri atau Kebun Luas Berseri.');
        }}
        targetFieldName="Koleksi Rencana Inovasi"
      />
    </div>
  );
};

