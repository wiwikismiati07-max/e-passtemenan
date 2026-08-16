export interface RencanaInovasiItem {
  id: string;
  category: string;
  categoryBadge: string;
  color: 'purple' | 'emerald' | 'amber' | 'blue' | 'indigo' | 'rose' | 'teal';
  modul?: string;
  judulKegiatan: string;
  fokusKegiatan?: string;
  materi: string[];
  bentukInovasi?: string | string[];
  judulKampanye?: string[];
}

export const RENCANA_INOVASI_LIST: RencanaInovasiItem[] = [
  {
    id: 'modul-1',
    category: 'Kampanye Digital & Budaya Sekolah',
    categoryBadge: 'Digital & Media',
    color: 'purple',
    modul: 'Modul 1: Medsos Sehat, Diri Selamat',
    judulKegiatan: 'Netizen Smepan: Jempol Cerdas, No Cyberbullying!',
    materi: [
      'Dampak psikologis cyberbullying (ejekan di grup WhatsApp, komentar negatif, atau doxxing).',
      'Batasan antara candaan (banting joke) dan perundungan siber.',
      'Digital footprints (jejak digital) dan etika berkomunikasi di media sosial.',
      'Fitur pelaporan digital aman dan rahasia melalui aplikasi SIAP SPANJU / PASS TEMENAN.',
    ],
    bentukInovasi: 'Lomba pembuatan poster/video pendek kreatif antar-kelas tentang etika medsos, dipublikasikan di kanal media sosial sekolah.',
  },
  {
    id: 'modul-2',
    category: 'Olah Rasa & Kesehatan Mental (Area LITERASA 7)',
    categoryBadge: 'LITERASA 7',
    color: 'emerald',
    modul: 'Modul 2: Eksplorasi Empati & Regulasi Emosi',
    judulKegiatan: 'LITERASA 7: Suarakan Emosi, Sebar Toleransi',
    materi: [
      'Mengenali dan mengelola emosi marah, kecewa, serta frustrasi secara positif.',
      'Latihan empati: Perspektif Korban (memahami apa yang dirasakan orang lain saat diintimidasi).',
      'Komunikasi asertif (cara menolak kekerasan tanpa memicu konflik).',
    ],
    bentukInovasi: [
      '"Pohon Harapan & Bebas Perundungan": Siswa menuliskan refleksi/komitmen dukungan pada daun kertas yang ditempel di sudut area LITERASA 7.',
      'Sesi Mindfulness & Emotional Check-in: Bimbingan kelompok singkat bersama Tim BK/TPPK untuk melatih kecerdasan emosional.',
    ],
  },
  {
    id: 'modul-3',
    category: 'Pembentukan Karakter & Budaya Sebaya (PASS Temenan)',
    categoryBadge: 'PASS Temenan',
    color: 'amber',
    modul: 'Modul 3: Agen Perubahan & Pendamping Sebaya',
    judulKegiatan: 'PASS Temenan: Teman Lindungi Teman, Bukannya Menekan',
    materi: [
      'Peran Bystander (saksi kejadian): Cara aman menjadi pelindung, bukan penonton atau provokator.',
      'Nilai kepedulian (PASS Temenan): Gotong royong, menghargai perbedaan, dan anti-kekerasan fisik/verbal.',
      'Alur pelaporan kasus secara rahasia dan objektif tanpa takut diintimidasi.',
    ],
    bentukInovasi: [
      'Deklarasi & Inisiasi Duta Anti-Perundungan: Pemilihan dan pengukuhan perwakilan siswa tiap kelas sebagai agen peduli sebaya.',
      'Gelora Senam & Panggung Ekspresi Karakter: Pentas seni/drama singkat antar-kelas dengan tema penolakan kekerasan.',
    ],
  },
  {
    id: 'modul-4',
    category: 'Kolaborasi Sekolah & Orang Tua',
    categoryBadge: 'Parenting & Sinergi',
    color: 'blue',
    modul: 'Modul 4: Sinergi Pola Asuh Bebas Kekerasan',
    judulKegiatan: 'Kelas Orang Tua Hebat: Rumah Aman, Sekolah Nyaman',
    materi: [
      'Deteksi dini tanda-tanda anak menjadi korban atau pelaku perundungan di sekolah.',
      'Komunikasi terbuka orang tua–anak di era digital.',
      'Penanganan masalah anak secara transparan dan berkeadilan tanpa penyelesaian emosional.',
    ],
    bentukInovasi: 'Forum edukasi & komitmen bersama (Parenting Talkshow) bertepatan dengan penerimaan rekap harian/bulanan kedisiplinan siswa.',
  },
  {
    id: 'inovasi-5',
    category: 'Gerakan 7 Menit Peduli (7-Minute Care Routine)',
    categoryBadge: 'Pembiasaan Harian',
    color: 'indigo',
    judulKegiatan: 'Gerakan 7 Menit Peduli (7-Minute Care Routine)',
    fokusKegiatan: 'Pembiasaan harian/mingguan sebelum KBM dimulai berupa refleksi empati dan komitmen bersama di dalam kelas.',
    materi: [
      'Mengenali bentuk-bentuk bullying (verbal, fisik, relasional, dan siber).',
      'Pengelolaan emosi (self-regulation) dan resolusi konflik tanpa kekerasan.',
      'Bystander Empowerment: Cara berani melapor dan menolong teman yang terintimidasi.',
    ],
    judulKampanye: [
      '"7 Menit Menyapa, 7 Menit Empatiku"',
      '"SPANJU Care: Kenali, Cegah, dan Saling Jaga"',
    ],
  },
  {
    id: 'inovasi-6',
    category: 'Literasa 7: Zona Express & Emotional Check-in',
    categoryBadge: 'Zona Literasa',
    color: 'emerald',
    judulKegiatan: 'Literasa 7: Zona Express & Emotional Check-in',
    fokusKegiatan: 'Pemanfaatan area literasi dan olah rasa (LITERASA 7) sebagai ruang ekspresi positif, konseling sebaya, dan apresiasi karya siswa.',
    materi: [
      'Ekspresi Seni & Tulisan: Pembuatan poster interaktif, pohon harapan, dan mading ekspresi "Suara Anak SPANJU".',
      'Edukasi Mental Health & Resilience: Pentingnya menjaga kesehatan mental dan saling merangkul perbedaan.',
      'Workshop Sederhana: Komunikasi asertif dan teknik meredakan amarah.',
    ],
    judulKampanye: [
      '"Literasa 7: Merangkul Kata, Menghapus Luka"',
      '"Olah Rasa SPANJU: Bebas Ekspresi Tanpa Intimidasi"',
    ],
  },
  {
    id: 'inovasi-7',
    category: 'Duta Pass Temenan & Peer Counseling',
    categoryBadge: 'Duta Sebaya',
    color: 'teal',
    judulKegiatan: 'Duta Pass Temenan & Peer Counseling',
    fokusKegiatan: 'Pembentukan dan pengukuhan perwakilan siswa dari tiap kelas sebagai agen perubahan dan kader pendamping sebaya.',
    materi: [
      'Pelatihan dasar mediasi teman sebaya (peer mediation).',
      'Pemahaman batasan candaan (joke vs bullying).',
      'Tata cara penggunaan pelaporan digital yang aman melalui modul SIM-DIS / SIAP SPANJU.',
    ],
    judulKampanye: [
      '"PASS Temenan: Teman Sejati Bebas Perundungan"',
      '"Kader Teman Baik: Bersama Mewujudkan Sekolah Ramah Anak"',
    ],
  },
  {
    id: 'inovasi-8',
    category: 'Kampanye Digital & Pekan Inovasi Anti-Bullying',
    categoryBadge: 'Pekan Inovasi',
    color: 'purple',
    judulKegiatan: 'Kampanye Digital & Pekan Inovasi Anti-Bullying',
    fokusKegiatan: 'Lomba kreatif dan aksi digital yang melibatkan seluruh warga sekolah serta dipublikasikan pada media internal/sosial sekolah.',
    materi: [
      'Etika Berinternet (Digital Citizenship): Stop bahaya cyberbullying, ujaran kebencian, dan penyebaran konten merugikan.',
      'Pembuatan Karya Kreatif: Lomba poster 3D digital, video pendek edukasi, dan komik strip anti-kekerasan.',
    ],
    judulKampanye: [
      '"SPANJU Cyber-Smart: Jempol Bijak, Sekolah Nyaman"',
      '"Festive PASS 7: Kreasiku Tanpa Kekerasan"',
    ],
  },
  {
    id: 'inovasi-9',
    category: 'Kolaborasi "Orang Tua Hebat" Anti-Kekerasan',
    categoryBadge: 'Parenting Hebat',
    color: 'rose',
    judulKegiatan: 'Kolaborasi "Orang Tua Hebat" Anti-Kekerasan',
    fokusKegiatan: 'Seminar interaktif dan penandatanganan komitmen bersama antara pihak sekolah, komite, dan orang tua murid.',
    materi: [
      'Deteksi dini perubahan perilaku anak (gejala korban atau pelaku perundungan).',
      'Sinergi pola asuh positif di rumah dan aturan kedisiplinan di sekolah.',
      'Prosedur penanganan kasus yang adil, objektif, dan transparan.',
    ],
    judulKampanye: [
      '"Kelas Orang Tua Hebat: Bersinergi Melindungi, Bersama Menjaga Anak"',
      '"Rumah dan SPANJU: Ruang Aman untuk Anak Kita"',
    ],
  },
];

export function formatRencanaInovasiText(
  item: RencanaInovasiItem,
  formatMode: 'lengkap' | 'ringkas' | 'judul_materi' | 'judul_kampanye' = 'lengkap'
): string {
  if (formatMode === 'ringkas') {
    let text = `${item.modul ? item.modul + ' - ' : ''}${item.judulKegiatan}`;
    if (item.fokusKegiatan) {
      text += `\nFokus: ${item.fokusKegiatan}`;
    }
    if (item.bentukInovasi) {
      const inovasi = Array.isArray(item.bentukInovasi)
        ? item.bentukInovasi.join('\n- ')
        : item.bentukInovasi;
      text += `\nBentuk Inovasi: ${Array.isArray(item.bentukInovasi) ? '\n- ' + inovasi : inovasi}`;
    }
    if (item.judulKampanye && item.judulKampanye.length > 0) {
      text += `\nSlogan/Kampanye: ${item.judulKampanye.join(' / ')}`;
    }
    return text;
  }

  if (formatMode === 'judul_kampanye') {
    let text = `${item.judulKegiatan}`;
    if (item.judulKampanye && item.judulKampanye.length > 0) {
      text += `\nJudul Kampanye: \n${item.judulKampanye.map((k) => `• ${k}`).join('\n')}`;
    }
    return text;
  }

  // Format Lengkap
  let text = '';
  if (item.modul) {
    text += `【${item.category}】\n${item.modul}\nJudul Kegiatan: "${item.judulKegiatan}"\n\n`;
  } else {
    text += `【${item.category}】\nJudul Kegiatan: ${item.judulKegiatan}\n`;
    if (item.fokusKegiatan) {
      text += `Fokus Kegiatan: ${item.fokusKegiatan}\n\n`;
    } else {
      text += '\n';
    }
  }

  text += `Materi Pokok:\n`;
  item.materi.forEach((m, idx) => {
    text += `${idx + 1}. ${m}\n`;
  });

  if (item.bentukInovasi) {
    text += `\nBentuk Inovasi Kegiatan:\n`;
    if (Array.isArray(item.bentukInovasi)) {
      item.bentukInovasi.forEach((b) => {
        text += `• ${b}\n`;
      });
    } else {
      text += `${item.bentukInovasi}\n`;
    }
  }

  if (item.judulKampanye && item.judulKampanye.length > 0) {
    text += `\nJudul Kampanye / Slogan:\n`;
    item.judulKampanye.forEach((k) => {
      text += `• ${k}\n`;
    });
  }

  return text.trim();
}
