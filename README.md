# Tiga Dunia Wajahmu (MAX 12)

Karya instalasi interaktif berbasis web untuk pameran **MAX 12 (Karya Bebas)** dengan tema *"Fluid State of Mind"*.

Pengunjung memotret wajah lewat kamera, memilih salah satu dari tiga tema dunia (Imajinasi, Realitas, Surealis), menekan tombol "Generate", dan mendapatkan poster resolusi tinggi (4:5, 1080x1350) berformat PNG yang dapat diunduh.

## Prinsip & Arsitektur
- **100% Client-Side**: Berjalan langsung di browser tanpa backend, tanpa penyimpanan foto di mana pun, dan tanpa AI generatif eksternal.
- **Tech Stack**: Vanilla HTML5, Vanilla CSS, dan Vanilla JavaScript (ES Modules). Tanpa framework, bundler, maupun library luar.
- **Privasi**: Tidak ada foto yang dikirim ke server. Auto-reset sesi setelah 60 detik idle dengan pembersihan canvas dan kamera dari memori.
- **Deployment**: Static hosting di Vercel dengan proteksi `Permissions-Policy: camera=(self)`.

## Dokumentasi
- [PRD.md](docs/PRD.md) - Product Requirements Document
- [DESIGN.md](docs/DESIGN.md) - Panduan Desain & Spesifikasi Artistik Kanvas
- [AGENTS.md](docs/AGENTS.md) - Aturan Kerja dan Standar Teknis
- [TASKS.md](docs/TASKS.md) - Daftar dan Urutan Tugas Pengerjaan
