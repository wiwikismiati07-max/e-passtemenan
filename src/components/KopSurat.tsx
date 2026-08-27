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
    <div
      className={`kop-surat-container w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 print:p-0 print:border-none print:bg-transparent print:text-black print:break-inside-avoid ${className}`}
    >
      {/* Top Header Table with Left & Right Logos for Pixel-Perfect Cross-Device & Print Alignment */}
      <table className="w-full border-collapse border-none m-0 p-0 table-fixed select-none">
        <tbody>
          <tr className="align-middle">
            {/* Left Logo: Logo Pemerintah Kota Pasuruan */}
            <td className="w-[55px] sm:w-[75px] print:w-[60px] p-0 text-center align-middle shrink-0">
              <img
                src="https://i.ibb.co.com/C3Y7JXkN/logo-dinas.png"
                alt="Logo Pemerintah Kota Pasuruan"
                className="w-[50px] h-[62px] sm:w-[68px] sm:h-[82px] print:w-[58px] print:h-[72px] object-contain mx-auto filter drop-shadow-xs"
                referrerPolicy="no-referrer"
              />
            </td>

            {/* Center Text Header (Format Standar Surat Kedinasan SMPN 7 Pasuruan) */}
            <td className="p-0 px-2 text-center align-middle font-serif">
              <h2 className="text-xs sm:text-base md:text-lg print:text-[11pt] font-bold tracking-wide uppercase text-slate-900 dark:text-white print:text-black leading-tight m-0">
                PEMERINTAH KOTA PASURUAN
              </h2>
              <h1 className="text-sm sm:text-xl md:text-2xl print:text-[14pt] font-extrabold tracking-wider uppercase text-slate-900 dark:text-white print:text-black leading-snug m-0">
                UPT SMP NEGERI 7
              </h1>
              <p className="text-[8.5px] sm:text-xs md:text-sm print:text-[8pt] text-slate-700 dark:text-slate-300 print:text-black leading-tight mt-0.5 m-0">
                Jalan Simpang Slamet Riadi Nomor 2, Kota Pasuruan, Jawa Timur, 67139
              </p>
              <p className="text-[8.5px] sm:text-xs md:text-sm print:text-[8pt] text-slate-700 dark:text-slate-300 print:text-black leading-tight m-0">
                Telepon (0343) 426845
              </p>
              <p className="text-[8px] sm:text-[11px] md:text-xs print:text-[7.5pt] italic text-slate-600 dark:text-slate-400 print:text-black leading-tight m-0">
                Pos-el &nbsp;<span className="not-italic font-sans font-medium">smp7pas@yahoo.co.id</span>, &nbsp;Laman &nbsp;<span className="not-italic font-sans font-medium">www.smpn7pasuruan.sch.id</span>
              </p>
            </td>

            {/* Right Logo: Logo UPT SMP Negeri 7 Pasuruan */}
            <td className="w-[55px] sm:w-[75px] print:w-[60px] p-0 text-center align-middle shrink-0">
              <img
                src="https://iili.io/KDFk4fI.png"
                alt="Logo SMPN 7 Pasuruan"
                className="w-[50px] h-[62px] sm:w-[68px] sm:h-[82px] print:w-[58px] print:h-[72px] object-contain mx-auto filter drop-shadow-xs"
                referrerPolicy="no-referrer"
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Official Government Double Divider Line (Garis Ganda Tebal & Tipis) */}
      <div className="w-full my-2 sm:my-2.5 print:my-1.5 space-y-[1.5px] print:space-y-[1px]">
        <div className="h-[2.5px] print:h-[2px] bg-slate-900 dark:bg-white print:bg-black w-full rounded-full" />
        <div className="h-[1px] bg-slate-900 dark:bg-white print:bg-black w-full" />
      </div>

      {/* Optional Report Title / Nomor Surat Header */}
      {judulLaporan && (
        <div className="text-center pt-1 pb-1.5 print:pt-1 print:pb-1">
          <h3 className="text-xs sm:text-sm md:text-base print:text-[11pt] font-extrabold uppercase tracking-wide text-slate-900 dark:text-white print:text-black underline decoration-2 underline-offset-4">
            {judulLaporan}
          </h3>
          {nomorSurat && (
            <p className="text-[9.5px] sm:text-xs print:text-[8.5pt] text-slate-600 dark:text-slate-400 print:text-black mt-1 font-mono font-medium">
              Nomor: {nomorSurat}
            </p>
          )}
          {tanggalSurat && (
            <p className="text-[9.5px] sm:text-xs print:text-[8.5pt] text-slate-500 dark:text-slate-400 print:text-black mt-0.5">
              Periode / Tanggal: <span className="font-semibold">{tanggalSurat}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
