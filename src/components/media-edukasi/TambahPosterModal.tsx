import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Eye,
  Trash2,
} from 'lucide-react';
import { PosterEdukasiItem } from '../../types';
import { StorageService } from '../../services/storage';
import { compressImage } from '../../utils/imageCompressor';

interface TambahPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TEMA_OPTIONS = [
  'Kampanye Utama',
  'Anti-Perundungan',
  'Pertemanan Positif',
  'Stop Cyberbullying',
  'Keberanian & Kepedulian',
  'Karakter Pelajar Pancasila',
  'Sekolah Ramah Anak',
  'Lainnya',
];

export const TambahPosterModal: React.FC<TambahPosterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [judul, setJudul] = useState('');
  const [tema, setTema] = useState('Kampanye Utama');
  const [customTema, setCustomTema] = useState('');
  const [kreator, setKreator] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isKaryaSiswa, setIsKaryaSiswa] = useState(true);
  const [gambarUrl, setGambarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadTab, setUploadTab] = useState<'upload' | 'url'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar yang valid (JPG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Ukuran file gambar maksimal 15MB.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);

    try {
      // 1. Client-side compression for high clarity, fast loading, and quota safety
      const compressed = await compressImage(file, 1200, 0.76);

      // 2. Try cloud upload with compressed blob if configured
      try {
        const uploadRes = await StorageService.uploadPhotoToSupabase(compressed.blob, 'poster-edukasi');
        if (uploadRes.url) {
          setGambarUrl(uploadRes.url);
          setPreviewUrl(uploadRes.url);
          if (!judul) {
            const fileNameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            setJudul(`Poster ${fileNameClean}`);
          }
          return;
        }
      } catch (cloudErr) {
        console.warn('Cloud poster upload fallback to local storage:', cloudErr);
      }

      // 3. Fallback to compressed DataURL
      setGambarUrl(compressed.dataUrl);
      setPreviewUrl(compressed.dataUrl);
      if (!judul) {
        const fileNameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setJudul(`Poster ${fileNameClean}`);
      }
    } catch (err) {
      console.error('Error handling poster file:', err);
      setErrorMsg('Gagal memproses file gambar. Silakan gunakan format JPG atau PNG.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInput = (val: string) => {
    setGambarUrl(val);
    setPreviewUrl(val.trim());
  };

  const handleClearImage = () => {
    setGambarUrl('');
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalImage = gambarUrl.trim() || previewUrl.trim();
    if (!finalImage) {
      setErrorMsg('Harap unggah gambar poster atau masukkan tautan URL gambar.');
      return;
    }

    const resolvedTema = tema === 'Lainnya' ? (customTema.trim() || 'Kampanye Siswa') : tema;
    const resolvedTitle = judul.trim() || `Poster Edukasi: ${resolvedTema}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newPoster: PosterEdukasiItem = {
      id: `pos-${Date.now()}`,
      judul: resolvedTitle,
      tema: resolvedTema,
      deskripsi:
        deskripsi.trim() ||
        `Poster edukasi kampanye anti-perundungan dan kepedulian siswa UPT SMPN 7 Pasuruan.`,
      gambarUrl: finalImage,
      kreator: kreator.trim() || 'Duta Anti-Bullying SPANJU',
      tanggal: todayStr,
      resolusi: 'HD Standard (1080 x 1350 px)',
      unduhanCount: 0,
      isKaryaSiswa,
    };

    try {
      await StorageService.saveMediaEdukasiItem('poster', newPoster);
    } catch (err) {
      console.warn('Save poster error notice:', err);
    }

    // Reset & close
    setJudul('');
    setDeskripsi('');
    setKreator('');
    setGambarUrl('');
    setPreviewUrl('');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Poster Kampanye Digital
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah karya poster atau simpan gambar edukasi siswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Image Selection / Upload Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              File Poster atau Tautan Gambar <span className="text-amber-600">*</span>
            </label>

            <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setUploadTab('upload')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  uploadTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Unggah File Gambar
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  uploadTab === 'url'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Tempel URL / Link Gambar
              </button>
            </div>

            {uploadTab === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="poster-file-input"
                />
                {!previewUrl ? (
                  <label
                    htmlFor="poster-file-input"
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      Klik untuk memilih file poster dari HP / Laptop
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format: PNG, JPG, JPEG, WEBP (Maksimal 10MB)
                    </p>
                  </label>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={gambarUrl}
                    onChange={(e) => handleUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... atau tautan gambar langsung"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Dapat menggunakan link foto dari web sekolah, Drive publik, atau hosting gambar.
                </p>
              </div>
            )}

            {/* Live Preview Box */}
            {previewUrl && (
              <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-300 dark:border-slate-600 shadow-2xs">
                  <img
                    src={previewUrl}
                    alt="Pratinjau Poster"
                    className="w-full h-full object-cover"
                    onError={() => setErrorMsg('Gagal memuat pratinjau gambar. Periksa URL kembali.')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Gambar Poster Siap Disimpan
                  </span>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {uploadTab === 'upload' ? 'File terpilih & terkompresi' : previewUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Ganti gambar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Judul Poster */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Judul Poster <span className="text-slate-400 font-normal">(Opsional - otomatis terisi)</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Stop Bullying, Bersama Jaga Perdamaian Sekolah!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
            />
          </div>

          {/* 3. Tema / Kategori & Kreator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tema / Kategori Poster
              </label>
              <select
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {TEMA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {tema === 'Lainnya' && (
                <input
                  type="text"
                  value={customTema}
                  onChange={(e) => setCustomTema(e.target.value)}
                  placeholder="Ketik nama tema custom..."
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pembuat / Kreator
              </label>
              <input
                type="text"
                value={kreator}
                onChange={(e) => setKreator(e.target.value)}
                placeholder="Contoh: Duta Siswa Kelas 8A / Satgas SPANJU"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Deskripsi Singkat Pesan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi / Pesan Edukasi Poster
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={2}
              placeholder="Jelaskan pesan atau seruan moral yang ingin disampaikan lewat poster ini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* 5. Checkbox Karya Siswa */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isKaryaSiswa}
                onChange={(e) => setIsKaryaSiswa(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 rounded-md border-slate-300 dark:border-slate-600"
              />
              <span>Tandai sebagai "Karya Orisinal Siswa SPANJU"</span>
            </label>
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Poster ke Galeri</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
