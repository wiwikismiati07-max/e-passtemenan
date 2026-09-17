import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Video,
  Link as LinkIcon,
  Play,
  Clock,
  User,
  Calendar,
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { VideoEdukasiItem } from '../../types';
import { StorageService } from '../../services/storage';
import {
  extractYouTubeId,
  normalizeVideoUrl,
  getYouTubeThumbnail,
} from '../../utils/youtube';

interface TambahVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TambahVideoModal: React.FC<TambahVideoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Dokumentasi Inovasi');
  const [deskripsi, setDeskripsi] = useState('');
  const [durasi, setDurasi] = useState('04:00');
  const [narasumber, setNarasumber] = useState('Satgas Aplikasi SAHABAT Spanju UPT SMPN 7 Pasuruan');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [detectedYtId, setDetectedYtId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-detect YouTube ID whenever URL changes
  useEffect(() => {
    const id = extractYouTubeId(videoUrl);
    setDetectedYtId(id);
  }, [videoUrl]);

  if (!isOpen) return null;

  const quickCategories = [
    'Dokumentasi Inovasi',
    'Sosialisasi Siswa',
    'Roadshow',
    'Class Meet',
    'Deklarasi Anti-Bullying',
    'Konseling & BK',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!videoUrl.trim()) {
      setErrorMsg('Silakan masukkan tautan / link URL video.');
      return;
    }

    const normalizedUrl = normalizeVideoUrl(videoUrl);
    const ytId = extractYouTubeId(normalizedUrl) || undefined;
    const resolvedTitle =
      judul.trim() ||
      (ytId
        ? `Video YouTube ${ytId}`
        : 'Video Edukasi & Sosialisasi Siswa');

    const thumbnail = ytId
      ? getYouTubeThumbnail(ytId)
      : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

    const newVideo: VideoEdukasiItem = {
      id: `vid-${Date.now()}`,
      judul: resolvedTitle,
      kategori: kategori.trim() || 'Dokumentasi Inovasi',
      deskripsi: deskripsi.trim() || `Dokumentasi video edukasi dan inovasi perlindungan siswa UPT SMPN 7 Pasuruan.`,
      videoUrl: normalizedUrl,
      youtubeId: ytId,
      durasi: durasi.trim() || '04:00',
      narasumber: narasumber.trim() || 'Satgas Aplikasi SAHABAT Spanju',
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      thumbnailUrl: thumbnail,
    };

    StorageService.saveMediaEdukasiItem('video', newVideo);

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      // Reset form
      setVideoUrl('');
      setJudul('');
      setDeskripsi('');
      onSuccess();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-rose-50/60 dark:bg-rose-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                  Input Manual
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Media Edukasi</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Tambah Link Video YouTube Terbaru
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Video berhasil disimpan ke koleksi!</span>
            </div>
          )}

          {/* 1. Tautan Link Video URL */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Tautan / Link Video YouTube <span className="text-rose-600">*</span>
            </label>

            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Tempel tautan YouTube (youtu.be/..., youtube.com/watch?v=..., shorts, atau ID video)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                required
              />
            </div>

            {/* YouTube Auto Preview */}
            {detectedYtId ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60">
                <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-slate-300 dark:border-slate-700 shadow-2xs">
                  <img
                    src={`https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg`}
                    alt="Pratinjau YouTube"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${detectedYtId}/mqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>

                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Video YouTube Valid & Siap Tayang
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                    ID YouTube: {detectedYtId}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Koleksi video ini dapat diputar langsung di web atau ditonton di aplikasi YouTube.
                  </p>
                </div>
              </div>
            ) : videoUrl.trim() ? (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Tautan video akan disimpan dan dapat diputar langsung melalui tautan browser.
              </p>
            ) : null}
          </div>

          {/* 2. Judul Video */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Judul Video Dokumentasi / Edukasi <span className="text-slate-400 font-normal">(Opsional - otomatis terisi)</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Sosialisasi Anti-Perundungan & Deklarasi Damai SPANJU 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
            />
          </div>

          {/* 3. Kategori & Narasumber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori Video
              </label>
              <input
                type="text"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Pilih atau ketik kategori..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickCategories.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setKategori(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                      kategori === cat
                        ? 'bg-rose-100 dark:bg-rose-950 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Narasumber / Tim Pelaksana
              </label>
              <input
                type="text"
                value={narasumber}
                onChange={(e) => setNarasumber(e.target.value)}
                placeholder="Contoh: Satgas Aplikasi SAHABAT Spanju / Guru BK"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Durasi & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Estimasi Durasi Video
              </label>
              <input
                type="text"
                value={durasi}
                onChange={(e) => setDurasi(e.target.value)}
                placeholder="Contoh: 04:30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Tanggal Kegiatan / Upload
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Deskripsi Ringkas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi Singkat Video
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Ceritakan gambaran kegiatan, pesan yang disampaikan, atau tujuan video..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan Video ke Koleksi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
