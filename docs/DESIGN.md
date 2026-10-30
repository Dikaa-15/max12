# DESIGN.md: Tiga Dunia Wajahmu

## 1. Konsep
Tema MAX 12: "Fluid State of Mind", menjelajahi ruang liminal di antara
imajinasi dan realitas. Karya ini memberi pengunjung tiga cara melihat wajahnya:
- Imajinasi : dunia kaca bercahaya (kutub imajinasi)
- Realitas  : arsip biru yang jujur (kutub kenyataan)
- Surealis  : ruang di antara keduanya, tempat dua dunia melebur

Satu hal yang harus paling diingat orang: judul dan poster yang BERCAHAYA
(emas di atas biru dalam), dan satu momen animasi, yaitu riak air saat Generate.
Semua elemen lain tenang dan disiplin.

## 2. Orisinalitas
- Terinspirasi dari mood poster MAX 12, bukan menyalin. Jangan memakai gambar,
  logo, atau tangkapan layar poster penyelenggara sebagai aset.
- Semua bentuk (kelopak, mutiara, awan, tetesan) digambar lewat Canvas/CSS.
- Font hanya yang berlisensi bebas (OFL), di-host sendiri; catat di ATTRIBUTION.md.

## 3. Token warna
| Token             | Hex      | Peran                                   |
|-------------------|----------|-----------------------------------------|
| --ultramarine-deep| #0A1F6B  | Latar UI, dasar gradien                 |
| --ultramarine     | #1536A8  | Latar panel, gradien tengah             |
| --azure           | #2F63D6  | Gradien, air                            |
| --sky             | #8DB8F2  | Langit, kelopak kaca                    |
| --cloud           | #E6F0FF  | Awan, highlight lembut                  |
| --pearl           | #F7FAFF  | Teks di latar gelap, mutiara            |
| --gold            | #FFD86B  | Tombol utama, manik, judul              |
| --gold-glow       | #FFEFA8  | Cahaya/glow, kilau                      |
| --rose            | #F2A7B8  | Aksen lembut (kelopak tulip, tangga)    |
| --ruby            | #D4234F  | Permata kecil, satu titik di Realitas   |
| --ink             | #07124A  | Teks di atas emas                       |
Khusus Realitas:
| --cyan-dark #0E2A5C | bayangan foto, teks |
| --paper-cool #F1F4F8 | kertas |
| --cyan-pale #CFE0F7 | tint highlight |
Aturan: tombol utama selalu --gold dengan teks --ink. Teks biasa --pearl di atas
--ultramarine-deep (kontras tinggi). Jangan menambah warna di luar tabel ini.

## 4. Tipografi
- Display (judul, nama tema, judul poster): Cormorant Garamond Italic, bobot 600.
- UI (tombol, label, caption): Plus Jakarta Sans, bobot 600 dan 800.
- Kedua font OFL. Unduh woff2 subset Latin, simpan di assets/fonts/, muat dengan
  @font-face (font-display: swap) dan preload. Total < 150 KB.
- Fallback: Georgia, serif (display) dan system-ui, sans-serif (UI).
- Skala UI: judul layar 56 px, tombol 22 px (bobot 800), isi 18 px, caption min 14 px.
  Kalimat sentence case, tanpa huruf kapital semua, tanpa label kecil dekoratif.
- PENTING untuk canvas: sebelum merender poster, tunggu font siap:
  await document.fonts.load('italic 600 96px "Cormorant Garamond"') dan
  await document.fonts.load('800 28px "Plus Jakarta Sans"').
  Tanpa ini, judul poster bisa tergambar dengan font fallback.

## 5. Desain UI web

### Latar dan suasana
- Latar halaman: gradien --ultramarine-deep ke --ultramarine, ditambah 3 blob
  radial lembut (--azure, --sky alpha 0.25) yang bergerak sangat pelan
  (CSS transform saja, loop 40 detik). Ini satu-satunya animasi latar.
- Dengan prefers-reduced-motion: blob diam, tanpa loop.

### Layout
- Landscape: area tampil 4:5 di kiri (tinggi maks 82vh), panel kontrol di
  kanan lebar 420 px, rata kiri. Portrait: area tampil di atas, panel di bawah.
- Panel: latar rgba(10,31,107,0.55) + backdrop-filter blur(16px); sediakan
  fallback warna solid bila blur tidak didukung.
- Header kecil: "MAX 12" (teks biasa, tanpa logo). Footer: kalimat privasi.
- Indikator langkah: 4 titik, aktif = --gold.

### Komponen
- Tombol utama: pil (radius 999), tinggi 64 px, isi --gold, teks --ink, bobot 800.
- Tombol sekunder: pil, garis 2 px --pearl alpha 0.6, isi transparan.
- Fokus keyboard: cincin 3 px --pearl dengan jarak 3 px. Wajib terlihat.
- Kartu tema: bentuk SENGAJA berbeda agar tiap tema punya karakter, bukan
  tiga kartu seragam:
  - Imajinasi: bentuk lengkung atas (arch), pratinjau gradien biru-emas.
  - Realitas : persegi panjang sudut kecil, pratinjau kertas dan biru cyanotype.
  - Surealis : terbelah dua, atas langit dan bawah air, dengan garis horizon.
  Ketiganya sama ukuran dan sejajar, dengan nama tema bertipe display.
- Bingkai kamera: rasio 4:5, oval panduan garis --gold-glow alpha 0.8,
  area luar oval digelapkan 45%.

### Gerak
- Transisi antar layar: fade 250 ms. Tidak ada animasi masuk lain.
- Hitung mundur: angka besar display, berubah dengan skala kecil 200 ms.
- Generate: riak cincin memancar dari tengah area tampil selama 1,5 detik
  (jawaban atas aksi pengguna), lalu poster muncul dengan fade.
- Hasil: tidak ada animasi berulang agar nyaman difoto pengunjung.

### Teks antarmuka (final)
| Layar | Teks |
|---|---|
| Intro | Judul: Tiga Dunia Wajahmu. Sub: Satu wajah, tiga cara melihat dunia. Tombol: Mulai. Tagline kecil: Fluid State of Mind |
| Pilih tema | Judul: Pilih duniamu. Imajinasi: Taman kaca yang bercahaya. Realitas: Potret apa adanya. Surealis: Ruang di antara keduanya |
| Kamera | Pas-kan wajahmu di dalam oval. Tombol: Ambil Foto |
| Konfirmasi | Sudah pas? Tombol: Generate dan Ulangi |
| Proses | Meracik duniamu |
| Hasil | Ini duniamu. Tombol: Unduh, Ulangi, Ganti Tema |
| Error kamera | Kamera tidak bisa dibuka. Izinkan akses kamera lewat ikon gembok di address bar, lalu coba lagi. Atau pilih foto dari perangkat. Tombol: Coba Lagi dan Pilih Foto |
| Idle | Layar kembali ke awal dalam 10 detik. Sentuh layar untuk lanjut |
| Footer | Fotomu diproses di perangkat ini dan tidak diunggah |

## 6. Spesifikasi poster (1080x1350)
- Margin aman 60 px di semua sisi.
- Wajah: face canvas 4:5 digambar ukuran 640x800 berpusat di (540, 600),
  dipotong elips rx 300, ry 390, tepi dilembutkan (feather) 40 px lewat
  offscreen canvas + gradient mask (destination-in).
- Judul tema: Cormorant Garamond Italic 600, 110 px, rata tengah, baseline y 1190.
- Caption: "Tiga Dunia Wajahmu" dan "MAX 12", Plus Jakarta Sans 800, 26 px,
  y 1262, rata tengah.
- Semua keacakan lewat PRNG ber-seed. Ketiga tema berbagi helper yang sama
  (orb, sparkle, grain) di utils.js.

## 7. Spesifikasi tema (urutan penggambaran di canvas)

### 7.1 Imajinasi: Taman kaca yang bercahaya
1. Latar: gradien vertikal --ultramarine-deep, --azure, --sky.
2. Awan: 5 sampai 7 blob radial --cloud alpha 0.25-0.5, di 45% bagian atas.
3. Mutiara besar di belakang wajah (radial gradient, highlight geser ke kiri atas).
4. Wajah (oval feather), tint --azure overlay 15% agar menyatu dengan latar.
5. Cincin cahaya: stroke elips --gold-glow, shadowBlur 40, alpha 0.6.
6. Kelopak kaca: 8 sampai 12 buah di sekitar tepi oval, lebih rapat di sudut.
   Tiap kelopak = path bezier, radial gradient --pearl alpha 0.85 ke --sky
   alpha 0.25, garis tepi putih alpha 0.7.
7. Manik emas (6-10) dan permata --ruby (3-5), kecil, dengan titik highlight.
8. Kilau bintang 4 sudut (12-20) warna --gold-glow, ukuran bervariasi.
9. Judul "Imajinasi" warna --gold dengan glow --gold-glow.

### 7.2 Realitas: Potret apa adanya (cyanotype)
1. Latar --paper-cool + tekstur noise (tile 256 px, alpha 0.08).
2. Bingkai: garis 2 px --cyan-dark, inset 60 px, plus tanda sudut pendek.
3. Wajah: grayscale + kontras 1.25, lalu blend 'lighten' dengan --cyan-dark
   (bayangan jadi biru tua), lalu 'multiply' dengan --cyan-pale (highlight
   kebiruan). Tepi oval tegas (feather 6 px), bukan lembut.
4. Grain film: noise overlay alpha 0.12.
5. Caption kecil di dalam bingkai: tanggal perangkat (misal "30 Okt 2026"),
   "Arsip no. XXX" (3 digit dari seed), dan "MAX 12". Tanpa lokasi.
6. SATU titik --ruby (diameter 18 px) sebagai satu-satunya warna di poster,
   ditaruh di sudut kanan atas bingkai. Ini tanda tangan visual tema.
7. Judul "Realitas" warna --cyan-dark, tanpa glow.

### 7.3 Surealis: Ruang di antara keduanya
Poster ini memadukan dua tema lain: dunia kaca bertemu tekstur arsip.
1. Latar: langit (gradien --sky ke --cloud) di atas garis horizon y = 1000,
   air (gradien --azure ke --ultramarine-deep) di bawahnya.
2. Bulan mutiara besar (radius 150) di (800, 260) dengan halo lembut.
3. Double exposure: wajah di dalam oval; di dalamnya blend 'screen' gradien
   langit-awan alpha 0.35 sehingga langit tampak "mengisi" kepala. Wajah
   utama TIDAK didistorsi.
4. Tangga melayang: 5 sampai 7 anak tangga rounded-rect, gradien --rose ke
   --gold, menanjak ke arah bulan di sisi kanan.
5. Refleksi di air: salinan terbalik area wajah dan langit di bawah horizon,
   alpha 0.35, digambar per strip 6 px dengan offset sinus 6-10 px (efek riak).
6. Riak: 3 sampai 5 elips konsentris garis --pearl alpha 0.5 di air.
7. Tetesan air melayang naik (8-14), path tetesan dengan gradien mutiara.
8. Kelopak kaca sedikit (3-4) dan grain arsip alpha 0.08 sebagai tanda
   peleburan dua dunia.
9. Judul "Surealis" warna --pearl dengan glow --gold-glow tipis.

## 8. Risiko dan cadangan
| Elemen | Risiko | Cadangan bila waktu mepet |
|---|---|---|
| Kelopak kaca (bezier + gradien) | Sedang | Ganti dengan orb dan kilau saja |
| Refleksi bergelombang (7.3 poin 5) | Sedang | Refleksi flip biasa alpha 0.25, tanpa riak |
| Tint cyanotype via blend mode | Rendah-sedang | Filter CSS grayscale + overlay warna datar |
| Backdrop blur panel | Rendah | Warna solid |
| Tangga melayang | Rendah | Hapus |
Urutan prioritas bila harus memotong: kelopak kaca, tangga, riak, baru
elemen dasar. Latar, wajah, dan judul tidak boleh dipotong.

## 9. Checklist konten aman (wajib lulus untuk tiap tema)
- [ ] Tidak ada elemen seram, gelap pekat, atau menyerupai darah/luka
      (rubi harus kecil dan terlihat sebagai permata).
- [ ] Wajah utama tidak didistorsi, tidak ada mata/mulut tambahan.
- [ ] Tidak ada teks atau simbol terkait SARA, politik, atau kekerasan.
- [ ] Tidak ada karakter, logo, atau gaya pihak lain; tidak ada aset hasil salin.
- [ ] Poster tetap layak dilihat untuk foto dengan pencahayaan gelap dan terang.
- [ ] Hasil terlihat baik pada 5 wajah dan kondisi cahaya berbeda.

## 10. Pengujian visual
Setelah tiap tema selesai, hasilkan 5 poster dengan seed berbeda dan simpan
sebagai screenshot. Bandingkan dengan bagian 7: urutan layer, palet, dan
checklist konten aman. Perbaiki sebelum lanjut ke tema berikutnya.