import React, { useState } from 'react';
import {
  Calendar,
  Coffee,
  Trees,
  Music,
  ShieldAlert,
  BookOpenCheck,
  Globe,
  Plus,
  Edit2,
  Trash2,
  LayoutDashboard,
  Search,
  ExternalLink,
  Pin,
  Sparkles,
  Database,
  FileJson,
  X,
  Workflow,
  Users,
  GraduationCap,
} from 'lucide-react';
import { AppDatabase, CustomLink } from '../types';

interface SidebarProps {
  db: AppDatabase;
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenLinkModal?: (editing?: CustomLink) => void;
  onDeleteLink?: (id: string) => void;
  onOpenSupabaseModal: () => void;
  onOpenBackupModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  db,
  activeView,
  onSelectView,
  onOpenSupabaseModal,
  onOpenBackupModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', 'Utama', 'Administrasi', 'Akademik'];

  const coreMenus = [
    {
      id: 'flowchart-intro',
      title: 'BAGAN & ALUR TOLAK UKUR',
      tag: 'PANDUAN',
      category: 'Utama',
      subtitle: 'Bagan Struktur, Alur Penilaian & Respon...',
      icon: Workflow,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
      activeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'piket-harian',
      title: 'PIKET HARIAN',
      tag: 'SMPN 7',
      category: 'Administrasi',
      subtitle: 'Administrasi Program E-Pass...',
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
      activeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'sabtu-teh-ceri',
      title: 'SABTU BELI TEH CERI',
      tag: 'INOVASI',
      category: 'Utama',
      subtitle: 'Sabtu Bersama Mengulik Temuan...',
      icon: Sparkles,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      activeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'kebun-berseri',
      title: 'KEBUN LUAS BERSERI',
      tag: 'BULANAN',
      category: 'Utama',
      subtitle: 'Kegiatan Bulanan Evaluasi,...',
      icon: Trees,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      activeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'senandung-serasi',
      title: 'SENANDUNG SERASI',
      tag: 'PESAN',
      category: 'Akademik',
      subtitle: 'Salam dan Pesan Mendukung...',
      icon: Music,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
      activeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'e-lapor',
      title: 'E-LAPOR PERUNDUNGAN',
      tag: 'DARURAT',
      category: 'Utama',
      subtitle: 'Pelaporan & Pengaduan Kasus...',
      icon: ShieldAlert,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
      activeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'buku-tamu',
      title: 'BUKU TAMU DIGITAL',
      tag: 'LAYANAN',
      category: 'Administrasi',
      subtitle: 'Buku Tamu & Tanda Tangan...',
      icon: BookOpenCheck,
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800',
      activeColor: 'bg-cyan-600 text-white',
    },
    {
      id: 'master-siswa',
      title: 'MASTER DATA SISWA',
      tag: 'AKADEMIK',
      category: 'Akademik',
      subtitle: 'Upload Excel, Edit & Hapus Siswa...',
      icon: Users,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800',
      activeColor: 'bg-teal-600 text-white',
    },
    {
      id: 'master-guru',
      title: 'MASTER DATA GURU',
      tag: 'PENDIDIK',
      category: 'Akademik',
      subtitle: 'Upload Excel, Edit & Hapus Guru...',
      icon: GraduationCap,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      activeColor: 'bg-emerald-600 text-white',
    },
  ];

  // Filtering
  const filteredCoreMenus = coreMenus.filter((m) => {
    const matchesCat =
      activeCategory === 'Semua' ||
      m.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 z-50 w-72 md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Circular Logo with Glow */}
              <div className="w-11 h-11 rounded-full p-0.5 border-2 border-emerald-400 bg-white shadow-md flex items-center justify-center shrink-0">
                <img
                  src="https://i.ibb.co.com/pBbfS44d/LOGO-PASS-TEMENAN.jpg"
                  alt="Logo Pass Temenan"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white font-display tracking-tight uppercase">
                  MENU APLIKASI
                </h2>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Pass Temenan & Portal
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu aplikasi..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Menu Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
          {/* Dashboard Overview button */}
          <button
            onClick={() => {
              onSelectView('dashboard-overview');
              onCloseMobile();
            }}
            className={`w-full p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
              activeView === 'dashboard-overview'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeView === 'dashboard-overview'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    DASHBOARD UTAMA
                  </span>
                  <Pin className="w-3 h-3 text-amber-500 shrink-0" />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                  Ringkasan & Hub Informasi
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
          </button>

          {/* Core App Menus */}
          {filteredCoreMenus.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                  isActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-400/50'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isActive ? item.activeColor : item.color
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white truncate font-display">
                        {item.title}
                      </span>
                      <Pin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {item.tag}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 ml-1" />
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 space-y-2 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={onOpenBackupModal}
              className="flex-1 py-2 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              title="Backup & Restore Database"
            >
              <FileJson className="w-3.5 h-3.5 text-cyan-600" />
              <span>Backup & Restore Data</span>
            </button>
            <button
              onClick={onOpenSupabaseModal}
              className="py-2 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              title="Konfigurasi Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
