import React, { useState } from 'react';
import {
  Youtube,
  Phone,
  BookOpen,
  ShieldAlert,
  LayoutDashboard,
  BookOpenCheck,
  Calendar,
  Coffee,
  Trees,
  GraduationCap,
  Users,
  Music,
  ExternalLink,
  Workflow,
  Search,
  X,
  ArrowRight,
} from 'lucide-react';

interface PilihanMenuPortalProps {
  onNavigate: (viewKey: string, tab?: string) => void;
  onOpenManualBook: () => void;
  onOpenHotline: () => void;
  onOpenBackupModal?: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenExitModal?: () => void;
  onBackToBagan?: () => void;
}

export const PilihanMenuPortal: React.FC<PilihanMenuPortalProps> = ({
  onNavigate,
  onOpenManualBook,
  onOpenHotline,
  onOpenBackupModal,
  onOpenSupabaseModal,
  onOpenExitModal,
  onBackToBagan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'semua' | 'prioritas' | 'inovasi' | 'master'>('semua');

  // Daftar kartu aplikasi yang disesuaikan persis dengan contoh terlampir
  const appCards = [
    // --- Baris 1: Sesuai Screenshot ---
    {
      id: 'tutorial-manual-book',
      title: 'TUTORIAL MANUAL BOOK',
      fullTitle: 'TUTORIAL MANUAL BOOK',
      subtitle: 'BUKU PANDUAN FLIPBOOK HEYZINE',
      category: 'prioritas',
      icon: BookOpen,
      iconGradient: 'from-[#f43f5e] via-[#e11d48] to-[#be123c] shadow-rose-500/30',
      action: () => onOpenManualBook(),
    },
    {
      id: 'hotline',
      title: 'HOTLINE',
      fullTitle: 'HOTLINE & BANTUAN SPANJU',
      subtitle: 'LAYANAN BANTUAN & PENGADUAN',
      category: 'prioritas',
      icon: Phone,
      iconGradient: 'from-[#ea580c] via-[#f97316] to-[#fb923c] shadow-orange-500/30',
      action: () => onOpenHotline(),
    },


    // --- Baris 2: Modul Utama & Inovasi SAHABAT SPANJU ---
    {
      id: 'e-lapor',
      title: 'E-LAPOR',
      fullTitle: 'E-LAPOR PERUNDUNGAN',
      subtitle: 'PENGADUAN SATGAS BK & BULLYING',
      category: 'prioritas',
      icon: ShieldAlert,
      iconGradient: 'from-[#e11d48] via-[#f43f5e] to-[#fb7185] shadow-rose-500/30',
      action: () => onNavigate('e-lapor', 'form'),
    },
    {
      id: 'dashboard-overview',
      title: 'DASHBOARD',
      fullTitle: 'DASHBOARD UTAMA SPANJU',
      subtitle: 'HUB STATISTIK & MATRIKS KELAS',
      category: 'prioritas',
      icon: LayoutDashboard,
      iconGradient: 'from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] shadow-blue-500/30',
      action: () => onNavigate('dashboard-overview'),
    },
    {
      id: 'buku-tamu',
      title: 'BUKU TAMU',
      fullTitle: 'BUKU TAMU DIGITAL',
      subtitle: 'PENCATATAN TAMU & TTD DIGITAL',
      category: 'inovasi',
      icon: BookOpenCheck,
      iconGradient: 'from-[#0f766e] via-[#0d9488] to-[#14b8a6] shadow-teal-500/30',
      action: () => onNavigate('buku-tamu', 'form'),
    },
    {
      id: 'piket-harian',
      title: 'PIKET HARIAN',
      fullTitle: 'MONITORING PIKET HARIAN',
      subtitle: 'MONITORING KETERTIBAN & SISWA',
      category: 'inovasi',
      icon: Calendar,
      iconGradient: 'from-[#0369a1] via-[#0284c7] to-[#38bdf8] shadow-sky-500/30',
      action: () => onNavigate('piket-harian', 'form'),
    },

    // --- Baris 3: Inovasi Karakter & Lingkungan SMPN 7 ---
    {
      id: 'sabtu-teh-ceri',
      title: 'SABTU TEH CERI',
      fullTitle: 'SABTU BELI TEH CERI',
      subtitle: 'REFLEKSI & PEMBIASAAN AKHLAK',
      category: 'inovasi',
      icon: Coffee,
      iconGradient: 'from-[#b45309] via-[#d97706] to-[#f59e0b] shadow-amber-500/30',
      action: () => onNavigate('sabtu-teh-ceri', 'form'),
    },
    {
      id: 'kebun-berseri',
      title: 'KEBUN BERSERI',
      fullTitle: 'KEBUN LUAS BERSERI',
      subtitle: 'AKSI LINGKUNGAN HIJAU & ASRI',
      category: 'inovasi',
      icon: Trees,
      iconGradient: 'from-[#047857] via-[#059669] to-[#10b981] shadow-emerald-500/30',
      action: () => onNavigate('kebun-berseri', 'form'),
    },

    // --- Baris 4: Layanan Siswa, Budaya & Pembinaan ---
    {
      id: 'senandung-serasi',
      title: 'SENANDUNG...',
      fullTitle: 'SENANDUNG SERASI',
      subtitle: 'KARYA LITERASI, PUISI & SENI',
      category: 'inovasi',
      icon: Music,
      iconGradient: 'from-[#4c1d95] via-[#5b21b6] to-[#7c3aed] shadow-purple-500/30',
      action: () => onNavigate('senandung-serasi', 'form'),
    },

    // --- Baris 6: Edukasi & Dokumen Alur ---
    {
      id: 'media-edukasi',
      title: 'MEDIA EDUKASI',
      fullTitle: 'MEDIA EDUKASI DIGITAL',
      subtitle: 'POSTER, VIDEO & MATERI LITERASI',
      category: 'prioritas',
      icon: BookOpen,
      iconGradient: 'from-[#0e7490] via-[#0891b2] to-[#06b6d4] shadow-cyan-500/30',
      action: () => onNavigate('media-edukasi'),
    },
    {
      id: 'bagan-tolak-ukur',
      title: 'BAGAN ALUR',
      fullTitle: 'BAGAN & TOLAK UKUR KEKERASAN',
      subtitle: 'TOLAK UKUR & ALUR PENANGANAN',
      category: 'prioritas',
      icon: Workflow,
      iconGradient: 'from-[#312e81] via-[#3730a3] to-[#4f46e5] shadow-indigo-500/30',
      action: () => {
        if (onBackToBagan) onBackToBagan();
        else onNavigate('flowchart-intro');
      },
    },
    {
      id: 'master-guru-direktori',
      title: 'MASTER GURU',
      fullTitle: 'MASTER DATA GURU & PEGAWAI',
      subtitle: 'DIREKTORI PENDIDIK & TENAGA',
      category: 'master',
      icon: GraduationCap,
      iconGradient: 'from-[#1e40af] via-[#1d4ed8] to-[#2563eb] shadow-blue-500/30',
      action: () => onNavigate('master-guru'),
    },
    {
      id: 'master-siswa-direktori',
      title: 'MASTER DATA SISWA',
      fullTitle: 'MASTER DATA SISWA',
      subtitle: 'DATABASE SISWA & IMPORT EXCEL',
      category: 'master',
      icon: Users,
      iconGradient: 'from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] shadow-sky-500/30',
      action: () => onNavigate('master-siswa'),
    },
  ];

  const filteredCards = appCards.filter((card) => {
    const matchesSearch =
      !searchQuery.trim() ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.fullTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'semua' || card.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-14">
      {/* Top Header Card - Mengikuti estetika modern canvas lembut */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-7 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider shadow-xs">
              MENU APLIKASI
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              SIAP SPANJU &bull; SMPN 7 PASURUAN
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
            Daftar Semua Menu Aplikasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Pilih modul atau inovasi di bawah ini dengan mengklik tombol <span className="font-bold text-slate-700 dark:text-slate-200">Buka Aplikasi</span> pada kartu yang diinginkan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onBackToBagan && (
            <button
              onClick={onBackToBagan}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Workflow className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Bagan & Tolak Ukur</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('dashboard-overview')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Utama</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: 'semua', label: 'Semua Aplikasi' },
            { key: 'prioritas', label: 'Layanan Prioritas' },
            { key: 'inovasi', label: 'Inovasi Karakter' },
            { key: 'master', label: 'Master & Setup' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aplikasi..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9.5 pr-8 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Kartu Aplikasi - Tampil Persis Seperti Contoh Terlampir */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredCards.map((card) => {
          const CardIcon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center justify-between transition-all duration-200 transform hover:-translate-y-1.5 group"
            >
              {/* Icon Squircle Besar */}
              <div
                className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr ${card.iconGradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-200 cursor-pointer`}
                onClick={card.action}
                title={`Buka ${card.fullTitle}`}
              >
                <CardIcon className="w-9 h-9 stroke-[2.2]" />
              </div>

              {/* Title & Subtitle */}
              <div className="mt-4.5 w-full">
                <h3
                  className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider line-clamp-2 min-h-[2.5rem] flex items-center justify-center text-center px-1"
                  title={card.fullTitle}
                >
                  {card.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase mt-1 line-clamp-2 h-8 flex items-center justify-center px-1">
                  {card.subtitle}
                </p>
              </div>

              {/* Tombol Buka Aplikasi */}
              <button
                onClick={card.action}
                className="mt-5 w-full max-w-[170px] py-2.5 px-4 rounded-xl bg-[#f8fafc] dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 text-xs font-black flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all group-hover:border-slate-300 dark:group-hover:border-slate-600 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                <span>Buka Aplikasi</span>
              </button>
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Tidak ada menu aplikasi yang cocok dengan pencarian "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('semua');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
};
