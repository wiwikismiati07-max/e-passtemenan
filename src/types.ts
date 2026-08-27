export interface CustomLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  iconName: string;
  color: string;
  isCustom?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PiketHarian {
  id: string;
  hariTanggal: string; // e.g. "Senin, 16 Agustus 2026" or YYYY-MM-DD
  waktu: string; // e.g. "06.30 - 14.00 WIB"
  namaAnggota: string;
  kelas: string;
  hasilTemuan: string;
  linkFoto: string;
  tandaTangan?: string; // Digital touchscreen / mouse signature data URL
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface SabtuBeliTehCeri {
  id: string;
  hariTanggal: string;
  waktu: string;
  hasilTemuan1Minggu: string;
  evaluasiKegiatan: string;
  rencanaInovasi: string;
  linkFoto: string;
  tandaTangan?: string; // Digital touchscreen / mouse signature data URL
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface RTLItem {
  id: string;
  pic: string;
  target: string;
  deadline: string;
}

export interface KebunLuasBerseri {
  id: string;
  hariTanggal: string;
  waktu: string;
  evaluasiBerhasil: string;
  kendalaSolusi: string;
  hasilInovasi: string;
  produkKreatif: string;
  rtlList: RTLItem[];
  linkFoto?: string; // Online Supabase Storage photo URL
  tandaTangan?: string; // Digital touchscreen / mouse signature data URL
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface SenandungSerasi {
  id: string;
  hariTanggal: string;
  waktu: string;
  pesanDisampaikan: string;
  linkFoto?: string; // Online Supabase Storage photo URL
  tandaTangan?: string; // Digital touchscreen / mouse signature data URL
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export type StatusLaporan = 'Laporan Baru' | 'Proses Investigasi' | 'Mediasi' | 'Selesai';

export interface ELaporPerundungan {
  id: string;
  hariTanggal: string;
  waktuKejadian: string;
  namaSiswa: string;
  kelas: string;
  kronologi: string;
  penyadaran: string;
  pencegahan: string;
  penangananRespon: string;
  pelaporan: string;
  tindakLanjut: string;
  status: StatusLaporan;
  linkFoto?: string; // Online Supabase Storage photo URL
  tandaTangan?: string; // Digital touchscreen / mouse signature data URL
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface BukuTamu {
  id: string;
  hariTanggal: string;
  jamKedatangan: string;
  namaLengkap: string;
  nipNik: string;
  jabatan: string;
  instansiAsal: string;
  tujuanKunjungan: string;
  linkFoto?: string; // Online Supabase Storage photo URL
  tandaTangan: string; // Base64 png data URL
  tindakLanjut: string;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiswaItem {
  id: string;
  nisn: string;
  nis?: string;
  namaLengkap: string;
  kelas: string; // e.g. "7A", "7B", "8A", "9C"
  jenisKelamin: 'L' | 'P';
  alamat?: string;
  noHp?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuruItem {
  id: string;
  nip: string;
  namaLengkap: string;
  jabatan: string;
  mapel?: string;
  noHp?: string;
  email?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface PejabatConfig {
  kepalaSekolahNama: string;
  kepalaSekolahNip: string;
  kepalaSekolahJabatan: string;
  kepalaSekolahTtd?: string;
  selectedGuruBK: string;
  guruBKNip: string;
  guruBKJabatan: string;
  guruBKTtd?: string;
}

export interface ClassAssignmentItem {
  waliKelas: string;
  dutaAntiBullying: string;
  ikrarSiswa?: string;
  catatanKegiatan?: string;
  deklarasiDamai?: boolean;
  updatedAt?: string;
}

export interface AppDatabase {
  customLinks: CustomLink[];
  piketHarian: PiketHarian[];
  sabtuBeliTehCeri: SabtuBeliTehCeri[];
  kebunLuasBerseri: KebunLuasBerseri[];
  senandungSerasi: SenandungSerasi[];
  eLaporPerundungan: ELaporPerundungan[];
  bukuTamu: BukuTamu[];
  masterSiswa: SiswaItem[];
  masterGuru: GuruItem[];
  classAssignments?: Record<string, ClassAssignmentItem>;
  supabaseConfig: SupabaseConfig;
  pejabatConfig?: PejabatConfig;
  version: number;
}
