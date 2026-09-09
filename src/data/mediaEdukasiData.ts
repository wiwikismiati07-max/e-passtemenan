import { MediaEdukasiDatabase } from '../types';

export const INITIAL_MEDIA_EDUKASI: MediaEdukasiDatabase = {
  materi: [
    {
      id: 'mat-1',
      judul: 'Panduan Pencegahan & Penanganan Kekerasan di Satuan Pendidikan (Permendikbudristek No. 46 Tahun 2023)',
      kategori: 'Regulasi & Hukum',
      ringkasan: 'Pedoman resmi pembentukan Tim Pencegahan dan Penanganan Kekerasan (TPPK) di sekolah, definisi perundungan, dan standar operasional prosedur penanganan korban.',
      kontenLengkap: `Permendikbudristek Nomor 46 Tahun 2023 mengatur tentang Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan (PPKSP). 

Poin-poin Kunci untuk Warga SMPN 7 Pasuruan:
1. Definisi Kekerasan: Setiap perbuatan fisik, verbal, nonverbal, atau melalui media teknologi informasi yang mengakibatkan luka fisik, penderitaan psikis, atau kerugian materi.
2. Lingkup Perundungan: Kekerasan fisik, psikis, perundungan (bullying), kekerasan seksual, diskriminasi dan intoleransi, serta kebijakan yang mengandung kekerasan.
3. Hak Korban: Mendapatkan perlindungan keamanan, kerahasiaan identitas, pendampingan konseling psikologis (BK), dan jaminan kelangsungan pendidikan tanpa diskriminasi.
4. Peran Guru dan Tendik: Wajib merespon segera setiap laporan dan tidak melakukan pembiaran (bystander effect).`,
      penulis: 'Tim Satgas PPKSP & Tim BK UPT SMPN 7 Pasuruan',
      tanggal: '2026-08-01',
      linkDokumen: 'https://merdekabelajar.kemdikbud.go.id/pages/ppksp/',
      fileFormat: 'PDF',
      bacaanMenit: 7,
      tags: ['Permendikbudristek', 'Hukum', 'TPPK', 'SOP Sekolah'],
      unduhanCount: 142,
    },
    {
      id: 'mat-2',
      judul: 'Mengenal 4 Jenis Perundungan: Fisik, Verbal, Relasional, dan Cyberbullying',
      kategori: 'Modul Pencegahan',
      ringkasan: 'Klasifikasi mendalam mengenai 4 bentuk perundungan di kalangan remaja SMP, ciri-ciri perilaku, dan cara mengenali tanda-tanda pada korban.',
      kontenLengkap: `Perundungan (Bullying) adalah perilaku agresif yang dilakukan berulang-ulang oleh seseorang atau kelompok yang memiliki kekuatan lebih besar kepada korban yang merasa tak berdaya.

4 Jenis Perundungan yang Harus Dihindari:
1. Perundungan Verbal (Paling Sering Terjadi):
   - Memberi julukan yang merendahkan (nama orang tua, fisik, status ekonomi).
   - Menghina, mencemooh, memfitnah, atau menyebarkan gosip jahat.
2. Perundungan Fisik:
   - Memukul, menendang, mendorong, menjegal, memalak uang saku.
   - Merusak atau menyembunyikan barang milik teman sekelas.
3. Perundungan Relasional / Sosial:
   - Mengucilkan teman dari pergaulan atau kelompok belajar secara sengaja.
   - Menghasut teman-teman sekelas untuk menjauhi seseorang.
4. Cyberbullying (Perundungan di Dunia Maya):
   - Meneror di grup WhatsApp kelas, komentar jahat di media sosial (Instagram/TikTok).
   - Menyebarkan foto atau video aib teman tanpa izin.`,
      penulis: 'Wiwik Ismiati, S.Pd (Guru BK SPANJU)',
      tanggal: '2026-08-10',
      linkDokumen: 'https://sahabatkeluarga.kemdikbud.go.id',
      fileFormat: 'PDF',
      bacaanMenit: 5,
      tags: ['Psikologi', 'Identifikasi Bullying', 'BK', 'Siswa'],
      unduhanCount: 215,
    },
    {
      id: 'mat-3',
      judul: 'Buku Saku Duta Anti-Bullying SPANJU: Menjadi Upstander, Bukan Bystander',
      kategori: 'Panduan Siswa & Duta',
      ringkasan: 'Panduan taktis bagi pengurus kelas dan Duta Anti-Perundungan untuk berani bersuara, menolong teman, dan melapor dengan bijak tanpa membahayakan diri.',
      kontenLengkap: `Sebagai Duta Anti-Bullying dan Siswa Peduli di SMPN 7 Pasuruan, kamu memiliki kekuatan untuk mengubah suasana sekolah menjadi aman dan hangat!

Perbedaan Bystander vs Upstander:
- Bystander (Penonton Pasif): Melihat penindasan tetapi hanya diam, menonton, tertawa, atau membiarkannya terjadi. Keheningan ini membuat pelaku merasa tindakannya didukung.
- Upstander (Pembela yang Berani): Mengambil langkah bijak untuk menghentikan perundungan atau mendukung korban.

Prinsip 4D untuk Upstander:
1. Direct (Tegur Langsung): Jika aman, katakan dengan tegas: "Hentikan, itu tidak lucu dan menyakiti hatinya!"
2. Distract (Alihkan Perhatian): Alihkan fokus pelaku, misalnya dengan mengajak korban pergi: "Ayo kita dipanggil guru di kantor!"
3. Delegate (Minta Bantuan): Laporkan segera ke Guru Piket, Wali Kelas, atau Tim BK lewat menu E-Lapor SPANJU.
4. Delay (Dampingi Setelahnya): Temui korban setelah kejadian, dengarkan ceritanya, dan tunjukkan bahwa kamu peduli.`,
      penulis: 'Kader Duta Anti-Bullying SPANJU',
      tanggal: '2026-08-15',
      linkDokumen: 'https://smpn7pasuruan.sch.id/duta-anti-bullying',
      fileFormat: 'SLIDES',
      bacaanMenit: 6,
      tags: ['Upstander', 'Duta', 'Karakter', 'Kepemimpinan'],
      unduhanCount: 189,
    },
    {
      id: 'mat-4',
      judul: 'Etika Berselancar di Internet & Pencegahan Cyberbullying di Kalangan Pelajar',
      kategori: 'Literasi Digital',
      ringkasan: 'Pedoman penggunaan media sosial yang sehat, perlindungan data pribadi, jejak digital, serta konsekuensi hukum UU Informasi dan Transaksi Elektronik (ITE).',
      kontenLengkap: `Internet dan media sosial harus menjadi ruang kreatif, bukan arena menyakiti sesama teman.

Aturan Emas Etika Digital (Netiket):
1. Think Before You Post (T.H.I.N.K):
   - T (True): Apakah kabar/unggahan itu benar?
   - H (Helpful): Apakah bermanfaat bagi orang lain?
   - I (Inspiring): Apakah menginspirasi hal baik?
   - N (Necessary): Apakah penting untuk diunggah?
   - K (Kind): Apakah kata-katanya santun dan ramah?
2. Jaga Jejak Digital: Apa yang kamu kirimkan di grup WhatsApp atau kolom komentar bisa diabadikan lewat screenshot dan bertahan selamanya.
3. Stop Berbagi Akun & Sandi: Jangan pernah membagikan password sosial media kepada siapapun.
4. Tindakan Jika Mengalami Cyberbullying: Jangan membalas dengan emosi, simpan bukti screenshot, blokir pelaku, dan laporkan kepada Guru BK atau orang tua.`,
      penulis: 'Tim IT & Kesiswaan SMPN 7 Pasuruan',
      tanggal: '2026-08-20',
      linkDokumen: 'https://literasidigital.id',
      fileFormat: 'ARTIKEL',
      bacaanMenit: 4,
      tags: ['Cyberbullying', 'Medsos', 'Netiket', 'UU ITE'],
      unduhanCount: 178,
    },
    {
      id: 'mat-5',
      judul: 'Pedoman Mediasi Restoratif & Pemulihan Hubungan Pertemanan',
      kategori: 'Bimbingan Konseling',
      ringkasan: 'Alur mediasi tanpa kekerasan, cara membangun kembali kepercayaan antarteman, dan pembinaan empati bagi pelaku perundungan.',
      kontenLengkap: `Pendekatan Restoratif (Restorative Justice) di SMPN 7 Pasuruan bertujuan untuk menyembuhkan luka dan memulihkan hubungan pertemanan, bukan sekadar menjatuhkan hukuman.

Tahapan Konseling Mediasi BK:
1. Wawancara Terpisah: Mendengarkan perspektif korban dan pelaku secara aman tanpa tekanan.
2. Refleksi Empati: Pelaku diajak memahami dampak rasa sakit psikologis yang dialami temannya.
3. Pertemuan Mediasi Bersama: Fasilitasi saling mendengarkan dan penyampaian permintaan maaf yang tulus.
4. Rencana Perbaikan Hubungan (RTL): Komitmen tertulis untuk tidak mengulangi dan melakukan tindakan kebaikan nyata.
5. Pemantauan Berkala: Guru BK dan Wali Kelas memantau interaksi kedua siswa selama 30 hari ke depan.`,
      penulis: 'Eki Febriani, S.Pd (Guru BK SPANJU)',
      tanggal: '2026-08-25',
      linkDokumen: 'https://smpn7pasuruan.sch.id/bk',
      fileFormat: 'DOCX',
      bacaanMenit: 5,
      tags: ['Konseling', 'Mediasi', 'Restoratif', 'Guru BK'],
      unduhanCount: 120,
    },
  ],

  poster: [],


  infografis: [
    {
      id: 'info-alur-penanganan',
      judul: 'Bagan Alur Penanganan Kasus PASS TEMENAN',
      fokus: 'SOP & Alur Penanganan Kasus',
      deskripsi: 'Bagan alur penanganan resmi Satgas PASS TEMENAN: Mulai dari pelaporan kasus, verifikasi investigasi, tindakan intervensi mediasi, hingga pemulihan & monitoring korban.',
      gambarUrl: 'https://i.ibb.co.com/gMZWh2pN/ALUR-PENANGANAN-PASS-TEMENAN.png',
      sumber: 'Satgas Anti-Perundungan & BK UPT SMPN 7 Pasuruan',
      poinPenting: [
        'Tahap 1 - Pelaporan Kasus (E-Lapor, Buku Saku, atau Kotak Curhat Duta Anti-Bullying).',
        'Tahap 2 - Investigasi & Verifikasi Fakta (Kerahasiaan data pelapor & korban terjamin 100%).',
        'Tahap 3 - Intervensi & Mediasi Restoratif (Konseling BK, pendampingan wali kelas & orang tua).',
        'Tahap 4 - Evaluasi, Pemulihan & Monitoring Pasca-Kejadian (Pemantauan rutin dan pemulihan lingkungan belajar).',
      ],
      tanggal: '2026-08-01',
      alurTahapan: [
        { nomor: 1, langkah: 'Penerimaan Laporan', keterangan: 'Laporan dicatat dalam sistem E-PASS TEMENAN' },
        { nomor: 2, langkah: 'Investigasi & Verifikasi', keterangan: 'Pengumpulan bukti dan klarifikasi para pihak secara rahasia' },
        { nomor: 3, langkah: 'Tindakan Intervensi & Mediasi', keterangan: 'Konseling BK, mediasi, dan pendampingan psikososial' },
        { nomor: 4, langkah: 'Tindak Lanjut & Pemulihan', keterangan: 'Evaluasi berkala di formulir Sabtu Beli Teh Ceri' },
      ],
    },
    {
      id: 'info-1',
      judul: 'Alur Penanganan Kasus Perundungan di UPT SMPN 7 Pasuruan',
      fokus: 'SOP & Prosedur Laporan',
      deskripsi: 'Diagram alur 4 tahap resmi Satgas PASS TEMENAN: Mulai dari laporan masuk, investigasi rahasia, mediasi restoratif, hingga pemulihan psikologis korban.',
      gambarUrl: 'https://images.weserv.nl/?url=i.ibb.co/spq7dvH0/Diagram-Alur-Penilaian-Respon-Laporan.png&w=1200&output=jpg&q=85',
      sumber: 'Satgas Anti-Perundungan & BK SMPN 7 Pasuruan',
      poinPenting: [
        'Tahap 1 - Pelaporan Cepat (Lapor langsung ke guru atau lewat aplikasi E-Lapor).',
        'Tahap 2 - Verifikasi Fakta & Kerahasiaan (Identitas pelapor dijamin 100% aman).',
        'Tahap 3 - Penanganan & Mediasi (Pendampingan Guru BK dan pemanggilan orang tua bila diperlukan).',
        'Tahap 4 - Evaluasi & Pemulihan (Monitoring 30 hari untuk memastikan situasi kondusif).',
      ],
      tanggal: '2026-08-02',
      alurTahapan: [
        { nomor: 1, langkah: 'Penerimaan Laporan', keterangan: 'Laporan dicatat dalam sistem E-PASS TEMENAN' },
        { nomor: 2, langkah: 'Investigasi Rahasia', keterangan: 'Pengumpulan bukti dan klarifikasi para pihak' },
        { nomor: 3, langkah: 'Tindakan Intervensi', keterangan: 'Konseling BK, mediasi, dan pendampingan psikososial' },
        { nomor: 4, langkah: 'Tindak Lanjut & Monitoring', keterangan: 'Evaluasi berkala di formulir Sabtu Beli Teh Ceri' },
      ],
    },
    {
      id: 'info-2',
      judul: 'Kenali 4 Pilar Tolak Ukur Program E-PASS TEMENAN',
      fokus: 'Indikator Keberhasilan',
      deskripsi: 'Infografis struktur tolak ukur keberhasilan program perlindungan anak: Penyadaran, Pencegahan, Penanganan Respon, dan Pelaporan Terpadu.',
      gambarUrl: 'https://images.weserv.nl/?url=i.ibb.co/S4FX6Djd/Bagan-Struktur-Tolak-Ukur-E-Pass-Temenan-Spanju.png&w=1200&output=jpg&q=85',
      sumber: 'Bagan Struktur Tolak Ukur PASS TEMENAN SPANJU',
      poinPenting: [
        'Pilar 1: Penyadaran (Sosialisasi berkala, ikrar kelas, dan Duta Anti-Bullying).',
        'Pilar 2: Pencegahan (Piket Harian, Kebun Luas Berseri, dan Senandung Serasi).',
        'Pilar 3: Penanganan Respon Cepat (SOP investigasi objektif dan restorative justice).',
        'Pilar 4: Pelaporan Digital (Integrasi data Cloud Supabase & Rekapitulasi Otomatis).',
      ],
      tanggal: '2026-08-08',
    },
  ],

  video: [
    {
      id: 'vid-1',
      judul: 'Class Meet by Pass Temenan Spanju',
      kategori: 'Kegiatan Siswa',
      deskripsi: 'Dokumentasi kemeriahan Class Meeting bertema Pass Temenan di UPT SMPN 7 Pasuruan: Menumbuhkan sportivitas, persahabatan erat, solidaritas antarkelas, dan kebersamaan ramah anak tanpa kekerasan.',
      videoUrl: 'https://youtu.be/GQbqfdsPO-g?si=5nCoJIMua6aauW0p',
      youtubeId: 'GQbqfdsPO-g',
      durasi: '03:45',
      narasumber: 'Wiwik Ismiati, S.Pd & OSIS SPANJU',
      tanggal: '2026-08-15',
      thumbnailUrl: 'https://i.ytimg.com/vi/GQbqfdsPO-g/hqdefault.jpg',
    },
    {
      id: 'vid-2',
      judul: 'Pass Temenan Road to School SMPN 11 Pasuruan',
      kategori: 'Road to School',
      deskripsi: 'Kunjungan sosialisasi dan berbagi praktik baik inovasi Pass Temenan ke SMPN 11 Pasuruan untuk memperluas jejaring sekolah ramah anak dan budaya sekolah anti-perundungan di Kota Pasuruan.',
      videoUrl: 'https://youtu.be/YXMev1BEzG4?si=roreab0b4Mng5qDt',
      youtubeId: 'YXMev1BEzG4',
      durasi: '05:10',
      narasumber: 'Wiwik Ismiati, S.Pd (Tim Inovasi SPANJU)',
      tanggal: '2026-08-19',
      thumbnailUrl: 'https://i.ytimg.com/vi/YXMev1BEzG4/hqdefault.jpg',
    },
    {
      id: 'vid-3',
      judul: 'Deklarasi Anti Perundungan di Sekolah',
      kategori: 'Deklarasi Bersama',
      deskripsi: 'Pembacaan ikrar dan penandatanganan komitmen bersama seluruh warga sekolah (Kepala Sekolah, Bapak/Ibu Guru, Komite, dan Siswa) untuk mewujudkan lingkungan SPANJU yang aman, nyaman, dan anti-kekerasan.',
      videoUrl: 'https://youtu.be/4bCgOqwrHcM?si=V82wFwWXz5XfwZ55',
      youtubeId: '4bCgOqwrHcM',
      durasi: '04:20',
      narasumber: 'Kepala Sekolah, Guru & Siswa SMPN 7 Pasuruan',
      tanggal: '2026-08-05',
      thumbnailUrl: 'https://i.ytimg.com/vi/4bCgOqwrHcM/hqdefault.jpg',
    },
    {
      id: 'vid-4',
      judul: 'KEGIATAN PENGUATAN PROGRAM PASS TEMENAN SMP NEGERI 7 PASURUAN',
      kategori: 'Penguatan Program',
      deskripsi: 'Sesi penguatan karakter, koordinasi satgas pencegahan, dan pembekalan nilai-nilai empati untuk mendukung efektivitas dan keberlanjutan program inovasi Pass Temenan di SMP Negeri 7 Pasuruan.',
      videoUrl: 'https://youtu.be/v5QUkAZTuLY?si=IS6mlpwWPWyRWyVC',
      youtubeId: 'v5QUkAZTuLY',
      durasi: '06:30',
      narasumber: 'Wiwik Ismiati, S.Pd & Tim Pengembang Sekolah',
      tanggal: '2026-08-25',
      thumbnailUrl: 'https://i.ytimg.com/vi/v5QUkAZTuLY/hqdefault.jpg',
    },
    {
      id: 'vid-5',
      judul: 'KEGIATAN PENGUATAN PROGRAM PASS TEMENAN 2',
      kategori: 'Penguatan Program',
      deskripsi: 'Lanjutan kegiatan penguatan dan evaluasi implementasi program Pass Temenan tahap 2: Refleksi aksi nyata, bimbingan konseling sebaya, dan partisipasi aktif seluruh perwakilan kelas.',
      videoUrl: 'https://youtu.be/Qm1ffqfbV2U?si=AN4FQfnpEjhEz7MM',
      youtubeId: 'Qm1ffqfbV2U',
      durasi: '05:40',
      narasumber: 'Wiwik Ismiati, S.Pd & Duta Anti-Bullying',
      tanggal: '2026-08-28',
      thumbnailUrl: 'https://i.ytimg.com/vi/Qm1ffqfbV2U/hqdefault.jpg',
    },
    {
      id: 'vid-6',
      judul: 'VIDEO SOSIALISASI ANTI KEKERASAN DAN NO BULLYING PASS TEMENAN PADA SAAT MPLS 2025-2026',
      kategori: 'Sosialisasi MPLS',
      deskripsi: 'Materi edukasi dan sosialisasi gerakan anti-kekerasan dan "No Bullying" Pass Temenan yang disampaikan langsung kepada peserta didik baru pada Masa Pengenalan Lingkungan Sekolah (MPLS).',
      videoUrl: 'https://youtu.be/rI_4pWv8JzY?si=CEqBpcF_BtqHx6ai',
      youtubeId: 'rI_4pWv8JzY',
      durasi: '07:15',
      narasumber: 'Wiwik Ismiati, S.Pd (Guru BK SPANJU)',
      tanggal: '2026-07-20',
      thumbnailUrl: 'https://i.ytimg.com/vi/rI_4pWv8JzY/hqdefault.jpg',
    },
    {
      id: 'vid-7',
      judul: 'Pass Temenan Spanju',
      kategori: 'Profil Program',
      deskripsi: 'Video profil komprehensif gerakan Pass Temenan di UPT SMPN 7 Pasuruan: Filosofi kebersamaan, aksi nyata pencegahan perundungan, dan penciptaan budaya sekolah ramah anak yang harmonis.',
      videoUrl: 'https://youtu.be/FpYWSCw5g_0?si=ZkAhEbHqCxy96EUn',
      youtubeId: 'FpYWSCw5g_0',
      durasi: '04:50',
      narasumber: 'Wiwik Ismiati, S.Pd & Komunitas SPANJU',
      tanggal: '2026-08-01',
      thumbnailUrl: 'https://i.ytimg.com/vi/FpYWSCw5g_0/hqdefault.jpg',
    },
  ],

  pesan: [
    {
      id: 'pes-1',
      kutipan: 'Satu kata baik yang kamu ucapkan pagi ini bisa menyelamatkan hati seseorang dari kesedihan yang mendalam. Tebarkan kebaikan tanpa pamrih.',
      penulis: 'Wiwik Ismiati, S.Pd (Guru BK SPANJU)',
      topik: 'Kebaikan Kata',
      kategori: 'Motivasi Harian',
      tanggal: '2026-08-01',
      rekomendasiUntuk: 'Semua Siswa',
      sukaCount: 89,
    },
    {
      id: 'pes-2',
      kutipan: 'Menjatuhkan orang lain tidak akan membuatmu terlihat lebih tinggi. Rangkul temanmu, dukung langkahnya; itulah kehebatan sejati seorang manusia.',
      penulis: 'Nur Fadilah, S.Pd., M.Pd (Kepala SMPN 7 Pasuruan)',
      topik: 'Kepemimpinan & Empati',
      kategori: 'Pesan Kepala Sekolah',
      tanggal: '2026-08-05',
      rekomendasiUntuk: 'Siswa & Pendidik',
      sukaCount: 124,
    },
    {
      id: 'pes-3',
      kutipan: 'Perbedaan wajah, suku, cara bicara, dan latar belakang bukanlah alasan untuk mencemooh, melainkan warna indah yang melengkapi kebersamaan kita di SPANJU.',
      penulis: 'Duta Anti-Bullying SPANJU',
      topik: 'Toleransi & Kebersamaan',
      kategori: 'Ikrar Siswa',
      tanggal: '2026-08-10',
      rekomendasiUntuk: 'Warga Kelas',
      sukaCount: 76,
    },
    {
      id: 'pes-4',
      kutipan: 'Diam saat melihat temanmu ditindas bukanlah sikap netral, melainkan membiarkan luka bertambah. Beranilah bersuara atau laporkan pada guru.',
      penulis: 'Tim Satgas PPKSP',
      topik: 'Keberanian Upstander',
      kategori: 'Aksi Nyata',
      tanggal: '2026-08-15',
      rekomendasiUntuk: 'Semua Siswa',
      sukaCount: 95,
    },
    {
      id: 'pes-5',
      kutipan: 'Sekolah adalah rumah kedua kita. Pastikan setiap orang yang melangkah masuk ke gerbang SMPN 7 Pasuruan merasa aman, dihargai, dan dirindukan.',
      penulis: 'Keluarga Besar SMPN 7 Pasuruan',
      topik: 'Lingkungan Positif',
      kategori: 'Budaya Sekolah',
      tanggal: '2026-08-20',
      rekomendasiUntuk: 'Warga Sekolah',
      sukaCount: 110,
    },
    {
      id: 'pes-6',
      kutipan: 'Sebelum mengetik sesuatu di media sosial atau grup WhatsApp kelas, tanyakan pada dirimu: "Apakah ini akan membuat temanku tersenyum atau terluka?"',
      penulis: 'Tim IT & Literasi Digital SPANJU',
      topik: 'Etika Digital',
      kategori: 'Netiket',
      tanggal: '2026-08-25',
      rekomendasiUntuk: 'Remaja Digital',
      sukaCount: 88,
    },
    {
      id: 'pes-7',
      kutipan: 'Kemenangan sejati bukan saat kamu berhasil mengalahkan temanmu, melainkan saat kamu bisa bangkit bersama dan tidak meninggalkan siapa pun di belakang.',
      penulis: 'Kader Pass Temenan',
      topik: 'Solidaritas Sahabat',
      kategori: 'Persahabatan',
      tanggal: '2026-08-30',
      rekomendasiUntuk: 'Semua Siswa',
      sukaCount: 102,
    },
  ],
};
