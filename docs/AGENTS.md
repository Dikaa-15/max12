# AGENTS.md: Aturan Kerja untuk Agen Coding

## Proyek
"Tiga Dunia Wajahmu", website karya untuk MAX 12 (Karya Bebas).
Pengunjung memotret wajah lewat kamera, memilih tema (Imajinasi / Realitas /
Surealis), menekan "Generate", lalu mendapat poster 4:5 yang bisa diunduh.
Baca PRD.md sebelum mengerjakan apa pun. PRD.md adalah sumber kebenaran.

## Stack (tidak boleh diubah)
- HTML, CSS, JavaScript murni (ES modules). TANPA framework, TANPA bundler,
  TANPA npm dependency, TANPA build step.
- Canvas API untuk semua komposisi gambar. getUserMedia untuk kamera.
- Hosting statis di Vercel. Tidak ada backend, tidak ada API call keluar.

## Struktur file
index.html        -> kerangka halaman dan semua "layar"
style.css         -> seluruh styling, memakai CSS variables (token dari DESIGN.md)
app.js            -> state machine alur, kamera, capture, unduh, idle-reset
themes.js         -> tiga fungsi render tema
utils.js          -> PRNG dengan seed, helper canvas (crop, grain, dll.)
assets/           -> hanya aset buatan sendiri atau berlisensi bebas
vercel.json       -> header keamanan dan izin kamera

## Kontrak fungsi tema (jangan diubah tanpa izin)
Setiap tema diekspor dari themes.js dengan bentuk:
  renderImajinasi(ctx, face, seed)
  renderRealitas(ctx, face, seed)
  renderSurealis(ctx, face, seed)
- ctx  : CanvasRenderingContext2D berukuran 1080x1350
- face : canvas 4:5 berisi foto wajah yang sudah dipotong dan dibalik (mirror)
- seed : angka integer; semua keacakan HARUS lewat PRNG ber-seed dari utils.js
         (dilarang memakai Math.random langsung di dalam tema)
Fungsi bersifat murni: tidak mengakses DOM, tidak mengubah state global.

## Aturan teknis
1. Kamera: minta resolusi ideal 1280x960, facingMode "user". Tangani semua
   error (ditolak, tidak ditemukan, sedang dipakai) dengan pesan Bahasa Indonesia
   yang jelas plus jalur cadangan unggah foto dari perangkat.
2. Setelah foto diambil atau saat reset, hentikan semua track kamera dan
   kosongkan canvas (width = 0) agar tidak ada sisa data wajah di memori.
3. Pratinjau kamera di-mirror lewat CSS; foto yang dipakai tema juga di-mirror
   supaya hasil sama dengan yang dilihat pengunjung.
4. Output akhir PNG 1080x1350, diunduh via canvas.toBlob + URL.createObjectURL,
   lalu panggil URL.revokeObjectURL setelahnya.
5. Generate harus selesai < 3 detik. Tampilkan animasi proses minimal 1 detik
   (agar terasa "memproses"), tetapi jangan memblokir UI thread terlalu lama.
6. Auto-reset setelah 60 detik tanpa interaksi (pointer, keyboard, sentuh).
   Tampilkan hitung mundur peringatan 10 detik terakhir.
7. Keyboard: Spasi = aksi utama layar aktif, Esc = reset ke Intro.
8. Hormati prefers-reduced-motion. Fokus keyboard harus terlihat jelas.
9. Seluruh teks UI Bahasa Indonesia, kalimat sederhana, tombol berupa kata kerja
   ("Mulai", "Ambil Foto", "Generate", "Unduh", "Ulangi", "Ganti Tema").

## Aturan visual dan konten (kurasi)
- DILARANG: SARA, kekerasan, pornografi, politik, visual seram atau gelap.
- Surealis: palet cerah dan lembut; tanpa mata/mulut tambahan, tanpa distorsi
  wajah ekstrem, tanpa elemen menyerupai tubuh atau darah.
- Tidak boleh meniru karakter, logo, atau gaya milik pihak lain.
- Semua bentuk digambar lewat kode. Bila memakai aset eksternal, catat sumber
  dan lisensinya di ATTRIBUTION.md. Jika ragu, jangan pakai.
- Tidak boleh ada font, skrip, atau gambar yang dimuat dari CDN/URL eksternal.

## Privasi
- Foto tidak boleh dikirim ke mana pun. Tidak ada fetch/XHR/analytics/tracker.
- Tidak memakai localStorage, IndexedDB, atau cookie untuk foto atau hasil.
- Teks privasi singkat harus selalu terlihat di footer.

## Gaya kode
- JavaScript modern, fungsi kecil dengan satu tugas, nama deskriptif.
- Komentar singkat berbahasa Indonesia hanya untuk logika yang tidak jelas.
- Tanpa library tambahan. Jika merasa butuh, berhenti dan tanyakan dulu.

## Cara bekerja
- Kerjakan SATU tugas dari TASKS.md per sesi. Jangan loncat atau menggabungkan.
- Sebelum mengubah banyak file, jelaskan rencana singkat.
- Setelah selesai: jalankan lokal, uji kriteria penerimaan tugas, lalu commit
  dengan pesan "T<nomor>: <ringkasan>".
- Jangan menambah fitur di luar PRD. Jika ada ide bagus, catat di BACKLOG.md,
  jangan langsung dikerjakan.
- Jangan refactor besar menjelang akhir. Setelah T11 selesai, hanya perbaikan bug
  dan polesan kecil.

## Definisi selesai (per tugas)
Berjalan tanpa error di console, kriteria penerimaan terpenuhi, tidak ada
dependensi eksternal baru, sudah di-commit, dan sudah ter-deploy di Vercel.