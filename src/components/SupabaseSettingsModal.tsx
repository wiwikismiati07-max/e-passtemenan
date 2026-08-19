import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  DownloadCloud,
  UploadCloud,
  Info,
  Layers,
  GraduationCap,
  Users,
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSynced?: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onSynced,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; counts?: any } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const db = StorageService.getDb();

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
    setTestResult({ success: true, message: '✓ Konfigurasi Supabase berhasil disimpan di browser!' });
  };

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, message: 'Masukkan Project URL dan Anon Key terlebih dahulu.' });
      return;
    }
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
    if (!url.trim() || !anonKey.trim()) {
      setSyncResult({ success: false, message: 'Masukkan Project URL dan Anon Key terlebih dahulu.' });
      return;
    }
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

  const handleFetchNow = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setSyncResult({ success: false, message: 'Masukkan Project URL dan Anon Key terlebih dahulu.' });
      return;
    }
    handleSaveConfig();
    setIsFetching(true);
    setSyncResult(null);
    const res = await StorageService.fetchFromSupabase();
    setIsFetching(false);
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

  const totalClassAssignments = Object.keys(db.classAssignments || {}).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl shadow-emerald-950/60 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">
                  Penyimpanan Cloud Database Supabase
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black">
                  REAL-TIME CLOUD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simpan & amankan seluruh data program PASS TEMENAN ke cloud database Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {/* Data Overview Cards */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Ringkasan Data Siap Disimpan ke Supabase
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">
                {db.supabaseConfig.lastSyncedAt
                  ? `Terakhir Sinkron: ${new Date(db.supabaseConfig.lastSyncedAt).toLocaleString('id-ID')}`
                  : 'Belum pernah sinkron'}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Zona Hijau Kelas</span>
                <span className="text-sm font-black text-emerald-400">{totalClassAssignments} Data</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Master Guru</span>
                <span className="text-sm font-black text-teal-400">{db.masterGuru?.length || 0} Guru</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Master Siswa</span>
                <span className="text-sm font-black text-blue-400">{db.masterSiswa?.length || 0} Siswa</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">E-Lapor</span>
                <span className="text-sm font-black text-rose-400">{db.eLaporPerundungan?.length || 0} Kasus</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Form Program</span>
                <span className="text-sm font-black text-amber-400">
                  {(db.piketHarian?.length || 0) +
                    (db.sabtuBeliTehCeri?.length || 0) +
                    (db.kebunLuasBerseri?.length || 0) +
                    (db.senandungSerasi?.length || 0) +
                    (db.bukuTamu?.length || 0)}{' '}
                  Entri
                </span>
              </div>
            </div>
          </div>

          {/* Form Credentials */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Kredensial API Supabase Project
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoSync"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="autoSync" className="text-xs text-slate-300 select-none cursor-pointer">
                Aktifkan sinkronisasi otomatis ke Supabase setiap ada data baru / update
              </label>
            </div>
          </div>

          {/* Action Buttons: Test, Upload / Save, Download */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !url || !anonKey}
              className="p-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-teal-400" /> : <Cloud className="w-4 h-4 text-teal-400" />}
              <span>{isTesting ? 'Menguji...' : '1. Uji Koneksi Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing || !url || !anonKey}
              className="p-3 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <UploadCloud className="w-4 h-4 text-white" />
              )}
              <span>{isSyncing ? 'Menyimpan ke Cloud...' : '2. Simpan & Unggah ke Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handleFetchNow}
              disabled={isFetching || !url || !anonKey}
              className="p-3 rounded-2xl text-xs font-bold bg-teal-800 hover:bg-teal-700 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isFetching ? (
                <RefreshCw className="w-4 h-4 animate-spin text-teal-200" />
              ) : (
                <DownloadCloud className="w-4 h-4 text-teal-200" />
              )}
              <span>{isFetching ? 'Mengunduh...' : '3. Muat Data dari Supabase'}</span>
            </button>
          </div>

          {/* Test & Sync Alerts */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
                testResult.success
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              )}
              <span className="font-semibold">{testResult.message}</span>
            </div>
          )}

          {syncResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
                syncResult.success
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
              }`}
            >
              {syncResult.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
              )}
              <span className="font-semibold">{syncResult.message}</span>
            </div>
          )}

          {/* SQL Generator Section Toggle */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Skrip SQL Pembuatan Tabel Otomatis
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Jika tabel belum dibuat di Supabase, salin skrip ini dan jalankan di SQL Editor Supabase.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSql(!showSql)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 px-2 py-1"
                >
                  {showSql ? 'Tutup' : 'Lihat'}
                </button>
              </div>
            </div>

            {showSql && (
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3.5 rounded-xl overflow-x-auto max-h-52 scrollbar-thin border border-slate-800">
                {sqlScript}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              handleSaveConfig();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            Simpan Konfigurasi & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
