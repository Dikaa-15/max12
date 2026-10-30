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

### T8. Tema Realitas (1 jam)
Penerimaan: tampil layak untuk berbagai warna kulit dan pencahayaan (uji minimal 5 foto).

### T9. Tema Surealis (1,5 jam)
Penerimaan: sama dengan T8, ditambah lolos checklist konten aman
(tidak seram, tidak ada distorsi wajah, palet cerah).

### T10. Polesan UI dan responsif (1,5 jam)
- Terapkan token DESIGN.md, transisi antar layar, kartu tema dengan pratinjau.
- Uji portrait, layar penuh, kursor tersembunyi saat idle.
Penerimaan: tampilan konsisten dan rapi di 1366x768, 1920x1080, dan portrait.

### T11. Cadangan unggah foto (30 menit)
- Bila kamera gagal, tampilkan opsi pilih foto dari perangkat; lewat jalur
  crop yang sama.
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