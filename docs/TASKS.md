# TASKS.md: Urutan Pekerjaan

Aturan: kerjakan berurutan, satu tugas per sesi, commit tiap tugas selesai.
Estimasi waktu bersifat kasar (jam efektif).

## Fase A: Fondasi (malam 30 Okt)

### T0. Setup repo dan deploy (30 menit)
- Buat repo GitHub (private atau public), file awal: README, PRD.md,
  AGENTS.md, TASKS.md, index.html berisi "Halo".
- Import repo ke Vercel (Framework Preset: Other, tanpa build command).
- Tambahkan vercel.json dengan header:
  Permissions-Policy: camera=(self), X-Content-Type-Options: nosniff.
Penerimaan: URL vercel.app terbuka via HTTPS dan menampilkan halaman awal.
Setiap push ke main otomatis ter-deploy.

## Fase B: Alur inti (31 Okt pagi)

### T1. Kerangka halaman dan layout responsif (45 menit)
- Empat layar dalam satu halaman (Intro, Tema, Kamera, Hasil), hanya satu aktif.
- Header, footer privasi, indikator langkah.
- Landscape: dua kolom (area tampil kiri, panel kontrol kanan). Portrait: satu kolom.
Penerimaan: pindah antar layar lewat tombol sementara; layout benar di
landscape dan portrait (uji dengan DevTools).

### T2. State machine alur + kontrol keyboard (30 menit)
- State: intro, tema, kamera, hitungMundur, siapGenerate, memproses, hasil.
- Spasi dan Esc sesuai PRD. Tombol non-aktif bila belum valid.
Penerimaan: alur lengkap bisa dijalankan dengan mouse maupun keyboard,
tidak ada state "nyangkut".

### T3. Kamera dan pratinjau (45 menit)
- getUserMedia, pratinjau mirror dalam bingkai 4:5 dengan oval panduan.
- Penanganan error lengkap dan pesan jelas.
Penerimaan: kamera menyala di Chrome via HTTPS; saat izin ditolak muncul
pesan yang menjelaskan cara memperbaiki.

### T4. Hitung mundur, capture, dan crop (45 menit)
- Hitung mundur 3-2-1, ambil frame, potong ke 4:5, mirror, simpan sebagai
  canvas "face". Matikan kamera setelahnya.
- Layar konfirmasi: foto tampil + tombol "Generate" dan "Ulangi".
Penerimaan: foto hasil tidak gepeng/terdistorsi; lampu kamera mati setelah capture.

### T5. Pipeline Generate + tema pertama: Imajinasi (1,5 jam)
- utils.js: PRNG ber-seed, helper crop oval, grain.
- Animasi proses 1-2 detik, lalu render ke canvas 1080x1350, tampil di layar Hasil.
- Implementasi Imajinasi sesuai DESIGN.md.
Penerimaan: poster tampil < 3 detik; seed berbeda menghasilkan variasi berbeda.

### T6. Unduh dan Ulangi (30 menit)
- Unduh PNG dengan nama "tiga-dunia-wajahmu-<tema>.png".
- "Ulangi" kembali ke kamera (tema sama), "Ganti Tema" kembali ke pilih tema.
Penerimaan: file terunduh 1080x1350 dan terbuka normal; tidak ada kebocoran
memori terlihat setelah 10 kali ulang.

### T7. Auto-reset dan keamanan memori (30 menit)
- Idle 60 detik -> peringatan 10 detik -> reset total (stop kamera, kosongkan canvas).
Penerimaan: reset berjalan dari semua layar; tidak ada sisa foto setelah reset.

## Fase C: Tema dan polesan (31 Okt siang)

### T8. Tema Realitas (1 jam) — [SELESAI]
Penerimaan: tampil layak untuk berbagai warna kulit dan pencahayaan (teruji dengan kalibrasi kontras adaptif S-curve dan micro-sepia).

### T9. Tema Surealis (1,5 jam) — [SELESAI]
Penerimaan: double exposure pulau melayang kristal, masking oval halus feathered, lolos checklist kurasi ramah pameran.

### T10. Polesan UI dan responsif (1,5 jam) — [SELESAI]
- Terapkan token DESIGN.md, transisi antar layar (crossfade 250ms), kartu tema dengan pratinjau dinamis.
- Integrasi penuh 16 aset pameran (@assets/images) & interaktivitas 5 panduan pose maskot.
- Uji responsif 1366x768 (bebas scroll vertikal), 1920x1080, dan ponsel potret.
- Kursor otomatis tersembunyi saat idle 3 detik untuk mode pameran.
Penerimaan: tampilan konsisten dan rapi di 1366x768, 1920x1080, dan portrait.

## Fase C2: Transformasi Karakter Hibrida (Opsi 3) — Wajah Menjadi Karakter MAX 12

### T10A. Segmentasi Wajah & Isolasi Subjek (Hapus Latar Kamar) — [SELESAI]
- Memisahkan wajah, rambut, dan siluet kepala pengunjung secara bersih dari latar belakang ruangan (kasur/dinding/bantal).
- Pipeline segmentasi lokal berbasis browser (MediaPipe Selfie Segmentation lokal via WebAssembly dengan alpha feathering 2px).
- Fallback adaptif: radial-adaptive soft feathering jika wasm tidak didukung.
Penerimaan: latar belakang kamar terhapus bersih dan terisolasi dengan transparansi penuh (<400ms di browser).

### T10B. Stylization Wajah Artistik (Filter Cel-Shading & Ilustrasi Karakter) — [SELESAI]
- Mengubah foto kamera mentah menjadi bertekstur seni ilustrasi/kartun 3D:
  * Surface bilateral filter (radius 3, threshold 32) menghaluskan pori-pori dan noise sensor webcam secara merata.
  * Cel-shading / tone quantization (5 tingkat pencahayaan harmonis) dengan perpaduan 50% quant + 50% smooth.
  * Line art & contour inking berbasis Sobel filter (mata, kacamata, hidung, senyum, dan siluet kepala).
  * Saturation boost (+12%) dan rona pipi hangat (mascot cheek blush) dengan soft-light blending.
  * Pemeliharaan siluet alami kepala dan rambut pengunjung tanpa terpotong oval kaku saat tersegmentasi.
Penerimaan: wajah pengunjung terbukti bertransformasi menjadi ilustrasi karakter 3D yang ramah, artistik, dan bebas noise (<180ms di browser).

### T10C. Compositing Tubuh & Mahkota Karakter Maskot MAX 12
- Menggabungkan wajah pengunjung yang telah ter-stylize ke tubuh/figur karakter maskot MAX 12 (Pose 1 s/d Pose 5 di assets/images).
- Melingkari kepala dengan mahkota kelopak bunga matahari khas maskot dan kerah jas putih elegan.
- Menyesuaikan pose tubuh sesuai pose yang dipilih pengunjung di bar inspirasi Layar Kamera (Tenang, Kagum, Merenung, Ceria, Bebas).
Penerimaan: figur karakter tampak utuh, proporsional, dan hidup sebagai maskot MAX 12.

### T10D. Adaptasi 3 Dunia Karakter Tematik (Imajinasi, Realitas, Surealis)
- **Tema 1: Imajinasi**: Karakter peri kaca bercahaya kosmik, mahkota kelopak kaca kristal (`37.webp`), sayap gelembung air (`12.webp`), dan partikel nebula emas.
- **Tema 2: Realitas**: Karakter kurator galeri seni berwibawa, balutan monokrom gelatin silver terkalibrasi, aksen ruby dot, dan bunga teratai alami (`35.webp`).
- **Tema 3: Surealis**: Karakter penjelajah pulau melayang, berdiri anggun di atas pulau Laputa kristal (`36.webp`), refleksi etereal dua alam, dan tetesan air kristal.
Penerimaan: setiap tema menghasilkan poster karakter yang kaya cerita, tidak monoton, dan memukau pada resolusi 1080x1350.

### T11. Cadangan unggah foto (30 menit)
- Bila kamera gagal, tampilkan opsi pilih foto dari perangkat; lewat jalur crop dan segmentasi yang sama.
Penerimaan: seluruh alur bisa diselesaikan tanpa kamera.

## Fase D: Rilis (31 Okt sore)

### T12. Pengujian lapangan (1 jam)
- Jalankan CHECKLIST.md: Chrome laptop acara, Edge, HP, tanpa internet
  setelah halaman termuat, 10 kali alur penuh berturut-turut.
Penerimaan: semua butir checklist hijau, bug kritis nol.

### T13. Subdomain (30 menit, mulai lebih awal bila bisa)
- Tambahkan max12.skolify.my.id di Vercel, atur DNS sesuai instruksi.
Penerimaan: subdomain terbuka via HTTPS. Bila DNS belum siap sampai 18:00,
lanjut tanpa menunggu dan cantumkan link vercel.app saja.

### T14. Paket pengumpulan (45 menit)
- Folder Google Drive publik: dokumen deskripsi karya, kedua link, 3-4
  screenshot per tema, video demo 15-30 detik (opsional).
- Buka folder dalam jendela incognito untuk memastikan benar-benar publik.
Penerimaan: folder terbuka tanpa login; semua link berfungsi. Kirim maksimal 20:00.