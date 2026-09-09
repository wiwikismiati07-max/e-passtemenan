import React from 'react';
import { X, Play, ExternalLink, Clock, User, Calendar, Tag, Video as VideoIcon } from 'lucide-react';
import { VideoEdukasiItem } from '../../types';

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
  if (!isOpen || !video) return null;

  // Extract YouTube embed URL if available
  let embedUrl = '';
  if (video.youtubeId) {
    embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
  } else if (video.videoUrl.includes('youtube.com/watch?v=') || video.videoUrl.includes('youtu.be/')) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = video.videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      embedUrl = `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 truncate pr-4">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                {video.kategori}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {video.judul}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="bg-black aspect-video w-full max-h-[55vh] flex items-center justify-center relative overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.judul}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-white space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-600/30 border border-rose-500 flex items-center justify-center">
                <Play className="w-8 h-8 text-rose-400 fill-current ml-1" />
              </div>
              <p className="text-sm font-semibold max-w-md">
                Klik tombol di bawah untuk memutar video di YouTube atau platform sumber.
              </p>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Video di YouTube / Tautan Asli</span>
              </a>
            </div>
          )}
        </div>

        {/* Description & Meta */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-white dark:bg-slate-900">
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

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {video.deskripsi}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">
              Media Pembelajaran Digital UPT SMPN 7 Pasuruan
            </span>
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Tautan Eksternal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
