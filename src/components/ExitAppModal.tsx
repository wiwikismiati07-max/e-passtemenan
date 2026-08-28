import React from 'react';
import { LogOut, AlertTriangle, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserSession } from './LoginScreen';

interface ExitAppModalProps {
  isOpen: boolean;
  currentUser: UserSession | null;
  onConfirmExit: () => void;
  onCancel: () => void;
}

export const ExitAppModal: React.FC<ExitAppModalProps> = ({
  isOpen,
  currentUser,
  onConfirmExit,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scaleUp text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-slate-900 dark:text-white">
                Keluar Aplikasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                E-PASS TEMENAN SPANJU
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Session Info Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Akun Saat Ini:</span>
            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {currentUser?.displayName || currentUser?.username || 'Pengguna'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Hak Akses:</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400 uppercase text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
              {currentUser?.role === 'admin' ? 'Administrator' : 'Siswa / Konselor'}
            </span>
          </div>
        </div>

        {/* Informative Warning */}
        <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200 leading-snug">
                Apakah Anda yakin ingin keluar dari aplikasi sekarang?
              </p>
              <p className="text-[11px] text-rose-700/90 dark:text-rose-300/80 leading-relaxed">
                Sesi login aktif Anda akan diakhiri. Seluruh data formulir yang sudah disimpan tetap aman tersinkronisasi di database Cloud.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/20 hover:scale-[1.02] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Ya, Keluar Aplikasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
