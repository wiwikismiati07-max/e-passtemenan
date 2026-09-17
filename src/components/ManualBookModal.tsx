import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  Maximize2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface ManualBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MANUAL_BOOK_URL = 'https://heyzine.com/flip-book/45802adfc1.html';

export const ManualBookModal: React.FC<ManualBookModalProps> = ({ isOpen, onClose }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(MANUAL_BOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                  Tutorial & Manual Book Aplikasi SAHABAT Spanju
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Flipbook Interaktif
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Panduan resmi operasional & fitur aplikasi UPT SMP Negeri 7 Pasuruan
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleReload}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Muat Ulang Flipbook"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Salin Link Flipbook"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={MANUAL_BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Tab Baru</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Flipbook Frame Container */}
        <div className="relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-3">
              <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-200">Memuat Buku Panduan (Flipbook)...</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Menyiapkan halaman interaktif Heyzine</p>
              </div>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={MANUAL_BOOK_URL}
            title="Manual Book Aplikasi SAHABAT Spanju"
            className="w-full h-full border-0"
            allowFullScreen
            allow="clipboard-write"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Footer info bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              UPT SMP Negeri 7 Pasuruan &bull; Inovasi Aplikasi SAHABAT Spanju
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              Jika buku tidak muncul di perangkat Anda:
            </span>
            <a
              href={MANUAL_BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-500 flex items-center gap-1"
            >
              <span>Akses Tautan Langsung</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
