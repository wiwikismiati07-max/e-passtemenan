import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileJson, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { StorageService } from '../services/storage';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose, onRestored }) => {
  const [mode, setMode] = useState<'merge' | 'overwrite'>('merge');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const json = StorageService.exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-pass-temenan-spanju-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = StorageService.importBackupJSON(text, mode);
        setImportStatus(res);
        setIsProcessing(false);
        if (res.success) {
          onRestored();
        }
      } catch (err: any) {
        setIsProcessing(false);
        setImportStatus({ success: false, message: `Error parsing file: ${err?.message}` });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-2xl shadow-teal-950/60">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg">
              <FileJson className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Backup & Upload Data</h2>
              <p className="text-xs text-slate-400">Unduh cadangan data link & formulir atau pulihkan dari file JSON</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-6">
          {/* Export Section */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-400" />
                  Unduh Backup (Export JSON)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menyimpan semua tautan menu, data piket harian, Sabtu Teh Ceri, Kebun Berseri, E-Lapor, dan Buku Tamu ke file .JSON.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl text-sm btn-3d flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Download className="w-4 h-4" />
              Download Backup JSON Sekarang
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Pulihkan / Upload Data (Import JSON)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Unggah file cadangan JSON yang pernah diunduh sebelumnya.
              </p>
            </div>

            {/* Mode selection */}
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                  className="text-teal-500 focus:ring-teal-500"
                />
                <span>Gabungkan (Merge - Tidak menimpa data yang berbeda)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="overwrite"
                  checked={mode === 'overwrite'}
                  onChange={() => setMode('overwrite')}
                  className="text-rose-500 focus:ring-rose-500"
                />
                <span>Ganti Total (Overwrite)</span>
              </label>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl text-sm border border-slate-600 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Pilih File Backup JSON & Unggah
            </button>
          </div>

          {/* Status Message */}
          {importStatus && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                importStatus.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
