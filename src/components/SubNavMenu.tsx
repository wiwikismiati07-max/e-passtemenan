import React, { useState } from 'react';
import {
  Menu,
  Eye,
  EyeOff,
  Plus,
  FileText,
  BarChart3,
  Sparkles,
  ShieldAlert,
  Coffee,
  Trees,
  Music,
  Calendar,
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppDatabase } from '../types';

interface SubNavMenuProps {
  db: AppDatabase;
  activeView: string;
  activeTab?: 'form' | 'rekap' | 'statistik';
  onNavigate: (viewKey: string, tab?: 'form' | 'rekap' | 'statistik') => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const SubNavMenu: React.FC<SubNavMenuProps> = ({
  db,
  activeView,
  activeTab = 'form',
  onNavigate,
  isOpen,
  onToggleOpen,
}) => {
  const groups = [
    {
      id: 'e-lapor',
      title: 'PENANGANAN KEKERASAN',
      color: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      activeBg: 'bg-purple-600 text-white',
      count: db.eLaporPerundungan.length,
      formLabel: 'Form Input Laporan',
      formIcon: Plus,
    },
    {
      id: 'sabtu-teh-ceri',
      title: 'BELI TEH CERI',
      color: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      activeBg: 'bg-emerald-600 text-white',
      count: db.sabtuBeliTehCeri.length,
      formLabel: 'Form Beli Teh Ceri',
      formIcon: Sparkles,
    },
    {
      id: 'kebun-berseri',
      title: 'KEBUN LUAS BERSERI',
      color: 'text-teal-600 dark:text-teal-400',
      borderColor: 'border-teal-200 dark:border-teal-800',
      activeBg: 'bg-teal-600 text-white',
      count: db.kebunLuasBerseri.length,
      formLabel: 'Form Kebun Luas Berseri',
      formIcon: Trees,
    },
    {
      id: 'senandung-serasi',
      title: 'SENANDUNG SERASI',
      color: 'text-pink-600 dark:text-pink-400',
      borderColor: 'border-pink-200 dark:border-pink-800',
      activeBg: 'bg-pink-600 text-white',
      count: db.senandungSerasi.length,
      formLabel: 'Form Senandung Serasi',
      formIcon: Music,
    },
    {
      id: 'piket-harian',
      title: 'PIKET HARIAN',
      color: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      activeBg: 'bg-blue-600 text-white',
      count: db.piketHarian.length,
      formLabel: 'Form Piket Harian',
      formIcon: Calendar,
    },
    {
      id: 'buku-tamu',
      title: 'BUKU TAMU DIGITAL',
      color: 'text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      activeBg: 'bg-cyan-600 text-white',
      count: db.bukuTamu.length,
      formLabel: 'Form Buku Tamu',
      formIcon: BookOpenCheck,
    },
  ];

  if (!isOpen) {
    return (
      <div className="shrink-0">
        <button
          onClick={onToggleOpen}
          className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-pink-500 text-white flex items-center justify-center">
            <Menu className="w-3.5 h-3.5" />
          </div>
          <span>Tampilkan Menu Aplikasi</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-72 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 shrink-0 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-md">
            <Menu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white font-display uppercase tracking-tight">
              Menu Aplikasi
            </h3>
            <p className="text-[10px] text-slate-400">Pilih layanan di bawah</p>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
          title="Sembunyikan Menu"
        >
          <EyeOff className="w-3 h-3" />
          <span>Sembunyikan</span>
        </button>
      </div>

      {/* Categories / Sections */}
      <div className="space-y-4">
        {groups.map((grp) => {
          const isCurrentModule = activeView === grp.id;
          const FormIcon = grp.formIcon;

          return (
            <div key={grp.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold tracking-wider uppercase ${grp.color}`}
                >
                  {grp.title}
                </span>
                {grp.count > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {grp.count}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {/* 1. Form Input Button */}
                <button
                  onClick={() => onNavigate(grp.id, 'form')}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-all ${
                    isCurrentModule && activeTab === 'form'
                      ? `${grp.activeBg} shadow-sm`
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FormIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{grp.formLabel}</span>
                  </div>
                </button>

                {/* 2. Rekapitulasi Data Button */}
                <button
                  onClick={() => onNavigate(grp.id, 'rekap')}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all ${
                    isCurrentModule && activeTab === 'rekap'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Rekapitulasi Data</span>
                  </div>
                  {grp.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isCurrentModule && activeTab === 'rekap'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {grp.count}
                    </span>
                  )}
                </button>

                {/* 3. Ringkasan Statistik Button */}
                <button
                  onClick={() => onNavigate(grp.id, 'statistik')}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all ${
                    isCurrentModule && activeTab === 'statistik'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Ringkasan Statistik</span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
