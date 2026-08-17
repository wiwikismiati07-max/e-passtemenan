import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  UserCog,
  Sparkles,
} from 'lucide-react';

export interface UserSession {
  username: string;
  role: 'admin' | 'siswa';
  displayName: string;
}

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('passtemenan');
  const [password, setPassword] = useState('smpn7');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    setTimeout(() => {
      if (cleanUsername === 'passtemenan' && cleanPassword === 'smpn7') {
        onLoginSuccess({
          username: 'passtemenan',
          role: 'siswa',
          displayName: 'Siswa SPANJU',
        });
      } else if (cleanUsername === 'admin' && cleanPassword === 'admin123') {
        onLoginSuccess({
          username: 'admin',
          role: 'admin',
          displayName: 'Administrator SPANJU',
        });
      } else {
        setErrorMessage('Username atau Password yang Anda masukkan tidak sesuai!');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setErrorMessage('');
    setUsername('passtemenan');
    setPassword('smpn7');
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
                alt="Logo Pass Temenan"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                E-PASS TEMENAN SPANJU
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight pt-1">
                Akses Masuk Aplikasi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                UPT SMP Negeri 7 Pasuruan
              </p>
            </div>
          </div>

          {/* Quick Preset Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Isi Akses Siswa</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
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
                  required
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
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memproses Login...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[3]" />
                  <span>MASUK SEKARANG</span>
                </>
              )}
            </button>
          </form>

          {/* Account Credentials Info Box */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Daftar Akun Resmi:</span>
            </div>
            <div className="text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-0.5">
                <p className="font-sans font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Siswa (Akses Input & Edit)
                </p>
                <p className="text-slate-600 dark:text-slate-300">User: <span className="font-extrabold text-slate-900 dark:text-white">passtemenan</span></p>
                <p className="text-slate-600 dark:text-slate-300">Pass: <span className="font-extrabold text-slate-900 dark:text-white">smpn7</span></p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Satgas Anti Perundungan UPT SMPN 7 Pasuruan
          </div>
        </div>
      </div>
    </div>
  );
};
