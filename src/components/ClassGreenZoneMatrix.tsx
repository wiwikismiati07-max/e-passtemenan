import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  Filter,
  Eye,
  Search,
  HeartHandshake,
  Layers,
} from 'lucide-react';
import { ClassZoneInfo, INITIAL_CLASS_ZONE_DATA } from '../data/classZoneData';
import { AppDatabase } from '../types';
import { calculateClassZoneData } from '../utils/analysisAggregator';
import { ClassDetailModal } from './ClassDetailModal';

interface ClassGreenZoneMatrixProps {
  db?: AppDatabase;
}

export const ClassGreenZoneMatrix: React.FC<ClassGreenZoneMatrixProps> = ({ db }) => {
  const [selectedTingkat, setSelectedTingkat] = useState<'all' | '7' | '8' | '9'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassZoneInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute live class zone data if db is present
  const classList = db ? calculateClassZoneData(db) : INITIAL_CLASS_ZONE_DATA;

  const filteredClasses = classList.filter((cls) => {
    const matchTingkat = selectedTingkat === 'all' || cls.tingkat === selectedTingkat;
    const matchSearch =
      cls.namaKelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.waliKelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.dutaAntiBullying.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTingkat && matchSearch;
  });

  const totalClasses = classList.length;
  const greenClasses = classList.filter((c) => c.statusZona === 'ZONA_HIJAU').length;

  const handleOpenDetail = (cls: ClassZoneInfo) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  return (
    <div id="zona-hijau-per-kelas" className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-7 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">
                  Zona Hijau No Bullying & Kekerasan (7A - 7H, 8A - 8H, 9A - 9H)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  {greenClasses}/{totalClasses} Kelas Terakreditasi Hijau
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>Monitoring status keamanan, deklarasi damai, dan duta anti-perundungan setiap rombel di SMPN 7 Pasuruan</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <Layers className="w-3 h-3" />
                  <span>Analisis Real-time 4 Aplikasi</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kelas / duta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-36 sm:w-44"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setSelectedTingkat('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedTingkat === 'all'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua (24)
            </button>
            <button
              onClick={() => setSelectedTingkat('7')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedTingkat === '7'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kls 7 (8)
            </button>
            <button
              onClick={() => setSelectedTingkat('8')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedTingkat === '8'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kls 8 (8)
            </button>
            <button
              onClick={() => setSelectedTingkat('9')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedTingkat === '9'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kls 9 (8)
            </button>
          </div>
        </div>
      </div>

      {/* Grid Container for 2 Rows with Vertical Scroll */}
      <div className="max-h-[460px] overflow-y-auto pr-1 sm:pr-2 mt-4 space-y-3 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredClasses.map((cls) => {
            const totalKasus = cls.kasusVerbal + cls.kasusFisik + cls.kasusRelasional + cls.kasusSiber;

            return (
              <div
                key={cls.id}
                onClick={() => handleOpenDetail(cls)}
                className="group relative rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 p-4 hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-700 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header (Fixed layout - no text clipping/overlapping) */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center font-display shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        {cls.namaKelas}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display truncate">
                          Kelas {cls.namaKelas}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                          {cls.waliKelas}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 flex items-center gap-1 ${
                        cls.statusZona === 'ZONA_HIJAU'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : cls.statusZona === 'ZONA_KUNING'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          cls.statusZona === 'ZONA_HIJAU'
                            ? 'bg-emerald-500'
                            : cls.statusZona === 'ZONA_KUNING'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      ></span>
                      <span>
                        {cls.statusZona === 'ZONA_HIJAU'
                          ? 'ZONA HIJAU'
                          : cls.statusZona === 'ZONA_KUNING'
                          ? 'ZONA KUNING'
                          : 'ZONA MERAH'}
                      </span>
                    </span>
                  </div>

                  {/* Duta Anti-Bullying */}
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 my-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Duta Anti-Bullying:
                    </span>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                      {cls.dutaAntiBullying}
                    </p>
                  </div>

                  {/* Ikrar Quote */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed mb-3">
                    &quot;{cls.ikrarSiswa}&quot;
                  </p>
                </div>

                {/* Card Footer Status */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {totalKasus === 0
                        ? 'Zero Bullying'
                        : `${cls.kasusSelesai}/${totalKasus} Kasus Tuntas`}
                    </span>
                  </div>
                  <span className="font-bold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                    <span>Detail</span>
                    <Eye className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Info Hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Menampilkan <strong className="text-slate-700 dark:text-slate-200">{filteredClasses.length}</strong> rombel kelas
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span>↕ Gulir ke bawah untuk melihat baris kelas lainnya</span>
        </span>
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-xs">
          Tidak ditemukan kelas yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
        </div>
      )}

      {/* Class Detail Modal */}
      <ClassDetailModal
        classInfo={selectedClass}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
