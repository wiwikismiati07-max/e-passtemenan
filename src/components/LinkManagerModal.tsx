import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, ExternalLink, Globe, Sparkles, Check } from 'lucide-react';
import { CustomLink } from '../types';
import { StorageService } from '../services/storage';

interface LinkManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLink?: CustomLink | null;
  onSaved: () => void;
}

const AVAILABLE_ICONS = [
  'Globe',
  'Building2',
  'GraduationCap',
  'BarChart3',
  'FolderArchive',
  'BookOpen',
  'Calendar',
  'Layers',
  'FileText',
  'Compass',
  'ShieldCheck',
  'Award',
  'HeartHandshake',
  'MessageSquare',
  'Activity',
  'Sparkles',
];

const AVAILABLE_COLORS = [
  '#0d9488', // Teal
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#6366f1', // Indigo
];

export const LinkManagerModal: React.FC<LinkManagerModalProps> = ({ isOpen, onClose, editingLink, onSaved }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Aplikasi');
  const [iconName, setIconName] = useState('Globe');
  const [color, setColor] = useState('#0d9488');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title);
      setUrl(editingLink.url);
      setDescription(editingLink.description || '');
      setCategory(editingLink.category || 'Aplikasi');
      setIconName(editingLink.iconName || 'Globe');
      setColor(editingLink.color || '#0d9488');
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setCategory('Aplikasi');
      setIconName('Globe');
      setColor('#0d9488');
    }
    setError('');
  }, [editingLink, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul link / aplikasi tidak boleh kosong');
      return;
    }
    if (!url.trim()) {
      setError('URL link tidak boleh kosong');
      return;
    }

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    StorageService.saveCustomLink({
      id: editingLink?.id,
      title: title.trim(),
      url: finalUrl,
      description: description.trim(),
      category: category.trim(),
      iconName,
      color,
      isCustom: true,
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-2xl shadow-teal-950/50">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                {editingLink ? 'Edit Tautan / Aplikasi' : 'Tambah Tautan / Aplikasi Baru'}
              </h2>
              <p className="text-xs text-slate-400">Kelola tautan menu yang tampil di navigasi dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Judul Aplikasi / Link *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Portal Absensi Guru SPANJU"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Alamat URL (Tautan Web) *
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://contoh-link.sch.id"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Kategori Menu
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Aplikasi">Aplikasi Internal</option>
                <option value="Sekolah">Info Sekolah</option>
                <option value="Kedinasan">Dinas / Kementerian</option>
                <option value="Akademik">Akademik & Guru</option>
                <option value="Evaluasi">Evaluasi / Rapor</option>
                <option value="Arsip">Arsip Dokumen</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Warna Tema
              </label>
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Pilih Ikon Tautan
            </label>
            <div className="grid grid-cols-8 gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIconName(ic)}
                  className={`p-2 rounded-lg text-xs flex items-center justify-center transition-all ${
                    iconName === ic
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={ic}
                >
                  <span className="truncate text-[10px]">{ic.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan singkat fungsi aplikasi"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 btn-3d flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Check className="w-4 h-4" />
              {editingLink ? 'Simpan Perubahan' : 'Tambahkan Tautan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
