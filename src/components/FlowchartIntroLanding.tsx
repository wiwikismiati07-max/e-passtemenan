import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Workflow,
  CheckCircle2,
  FileImage,
  ChevronDown,
} from 'lucide-react';

interface FlowchartIntroLandingProps {
  onEnterApp: () => void;
}

export const FlowchartIntroLanding: React.FC<FlowchartIntroLandingProps> = ({ onEnterApp }) => {
  const flowcharts = [
    {
      id: 'bagan-1',
      number: '01',
      title: 'Bagan Struktur Tolak Ukur E-Pass Temenan',
      subtitle: 'Kerangka Kerja & Indikator Satgas Anti Perundungan SPANJU',
      webLink: 'https://ibb.co.com/Tx9BwDfb',
      localUrl: '/images/bagan-1.png',
      fallbackUrl: 'https://i.ibb.co/S4FX6Djd/Bagan-Struktur-Tolak-Ukur-E-Pass-Temenan-Spanju.png',
      badge: 'Struktur Utama',
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'bagan-2',
      number: '02',
      title: 'Alur Penilaian Tolak Ukur & Bagan Keputusan',
      subtitle: 'Tahapan Evaluasi, Bobot Penilaian, dan Klasifikasi Keputusan',
      webLink: 'https://ibb.co.com/FpgTjqT',
      localUrl: '/images/bagan-2.png',
      fallbackUrl: 'https://i.ibb.co/XHSRvkR/Alur-Penilaian-Tolak-Ukur-Bagan-Keputusan.png',
      badge: 'Bagan Keputusan',
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'bagan-3',
      number: '03',
      title: 'Diagram Alur Respon Tindak Lanjut Laporan',
      subtitle: 'Prosedur Respon Cepat, Penanganan 4 Pilar, dan Pendampingan BK',
      webLink: 'https://ibb.co.com/NgKRd6S8',
      localUrl: '/images/bagan-3.png',
      fallbackUrl: 'https://i.ibb.co/spq7dvH0/Diagram-Alur-Penilaian-Respon-Laporan.png',
      badge: 'Tindak Lanjut',
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner & Call To Action Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 md:p-10 shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                PANDUAN OPERASIONAL RESMI
              </span>
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-slate-200 font-bold text-xs border border-white/20">
                UPT SMP Negeri 7 Pasuruan
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-black font-display tracking-tight uppercase text-white leading-tight">
              BAGAN & ALUR TOLAK UKUR E-PASS TEMENAN SPANJU
            </h2>

            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
              Silakan pelajari bagan struktur, alur penilaian tolak ukur, dan diagram alur respon tindak lanjut berikut sebelum mengakses menu utama aplikasi.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-indigo-200">
              <Workflow className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gambar ditampilkan penuh kebawah (bebas scroll vertikal)</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 w-full lg:w-auto">
            <button
              onClick={onEnterApp}
              className="w-full lg:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm md:text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] btn-3d"
            >
              <span>MASUK KE APLIKASI E-PASS TEMENAN</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Quick Anchors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Lompat Cepat Ke Bagan:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {flowcharts.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>{item.number}. {item.badge}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Full-width Stacked Flowchart Images (Natural Vertical Scroll) */}
      <div className="space-y-10">
        {flowcharts.map((item) => (
          <div
            id={item.id}
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden scroll-mt-24 transition-colors"
          >
            {/* Header Title Bar */}
            <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-0.5 rounded-full font-black text-xs uppercase tracking-wider ${item.badgeColor}`}>
                    BAGAN {item.number} • {item.badge}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white font-display pt-1">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                  {item.subtitle}
                </p>
              </div>
            </div>

            {/* Natural Full Image Container - Crisp & Scaled for Studio and Vercel */}
            <div className="p-3 sm:p-6 bg-slate-100/60 dark:bg-slate-950/80 flex justify-center items-center">
              <img
                src={item.localUrl}
                alt={item.title}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== item.fallbackUrl) {
                    target.src = item.fallbackUrl;
                  }
                }}
                className="w-full h-auto object-contain rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 bg-white min-h-[300px]"
                loading="eager"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sticky Enter Application Banner */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white p-4 md:p-5 rounded-2xl shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold font-display">Siap Menggunakan Aplikasi?</h4>
            <p className="text-xs text-slate-300">Klik tombol di samping untuk langsung mengakses seluruh formulir & rekapitulasi.</p>
          </div>
        </div>

        <button
          onClick={onEnterApp}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <span>MASUK KE MENU APLIKASI</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
