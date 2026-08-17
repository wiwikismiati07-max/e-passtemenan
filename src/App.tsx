/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sparkles,
  Cloud,
  FileJson,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Globe,
  LayoutDashboard,
  Calendar,
  Coffee,
  Trees,
  Music,
  ShieldAlert,
  BookOpenCheck,
  Download,
  Moon,
  Sun,
  Database,
  CheckCircle2,
  Share2,
  Clock,
  LogOut,
  GraduationCap,
  UserCog,
  UserCheck,
} from 'lucide-react';
import { getRealtimeFullFormattedDate, getRealtimeTimeStringWithSeconds } from './utils/dateUtils';
import { AppDatabase, CustomLink } from './types';
import { StorageService } from './services/storage';
import { Sidebar } from './components/Sidebar';
import { SubNavMenu } from './components/SubNavMenu';
import { DashboardOverview } from './components/DashboardOverview';
import { PiketHarianForm } from './components/PiketHarianForm';
import { SabtuBeliTehCeriForm } from './components/SabtuBeliTehCeriForm';
import { KebunLuasBerseriForm } from './components/KebunLuasBerseriForm';
import { SenandungSerasiForm } from './components/SenandungSerasiForm';
import { ELaporPerundunganForm } from './components/ELaporPerundunganForm';
import { BukuTamuForm } from './components/BukuTamuForm';
import { WebEmbedViewer } from './components/WebEmbedViewer';
import { LinkManagerModal } from './components/LinkManagerModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { PejabatSettingsModal } from './components/PejabatSettingsModal';
import { FlowchartIntroLanding } from './components/FlowchartIntroLanding';
import { MasterSiswaView } from './components/MasterSiswaView';
import { MasterGuruView } from './components/MasterGuruView';
import { LoginScreen, UserSession } from './components/LoginScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem('pass_temenan_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [db, setDb] = useState<AppDatabase>(StorageService.getDb());
  const [activeView, setActiveView] = useState<string>('flowchart-intro');
  const [activeTab, setActiveTab] = useState<'form' | 'rekap' | 'statistik'>('form');
  const [isSubNavOpen, setIsSubNavOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<CustomLink | undefined>(undefined);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isPejabatModalOpen, setIsPejabatModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Realtime clock state
  const [realtimeClock, setRealtimeClock] = useState(getRealtimeTimeStringWithSeconds());
  const [realtimeDate, setRealtimeDate] = useState(getRealtimeFullFormattedDate());

  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimeClock(getRealtimeTimeStringWithSeconds());
      setRealtimeDate(getRealtimeFullFormattedDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshDb = () => {
    setDb({ ...StorageService.getDb() });
  };

  useEffect(() => {
    refreshDb();
    const handleDbChange = () => {
      refreshDb();
    };
    window.addEventListener('pass-temenan-db-updated', handleDbChange);
    return () => window.removeEventListener('pass-temenan-db-updated', handleDbChange);
  }, []);

  // Sync dark mode class with root html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    sessionStorage.setItem('pass_temenan_user_session', JSON.stringify(session));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('pass_temenan_user_session');
  };

  const handleOpenAddLink = (linkToEdit?: CustomLink) => {
    setEditingLink(linkToEdit);
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = (linkData: Partial<CustomLink>) => {
    StorageService.saveLink(linkData);
    refreshDb();
  };

  const handleDeleteLink = (id: string) => {
    StorageService.deleteLink(id);
    if (activeView === id) {
      setActiveView('dashboard-overview');
    }
    refreshDb();
  };

  const handleManualSync = async () => {
    if (!db.supabaseConfig.isConnected) {
      setIsSupabaseModalOpen(true);
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg('Sinkronisasi Supabase...');
    const res = await StorageService.syncToSupabase();
    setIsSyncing(false);
    if (res.success) {
      setSyncStatusMsg('Supabase Sync Sukses!');
      setTimeout(() => setSyncStatusMsg(''), 3000);
    } else {
      setSyncStatusMsg(`Gagal: ${res.message}`);
      setTimeout(() => setSyncStatusMsg(''), 4000);
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        'PANDUAN INSTALASI APLIKASI E-PASS TEMENAN SPANJU:\n\n' +
        '💻 DI LAPTOP / KOMPUTER (Chrome / Edge):\n' +
        '- Klik ikon Pasang (ikon monitor/panah di sebelah kanan bilah alamat URL browser).\n' +
        '- Atau klik ikon titik tiga (Menu) di pojok kanan atas browser, lalu pilih "Install E-Pass Temenan SPAnju...".\n\n' +
        '📱 DI HP ANDROID (Chrome):\n' +
        '- Ketuk ikon titik tiga di pojok kanan atas browser.\n' +
        '- Pilih opsi "Tambahkan ke Layar Utama" (Add to Home screen) atau "Install Aplikasi".\n\n' +
        '🍏 DI iPHONE / IPAD (Safari):\n' +
        '- Ketuk tombol Bagikan (Share) di bawah layar.\n' +
        '- Pilih "Tambahkan ke Layar Utama".\n\n' +
        'Aplikasi akan terpasang di perangkat Anda dan dapat diakses layaknya aplikasi native!'
      );
    }
  };

  // Find active custom link if selected
  const activeCustomLink = db.customLinks.find((l) => l.id === activeView);

  const getActiveViewDisplayTitle = () => {
    switch (activeView) {
      case 'flowchart-intro':
        return 'BAGAN & ALUR TOLAK UKUR';
      case 'dashboard-overview':
        return 'DASHBOARD UTAMA';
      case 'piket-harian':
        return 'PIKET HARIAN';
      case 'sabtu-teh-ceri':
        return 'SABTU BELI TEH CERI';
      case 'kebun-berseri':
        return 'KEBUN LUAS BERSERI';
      case 'senandung-serasi':
        return 'SENANDUNG SERASI';
      case 'e-lapor':
        return 'E-LAPOR PERUNDUNGAN';
      case 'buku-tamu':
        return 'BUKU TAMU DIGITAL';
      default:
        return activeCustomLink ? activeCustomLink.title.toUpperCase() : 'APLIKASI TERPILIH';
    }
  };

  const handleNavigate = (viewKey: string, tab: 'form' | 'rekap' | 'statistik' = 'form') => {
    setActiveView(viewKey);
    setActiveTab(tab);
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-slate-50 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-pink-400 selection:text-slate-900 font-sans transition-colors duration-200">
      {/* 1. TOP NAVBAR (Matching image screenshot header) */}
      <header className="sticky top-2 z-30 mx-2 sm:mx-4 mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 rounded-2xl flex items-center justify-between shadow-sm transition-colors">
        {/* Left branding */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 lg:hidden"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveView('dashboard-overview')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            {/* Circular Logo */}
            <div className="w-9 h-9 rounded-full p-0.5 border-2 border-emerald-400 bg-white shadow-sm flex items-center justify-center shrink-0">
              <img
                src="https://i.ibb.co.com/pBbfS44d/LOGO-PASS-TEMENAN.jpg"
                alt="Logo Pass Temenan"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white font-display tracking-tight uppercase">
                SPANJU DASHBOARD
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                SMPN 7 Pasuruan
              </span>
            </div>
          </div>
        </div>

        {/* Center active pill & Realtime clock */}
        <div className="hidden lg:flex items-center justify-center gap-2">
          <div className="px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Aktif:</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold uppercase">
              {getActiveViewDisplayTitle()}
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs animate-pulse">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden xl:inline">{realtimeDate} •</span>
            <span className="font-mono font-extrabold">{realtimeClock}</span>
          </div>
        </div>

        {/* Right action tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Pejabat & TTD Settings Pill */}
          <button
            onClick={() => setIsPejabatModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Pengaturan Guru Pendamping & Kepala Sekolah"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="hidden md:inline">Pejabat & BK</span>
          </button>

          {/* Instal App Button */}
          <button
            onClick={handleInstallApp}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20"
            title="Instal Aplikasi PWA"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Instal</span>
          </button>

          {/* Supabase Status Pill */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Konfigurasi & Status Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden lg:inline">
              {db.supabaseConfig.isConnected ? 'Supabase Online' : 'Supabase Setup'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Session Badge & Logout Button */}
          <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
            <div
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-2xs ${
                currentUser.role === 'admin'
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
              }`}
            >
              {currentUser.role === 'admin' ? (
                <UserCog className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              )}
              <span className="hidden sm:inline font-extrabold uppercase">{currentUser.role}:</span>
              <span className="font-semibold truncate max-w-[80px] sm:max-w-none">{currentUser.username}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-all shadow-2xs flex items-center gap-1 text-xs font-bold"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Framework Container */}
      <div className="flex flex-1 min-w-0">
        {/* Left Navigation Sidebar */}
        <Sidebar
          db={db}
          activeView={activeView}
          onSelectView={(viewKey) => handleNavigate(viewKey, 'form')}
          onOpenLinkModal={handleOpenAddLink}
          onDeleteLink={handleDeleteLink}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Main Content Area */}
        <div className="lg:pl-80 flex flex-col flex-1 min-w-0">
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* 2. GRAND HERO BANNER (Soft pastel gradient) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-200/90 via-purple-200/85 to-sky-200/90 dark:from-slate-900 dark:via-purple-950/70 dark:to-indigo-950/80 border border-pink-200/70 dark:border-purple-800/40 p-6 md:p-8 text-slate-800 dark:text-white shadow-sm">
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-300/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sky-300/20 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  {/* Avatar Logo on White Ring */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl p-1 bg-white shadow-sm border border-pink-200/60 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <img
                      src="https://i.ibb.co.com/pBbfS44d/LOGO-PASS-TEMENAN.jpg"
                      alt="Logo Pass Temenan"
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1.5 max-w-3xl">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
                        PROGRAM UNGGULAN
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-white/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-[11px] border border-slate-300/60 dark:border-white/20 backdrop-blur-xs shadow-2xs">
                        SMP Negeri 7 Pasuruan
                      </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase leading-tight">
                      E-PASS TEMENAN SPANJU
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs md:text-sm font-bold text-indigo-900 dark:text-amber-300 leading-snug">
                      (Elektronik Kota Pasuruan Siap, Sigap dalam kegiatan Bersama Melawan Kekerasan dan Perundungan di Satuan Pendidikan) SMP Negeri 7
                    </p>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                      E-Pass Temenan Spanju adalah inovasi layanan digital SMPN 7 Pasuruan untuk mencegah dan menangani aksi perundungan serta kekerasan di lingkungan sekolah secara cepat, aman, dan terintegrasi.
                    </p>
                  </div>
                </div>

                {/* Right Floating Badge / Action */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
                  >
                    <Database className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>
                      {db.supabaseConfig.isConnected ? 'Supabase Sync Active' : 'Setup Supabase Sync'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. SUB-SECTION LAYOUT (Split Sub-Nav Menu + Form / View) */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left SubNavMenu (Rendered only for module form views) */}
              {activeView !== 'flowchart-intro' && activeView !== 'dashboard-overview' && activeView !== 'master-siswa' && activeView !== 'master-guru' && (
                <SubNavMenu
                  db={db}
                  activeView={activeView}
                  activeTab={activeTab}
                  onNavigate={(viewKey, tab) => handleNavigate(viewKey, tab)}
                  isOpen={isSubNavOpen}
                  onToggleOpen={() => setIsSubNavOpen(!isSubNavOpen)}
                />
              )}

              {/* Right View Container */}
              <div className="flex-1 min-w-0 w-full">
                {activeView === 'flowchart-intro' && (
                  <FlowchartIntroLanding
                    onEnterApp={() => handleNavigate('sabtu-teh-ceri', 'form')}
                  />
                )}

                {activeView === 'dashboard-overview' && (
                  <DashboardOverview
                    db={db}
                    onNavigate={(viewKey) => handleNavigate(viewKey, 'form')}
                    onOpenLinkModal={() => handleOpenAddLink()}
                    onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                    onOpenBackupModal={() => setIsBackupModalOpen(true)}
                  />
                )}

                {activeView === 'piket-harian' && <PiketHarianForm initialTab={activeTab} userRole={currentUser.role} />}
                {activeView === 'sabtu-teh-ceri' && <SabtuBeliTehCeriForm initialTab={activeTab} userRole={currentUser.role} />}
                {activeView === 'kebun-berseri' && <KebunLuasBerseriForm initialTab={activeTab} userRole={currentUser.role} />}
                {activeView === 'senandung-serasi' && <SenandungSerasiForm userRole={currentUser.role} />}
                {activeView === 'e-lapor' && <ELaporPerundunganForm userRole={currentUser.role} />}
                {activeView === 'buku-tamu' && <BukuTamuForm userRole={currentUser.role} />}
                {activeView === 'master-siswa' && <MasterSiswaView db={db} onRefresh={refreshDb} />}
                {activeView === 'master-guru' && <MasterGuruView db={db} onRefresh={refreshDb} />}

                {/* Custom Web Embed View */}
                {activeCustomLink && <WebEmbedViewer link={activeCustomLink} />}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <LinkManagerModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSave={handleSaveLink}
        editingLink={editingLink}
      />

      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSaved={refreshDb}
      />

      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestored={refreshDb}
      />

      <PejabatSettingsModal
        isOpen={isPejabatModalOpen}
        onClose={() => setIsPejabatModalOpen(false)}
        onSaved={refreshDb}
      />
    </div>
  );
}
