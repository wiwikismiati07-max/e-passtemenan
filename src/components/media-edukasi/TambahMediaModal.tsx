import React, { useState } from 'react';
import {
  X,
  Plus,
  BookOpen,
  Image as ImageIcon,
  BarChart2,
  Video,
  Quote,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import { MediaEdukasiSubTab } from '../../types';
import { StorageService } from '../../services/storage';

interface TambahMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: MediaEdukasiSubTab;
  onSuccess: () => void;
}

export const TambahMediaModal: React.FC<TambahMediaModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'materi',
  onSuccess,
}) => {
  const [selectedTab, setSelectedTab] = useState<MediaEdukasiSubTab>(defaultTab);

  // Common Form States
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [penulis, setPenulis] = useState('');
  const [urlMedia, setUrlMedia] = useState('');
  const [formatDokumen, setFormatDokumen] = useState<'PDF' | 'DOCX' | 'SLIDES' | 'ARTIKEL'>('PDF');
  const [durasi, setDurasi] = useState('');
  const [topik, setTopik] = useState('');
  const [rekomendasi, setRekomendasi] = useState('Semua Siswa');
  const [tagsInput, setTagsInput] = useState('');
  const [poinPentingInput, setPoinPentingInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    try {
      const res = await StorageService.uploadPhotoToSupabase(file, 'media-edukasi');
      if (res.url) {
        setUrlMedia(res.url);
      } else {
        // Fallback to data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setUrlMedia(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch {
      setErrorMessage('Gagal mengunggah file. Silakan masukkan link URL langsung.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedTab === 'pesan') {
      if (!deskripsi.trim()) {
        setErrorMessage('Teks kutipan pesan edukatif wajib diisi.');
        return;
      }
      const newItem = {
        id: `pes-${Date.now()}`,
        kutipan: deskripsi.trim(),
        penulis: penulis.trim() || 'Keluarga Besar SPANJU',
        topik: topik.trim() || 'Motivasi',
        kategori: kategori.trim() || 'Pesan Edukatif',
        tanggal: new Date().toISOString().split('T')[0],
        rekomendasiUntuk: rekomendasi,
        sukaCount: 1,
      };
      StorageService.saveMediaEdukasiItem('pesan', newItem);
      onSuccess();
      onClose();
      return;
    }

    if (!judul.trim()) {
      setErrorMessage('Judul media edukasi wajib diisi.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    switch (selectedTab) {
      case 'materi': {
        const tags = tagsInput
          ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
          : ['Materi', 'Edukasi'];
        const item = {
          id: `mat-${Date.now()}`,
          judul: judul.trim(),
          kategori: kategori.trim() || 'Materi Edukasi',
          ringkasan: deskripsi.trim() || judul.trim(),
          kontenLengkap: deskripsi.trim(),
          penulis: penulis.trim() || 'Guru / Satgas SPANJU',
          tanggal: todayStr,
          linkDokumen: urlMedia.trim() || undefined,
          fileFormat: formatDokumen,
          bacaanMenit: 5,
          tags,
          unduhanCount: 0,
        };
        StorageService.saveMediaEdukasiItem('materi', item);
        break;
      }
      case 'poster': {
        const item = {
          id: `pos-${Date.now()}`,
          judul: judul.trim(),
          tema: kategori.trim() || 'Anti-Bullying',
          deskripsi: deskripsi.trim() || judul.trim(),
          gambarUrl: urlMedia.trim() || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
          kreator: penulis.trim() || 'Warga SMPN 7 Pasuruan',
          tanggal: todayStr,
          resolusi: 'HD (1080 x 1350 px)',
          unduhanCount: 0,
          isKaryaSiswa: true,
        };
        StorageService.saveMediaEdukasiItem('poster', item);
        break;
      }
      case 'infografis': {
        const poinPenting = poinPentingInput
          ? poinPentingInput.split('\n').map((p) => p.trim()).filter(Boolean)
          : ['Pencegahan perundungan di lingkungan sekolah.'];
        const item = {
          id: `info-${Date.now()}`,
          judul: judul.trim(),
          fokus: kategori.trim() || 'Infografis Edukasi',
          deskripsi: deskripsi.trim() || judul.trim(),
          gambarUrl: urlMedia.trim() || 'https://images.weserv.nl/?url=i.ibb.co/spq7dvH0/Diagram-Alur-Penilaian-Respon-Laporan.png&w=1200&output=jpg&q=85',
          sumber: penulis.trim() || 'Satgas PPKSP SPANJU',
          poinPenting,
          tanggal: todayStr,
        };
        StorageService.saveMediaEdukasiItem('infografis', item);
        break;
      }
      case 'video': {
        let ytId = '';
        if (urlMedia.includes('youtube.com/watch?v=') || urlMedia.includes('youtu.be/')) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          const match = urlMedia.match(regExp);
          if (match && match[2].length === 11) ytId = match[2];
        }
        const item = {
          id: `vid-${Date.now()}`,
          judul: judul.trim(),
          kategori: kategori.trim() || 'Video Edukasi',
          deskripsi: deskripsi.trim() || judul.trim(),
          videoUrl: urlMedia.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeId: ytId || undefined,
          durasi: durasi.trim() || '04:00',
          narasumber: penulis.trim() || 'Tim Kesiswaan SPANJU',
          tanggal: todayStr,
          thumbnailUrl: ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        };
        StorageService.saveMediaEdukasiItem('video', item);
        break;
      }
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Media Edukasi Digital
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kontribusi materi, poster, infografis, video, atau pesan edukatif
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'materi', label: 'Materi', icon: BookOpen },
              { id: 'poster', label: 'Poster', icon: ImageIcon },
              { id: 'infografis', label: 'Infografis', icon: BarChart2 },
              { id: 'video', label: 'Video', icon: Video },
              { id: 'pesan', label: 'Pesan', icon: Quote },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id as MediaEdukasiSubTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Conditional inputs based on selected tab */}
          {selectedTab !== 'pesan' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul {selectedTab === 'materi' ? 'Materi' : selectedTab === 'poster' ? 'Poster' : selectedTab === 'infografis' ? 'Infografis' : 'Video'} *
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder={`Contoh: ${
                    selectedTab === 'materi'
                      ? 'Modul Pencegahan Cyberbullying untuk Siswa SMP'
                      : selectedTab === 'poster'
                      ? 'Poster Bersama Melawan Bullying'
                      : selectedTab === 'infografis'
                      ? 'Alur Penanganan Laporan Satgas SPANJU'
                      : 'Video Sosialisasi Pass Temenan'
                  }`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori / Tema
                  </label>
                  <input
                    type="text"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    placeholder="Contoh: Pencegahan, BK, Regulasi"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {selectedTab === 'poster' ? 'Kreator / Pembuat' : selectedTab === 'video' ? 'Narasumber / Sumber' : 'Penulis / Sumber'}
                  </label>
                  <input
                    type="text"
                    value={penulis}
                    onChange={(e) => setPenulis(e.target.value)}
                    placeholder="Contoh: Tim BK / Duta Anti-Bullying 8A"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {selectedTab === 'materi' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Format Dokumen
                  </label>
                  <select
                    value={formatDokumen}
                    onChange={(e) => setFormatDokumen(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="PDF">PDF (Dokumen)</option>
                    <option value="SLIDES">SLIDES (Presentasi PPT/Canva)</option>
                    <option value="DOCX">DOCX (Modul Word)</option>
                    <option value="ARTIKEL">ARTIKEL (Bacaan Web)</option>
                  </select>
                </div>
              )}

              {selectedTab === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimasi Durasi Video
                  </label>
                  <input
                    type="text"
                    value={durasi}
                    onChange={(e) => setDurasi(e.target.value)}
                    placeholder="Contoh: 05:20"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Ringkasan Isi
                </label>
                <textarea
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan ringkasan materi, pesan utama poster, atau deskripsi video..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {selectedTab === 'infografis' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Poin Penting (1 baris per poin)
                  </label>
                  <textarea
                    rows={3}
                    value={poinPentingInput}
                    onChange={(e) => setPoinPentingInput(e.target.value)}
                    placeholder="Langkah 1: Lapor ke guru piket&#10;Langkah 2: Konseling BK&#10;Langkah 3: Pemulihan"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              )}

              {selectedTab === 'materi' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kata Kunci / Tags (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Bullying, Upstander, Regulasi, BK"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              )}

              {/* URL or Upload Input */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedTab === 'video'
                    ? 'Tautan Video (YouTube / Google Drive / URL)'
                    : selectedTab === 'materi'
                    ? 'Tautan Dokumen / Google Drive / PDF'
                    : 'Tautan Gambar / Unggah File Foto'}
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      value={urlMedia}
                      onChange={(e) => setUrlMedia(e.target.value)}
                      placeholder={
                        selectedTab === 'video'
                          ? 'https://www.youtube.com/watch?v=...'
                          : 'https://...'
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {(selectedTab === 'poster' || selectedTab === 'infografis') && (
                    <label className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isUploading ? 'Unggah...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>

                {urlMedia && (selectedTab === 'poster' || selectedTab === 'infografis') && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={urlMedia}
                      alt="Pratinjau"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Gambar siap ditampilkan!
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Pesan Edukatif Form */
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kutipan / Pesan Edukatif *
                </label>
                <textarea
                  rows={4}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Tuliskan kata-kata mutiara, pesan moral, atau nasihat anti-perundungan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Penulis / Tokoh Kutipan
                  </label>
                  <input
                    type="text"
                    value={penulis}
                    onChange={(e) => setPenulis(e.target.value)}
                    placeholder="Contoh: Guru BK / Duta Anti-Bullying"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topik Pesan
                  </label>
                  <input
                    type="text"
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    placeholder="Contoh: Empati, Persahabatan, Netiket"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rekomendasi Pembaca
                </label>
                <select
                  value={rekomendasi}
                  onChange={(e) => setRekomendasi(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Semua Siswa">Semua Siswa</option>
                  <option value="Warga Kelas">Warga Kelas</option>
                  <option value="Siswa & Pendidik">Siswa & Pendidik</option>
                  <option value="Duta Anti-Bullying">Duta Anti-Bullying</option>
                  <option value="Orang Tua Siswa">Orang Tua Siswa</option>
                </select>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Media Edukasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
