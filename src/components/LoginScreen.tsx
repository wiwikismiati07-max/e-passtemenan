import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
  GraduationCap,
  BookOpen,
  PhoneCall,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ManualBookModal, MANUAL_BOOK_URL } from './ManualBookModal';
import { HotlineModal, HOTLINE_INFO } from './HotlineModal';

export interface UserSession {
  username: string;
  role: 'admin' | 'siswa';
  displayName: string;
}

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isManualBookOpen, setIsManualBookOpen] = useState(false);
  const [isHotlineOpen, setIsHotlineOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {
      if ((cleanUsername === 'sahabat' || cleanUsername === 'passtemenan') && (cleanPassword === 'smpn7' || cleanPassword === 'sahabat')) {
        onLoginSuccess({
          username: cleanUsername,
          role: 'siswa',
          displayName: 'Siswa SPANJU',
        });
      } else if (
        (cleanUsername === 'admin' && (cleanPassword === 'admin123' || cleanPassword === 'admin')) ||
        (cleanUsername === 'operator' && (cleanPassword === 'operator123' || cleanPassword === 'operator' || cleanPassword === 'admin123'))
      ) {
        onLoginSuccess({
          username: cleanUsername,
          role: 'admin',
          displayName: cleanUsername === 'operator' ? 'Operator SPANJU' : 'Administrator SPANJU',
        });
      } else {
        setErrorMessage('Username atau Password yang Anda masukkan tidak sesuai!');
        setIsLoading(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-400 selection:text-slate-950">
      {/* Ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Card Container */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header Branding */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full p-1 border-2 border-emerald-400 bg-white shadow-xl mx-auto transform hover:scale-105 transition-transform">
              <img
                src="https://i.ibb.co.com/pBbfS44d/LOGO-PASS-TEMENAN.jpg"
                alt="Logo Aplikasi SAHABAT Spanju"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Aplikasi SAHABAT Spanju
              </span>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                (Sekolah Aman, Harmonis, Anti Bullying dan Tindak Kekerasan SMP Negeri 7 Pasuruan)
              </p>
              <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight pt-1">
                Akses Masuk Aplikasi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                UPT SMP Negeri 7 Pasuruan
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off" autoCapitalize="off">
            {/* Hidden honeypot fields to intercept browser auto-fill managers */}
            <input type="text" name="prevent_autofill_user" tabIndex={-1} className="hidden" aria-hidden="true" autoComplete="off" />
            <input type="password" name="prevent_autofill_pwd" tabIndex={-1} className="hidden" aria-hidden="true" autoComplete="new-password" />

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="spanju_account_user"
                  id="spanju_account_user"
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  data-lpignore="true"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="spanju_account_secret"
                  id="spanju_account_secret"
                  required
                  autoComplete="new-password"
                  data-lpignore="true"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi Akses...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[3]" />
                  <span>MASUK SEKARANG</span>
                </>
              )}
            </button>
          </form>

          {/* Panduan Akun Masuk (Manual) */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
              <Key className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Panduan Akun Masuk (Manual)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 pb-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Siswa</span>
              </div>
              <div className="font-mono text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 w-10">User:</span>
                  <span className="font-bold text-slate-900 dark:text-white">sahabat / passtemenan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 w-10">Pass:</span>
                  <span className="font-bold text-slate-900 dark:text-white">smpn7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Akses Cepat: Tutorial / Manual Book & Hotline SMPN 7 */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Tombol Kiri: Tutorial / Manual Book */}
            <button
              type="button"
              onClick={() => setIsManualBookOpen(true)}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2.5 p-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/90 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
              title="Buka Tutorial / Manual Book Aplikasi (Flipbook)"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                  Manual Book
                </div>
                <div className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold mt-0.5 truncate flex items-center gap-1">
                  <span>Buku Panduan</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </button>

            {/* Tombol Kanan: Hotline SMPN 7 */}
            <button
              type="button"
              onClick={() => setIsHotlineOpen(true)}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2.5 p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/90 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
              title="Buka Hotline & Kontak Resmi UPT SMPN 7 Pasuruan"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                  Hotline SMPN 7
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold mt-0.5 truncate flex items-center gap-1">
                  <span>Kontak & Bantuan</span>
                </div>
              </div>
            </button>
          </div>

          {/* Footer note */}
          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1">
            &copy; {new Date().getFullYear()} Satgas Anti Perundungan UPT SMPN 7 Pasuruan
          </div>
        </div>
      </div>

      {/* Interactive Modal Popups */}
      <ManualBookModal
        isOpen={isManualBookOpen}
        onClose={() => setIsManualBookOpen(false)}
      />
      <HotlineModal
        isOpen={isHotlineOpen}
        onClose={() => setIsHotlineOpen(false)}
      />
    </div>
  );
};
