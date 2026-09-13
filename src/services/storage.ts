import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { compressImage } from '../utils/imageCompressor';
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
  ClassAssignmentItem,
  MediaEdukasiDatabase,
  MediaEdukasiSubTab,
} from '../types';
import { INITIAL_CLASS_ZONE_DATA } from '../data/classZoneData';
import { INITIAL_MEDIA_EDUKASI } from '../data/mediaEdukasiData';
import { ALL_STUDENTS_DATA } from '../data/allStudentsData';

const STORAGE_KEY = 'PASS_TEMENAN_SPANJU_DB_V1';
const DELETED_IDS_STORAGE_KEY = 'PASS_TEMENAN_DELETED_IDS_V1';
const IDB_NAME = 'PASS_TEMENAN_SPANJU_IDB_V1';
const IDB_STORE_NAME = 'app_state';

// Helper for IndexedDB persistence (safe against 5MB localStorage limits)
function openAppIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported'));
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const idb = request.result;
      if (!idb.objectStoreNames.contains(IDB_STORE_NAME)) {
        idb.createObjectStore(IDB_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(key: string, value: any): Promise<void> {
  try {
    const idb = await openAppIndexedDB();
    const tx = idb.transaction(IDB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IDB_STORE_NAME);
    store.put(value, key);
  } catch (e) {
    console.warn('IndexedDB save warning:', e);
  }
}

async function getFromIndexedDB(key: string): Promise<any> {
  try {
    const idb = await openAppIndexedDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_STORE_NAME, 'readonly');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

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

// Clean initial states for reports so only user inputs appear
export const INITIAL_PIKET_HARIAN: PiketHarian[] = [];
export const INITIAL_SABTU_TEH_CERI: SabtuBeliTehCeri[] = [];
export const INITIAL_KEBUN_BERSERI: KebunLuasBerseri[] = [];
export const INITIAL_SENANDUNG_SERASI: SenandungSerasi[] = [];
export const INITIAL_E_LAPOR: ELaporPerundungan[] = [];
export const INITIAL_BUKU_TAMU: BukuTamu[] = [];
export const LEGACY_MOCK_IDS = new Set([
  'piket-1',
  'piket-2',
  'ceri-1',
  'kebun-1',
  'senandung-1',
  'senandung-2',
  'lapor-1',
  'tamu-1',
  'sis-1',
  'sis-2',
  'sis-3',
  'sis-4',
]);

export const INITIAL_MASTER_SISWA: SiswaItem[] = ALL_STUDENTS_DATA;

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
  mediaEdukasi: INITIAL_MEDIA_EDUKASI,
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

  public static getDeletedIds(): Set<string> {
    try {
      const raw = localStorage.getItem(DELETED_IDS_STORAGE_KEY);
      if (raw) {
        return new Set(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Error reading deleted IDs', e);
    }
    return new Set<string>();
  }

  public static markAsDeleted(id: string): void {
    if (!id) return;
    try {
      const deleted = this.getDeletedIds();
      deleted.add(id);
      localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(deleted)));
    } catch (e) {
      console.error('Error saving deleted IDs', e);
    }
  }

  public static unmarkDeleted(id: string): void {
    if (!id) return;
    try {
      const deleted = this.getDeletedIds();
      if (deleted.has(id)) {
        deleted.delete(id);
        localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(deleted)));
      }
    } catch (e) {
      console.error('Error removing deleted ID', e);
    }
  }

  public static async deleteFromSupabase(table: string, id: string): Promise<void> {
    if (!id) return;
    const client = this.getSupabaseClient();
    if (!client) return;
    try {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) {
        console.warn(`Supabase delete from ${table} notice:`, error.message);
      } else {
        this.broadcastChange(table, 'delete', id);
      }
    } catch (e) {
      console.warn(`Supabase delete exception on ${table}:`, e);
    }
  }

  public static getDb(): AppDatabase {
    if (this.db) return this.db;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const deletedIds = this.getDeletedIds();
      const isValidItem = (x: any) => x && x.id && !deletedIds.has(x.id) && !LEGACY_MOCK_IDS.has(x.id);

      const defaultCfg = DEFAULT_DATABASE.supabaseConfig;

      if (stored) {
        const parsed = JSON.parse(stored);
        const parsedCfg = parsed.supabaseConfig || {};
        const finalUrl =
          parsedCfg.url && parsedCfg.url.trim().startsWith('http')
            ? parsedCfg.url.trim()
            : defaultCfg.url;
        const finalKey =
          parsedCfg.anonKey && parsedCfg.anonKey.trim().length > 10
            ? parsedCfg.anonKey.trim()
            : defaultCfg.anonKey;

        this.db = {
          ...DEFAULT_DATABASE,
          ...parsed,
          customLinks: (Array.isArray(parsed.customLinks) ? parsed.customLinks : DEFAULT_DATABASE.customLinks).filter(isValidItem),
          piketHarian: (Array.isArray(parsed.piketHarian) ? parsed.piketHarian : []).filter(isValidItem),
          sabtuBeliTehCeri: (Array.isArray(parsed.sabtuBeliTehCeri) ? parsed.sabtuBeliTehCeri : []).filter(isValidItem),
          kebunLuasBerseri: (Array.isArray(parsed.kebunLuasBerseri) ? parsed.kebunLuasBerseri : []).filter(isValidItem),
          senandungSerasi: (Array.isArray(parsed.senandungSerasi) ? parsed.senandungSerasi : []).filter(isValidItem),
          eLaporPerundungan: (Array.isArray(parsed.eLaporPerundungan) ? parsed.eLaporPerundungan : []).filter(isValidItem),
          bukuTamu: (Array.isArray(parsed.bukuTamu) ? parsed.bukuTamu : []).filter(isValidItem),
          masterSiswa: (() => {
            const raw = (Array.isArray(parsed.masterSiswa) ? parsed.masterSiswa : DEFAULT_DATABASE.masterSiswa).filter(isValidItem);
            const existingNis = new Set(raw.map((s: any) => s.nis || s.nisn));
            const missingFromInitial = INITIAL_MASTER_SISWA.filter((s) => !existingNis.has(s.nis));
            if (missingFromInitial.length > 0) {
              return [...raw, ...missingFromInitial];
            }
            return raw;
          })(),
          masterGuru: (Array.isArray(parsed.masterGuru) ? parsed.masterGuru : DEFAULT_DATABASE.masterGuru).filter(isValidItem),
          classAssignments: parsed.classAssignments || DEFAULT_DATABASE.classAssignments || {},
          mediaEdukasi: (() => {
            if (!parsed.mediaEdukasi || !parsed.mediaEdukasi.materi) {
              return INITIAL_MEDIA_EDUKASI;
            }
            // Remove deleted generic infographics (info-3 and info-4)
            const cleanedInfografis = Array.isArray(parsed.mediaEdukasi.infografis)
              ? parsed.mediaEdukasi.infografis.filter((i: any) => i.id !== 'info-3' && i.id !== 'info-4')
              : INITIAL_MEDIA_EDUKASI.infografis;

            // Remove legacy mock posters (pos-1 to pos-5) while preserving all user-added posters
            const cleanedPoster = Array.isArray(parsed.mediaEdukasi.poster)
              ? parsed.mediaEdukasi.poster.filter(
                  (p: any) => !['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'].includes(p.id)
                )
              : [];

            // Check if existing video list contains old mock videos or missing the new 7 official videos
            const currentVideos = Array.isArray(parsed.mediaEdukasi.video) ? parsed.mediaEdukasi.video : [];
            const hasOldMock = currentVideos.some(
              (v: any) =>
                ['L_LUpnjgPso', 'bVde8cR0P8A', 'ynTuA_St464', 'Y9n9eB2Qo6s', 'fJ9rUzIMcZQ'].includes(v.youtubeId) ||
                (typeof v.videoUrl === 'string' && v.videoUrl.includes('dQw4w9WgXcQ'))
            );
            const hasOfficialVideos = currentVideos.some((v: any) => v.youtubeId === 'GQbqfdsPO-g');
            if (hasOldMock || !hasOfficialVideos) {
              // Replace mock videos with the 7 official videos while preserving any user-created custom videos
              const customVideos = currentVideos.filter(
                (v: any) =>
                  !['vid-1', 'vid-2', 'vid-3', 'vid-4', 'vid-5'].includes(v.id) &&
                  !['L_LUpnjgPso', 'bVde8cR0P8A', 'ynTuA_St464', 'Y9n9eB2Qo6s', 'fJ9rUzIMcZQ'].includes(v.youtubeId) &&
                  !INITIAL_MEDIA_EDUKASI.video.some((nv) => nv.youtubeId === v.youtubeId)
              );
              return {
                ...parsed.mediaEdukasi,
                infografis: cleanedInfografis,
                poster: cleanedPoster,
                video: [...INITIAL_MEDIA_EDUKASI.video, ...customVideos],
              };
            }
            return {
              ...parsed.mediaEdukasi,
              infografis: cleanedInfografis,
              poster: cleanedPoster,
            };
          })(),
          supabaseConfig: {
            url: finalUrl,
            anonKey: finalKey,
            isConnected: true,
            autoSync: true,
            lastSyncedAt: parsedCfg.lastSyncedAt || undefined,
          },
          pejabatConfig: { ...DEFAULT_PEJABAT_CONFIG, ...(parsed.pejabatConfig || {}) },
        };
      } else {
        this.db = {
          ...DEFAULT_DATABASE,
          customLinks: DEFAULT_DATABASE.customLinks.filter(isValidItem),
          piketHarian: [],
          sabtuBeliTehCeri: [],
          kebunLuasBerseri: [],
          senandungSerasi: [],
          eLaporPerundungan: [],
          bukuTamu: [],
          masterSiswa: DEFAULT_DATABASE.masterSiswa.filter(isValidItem),
          masterGuru: DEFAULT_DATABASE.masterGuru.filter(isValidItem),
        };
        this.saveDb();
      }

      // Check IndexedDB asynchronously for robust multi-device & offline backup
      getFromIndexedDB(STORAGE_KEY).then((idbData) => {
        if (idbData && typeof idbData === 'object' && this.db) {
          let hasNewerPhotos = false;
          // Check if any Senandung Serasi or other list has a photo in IndexedDB that was missing in localStorage
          ['senandungSerasi', 'piketHarian', 'sabtuBeliTehCeri', 'kebunLuasBerseri', 'eLaporPerundungan', 'bukuTamu'].forEach((key) => {
            const idbList = (idbData as any)[key];
            const currentList = (this.db as any)[key];
            if (Array.isArray(idbList) && Array.isArray(currentList)) {
              idbList.forEach((idbItem) => {
                const currentItem = currentList.find((c: any) => c.id === idbItem.id);
                if (currentItem) {
                  if (!currentItem.linkFoto && idbItem.linkFoto) {
                    currentItem.linkFoto = idbItem.linkFoto;
                    hasNewerPhotos = true;
                  }
                  if (!currentItem.tandaTangan && idbItem.tandaTangan) {
                    currentItem.tandaTangan = idbItem.tandaTangan;
                    hasNewerPhotos = true;
                  }
                } else {
                  // Complete item missing in localStorage (due to QuotaExceededError), restore from IndexedDB
                  if (idbItem && idbItem.id && !deletedIds.has(idbItem.id)) {
                    currentList.push(idbItem);
                    hasNewerPhotos = true;
                  }
                }
              });
            }
          });

          // Also restore mediaEdukasi (posters, custom materi, etc.) from IndexedDB if missing in localStorage
          if (idbData.mediaEdukasi && typeof idbData.mediaEdukasi === 'object' && this.db.mediaEdukasi) {
            (['poster', 'materi', 'infografis', 'video', 'pesan'] as const).forEach((subTab) => {
              const idbItems = (idbData.mediaEdukasi as any)[subTab];
              const currentItems = (this.db.mediaEdukasi as any)[subTab];
              if (Array.isArray(idbItems) && Array.isArray(currentItems)) {
                idbItems.forEach((idbItem: any) => {
                  if (idbItem && idbItem.id && !deletedIds.has(idbItem.id)) {
                    if (subTab === 'poster' && ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'].includes(idbItem.id)) {
                      return; // skip old deleted mock posters
                    }
                    const exists = currentItems.some((c: any) => c.id === idbItem.id);
                    if (!exists) {
                      currentItems.unshift(idbItem);
                      hasNewerPhotos = true;
                    }
                  }
                });
              }
            });
          }

          if (hasNewerPhotos) {
            this.saveDb();
            window.dispatchEvent(new Event('pass-temenan-db-updated'));
          }
        }
      });
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
      // Also persist to IndexedDB for unlimited capacity & safety against browser storage clearing
      saveToIndexedDB(STORAGE_KEY, this.db);
      // Trigger storage event for UI reactivity
      window.dispatchEvent(new Event('pass-temenan-db-updated'));
    } catch (e) {
      console.warn('LocalStorage quota warning, falling back to IndexedDB persistent storage:', e);
      // IndexedDB has gigabytes of storage, safe from localStorage QuotaExceededError
      saveToIndexedDB(STORAGE_KEY, this.db);
      window.dispatchEvent(new Event('pass-temenan-db-updated'));
    }
  }

  // --- MEDIA EDUKASI DIGITAL METHODS ---
  public static async saveMediaEdukasiItem(tab: MediaEdukasiSubTab, item: any): Promise<void> {
    const db = this.getDb();
    if (!db.mediaEdukasi) {
      db.mediaEdukasi = { ...INITIAL_MEDIA_EDUKASI };
    }

    let finalItem = { ...item };

    // 1. If item has a blob: URL (temporary local browser memory), convert to Blob and upload to Supabase Storage
    if (finalItem.gambarUrl && finalItem.gambarUrl.startsWith('blob:')) {
      try {
        const blobResp = await fetch(finalItem.gambarUrl);
        const blobData = await blobResp.blob();
        const uploadRes = await this.uploadPhotoToSupabase(blobData, tab === 'poster' ? 'poster-edukasi' : 'media-edukasi');
        if (uploadRes.url) {
          finalItem.gambarUrl = uploadRes.url;
        }
      } catch (blobErr) {
        console.warn('Blob URL cloud upload notice:', blobErr);
      }
    }

    // 2. If item has a base64 data URL, upload to Supabase storage for cloud persistence across devices (phone and laptop)
    if (finalItem.gambarUrl && finalItem.gambarUrl.startsWith('data:')) {
      try {
        const uploadRes = await this.uploadBase64ToSupabase(finalItem.gambarUrl, tab === 'poster' ? 'poster-edukasi' : 'media-edukasi');
        if (uploadRes.url) {
          finalItem.gambarUrl = uploadRes.url;
        }
      } catch (uploadErr) {
        console.warn('Cloud storage image upload fallback notice:', uploadErr);
      }
    }

    const currentList = Array.isArray(db.mediaEdukasi[tab])
      ? (db.mediaEdukasi[tab] as any[])
      : [];
    const list = [...currentList];
    const idx = list.findIndex((x: any) => x.id === finalItem.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...finalItem };
    } else {
      list.unshift(finalItem);
    }
    db.mediaEdukasi = {
      ...db.mediaEdukasi,
      [tab]: list,
    };
    this.db = {
      ...this.db,
      mediaEdukasi: db.mediaEdukasi,
    };
    this.unmarkDeleted(finalItem.id);
    this.saveDb();

    // 3. Save individual item into Supabase custom_links table for reliable multi-user and multi-device gallery access
    const categoryMap: Record<MediaEdukasiSubTab, string> = {
      poster: '__MEDIA_POSTER__',
      materi: '__MEDIA_MATERI__',
      infografis: '__MEDIA_INFOGRAFIS__',
      video: '__MEDIA_VIDEO__',
      pesan: '__MEDIA_PESAN__',
    };
    const itemCategory = categoryMap[tab] || '__SYSTEM_SETTINGS__';

    try {
      await this.safeUpsert('custom_links', {
        id: finalItem.id,
        title: finalItem.judul || finalItem.kutipan || 'Media Edukasi',
        url: finalItem.gambarUrl || finalItem.videoUrl || finalItem.linkDokumen || 'system://media',
        description: JSON.stringify(finalItem),
        category: itemCategory,
        icon_name: tab === 'poster' ? 'Image' : tab === 'video' ? 'Video' : 'Book',
        color: '#f59e0b',
        is_custom: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (indivErr) {
      console.warn('Individual item cloud sync notice:', indivErr);
    }

    // 4. Also sync full media edukasi database state to Supabase system settings row
    try {
      const upsertRes = await this.safeUpsert('custom_links', {
        id: '__APP_SETTING_MEDIA_EDUKASI__',
        title: 'Media Edukasi',
        url: 'system://media',
        description: JSON.stringify(db.mediaEdukasi),
        category: '__SYSTEM_SETTINGS__',
        icon_name: 'Book',
        color: '#0d9488',
        is_custom: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (upsertRes.error) {
        console.warn('Supabase media edukasi sync warning:', upsertRes.error);
      }
    } catch (syncErr) {
      console.warn('Supabase media edukasi sync exception:', syncErr);
    }
  }

  public static async deleteMediaEdukasiItem(tab: MediaEdukasiSubTab, id: string): Promise<void> {
    const db = this.getDb();
    if (!db.mediaEdukasi) return;
    const currentList = Array.isArray(db.mediaEdukasi[tab])
      ? (db.mediaEdukasi[tab] as any[])
      : [];
    db.mediaEdukasi = {
      ...db.mediaEdukasi,
      [tab]: currentList.filter((x: any) => x.id !== id),
    };
    this.db = {
      ...this.db,
      mediaEdukasi: db.mediaEdukasi,
    };
    this.markAsDeleted(id);
    this.saveDb();

    // Delete item directly from Supabase custom_links
    const client = this.getSupabaseClient();
    if (client) {
      client.from('custom_links').delete().eq('id', id).then(() => {});
    }

    // Sync updated media edukasi state to Supabase
    try {
      await this.safeUpsert('custom_links', {
        id: '__APP_SETTING_MEDIA_EDUKASI__',
        title: 'Media Edukasi',
        url: 'system://media',
        description: JSON.stringify(db.mediaEdukasi),
        category: '__SYSTEM_SETTINGS__',
        icon_name: 'Book',
        color: '#0d9488',
        is_custom: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (e) {}
  }

  public static toggleSukaPesan(id: string): void {
    const db = this.getDb();
    if (!db.mediaEdukasi?.pesan) return;
    const target = db.mediaEdukasi.pesan.find((p) => p.id === id);
    if (target) {
      target.sukaCount = (target.sukaCount || 0) + 1;
      this.saveDb();
    }
  }

  public static incrementUnduhanMedia(tab: 'materi' | 'poster' | 'infografis', id: string): void {
    const db = this.getDb();
    if (!db.mediaEdukasi) return;
    const list = db.mediaEdukasi[tab];
    if (!Array.isArray(list)) return;
    const target = list.find((item: any) => item.id === id);
    if (target) {
      target.unduhanCount = (target.unduhanCount || 0) + 1;
      this.saveDb();
    }
  }

  public static resetMediaEdukasiVideos(): void {
    const db = this.getDb();
    if (!db.mediaEdukasi) {
      db.mediaEdukasi = { ...INITIAL_MEDIA_EDUKASI };
    } else {
      const currentVideos = Array.isArray(db.mediaEdukasi.video) ? db.mediaEdukasi.video : [];
      // Keep any user-added videos (videos whose id or youtubeId is not one of the official ones)
      const officialIds = new Set(INITIAL_MEDIA_EDUKASI.video.map((v) => v.id));
      const officialYtIds = new Set(INITIAL_MEDIA_EDUKASI.video.map((v) => v.youtubeId).filter(Boolean));
      const userCustomVideos = currentVideos.filter(
        (v: any) => !officialIds.has(v.id) && (!v.youtubeId || !officialYtIds.has(v.youtubeId))
      );
      // Combine user custom videos first, followed by the 7 official videos
      db.mediaEdukasi.video = [...userCustomVideos, ...INITIAL_MEDIA_EDUKASI.video];
    }
    this.saveDb();
  }

  public static resetMediaEdukasiInfografis(): void {
    const db = this.getDb();
    if (!db.mediaEdukasi) {
      db.mediaEdukasi = { ...INITIAL_MEDIA_EDUKASI };
    } else {
      db.mediaEdukasi.infografis = [...INITIAL_MEDIA_EDUKASI.infografis];
    }
    this.saveDb();
  }

  public static clearAllPosters(): void {
    const db = this.getDb();
    const existingPosters = Array.isArray(db.mediaEdukasi?.poster) ? db.mediaEdukasi.poster : [];
    existingPosters.forEach((p: any) => {
      if (p.id) this.markAsDeleted(p.id);
    });
    if (!db.mediaEdukasi) {
      db.mediaEdukasi = { ...INITIAL_MEDIA_EDUKASI, poster: [] };
    } else {
      db.mediaEdukasi = {
        ...db.mediaEdukasi,
        poster: [],
      };
    }
    this.db = {
      ...this.db,
      mediaEdukasi: db.mediaEdukasi,
    };
    this.saveDb();
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

  // --- SUPABASE STORAGE BUCKET UPLOAD FOR ALL MENUS ---
  public static async uploadPhotoToSupabase(
    fileOrBlob: Blob | File,
    folder: string = 'dokumentasi'
  ): Promise<{ url: string | null; error: string | null }> {
    const client = this.getSupabaseClient();
    if (!client) {
      return { url: null, error: 'Koneksi Supabase belum aktif atau URL/Key belum diatur.' };
    }

    const bucketName = 'foto_kegiatan';

    try {
      // Compress the image before uploading to optimize cloud bandwidth and storage
      let uploadTarget: Blob | File = fileOrBlob;
      try {
        const compressed = await compressImage(fileOrBlob, 1000, 0.75);
        uploadTarget = compressed.blob;
      } catch (compErr) {
        console.warn('Image pre-compression fallback:', compErr);
      }

      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = `${cleanFolder}/${timestamp}_${randomStr}.jpg`;

      // Upload to Supabase Storage Bucket
      let { data, error } = await client.storage
        .from(bucketName)
        .upload(filePath, uploadTarget, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) {
        // Attempt automatic bucket creation if not found
        if (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('bucket')) {
          try {
            await client.storage.createBucket(bucketName, { public: true });
            const retryRes = await client.storage
              .from(bucketName)
              .upload(filePath, uploadTarget, {
                cacheControl: '3600',
                upsert: true,
                contentType: 'image/jpeg',
              });
            data = retryRes.data;
            error = retryRes.error;
          } catch (createErr) {
            console.warn('Bucket creation attempt notice:', createErr);
          }
        }
      }

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        return { url: null, error: error.message };
      }

      // Get public URL
      const { data: urlData } = client.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        return { url: urlData.publicUrl, error: null };
      }

      return { url: null, error: 'Gagal mendapatkan URL publik dari Supabase Storage.' };
    } catch (err: any) {
      console.error('Exception during Supabase storage upload:', err);
      return { url: null, error: err?.message || 'Gagal mengunggah foto ke Supabase Storage.' };
    }
  }

  // Convert Base64 data URL to Blob and upload to Supabase Storage
  public static async uploadBase64ToSupabase(
    base64Data: string,
    folder: string = 'dokumentasi'
  ): Promise<{ url: string | null; error: string | null }> {
    if (!base64Data) return { url: null, error: 'Data foto kosong' };
    if (!base64Data.startsWith('data:')) {
      // Already an online URL
      return { url: base64Data, error: null };
    }
    try {
      const arr = base64Data.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      return await this.uploadPhotoToSupabase(blob, folder);
    } catch (e: any) {
      return { url: null, error: e?.message || 'Gagal memproses gambar base64' };
    }
  }

  // Batch migrate any local base64 photos across all menus into Supabase Storage
  public static async migrateLocalPhotosToSupabase(): Promise<{ totalMigrated: number; failed: number; message: string }> {
    const db = this.getDb();
    let totalMigrated = 0;
    let failed = 0;

    // 1. Piket Harian
    for (const item of db.piketHarian) {
      if (item.linkFoto && item.linkFoto.startsWith('data:')) {
        const res = await this.uploadBase64ToSupabase(item.linkFoto, 'piket_harian');
        if (res.url) {
          item.linkFoto = res.url;
          totalMigrated++;
        } else {
          failed++;
        }
      }
    }

    // 2. Sabtu Beli Teh Ceri
    for (const item of db.sabtuBeliTehCeri) {
      if (item.linkFoto && item.linkFoto.startsWith('data:')) {
        const res = await this.uploadBase64ToSupabase(item.linkFoto, 'sabtu_teh_ceri');
        if (res.url) {
          item.linkFoto = res.url;
          totalMigrated++;
        } else {
          failed++;
        }
      }
    }

    // 3. Kebun Luas Berseri
    for (const item of db.kebunLuasBerseri) {
      if (item.linkFoto && item.linkFoto.startsWith('data:')) {
        const res = await this.uploadBase64ToSupabase(item.linkFoto, 'kebun_luas_berseri');
        if (res.url) {
          item.linkFoto = res.url;
          totalMigrated++;
        } else {
          failed++;
        }
      }
    }

    // 4. Senandung Serasi
    for (const item of db.senandungSerasi) {
      if (item.linkFoto && item.linkFoto.startsWith('data:')) {
        const res = await this.uploadBase64ToSupabase(item.linkFoto, 'senandung_serasi');
        if (res.url) {
          item.linkFoto = res.url;
          totalMigrated++;
        } else {
          failed++;
        }
      }
    }

    // 5. E-Lapor Perundungan
    for (const item of db.eLaporPerundungan) {
      if (item.linkFoto && item.linkFoto.startsWith('data:')) {
        const res = await this.uploadBase64ToSupabase(item.linkFoto, 'e_lapor');
        if (res.url) {
          item.linkFoto = res.url;
          totalMigrated++;
        } else {
          failed++;
        }
      }
    }

    // 6. Buku Tamu
    for (const item of db.bukuTamu) {
      if (item.linkFoto && item.linkFoto.startsWith('data:')) {
        const res = await this.uploadBase64ToSupabase(item.linkFoto, 'buku_tamu');
        if (res.url) {
          item.linkFoto = res.url;
          totalMigrated++;
        } else {
          failed++;
        }
      }
    }

    if (totalMigrated > 0) {
      this.saveDb();
      await this.syncToSupabase();
    }

    return {
      totalMigrated,
      failed,
      message: `Migrasi selesai: ${totalMigrated} foto berhasil diunggah ke Supabase Storage.${failed > 0 ? ` (${failed} gagal)` : ''}`,
    };
  }

  // --- MERGE HELPER FOR ROBUST CROSS-DEVICE SYNC ---
  private static mergeEntities<T extends { id: string; updatedAt?: string; createdAt?: string; linkFoto?: string; tandaTangan?: string }>(
    localList: T[],
    remoteList: T[],
    deletedIds: Set<string>
  ): { merged: T[]; missingInRemote: T[] } {
    const remoteMap = new Map<string, T>();
    const localMap = new Map<string, T>();

    // 1. Index local items (excluding deleted & mock)
    (localList || []).forEach((item) => {
      if (item && item.id && !deletedIds.has(item.id) && !LEGACY_MOCK_IDS.has(item.id)) {
        localMap.set(item.id, item);
      }
    });

    // 2. Put remote items into remoteMap as the single source of truth
    (remoteList || []).forEach((remoteItem) => {
      if (!remoteItem || !remoteItem.id || deletedIds.has(remoteItem.id) || LEGACY_MOCK_IDS.has(remoteItem.id)) return;

      const localItem = localMap.get(remoteItem.id);
      if (localItem) {
        // If remote item doesn't have photo/sig yet (e.g. was uploaded right before async photo upload completed), preserve local
        const mergedItem: T = { ...remoteItem };
        if (localItem.linkFoto && !mergedItem.linkFoto) {
          mergedItem.linkFoto = localItem.linkFoto;
        }
        if (localItem.tandaTangan && !mergedItem.tandaTangan) {
          mergedItem.tandaTangan = localItem.tandaTangan;
        }
        remoteMap.set(remoteItem.id, mergedItem);
      } else {
        remoteMap.set(remoteItem.id, remoteItem);
      }
    });

    // 3. Keep local items that are not yet in remote and sync them up
    const missingInRemote: T[] = [];
    localMap.forEach((localItem, id) => {
      if (!remoteMap.has(id)) {
        if (!deletedIds.has(id) && !LEGACY_MOCK_IDS.has(id)) {
          remoteMap.set(id, localItem);
          missingInRemote.push(localItem);
        }
      }
    });

    const merged = Array.from(remoteMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return timeB - timeA;
    });

    return { merged, missingInRemote };
  }

  // Missing column cache per Supabase table
  private static missingColumnsCache: Record<string, Set<string>> = {
    senandung_serasi: new Set(['link_foto', 'tanda_tangan']),
    piket_harian: new Set(['tanda_tangan']),
    sabtu_teh_ceri: new Set(['tanda_tangan']),
    kebun_luas_berseri: new Set(['link_foto', 'tanda_tangan']),
    e_lapor_perundungan: new Set(['link_foto', 'tanda_tangan']),
    buku_tamu: new Set(['link_foto']),
  };

  // Helper to pack missing columns into a metadata block inside 'keterangan'
  public static encodeMetaIntoKeterangan(keterangan: string = '', meta: Record<string, any>): string {
    if (!meta || Object.keys(meta).length === 0) return keterangan || '';
    const cleanKeterangan = (keterangan || '').replace(/\s*<!--PASS_META:[\s\S]*?-->/g, '').trim();
    const activeMeta: Record<string, any> = {};
    for (const [k, v] of Object.entries(meta)) {
      if (v !== undefined && v !== null && v !== '') {
        activeMeta[k] = v;
      }
    }
    if (Object.keys(activeMeta).length === 0) return cleanKeterangan;
    const metaStr = JSON.stringify(activeMeta);
    return cleanKeterangan ? `${cleanKeterangan}\n<!--PASS_META:${metaStr}-->` : `<!--PASS_META:${metaStr}-->`;
  }

  // Helper to unpack metadata block from 'keterangan'
  public static extractMeta(rawKeterangan: string = ''): { cleanKeterangan: string; meta: Record<string, any> } {
    if (!rawKeterangan) return { cleanKeterangan: '', meta: {} };
    const match = rawKeterangan.match(/<!--PASS_META:([\s\S]*?)-->/);
    if (!match) return { cleanKeterangan: rawKeterangan, meta: {} };
    try {
      const meta = JSON.parse(match[1]);
      const cleanKeterangan = rawKeterangan.replace(match[0], '').trim();
      return { cleanKeterangan, meta: meta || {} };
    } catch {
      return { cleanKeterangan: rawKeterangan, meta: {} };
    }
  }

  // Safe Upsert Helper with automatic column fallback, metadata preservation, and multi-user broadcast
  public static async safeUpsert(table: string, payload: any | any[]): Promise<{ error: any; data?: any }> {
    const client = this.getSupabaseClient();
    if (!client) return { error: new Error('Supabase client tidak aktif') };

    if (!this.missingColumnsCache[table]) {
      this.missingColumnsCache[table] = new Set<string>();
    }

    const prepareItem = (item: any, missingCols: Set<string>) => {
      if (!item || typeof item !== 'object') return item;
      const cloned = { ...item };
      const metaToEncode: Record<string, any> = {};

      for (const col of missingCols) {
        if (col in cloned) {
          if (cloned[col] !== undefined && cloned[col] !== null && cloned[col] !== '') {
            metaToEncode[col] = cloned[col];
          }
          delete cloned[col];
        }
      }

      if (Object.keys(metaToEncode).length > 0 && 'keterangan' in cloned) {
        cloned.keterangan = this.encodeMetaIntoKeterangan(cloned.keterangan, metaToEncode);
      }
      return cloned;
    };

    let currentMissing = new Set(this.missingColumnsCache[table]);
    let currentPayload = Array.isArray(payload)
      ? payload.map((it) => prepareItem(it, currentMissing))
      : prepareItem(payload, currentMissing);

    let attempts = 0;
    while (attempts < 8) {
      attempts++;
      try {
        const res = await client.from(table).upsert(currentPayload);
        if (!res.error) {
          this.broadcastChange(table, 'upsert');
          return { error: null, data: res.data };
        }

        const errMsg = res.error.message || '';
        // If column error detected: "Could not find the 'xyz' column of 'table' in the schema cache"
        const colMatch = errMsg.match(/Could not find the '([^']+)' column/i);
        if (colMatch && colMatch[1]) {
          const badCol = colMatch[1];
          this.missingColumnsCache[table].add(badCol);
          currentMissing.add(badCol);
          currentPayload = Array.isArray(payload)
            ? payload.map((it) => prepareItem(it, currentMissing))
            : prepareItem(payload, currentMissing);
          continue;
        }

        console.warn(`Supabase upsert into ${table} notice:`, errMsg);
        return { error: res.error };
      } catch (err: any) {
        console.warn(`Supabase upsert exception on ${table}:`, err);
        return { error: err };
      }
    }

    return { error: new Error(`Upsert ke ${table} gagal setelah ${attempts} percobaan`) };
  }

  // Cross-tab broadcast channel for instantaneous zero-latency updates across all open tabs in same browser
  private static crossTabChannel: BroadcastChannel | null =
    typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined'
      ? new BroadcastChannel('pass_temenan_multiuser_sync')
      : null;

  // Broadcast change across all connected users (Multi-user, Multi-device: HP, Laptop, PC, Tablet)
  public static async broadcastChange(table: string, action: string, itemId?: string): Promise<void> {
    const payload = { table, action, itemId, timestamp: Date.now() };

    // 1. Instant cross-tab broadcast within same browser
    try {
      if (this.crossTabChannel) {
        this.crossTabChannel.postMessage(payload);
      }
    } catch {}

    // 2. Dispatch custom event for current window
    try {
      window.dispatchEvent(new CustomEvent('pass-temenan-db-updated', { detail: payload }));
    } catch {}

    // 3. Supabase Realtime broadcast across internet to all other users/devices
    const client = this.getSupabaseClient();
    if (!client) return;
    try {
      if (this.realtimeChannel) {
        await this.realtimeChannel.send({
          type: 'broadcast',
          event: 'db_changed',
          payload,
        });
      }
    } catch (e) {
      // silently ignore
    }
  }

  // Realtime subscription instance
  private static realtimeChannel: any = null;

  public static initRealtimeSubscription(): () => void {
    // Setup cross-tab message handler
    if (this.crossTabChannel) {
      this.crossTabChannel.onmessage = (ev) => {
        if (ev.data) {
          this.fetchFromSupabase().then((res) => {
            if (res.success) {
              window.dispatchEvent(new Event('pass-temenan-db-updated'));
            }
          });
        }
      };
    }

    const client = this.getSupabaseClient();
    if (!client) return () => {};

    try {
      if (this.realtimeChannel) {
        client.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
      }

      const channel = client.channel('pass-temenan-realtime-sync', {
        config: { broadcast: { self: false } },
      });

      // 1. Listen for Supabase Broadcast (instant across all browsers/devices)
      channel.on('broadcast', { event: 'db_changed' }, async (payload) => {
        console.log('Realtime multi-user change received:', payload);
        await this.fetchFromSupabase();
        window.dispatchEvent(new Event('pass-temenan-db-updated'));
      });

      // 2. Listen for Postgres changes (when Supabase table replication is active)
      const tables = [
        'piket_harian',
        'sabtu_teh_ceri',
        'kebun_luas_berseri',
        'senandung_serasi',
        'e_lapor_perundungan',
        'buku_tamu',
        'master_siswa',
        'master_guru',
        'class_assignments',
        'custom_links',
      ];
      for (const t of tables) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table: t }, async () => {
          await this.fetchFromSupabase();
          window.dispatchEvent(new Event('pass-temenan-db-updated'));
        });
      }

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✓ Supabase Realtime channel connected for instant multi-device sync');
        }
      });

      this.realtimeChannel = channel;

      return () => {
        if (this.realtimeChannel) {
          client.removeChannel(this.realtimeChannel);
          this.realtimeChannel = null;
        }
      };
    } catch (e) {
      console.warn('Realtime subscription warning:', e);
      return () => {};
    }
  }

  public static async fetchFromSupabase(): Promise<{ success: boolean; message: string; counts?: Record<string, number> }> {
    const client = this.getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Konfigurasi Supabase belum diatur atau tidak valid.' };
    }

    const db = this.getDb();
    const deletedIds = this.getDeletedIds();
    const counts: Record<string, number> = {};
    const errors: string[] = [];

    try {
      // 1. Fetch Master Siswa
      try {
        const { data: siswaData, error: siswaErr } = await client
          .from('master_siswa')
          .select('*')
          .range(0, 4999);

        if (siswaErr) {
          if (!siswaErr.message.includes('relation "master_siswa" does not exist')) {
            errors.push(`Master Siswa: ${siswaErr.message}`);
          }
        } else if (siswaData) {
          const remoteSiswa: SiswaItem[] = siswaData.map((row: any) => ({
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

          const { merged, missingInRemote } = this.mergeEntities(db.masterSiswa, remoteSiswa, deletedIds);
          db.masterSiswa = merged;
          counts['master_siswa'] = db.masterSiswa.length;

          // Push missing local items to Supabase
          if (missingInRemote.length > 0) {
            client.from('master_siswa').upsert(
              missingInRemote.map((item) => ({
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
            ).then(() => {});
          }

          // Purge deleted rows from Supabase
          const toPurge = siswaData.filter((row: any) => deletedIds.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('master_siswa').delete().in('id', toPurge).then(() => {});
          }
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
        } else if (guruData) {
          const remoteGuru: GuruItem[] = guruData.map((row: any) => ({
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

          const { merged, missingInRemote } = this.mergeEntities(db.masterGuru, remoteGuru, deletedIds);
          db.masterGuru = merged;
          counts['master_guru'] = db.masterGuru.length;

          if (missingInRemote.length > 0) {
            client.from('master_guru').upsert(
              missingInRemote.map((item) => ({
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
            ).then(() => {});
          }

          const toPurge = guruData.filter((row: any) => deletedIds.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('master_guru').delete().in('id', toPurge).then(() => {});
          }
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

        if (!piketErr && piketData) {
          const remotePiket: PiketHarian[] = piketData.map((row: any) => {
            const { cleanKeterangan, meta } = this.extractMeta(row.keterangan);
            return {
              id: String(row.id),
              hariTanggal: row.hari_tanggal || row.hariTanggal || row.tanggal || '',
              waktu: row.waktu || '',
              namaAnggota: row.nama_anggota || row.namaAnggota || row.nama || '',
              kelas: row.kelas || '',
              hasilTemuan: row.hasil_temuan || row.hasilTemuan || row.temuan || '',
              linkFoto: row.link_foto || meta.link_foto || meta.linkFoto || row.foto || '',
              tandaTangan: row.tanda_tangan || meta.tanda_tangan || meta.tandaTangan || row.ttd || '',
              keterangan: cleanKeterangan || '',
              createdAt: row.created_at || row.createdAt || new Date().toISOString(),
              updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
            };
          });

          const { merged, missingInRemote } = this.mergeEntities(db.piketHarian, remotePiket, deletedIds);
          db.piketHarian = merged;
          counts['piket_harian'] = db.piketHarian.length;

          if (missingInRemote.length > 0) {
            this.safeUpsert(
              'piket_harian',
              missingInRemote.map((item) => ({
                id: item.id,
                hari_tanggal: item.hariTanggal,
                waktu: item.waktu,
                nama_anggota: item.namaAnggota,
                kelas: item.kelas || '',
                hasil_temuan: item.hasilTemuan,
                link_foto: item.linkFoto || '',
                tanda_tangan: item.tandaTangan || '',
                keterangan: item.keterangan || '',
                created_at: item.createdAt,
                updated_at: item.updatedAt,
              }))
            );
          }

          const toPurge = piketData.filter((row: any) => deletedIds.has(row.id) || LEGACY_MOCK_IDS.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('piket_harian').delete().in('id', toPurge).then(() => {});
          }
        }
      } catch (e: any) {
        // Silently handle
      }

      // 4. Fetch Sabtu Beli Teh Ceri
      try {
        const { data: ceriData, error: ceriErr } = await client
          .from('sabtu_teh_ceri')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!ceriErr && ceriData) {
          const remoteCeri: SabtuBeliTehCeri[] = ceriData.map((row: any) => {
            const { cleanKeterangan, meta } = this.extractMeta(row.keterangan);
            return {
              id: String(row.id),
              hariTanggal: row.hari_tanggal || row.hariTanggal || row.tanggal || '',
              waktu: row.waktu || '',
              hasilTemuan1Minggu: row.hasil_temuan_1minggu || row.hasilTemuan1Minggu || row.hasil_temuan || '',
              evaluasiKegiatan: row.evaluasi_kegiatan || row.evaluasiKegiatan || '',
              rencanaInovasi: row.rencana_inovasi || row.rencanaInovasi || '',
              linkFoto: row.link_foto || meta.link_foto || meta.linkFoto || '',
              tandaTangan: row.tanda_tangan || meta.tanda_tangan || meta.tandaTangan || '',
              keterangan: cleanKeterangan || '',
              createdAt: row.created_at || row.createdAt || new Date().toISOString(),
              updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
            };
          });

          const { merged, missingInRemote } = this.mergeEntities(db.sabtuBeliTehCeri, remoteCeri, deletedIds);
          db.sabtuBeliTehCeri = merged;
          counts['sabtu_teh_ceri'] = db.sabtuBeliTehCeri.length;

          if (missingInRemote.length > 0) {
            this.safeUpsert(
              'sabtu_teh_ceri',
              missingInRemote.map((item) => ({
                id: item.id,
                hari_tanggal: item.hariTanggal,
                waktu: item.waktu,
                hasil_temuan_1minggu: item.hasilTemuan1Minggu,
                evaluasi_kegiatan: item.evaluasiKegiatan || '',
                rencana_inovasi: item.rencanaInovasi || '',
                link_foto: item.linkFoto || '',
                tanda_tangan: item.tandaTangan || '',
                keterangan: item.keterangan || '',
                created_at: item.createdAt,
                updated_at: item.updatedAt,
              }))
            );
          }

          const toPurge = ceriData.filter((row: any) => deletedIds.has(row.id) || LEGACY_MOCK_IDS.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('sabtu_teh_ceri').delete().in('id', toPurge).then(() => {});
          }
        }
      } catch (e: any) {
        // Silently handle
      }

      // 5. Fetch Kebun Luas Berseri
      try {
        const { data: kebunData, error: kebunErr } = await client
          .from('kebun_luas_berseri')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!kebunErr && kebunData) {
          const remoteKebun: KebunLuasBerseri[] = kebunData.map((row: any) => {
            const { cleanKeterangan, meta } = this.extractMeta(row.keterangan);
            return {
              id: String(row.id),
              hariTanggal: row.hari_tanggal || row.hariTanggal || row.tanggal || '',
              waktu: row.waktu || '',
              evaluasiBerhasil: row.evaluasi_berhasil || row.evaluasiBerhasil || '',
              kendalaSolusi: row.kendala_solusi || row.kendalaSolusi || '',
              hasilInovasi: row.hasil_inovasi || row.hasilInovasi || '',
              produkKreatif: row.produk_kreatif || meta.produk_kreatif || meta.produkKreatif || '',
              rtlList: Array.isArray(row.rtl_list) ? row.rtl_list : (meta.rtl_list || meta.rtlList || []),
              linkFoto: row.link_foto || meta.link_foto || meta.linkFoto || '',
              tandaTangan: row.tanda_tangan || meta.tanda_tangan || meta.tandaTangan || '',
              keterangan: cleanKeterangan || '',
              createdAt: row.created_at || row.createdAt || new Date().toISOString(),
              updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
            };
          });

          const { merged, missingInRemote } = this.mergeEntities(db.kebunLuasBerseri, remoteKebun, deletedIds);
          db.kebunLuasBerseri = merged;
          counts['kebun_luas_berseri'] = db.kebunLuasBerseri.length;

          if (missingInRemote.length > 0) {
            this.safeUpsert(
              'kebun_luas_berseri',
              missingInRemote.map((item) => ({
                id: item.id,
                hari_tanggal: item.hariTanggal,
                waktu: item.waktu,
                evaluasi_berhasil: item.evaluasiBerhasil || '',
                kendala_solusi: item.kendalaSolusi || '',
                hasil_inovasi: item.hasilInovasi || '',
                produk_kreatif: item.produkKreatif || '',
                rtl_list: item.rtlList || [],
                link_foto: item.linkFoto || '',
                tanda_tangan: item.tandaTangan || '',
                keterangan: item.keterangan || '',
                created_at: item.createdAt,
                updated_at: item.updatedAt,
              }))
            );
          }

          const toPurge = kebunData.filter((row: any) => deletedIds.has(row.id) || LEGACY_MOCK_IDS.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('kebun_luas_berseri').delete().in('id', toPurge).then(() => {});
          }
        }
      } catch (e: any) {
        // Silently handle
      }

      // 6. Fetch Senandung Serasi
      try {
        const { data: senandungData, error: senandungErr } = await client
          .from('senandung_serasi')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!senandungErr && senandungData) {
          const remoteSenandung: SenandungSerasi[] = senandungData.map((row: any) => {
            const { cleanKeterangan, meta } = this.extractMeta(row.keterangan);
            return {
              id: String(row.id),
              hariTanggal: row.hari_tanggal || row.hariTanggal || row.tanggal || '',
              waktu: row.waktu || '',
              pesanDisampaikan: row.pesan_disampaikan || row.pesanDisampaikan || row.pesan || '',
              linkFoto: row.link_foto || meta.link_foto || meta.linkFoto || row.foto || '',
              tandaTangan: row.tanda_tangan || meta.tanda_tangan || meta.tandaTangan || '',
              keterangan: cleanKeterangan || '',
              createdAt: row.created_at || row.createdAt || new Date().toISOString(),
              updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
            };
          });

          const { merged, missingInRemote } = this.mergeEntities(db.senandungSerasi, remoteSenandung, deletedIds);
          db.senandungSerasi = merged;
          counts['senandung_serasi'] = db.senandungSerasi.length;

          if (missingInRemote.length > 0) {
            this.safeUpsert(
              'senandung_serasi',
              missingInRemote.map((item) => ({
                id: item.id,
                hari_tanggal: item.hariTanggal,
                waktu: item.waktu,
                pesan_disampaikan: item.pesanDisampaikan,
                link_foto: item.linkFoto || '',
                tanda_tangan: item.tandaTangan || '',
                keterangan: item.keterangan || '',
                created_at: item.createdAt,
                updated_at: item.updatedAt,
              }))
            );
          }

          const toPurge = senandungData.filter((row: any) => deletedIds.has(row.id) || LEGACY_MOCK_IDS.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('senandung_serasi').delete().in('id', toPurge).then(() => {});
          }
        }
      } catch (e: any) {
        // Silently handle
      }

      // 7. Fetch E-Lapor
      try {
        const { data: laporData, error: laporErr } = await client
          .from('e_lapor_perundungan')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!laporErr && laporData) {
          const remoteLapor: ELaporPerundungan[] = laporData.map((row: any) => {
            const { cleanKeterangan, meta } = this.extractMeta(row.keterangan);
            return {
              id: String(row.id),
              hariTanggal: row.hari_tanggal || row.hariTanggal || row.tanggal || '',
              waktuKejadian: row.waktu_kejadian || row.waktuKejadian || row.waktu || '',
              namaSiswa: row.nama_siswa || row.namaSiswa || row.nama || '',
              kelas: row.kelas || '',
              kronologi: row.kronologi || '',
              penyadaran: row.penyadaran || '',
              pencegahan: row.pencegahan || '',
              penangananRespon: row.penanganan_respon || row.penangananRespon || '',
              pelaporan: row.pelaporan || '',
              tindakLanjut: row.tindak_lanjut || row.tindakLanjut || '',
              status: row.status || 'Laporan Baru',
              linkFoto: row.link_foto || meta.link_foto || meta.linkFoto || '',
              tandaTangan: row.tanda_tangan || meta.tanda_tangan || meta.tandaTangan || '',
              keterangan: cleanKeterangan || '',
              createdAt: row.created_at || row.createdAt || new Date().toISOString(),
              updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
            };
          });

          const { merged, missingInRemote } = this.mergeEntities(db.eLaporPerundungan, remoteLapor, deletedIds);
          db.eLaporPerundungan = merged;
          counts['e_lapor_perundungan'] = db.eLaporPerundungan.length;

          if (missingInRemote.length > 0) {
            this.safeUpsert(
              'e_lapor_perundungan',
              missingInRemote.map((item) => ({
                id: item.id,
                hari_tanggal: item.hariTanggal,
                waktu_kejadian: item.waktuKejadian,
                nama_siswa: item.namaSiswa,
                kelas: item.kelas || '',
                kronologi: item.kronologi,
                penyadaran: item.penyadaran || '',
                pencegahan: item.pencegahan || '',
                penanganan_respon: item.penangananRespon || '',
                pelaporan: item.pelaporan || '',
                tindak_lanjut: item.tindakLanjut || '',
                status: item.status,
                link_foto: item.linkFoto || '',
                tanda_tangan: item.tandaTangan || '',
                keterangan: item.keterangan || '',
                created_at: item.createdAt,
                updated_at: item.updatedAt,
              }))
            );
          }

          const toPurge = laporData.filter((row: any) => deletedIds.has(row.id) || LEGACY_MOCK_IDS.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('e_lapor_perundungan').delete().in('id', toPurge).then(() => {});
          }
        }
      } catch (e: any) {
        // Silently handle
      }

      // 8. Fetch Buku Tamu
      try {
        const { data: tamuData, error: tamuErr } = await client
          .from('buku_tamu')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 999);

        if (!tamuErr && tamuData) {
          const remoteTamu: BukuTamu[] = tamuData.map((row: any) => {
            const { cleanKeterangan, meta } = this.extractMeta(row.keterangan);
            return {
              id: String(row.id),
              hariTanggal: row.hari_tanggal || row.hariTanggal || row.tanggal || '',
              jamKedatangan: row.jam_kedatangan || row.jamKedatangan || row.jam || row.waktu || '',
              namaLengkap: row.nama_lengkap || row.namaLengkap || row.nama || '',
              nipNik: row.nip_nik || row.nipNik || row.nip || '',
              jabatan: row.jabatan || '',
              instansiAsal: row.instansi_asal || row.instansiAsal || row.instansi || '',
              tujuanKunjungan: row.tujuan_kunjungan || row.tujuanKunjungan || row.tujuan || '',
              linkFoto: row.link_foto || meta.link_foto || meta.linkFoto || '',
              tandaTangan: row.tanda_tangan || meta.tanda_tangan || meta.tandaTangan || '',
              tindakLanjut: row.tindak_lanjut || row.tindakLanjut || '',
              keterangan: cleanKeterangan || '',
              createdAt: row.created_at || row.createdAt || new Date().toISOString(),
              updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
            };
          });

          const { merged, missingInRemote } = this.mergeEntities(db.bukuTamu, remoteTamu, deletedIds);
          db.bukuTamu = merged;
          counts['buku_tamu'] = db.bukuTamu.length;

          if (missingInRemote.length > 0) {
            this.safeUpsert(
              'buku_tamu',
              missingInRemote.map((item) => ({
                id: item.id,
                hari_tanggal: item.hariTanggal,
                jam_kedatangan: item.jamKedatangan,
                nama_lengkap: item.namaLengkap,
                nip_nik: item.nipNik,
                jabatan: item.jabatan,
                instansi_asal: item.instansiAsal,
                tujuan_kunjungan: item.tujuanKunjungan,
                link_foto: item.linkFoto || '',
                tanda_tangan: item.tandaTangan,
                tindak_lanjut: item.tindakLanjut,
                keterangan: item.keterangan,
                created_at: item.createdAt,
                updated_at: item.updatedAt,
              }))
            );
          }

          const toPurge = tamuData.filter((row: any) => deletedIds.has(row.id) || LEGACY_MOCK_IDS.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('buku_tamu').delete().in('id', toPurge).then(() => {});
          }
        }
      } catch (e: any) {
        // Silently handle
      }

      // 9. Fetch Custom Links and Media Edukasi
      try {
        const { data: linkData, error: linkErr } = await client
          .from('custom_links')
          .select('*')
          .range(0, 999);

        if (!linkErr && linkData) {
          if (!db.mediaEdukasi) {
            db.mediaEdukasi = { ...INITIAL_MEDIA_EDUKASI };
          }

          // Extract system settings if stored in custom_links fallback
          const systemRows = linkData.filter((r: any) => r.category === '__SYSTEM_SETTINGS__' || r.id?.startsWith('__APP_SETTING_'));
          systemRows.forEach((r: any) => {
            try {
              if (r.id === '__APP_SETTING_PEJABAT__' && r.description) {
                db.pejabatConfig = { ...(db.pejabatConfig || DEFAULT_PEJABAT_CONFIG), ...JSON.parse(r.description) };
              } else if (r.id === '__APP_SETTING_MEDIA_EDUKASI__' && r.description) {
                db.mediaEdukasi = { ...(db.mediaEdukasi || INITIAL_MEDIA_EDUKASI), ...JSON.parse(r.description) };
              }
            } catch (err) {}
          });

          // Extract granular media edukasi items (Posters, Materi, Infografis, Video, Pesan) for cross-user gallery synchronization
          const mediaTabConfigs: Array<{ category: string; tab: MediaEdukasiSubTab }> = [
            { category: '__MEDIA_POSTER__', tab: 'poster' },
            { category: '__MEDIA_MATERI__', tab: 'materi' },
            { category: '__MEDIA_INFOGRAFIS__', tab: 'infografis' },
            { category: '__MEDIA_VIDEO__', tab: 'video' },
            { category: '__MEDIA_PESAN__', tab: 'pesan' },
          ];

          mediaTabConfigs.forEach(({ category, tab }) => {
            const rows = linkData.filter((r: any) => r.category === category && !deletedIds.has(r.id));
            if (rows.length > 0) {
              const remoteItems = rows.map((r: any) => {
                try {
                  if (r.description && (r.description.startsWith('{') || r.description.startsWith('['))) {
                    return JSON.parse(r.description);
                  }
                } catch (e) {}
                return {
                  id: r.id,
                  judul: r.title,
                  gambarUrl: r.url,
                  tema: 'Kampanye Utama',
                  deskripsi: r.description || '',
                  kreator: 'Satgas SPANJU',
                  tanggal: (r.created_at || new Date().toISOString()).split('T')[0],
                  resolusi: 'HD Standard',
                  unduhanCount: 0,
                  isKaryaSiswa: true,
                };
              }).filter((it: any) => !deletedIds.has(it.id) && !['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'].includes(it.id));

              const currentList = Array.isArray(db.mediaEdukasi![tab]) ? (db.mediaEdukasi![tab] as any[]) : [];
              const itemMap = new Map<string, any>();
              remoteItems.forEach((it: any) => itemMap.set(it.id, it));
              currentList.forEach((it: any) => {
                if (!deletedIds.has(it.id)) {
                  itemMap.set(it.id, { ...(itemMap.get(it.id) || {}), ...it });
                }
              });
              (db.mediaEdukasi as any)[tab] = Array.from(itemMap.values());
            }
          });

          // Standard user links (exclude system settings and media categories)
          const userLinkRows = linkData.filter(
            (r: any) =>
              r.category !== '__SYSTEM_SETTINGS__' &&
              !r.id?.startsWith('__APP_SETTING_') &&
              !r.category?.startsWith('__MEDIA_')
          );
          const remoteLinks: CustomLink[] = userLinkRows.map((row: any) => ({
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

          const { merged, missingInRemote } = this.mergeEntities(db.customLinks, remoteLinks, deletedIds);
          db.customLinks = merged;
          counts['custom_links'] = db.customLinks.length;

          if (missingInRemote.length > 0) {
            client.from('custom_links').upsert(
              missingInRemote.map((item) => ({
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
            ).then(() => {});
          }

          // Push local posters to Supabase if not yet present in remote custom_links
          if (Array.isArray(db.mediaEdukasi?.poster) && db.mediaEdukasi.poster.length > 0) {
            const existingRemotePosterIds = new Set(
              linkData.filter((r: any) => r.category === '__MEDIA_POSTER__').map((r: any) => r.id)
            );
            const postersToUpload = db.mediaEdukasi.poster.filter(
              (p: any) => !existingRemotePosterIds.has(p.id) && !deletedIds.has(p.id)
            );
            if (postersToUpload.length > 0) {
              client.from('custom_links').upsert(
                postersToUpload.map((p: any) => ({
                  id: p.id,
                  title: p.judul,
                  url: p.gambarUrl,
                  description: JSON.stringify(p),
                  category: '__MEDIA_POSTER__',
                  icon_name: 'Image',
                  color: '#f59e0b',
                  is_custom: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }))
              ).then(() => {});
            }
          }

          const toPurge = linkData.filter((row: any) => deletedIds.has(row.id)).map((r: any) => r.id);
          if (toPurge.length > 0) {
            client.from('custom_links').delete().in('id', toPurge).then(() => {});
          }
        }
      } catch (e: any) {
        // Silently handle
      }

      // 10. Fetch Class Assignments (Zona Hijau Tiap Kelas)
      try {
        const { data: classData, error: classErr } = await client
          .from('class_assignments')
          .select('*')
          .range(0, 999);

        if (!classErr && classData && classData.length > 0) {
          if (!db.classAssignments) db.classAssignments = {};
          classData.forEach((row: any) => {
            if (row.nama_kelas) {
              db.classAssignments![row.nama_kelas] = {
                waliKelas: row.wali_kelas || '',
                dutaAntiBullying: row.duta_anti_bullying || '',
                ikrarSiswa: row.ikrar_siswa || '',
                catatanKegiatan: row.catatan_kegiatan || '',
                deklarasiDamai: row.deklarasi_damai ?? true,
                updatedAt: row.updated_at || new Date().toISOString(),
              };
            }
          });
          counts['class_assignments'] = classData.length;
        }
      } catch (e: any) {
        // Silently handle
      }

      // 11. Fetch App Settings (Pejabat Config, Tanda Tangan, dll)
      try {
        const { data: settingsData, error: settingsErr } = await client
          .from('app_settings')
          .select('*')
          .range(0, 100);

        if (!settingsErr && settingsData && settingsData.length > 0) {
          const pejabatRow = settingsData.find((r: any) => r.key === 'pejabat_config');
          if (pejabatRow && pejabatRow.value) {
            const parsedVal = typeof pejabatRow.value === 'string' ? JSON.parse(pejabatRow.value) : pejabatRow.value;
            db.pejabatConfig = {
              ...(db.pejabatConfig || DEFAULT_PEJABAT_CONFIG),
              ...parsedVal,
            };
          }
        }
      } catch (e: any) {
        // Silently handle
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
        await this.safeUpsert(
          'piket_harian',
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
        syncedCount += db.piketHarian.length;
      }

      // 2. Sabtu Beli Teh Ceri
      if (db.sabtuBeliTehCeri.length > 0) {
        await this.safeUpsert(
          'sabtu_teh_ceri',
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
        syncedCount += db.sabtuBeliTehCeri.length;
      }

      // 3. Kebun Luas Berseri
      if (db.kebunLuasBerseri.length > 0) {
        await this.safeUpsert(
          'kebun_luas_berseri',
          db.kebunLuasBerseri.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            waktu: item.waktu,
            evaluasi_berhasil: item.evaluasiBerhasil,
            kendala_solusi: item.kendalaSolusi,
            hasil_inovasi: item.hasilInovasi,
            produk_kreatif: item.produkKreatif,
            rtl_list: item.rtlList,
            link_foto: item.linkFoto || null,
            tanda_tangan: item.tandaTangan || null,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        syncedCount += db.kebunLuasBerseri.length;
      }

      // 4. Senandung Serasi
      if (db.senandungSerasi.length > 0) {
        await this.safeUpsert(
          'senandung_serasi',
          db.senandungSerasi.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            waktu: item.waktu,
            pesan_disampaikan: item.pesanDisampaikan,
            link_foto: item.linkFoto || null,
            tanda_tangan: item.tandaTangan || null,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        syncedCount += db.senandungSerasi.length;
      }

      // 5. E-Lapor Perundungan
      if (db.eLaporPerundungan.length > 0) {
        await this.safeUpsert(
          'e_lapor_perundungan',
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
            link_foto: item.linkFoto || null,
            tanda_tangan: item.tandaTangan || null,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        syncedCount += db.eLaporPerundungan.length;
      }

      // 6. Buku Tamu
      if (db.bukuTamu.length > 0) {
        await this.safeUpsert(
          'buku_tamu',
          db.bukuTamu.map((item) => ({
            id: item.id,
            hari_tanggal: item.hariTanggal,
            jam_kedatangan: item.jamKedatangan,
            nama_lengkap: item.namaLengkap,
            nip_nik: item.nipNik,
            jabatan: item.jabatan,
            instansi_asal: item.instansiAsal,
            tujuan_kunjungan: item.tujuanKunjungan,
            link_foto: item.linkFoto || null,
            tanda_tangan: item.tandaTangan,
            tindak_lanjut: item.tindakLanjut,
            keterangan: item.keterangan,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          }))
        );
        syncedCount += db.bukuTamu.length;
      }

      // 7. Master Siswa
      if (db.masterSiswa && db.masterSiswa.length > 0) {
        await this.safeUpsert(
          'master_siswa',
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
        syncedCount += db.masterSiswa.length;
      }

      // 8. Master Guru
      if (db.masterGuru && db.masterGuru.length > 0) {
        await this.safeUpsert(
          'master_guru',
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
        syncedCount += db.masterGuru.length;
      }

      // 9. Custom Links
      if (db.customLinks.length > 0) {
        await this.safeUpsert(
          'custom_links',
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
        syncedCount += db.customLinks.length;
      }

      // 10. Class Assignments (Zona Hijau Tiap Kelas)
      if (db.classAssignments && Object.keys(db.classAssignments).length > 0) {
        const assignmentsList = Object.entries(db.classAssignments).map(([namaKelas, val]) => ({
          nama_kelas: namaKelas,
          wali_kelas: val.waliKelas || '',
          duta_anti_bullying: val.dutaAntiBullying || '',
          ikrar_siswa: val.ikrarSiswa || '',
          catatan_kegiatan: val.catatanKegiatan || '',
          deklarasi_damai: val.deklarasiDamai ?? true,
          updated_at: val.updatedAt || new Date().toISOString(),
        }));
        await this.safeUpsert('class_assignments', assignmentsList);
        syncedCount += assignmentsList.length;
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

  // --- DEDICATED MASTER GURU SUPABASE SYNC ---
  public static async syncGuruToSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    const client = this.getSupabaseClient();
    if (!client) {
      return {
        success: false,
        message: 'Konfigurasi Supabase belum diatur. Silakan atur URL & Anon Key di menu Pengaturan Supabase.',
      };
    }

    const db = this.getDb();
    if (!db.masterGuru || db.masterGuru.length === 0) {
      return {
        success: false,
        message: 'Belum ada data guru di sistem untuk disimpan ke Supabase.',
      };
    }

    try {
      const chunkSize = 100;
      let totalSynced = 0;

      for (let i = 0; i < db.masterGuru.length; i += chunkSize) {
        const chunk = db.masterGuru.slice(i, i + chunkSize);
        const { error } = await client.from('master_guru').upsert(
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

        if (error) {
          throw new Error(error.message);
        }
        totalSynced += chunk.length;
      }

      db.supabaseConfig.lastSyncedAt = new Date().toISOString();
      db.supabaseConfig.isConnected = true;
      this.saveDb();

      return {
        success: true,
        message: `Berhasil menyimpan ${totalSynced} data guru ke Supabase Cloud! Seluruh pengguna kini dapat mengakses data ini secara otomatis.`,
        count: totalSynced,
      };
    } catch (e: any) {
      console.error('Sync guru to Supabase error:', e);
      return {
        success: false,
        message: `Gagal menyimpan data guru ke Supabase: ${e?.message || 'Error tidak diketahui'}. Pastikan tabel 'master_guru' sudah dibuat di SQL Editor Supabase.`,
      };
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
    this.unmarkDeleted(saved.id);
    this.saveDb();

    this.safeUpsert('custom_links', {
      id: saved.id,
      title: saved.title,
      url: saved.url,
      description: saved.description || '',
      category: saved.category,
      icon_name: saved.iconName,
      color: saved.color,
      is_custom: saved.isCustom,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    });

    return saved;
  }

  public static saveLink(link: any): CustomLink {
    return this.saveCustomLink(link);
  }

  public static deleteCustomLink(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.customLinks = db.customLinks.filter((l) => l.id !== id);
    this.saveDb();
    this.deleteFromSupabase('custom_links', id);
  }

  public static deleteLink(id: string): void {
    this.deleteCustomLink(id);
  }

  // 2. Piket Harian
  public static async savePiketHarian(item: Omit<PiketHarian, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<PiketHarian > {
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
    

    
    if (saved.linkFoto && saved.linkFoto.startsWith('data:')) {
      const res = await this.uploadBase64ToSupabase(saved.linkFoto, 'piket_harian');
      if (res.url) {
        saved.linkFoto = res.url;
      }
    }
    const upsertRes = await this.safeUpsert('piket_harian', {
      id: saved.id,
      hari_tanggal: saved.hariTanggal,
      waktu: saved.waktu,
      nama_anggota: saved.namaAnggota,
      kelas: saved.kelas || '',
      hasil_temuan: saved.hasilTemuan,
      link_foto: saved.linkFoto || '',
      tanda_tangan: saved.tandaTangan || '',
      keterangan: saved.keterangan || '',
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    });
    if (upsertRes.error) {
      throw new Error(upsertRes.error.message || 'Gagal menyimpan ke Supabase');
    }
    this.unmarkDeleted(saved.id);
    this.saveDb();

    return saved;
  }

  public static deletePiketHarian(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.piketHarian = db.piketHarian.filter((p) => p.id !== id);
    this.saveDb();
    this.deleteFromSupabase('piket_harian', id);
  }

  public static async saveSabtuBeliTehCeri(item: Omit<SabtuBeliTehCeri, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<SabtuBeliTehCeri> {
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
    
    if (saved.linkFoto && saved.linkFoto.startsWith('data:')) {
      const res = await this.uploadBase64ToSupabase(saved.linkFoto, 'sabtu_teh_ceri');
      if (res.url) {
        saved.linkFoto = res.url;
      }
    }

    const upsertRes = await this.safeUpsert('sabtu_teh_ceri', {
      id: saved.id,
      hari_tanggal: saved.hariTanggal,
      waktu: saved.waktu,
      hasil_temuan_1minggu: saved.hasilTemuan1Minggu,
      evaluasi_kegiatan: saved.evaluasiKegiatan,
      rencana_inovasi: saved.rencanaInovasi,
      link_foto: saved.linkFoto || '',
      tanda_tangan: saved.tandaTangan || '',
      keterangan: saved.keterangan || '',
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    });
    if (upsertRes.error) {
      throw new Error(upsertRes.error.message || 'Gagal menyimpan ke Supabase');
    }
    this.unmarkDeleted(saved.id);
    this.saveDb();
    return saved;
  }

  public static deleteSabtuBeliTehCeri(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.sabtuBeliTehCeri = db.sabtuBeliTehCeri.filter((p) => p.id !== id);
    this.saveDb();
    this.deleteFromSupabase('sabtu_teh_ceri', id);
  }

  public static async saveKebunLuasBerseri(item: Omit<KebunLuasBerseri, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<KebunLuasBerseri> {
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
    
    if (saved.linkFoto && saved.linkFoto.startsWith('data:')) {
      const res = await this.uploadBase64ToSupabase(saved.linkFoto, 'kebun_luas_berseri');
      if (res.url) {
        saved.linkFoto = res.url;
      }
    }

    const upsertRes = await this.safeUpsert('kebun_luas_berseri', {
      id: saved.id,
      hari_tanggal: saved.hariTanggal,
      waktu: saved.waktu,
      evaluasi_berhasil: saved.evaluasiBerhasil,
      kendala_solusi: saved.kendalaSolusi,
      hasil_inovasi: saved.hasilInovasi,
      produk_kreatif: saved.produkKreatif,
      rtl_list: JSON.stringify(saved.rtlList || []),
      link_foto: saved.linkFoto || '',
      tanda_tangan: saved.tandaTangan || '',
      keterangan: saved.keterangan || '',
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    });
    if (upsertRes.error) {
      throw new Error(upsertRes.error.message || 'Gagal menyimpan ke Supabase');
    }
    this.unmarkDeleted(saved.id);
    this.saveDb();
    return saved;
  }

  public static deleteKebunLuasBerseri(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.kebunLuasBerseri = db.kebunLuasBerseri.filter((p) => p.id !== id);
    this.saveDb();
    this.deleteFromSupabase('kebun_luas_berseri', id);
  }

  // 5. Senandung Serasi
  public static async saveSenandungSerasi(item: Omit<SenandungSerasi, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<SenandungSerasi > {
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
    

    const upsertRes = await this.safeUpsert('senandung_serasi', {
      id: saved.id,
      hari_tanggal: saved.hariTanggal,
      waktu: saved.waktu,
      pesan_disampaikan: saved.pesanDisampaikan,
      link_foto: saved.linkFoto || '',
      tanda_tangan: saved.tandaTangan || '',
      keterangan: saved.keterangan || '',
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    });
    if (upsertRes.error) {
      throw new Error(upsertRes.error.message || 'Gagal menyimpan ke Supabase');
    }
    this.unmarkDeleted(saved.id);
    this.saveDb();

    if (saved.linkFoto && saved.linkFoto.startsWith('data:')) {
      this.uploadBase64ToSupabase(saved.linkFoto, 'senandung_serasi').then((res) => {
        if (res.url) {
          saved.linkFoto = res.url;
          this.saveDb();
          this.safeUpsert('senandung_serasi', { id: saved.id, link_foto: res.url });
        }
      });
    }

    return saved;
  }

  public static deleteSenandungSerasi(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.senandungSerasi = db.senandungSerasi.filter((p) => p.id !== id);
    this.saveDb();
    this.deleteFromSupabase('senandung_serasi', id);
  }

  // 6. E-Lapor Perundungan
  public static async saveELapor(item: Omit<ELaporPerundungan, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<ELaporPerundungan > {
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
    

    const upsertRes = await this.safeUpsert('e_lapor_perundungan', {
      id: saved.id,
      hari_tanggal: saved.hariTanggal,
      waktu_kejadian: saved.waktuKejadian,
      nama_siswa: saved.namaSiswa,
      kelas: saved.kelas || '',
      kronologi: saved.kronologi,
      penyadaran: saved.penyadaran || '',
      pencegahan: saved.pencegahan || '',
      penanganan_respon: saved.penangananRespon || '',
      pelaporan: saved.pelaporan || '',
      tindak_lanjut: saved.tindakLanjut || '',
      status: saved.status || 'Laporan Baru',
      link_foto: saved.linkFoto || '',
      tanda_tangan: saved.tandaTangan || '',
      keterangan: saved.keterangan || '',
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    });
    if (upsertRes.error) {
      throw new Error(upsertRes.error.message || 'Gagal menyimpan ke Supabase');
    }
    this.unmarkDeleted(saved.id);
    this.saveDb();

    if (saved.linkFoto && saved.linkFoto.startsWith('data:')) {
      this.uploadBase64ToSupabase(saved.linkFoto, 'e_lapor').then((res) => {
        if (res.url) {
          saved.linkFoto = res.url;
          this.saveDb();
          this.safeUpsert('e_lapor_perundungan', { id: saved.id, link_foto: res.url });
        }
      });
    }

    return saved;
  }

  public static deleteELapor(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.eLaporPerundungan = db.eLaporPerundungan.filter((p) => p.id !== id);
    this.saveDb();
    this.deleteFromSupabase('e_lapor_perundungan', id);
  }

  public static async saveELaporPerundungan(item: Parameters<typeof StorageService.saveELapor>[0]): Promise<ELaporPerundungan >{
    return await this.saveELapor(item);
  }

  public static deleteELaporPerundungan(id: string): void {
    return this.deleteELapor(id);
  }

  // 7. Buku Tamu
  public static async saveBukuTamu(item: Omit<BukuTamu, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<BukuTamu > {
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
    

    const upsertRes = await this.safeUpsert('buku_tamu', {
      id: saved.id,
      hari_tanggal: saved.hariTanggal,
      jam_kedatangan: saved.jamKedatangan,
      nama_lengkap: saved.namaLengkap,
      nip_nik: saved.nipNik || '',
      jabatan: saved.jabatan || '',
      instansi_asal: saved.instansiAsal,
      tujuan_kunjungan: saved.tujuanKunjungan,
      link_foto: saved.linkFoto || '',
      tanda_tangan: saved.tandaTangan || '',
      tindak_lanjut: saved.tindakLanjut || '',
      keterangan: saved.keterangan || '',
      created_at: saved.createdAt,
      updated_at: saved.updatedAt,
    });
    if (upsertRes.error) {
      throw new Error(upsertRes.error.message || 'Gagal menyimpan ke Supabase');
    }
    this.unmarkDeleted(saved.id);
    this.saveDb();

    if (saved.linkFoto && saved.linkFoto.startsWith('data:')) {
      this.uploadBase64ToSupabase(saved.linkFoto, 'buku_tamu').then((res) => {
        if (res.url) {
          saved.linkFoto = res.url;
          this.saveDb();
          this.safeUpsert('buku_tamu', { id: saved.id, link_foto: res.url });
        }
      });
    }

    return saved;
  }

  public static deleteBukuTamu(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.bukuTamu = db.bukuTamu.filter((p) => p.id !== id);
    this.saveDb();
    this.deleteFromSupabase('buku_tamu', id);
  }

  // --- MASTER SISWA CRUD & EXCEL IMPORT ---
  public static async saveSiswa(item: Omit<SiswaItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<SiswaItem > {
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
    

    // Background sync to Supabase if connected
    const upsertRes = await this.safeUpsert('master_siswa', {
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
    });
    if (upsertRes.error) {
      throw new Error(upsertRes.error.message || 'Gagal menyimpan ke Supabase');
    }
    this.unmarkDeleted(saved.id);
    this.saveDb();

    return saved;
  }

  public static deleteSiswa(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.masterSiswa = db.masterSiswa.filter((s) => s.id !== id);
    this.saveDb();
    this.deleteFromSupabase('master_siswa', id);
  }

  public static deleteMultipleSiswa(ids: string[]): void {
    ids.forEach((id) => this.markAsDeleted(id));
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
  public static async saveGuru(item: Omit<GuruItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<GuruItem > {
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
    

    // Background sync to Supabase if connected
    const upsertRes = await this.safeUpsert('master_guru', {
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
    });
    if (upsertRes.error) {
      throw new Error(upsertRes.error.message || 'Gagal menyimpan ke Supabase');
    }
    this.unmarkDeleted(saved.id);
    this.saveDb();

    return saved;
  }

  public static deleteGuru(id: string): void {
    this.markAsDeleted(id);
    const db = this.getDb();
    db.masterGuru = db.masterGuru.filter((g) => g.id !== id);
    this.saveDb();
    this.deleteFromSupabase('master_guru', id);
  }

  public static deleteMultipleGuru(ids: string[]): void {
    ids.forEach((id) => this.markAsDeleted(id));
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

    // Trigger cloud sync to Supabase if connected
    const client = this.getSupabaseClient();
    if (client && db.masterGuru.length > 0) {
      this.syncGuruToSupabase().catch((err) => {
        console.warn('Auto sync guru in merge mode notice:', err);
      });
    }

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

    // Sync to Supabase app_settings table
    this.safeUpsert('app_settings', {
      key: 'pejabat_config',
      value: JSON.stringify(db.pejabatConfig),
      updated_at: new Date().toISOString(),
    }).then(() => {
      this.broadcastChange('app_settings', 'update');
    });

    // Also persist into custom_links as reliable fallback
    this.safeUpsert('custom_links', {
      id: '__APP_SETTING_PEJABAT__',
      title: 'Pejabat Config',
      url: 'system://pejabat',
      description: JSON.stringify(db.pejabatConfig),
      category: '__SYSTEM_SETTINGS__',
      icon_name: 'Shield',
      color: '#0d9488',
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return db.pejabatConfig;
  }

  public static async syncClassAssignmentsToSupabase(): Promise<{ success: boolean; message: string; isTableMissing?: boolean }> {
    const client = this.getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client belum diatur.' };
    }
    const db = this.getDb();
    if (!db.classAssignments || Object.keys(db.classAssignments).length === 0) {
      return { success: true, message: 'Belum ada data penugasan kelas untuk disinkronkan.' };
    }
    try {
      const assignmentsList = Object.entries(db.classAssignments).map(([namaKelas, val]) => ({
        nama_kelas: namaKelas,
        wali_kelas: val.waliKelas || '',
        duta_anti_bullying: val.dutaAntiBullying || '',
        ikrar_siswa: val.ikrarSiswa || '',
        catatan_kegiatan: val.catatanKegiatan || '',
        deklarasi_damai: val.deklarasiDamai ?? true,
        updated_at: val.updatedAt || new Date().toISOString(),
      }));

      const { error } = await client.from('class_assignments').upsert(assignmentsList);
      if (error) {
        const isMissing =
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist') ||
          error.code === '42P01' ||
          error.code === 'PGRST204';

        if (isMissing) {
          console.warn('Tabel class_assignments belum dibuat di Supabase. Data disimpan secara lokal di browser.');
          return {
            success: false,
            isTableMissing: true,
            message: 'Tabel "class_assignments" belum dibuat di database Supabase. Data tetap tersimpan aman di lokal browser. Silakan jalankan skrip SQL di menu Supabase.',
          };
        }
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Berhasil menyinkronkan data Zona Hijau ${assignmentsList.length} kelas ke Supabase Cloud!`,
      };
    } catch (e: any) {
      const errMsg = e?.message || 'Error tidak diketahui';
      console.warn('Sync class assignments notice:', errMsg);
      return { success: false, message: `Info sinkronisasi Zona Hijau: ${errMsg}` };
    }
  }

  public static saveClassAssignment(
    namaKelas: string,
    dataOrWali: string | Partial<ClassAssignmentItem>,
    legacyDuta?: string,
    legacyIkrar?: string,
    legacyCatatan?: string
  ): { success: boolean; message: string } {
    const db = this.getDb();
    if (!db.classAssignments) {
      db.classAssignments = {};
    }
    const initialDefault = INITIAL_CLASS_ZONE_DATA.find((c) => c.namaKelas === namaKelas);
    const existing = db.classAssignments[namaKelas] || {
      waliKelas: initialDefault?.waliKelas || '',
      dutaAntiBullying: initialDefault?.dutaAntiBullying || '',
      ikrarSiswa: initialDefault?.ikrarSiswa || '',
      catatanKegiatan: initialDefault?.catatanKegiatan || '',
      deklarasiDamai: initialDefault?.deklarasiDamai ?? true,
    };

    if (typeof dataOrWali === 'string') {
      db.classAssignments[namaKelas] = {
        waliKelas: dataOrWali || existing.waliKelas,
        dutaAntiBullying: legacyDuta !== undefined ? legacyDuta : existing.dutaAntiBullying,
        ikrarSiswa: legacyIkrar !== undefined ? legacyIkrar : existing.ikrarSiswa,
        catatanKegiatan: legacyCatatan !== undefined ? legacyCatatan : existing.catatanKegiatan,
        deklarasiDamai: existing.deklarasiDamai ?? true,
        updatedAt: new Date().toISOString(),
      };
    } else {
      db.classAssignments[namaKelas] = {
        waliKelas: dataOrWali.waliKelas !== undefined ? dataOrWali.waliKelas : existing.waliKelas,
        dutaAntiBullying: dataOrWali.dutaAntiBullying !== undefined ? dataOrWali.dutaAntiBullying : existing.dutaAntiBullying,
        ikrarSiswa: dataOrWali.ikrarSiswa !== undefined ? dataOrWali.ikrarSiswa : existing.ikrarSiswa,
        catatanKegiatan: dataOrWali.catatanKegiatan !== undefined ? dataOrWali.catatanKegiatan : existing.catatanKegiatan,
        deklarasiDamai: dataOrWali.deklarasiDamai !== undefined ? dataOrWali.deklarasiDamai : (existing.deklarasiDamai ?? true),
        updatedAt: new Date().toISOString(),
      };
    }

    this.saveDb();

    // Trigger cloud sync to Supabase if connected
    const client = this.getSupabaseClient();
    if (client) {
      this.syncClassAssignmentsToSupabase().catch((err) => {
        console.warn('Auto sync class assignments notice:', err);
      });
    }

    return {
      success: true,
      message: `Data Zona Hijau Kelas ${namaKelas} berhasil disimpan ke sistem & Cloud!`,
    };
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
    tanda_tangan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.piket_harian ADD COLUMN IF NOT EXISTS tanda_tangan TEXT;
ALTER TABLE public.piket_harian ADD COLUMN IF NOT EXISTS link_foto TEXT;
ALTER TABLE public.piket_harian ADD COLUMN IF NOT EXISTS kelas TEXT;

-- 2. Tabel Sabtu Beli Teh Ceri
CREATE TABLE IF NOT EXISTS public.sabtu_teh_ceri (
    id TEXT PRIMARY KEY,
    hari_tanggal TEXT NOT NULL,
    waktu TEXT NOT NULL,
    hasil_temuan_1minggu TEXT NOT NULL,
    evaluasi_kegiatan TEXT,
    rencana_inovasi TEXT,
    link_foto TEXT,
    tanda_tangan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.sabtu_teh_ceri ADD COLUMN IF NOT EXISTS tanda_tangan TEXT;
ALTER TABLE public.sabtu_teh_ceri ADD COLUMN IF NOT EXISTS link_foto TEXT;

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
    tanda_tangan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.kebun_luas_berseri ADD COLUMN IF NOT EXISTS link_foto TEXT;
ALTER TABLE public.kebun_luas_berseri ADD COLUMN IF NOT EXISTS tanda_tangan TEXT;
ALTER TABLE public.kebun_luas_berseri ADD COLUMN IF NOT EXISTS rtl_list JSONB DEFAULT '[]'::jsonb;

-- 4. Tabel Senandung Serasi
CREATE TABLE IF NOT EXISTS public.senandung_serasi (
    id TEXT PRIMARY KEY,
    hari_tanggal TEXT NOT NULL,
    waktu TEXT NOT NULL,
    pesan_disampaikan TEXT NOT NULL,
    link_foto TEXT,
    tanda_tangan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.senandung_serasi ADD COLUMN IF NOT EXISTS link_foto TEXT;
ALTER TABLE public.senandung_serasi ADD COLUMN IF NOT EXISTS tanda_tangan TEXT;

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
    link_foto TEXT,
    tanda_tangan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.e_lapor_perundungan ADD COLUMN IF NOT EXISTS link_foto TEXT;
ALTER TABLE public.e_lapor_perundungan ADD COLUMN IF NOT EXISTS tanda_tangan TEXT;
ALTER TABLE public.e_lapor_perundungan ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Laporan Baru';

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
    link_foto TEXT,
    tanda_tangan TEXT,
    tindak_lanjut TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.buku_tamu ADD COLUMN IF NOT EXISTS link_foto TEXT;

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

-- 10. Tabel Penugasan Zona Hijau Kelas (Wali Kelas, Duta Bullying, Ikrar, Catatan)
CREATE TABLE IF NOT EXISTS public.class_assignments (
    nama_kelas TEXT PRIMARY KEY,
    wali_kelas TEXT NOT NULL,
    duta_anti_bullying TEXT NOT NULL,
    ikrar_siswa TEXT,
    catatan_kegiatan TEXT,
    deklarasi_damai BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel App Settings (Pengaturan Pejabat, Kepala Sekolah, Guru BK)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
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
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Public Read All" ON public.class_assignments FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.class_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.class_assignments FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.class_assignments FOR DELETE USING (true);

CREATE POLICY "Public Read All" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Public Insert All" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update All" ON public.app_settings FOR UPDATE USING (true);
CREATE POLICY "Public Delete All" ON public.app_settings FOR DELETE USING (true);

-- 12. Konfigurasi Supabase Storage Bucket untuk Foto Dokumentasi Online
INSERT INTO storage.buckets (id, name, public)
VALUES ('foto_kegiatan', 'foto_kegiatan', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Kebijakan Akses Publik Storage Foto Kegiatan
CREATE POLICY "Public Storage Select" ON storage.objects FOR SELECT USING (bucket_id = 'foto_kegiatan');
CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'foto_kegiatan');
CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE USING (bucket_id = 'foto_kegiatan');
CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'foto_kegiatan');
`;
  }
}
