import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Globe, ShieldAlert, ArrowLeft, Maximize2, Minimize2, Check, Copy } from 'lucide-react';
import { CustomLink } from '../types';

interface WebEmbedViewerProps {
  link: CustomLink;
  onBackToOverview: () => void;
}

export const WebEmbedViewer: React.FC<WebEmbedViewerProps> = ({ link, onBackToOverview }) => {
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRefresh = () => {
    setIframeKey(Date.now());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden transition-all ${
      isFullscreen ? 'fixed inset-4 z-50' : 'h-[calc(100vh-6.5rem)]'
    }`}>
      {/* Top Browser Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToOverview}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-teal-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Muat Ulang Halaman"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* URL Pill */}
        <div className="flex-1 max-w-xl flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-inner">
          <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="font-medium text-white truncate max-w-xs">{link.title}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono truncate">{link.url}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            title="Salin Tautan"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka di Tab Baru</span>
          </a>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Frame Notice / Banner */}
      <div className="px-4 py-1.5 bg-slate-950/40 border-b border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Jika halaman eksternal tidak menampilkan konten (kebijakan keamanan X-Frame), klik tombol <strong>"Buka di Tab Baru"</strong> di kanan atas.</span>
        </div>
        <span className="text-slate-500">{link.category || 'Tautan Web'}</span>
      </div>

      {/* Iframe content */}
      <div className="flex-1 relative bg-white">
        <iframe
          key={iframeKey}
          src={link.url}
          title={link.title}
          className="w-full h-full border-none"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
