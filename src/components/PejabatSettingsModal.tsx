import React, { useState, useEffect } from 'react';
import { UserCheck, X, Check, School, ShieldCheck, PenLine, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { StorageService, GURU_BK_OPTIONS } from '../services/storage';
import { SignatureCanvas } from './SignatureCanvas';
import confetti from 'canvas-confetti';

interface PejabatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const PejabatSettingsModal: React.FC<PejabatSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [kepalaNama, setKepalaNama] = useState('');
  const [kepalaNip, setKepalaNip] = useState('');
  const [kepalaJabatan, setKepalaJabatan] = useState('Kepala UPT SMP Negeri 7 Pasuruan');
  const [kepalaTtd, setKepalaTtd] = useState('');

  const [selectedGuruBK, setSelectedGuruBK] = useState('');
  const [guruBKNip, setGuruBKNip] = useState('');
  const [guruBKJabatan, setGuruBKJabatan] = useState('Guru Pendamping / Guru BK');
  const [guruBKTtd, setGuruBKTtd] = useState('');

  const [activeSignTab, setActiveSignTab] = useState<'kepala' | 'guru'>('guru');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = StorageService.getPejabatConfig();
      setKepalaNama(config.kepalaSekolahNama || 'NUR FADILAH, S.Pd., M.Pd');
      setKepalaNip(config.kepalaSekolahNip || '19860410 201001 2 030');
      setKepalaJabatan(config.kepalaSekolahJabatan || 'Kepala UPT SMP Negeri 7 Pasuruan');
      setKepalaTtd(config.kepalaSekolahTtd || '');

      setSelectedGuruBK(config.selectedGuruBK || GURU_BK_OPTIONS[0].nama);
      setGuruBKNip(config.guruBKNip || GURU_BK_OPTIONS[0].nip);
      setGuruBKJabatan(config.guruBKJabatan || 'Guru Pendamping / Guru BK');
      setGuruBKTtd(config.guruBKTtd || '');
    }
  }, [isOpen]);

  const handleSelectGuruPreset = (preset: typeof GURU_BK_OPTIONS[0]) => {
    setSelectedGuruBK(preset.nama);
    setGuruBKNip(preset.nip);
    setGuruBKJabatan(preset.jabatan);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePejabatConfig({
      kepalaSekolahNama: kepalaNama.trim(),
      kepalaSekolahNip: kepalaNip.trim(),
      kepalaSekolahJabatan: kepalaJabatan.trim(),
      kepalaSekolahTtd: kepalaTtd.trim(),
      selectedGuruBK: selectedGuruBK.trim(),
      guruBKNip: guruBKNip.trim(),
      guruBKJabatan: guruBKJabatan.trim(),
      guruBKTtd: guruBKTtd.trim(),
    });

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#0d9488', '#3b82f6', '#8b5cf6'],
    });

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      if (onSaved) onSaved();
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                Pengaturan Pejabat Penandatangan Laporan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilihan Guru Pendamping / Guru BK & Edit Kepala UPT SMPN 7 Pasuruan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSavedSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pengaturan pejabat dan tanda tangan berhasil diperbarui!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* SECTION 1: Guru Pendamping / Guru BK (Dropdown & Presets) */}
          <div className="p-4 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>1. Guru Pendamping / Guru BK</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 font-semibold">
                Pilihan Cepat
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GURU_BK_OPTIONS.map((guru, idx) => {
                const isSelected = selectedGuruBK === guru.nama;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectGuruPreset(guru)}
                    className={`p-3 rounded-xl text-left text-xs transition-all border ${
                      isSelected
                        ? 'border-teal-500 bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-200 shadow-sm ring-2 ring-teal-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{guru.nama}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      NIP. {guru.nip}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Editable Fields for Guru BK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Guru Pendamping / Guru BK:
                </label>
                <input
                  type="text"
                  value={selectedGuruBK}
                  onChange={(e) => setSelectedGuruBK(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  NIP Guru:
                </label>
                <input
                  type="text"
                  value={guruBKNip}
                  onChange={(e) => setGuruBKNip(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Kepala UPT SMP Negeri 7 Pasuruan (Editable Nama & NIP) */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <School className="w-4 h-4 text-blue-600" />
                <span>2. Kepala UPT SMP Negeri 7 Pasuruan (Bisa Di-edit)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 font-semibold">
                Mengetahui
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Kepala Sekolah:
                </label>
                <input
                  type="text"
                  value={kepalaNama}
                  onChange={(e) => setKepalaNama(e.target.value)}
                  placeholder="Contoh: NUR FADILAH, S.Pd., M.Pd"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  NIP Kepala Sekolah:
                </label>
                <input
                  type="text"
                  value={kepalaNip}
                  onChange={(e) => setKepalaNip(e.target.value)}
                  placeholder="Contoh: 19860410 201001 2 030"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Tanda Tangan Digital Touchscreen untuk Keduanya */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PenLine className="w-4 h-4 text-purple-600" />
                <span>Tanda Tangan Digital Layar Sentuh / Mouse</span>
              </label>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveSignTab('guru')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeSignTab === 'guru'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  TTD Guru BK
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSignTab('kepala')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeSignTab === 'kepala'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  TTD Kepala Sekolah
                </button>
              </div>
            </div>

            {activeSignTab === 'guru' ? (
              <SignatureCanvas
                label={`Tanda Tangan: ${selectedGuruBK}`}
                initialValue={guruBKTtd}
                onSave={(dataUrl) => setGuruBKTtd(dataUrl)}
                onClear={() => setGuruBKTtd('')}
                height={130}
              />
            ) : (
              <div className="space-y-2">
                <SignatureCanvas
                  label={`Tanda Tangan: ${kepalaNama} (Kepala Sekolah)`}
                  initialValue={kepalaTtd}
                  onSave={(dataUrl) => setKepalaTtd(dataUrl)}
                  onClear={() => setKepalaTtd('')}
                  height={130}
                />

                {kepalaTtd && kepalaTtd.startsWith('data:image') && (
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1 overflow-hidden">
                      <img
                        src={kepalaTtd}
                        alt="Preview TTD"
                        className="max-h-full max-w-full object-contain relative z-10"
                      />
                      <img
                        src="https://i.ibb.co.com/wrcwZdrK/STEMPEL.png"
                        alt="Stempel Sekolah"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80 z-20 mix-blend-multiply dark:mix-blend-normal"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-blue-900 dark:text-blue-200 block">
                        ✓ Logo Stempel Resmi Sekolah Terpasang
                      </span>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                        Stempel sekolah otomatis ditumpangkan di atas tanda tangan Kepala Sekolah pada seluruh format laporan resmi aplikasi.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pejabat & TTD</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
