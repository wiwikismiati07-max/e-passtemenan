import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  Trees,
  Music,
  ShieldAlert,
  BookOpenCheck,
  Calendar,
  RefreshCw,
  Clock,
  Download,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  UserCheck,
  UserCog,
  GraduationCap,
  Users,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { AppDatabase, CustomLink } from './types';
import { StorageService } from './services/storage';
import {
  getRealtimeFullFormattedDate,
  getRealtimeTimeStringWithSeconds,
} from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<CustomLink | undefined>(undefined);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isPejabatModalOpen, setIsPejabatModalOpen] = useState(false);
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

    // Initialize Realtime subscription and startup sync
    const initialDb = StorageService.getDb();
    let cleanupRealtime: (() => void) | undefined;

    if (initialDb.supabaseConfig?.url && initialDb.supabaseConfig?.anonKey) {
      setIsSyncing(true);
      setSyncStatusMsg('Menyinkronkan data Cloud Supabase...');
      StorageService.fetchFromSupabase().then((res) => {
        setIsSyncing(false);
        if (res.success) {
          refreshDb();
          setSyncStatusMsg(res.message);
          setTimeout(() => setSyncStatusMsg(''), 4000);
        } else {
          setSyncStatusMsg('');
        }
        // Seamlessly migrate any local base64 photos to permanent Supabase Storage
        StorageService.migrateLocalPhotosToSupabase().then((migRes) => {
          if (migRes.totalMigrated > 0) {
            refreshDb();
          }
        });
      });

      cleanupRealtime = StorageService.initRealtimeSubscription();
    }

    // Auto-sync on window focus or visibility change
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && StorageService.getSupabaseClient()) {
        StorageService.fetchFromSupabase().then((res) => {
          if (res.success) refreshDb();
        });
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // Periodic lightweight sync poll (every 7 seconds)
    const syncInterval = setInterval(() => {
      if (StorageService.getSupabaseClient()) {
        StorageService.fetchFromSupabase().then((res) => {
          if (res.success) refreshDb();
        });
      }
    }, 7000);

    return () => {
      window.removeEventListener('pass-temenan-db-updated', handleDbChange);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      clearInterval(syncInterval);
      if (cleanupRealtime) cleanupRealtime();
    };
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
    setIsSyncing(true);
    setSyncStatusMsg('Menyinkronkan data Cloud (HP ⇄ Laptop)...');
    try {
      await StorageService.syncToSupabase();
      const res = await StorageService.fetchFromSupabase();
      StorageService.migrateLocalPhotosToSupabase().then((migRes) => {
        if (migRes.totalMigrated > 0) refreshDb();
      });

      setIsSyncing(false);
      refreshDb();

      if (res.success) {
        setSyncStatusMsg('Data berhasil disinkronkan & sama di semua perangkat!');
        setTimeout(() => setSyncStatusMsg(''), 4000);
      } else {
        setSyncStatusMsg(`Status Sinkron: ${res.message}`);
        setTimeout(() => setSyncStatusMsg(''), 4000);
      }
    } catch {
      setIsSyncing(false);
      setSyncStatusMsg('Sinkronisasi selesai.');
      setTimeout(() => setSyncStatusMsg(''), 3000);
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
        '- Klik ikon Pasang di sebelah kanan bilah URL browser.\n\n' +
        '📱 DI HP ANDROID (Chrome):\n' +
        '- Ketuk menu titik tiga di kanan atas > "Tambahkan ke Layar Utama" / "Install Aplikasi".\n\n' +
        '🍏 DI iPHONE / IPAD (Safari):\n' +
        '- Ketuk tombol Bagikan (Share) > "Tambahkan ke Layar Utama".'
      );
    }
  };

  const activeCustomLink = db.customLinks?.find((l) => l.id === activeView);

  const getActiveViewDisplayTitle = () => {
    switch (activeView) {
      case 'flowchart-intro':
        return 'Bagan & Alur Tolak Ukur';
      case 'dashboard-overview':
        return 'Dashboard Utama';
      case 'piket-harian':
        return 'Piket Harian';
      case 'sabtu-teh-ceri':
        return 'Sabtu Beli Teh Ceri';
      case 'kebun-berseri':
        return 'Kebun Luas Berseri';
      case 'senandung-serasi':
        return 'Senandung Serasi';
      case 'e-lapor':
        return 'E-Lapor Perundungan';
      case 'buku-tamu':
        return 'Buku Tamu Digital';
      case 'master-siswa':
        return 'Master Data Siswa';
      case 'master-guru':
        return 'Master Data Guru';
      default:
        return activeCustomLink ? activeCustomLink.title : 'Aplikasi';
    }
  };

  const handleNavigate = (viewKey: string, tab: 'form' | 'rekap' | 'statistik' = 'form') => {
    setActiveView(viewKey);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased font-sans transition-colors duration-200">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs transition-colors">
        {/* Left: Menu Toggle & Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Universal Menu Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              isSidebarOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isSidebarOpen ? 'Sembunyikan Menu Navigasi' : 'Tampilkan Menu Navigasi'}
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <PanelLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span className="hidden sm:inline font-display">
              {isSidebarOpen ? 'Sembunyikan Menu' : 'Buka Menu'}
            </span>
          </button>

          <div
            onClick={() => handleNavigate('dashboard-overview')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-full p-0.5 border-2 border-emerald-400 bg-white shadow-xs flex items-center justify-center shrink-0">
              <img
                src="https://i.ibb.co.com/pBbfS44d/LOGO-PASS-TEMENAN.jpg"
                alt="Logo Pass Temenan"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-col truncate">
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white font-display tracking-tight uppercase">
                  SPANJU DASHBOARD
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  SMPN 7 Pasuruan
                </span>
              </div>
              <span className="hidden md:inline text-[10px] text-slate-500 dark:text-slate-400 truncate">
                E-Pass Temenan: Bersama Melawan Perundungan
              </span>
            </div>
          </div>
        </div>

        {/* Center: Realtime Clock (Desktop) */}
        <div className="hidden xl:flex items-center justify-center gap-2">
          <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{realtimeDate} •</span>
            <span className="font-mono font-bold">{realtimeClock}</span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Multi-Device Cloud Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              isSyncing
                ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
            }`}
            title="Sinkronkan data instan antara HP & Laptop"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ${
                isSyncing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden md:inline">
              {isSyncing ? 'Sinkronisasi...' : 'Sinkron Cloud'}
            </span>
          </button>

          {/* Pejabat Settings (Admin) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsPejabatModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Pengaturan Guru Pendamping, Konselor & Kepala Sekolah"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="hidden lg:inline">Pejabat & BK</span>
            </button>
          )}

          {/* Install PWA Button */}
          <button
            onClick={handleInstallApp}
            className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Instal Aplikasi PWA ke HP / Komputer"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Instal App</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Session Pill & Logout */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 dark:border-slate-800">
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
              <span className="truncate max-w-[70px] sm:max-w-[110px]">{currentUser.username}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-all shadow-2xs flex items-center cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sync Status Toast Banner */}
      {syncStatusMsg && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 text-center transition-all animate-fadeIn shadow-inner flex items-center justify-center gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* 2. MAIN LAYOUT STRUCTURE */}
      <div className="flex flex-1 min-w-0 relative">
        {/* Collapsible Sidebar */}
        <Sidebar
          db={db}
          activeView={activeView}
          onSelectView={(viewKey) => handleNavigate(viewKey, 'form')}
          onOpenLinkModal={handleOpenAddLink}
          onDeleteLink={handleDeleteLink}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Floating Quick Opener Button when Sidebar is collapsed on Desktop */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="hidden lg:flex fixed left-4 bottom-8 z-40 px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 items-center gap-2 text-xs font-bold transition-all transform hover:scale-105 cursor-pointer animate-fadeIn border border-indigo-400/40"
            title="Buka Menu Aplikasi"
          >
            <PanelLeft className="w-4 h-4" />
            <span>Buka Menu Navigasi</span>
          </button>
        )}

        {/* Right Main Content Area - Full Width & Fluid Responsive */}
        <div
          className={`flex flex-col flex-1 min-w-0 pb-20 lg:pb-8 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'lg:pl-80' : 'lg:pl-0'
          }`}
        >
          <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* View Header Breadcrumb & Actions */}
            {activeView !== 'flowchart-intro' && activeView !== 'dashboard-overview' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                    {activeView === 'sabtu-teh-ceri' && <Sparkles className="w-5 h-5" />}
                    {activeView === 'kebun-berseri' && <Trees className="w-5 h-5" />}
                    {activeView === 'senandung-serasi' && <Music className="w-5 h-5" />}
                    {activeView === 'piket-harian' && <Calendar className="w-5 h-5" />}
                    {activeView === 'e-lapor' && <ShieldAlert className="w-5 h-5" />}
                    {activeView === 'buku-tamu' && <BookOpenCheck className="w-5 h-5" />}
                    {activeView === 'master-siswa' && <Users className="w-5 h-5" />}
                    {activeView === 'master-guru' && <GraduationCap className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <span>E-PASS TEMENAN</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                        {getActiveViewDisplayTitle()}
                      </span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">
                      {getActiveViewDisplayTitle()}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleNavigate('dashboard-overview')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Sinkronisasi Cloud"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Sinkron</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Views with 1-Click Direct Form Access */}
            <div className="w-full">
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
                  onRefresh={handleManualSync}
                />
              )}

              {activeView === 'piket-harian' && (
                <PiketHarianForm initialTab={activeTab} userRole={currentUser.role} />
              )}
              {activeView === 'sabtu-teh-ceri' && (
                <SabtuBeliTehCeriForm initialTab={activeTab} userRole={currentUser.role} />
              )}
              {activeView === 'kebun-berseri' && (
                <KebunLuasBerseriForm initialTab={activeTab} userRole={currentUser.role} />
              )}
              {activeView === 'senandung-serasi' && (
                <SenandungSerasiForm initialTab={activeTab} userRole={currentUser.role} />
              )}
              {activeView === 'e-lapor' && (
                <ELaporPerundunganForm initialTab={activeTab} userRole={currentUser.role} />
              )}
              {activeView === 'buku-tamu' && (
                <BukuTamuForm initialTab={activeTab} userRole={currentUser.role} />
              )}
              {activeView === 'master-siswa' && (
                <MasterSiswaView db={db} onRefresh={refreshDb} />
              )}
              {activeView === 'master-guru' && (
                <MasterGuruView db={db} onRefresh={refreshDb} />
              )}

              {/* Custom Web Embed View */}
              {activeCustomLink && <WebEmbedViewer link={activeCustomLink} />}
            </div>
          </main>
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        activeView={activeView}
        onSelectView={(view) => handleNavigate(view, 'form')}
        onOpenMobileMenu={() => setIsSidebarOpen(true)}
        db={db}
      />

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
