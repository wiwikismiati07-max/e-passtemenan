import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Check,
  X,
  Copy,
  BookOpen,
  HeartHandshake,
  ShieldAlert,
  Users,
  Clock,
  Palette,
  Lightbulb,
  Radio,
  FileCheck,
} from 'lucide-react';
import {
  RENCANA_INOVASI_LIST,
  RencanaInovasiItem,
  formatRencanaInovasiText,
} from '../data/rencanaInovasiData';

interface RencanaInovasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (formattedText: string, item: RencanaInovasiItem) => void;
  currentValue?: string;
  targetFieldName?: string;
}

export const RencanaInovasiModal: React.FC<RencanaInovasiModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentValue = '',
  targetFieldName = 'Rencana Inovasi / Kegiatan',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formatMode, setFormatMode] = useState<'lengkap' | 'ringkas' | 'judul_kampanye'>('lengkap');
  const [insertMode, setInsertMode] = useState<'replace' | 'append'>('replace');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<RencanaInovasiItem | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Inovasi', count: RENCANA_INOVASI_LIST.length },
    { id: 'digital', label: 'Kampanye Digital & Media', count: 2 },
    { id: 'literasa', label: 'LITERASA 7 & Olah Rasa', count: 2 },
    { id: 'sebaya', label: 'PASS Temenan & Duta Sebaya', count: 2 },
    { id: 'parenting', label: 'Kolaborasi Orang Tua', count: 2 },
    { id: 'pembiasaan', label: 'Gerakan 7 Menit Peduli', count: 1 },
  ];

  const filteredItems = useMemo(() => {
    return RENCANA_INOVASI_LIST.filter((item) => {
      // Category filter
      let matchesCat = true;
      if (selectedCategory === 'digital') {
        matchesCat =
          item.id === 'modul-1' || item.id === 'inovasi-8' || item.category.toLowerCase().includes('digital');
      } else if (selectedCategory === 'literasa') {
        matchesCat =
          item.id === 'modul-2' || item.id === 'inovasi-6' || item.category.toLowerCase().includes('literasa');
      } else if (selectedCategory === 'sebaya') {
        matchesCat =
          item.id === 'modul-3' || item.id === 'inovasi-7' || item.category.toLowerCase().includes('temenan');
      } else if (selectedCategory === 'parenting') {
        matchesCat =
          item.id === 'modul-4' || item.id === 'inovasi-9' || item.category.toLowerCase().includes('orang tua');
      } else if (selectedCategory === 'pembiasaan') {
        matchesCat = item.id === 'inovasi-5' || item.category.toLowerCase().includes('7 menit');
      }

      if (!matchesCat) return false;

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.category.toLowerCase().includes(q) ||
        (item.modul && item.modul.toLowerCase().includes(q)) ||
        item.judulKegiatan.toLowerCase().includes(q) ||
        (item.fokusKegiatan && item.fokusKegiatan.toLowerCase().includes(q)) ||
        item.materi.some((m) => m.toLowerCase().includes(q)) ||
        (Array.isArray(item.bentukInovasi)
          ? item.bentukInovasi.some((b) => b.toLowerCase().includes(q))
          : item.bentukInovasi?.toLowerCase().includes(q)) ||
        (item.judulKampanye && item.judulKampanye.some((k) => k.toLowerCase().includes(q)))
      );
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleApply = (item: RencanaInovasiItem) => {
    const formatted = formatRencanaInovasiText(item, formatMode);
    let finalOutput = formatted;
    if (insertMode === 'append' && currentValue.trim()) {
      finalOutput = `${currentValue.trim()}\n\n${formatted}`;
    }
    onSelect(finalOutput, item);
    onClose();
  };

  const handleCopy = (item: RencanaInovasiItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = formatRencanaInovasiText(item, formatMode);
    navigator.clipboard.writeText(formatted);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (color: string) => {
    switch (color) {
      case 'purple':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'emerald':
        return <Palette className="w-4 h-4 text-emerald-400" />;
      case 'amber':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'blue':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'indigo':
        return <Clock className="w-4 h-4 text-indigo-400" />;
      case 'rose':
        return <HeartHandshake className="w-4 h-4 text-rose-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
    }
  };

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'emerald':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'amber':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'blue':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      case 'indigo':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60';
      case 'rose':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/60';
      case 'teal':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl shadow-amber-950/80 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl text-amber-400 shadow-sm">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">
                  Pilihan Rencana Inovasi & Kegiatan
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  {RENCANA_INOVASI_LIST.length} Modul & Program
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih modul / inovasi anti-perundungan untuk otomatis mengisi kolom{' '}
                <span className="text-amber-400 font-medium font-mono">{targetFieldName}</span>
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

        {/* Toolbar: Search, Filters, Formatting */}
        <div className="py-3 border-b border-slate-800/80 space-y-3 shrink-0">
          {/* Search bar & Format Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari materi, judul, atau modul..."
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
                <span className="px-2 text-slate-400 font-medium">Format:</span>
                <button
                  type="button"
                  onClick={() => setFormatMode('lengkap')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    formatMode === 'lengkap'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Format lengkap mencakup Judul, Materi Pokok, dan Bentuk Inovasi"
                >
                  Lengkap
                </button>
                <button
                  type="button"
                  onClick={() => setFormatMode('ringkas')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    formatMode === 'ringkas'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Format ringkas: Judul & Bentuk Kegiatan"
                >
                  Ringkas
                </button>
                <button
                  type="button"
                  onClick={() => setFormatMode('judul_kampanye')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    formatMode === 'judul_kampanye'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Format Judul & Slogan Kampanye"
                >
                  Judul & Slogan
                </button>
              </div>

              {currentValue.trim() && (
                <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setInsertMode('replace')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      insertMode === 'replace'
                        ? 'bg-slate-700 text-white font-medium'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Ganti seluruh teks yang ada saat ini"
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertMode('append')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      insertMode === 'append'
                        ? 'bg-slate-700 text-white font-medium'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tambahkan di akhir teks saat ini"
                  >
                    + Sisip
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-700/60 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* List of Innovations */}
        <div className="overflow-y-auto py-3 space-y-3 pr-1 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium">Tidak ada rencana inovasi yang sesuai dengan pencarian</p>
              <p className="text-xs text-slate-500 mt-1">Coba kata kunci lain atau pilih tab kategori berbeda.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/70 hover:border-amber-500/50 rounded-xl p-4 transition-all duration-200 group relative shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Badge and Category Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                            item.color
                          )}`}
                        >
                          {getCategoryIcon(item.color)}
                          {item.categoryBadge}
                        </span>
                        {item.modul && (
                          <span className="text-[11px] text-amber-400/90 font-medium">
                            {item.modul}
                          </span>
                        )}
                      </div>

                      {/* Main Title */}
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.judulKegiatan}
                      </h3>

                      {item.fokusKegiatan && (
                        <p className="text-xs text-slate-300 mt-1 italic">
                          <span className="text-amber-400/90 not-italic font-semibold">Fokus:</span> {item.fokusKegiatan}
                        </p>
                      )}

                      {/* Materi Pokok List */}
                      <div className="mt-2.5 bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/70 text-xs">
                        <p className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          Materi Pokok / Bahasan:
                        </p>
                        <ul className="space-y-1 text-slate-300/90 list-disc list-inside pl-1">
                          {item.materi.map((mat, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {mat}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bentuk Inovasi or Kampanye */}
                      {item.bentukInovasi && (
                        <div className="mt-2.5 text-xs text-emerald-300/90 bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-2.5">
                          <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Bentuk Inovasi Kegiatan:
                          </p>
                          {Array.isArray(item.bentukInovasi) ? (
                            <ul className="space-y-1 list-disc list-inside">
                              {item.bentukInovasi.map((bi, idx) => (
                                <li key={idx}>{bi}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{item.bentukInovasi}</p>
                          )}
                        </div>
                      )}

                      {item.judulKampanye && item.judulKampanye.length > 0 && (
                        <div className="mt-2 text-xs text-amber-300/90 bg-amber-950/20 border border-amber-800/40 rounded-lg p-2">
                          <span className="font-semibold text-amber-400">Judul Kampanye / Slogan: </span>
                          {item.judulKampanye.join('  •  ')}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 sm:pt-1">
                      <button
                        type="button"
                        onClick={() => handleApply(item)}
                        className="flex-1 sm:flex-none w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Pilih Rencana Ini</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopy(item, e)}
                        className="px-3 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-600/60"
                        title="Salin teks terformat ke clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>
            Menampilkan <span className="text-white font-semibold">{filteredItems.length}</span> dari{' '}
            <span className="text-white font-semibold">{RENCANA_INOVASI_LIST.length}</span> template kegiatan
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
