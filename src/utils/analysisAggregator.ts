import { AppDatabase, ELaporPerundungan, PiketHarian, SabtuBeliTehCeri, KebunLuasBerseri } from '../types';
import { ClassZoneInfo, INITIAL_CLASS_ZONE_DATA, MonthlyTrendData, MONTHLY_TREND_DATA } from '../data/classZoneData';

/**
 * Helper to normalize class names to standard 7A-9H format.
 * Examples: "VIII C", "VIII-C", "8 C", "8C", "Kelas 8C" -> "8C"
 */
export function normalizeClassName(rawClass: string): string | null {
  if (!rawClass) return null;
  const cleaned = rawClass
    .toUpperCase()
    .replace(/KELAS/g, '')
    .replace(/ROMBEL/g, '')
    .replace(/TIM/g, '')
    .replace(/POKJA/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Convert Roman numerals
  const converted = cleaned
    .replace(/VIII/g, '8')
    .replace(/VII/g, '7')
    .replace(/IX/g, '9');

  const match = converted.match(/([789])\s*([A-H])/);
  if (match) {
    return `${match[1]}${match[2]}`;
  }
  return null;
}

/**
 * Parse date string (e.g. "Rabu, 12 Agustus 2026" or ISO string) to month index 0-11
 */
function parseMonthIndex(dateStr: string): number {
  if (!dateStr) return new Date().getMonth();
  const lower = dateStr.toLowerCase();
  
  if (lower.includes('jan')) return 0;
  if (lower.includes('feb')) return 1;
  if (lower.includes('mar')) return 2;
  if (lower.includes('apr')) return 3;
  if (lower.includes('mei') || lower.includes('may')) return 4;
  if (lower.includes('jun')) return 5;
  if (lower.includes('jul')) return 6;
  if (lower.includes('ags') || lower.includes('aug') || lower.includes('agustus')) return 7;
  if (lower.includes('sep')) return 8;
  if (lower.includes('okt') || lower.includes('oct')) return 9;
  if (lower.includes('nov')) return 10;
  if (lower.includes('des') || lower.includes('dec')) return 11;

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.getMonth();
    }
  } catch {
    // fallback
  }
  return 7; // Default to August (Ags)
}

/**
 * Categorize incident text into Verbal, Fisik, Relasional, or Siber
 */
function categorizeIncident(text: string): 'verbal' | 'fisik' | 'relasional' | 'siber' {
  const lower = text.toLowerCase();
  if (lower.includes('fisik') || lower.includes('dorong') || lower.includes('pukul') || lower.includes('tendang') || lower.includes('kontak')) {
    return 'fisik';
  }
  if (lower.includes('siber') || lower.includes('cyber') || lower.includes('whatsapp') || lower.includes('wa') || lower.includes('online') || lower.includes('medsos')) {
    return 'siber';
  }
  if (lower.includes('relasional') || lower.includes('isolasi') || lower.includes('kucil') || lower.includes('abaikan') || lower.includes('geng')) {
    return 'relasional';
  }
  return 'verbal';
}

/**
 * Computes live Class Zone analysis aggregated from all 4 applications
 */
export function calculateClassZoneData(db: AppDatabase): ClassZoneInfo[] {
  // Clone initial 24 class templates
  const classMap = new Map<string, ClassZoneInfo>();
  INITIAL_CLASS_ZONE_DATA.forEach((cls) => {
    classMap.set(cls.namaKelas, {
      ...cls,
      kasusVerbal: 0,
      kasusFisik: 0,
      kasusRelasional: 0,
      kasusSiber: 0,
      kasusSelesai: 0,
      skorKepatuhan: 100,
      statusZona: 'ZONA_HIJAU',
    });
  });

  // 1. Process E-Lapor Perundungan (Direct perundungan reports)
  (db.eLaporPerundungan || []).forEach((item) => {
    const clsName = normalizeClassName(item.kelas) || normalizeClassName(item.kronologi) || normalizeClassName(item.namaSiswa);
    if (clsName && classMap.has(clsName)) {
      const clsInfo = classMap.get(clsName)!;
      const cat = categorizeIncident(`${item.kronologi} ${item.penyadaran} ${item.penangananRespon} ${item.keterangan}`);
      
      if (cat === 'verbal') clsInfo.kasusVerbal += 1;
      else if (cat === 'fisik') clsInfo.kasusFisik += 1;
      else if (cat === 'relasional') clsInfo.kasusRelasional += 1;
      else if (cat === 'siber') clsInfo.kasusSiber += 1;

      if (item.status === 'Selesai' || item.status === 'Mediasi') {
        clsInfo.kasusSelesai += 1;
      }
    }
  });

  // 2. Process Piket Harian (Look for perundungan/kejadian findings per class)
  (db.piketHarian || []).forEach((item) => {
    const text = `${item.hasilTemuan} ${item.keterangan}`.toLowerCase();
    const hasIncident = text.includes('perundungan') || text.includes('bullying') || text.includes('ejekan') || text.includes('konflik') || text.includes('perselisihan') || text.includes('kekerasan');
    
    if (hasIncident) {
      const clsName = normalizeClassName(item.kelas) || normalizeClassName(text);
      if (clsName && classMap.has(clsName)) {
        const clsInfo = classMap.get(clsName)!;
        const cat = categorizeIncident(text);
        if (cat === 'verbal') clsInfo.kasusVerbal += 1;
        else if (cat === 'fisik') clsInfo.kasusFisik += 1;
        else if (cat === 'relasional') clsInfo.kasusRelasional += 1;
        else if (cat === 'siber') clsInfo.kasusSiber += 1;

        // Piket findings handled on site count as resolved
        clsInfo.kasusSelesai += 1;
      }
    }
  });

  // 3. Process Sabtu Beli Teh Ceri (Inovasi mingguan findings)
  (db.sabtuBeliTehCeri || []).forEach((item) => {
    const text = `${item.hasilTemuan1Minggu} ${item.evaluasiKegiatan} ${item.keterangan}`.toLowerCase();
    const hasIncident = text.includes('perundungan') || text.includes('bullying') || text.includes('konflik') || text.includes('ejekan') || text.includes('kekerasan');
    
    if (hasIncident) {
      // Find any class mentioned in text
      INITIAL_CLASS_ZONE_DATA.forEach((c) => {
        if (text.includes(c.namaKelas.toLowerCase())) {
          const clsInfo = classMap.get(c.namaKelas)!;
          const cat = categorizeIncident(text);
          if (cat === 'verbal') clsInfo.kasusVerbal += 1;
          else if (cat === 'fisik') clsInfo.kasusFisik += 1;
          else if (cat === 'relasional') clsInfo.kasusRelasional += 1;
          else if (cat === 'siber') clsInfo.kasusSiber += 1;
          clsInfo.kasusSelesai += 1;
        }
      });
    }
  });

  // 4. Process Kebun Luas Berseri (Evaluasi bulanan findings)
  (db.kebunLuasBerseri || []).forEach((item) => {
    const text = `${item.evaluasiBerhasil} ${item.kendalaSolusi} ${item.keterangan}`.toLowerCase();
    const hasIncident = text.includes('perundungan') || text.includes('bullying') || text.includes('konflik') || text.includes('ejekan') || text.includes('kekerasan');

    if (hasIncident) {
      INITIAL_CLASS_ZONE_DATA.forEach((c) => {
        if (text.includes(c.namaKelas.toLowerCase())) {
          const clsInfo = classMap.get(c.namaKelas)!;
          const cat = categorizeIncident(text);
          if (cat === 'verbal') clsInfo.kasusVerbal += 1;
          else if (cat === 'fisik') clsInfo.kasusFisik += 1;
          else if (cat === 'relasional') clsInfo.kasusRelasional += 1;
          else if (cat === 'siber') clsInfo.kasusSiber += 1;
          clsInfo.kasusSelesai += 1;
        }
      });
    }
  });

  // Recalculate status & compliance score for all 24 classes
  const result: ClassZoneInfo[] = Array.from(classMap.values()).map((cls) => {
    const totalKasus = cls.kasusVerbal + cls.kasusFisik + cls.kasusRelasional + cls.kasusSiber;
    const unresolved = Math.max(0, totalKasus - cls.kasusSelesai);

    let skorKepatuhan = 100;
    let statusZona: 'ZONA_HIJAU' | 'ZONA_KUNING' | 'ZONA_MERAH' = 'ZONA_HIJAU';

    if (totalKasus === 0) {
      skorKepatuhan = 100;
      statusZona = 'ZONA_HIJAU';
    } else if (unresolved === 0) {
      skorKepatuhan = Math.max(95, 100 - totalKasus);
      statusZona = 'ZONA_HIJAU';
    } else if (unresolved <= 2) {
      skorKepatuhan = Math.max(80, 100 - unresolved * 10);
      statusZona = 'ZONA_KUNING';
    } else {
      skorKepatuhan = Math.max(60, 100 - unresolved * 15);
      statusZona = 'ZONA_MERAH';
    }

    return {
      ...cls,
      skorKepatuhan,
      statusZona,
    };
  });

  return result;
}

/**
 * Computes live Monthly Trend data aggregated from all 4 applications
 */
export function calculateMonthlyTrendData(db: AppDatabase): MonthlyTrendData[] {
  // Baseline benchmarks for "Sebelum Pass Temenan"
  const BASELINE_SEBELUM = [14, 16, 12, 15, 11, 10, 13, 15, 12, 14, 11, 13];
  
  const monthNames = [
    { short: 'Jan', full: 'Januari 2026' },
    { short: 'Feb', full: 'Februari 2026' },
    { short: 'Mar', full: 'Maret 2026' },
    { short: 'Apr', full: 'April 2026' },
    { short: 'Mei', full: 'Mei 2026' },
    { short: 'Jun', full: 'Juni 2026' },
    { short: 'Jul', full: 'Juli 2026' },
    { short: 'Ags', full: 'Agustus 2026' },
    { short: 'Sep', full: 'September 2026' },
    { short: 'Okt', full: 'Oktober 2026' },
    { short: 'Nov', full: 'November 2026' },
    { short: 'Des', full: 'Desember 2026' },
  ];

  const trends: MonthlyTrendData[] = monthNames.map((m, idx) => ({
    bulan: m.short,
    bulanFull: m.full,
    sebelumPassTemenan: BASELINE_SEBELUM[idx],
    sesudahPassTemenan: 0,
    kasusSelesai: 0,
    verbal: 0,
    fisik: 0,
    relasional: 0,
    siber: 0,
  }));

  // Helper to add case to month
  const addCaseToMonth = (dateStr: string, cat: 'verbal' | 'fisik' | 'relasional' | 'siber', isResolved: boolean) => {
    const mIdx = parseMonthIndex(dateStr);
    const target = trends[mIdx];
    if (target) {
      target.sesudahPassTemenan += 1;
      if (cat === 'verbal') target.verbal += 1;
      else if (cat === 'fisik') target.fisik += 1;
      else if (cat === 'relasional') target.relasional += 1;
      else if (cat === 'siber') target.siber += 1;

      if (isResolved) {
        target.kasusSelesai += 1;
      }
    }
  };

  // 1. E-Lapor Perundungan
  (db.eLaporPerundungan || []).forEach((item) => {
    const cat = categorizeIncident(`${item.kronologi} ${item.penyadaran} ${item.penangananRespon} ${item.keterangan}`);
    const isResolved = item.status === 'Selesai' || item.status === 'Mediasi';
    addCaseToMonth(item.hariTanggal || item.createdAt, cat, isResolved);
  });

  // 2. Piket Harian
  (db.piketHarian || []).forEach((item) => {
    const text = `${item.hasilTemuan} ${item.keterangan}`.toLowerCase();
    const hasIncident = text.includes('perundungan') || text.includes('bullying') || text.includes('ejekan') || text.includes('konflik') || text.includes('perselisihan') || text.includes('kekerasan');
    if (hasIncident) {
      const cat = categorizeIncident(text);
      addCaseToMonth(item.hariTanggal || item.createdAt, cat, true);
    }
  });

  // 3. Sabtu Beli Teh Ceri
  (db.sabtuBeliTehCeri || []).forEach((item) => {
    const text = `${item.hasilTemuan1Minggu} ${item.evaluasiKegiatan}`.toLowerCase();
    const hasIncident = text.includes('perundungan') || text.includes('bullying') || text.includes('konflik') || text.includes('ejekan') || text.includes('kekerasan');
    if (hasIncident) {
      const cat = categorizeIncident(text);
      addCaseToMonth(item.hariTanggal || item.createdAt, cat, true);
    }
  });

  // 4. Kebun Luas Berseri
  (db.kebunLuasBerseri || []).forEach((item) => {
    const text = `${item.evaluasiBerhasil} ${item.kendalaSolusi}`.toLowerCase();
    const hasIncident = text.includes('perundungan') || text.includes('bullying') || text.includes('konflik') || text.includes('ejekan') || text.includes('kekerasan');
    if (hasIncident) {
      const cat = categorizeIncident(text);
      addCaseToMonth(item.hariTanggal || item.createdAt, cat, true);
    }
  });

  return trends;
}
