# PRD: Tiga Dunia Wajahmu (MAX 12, Karya Bebas)

## 1. Ringkasan
Website interaktif tempat pengunjung memotret wajah lewat kamera, memilih satu
dari tiga tema MAX (Imajinasi, Realitas, Surealis), lalu menekan "Generate"
untuk mendapat poster kreatif yang bisa diunduh. Seluruh proses berjalan di
browser, tanpa server, tanpa AI generatif.

## 2. Tujuan
- Menjadi karya multimedia yang layak kurasi dan menarik dipajang di instalasi.
- Bisa dipakai pengunjung awam tanpa instruksi, selesai dalam < 30 detik.
- Stabil di laptop acara, termasuk bila internet lemah.

## 3. Pengguna dan konteks
Pengunjung acara MAX 12 memakai laptop yang tersedia. Layar utama landscape,
tapi harus nyaman di portrait. Penggunaan bergantian, jadi tiap sesi harus
bersih dari data sesi sebelumnya.

## 4. Alur pengguna
Intro -> Pilih Tema -> Kamera (hitung mundur 3-2-1) -> Generate -> Hasil
Hasil menyediakan: Unduh, Ulangi (tema sama), Ganti Tema.

## 5. Kebutuhan fungsional
Wajib:
- F1. Akses kamera depan via getUserMedia, pratinjau mirror, bingkai oval panduan.
- F2. Tiga tema; hasil mengikuti tema terpilih.
- F3. Tombol "Generate" eksplisit setelah foto, dengan animasi proses 1-2 detik.
- F4. Output poster 4:5 (1080x1350), unduh sebagai PNG.
- F5. Auto-reset setelah 60 detik tanpa aktivitas; foto dan canvas dihapus dari memori.
- F6. Kontrol keyboard: Spasi = lanjut/ambil foto, Esc = reset.
- F7. Layout: dua kolom di landscape, satu kolom di portrait.
- F8. Setiap hasil sedikit berbeda (elemen acak dengan seed), tapi tetap aman.
Sebaiknya ada:
- F9. Cadangan bila kamera gagal: pesan jelas + opsi pilih foto dari perangkat.
- F10. Tombol layar penuh dan kursor tersembunyi saat idle.
- F11. Tanda kecil "MAX 12 - Tiga Dunia Wajahmu" di sudut poster.

## 6. Kebutuhan non-fungsional
- Tanpa backend, tanpa upload; tidak ada penyimpanan foto di mana pun.
- Tanpa dependensi eksternal saat berjalan (tanpa CDN, tanpa Google Fonts).
- Total ukuran halaman < 2 MB; generate selesai < 3 detik di laptop biasa.
- Berjalan di Chrome terbaru (utama), Edge dan Safari (usahakan).
- UI Bahasa Indonesia, tombol tinggi minimal 64 px, kontras teks memadai.
- Hormati prefers-reduced-motion.

## 7. Batasan konten (kurasi)
- Tidak ada SARA, kekerasan, pornografi, politik, atau visual seram.
- Tema Surealis: palet cerah, tanpa distorsi wajah ekstrem, tanpa mata/mulut tambahan.
- Aset digambar lewat kode atau berlisensi bebas; tidak meniru karakter/gaya pihak lain.

## 8. Di luar cakupan
Hapus background, deteksi landmark wajah, galeri online, login, penyimpanan di
server, berbagi langsung ke media sosial, dukungan bahasa selain Indonesia.

## 9. Kriteria selesai
- Alur lengkap berjalan 10 kali berturut-turut tanpa error di Chrome laptop.
- Ketiga tema menghasilkan poster yang layak tampil pada 5 wajah/pencahayaan berbeda.
- Berfungsi di portrait dan landscape.
- Live di Vercel (dan subdomain bila DNS siap), kamera berjalan via HTTPS.
- Paket Google Drive publik terisi: dokumen, kedua link, screenshot.

## 10. Risiko dan mitigasi
- Izin kamera ditolak/gagal: pesan jelas + unggah foto (F9); izinkan permanen sebelum acara.
- Internet venue lemah: tanpa dependensi eksternal.
- DNS subdomain lambat: cantumkan link vercel.app sebagai cadangan.
- Waktu mepet: kerjakan urut prioritas "Wajib" dulu, polesan terakhir.