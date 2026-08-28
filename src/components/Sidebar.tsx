import React, { useState } from 'react';
import {
  Calendar,
  Coffee,
  Trees,
  Music,
  ShieldAlert,
  BookOpenCheck,
  LayoutDashboard,
  Search,
  Sparkles,
  Database,
  FileJson,
  X,
  Workflow,
  Users,
  GraduationCap,
  ChevronRight,
  UserCheck,
  PanelLeftClose,
  PanelLeft,
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
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  db,
  activeView,
  onSelectView,
  onOpenSupabaseModal,
  onOpenBackupModal,
  isOpen,
  onClose,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', 'Utama', 'Program', 'Master'];

  const menuSections = [
    {
      sectionTitle: 'Navigasi Utama',
      category: 'Utama',
      items: [
        {
          id: 'flowchart-intro',
          title: 'Bagan & Alur Tolak Ukur',
          tag: 'Panduan',
          category: 'Utama',
          subtitle: 'Struktur, Alur Tolak Ukur & SOP',
          icon: Workflow,
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
          activeBg: 'bg-indigo-600 text-white shadow-indigo-600/20',
          count: undefined,
        },
        {
          id: 'dashboard-overview',
          title: 'Dashboard Utama',
          tag: 'Ringkasan',
          category: 'Utama',
          subtitle: 'Hub Statistik & Matriks Kelas',
          icon: LayoutDashboard,
          color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
          activeBg: 'bg-blue-600 text-white shadow-blue-600/20',
          count: undefined,
        },
      ],
    },
    {
      sectionTitle: 'Program & Evaluasi Inovasi',
      category: 'Program',
      items: [
        {
          id: 'sabtu-teh-ceri',
          title: 'Sabtu Beli Teh Ceri',
          tag: 'Formulir',
          category: 'Program',
          subtitle: 'Sabtu Bersama Mengulik Temuan...',
          icon: Sparkles,
          color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
          activeBg: 'bg-amber-500 text-slate-950 shadow-amber-500/20',
          count: db.sabtuBeliTehCeri?.length || 0,
        },
        {
          id: 'kebun-berseri',
          title: 'Kebun Luas Berseri',
          tag: 'Formulir',
          category: 'Program',
          subtitle: 'Evaluasi Lingkungan & RTL',
          icon: Trees,
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
          activeBg: 'bg-emerald-600 text-white shadow-emerald-600/20',
          count: db.kebunLuasBerseri?.length || 0,
        },
        {
          id: 'senandung-serasi',
          title: 'Senandung Serasi',
          tag: 'Formulir',
          category: 'Program',
          subtitle: 'Salam & Pesan Mendukung',
          icon: Music,
          color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
          activeBg: 'bg-purple-600 text-white shadow-purple-600/20',
          count: db.senandungSerasi?.length || 0,
        },
        {
          id: 'piket-harian',
          title: 'Piket Harian',
          tag: 'Formulir',
          category: 'Program',
          subtitle: 'Administrasi Laporan Piket',
          icon: Calendar,
          color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
          activeBg: 'bg-sky-600 text-white shadow-sky-600/20',
          count: db.piketHarian?.length || 0,
        },
        {
          id: 'e-lapor',
          title: 'E-Lapor Perundungan',
          tag: 'Formulir',
          category: 'Program',
          subtitle: 'Pengaduan Cepat & BK',
          icon: ShieldAlert,
          color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
          activeBg: 'bg-rose-600 text-white shadow-rose-600/20',
          count: db.eLaporPerundungan?.length || 0,
        },
        {
          id: 'buku-tamu',
          title: 'Buku Tamu Digital',
          tag: 'Formulir',
          category: 'Program',
          subtitle: 'Pencatatan Tamu & Tanda Tangan',
          icon: BookOpenCheck,
          color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
          activeBg: 'bg-teal-600 text-white shadow-teal-600/20',
          count: db.bukuTamu?.length || 0,
        },
      ],
    },
    {
      sectionTitle: 'Master Data & Akademik',
      category: 'Master',
      items: [
        {
          id: 'master-siswa',
          title: 'Master Data Siswa',
          tag: 'Siswa',
          category: 'Master',
          subtitle: 'Database Siswa & Import Excel',
          icon: Users,
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
          activeBg: 'bg-indigo-600 text-white shadow-indigo-600/20',
          count: db.masterSiswa?.length || 0,
        },
        {
          id: 'master-guru',
          title: 'Master Data Guru',
          tag: 'Pendidik',
          category: 'Master',
          subtitle: 'Database Guru & Import Excel',
          icon: GraduationCap,
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
          activeBg: 'bg-emerald-600 text-white shadow-emerald-600/20',
          count: db.masterGuru?.length || 0,
        },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    onSelectView(id);
    // On small screens, close the menu overlay automatically
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* Main Collapsible Sidebar */}
      <aside
        className={`fixed top-0 lg:top-16 left-0 bottom-0 z-50 w-72 md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header inside Drawer / Sidebar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Circular Logo */}
              <div className="w-9 h-9 rounded-full p-0.5 border-2 border-emerald-400 bg-white shadow-xs flex items-center justify-center shrink-0">
                <img
                  src="https://i.ibb.co.com/pBbfS44d/LOGO-PASS-TEMENAN.jpg"
                  alt="Logo Pass Temenan"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="truncate">
                <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white font-display tracking-tight uppercase truncate">
                  Menu Aplikasi
                </h2>
                <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                  E-PASS TEMENAN SPANJU
                </p>
              </div>
            </div>

            {/* Hide / Collapse Sidebar Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Sembunyikan Menu (Bebaskan Layar)"
            >
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
              <span className="text-[11px] hidden sm:inline">Tutup</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu / formulir..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Menu Cards Grouped Neatly */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {menuSections.map((sec, secIdx) => {
            const visibleItems = sec.items.filter((item) => {
              const matchesCat =
                activeCategory === 'Semua' ||
                item.category.toLowerCase() === activeCategory.toLowerCase();
              const matchesSearch =
                !searchQuery.trim() ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tag.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesCat && matchesSearch;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={secIdx} className="space-y-1.5">
                <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {sec.sectionTitle}
                </div>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-xs ring-1 ring-indigo-400/30'
                            : 'bg-white dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                              isActive ? item.activeBg : item.color
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isActive
                                    ? 'text-indigo-900 dark:text-white font-extrabold'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {item.title}
                              </span>
                              {item.count !== undefined && item.count > 0 && (
                                <span
                                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                                    isActive
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {item.count}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5'
                              : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Quick Tools */}
        <div className="p-3 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/95 space-y-2 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => {
                onOpenBackupModal();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex-1 py-2 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Backup & Restore Data JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-cyan-600" />
              <span>Backup Data</span>
            </button>
            <button
              onClick={() => {
                onOpenSupabaseModal();
                if (window.innerWidth < 1024) onClose();
              }}
              className="py-2 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Konfigurasi Database Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
