import React, { useState } from 'react';
import {
  X,
  Play,
  ExternalLink,
  Clock,
  User,
  Calendar,
  Video as VideoIcon,
  Copy,
  Check,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import { VideoEdukasiItem } from '../../types';
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl,
  isDirectVideoFile,
} from '../../utils/youtube';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoEdukasiItem | null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  video,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !video) return null;

  const ytId = video.youtubeId || extractYouTubeId(video.videoUrl);
  const embedUrl = ytId ? getYouTubeEmbedUrl(ytId) : '';
  const watchUrl = getYouTubeWatchUrl(video.videoUrl);
  const isDirect = isDirectVideoFile(video.videoUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(watchUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenDirect = () => {
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 truncate pr-3">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shrink-0">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                {video.kategori}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {video.judul}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenDirect}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Buka langsung di YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka di YouTube</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="bg-black aspect-video w-full max-h-[52vh] flex items-center justify-center relative overflow-hidden">
          {isDirect ? (
            <video
              controls
              autoPlay
              src={video.videoUrl}
              className="w-full h-full object-contain"
            >
              Browser Anda tidak mendukung pemutaran video langsung.
            </video>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.judul}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-white space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-600/30 border border-rose-500 flex items-center justify-center">
                <Play className="w-8 h-8 text-rose-400 fill-current ml-1" />
              </div>
              <p className="text-sm font-semibold max-w-md">
                Klik tombol di bawah untuk memutar video di YouTube atau platform sumber.
              </p>
              <button
                onClick={handleOpenDirect}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Video di YouTube / Tautan Asli</span>
              </button>
            </div>
          )}
        </div>

        {/* Helpful Fallback Bar & Direct Buttons */}
        <div className="px-4 sm:px-5 py-2.5 bg-rose-50/90 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="text-[11px] leading-tight">
              Jika video menampilkan <strong>&quot;Video tidak tersedia&quot;</strong> karena pembatasan izin semat YouTube:
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenDirect}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Tonton di YouTube (Layar Penuh)</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Salin Tautan Video"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Description & Meta */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {video.durasi && (
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Durasi: {video.durasi}
              </span>
            )}
            {video.narasumber && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                {video.narasumber}
              </span>
            )}
            {video.tanggal && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {video.tanggal}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {video.deskripsi}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              Media Pembelajaran Digital UPT SMPN 7 Pasuruan
            </span>
            <button
              onClick={handleOpenDirect}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Tautan YouTube Asli</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

