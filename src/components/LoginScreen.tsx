import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {
      if (cleanUsername === 'passtemenan' && cleanPassword === 'smpn7') {
        onLoginSuccess({
          username: 'passtemenan',
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

          {/* Footer note */}
          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1">
            &copy; {new Date().getFullYear()} Satgas Anti Perundungan UPT SMPN 7 Pasuruan
          </div>
        </div>
      </div>
    </div>
  );
};
