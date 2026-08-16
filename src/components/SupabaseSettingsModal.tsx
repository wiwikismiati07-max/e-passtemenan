import React, { useState, useEffect } from 'react';
import { X, Database, Cloud, RefreshCw, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storage';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSynced?: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({ isOpen, onClose, onSynced }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = StorageService.getDb().supabaseConfig;
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setAutoSync(config.autoSync || false);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    StorageService.updateSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      autoSync,
    });
    setTestResult({ success: true, message: 'Konfigurasi Supabase berhasil disimpan di memori browser!' });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await StorageService.testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);
    setTestResult(res);
    if (res.success) {
      StorageService.updateSupabaseConfig({
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true,
      });
    }
  };

  const handleSyncNow = async () => {
    handleSaveConfig();
    setIsSyncing(true);
    setSyncResult(null);
    const res = await StorageService.syncToSupabase();
    setIsSyncing(false);
    setSyncResult(res);
    if (onSynced && res.success) {
      onSynced();
    }
  };

  const sqlScript = StorageService.getSupabaseSQLScript();

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-2xl shadow-teal-950/60 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                Integrasi Cloud Database Supabase
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  Real-time Upsert
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Data disimpan otomatis di lokal & dapat disinkronkan ke Supabase tanpa login
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {/* Info Banner */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-teal-300">Akses Terbuka & Sinkronisasi Fleksibel</p>
              <p className="leading-relaxed">
                Semua form Program PASS TEMENAN (Piket, Sabtu Beli Teh Ceri, Kebun Luas Berseri, Senandung Serasi, E-Lapor, Buku Tamu)
                tersimpan secara instan di penyimpanan browser (Local Database) dan dapat di-update kapan saja. Hubungkan akun Supabase Anda di bawah ini untuk backup awan realtime.
              </p>
            </div>
          </div>

          {/* Form Credentials */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoSync"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500 w-4 h-4"
              />
              <label htmlFor="autoSync" className="text-xs text-slate-300 select-none cursor-pointer">
                Sinkronisasi otomatis ke Supabase setiap kali ada data baru / update
              </label>
            </div>
          </div>

          {/* Test & Sync Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !url || !anonKey}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
              Uji Koneksi Supabase
            </button>

            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing || !url || !anonKey}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 btn-3d disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Sinkronkan Semua Data Sekarang
            </button>

            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-950/40 border border-teal-500/30 ml-auto"
            >
              {showSql ? 'Sembunyikan SQL Generator' : 'Lihat Skrip SQL Tabel Supabase'}
            </button>
          </div>

          {/* Alerts */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {syncResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                syncResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
              }`}
            >
              {syncResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{syncResult.message}</span>
            </div>
          )}

          {/* SQL Generator Section */}
          {showSql && (
            <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-teal-400">SQL Schema (Piket, Sabtu, Kebun, Senandung, E-Lapor, Tamu)</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Tersalin!' : 'Salin Skrip SQL'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Salin dan tempelkan query di menu <strong>SQL Editor</strong> dashboard Supabase Anda untuk membuat struktur tabel secara otomatis.
              </p>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto max-h-48 scrollbar-thin">
                {sqlScript}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              handleSaveConfig();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 btn-3d shadow-lg shadow-teal-500/20"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};
