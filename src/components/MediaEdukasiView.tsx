import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Image as ImageIcon,
  BarChart2,
  Video,
  Quote,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Download,
  Eye,
  Play,
  Share2,
  Copy,
  Check,
  Heart,
  Calendar,
  Clock,
  User,
  Tag,
  Sparkles,
  ShieldCheck,
  Trash2,
  BookmarkCheck,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import {
  AppDatabase,
  MediaEdukasiSubTab,
  MateriEdukasiItem,
  PosterEdukasiItem,
  InfografisEdukasiItem,
  VideoEdukasiItem,
  PesanEdukatifItem,
} from '../types';
import { StorageService } from '../services/storage';
import { MediaLightboxModal } from './media-edukasi/MediaLightboxModal';
import { MateriDetailModal } from './media-edukasi/MateriDetailModal';
import { VideoPlayerModal } from './media-edukasi/VideoPlayerModal';
import { TambahMediaModal } from './media-edukasi/TambahMediaModal';

interface MediaEdukasiViewProps {
  db: AppDatabase;
  onRefresh: () => void;
  initialTab?: MediaEdukasiSubTab;
}

export const MediaEdukasiView: React.FC<MediaEdukasiViewProps> = ({
  db,
  onRefresh,
  initialTab = 'materi',
}) => {
  const [activeTab, setActiveTab] = useState<MediaEdukasiSubTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Semua');

  // Modal States
  const [isTambahModalOpen, setIsTambahModalOpen] = useState<boolean>(false);
  const [selectedMateri, setSelectedMateri] = useState<MateriEdukasiItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoEdukasiItem | null>(null);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    imageUrl: string;
    type: 'poster' | 'infografis';
    meta?: any;
  }>({
    isOpen: false,
    title: '',
    imageUrl: '',
    type: 'poster',
  });

  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Safe data extraction
  const mediaDb = db.mediaEdukasi || {
    materi: [],
    poster: [],
    infografis: [],
    video: [],
    pesan: [],
  };

  const materiList = mediaDb.materi || [];
  const posterList = mediaDb.poster || [];
  const infografisList = mediaDb.infografis || [];
  const videoList = mediaDb.video || [];
  const pesanList = mediaDb.pesan || [];

  // Filter categories for the current tab
  const categories = useMemo(() => {
    let cats: string[] = [];
    if (activeTab === 'materi') {
      cats = Array.from(new Set(materiList.map((m) => m.kategori).filter(Boolean)));
    } else if (activeTab === 'poster') {
      cats = Array.from(new Set(posterList.map((p) => p.tema).filter(Boolean)));
    } else if (activeTab === 'infografis') {
      cats = Array.from(new Set(infografisList.map((i) => i.fokus).filter(Boolean)));
    } else if (activeTab === 'video') {
      cats = Array.from(new Set(videoList.map((v) => v.kategori).filter(Boolean)));
    } else if (activeTab === 'pesan') {
      cats = Array.from(new Set(pesanList.map((p) => p.topik).filter(Boolean)));
    }
    return ['Semua', ...cats];
  }, [activeTab, materiList, posterList, infografisList, videoList, pesanList]);

  // Filtered Items
  const filteredMateri = useMemo(() => {
    return materiList.filter((item) => {
      const matchCat =
        selectedCategoryFilter === 'Semua' || item.kategori === selectedCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        item.ringkasan.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        (item.penulis && item.penulis.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [materiList, selectedCategoryFilter, searchQuery]);

  const filteredPoster = useMemo(() => {
    return posterList.filter((item) => {
      const matchCat =
        selectedCategoryFilter === 'Semua' || item.tema === selectedCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q) ||
        (item.kreator && item.kreator.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [posterList, selectedCategoryFilter, searchQuery]);

  const filteredInfografis = useMemo(() => {
    return infografisList.filter((item) => {
      const matchCat =
        selectedCategoryFilter === 'Semua' || item.fokus === selectedCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q) ||
        (item.sumber && item.sumber.toLowerCase().includes(q)) ||
        item.poinPenting.some((p) => p.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [infografisList, selectedCategoryFilter, searchQuery]);

  const filteredVideo = useMemo(() => {
    return videoList.filter((item) => {
      const matchCat =
        selectedCategoryFilter === 'Semua' || item.kategori === selectedCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q) ||
        (item.narasumber && item.narasumber.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [videoList, selectedCategoryFilter, searchQuery]);

  const filteredPesan = useMemo(() => {
    return pesanList.filter((item) => {
      const matchCat =
        selectedCategoryFilter === 'Semua' || item.topik === selectedCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        item.kutipan.toLowerCase().includes(q) ||
        item.penulis.toLowerCase().includes(q) ||
        item.topik.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [pesanList, selectedCategoryFilter, searchQuery]);

  // Handlers
  const handleCopyQuote = (pesan: PesanEdukatifItem) => {
    const text = `"${pesan.kutipan}"\n\n— ${pesan.penulis}\n*Media Edukasi Digital E-PASS TEMENAN SPANJU (SMPN 7 Pasuruan)*`;
    navigator.clipboard.writeText(text);
    setCopiedId(pesan.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (pesan: PesanEdukatifItem) => {
    const text = `*"${pesan.kutipan}"*\n\n— *${pesan.penulis}* (${pesan.topik})\n\n_Pesan Edukasi dari Gerakan E-PASS TEMENAN UPT SMPN 7 Pasuruan: Bersama Melawan Perundungan._`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleToggleLike = (id: string) => {
    StorageService.toggleSukaPesan(id);
    onRefresh();
  };

  const handleDeleteItem = (tab: MediaEdukasiSubTab, id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus item "${title}"?`)) {
      StorageService.deleteMediaEdukasiItem(tab, id);
      onRefresh();
    }
  };

  const handleResetVideos = () => {
    if (window.confirm('Muat ulang dan sinkronkan koleksi ke 7 video resmi dokumentasi inovasi PASS TEMENAN SMPN 7 Pasuruan?')) {
      StorageService.resetMediaEdukasiVideos();
      onRefresh();
    }
  };

  const openLightbox = (
    item: PosterEdukasiItem | InfografisEdukasiItem,
    type: 'poster' | 'infografis'
  ) => {
    setLightboxData({
      isOpen: true,
      title: item.judul,
      subtitle: item.deskripsi,
      imageUrl: item.gambarUrl,
      type,
      meta: {
        ...(type === 'poster'
          ? {
              kreator: (item as PosterEdukasiItem).kreator,
              resolusi: (item as PosterEdukasiItem).resolusi,
              tema: (item as PosterEdukasiItem).tema,
            }
          : {
              sumber: (item as InfografisEdukasiItem).sumber,
              fokus: (item as InfografisEdukasiItem).fokus,
              poinPenting: (item as InfografisEdukasiItem).poinPenting,
            }),
        tanggal: item.tanggal,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. HERO BANNER & HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-800 to-indigo-900 text-white p-6 sm:p-8 shadow-md border border-teal-700/40">
        {/* Background glow effects */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pusat Literasi & Kampanye Digital SPANJU</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-3">
              Media Edukasi Digital
            </h1>

            <p className="text-sm text-teal-100/90 leading-relaxed font-sans">
              Koleksi dokumentasi materi, poster kampanye, infografis alur penanganan, tautan video edukatif, dan pesan-pesan inspiratif anti-perundungan untuk warga UPT SMP Negeri 7 Pasuruan.
            </p>

            {/* Quick Stats Pill Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs text-white flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-teal-300" />
                {materiList.length} Materi
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs text-white flex items-center gap-1.5 font-medium">
                <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                {posterList.length} Poster
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs text-white flex items-center gap-1.5 font-medium">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-300" />
                {infografisList.length} Infografis
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs text-white flex items-center gap-1.5 font-medium">
                <Video className="w-3.5 h-3.5 text-rose-300" />
                {videoList.length} Video
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs text-white flex items-center gap-1.5 font-medium">
                <Quote className="w-3.5 h-3.5 text-emerald-300" />
                {pesanList.length} Pesan
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setIsTambahModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>Tambah Media Edukasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS (5 ITEMS REQUESTED BY USER) */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            {
              id: 'materi' as MediaEdukasiSubTab,
              label: 'Dokumentasi Materi',
              count: materiList.length,
              icon: BookOpen,
              activeColor: 'bg-teal-600 text-white shadow-teal-600/20 shadow-md',
            },
            {
              id: 'poster' as MediaEdukasiSubTab,
              label: 'Dokumentasi Poster',
              count: posterList.length,
              icon: ImageIcon,
              activeColor: 'bg-amber-600 text-white shadow-amber-600/20 shadow-md',
            },
            {
              id: 'infografis' as MediaEdukasiSubTab,
              label: 'Dokumentasi Infografis',
              count: infografisList.length,
              icon: BarChart2,
              activeColor: 'bg-indigo-600 text-white shadow-indigo-600/20 shadow-md',
            },
            {
              id: 'video' as MediaEdukasiSubTab,
              label: 'Link Video',
              count: videoList.length,
              icon: Video,
              activeColor: 'bg-rose-600 text-white shadow-rose-600/20 shadow-md',
            },
            {
              id: 'pesan' as MediaEdukasiSubTab,
              label: 'Pesan Edukatif',
              count: pesanList.length,
              icon: Quote,
              activeColor: 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-md',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedCategoryFilter('Semua');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? tab.activeColor
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SEARCH & CATEGORY FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari dalam ${
              activeTab === 'materi'
                ? 'materi modul & regulasi'
                : activeTab === 'poster'
                ? 'poster kampanye'
                : activeTab === 'infografis'
                ? 'infografis alur'
                : activeTab === 'video'
                ? 'video edukasi'
                : 'kutipan pesan edukatif'
            }...`}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Reset
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pl-1 shrink-0">
            <Filter className="w-3 h-3" />
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedCategoryFilter === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN TAB CONTENTS */}

      {/* TAB 1: DOKUMENTASI MATERI */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              Daftar Materi Edukasi & Regulasi ({filteredMateri.length})
            </h2>
            <span className="text-[11px] text-slate-400">
              Klik baca materi untuk melihat dokumen lengkap
            </span>
          </div>

          {filteredMateri.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Tidak ada materi yang sesuai dengan pencarian atau filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMateri.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Format Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
                        {item.kategori}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                          {item.fileFormat || 'PDF'}
                        </span>
                        {item.id.startsWith('mat-') && !['mat-1', 'mat-2', 'mat-3', 'mat-4', 'mat-5'].includes(item.id) && (
                          <button
                            onClick={() => handleDeleteItem('materi', item.id, item.judul)}
                            className="p-1 hover:text-rose-600 transition-colors"
                            title="Hapus Materi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {item.judul}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans">
                      {item.ringkasan}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Meta & Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      {item.penulis && (
                        <span className="truncate max-w-[140px] font-medium">
                          {item.penulis}
                        </span>
                      )}
                      {item.bacaanMenit && (
                        <span className="shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-teal-500" />
                          {item.bacaanMenit} mnt
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setSelectedMateri(item)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Baca Materi</span>
                      </button>

                      {item.linkDokumen && (
                        <a
                          href={item.linkDokumen}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Buka Dokumen / Link Asli"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOKUMENTASI POSTER */}
      {activeTab === 'poster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              Galeri Poster Kampanye Digital ({filteredPoster.length})
            </h2>
            <span className="text-[11px] text-slate-400">
              Klik pada poster untuk melihat resolusi penuh & mengunduh
            </span>
          </div>

          {filteredPoster.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Tidak ada poster yang sesuai dengan filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPoster.map((poster) => (
                <div
                  key={poster.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-lg transition-all flex flex-col group"
                >
                  {/* Image Card Container */}
                  <div
                    onClick={() => openLightbox(poster, 'poster')}
                    className="relative aspect-4/3 bg-slate-950/80 cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={poster.gambarUrl}
                      alt={poster.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay & Hover Badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-sans uppercase tracking-wider shadow-sm">
                        {poster.tema}
                      </span>
                      {poster.isKaryaSiswa && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-sans backdrop-blur-xs">
                          Karya Siswa
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-xs font-semibold text-white/90 line-clamp-1">
                        {poster.judul}
                      </p>
                      <span className="text-[10px] text-white/70 flex items-center gap-1 mt-0.5">
                        <Eye className="w-3 h-3" />
                        Klik untuk memperbesar
                      </span>
                    </div>
                  </div>

                  {/* Content Meta */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {poster.judul}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {poster.deskripsi}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="truncate max-w-[130px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate">
                          {poster.kreator || 'Satgas SPANJU'}
                        </span>
                        <span className="text-[10px] text-slate-400">{poster.tanggal}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openLightbox(poster, 'poster')}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </button>

                        <a
                          href={poster.gambarUrl}
                          download={`${poster.judul}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => StorageService.incrementUnduhanMedia('poster', poster.id)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Unduh Poster"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        {poster.id.startsWith('pos-') && !['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'].includes(poster.id) && (
                          <button
                            onClick={() => handleDeleteItem('poster', poster.id, poster.judul)}
                            className="p-1.5 hover:text-rose-600 transition-colors text-slate-400"
                            title="Hapus Poster"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOKUMENTASI INFOGRAFIS */}
      {activeTab === 'infografis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
              Dokumentasi Infografis & Diagram Alur ({filteredInfografis.length})
            </h2>
            <span className="text-[11px] text-slate-400">
              Visualisasi prosedur SOP, data dampak, dan panduan praktis
            </span>
          </div>

          {filteredInfografis.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <BarChart2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Tidak ada infografis yang ditemukan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredInfografis.map((info) => (
                <div
                  key={info.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row group"
                >
                  {/* Left: Visual Thumbnail */}
                  <div
                    onClick={() => openLightbox(info, 'infografis')}
                    className="w-full md:w-5/12 bg-slate-950 cursor-pointer relative min-h-[190px] flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={info.gambarUrl}
                      alt={info.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-xs">
                        <Eye className="w-3 h-3" />
                        Perbesar
                      </span>
                    </div>
                  </div>

                  {/* Right: Info & Takeaways */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                          {info.fokus}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {info.tanggal}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {info.judul}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {info.deskripsi}
                      </p>

                      {/* Poin Penting preview */}
                      {info.poinPenting && info.poinPenting.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          {info.poinPenting.slice(0, 2).map((poin, idx) => (
                            <div key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                              <span className="w-3.5 h-3.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                ✓
                              </span>
                              <span className="line-clamp-1">{poin}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
                        Sumber: {info.sumber || 'Satgas SPANJU'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openLightbox(info, 'infografis')}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Buka Detail</span>
                        </button>

                        <a
                          href={info.gambarUrl}
                          download={`${info.judul}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Unduh Infografis"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LINK VIDEO */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-600" />
                Koleksi Video Edukasi & Sosialisasi ({filteredVideo.length})
              </h2>
              <span className="text-[11px] text-slate-400">
                Dokumentasi kegiatan inovasi, roadshow, sosialisasi anti-perundungan, dan deklarasi ramah anak UPT SMPN 7 Pasuruan
              </span>
            </div>

            <button
              onClick={handleResetVideos}
              className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
              title="Kembalikan atau sinkronkan ke 7 video resmi PASS TEMENAN"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat 7 Video Resmi</span>
            </button>
          </div>

          {filteredVideo.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Video className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Tidak ada video yang sesuai dengan filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideo.map((video) => (
                <div
                  key={video.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-lg transition-all flex flex-col group"
                >
                  {/* Thumbnail / Player Preview */}
                  <div
                    onClick={() => setSelectedVideo(video)}
                    className="relative aspect-video bg-black cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={
                        video.thumbnailUrl ||
                        (video.youtubeId
                          ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                          : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80')
                      }
                      alt={video.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-95"
                      referrerPolicy="no-referrer"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-rose-600 group-hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Top Tag & Duration */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                        {video.kategori}
                      </span>
                    </div>

                    {video.durasi && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 text-white flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-400" />
                          {video.durasi}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {video.judul}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {video.deskripsi}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[140px] text-[11px]">
                        {video.narasumber || 'SPANJU'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Putar</span>
                        </button>

                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Buka Video di YouTube"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleDeleteItem('video', video.id, video.judul)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Video Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PESAN EDUKATIF */}
      {activeTab === 'pesan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-emerald-600" />
              Kutipan & Pesan Edukatif Harian ({filteredPesan.length})
            </h2>
            <span className="text-[11px] text-slate-400">
              Kata bijak motivasi untuk disebarkan ke grup WhatsApp kelas
            </span>
          </div>

          {filteredPesan.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Quote className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Tidak ada pesan edukatif yang sesuai dengan filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPesan.map((pesan, idx) => {
                const isCopied = copiedId === pesan.id;
                // Palette variations for quote cards
                const colorBorders = [
                  'border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/20',
                  'border-teal-200 dark:border-teal-800/60 bg-gradient-to-br from-teal-50/50 via-white to-sky-50/30 dark:from-teal-950/20 dark:via-slate-900 dark:to-sky-950/20',
                  'border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/20',
                  'border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/20',
                ];
                const cardStyle = colorBorders[idx % colorBorders.length];

                return (
                  <div
                    key={pesan.id}
                    className={`rounded-2xl p-5 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${cardStyle}`}
                  >
                    <div className="space-y-3">
                      {/* Topic Pill & Target */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {pesan.topik}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Untuk: {pesan.rekomendasiUntuk || 'Semua Siswa'}
                        </span>
                      </div>

                      {/* Quote Body */}
                      <div className="relative pt-1">
                        <Quote className="w-6 h-6 text-emerald-500/25 dark:text-emerald-400/20 absolute -top-1 -left-1" />
                        <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed italic pl-3 relative z-10 font-sans">
                          &ldquo;{pesan.kutipan}&rdquo;
                        </p>
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-2 pt-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                          {pesan.penulis.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {pesan.penulis}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Share & Like Toolbar */}
                    <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleLike(pesan.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:scale-105 transition-transform"
                      >
                        <Heart className="w-4 h-4 fill-current text-rose-500" />
                        <span>{pesan.sukaCount || 1}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyQuote(pesan)}
                          title="Salin Kutipan"
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(pesan)}
                          title="Bagikan ke WhatsApp"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Kirim WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <MediaLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        imageUrl={lightboxData.imageUrl}
        type={lightboxData.type}
        meta={lightboxData.meta}
      />

      <MateriDetailModal
        isOpen={!!selectedMateri}
        onClose={() => setSelectedMateri(null)}
        materi={selectedMateri}
      />

      <VideoPlayerModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
      />

      <TambahMediaModal
        isOpen={isTambahModalOpen}
        onClose={() => setIsTambahModalOpen(false)}
        defaultTab={activeTab}
        onSuccess={() => onRefresh()}
      />
    </div>
  );
};
