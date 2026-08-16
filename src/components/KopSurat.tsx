import React from 'react';

interface KopSuratProps {
  judulLaporan?: string;
  nomorSurat?: string;
  tanggalSurat?: string;
  className?: string;
}

export const KopSurat: React.FC<KopSuratProps> = ({
  judulLaporan,
  nomorSurat,
  tanggalSurat,
  className = '',
}) => {
  return (
    <div className={`w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 ${className}`}>
      {/* Top Header Grid with Left and Right Logos */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Logo: Logo Dinas Pendidikan / Pemkot Pasuruan */}
        <div className="shrink-0 w-14 h-16 sm:w-20 sm:h-24 flex items-center justify-center">
          <img
            src="https://i.ibb.co.com/C3Y7JXkN/logo-dinas.png"
            alt="Logo Pemerintah Kota Pasuruan"
            className="w-full h-full object-contain filter drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Center Text Header (Official Indonesian School Format) */}
        <div className="flex-1 text-center font-serif px-1 sm:px-2">
          <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-wide uppercase text-slate-900 dark:text-white leading-tight">
            PEMERINTAH KOTA PASURUAN
          </h2>
          <h1 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-wider uppercase text-slate-900 dark:text-white leading-snug">
            UPT SMP NEGERI 7
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-tight mt-0.5">
            Jalan Simpang Slamet Riadi Nomor 2, Kota Pasuruan, Jawa Timur, 67139
          </p>
          <p className="text-[10px] sm:text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-tight">
            Telepon (0343) 426845
          </p>
          <p className="text-[9px] sm:text-[11px] md:text-xs italic text-slate-600 dark:text-slate-400 leading-tight">
            Pos-el &nbsp;<span className="not-italic font-sans">smp7pas@yahoo.co.id</span>, &nbsp;Laman &nbsp;<span className="not-italic font-sans">www.smpn7pasuruan.sch.id</span>
          </p>
        </div>

        {/* Right Logo: Logo UPT SMP Negeri 7 Pasuruan */}
        <div className="shrink-0 w-14 h-16 sm:w-20 sm:h-24 flex items-center justify-center">
          <img
            src="https://iili.io/KDFk4fI.png"
            alt="Logo SMPN 7 Pasuruan"
            className="w-full h-full object-contain filter drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Official Government Double Divider Line (Garis Ganda Tebal & Tipis) */}
      <div className="w-full my-2.5 space-y-[2px]">
        <div className="h-[2.5px] bg-slate-900 dark:bg-white w-full rounded-full" />
        <div className="h-[1px] bg-slate-900 dark:bg-white w-full" />
      </div>

      {/* Optional Report Title / Nomor Surat Header */}
      {judulLaporan && (
        <div className="text-center pt-1 pb-2">
          <h3 className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white underline decoration-2 underline-offset-4">
            {judulLaporan}
          </h3>
          {nomorSurat && (
            <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">
              Nomor: {nomorSurat}
            </p>
          )}
          {tanggalSurat && (
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Periode / Tanggal: <span className="font-semibold">{tanggalSurat}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
