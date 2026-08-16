import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Award,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { MonthlyTrendData, MONTHLY_TREND_DATA } from '../data/classZoneData';
import { AppDatabase } from '../types';
import { calculateMonthlyTrendData } from '../utils/analysisAggregator';

interface BullyingTrendChartProps {
  db?: AppDatabase;
}

export const BullyingTrendChart: React.FC<BullyingTrendChartProps> = ({ db }) => {
  const [activeTab, setActiveTab] = useState<'trend' | 'kategori' | 'perbandingan'>('trend');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyTrendData | null>(null);
  const [showBaseline, setShowBaseline] = useState<boolean>(false);

  // Compute live trend data if db exists, otherwise fallback to static preset
  const monthlyData = db ? calculateMonthlyTrendData(db) : MONTHLY_TREND_DATA;

  // Calculate totals
  const totalSebelum = monthlyData.reduce((acc, m) => acc + m.sebelumPassTemenan, 0);
  const totalSesudah = monthlyData.reduce((acc, m) => acc + m.sesudahPassTemenan, 0);
  const totalSelesai = monthlyData.reduce((acc, m) => acc + m.kasusSelesai, 0);
  const persentasePenurunan = totalSebelum > 0 ? (((totalSebelum - totalSesudah) / totalSebelum) * 100).toFixed(1) : '100';

  const totalVerbal = monthlyData.reduce((acc, m) => acc + m.verbal, 0);
  const totalFisik = monthlyData.reduce((acc, m) => acc + m.fisik, 0);
  const totalRelasional = monthlyData.reduce((acc, m) => acc + m.relasional, 0);
  const totalSiber = monthlyData.reduce((acc, m) => acc + m.siber, 0);

  // Chart coordinate helpers
  const chartHeight = 220;
  const chartWidth = 720;
  const maxVal = Math.max(
    10,
    ...monthlyData.map((d) => (showBaseline ? Math.max(d.sebelumPassTemenan, d.sesudahPassTemenan + 2) : d.sesudahPassTemenan + 3))
  );
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (monthlyData.length - 1)) * innerWidth;
  const getY = (value: number) => chartHeight - paddingY - (value / maxVal) * innerHeight;

  // Build SVG Path for line chart
  const pathSebelum = monthlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.sebelumPassTemenan)}`).join(' ');
  const pathSesudah = monthlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.sesudahPassTemenan)}`).join(' ');
  
  // Area fill under 'Sesudah Pass Temenan' line
  const areaSesudah = `${pathSesudah} L ${getX(monthlyData.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`;

  return (
    <div id="grafik-tren-kasus-bullying" className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-7 shadow-sm">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">
                  Grafik Tren Peningkatan & Penurunan Kasus
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  {showBaseline ? `- ${persentasePenurunan}% Penurunan` : `2026: ${totalSesudah} Kasus`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>Data efektivitas program Pass Temenan dalam menekan kekerasan & perundungan di SMPN 7 Pasuruan</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <Layers className="w-3 h-3" />
                  <span>Hasil Agregasi 4 Aplikasi</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl self-start md:self-auto border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'trend'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Tren Bulanan</span>
          </button>
          <button
            onClick={() => setActiveTab('kategori')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'kategori'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Kategori Kasus</span>
          </button>
          <button
            onClick={() => setActiveTab('perbandingan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'perbandingan'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Tingkat Resolusi</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              {showBaseline ? 'Penurunan Kasus' : 'Efektivitas Inovasi'}
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-display">
            {showBaseline ? `${persentasePenurunan}%` : '100%'}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">
            {showBaseline ? 'Dibanding sebelum inovasi' : 'Monitoring real-time aktif'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Kasus Tahun 2026</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400 font-display">
            {totalSesudah} Kasus
          </p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400/80 mt-0.5">
            100% tertangani & damai
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Tingkat Mediasi BK</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-400 font-display">
            100%
          </p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400/80 mt-0.5">
            Respon cepat &lt; 24 jam
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Indeks Sekolah Aman</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 font-display">
            99.6%
          </p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">
            24 Kelas Zona Hijau
          </p>
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      {activeTab === 'trend' && (
        <div className="mt-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-1 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  Sesudah Inovasi Pass Temenan 2026 (Tahun Ini: {totalSesudah} Kasus)
                </span>
              </div>

              {showBaseline && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Sebelum Pass Temenan (Tahun Lalu: {totalSebelum} Kasus)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBaseline(!showBaseline)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                title={showBaseline ? 'Sembunyikan grafik baseline tahun lalu' : 'Tampilkan grafik pembanding baseline tahun lalu'}
              >
                {showBaseline ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sembunyikan Baseline</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ Baseline Tahun Lalu</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[600px] select-none"
            >
              <defs>
                <linearGradient id="greenAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 5, 10, 15, 20].map((val) => (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={getY(val)}
                    x2={chartWidth - paddingX}
                    y2={getY(val)}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 10}
                    y={getY(val) + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-bold"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {/* Area Gradient for Pass Temenan */}
              <path d={areaSesudah} fill="url(#greenAreaGrad)" />

              {/* Line 1: Sebelum Pass Temenan (Red dashed) - Only shown if showBaseline is true */}
              {showBaseline && (
                <path
                  d={pathSebelum}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Line 2: Sesudah Pass Temenan (Emerald solid) */}
              <path
                d={pathSesudah}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points for Sebelum - Only shown if showBaseline is true */}
              {showBaseline &&
                monthlyData.map((d, i) => (
                  <circle
                    key={`seb-${i}`}
                    cx={getX(i)}
                    cy={getY(d.sebelumPassTemenan)}
                    r="3.5"
                    className="fill-rose-500"
                  />
                ))}

              {/* Interactive Points for Sesudah */}
              {monthlyData.map((d, i) => {
                const cx = getX(i);
                const cy = getY(d.sesudahPassTemenan);
                const isHovered = hoveredMonth?.bulan === d.bulan;
                return (
                  <g
                    key={`ses-${i}`}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredMonth(d)}
                    onClick={() => setHoveredMonth(d)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '7' : '4.5'}
                      className="fill-emerald-600 stroke-white dark:stroke-slate-900 stroke-2 transition-all"
                    />
                    {/* Month Label */}
                    <text
                      x={cx}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className={`text-[11px] font-bold ${
                        isHovered ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-slate-500 dark:fill-slate-400'
                      }`}
                    >
                      {d.bulan}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hovered Month Tooltip Card */}
            {hoveredMonth && (
              <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white font-black text-xs">
                    {hoveredMonth.bulan}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white font-display">
                      Bulan {hoveredMonth.bulanFull}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {showBaseline ? (
                        <>
                          Tahun Lalu: <span className="font-bold text-rose-600">{hoveredMonth.sebelumPassTemenan} kasus</span>{' '}
                          ➔ Tahun Ini (Pass Temenan): <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{hoveredMonth.sesudahPassTemenan} kasus</span>
                        </>
                      ) : (
                        <>
                          Tahun Ini (Pass Temenan 2026): <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{hoveredMonth.sesudahPassTemenan} kasus</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                    {hoveredMonth.sesudahPassTemenan === 0 ? '🟢 Zero Kasus (Aman)' : '🟢 100% Terselesaikan'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Breakdown Kategori Kasus */}
      {activeTab === 'kategori' && (
        <div className="space-y-4 my-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rincian penurunan kasus kekerasan dan perundungan berdasarkan klasifikasi 4 pilar di SMPN 7 Pasuruan:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  1. Perundungan Verbal (Ejekan / Panggilan Negatif)
                </span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">{totalVerbal} Kasus</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Seluruh {totalVerbal} kasus telah dimediasi damai oleh Guru BK & Duta Temenan dalam waktu &lt; 24 jam.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  2. Perundungan Fisik (Dorongan / Kontak Kasar)
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{totalFisik} Kasus</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '10%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Hanya 1 kasus minor saat olahraga pada bulan Jan, terselesaikan tanpa cedera.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  3. Perundungan Relasional (Pengucilan / Isolasi Sosial)
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">{totalRelasional} Kasus</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Ditekan melalui program sahabat sebaya dan Senandung Serasi di setiap kelas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  4. Siber / Online (Cyberbullying Grup WhatsApp / Medsos)
                </span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">{totalSiber} Kasus (Nol)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Zero Kasus. Panduan etika digital dan literasi internet sehat berjalan optimal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tingkat Resolusi & Penanganan */}
      {activeTab === 'perbandingan' && (
        <div className="space-y-4 my-2">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300 dark:border-emerald-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white font-display">
                    Tingkat Resolusi & Restorative Justice: 100% Selesai Damai
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Semua temuan kasus dan pengaduan langsung ditindaklanjuti secara kekeluargaan oleh Tim Satgas Pencegahan dan Penanganan Kekerasan (TPPK) SMPN 7 Pasuruan bersama Guru BK dan Wali Kelas tanpa adanya hukuman fisik, melainkan pembinaan karakter positif.
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0 p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                  {totalSelesai} / {totalSesudah}
                </p>
                <span className="text-[10px] font-bold text-slate-500">Kasus Tuntas 100%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
