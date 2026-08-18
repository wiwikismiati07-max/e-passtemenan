import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AppDatabase,
  BukuTamu,
  CustomLink,
  ELaporPerundungan,
  KebunLuasBerseri,
  PiketHarian,
  SabtuBeliTehCeri,
  SenandungSerasi,
  SupabaseConfig,
  SiswaItem,
  GuruItem,
} from '../types';

const STORAGE_KEY = 'PASS_TEMENAN_SPANJU_DB_V1';

export const INITIAL_CUSTOM_LINKS: CustomLink[] = [
  {
    id: 'link-1',
    title: 'Portal SMPN 7 Pasuruan',
    url: 'https://smpn7pasuruan.sch.id',
    description: 'Website resmi SMP Negeri 7 Pasuruan',
    category: 'Sekolah',
    iconName: 'Globe',
    color: '#0d9488',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'link-2',
    title: 'Dapodik Kemendikbud',
    url: 'https://dapo.kemdikbud.go.id',
    description: 'Data Pokok Pendidikan Indonesia',
    category: 'Kedinasan',
    iconName: 'Building2',
    color: '#3b82f6',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'link-3',
    title: 'PMM - Platform Merdeka Mengajar',
    url: 'https://guru.kemdikbud.go.id',
    description: 'Pengembangan guru & asesmen kurikulum merdeka',
    category: 'Akademik',
    iconName: 'GraduationCap',
    color: '#8b5cf6',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'link-4',
    title: 'Rapor Pendidikan Indonesia',
    url: 'https://raporpendidikan.kemdikbud.go.id',
    description: 'Evaluasi mutu layanan pendidikan SPANJU',
    category: 'Evaluasi',
    iconName: 'BarChart3',
    color: '#ec4899',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'link-5',
    title: 'Google Drive Dokumen Pass Temenan',
    url: 'https://drive.google.com',
    description: 'Penyimpanan arsip foto & bukti fisik program',
    category: 'Arsip',
    iconName: 'FolderArchive',
    color: '#f59e0b',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PIKET_HARIAN: PiketHarian[] = [
  {
    id: 'piket-1',
    hariTanggal: 'Senin, 17 Agustus 2026',
    waktu: '06.30 - 14.00 WIB',
    namaAnggota: 'Ahmad Fauzi, Siti Nurhaliza, Budi Santoso',
    kelas: 'Tim Pokja 7 & 8',
    hasilTemuan: 'Seluruh area gerbang sekolah kondusif, penyambutan 5S (Senyum, Salam, Sapa, Sopan, Santun) berjalan tertib. Tidak ditemukan siswa terlambat.',
    linkFoto: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Kegiatan piket pagi berjalan sesuai SOP Pass Temenan SPANJU.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'piket-2',
    hariTanggal: 'Selasa, 18 Agustus 2026',
    waktu: '06.45 - 13.30 WIB',
    namaAnggota: 'Rina Amelia, Dimas Prasetyo, Dewi Lestari',
    kelas: 'Tim Sahabat Sebaya IX',
    hasilTemuan: 'Area taman belakang dan kantin bersih, interaksi antar siswa saat istirahat terpantau sangat harmonis dan saling mendukung.',
    linkFoto: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Semua sudut sekolah terbebas dari indikasi perundungan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SABTU_TEH_CERI: SabtuBeliTehCeri[] = [
  {
    id: 'ceri-1',
    hariTanggal: 'Sabtu, 15 Agustus 2026',
    waktu: '08.00 - 10.30 WIB',
    hasilTemuan1Minggu: 'Teridentifikasi peningkatan keaktifan pojok baca kelas dan penurunan konflik kecil saat jam istirahat berkat program Duta Temenan.',
    evaluasiKegiatan: 'Forum diskusi mingguan dihadiri oleh seluruh perwakilan kelas VII-IX, komunikasi berjalan sangat terbuka dan konstruktif.',
    rencanaInovasi: 'Meluncurkan kotak curhat digital dan pojok podcast mini "Cerita Temenan" untuk mengapresiasi siswa berprestasi.',
    linkFoto: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Diskusi mingguan sukses menghasilkan 3 kesepakatan aksi kebersamaan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_KEBUN_BERSERI: KebunLuasBerseri[] = [
  {
    id: 'kebun-1',
    hariTanggal: 'Kamis, 13 Agustus 2026',
    waktu: '09.00 - 12.00 WIB',
    evaluasiBerhasil: 'Program Duta Anti-Bullying telah terbentuk di 21 kelas. Seluruh siswa telah menandatangani komitmen anti kekerasan bersama.',
    kendalaSolusi: 'Kendala: Sosialisasi daring belum maksimal. Solusi: Dibuatkan infografis cetak dan video reels pendek Pass Temenan.',
    hasilInovasi: 'Pembuatan rubrik "Teman Inspiratif" bulanan di mading utama & Instagram resmi sekolah.',
    produkKreatif: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
    rtlList: [
      { id: 'rtl-1', pic: 'Ibu Rahmawati, S.Pd', target: 'Pencetakan Poster & Banner Anti Perundungan', deadline: '25 Agustus 2026' },
      { id: 'rtl-2', pic: 'Bapak Hendra, M.Pd & OSIS', target: 'Workshop Peer-Counselor untuk Siswa', deadline: '30 Agustus 2026' },
    ],
    keterangan: 'Rapat pleno bulanan bersama Kepala Sekolah dan komite.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SENANDUNG_SERASI: SenandungSerasi[] = [
  {
    id: 'senandung-1',
    hariTanggal: 'Jumat, 14 Agustus 2026',
    waktu: '07.00 - 07.30 WIB',
    pesanDisampaikan: '"Berteman bukan mencari siapa yang sempurna, melainkan saling melengkapi dan menjaga kehormatan sesama di SMPN 7 Pasuruan."',
    keterangan: 'Disiarkan melalui pengeras suara sekolah pada sesi Apel Pagi Ramah Anak.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'senandung-2',
    hariTanggal: 'Senin, 10 Agustus 2026',
    waktu: '06.45 - 07.15 WIB',
    pesanDisampaikan: '"Satu kata santun darimu adalah pelindung bagi saudaramu. Jadilah pelopor kebaikan, stop perundungan sekarang juga!"',
    keterangan: 'Pesan literasi dan penguatan karakter mingguan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_E_LAPOR: ELaporPerundungan[] = [
  {
    id: 'lapor-1',
    hariTanggal: 'Rabu, 12 Agustus 2026',
    waktuKejadian: '10.15 WIB (Saat Istirahat Pertama)',
    namaSiswa: 'Siswa Kelas VIII-C (Nama Dirahasiakan)',
    kelas: 'VIII C',
    kronologi: 'Terdapat perbedaan pendapat saat bermain olahraga futsal yang memicu ejekan verbal antar kelompok kecil.',
    penyadaran: 'Edukasi pentingnya sportivitas dan kontrol emosi melalui konseling sebaya.',
    pencegahan: 'Pengawasan guru piket ditambah di area lapangan olahraga saat jam istirahat.',
    penangananRespon: 'Guru BK dan Tim Pass Temenan langsung memanggil kedua belah pihak secara empatik.',
    pelaporan: 'Tercatat dalam rekam penanganan Pass Temenan SPANJU dan telah diselesaikan dengan damai.',
    tindakLanjut: 'Mediasi kekeluargaan dan saling berjabat tangan komitmen persahabatan.',
    status: 'Selesai',
    keterangan: 'Kasus terselesaikan dalam 1x24 jam tanpa eskalasi.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_BUKU_TAMU: BukuTamu[] = [
  {
    id: 'tamu-1',
    hariTanggal: 'Kamis, 13 Agustus 2026',
    jamKedatangan: '09.30 WIB',
    namaLengkap: 'Drs. H. Mulyono, M.Si',
    nipNik: '197304151998031004',
    jabatan: 'Pengawas Pembina Sekolah',
    instansiAsal: 'Dinas Pendidikan dan Kebudayaan Kota Pasuruan',
    tujuanKunjungan: 'Monitoring dan Evaluasi Implementasi Program Pencegahan Perundungan (Pass Temenan) SMPN 7 Pasuruan',
    tandaTangan: '',
    tindakLanjut: 'Apresiasi program dan saran penguatan sistem digitalisasi laporan.',
    keterangan: 'Diterima langsung oleh Kepala SMPN 7 Pasuruan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_MASTER_SISWA: SiswaItem[] = [
  {
    id: 'sis-1',
    nisn: '0081234561',
    nis: '1001',
    namaLengkap: 'Ahmad Fauzi Ramadhan',
    kelas: '7A',
    jenisKelamin: 'L',
    alamat: 'Jl. Panglima Sudirman No. 45, Pasuruan',
    noHp: '081234567890',
    keterangan: 'Aktif / Kader Pass Temenan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sis-2',
    nisn: '0081234562',
    nis: '1002',
    namaLengkap: 'Siti Nur Aisyah',
    kelas: '7A',
    jenisKelamin: 'P',
    alamat: 'Jl. Dr. Wahidin Sudirohusodo No. 12, Pasuruan',
    noHp: '081234567891',
    keterangan: 'Aktif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sis-3',
    nisn: '0079876541',
    nis: '9501',
    namaLengkap: 'Budi Santoso',
    kelas: '8B',
    jenisKelamin: 'L',
    alamat: 'Jl. Untung Suropati No. 88, Pasuruan',
    noHp: '081987654321',
    keterangan: 'Aktif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sis-4',
    nisn: '0079876542',
    nis: '9502',
    namaLengkap: 'Dewi Lestari',
    kelas: '9C',
    jenisKelamin: 'P',
    alamat: 'Jl. Diponegoro No. 20, Pasuruan',
    noHp: '081555666777',
    keterangan: 'Aktif / Pengurus Kelas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_MASTER_GURU: GuruItem[] = [
  {
    id: 'guru-1',
    nip: '19860410 201001 2 030',
    namaLengkap: 'NUR FADILAH, S.Pd., M.Pd',
    jabatan: 'Kepala Sekolah',
    mapel: 'Manajemen Pendidikan',
    noHp: '081234567800',
    email: 'nurfadilah@smpn7pasuruan.sch.id',
    keterangan: 'Kepala UPT SMPN 7 Pasuruan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'guru-2',
    nip: '19831116 200904 2 003',
    namaLengkap: 'WIWIK ISMIATI, S.Pd',
    jabatan: 'Guru Pendamping / Guru BK',
    mapel: 'Bimbingan Konseling',
    noHp: '081234567801',
    email: 'wiwikismiati@smpn7pasuruan.sch.id',
    keterangan: 'Koordinator Pass Temenan & BK',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'guru-3',
    nip: '19940214 202221 2 014',
    namaLengkap: 'EKI FEBRIANI, S.Pd',
    jabatan: 'Guru Pendamping / Guru BK',
    mapel: 'Bimbingan Konseling',
    noHp: '081234567802',
    email: 'ekifebriani@smpn7pasuruan.sch.id',
    keterangan: 'Tim BK & Pencegahan Perundungan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'guru-4',
    nip: '19730415 199803 1 004',
    namaLengkap: 'Drs. H. Mulyono, M.Si',
    jabatan: 'Guru Mata Pelajaran',
    mapel: 'Matematika',
    noHp: '081234567803',
    email: 'mulyono@smpn7pasuruan.sch.id',
    keterangan: 'Guru Senior / Pembina Kesiswaan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const GURU_BK_OPTIONS = [
  {
    nama: 'WIWIK ISMIATI, S.Pd',
    nip: '19831116 200904 2 003',
    jabatan: 'Guru Pendamping / Guru BK',
  },
  {
    nama: 'EKI FEBRIANI, S.Pd',
    nip: '19940214 202221 2 014',
    jabatan: 'Guru Pendamping / Guru BK',
  },
];

export const DEFAULT_PEJABAT_CONFIG = {
  kepalaSekolahNama: 'NUR FADILAH, S.Pd., M.Pd',
  kepalaSekolahNip: '19860410 201001 2 030',
  kepalaSekolahJabatan: 'Kepala UPT SMP Negeri 7 Pasuruan',
  kepalaSekolahTtd: '',
  selectedGuruBK: 'WIWIK ISMIATI, S.Pd',
  guruBKNip: '19831116 200904 2 003',
  guruBKJabatan: 'Guru Pendamping / Guru BK',
  guruBKTtd: '',
};

export const DEFAULT_DATABASE: AppDatabase = {
  customLinks: INITIAL_CUSTOM_LINKS,
  piketHarian: INITIAL_PIKET_HARIAN,
  sabtuBeliTehCeri: INITIAL_SABTU_TEH_CERI,
  kebunLuasBerseri: INITIAL_KEBUN_BERSERI,
  senandungSerasi: INITIAL_SENANDUNG_SERASI,
  eLaporPerundungan: INITIAL_E_LAPOR,
  bukuTamu: INITIAL_BUKU_TAMU,
  masterSiswa: INITIAL_MASTER_SISWA,
  masterGuru: INITIAL_MASTER_GURU,
  classAssignments: {},
  supabaseConfig: {
    url: 'https://oshvgrglseefguybezdh.supabase.co',
    anonKey: 'sb_publishable_G3RlEXsgYJfeqa9AMP7HyA_3aKPEJ9M',
    isConnected: true,
    autoSync: true,
  },
  pejabatConfig: DEFAULT_PEJABAT_CONFIG,
  version: 1,
};

export class StorageService {
  private static db: AppDatabase | null = null;
  private static supabaseClient: SupabaseClient | null = null;

  public static getDb(): AppDatabase {
    if (this.db) return this.db;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.db = {
          ...DEFAULT_DATABASE,
          ...parsed,
          customLinks: parsed.customLinks || DEFAULT_DATABASE.customLinks,
          piketHarian: parsed.piketHarian || DEFAULT_DATABASE.piketHarian,
          sabtuBeliTehCeri: parsed.sabtuBeliTehCeri || DEFAULT_DATABASE.sabtuBeliTehCeri,
          kebunLuasBerseri: parsed.kebunLuasBerseri || DEFAULT_DATABASE.kebunLuasBerseri,
          senandungSerasi: parsed.senandungSerasi || DEFAULT_DATABASE.senandungSerasi,
          eLaporPerundungan: parsed.eLaporPerundungan || DEFAULT_DATABASE.eLaporPerundungan,
          bukuTamu: parsed.bukuTamu || DEFAULT_DATABASE.bukuTamu,
          masterSiswa: parsed.masterSiswa || DEFAULT_DATABASE.masterSiswa,
          supabaseConfig: { ...DEFAULT_DATABASE.supabaseConfig, ...(parsed.supabaseConfig || {}) },
          pejabatConfig: { ...DEFAULT_PEJABAT_CONFIG, ...(parsed.pejabatConfig || {}) },
        };
      } else {
        this.db = { ...DEFAULT_DATABASE };
        this.saveDb();
      }
    } catch (e) {
      console.error('Error loading database from localStorage', e);
      this.db = { ...DEFAULT_DATABASE };
    }
    return this.db;
  }

  public static saveDb(): void {
    if (!this.db) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
      // Trigger storage event for UI reactivity
      window.dispatchEvent(new Event('pass-temenan-db-updated'));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  // --- SUPABASE CLIENT & CLOUD SYNC ---
  public static getSupabaseClient(): SupabaseClient | null {
    const config = this.getDb().supabaseConfig;
    if (!config.url || !config.anonKey) {
      return null;
    }
    if (!this.supabaseClient) {
      try {
        this.supabaseClient = createClient(config.url, config.anonKey);
      } catch (e) {
        console.error('Error creating Supabase client', e);
        return null;
      }
    }
    return this.supabaseClient;
  }

  public static async testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!url || !anonKey) {
        return { success: false, message: 'URL dan API Key Supabase tidak boleh kosong.' };
      }
      const testClient = createClient(url, anonKey);
      // Attempt a lightweight select or test
      const { error } = await testClient.from('piket_harian').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116' && error.message && !error.message.includes('relation "piket_harian" does not exist')) {
        return { success: false, message: `Gagal terhubung: ${error.message}` };
      }
      return { success: true, message: 'Berhasil terhubung ke Supabase!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal menghubungi server Supabase.' };
    }
  }

  public static async fetchFromSupabase(): Promise<{ success: boolean; message: string; counts?: Record<string, number> }> {
    const client = this.getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Konfigurasi Supabase belum diatur atau tidak valid.' };
    }

    const db = this.getDb();
    const counts: Record<string, number> = {};
    const errors: string[] = [];

    try {
      // 1. Fetch Master Siswa (Range 0 - 4999 to cover all 772+ students)
      try {
        const { data: siswaData, error: siswaErr } = await client
          .from('master_siswa')
          .select('*')
          .range(0, 4999);

        if (siswaErr) {
          if (!siswaErr.message.includes('relation "master_siswa" does not exist')) {
            errors.push(`Master Siswa: ${siswaErr.message}`);
          }
        } else if (siswaData && siswaData.length > 0) {
          db.masterSiswa = siswaData.map((row: any) => ({
            id: row.id || ('sis-' + Math.random().toString(36).substring(2, 9)),
            nisn: String(row.nisn || ''),
            nis: String(row.nis || ''),
            namaLengkap: String(row.nama_lengkap || row.namaLengkap || ''),
            kelas: String(row.kelas || '7A').toUpperCase(),
            jenisKelamin: (String(row.jenis_kelamin || row.jenisKelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L') as 'L' | 'P',
            alamat: String(row.alamat || ''),
            noHp: String(row.no_hp || row.noHp || ''),
            keterangan: String(row.keterangan || 'Aktif'),
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['master_siswa'] = db.masterSiswa.length;
        }
      } catch (e: any) {
        errors.push(`Master Siswa: ${e?.message}`);
      }

      // 2. Fetch Master Guru
      try {
        const { data: guruData, error: guruErr } = await client
          .from('master_guru')
          .select('*')
          .range(0, 999);

        if (guruErr) {
          if (!guruErr.message.includes('relation "master_guru" does not exist')) {
            errors.push(`Master Guru: ${guruErr.message}`);
          }
        } else if (guruData && guruData.length > 0) {
          db.masterGuru = guruData.map((row: any) => ({
            id: row.id || ('guru-' + Math.random().toString(36).substring(2, 9)),
            nip: String(row.nip || ''),
            namaLengkap: String(row.nama_lengkap || row.namaLengkap || ''),
            jabatan: String(row.jabatan || 'Guru Mata Pelajaran'),
            mapel: String(row.mapel || ''),
            noHp: String(row.no_hp || row.noHp || ''),
            email: String(row.email || ''),
            keterangan: String(row.keterangan || 'Aktif'),
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['master_guru'] = db.masterGuru.length;
        }
      } catch (e: any) {
        errors.push(`Master Guru: ${e?.message}`);
      }

      // 3. Fetch Piket Harian
      try {
        const { data: piketData, error: piketErr } = await client
          .from('piket_harian')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!piketErr && piketData && piketData.length > 0) {
          db.piketHarian = piketData.map((row: any) => ({
            id: row.id,
            hariTanggal: row.hari_tanggal,
            waktu: row.waktu,
            namaAnggota: row.nama_anggota,
            kelas: row.kelas || '',
            hasilTemuan: row.hasil_temuan,
            linkFoto: row.link_foto || '',
            tandaTangan: row.tanda_tangan || '',
            keterangan: row.keterangan || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['piket_harian'] = db.piketHarian.length;
        }
      } catch (e: any) {
        // silently handle
      }

      // 4. Fetch Sabtu Beli Teh Ceri
      try {
        const { data: ceriData, error: ceriErr } = await client
          .from('sabtu_teh_ceri')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!ceriErr && ceriData && ceriData.length > 0) {
          db.sabtuBeliTehCeri = ceriData.map((row: any) => ({
            id: row.id,
            hariTanggal: row.hari_tanggal,
            waktu: row.waktu,
            hasilTemuan1Minggu: row.hasil_temuan_1minggu,
            evaluasiKegiatan: row.evaluasi_kegiatan || '',
            rencanaInovasi: row.rencana_inovasi || '',
            linkFoto: row.link_foto || '',
            tandaTangan: row.tanda_tangan || '',
            keterangan: row.keterangan || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['sabtu_teh_ceri'] = db.sabtuBeliTehCeri.length;
        }
      } catch (e: any) {
        // silently handle
      }

      // 5. Fetch Kebun Luas Berseri
      try {
        const { data: kebunData, error: kebunErr } = await client
          .from('kebun_luas_berseri')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!kebunErr && kebunData && kebunData.length > 0) {
          db.kebunLuasBerseri = kebunData.map((row: any) => ({
            id: row.id,
            hariTanggal: row.hari_tanggal,
            waktu: row.waktu,
            evaluasiBerhasil: row.evaluasi_berhasil || '',
            kendalaSolusi: row.kendala_solusi || '',
            hasilInovasi: row.hasil_inovasi || '',
            produkKreatif: row.produk_kreatif || '',
            rtlList: Array.isArray(row.rtl_list) ? row.rtl_list : [],
            tandaTangan: row.tanda_tangan || '',
            keterangan: row.keterangan || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['kebun_luas_berseri'] = db.kebunLuasBerseri.length;
        }
      } catch (e: any) {
        // silently handle
      }

      // 6. Fetch Senandung Serasi
      try {
        const { data: senandungData, error: senandungErr } = await client
          .from('senandung_serasi')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!senandungErr && senandungData && senandungData.length > 0) {
          db.senandungSerasi = senandungData.map((row: any) => ({
            id: row.id,
            hariTanggal: row.hari_tanggal,
            waktu: row.waktu,
            pesanDisampaikan: row.pesan_disampaikan,
            tandaTangan: row.tanda_tangan || '',
            keterangan: row.keterangan || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['senandung_serasi'] = db.senandungSerasi.length;
        }
      } catch (e: any) {
        // silently handle
      }

      // 7. Fetch E-Lapor
      try {
        const { data: laporData, error: laporErr } = await client
          .from('e_lapor_perundungan')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!laporErr && laporData && laporData.length > 0) {
          db.eLaporPerundungan = laporData.map((row: any) => ({
            id: row.id,
            hariTanggal: row.hari_tanggal,
            waktuKejadian: row.waktu_kejadian,
            namaSiswa: row.nama_siswa,
            kelas: row.kelas || '',
            kronologi: row.kronologi,
            penyadaran: row.penyadaran || '',
            pencegahan: row.pencegahan || '',
            penangananRespon: row.penanganan_respon || '',
            pelaporan: row.pelaporan || '',
            tindakLanjut: row.tindak_lanjut || '',
            status: row.status || 'Laporan Baru',
            tandaTangan: row.tanda_tangan || '',
            keterangan: row.keterangan || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['e_lapor_perundungan'] = db.eLaporPerundungan.length;
        }
      } catch (e: any) {
        // silently handle
      }

      // 8. Fetch Buku Tamu
      try {
        const { data: tamuData, error: tamuErr } = await client
          .from('buku_tamu')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!tamuErr && tamuData && tamuData.length > 0) {
          db.bukuTamu = tamuData.map((row: any) => ({
            id: row.id,
            hariTanggal: row.hari_tanggal,
            jamKedatangan: row.jam_kedatangan,
            namaLengkap: row.nama_lengkap,
            nipNik: row.nip_nik || '',
            jabatan: row.jabatan || '',
            instansiAsal: row.instansi_asal,
            tujuanKunjungan: row.tujuan_kunjungan,
            tandaTangan: row.tanda_tangan || '',
            tindakLanjut: row.tindak_lanjut || '',
            keterangan: row.keterangan || '',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['buku_tamu'] = db.bukuTamu.length;
        }
      } catch (e: any) {
        // silently handle
      }

      // 9. Fetch Custom Links
      try {
        const { data: linkData, error: linkErr } = await client
          .from('custom_links')
          .select('*')
          .range(0, 999);

        if (!linkErr && linkData && linkData.length > 0) {
          db.customLinks = linkData.map((row: any) => ({
            id: row.id,
            title: row.title,
            url: row.url,
            description: row.description || '',
            category: row.category || 'Sekolah',
            iconName: row.icon_name || 'Globe',
            color: row.color || '#0d9488',
            isCustom: row.is_custom ?? true,
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
          counts['custom_links'] = db.customLinks.length;
        }
      } catch (e: any) {
        // silently handle
      }

      db.supabaseConfig.lastSyncedAt = new Date().toISOString();
      db.supabaseConfig.isConnected = true;
      this.saveDb();

      const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
      const detailStr = Object.entries(counts).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(', ');

      return {
        success: true,
        message: `Berhasil memuat ${totalRecords} data dari Supabase! (${detailStr || 'Semua sinkron'})`,
        counts,
      };
    } catch (e: any) {
      console.error('Fetch from Supabase failed', e);
      return { success: false, message: `Gagal memuat data dari Supabase: ${e?.message || 'Error tidak diketahui'}` };
    }
  }

  public static async syncToSupabase(): Promise<{ success: boolean; message: string }> {
    const client = this.getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Konfigurasi Supabase belum diatur atau tidak valid.' };
    }

    const db = this.getDb();
    let syncedCount = 0;
    const errors: string[] = [];

    try {
      // 1. Piket Harian
      if (db.piketHarian.length > 0) {
        const { error } = await client.from('piket_harian').upsert(
          db.piketHarian.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            waktu: item.waktu,
            nama_anggota: item.namaAnggota,
            kelas: item.kelas,
            hasil_temuan: item.hasilTemuan,
            link_foto: item.linkFoto,
            tanda_tangan: item.tandaTangan || null,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`Piket: ${error.message}`);
        else syncedCount += db.piketHarian.length;
      }

      // 2. Sabtu Beli Teh Ceri
      if (db.sabtuBeliTehCeri.length > 0) {
        const { error } = await client.from('sabtu_teh_ceri').upsert(
          db.sabtuBeliTehCeri.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            waktu: item.waktu,
            hasil_temuan_1minggu: item.hasilTemuan1Minggu,
            evaluasi_kegiatan: item.evaluasiKegiatan,
            rencana_inovasi: item.rencanaInovasi,
            link_foto: item.linkFoto,
            tanda_tangan: item.tandaTangan || null,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`Sabtu Teh Ceri: ${error.message}`);
        else syncedCount += db.sabtuBeliTehCeri.length;
      }

      // 3. Kebun Luas Berseri
      if (db.kebunLuasBerseri.length > 0) {
        const { error } = await client.from('kebun_luas_berseri').upsert(
          db.kebunLuasBerseri.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            waktu: item.waktu,
            evaluasi_berhasil: item.evaluasiBerhasil,
            kendala_solusi: item.kendalaSolusi,
            hasil_inovasi: item.hasilInovasi,
            produk_kreatif: item.produkKreatif,
            rtl_list: item.rtlList,
            tanda_tangan: item.tandaTangan || null,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`Kebun Berseri: ${error.message}`);
        else syncedCount += db.kebunLuasBerseri.length;
      }

      // 4. Senandung Serasi
      if (db.senandungSerasi.length > 0) {
        const { error } = await client.from('senandung_serasi').upsert(
          db.senandungSerasi.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            waktu: item.waktu,
            pesan_disampaikan: item.pesanDisampaikan,
            tanda_tangan: item.tandaTangan || null,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`Senandung Serasi: ${error.message}`);
        else syncedCount += db.senandungSerasi.length;
      }

      // 5. E-Lapor Perundungan
      if (db.eLaporPerundungan.length > 0) {
        const { error } = await client.from('e_lapor_perundungan').upsert(
          db.eLaporPerundungan.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            waktu_kejadian: item.waktuKejadian,
            nama_siswa: item.namaSiswa,
            kelas: item.kelas,
            kronologi: item.kronologi,
            penyadaran: item.penyadaran,
            pencegahan: item.pencegahan,
            penanganan_respon: item.penangananRespon,
            pelaporan: item.pelaporan,
            tindak_lanjut: item.tindakLanjut,
            status: item.status,
            tanda_tangan: item.tandaTangan || null,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`E-Lapor: ${error.message}`);
        else syncedCount += db.eLaporPerundungan.length;
      }

      // 6. Buku Tamu
      if (db.bukuTamu.length > 0) {
        const { error } = await client.from('buku_tamu').upsert(
          db.bukuTamu.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            jam_kedatangan: item.jamKedatangan,
            nama_lengkap: item.namaLengkap,
            nip_nik: item.nipNik,
            jabatan: item.jabatan,
            instansi_asal: item.instansiAsal,
            tujuan_kunjungan: item.tujuanKunjungan,
            tanda_tangan: item.tandaTangan,
            tindak_lanjut: item.tindakLanjut,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`Buku Tamu: ${error.message}`);
        else syncedCount += db.bukuTamu.length;
      }

      // 7. Master Siswa
      if (db.masterSiswa && db.masterSiswa.length > 0) {
        const { error } = await client.from('master_siswa').upsert(
          db.masterSiswa.map((item) => ({
            id: item.id,
            nisn: item.nisn,
            nis: item.nis || '',
            nama_lengkap: item.namaLengkap,
            kelas: item.kelas,
            jenis_kelamin: item.jenisKelamin,
            alamat: item.alamat || '',
            no_hp: item.noHp || '',
            keterangan: item.keterangan || '',
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`Master Siswa: ${error.message}`);
        else syncedCount += db.masterSiswa.length;
      }

      // 8. Master Guru
      if (db.masterGuru && db.masterGuru.length > 0) {
        const { error } = await client.from('master_guru').upsert(
          db.masterGuru.map((item) => ({
            id: item.id,
            nip: item.nip,
            nama_lengkap: item.namaLengkap,
            jabatan: item.jabatan,
            mapel: item.mapel || '',
            no_hp: item.noHp || '',
            email: item.email || '',
            keterangan: item.keterangan || '',
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`Master Guru: ${error.message}`);
        else syncedCount += db.masterGuru.length;
      }

      // 9. Custom Links
      if (db.customLinks.length > 0) {
        const { error } = await client.from('custom_links').upsert(
          db.customLinks.map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            description: item.description || '',
            category: item.category,
            icon_name: item.iconName,
            color: item.color,
            is_custom: item.isCustom ?? true,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        if (error) errors.push(`Custom Links: ${error.message}`);
        else syncedCount += db.customLinks.length;
      }

      db.supabaseConfig.lastSyncedAt = new Date().toISOString();
      db.supabaseConfig.isConnected = true;
      this.saveDb();

      if (errors.length > 0) {
        return {
          success: false,
          message: `Sebagian data belum tersinkron (${errors.join('; ')}). Pastikan tabel Supabase sudah dibuat menggunakan script SQL generator.`,
        };
      }

      return {
        success: true,
        message: `Berhasil menyinkronkan ${syncedCount} catatan data ke database Supabase!`,
      };
    } catch (e: any) {
      console.error('Sync failed', e);
      return { success: false, message: `Gagal sinkronisasi: ${e?.message || 'Error tidak diketahui'}` };
    }
  }

  // --- CRUD HELPERS FOR ALL ENTITIES ---

  // 1. Custom Links
  public static saveCustomLink(link: Omit<CustomLink, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): CustomLink {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: CustomLink;

    if (link.id) {
      const idx = db.customLinks.findIndex((l) => l.id === link.id);
      if (idx >= 0) {
        saved = { ...db.customLinks[idx], ...link, updatedAt: now };
        db.customLinks[idx] = saved;
      } else {
        saved = { ...link, id: link.id, createdAt: now, updatedAt: now };
        db.customLinks.push(saved);
      }
    } else {
      saved = {
        ...link,
        id: 'link-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
        isCustom: true,
      };
      db.customLinks.push(saved);
    }
    this.saveDb();
    return saved;
  }

  public static saveLink(link: any): CustomLink {
    return this.saveCustomLink(link);
  }

  public static deleteCustomLink(id: string): void {
    const db = this.getDb();
    db.customLinks = db.customLinks.filter((l) => l.id !== id);
    this.saveDb();
  }

  public static deleteLink(id: string): void {
    this.deleteCustomLink(id);
  }

  // 2. Piket Harian
  public static savePiketHarian(item: Omit<PiketHarian, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): PiketHarian {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: PiketHarian;

    if (item.id) {
      const idx = db.piketHarian.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        saved = { ...db.piketHarian[idx], ...item, updatedAt: now };
        db.piketHarian[idx] = saved;
      } else {
        saved = { ...item, id: item.id, createdAt: now, updatedAt: now };
        db.piketHarian.unshift(saved);
      }
    } else {
      saved = {
        ...item,
        id: 'piket-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      db.piketHarian.unshift(saved);
    }
    this.saveDb();
    return saved;
  }

  public static deletePiketHarian(id: string): void {
    const db = this.getDb();
    db.piketHarian = db.piketHarian.filter((p) => p.id !== id);
    this.saveDb();
  }

  // 3. Sabtu Beli Teh Ceri
  public static saveSabtuBeliTehCeri(item: Omit<SabtuBeliTehCeri, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SabtuBeliTehCeri {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: SabtuBeliTehCeri;

    if (item.id) {
      const idx = db.sabtuBeliTehCeri.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        saved = { ...db.sabtuBeliTehCeri[idx], ...item, updatedAt: now };
        db.sabtuBeliTehCeri[idx] = saved;
      } else {
        saved = { ...item, id: item.id, createdAt: now, updatedAt: now };
        db.sabtuBeliTehCeri.unshift(saved);
      }
    } else {
      saved = {
        ...item,
        id: 'ceri-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      db.sabtuBeliTehCeri.unshift(saved);
    }
    this.saveDb();
    return saved;
  }

  public static deleteSabtuBeliTehCeri(id: string): void {
    const db = this.getDb();
    db.sabtuBeliTehCeri = db.sabtuBeliTehCeri.filter((p) => p.id !== id);
    this.saveDb();
  }

  // 4. Kebun Luas Berseri
  public static saveKebunLuasBerseri(item: Omit<KebunLuasBerseri, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): KebunLuasBerseri {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: KebunLuasBerseri;

    if (item.id) {
      const idx = db.kebunLuasBerseri.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        saved = { ...db.kebunLuasBerseri[idx], ...item, updatedAt: now };
        db.kebunLuasBerseri[idx] = saved;
      } else {
        saved = { ...item, id: item.id, createdAt: now, updatedAt: now };
        db.kebunLuasBerseri.unshift(saved);
      }
    } else {
      saved = {
        ...item,
        id: 'kebun-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      db.kebunLuasBerseri.unshift(saved);
    }
    this.saveDb();
    return saved;
  }

  public static deleteKebunLuasBerseri(id: string): void {
    const db = this.getDb();
    db.kebunLuasBerseri = db.kebunLuasBerseri.filter((p) => p.id !== id);
    this.saveDb();
  }

  // 5. Senandung Serasi
  public static saveSenandungSerasi(item: Omit<SenandungSerasi, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SenandungSerasi {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: SenandungSerasi;

    if (item.id) {
      const idx = db.senandungSerasi.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        saved = { ...db.senandungSerasi[idx], ...item, updatedAt: now };
        db.senandungSerasi[idx] = saved;
      } else {
        saved = { ...item, id: item.id, createdAt: now, updatedAt: now };
        db.senandungSerasi.unshift(saved);
      }
    } else {
      saved = {
        ...item,
        id: 'senandung-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      db.senandungSerasi.unshift(saved);
    }
    this.saveDb();
    return saved;
  }

  public static deleteSenandungSerasi(id: string): void {
    const db = this.getDb();
    db.senandungSerasi = db.senandungSerasi.filter((p) => p.id !== id);
    this.saveDb();
  }

  // 6. E-Lapor Perundungan
  public static saveELapor(item: Omit<ELaporPerundungan, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ELaporPerundungan {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: ELaporPerundungan;

    if (item.id) {
      const idx = db.eLaporPerundungan.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        saved = { ...db.eLaporPerundungan[idx], ...item, updatedAt: now };
        db.eLaporPerundungan[idx] = saved;
      } else {
        saved = { ...item, id: item.id, createdAt: now, updatedAt: now };
        db.eLaporPerundungan.unshift(saved);
      }
    } else {
      saved = {
        ...item,
        id: 'lapor-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      db.eLaporPerundungan.unshift(saved);
    }
    this.saveDb();
    return saved;
  }

  public static deleteELapor(id: string): void {
    const db = this.getDb();
    db.eLaporPerundungan = db.eLaporPerundungan.filter((p) => p.id !== id);
    this.saveDb();
  }

  // 7. Buku Tamu
  public static saveBukuTamu(item: Omit<BukuTamu, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): BukuTamu {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: BukuTamu;

    if (item.id) {
      const idx = db.bukuTamu.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        saved = { ...db.bukuTamu[idx], ...item, updatedAt: now };
        db.bukuTamu[idx] = saved;
      } else {
        saved = { ...item, id: item.id, createdAt: now, updatedAt: now };
        db.bukuTamu.unshift(saved);
      }
    } else {
      saved = {
        ...item,
        id: 'tamu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      db.bukuTamu.unshift(saved);
    }
    this.saveDb();
    return saved;
  }

  public static deleteBukuTamu(id: string): void {
    const db = this.getDb();
    db.bukuTamu = db.bukuTamu.filter((p) => p.id !== id);
    this.saveDb();
  }

  // --- MASTER SISWA CRUD & EXCEL IMPORT ---
  public static saveSiswa(item: Omit<SiswaItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SiswaItem {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: SiswaItem;

    if (item.id) {
      const idx = db.masterSiswa.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        saved = { ...db.masterSiswa[idx], ...item, updatedAt: now };
        db.masterSiswa[idx] = saved;
      } else {
        saved = { ...item, id: item.id, createdAt: now, updatedAt: now };
        db.masterSiswa.unshift(saved);
      }
    } else {
      saved = {
        ...item,
        id: 'sis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      db.masterSiswa.unshift(saved);
    }
    this.saveDb();

    // Background sync to Supabase if connected
    const client = this.getSupabaseClient();
    if (client) {
      client
        .from('master_siswa')
        .upsert({
          id: saved.id,
          nisn: saved.nisn,
          nis: saved.nis || '',
          nama_lengkap: saved.namaLengkap,
          kelas: saved.kelas,
          jenis_kelamin: saved.jenisKelamin,
          alamat: saved.alamat || '',
          no_hp: saved.noHp || '',
          keterangan: saved.keterangan || '',
          created_at: saved.createdAt,
          updated_at: saved.updatedAt,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase auto-save siswa notice:', error.message);
        });
    }

    return saved;
  }

  public static deleteSiswa(id: string): void {
    const db = this.getDb();
    db.masterSiswa = db.masterSiswa.filter((s) => s.id !== id);
    this.saveDb();

    const client = this.getSupabaseClient();
    if (client) {
      client
        .from('master_siswa')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase delete siswa notice:', error.message);
        });
    }
  }

  public static deleteMultipleSiswa(ids: string[]): void {
    const db = this.getDb();
    db.masterSiswa = db.masterSiswa.filter((s) => !ids.includes(s.id));
    this.saveDb();

    const client = this.getSupabaseClient();
    if (client && ids.length > 0) {
      client
        .from('master_siswa')
        .delete()
        .in('id', ids)
        .then(({ error }) => {
          if (error) console.warn('Supabase bulk delete siswa notice:', error.message);
        });
    }
  }

  public static importSiswaBatch(
    rows: Array<{ nisn?: string; nis?: string; namaLengkap?: string; kelas?: string; jenisKelamin?: string; alamat?: string; noHp?: string; keterangan?: string }>,
    mode: 'overwrite' | 'merge' = 'overwrite'
  ): { added: number; updated: number; total: number } {
    const db = this.getDb();
    const now = new Date().toISOString();
    let added = 0;
    let updated = 0;

    if (mode === 'overwrite') {
      // Tindih / Ganti seluruh data lama
      const newItems: SiswaItem[] = [];
      rows.forEach((r, idx) => {
        if (!r.namaLengkap) return;
        const nisn = r.nisn ? String(r.nisn).trim() : '';
        const nis = r.nis ? String(r.nis).trim() : '';
        const nama = String(r.namaLengkap).trim();
        const kelas = r.kelas ? String(r.kelas).trim().toUpperCase() : '7A';
        const jkRaw = r.jenisKelamin ? String(r.jenisKelamin).trim().toUpperCase() : 'L';
        const jenisKelamin = (jkRaw.startsWith('P') ? 'P' : 'L') as 'L' | 'P';
        const alamat = r.alamat ? String(r.alamat).trim() : '';
        const noHp = r.noHp ? String(r.noHp).trim() : '';
        const keterangan = r.keterangan ? String(r.keterangan).trim() : 'Import Excel';

        newItems.push({
          id: 'sis-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
          nisn: nisn || ('00' + Math.floor(Math.random() * 90000000 + 10000000)),
          nis: nis || String(Math.floor(Math.random() * 9000 + 1000)),
          namaLengkap: nama,
          kelas,
          jenisKelamin,
          alamat,
          noHp,
          keterangan,
          createdAt: now,
          updatedAt: now,
        });
        added++;
      });

      db.masterSiswa = newItems;
      this.saveDb();

      // Trigger cloud sync to Supabase if connected
      const client = this.getSupabaseClient();
      if (client && newItems.length > 0) {
        // Upsert all in chunks of 200
        const chunkSize = 200;
        (async () => {
          for (let i = 0; i < newItems.length; i += chunkSize) {
            const chunk = newItems.slice(i, i + chunkSize);
            await client.from('master_siswa').upsert(
              chunk.map((item) => ({
                id: item.id,
                nisn: item.nisn,
                nis: item.nis || '',
                nama_lengkap: item.namaLengkap,
                kelas: item.kelas,
                jenis_kelamin: item.jenisKelamin,
                alamat: item.alamat || '',
                no_hp: item.noHp || '',
                keterangan: item.keterangan || '',
                created_at: item.createdAt,
                updated_at: item.updatedAt,
              }))
            );
          }
        })();
      }

      return { added, updated: 0, total: db.masterSiswa.length };
    }

    // Merge mode
    rows.forEach((r) => {
      if (!r.namaLengkap) return;
      const nisn = r.nisn ? String(r.nisn).trim() : '';
      const nis = r.nis ? String(r.nis).trim() : '';
      const nama = String(r.namaLengkap).trim();
      const kelas = r.kelas ? String(r.kelas).trim().toUpperCase() : '7A';
      const jkRaw = r.jenisKelamin ? String(r.jenisKelamin).trim().toUpperCase() : 'L';
      const jenisKelamin = (jkRaw.startsWith('P') ? 'P' : 'L') as 'L' | 'P';
      const alamat = r.alamat ? String(r.alamat).trim() : '';
      const noHp = r.noHp ? String(r.noHp).trim() : '';
      const keterangan = r.keterangan ? String(r.keterangan).trim() : 'Import Excel';

      const existingIdx = db.masterSiswa.findIndex(
        (s) => (nisn && s.nisn === nisn) || (nis && s.nis === nis) || (s.namaLengkap.toLowerCase() === nama.toLowerCase() && s.kelas === kelas)
      );

      if (existingIdx >= 0) {
        db.masterSiswa[existingIdx] = {
          ...db.masterSiswa[existingIdx],
          nisn: nisn || db.masterSiswa[existingIdx].nisn,
          nis: nis || db.masterSiswa[existingIdx].nis,
          namaLengkap: nama,
          kelas,
          jenisKelamin,
          alamat: alamat || db.masterSiswa[existingIdx].alamat,
          noHp: noHp || db.masterSiswa[existingIdx].noHp,
          keterangan: keterangan || db.masterSiswa[existingIdx].keterangan,
          updatedAt: now,
        };
        updated++;
      } else {
        const newSis: SiswaItem = {
          id: 'sis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          nisn: nisn || ('00' + Math.floor(Math.random() * 90000000 + 10000000)),
          nis: nis || String(Math.floor(Math.random() * 9000 + 1000)),
          namaLengkap: nama,
          kelas,
          jenisKelamin,
          alamat,
          noHp,
          keterangan,
          createdAt: now,
          updatedAt: now,
        };
        db.masterSiswa.unshift(newSis);
        added++;
      }
    });

    this.saveDb();
    return { added, updated, total: db.masterSiswa.length };
  }

  // --- MASTER GURU CRUD & EXCEL IMPORT ---
  public static saveGuru(item: Omit<GuruItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): GuruItem {
    const db = this.getDb();
    const now = new Date().toISOString();
    let saved: GuruItem;

    if (item.id) {
      const idx = db.masterGuru.findIndex((g) => g.id === item.id);
      if (idx >= 0) {
        saved = { ...db.masterGuru[idx], ...item, updatedAt: now };
        db.masterGuru[idx] = saved;
      } else {
        saved = { ...item, id: item.id, createdAt: now, updatedAt: now };
        db.masterGuru.unshift(saved);
      }
    } else {
      saved = {
        ...item,
        id: 'guru-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      db.masterGuru.unshift(saved);
    }
    this.saveDb();

    // Background sync to Supabase if connected
    const client = this.getSupabaseClient();
    if (client) {
      client
        .from('master_guru')
        .upsert({
          id: saved.id,
          nip: saved.nip,
          nama_lengkap: saved.namaLengkap,
          jabatan: saved.jabatan,
          mapel: saved.mapel || '',
          no_hp: saved.noHp || '',
          email: saved.email || '',
          keterangan: saved.keterangan || '',
          created_at: saved.createdAt,
          updated_at: saved.updatedAt,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase auto-save guru notice:', error.message);
        });
    }

    return saved;
  }

  public static deleteGuru(id: string): void {
    const db = this.getDb();
    db.masterGuru = db.masterGuru.filter((g) => g.id !== id);
    this.saveDb();

    const client = this.getSupabaseClient();
    if (client) {
      client
        .from('master_guru')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase delete guru notice:', error.message);
        });
    }
  }

  public static deleteMultipleGuru(ids: string[]): void {
    const db = this.getDb();
    db.masterGuru = db.masterGuru.filter((g) => !ids.includes(g.id));
    this.saveDb();

    const client = this.getSupabaseClient();
    if (client && ids.length > 0) {
      client
        .from('master_guru')
        .delete()
        .in('id', ids)
        .then(({ error }) => {
          if (error) console.warn('Supabase bulk delete guru notice:', error.message);
        });
    }
  }

  public static importGuruBatch(
    rows: Array<{ nip?: string; namaLengkap?: string; jabatan?: string; mapel?: string; noHp?: string; email?: string; keterangan?: string }>,
    mode: 'overwrite' | 'merge' = 'overwrite'
  ): { added: number; updated: number; total: number } {
    const db = this.getDb();
    const now = new Date().toISOString();
    let added = 0;
    let updated = 0;

    if (mode === 'overwrite') {
      // Tindih / Ganti seluruh data lama
      const newGurus: GuruItem[] = [];
      rows.forEach((r, idx) => {
        if (!r.namaLengkap) return;
        const nip = r.nip ? String(r.nip).trim() : '';
        const nama = String(r.namaLengkap).trim();
        const jabatan = r.jabatan ? String(r.jabatan).trim() : 'Guru Mata Pelajaran';
        const mapel = r.mapel ? String(r.mapel).trim() : '';
        const noHp = r.noHp ? String(r.noHp).trim() : '';
        const email = r.email ? String(r.email).trim() : '';
        const keterangan = r.keterangan ? String(r.keterangan).trim() : 'Import Excel';

        newGurus.push({
          id: 'guru-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
          nip: nip || ('19' + Math.floor(Math.random() * 9000000000 + 1000000000)),
          namaLengkap: nama,
          jabatan,
          mapel,
          noHp,
          email,
          keterangan,
          createdAt: now,
          updatedAt: now,
        });
        added++;
      });

      db.masterGuru = newGurus;
      this.saveDb();

      // Trigger cloud sync to Supabase if connected
      const client = this.getSupabaseClient();
      if (client && newGurus.length > 0) {
        const chunkSize = 200;
        (async () => {
          for (let i = 0; i < newGurus.length; i += chunkSize) {
            const chunk = newGurus.slice(i, i + chunkSize);
            await client.from('master_guru').upsert(
              chunk.map((item) => ({
                id: item.id,
                nip: item.nip,
                nama_lengkap: item.namaLengkap,
                jabatan: item.jabatan,
                mapel: item.mapel || '',
                no_hp: item.noHp || '',
                email: item.email || '',
                keterangan: item.keterangan || '',
                created_at: item.createdAt,
                updated_at: item.updatedAt,
              }))
            );
          }
        })();
      }

      return { added, updated: 0, total: db.masterGuru.length };
    }

    // Merge mode
    rows.forEach((r) => {
      if (!r.namaLengkap) return;
      const nip = r.nip ? String(r.nip).trim() : '';
      const nama = String(r.namaLengkap).trim();
      const jabatan = r.jabatan ? String(r.jabatan).trim() : 'Guru Mata Pelajaran';
      const mapel = r.mapel ? String(r.mapel).trim() : '';
      const noHp = r.noHp ? String(r.noHp).trim() : '';
      const email = r.email ? String(r.email).trim() : '';
      const keterangan = r.keterangan ? String(r.keterangan).trim() : 'Import Excel';

      const existingIdx = db.masterGuru.findIndex(
        (g) => (nip && g.nip === nip) || g.namaLengkap.toLowerCase() === nama.toLowerCase()
      );

      if (existingIdx >= 0) {
        db.masterGuru[existingIdx] = {
          ...db.masterGuru[existingIdx],
          nip: nip || db.masterGuru[existingIdx].nip,
          namaLengkap: nama,
          jabatan: jabatan || db.masterGuru[existingIdx].jabatan,
          mapel: mapel || db.masterGuru[existingIdx].mapel,
          noHp: noHp || db.masterGuru[existingIdx].noHp,
          email: email || db.masterGuru[existingIdx].email,
          keterangan: keterangan || db.masterGuru[existingIdx].keterangan,
          updatedAt: now,
        };
        updated++;
      } else {
        const newGuru: GuruItem = {
          id: 'guru-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          nip: nip || ('19' + Math.floor(Math.random() * 9000000000 + 1000000000)),
          namaLengkap: nama,
          jabatan,
          mapel,
          noHp,
          email,
          keterangan,
          createdAt: now,
          updatedAt: now,
        };
        db.masterGuru.unshift(newGuru);
        added++;
      }
    });

    this.saveDb();
    return { added, updated, total: db.masterGuru.length };
  }

  // --- PEJABAT & SIGNATURE CONFIG ---
  public static getPejabatConfig() {
    const db = this.getDb();
    return db.pejabatConfig || DEFAULT_PEJABAT_CONFIG;
  }

  public static savePejabatConfig(config: Partial<typeof DEFAULT_PEJABAT_CONFIG>) {
    const db = this.getDb();
    db.pejabatConfig = {
      ...(db.pejabatConfig || DEFAULT_PEJABAT_CONFIG),
      ...config,
    };
    this.saveDb();
    return db.pejabatConfig;
  }

  public static saveClassAssignment(namaKelas: string, waliKelas: string, dutaAntiBullying: string): void {
    const db = this.getDb();
    if (!db.classAssignments) {
      db.classAssignments = {};
    }
    db.classAssignments[namaKelas] = {
      waliKelas,
      dutaAntiBullying,
    };
    this.saveDb();
  }

  // --- CONFIG ---
  public static updateSupabaseConfig(config: Partial<SupabaseConfig>): void {
    const db = this.getDb();
    db.supabaseConfig = { ...db.supabaseConfig, ...config };
    this.supabaseClient = null; // reset client to renew
    this.saveDb();
  }

  // --- BACKUP & RESTORE ---
  public static exportBackupJSON(): string {
    const db = this.getDb();
    return JSON.stringify(db, null, 2);
  }

  public static importBackupJSON(jsonStr: string, mode: 'merge' | 'overwrite'): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr) as AppDatabase;
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Format file JSON tidak valid.' };
      }

      if (mode === 'overwrite') {
        this.db = {
          ...DEFAULT_DATABASE,
          ...parsed,
          supabaseConfig: {
            ...DEFAULT_DATABASE.supabaseConfig,
            ...(parsed.supabaseConfig || {}),
          },
        };
      } else {
        // Merge mode
        const current = this.getDb();
        const mergeUnique = <T extends { id: string }>(currentArr: T[], incomingArr: T[] = []): T[] => {
          const map = new Map<string, T>();
          currentArr.forEach((item) => map.set(item.id, item));
          incomingArr.forEach((item) => map.set(item.id, item));
          return Array.from(map.values());
        };

        this.db = {
          customLinks: mergeUnique(current.customLinks, parsed.customLinks),
          piketHarian: mergeUnique(current.piketHarian, parsed.piketHarian),
          sabtuBeliTehCeri: mergeUnique(current.sabtuBeliTehCeri, parsed.sabtuBeliTehCeri),
          kebunLuasBerseri: mergeUnique(current.kebunLuasBerseri, parsed.kebunLuasBerseri),
          senandungSerasi: mergeUnique(current.senandungSerasi, parsed.senandungSerasi),
          eLaporPerundungan: mergeUnique(current.eLaporPerundungan, parsed.eLaporPerundungan),
          bukuTamu: mergeUnique(current.bukuTamu, parsed.bukuTamu),
          masterSiswa: mergeUnique(current.masterSiswa, parsed.masterSiswa),
          masterGuru: mergeUnique(current.masterGuru, parsed.masterGuru),
          classAssignments: { ...(current.classAssignments || {}), ...(parsed.classAssignments || {}) },
          pejabatConfig: parsed.pejabatConfig || current.pejabatConfig,
          supabaseConfig: {
            ...current.supabaseConfig,
            ...(parsed.supabaseConfig || {}),
          },
          version: 1,
        };
      }

      this.saveDb();
      return { success: true, message: 'Data backup berhasil dipulihkan!' };
    } catch (e: any) {
      return { success: false, message: `Gagal membaca file JSON: ${e?.message}` };
    }
  }

  // --- SQL SCHEMA GENERATOR FOR SUPABASE ---
  public static getSupabaseMasterGuruSQLScript(): string {
    return `-- =================================================================
-- SCRIPT SQL KHUSUS TABEL MASTER GURU DI SUPABASE
-- Jalankan skrip ini di: Supabase Dashboard > SQL Editor > New Query > Run
-- =================================================================

CREATE TABLE IF NOT EXISTS public.master_guru (
    id TEXT PRIMARY KEY,
    nip TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    mapel TEXT,
    no_hp TEXT,
    email TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan RLS dan Hak Akses Terbuka
ALTER TABLE public.master_guru ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read All Master Guru" ON public.master_guru FOR SELECT USING (true);
CREATE POLICY "Public Insert All Master Guru" ON public.master_guru FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All Master Guru" ON public.master_guru FOR UPDATE USING (true);
CREATE POLICY "Public Delete All Master Guru" ON public.master_guru FOR DELETE USING (true);
`;
  }

  public static getSupabaseSQLScript(): string {
    return `-- =================================================================
-- SCRIPT SQL TABEL SUPABASE UNTUK PROGRAM PASS TEMENAN SMPN 7 PASURUAN
-- Jalankan skrip ini di: Supabase Dashboard > SQL Editor > New Query > Run
-- =================================================================

-- 1. Tabel Piket Harian
CREATE TABLE IF NOT EXISTS public.piket_harian (
    id TEXT PRIMARY KEY,
    hari_tanggal TEXT NOT NULL,
    waktu TEXT NOT NULL,
    nama_anggota TEXT NOT NULL,
    kelas TEXT,
    hasil_temuan TEXT NOT NULL,
    link_foto TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Sabtu Beli Teh Ceri
CREATE TABLE IF NOT EXISTS public.sabtu_teh_ceri (
    id TEXT PRIMARY KEY,
    hari_tanggal TEXT NOT NULL,
    waktu TEXT NOT NULL,
    hasil_temuan_1minggu TEXT NOT NULL,
    evaluasi_kegiatan TEXT,
    rencana_inovasi TEXT,
    link_foto TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Kebun Luas Berseri
CREATE TABLE IF NOT EXISTS public.kebun_luas_berseri (
    id TEXT PRIMARY KEY,
    hari_tanggal TEXT NOT NULL,
    waktu TEXT NOT NULL,
    evaluasi_berhasil TEXT,
    kendala_solusi TEXT,
    hasil_inovasi TEXT,
    produk_kreatif TEXT,
    rtl_list JSONB DEFAULT '[]'::jsonb,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Senandung Serasi
CREATE TABLE IF NOT EXISTS public.senandung_serasi (
    id TEXT PRIMARY KEY,
    hari_tanggal TEXT NOT NULL,
    waktu TEXT NOT NULL,
    pesan_disampaikan TEXT NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel E-Lapor Perundungan
CREATE TABLE IF NOT EXISTS public.e_lapor_perundungan (
    id TEXT PRIMARY KEY,
    hari_tanggal TEXT NOT NULL,
    waktu_kejadian TEXT NOT NULL,
    nama_siswa TEXT NOT NULL,
    kelas TEXT,
    kronologi TEXT NOT NULL,
    penyadaran TEXT,
    pencegahan TEXT,
    penanganan_respon TEXT,
    pelaporan TEXT,
    tindak_lanjut TEXT,
    status TEXT DEFAULT 'Laporan Baru',
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Buku Tamu
CREATE TABLE IF NOT EXISTS public.buku_tamu (
    id TEXT PRIMARY KEY,
    hari_tanggal TEXT NOT NULL,
    jam_kedatangan TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    nip_nik TEXT,
    jabatan TEXT,
    instansi_asal TEXT NOT NULL,
    tujuan_kunjungan TEXT NOT NULL,
    tanda_tangan TEXT,
    tindak_lanjut TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Master Siswa
CREATE TABLE IF NOT EXISTS public.master_siswa (
    id TEXT PRIMARY KEY,
    nisn TEXT NOT NULL,
    nis TEXT,
    nama_lengkap TEXT NOT NULL,
    kelas TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    alamat TEXT,
    no_hp TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Master Guru
CREATE TABLE IF NOT EXISTS public.master_guru (
    id TEXT PRIMARY KEY,
    nip TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    mapel TEXT,
    no_hp TEXT,
    email TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Custom Links & Menu
CREATE TABLE IF NOT EXISTS public.custom_links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    icon_name TEXT,
    color TEXT,
    is_custom BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Policies for open access as requested
ALTER TABLE public.piket_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sabtu_teh_ceri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kebun_luas_berseri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senandung_serasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_lapor_perundungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buku_tamu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_links ENABLE ROW LEVEL SECURITY;

-- Allow public read and write (upsert) for all users
CREATE POLICY "Public Read All" ON public.piket_harian FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.piket_harian FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.piket_harian FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.piket_harian FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.sabtu_teh_ceri FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.sabtu_teh_ceri FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.sabtu_teh_ceri FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.sabtu_teh_ceri FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.kebun_luas_berseri FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.kebun_luas_berseri FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.kebun_luas_berseri FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.kebun_luas_berseri FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.senandung_serasi FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.senandung_serasi FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.senandung_serasi FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.senandung_serasi FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.e_lapor_perundungan FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.e_lapor_perundungan FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.e_lapor_perundungan FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.e_lapor_perundungan FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.buku_tamu FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.buku_tamu FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.buku_tamu FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.buku_tamu FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.master_siswa FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.master_siswa FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.master_siswa FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.master_siswa FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.master_guru FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.master_guru FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.master_guru FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.master_guru FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.custom_links FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.custom_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.custom_links FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.custom_links FOR DELETE USING (true);
`;
  }
}
