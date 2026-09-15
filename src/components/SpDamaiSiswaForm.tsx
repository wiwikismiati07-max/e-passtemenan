import React, { useState, useEffect } from 'react';
import {
  Handshake,
  Calendar,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  User,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../utils/exportUtils';
import { SpDamaiSiswa } from '../types';
import { StorageService } from '../services/storage';
import { StudentPickerWidget } from './StudentPickerWidget';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { OfficialReportModal } from './OfficialReportModal';
import { SignatureCanvas } from './SignatureCanvas';
import { getRealtimeDateISO, getRealtimeFullFormattedDate, getRealtimeTimeString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

interface Props {
  initialTab?: 'form' | 'rekap';
  userRole?: 'admin' | 'siswa';
}

const DEFAULT_IKRAR = `1. Saling memaafkan dengan tulus dan tidak akan mengungkit atau memperpanjang masalah ini lagi.
2. Kembali berteman dengan baik serta tidak akan saling mengejek, mengancam, memprovokasi, atau melakukan kekerasan dalam bentuk apa pun.
3. Siap menerima sanksi tegas dari pihak sekolah sesuai dengan aturan yang berlaku apabila melanggar janji ini.`;

export const SpDamaiSiswaForm: React.FC<Props> = ({
  initialTab = 'form',
  userRole = 'admin',
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'rekap'>(initialTab);
  const [records, setRecords] = useState<SpDamaiSiswa[]>([]);
  
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [namaSiswaPertama, setNamaSiswaPertama] = useState('');
  const [kelasSiswaPertama, setKelasSiswaPertama] = useState('');
  const [namaSiswaKedua, setNamaSiswaKedua] = useState('');
  const [kelasSiswaKedua, setKelasSiswaKedua] = useState('');
  const [hariTanggalKejadian, setHariTanggalKejadian] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2026-2027');
  const [poinIkrar, setPoinIkrar] = useState(DEFAULT_IKRAR);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewReportId, setViewReportId] = useState<string | null>(null);
  
  useEffect(() => {
    loadData();
    if (!editingId) {
       setHariTanggalKejadian(getRealtimeFullFormattedDate());
    }
  }, []);

  const loadData = async () => {
    const data = StorageService.getDb();
    setRecords(data.spDamaiSiswa || []);
    const tahunAjaranAktif = StorageService.getTahunAjaranAktif();
    if (tahunAjaranAktif && !editingId) {
       setTahunAjaran(tahunAjaranAktif);
    }
  };

  const resetForm = async () => {
    setEditingId(null);
    setNamaSiswaPertama('');
    setKelasSiswaPertama('');
    setNamaSiswaKedua('');
    setKelasSiswaKedua('');
    setPoinIkrar(DEFAULT_IKRAR);
    setHariTanggalKejadian(getRealtimeFullFormattedDate());
    
    const tahunAjaranAktif = StorageService.getTahunAjaranAktif();
    if (tahunAjaranAktif) {
       setTahunAjaran(tahunAjaranAktif);
    }
  };

  const handleEdit = (rec: SpDamaiSiswa) => {
    setEditingId(rec.id);
    setNamaSiswaPertama(rec.namaSiswaPertama || '');
    setKelasSiswaPertama(rec.kelasSiswaPertama || '');
    setNamaSiswaKedua(rec.namaSiswaKedua || '');
    setKelasSiswaKedua(rec.kelasSiswaKedua || '');
    setHariTanggalKejadian(rec.hariTanggalKejadian || '');
    setTahunAjaran(rec.tahunAjaran || '2026-2027');
    setPoinIkrar(rec.poinIkrar || DEFAULT_IKRAR);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const updated = records.filter(r => r.id !== deleteTargetId);
    setRecords(updated);
    const db = StorageService.getDb();
    db.spDamaiSiswa = updated;
    StorageService.saveDb();
    setDeleteTargetId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswaPertama || !namaSiswaKedua || !hariTanggalKejadian) {
      alert('Mohon lengkapi data wajib!');
      return;
    }
    
    setIsSubmitting(true);
    const newRecord: SpDamaiSiswa = {
      id: editingId || Date.now().toString(),
      namaSiswaPertama,
      kelasSiswaPertama,
      namaSiswaKedua,
      kelasSiswaKedua,
      hariTanggalKejadian,
      tahunAjaran: tahunAjaran || '2026-2027',
      poinIkrar,
      createdAt: new Date().toISOString(),
    };
    
    let updated;
    if (editingId) {
      updated = records.map(r => r.id === editingId ? newRecord : r);
    } else {
      updated = [newRecord, ...records];
    }
    
    const db = StorageService.getDb();
    db.spDamaiSiswa = updated;
    StorageService.saveDb();
    setRecords(updated);
    
    if (!editingId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setShowSuccessModal(true);
    } else {
      setActiveTab('rekap');
    }
    resetForm();
    setIsSubmitting(false);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/50 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-200/50 dark:border-amber-800/50">
            <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-amber-900 dark:text-amber-400 uppercase text-sm tracking-wider">
              Identitas Siswa Pertama (Pihak 1)
            </h3>
          </div>
          <StudentPickerWidget
            title="Nama Lengkap Siswa Pertama *"
            value={namaSiswaPertama}
            classValue={kelasSiswaPertama}
            onValueChange={setNamaSiswaPertama}
            onClassChange={setKelasSiswaPertama}
            colorScheme="red"
          />
        </div>
        
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-emerald-200/50 dark:border-emerald-800/50">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-emerald-900 dark:text-emerald-400 uppercase text-sm tracking-wider">
              Identitas Siswa Kedua (Pihak 2)
            </h3>
          </div>
          <StudentPickerWidget
            title="Nama Lengkap Siswa Kedua *"
            value={namaSiswaKedua}
            classValue={kelasSiswaKedua}
            onValueChange={setNamaSiswaKedua}
            onClassChange={setKelasSiswaKedua}
            colorScheme="blue"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Calendar className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-800 dark:text-white uppercase text-sm tracking-wider">
            Detail Perselisihan & Tahun Ajaran
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Hari, Tanggal Kejadian Perselisihan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={hariTanggalKejadian}
              onChange={e => setHariTanggalKejadian(e.target.value)}
              placeholder="Contoh: Senin, 17 Agustus 2026"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tahun Ajaran
            </label>
            <input
              type="text"
              value={tahunAjaran}
              onChange={e => setTahunAjaran(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-50/30 dark:bg-amber-950/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800/50">
          <h3 className="font-bold text-amber-900 dark:text-amber-400 uppercase text-sm tracking-wider">
            Poin Ikrar / Janji Kesepakatan Damai
          </h3>
          <button
            type="button"
            onClick={() => setPoinIkrar(DEFAULT_IKRAR)}
            className="text-xs font-semibold text-amber-700 dark:text-amber-500 flex items-center gap-1 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Teks Template
          </button>
        </div>
        
        <textarea
          value={poinIkrar}
          onChange={e => setPoinIkrar(e.target.value)}
          rows={5}
          className="w-full p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all dark:text-white leading-relaxed resize-y"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            'Menyimpan...'
          ) : (
            <>
              <Check className="w-5 h-5" />
              {editingId ? 'Simpan Perubahan' : 'Simpan Kesepakatan Damai'}
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderRekap = () => {
    const filtered = records.filter(r => 
      r.namaSiswaPertama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.namaSiswaKedua.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Belum ada data kesepakatan damai.</p>
            </div>
          ) : (
            filtered.map((record) => (
              <div key={record.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg">
                    {record.hariTanggalKejadian}
                  </div>
                  {userRole === 'admin' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewReportId(record.id)} className="p-1.5 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" title="Lihat/Cetak">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(record)} className="p-1.5 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTargetId(record.id)} className="p-1.5 bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Pihak Pertama</p>
                    <p className="font-semibold text-slate-800 dark:text-white line-clamp-2">{record.namaSiswaPertama}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Pihak Kedua</p>
                    <p className="font-semibold text-slate-800 dark:text-white line-clamp-2">{record.namaSiswaKedua}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      <div className="print:hidden space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
          <Handshake className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-xs font-extrabold tracking-wider uppercase mb-4 text-emerald-50">
            <Handshake className="w-4 h-4" /> 7. SP DAMAI SISWA
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">(Penyelesaian Perselisihan)</h1>
          <p className="text-emerald-100 font-medium max-w-2xl text-sm sm:text-base">
            Formulir kesepakatan damai antar siswa untuk penyelesaian konflik secara kekeluargaan.
          </p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800/80 inline-flex shadow-sm">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'form'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          {editingId ? 'Edit Kesepakatan' : 'Buat Kesepakatan'}
        </button>
        <button
          onClick={() => setActiveTab('rekap')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'rekap'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Arsip Kesepakatan
        </button>
      </div>

      {activeTab === 'form' ? renderForm() : renderRekap()}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full p-2 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Kesepakatan Damai Tersimpan</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Data telah berhasil ditambahkan ke arsip.</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setActiveTab('rekap');
                  }}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                >
                  Lihat Arsip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {deleteTargetId && (
        <DeleteConfirmModal
          isOpen={!!deleteTargetId}
          title="Hapus Arsip Kesepakatan?"
          message="Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      {viewReportId && (() => {
        const record = records.find(r => r.id === viewReportId);
        if (!record) return null;
        return (
          <OfficialReportModal
            isOpen={true}
            onClose={() => setViewReportId(null)}
            judulLaporan="SURAT PERNYATAAN DAMAI SISWA"
            fields={[]}
            customBody={
              <div className="w-full text-xs print:text-[10pt] text-slate-800 print:text-black leading-relaxed space-y-4 font-serif print:font-serif">
                <div className="text-center font-bold pb-2 space-y-0.5">
                  <p className="m-0 text-sm print:text-[11pt]">UPT SMP NEGERI 7 PASURUAN</p>
                  <p className="m-0 text-sm print:text-[11pt]">Tahun Ajaran {record.tahunAjaran}</p>
                </div>
                
                <p className="m-0 mt-4">
                  Pada hari ini, <strong>{record.hariTanggalKejadian}</strong>, kami yang bertanda tangan di bawah ini:
                </p>
                
                <div className="pl-4 sm:pl-8">
                  <table className="text-xs print:text-[10pt] mt-4 mb-4">
                    <tbody>
                      <tr>
                        <td className="py-1 w-48 align-top">Nama Siswa Pertama</td>
                        <td className="py-1 px-2 w-4 align-top">:</td>
                        <td className="py-1 font-bold align-top">{record.namaSiswaPertama}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top">Kelas</td>
                        <td className="py-1 px-2 align-top">:</td>
                        <td className="py-1 font-bold align-top">{record.kelasSiswaPertama}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pt-4 align-top">Nama Siswa Kedua</td>
                        <td className="py-1 px-2 pt-4 align-top">:</td>
                        <td className="py-1 pt-4 font-bold align-top">{record.namaSiswaKedua}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top">Kelas</td>
                        <td className="py-1 px-2 align-top">:</td>
                        <td className="py-1 font-bold align-top">{record.kelasSiswaKedua}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pt-4 align-top">Hari, Tanggal Kejadian</td>
                        <td className="py-1 px-2 pt-4 align-top">:</td>
                        <td className="py-1 pt-4 font-bold align-top">{record.hariTanggalKejadian}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="m-0 mt-4">
                  Menyatakan bahwa kami telah bersepakat untuk damai dan menyelesaikan perselisihan yang pernah terjadi secara kekeluargaan.
                </p>

                <p className="m-0 mt-4 font-bold">
                  Dengan ini kami berjanji:
                </p>

                <div className="whitespace-pre-wrap ml-6 mt-1 mb-4 print:text-[10pt] text-slate-800 print:text-black">
                  {record.poinIkrar}
                </div>

                <p className="m-0 mt-4">
                  Demikian surat pernyataan damai ini kami buat dengan penuh kesadaran dan tanpa paksaan dari pihak mana pun.
                </p>
              </div>
            }
            customSignatureBlock={
              <div className="w-full text-xs print:text-[10pt] text-center select-none pt-8 pb-16 print:pb-0 font-serif print:font-serif">
                <div className="text-right mb-6">
                  <p className="m-0 text-slate-800 print:text-black">Pasuruan, {record.hariTanggalKejadian}</p>
                </div>
                
                <div className="flex justify-between w-full mb-8 gap-4">
                  <div className="w-1/2 flex flex-col items-center">
                    <p className="font-bold mb-2 m-0 print:text-black">Siswa Pertama</p>
                    <div className="h-20 w-full max-w-[180px] border border-slate-300 border-dashed rounded-lg flex items-center justify-center print:border-none print:h-20 relative">
                      <span className="text-slate-300 print:hidden text-[10px]">Klik untuk TTD</span>
                    </div>
                    <p className="font-bold underline mt-2 m-0 print:text-black">( {record.namaSiswaPertama.toUpperCase()} )</p>
                  </div>
                  <div className="w-1/2 flex flex-col items-center">
                    <p className="font-bold mb-2 m-0 print:text-black">Siswa Kedua</p>
                    <div className="h-20 w-full max-w-[180px] border border-slate-300 border-dashed rounded-lg flex items-center justify-center print:border-none print:h-20 relative">
                      <span className="text-slate-300 print:hidden text-[10px]">Klik untuk TTD</span>
                    </div>
                    <p className="font-bold underline mt-2 m-0 print:text-black">( {record.namaSiswaKedua.toUpperCase()} )</p>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center mt-4">
                  <p className="m-0 print:text-black">Mengetahui,</p>
                  <p className="font-bold mb-2 m-0 print:text-black">Guru BK / Wali Kelas</p>
                  <div className="h-20 w-full max-w-[180px] border border-slate-300 border-dashed rounded-lg flex items-center justify-center print:border-none print:h-20 relative">
                    <span className="text-slate-300 print:hidden text-[10px]">Klik untuk TTD</span>
                  </div>
                  <p className="font-bold underline mt-2 m-0 print:text-black">WIWIK ISMIATI, S.Pd</p>
                  <p className="m-0 print:text-black">NIP. 19831116 200904 2 003</p>
                </div>
              </div>
            }
          />
        );
      })()}
    </div>
  );
};
