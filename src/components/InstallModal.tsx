import React, { useState } from 'react';
import {
  Download,
  X,
  Smartphone,
  Laptop,
  Apple,
  Share2,
  MoreVertical,
  CheckCircle2,
  PlusSquare,
  Sparkles,
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallNative: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallNative,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'laptop' | 'ios'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header & Logo Showcase */}
        <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl p-1 bg-gradient-to-tr from-emerald-400 via-teal-300 to-indigo-400 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/logo-pass-temenan.jpg"
                alt="Logo Pass Temenan"
                className="w-full h-full object-cover rounded-xl bg-white"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://i.ibb.co.com/pBbfS44d/LOGO-PASS-TEMENAN.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-slate-900 dark:text-white">
                  Instal E-PASS TEMENAN
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ikon Resmi: Logo Pass Temenan SMPN 7 Pasuruan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-emerald-900 dark:text-emerald-200">
              Aplikasi Mandiri di Layar HP & Laptop
            </p>
            <p className="text-emerald-700 dark:text-emerald-300/90 text-[11px] leading-relaxed">
              Setelah dipasang, aplikasi akan muncul di layar utama dengan <strong>Logo Pass Temenan</strong> dan dapat dibuka tanpa bilah browser.
            </p>
          </div>
        </div>

        {/* Quick Native Install Button (if browser prompt available) */}
        {deferredPrompt && (
          <button
            type="button"
            onClick={onInstallNative}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Pasang Sekarang ke Perangkat</span>
          </button>
        )}

        {/* OS Platform Tabs */}
        <div className="space-y-3">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'android'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab('laptop')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'laptop'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-indigo-500" />
              <span>Laptop / PC</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ios'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Apple className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>iPhone / iPad</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'android' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                Cara Pasang di HP Android (Google Chrome):
              </h4>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 font-medium list-decimal list-inside">
                <li className="leading-relaxed">
                  Buka aplikasi melalui browser <strong>Google Chrome</strong> di HP Anda.
                </li>
                <li className="leading-relaxed">
                  Ketuk ikon <strong>Menu Titik Tiga (⋮)</strong> di pojok kanan atas browser.
                </li>
                <li className="leading-relaxed">
                  Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.
                </li>
                <li className="leading-relaxed">
                  Konfirmasi pemasangan. Ikon <strong>Logo Pass Temenan</strong> akan langsung terpasang di layar utama HP Anda.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'laptop' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-500" />
                Cara Pasang di Laptop / PC (Chrome / Microsoft Edge):
              </h4>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 font-medium list-decimal list-inside">
                <li className="leading-relaxed">
                  Buka aplikasi di <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>.
                </li>
                <li className="leading-relaxed">
                  Perhatikan bilah alamat (URL) di bagian kanan atas, klik ikon <strong>"Install E-PASS TEMENAN SPANJU"</strong> (<Download className="w-3.5 h-3.5 inline text-indigo-600" />).
                </li>
                <li className="leading-relaxed">
                  Atau klik menu titik tiga di browser &gt; <strong>"Cast, save, and share" / "Apps"</strong> &gt; <strong>"Install this site as an app"</strong>.
                </li>
                <li className="leading-relaxed">
                  Shortcut dengan <strong>Logo Pass Temenan</strong> akan muncul di Desktop dan Taskbar.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Apple className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Cara Pasang di iPhone / iPad (Safari):
              </h4>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 font-medium list-decimal list-inside">
                <li className="leading-relaxed">
                  Buka aplikasi melalui browser <strong>Safari</strong> di iOS.
                </li>
                <li className="leading-relaxed">
                  Ketuk tombol <strong>Bagikan / Share (<Share2 className="w-3.5 h-3.5 inline text-blue-500" />)</strong> di bilah navigasi bawah Safari.
                </li>
                <li className="leading-relaxed">
                  Gulir ke bawah dan ketuk opsi <strong>"Tambah ke Layar Utama" (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />)</strong>.
                </li>
                <li className="leading-relaxed">
                  Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Ikon <strong>Logo Pass Temenan</strong> akan hadir di homescreen iOS Anda.
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Tersertifikasi PWA Standalone
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
