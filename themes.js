/**
 * Tiga Dunia Wajahmu - MAX 12
 * themes.js - Implementasi Rendering Tema Kanvas 1080x1350
 * Menyatukan Karakter Maskot MAX 12 (T10C) & Koleksi 45 Aset Visual 3D (T10D)
 */

import {
  mulberry32,
  randomRange,
  createFeatheredFace,
  drawSparkle,
  applyGrain,
  clearCanvas
} from './utils.js?v=2';
import { createMascotCharacter, loadImage } from './mascot.js?v=3';

// Token Warna Resmi (DESIGN.md Bab 3)
const COLORS = {
  ultramarineDeep: '#0A1F6B',
  ultramarine:     '#1536A8',
  azure:           '#2F63D6',
  sky:             '#8DB8F2',
  cloud:           '#E6F0FF',
  pearl:           '#F7FAFF',
  gold:            '#FFD86B',
  goldGlow:        '#FFEFA8',
  rose:            '#F2A7B8',
  ruby:            '#D4234F',
  ink:             '#07124A'
};

/**
 * Merender Tema 1: Imajinasi ("Taman kaca yang bercahaya")
 * Ukuran kanvas: 1080 x 1350 px
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLCanvasElement} faceCanvas
 * @param {Object} [options]
 * @param {number} [options.seed]
 * @param {number} [options.poseId]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderImajinasi(canvas, faceCanvas, options = {}) {
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const seed = options.seed !== undefined ? options.seed : Date.now();
  const rng = mulberry32(seed);
  const poseId = options.poseId || 1;

  if (document.fonts) {
    await document.fonts.ready;
  }

  // 1. Latar Belakang Kosmik Biru Dalam
  const bgGrad = ctx.createRadialGradient(540, 520, 80, 540, 675, 750);
  bgGrad.addColorStop(0, '#1E4DB8');
  bgGrad.addColorStop(0.45, '#122670');
  bgGrad.addColorStop(0.8, '#0A1542');
  bgGrad.addColorStop(1, '#050A20');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Debu Bintang / Partikel Kosmik Emas
  ctx.save();
  for (let i = 0; i < 45; i++) {
    const sx = randomRange(rng, 40, width - 40);
    const sy = randomRange(rng, 60, height - 120);
    const sr = randomRange(rng, 1.2, 3.2);
    const sa = randomRange(rng, 0.25, 0.85);
    ctx.fillStyle = `rgba(255, 239, 168, ${sa})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
    if (rng() > 0.65) {
      drawSparkle(ctx, sx, sy, sr * 4, `rgba(255, 239, 168, ${sa})`);
    }
  }
  ctx.restore();

  // 2. Aset Latar Belakang Imajinasi: Sulur Gelembung (12) & Percikan Air Kristal (13)
  try {
    const a12 = await loadImage('assets/images/optimized/12.webp');
    ctx.drawImage(a12, 10, 80, 480, 450);

    const a13 = await loadImage('assets/images/optimized/13.webp');
    ctx.drawImage(a13, 550, 70, 500, 400);

    // Bunga Gelembung Melayang (23 & 10)
    const a23 = await loadImage('assets/images/optimized/23.webp');
    ctx.drawImage(a23, 40, 520, 210, 210);

    const a10 = await loadImage('assets/images/optimized/10.webp');
    ctx.drawImage(a10, 820, 440, 220, 220);

    // Tetesan Air Kristal Berkilau (25)
    const a25 = await loadImage('assets/images/optimized/25.webp');
    ctx.drawImage(a25, 750, 310, 200, 200);

    // Bunga Kristal Kecil di Kiri Bawah (2)
    const a2 = await loadImage('assets/images/optimized/2.webp');
    ctx.drawImage(a2, 140, 760, 140, 140);
  } catch (err) {
    console.warn('Gagal memuat beberapa aset latar belakang Imajinasi:', err);
  }

  // 3. Karakter Maskot MAX 12 (T10C)
  // Tubuh, mahkota kelopak bunga matahari, jas, dan wajah pengunjung yang ter-stylize
  const mascotW = 620;
  const mascotH = Math.round(mascotW * (1200 / 848)); // ~877px
  const mascotX = Math.round(540 - mascotW / 2);
  const mascotY = 270;

  try {
    const mascotCanvas = await createMascotCharacter(faceCanvas, poseId, 'imajinasi');
    ctx.drawImage(mascotCanvas, mascotX, mascotY, mascotW, mascotH);
  } catch (mErr) {
    console.warn('Compositing maskot gagal, fallback ke wajah langsung:', mErr);
    const featheredFace = createFeatheredFace(faceCanvas, 640, 800, 300, 390, 40);
    ctx.drawImage(featheredFace, 220, 200);
  }

  // 4. Aset Dasar Foreground: Hamparan Kristal Padang Lumut (Asset 1)
  // Tempat karakter berdiri di atas aliran sungai kristal dan miniatur planet
  try {
    const a1 = await loadImage('assets/images/optimized/1.webp');
    // Rentangkan di bagian bawah kanvas
    ctx.drawImage(a1, 0, height - 580, width, 580);

    // Gelembung Kaca Kristal (Asset 43)
    const a43 = await loadImage('assets/images/optimized/43.webp');
    ctx.drawImage(a43, 810, 670, 170, 170);
  } catch (err) {
    console.warn('Gagal memuat aset dasar Imajinasi:', err);
  }

  // 5. Cincin Halo Emas & 12 Manik Melingkar di Sekitar Mahkota Karakter
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.gold;
  ctx.shadowColor = COLORS.goldGlow;
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.ellipse(540, 560, 330, 420, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = COLORS.gold;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const bx = 540 + Math.cos(angle) * 330;
    const by = 560 + Math.sin(angle) * 420;
    ctx.beginPath();
    ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 6. Tipografi Kurasi Imajinasi
  ctx.save();
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = COLORS.cloud;
  ctx.textAlign = 'left';
  ctx.fillText('MAX 12', 80, 110);

  ctx.textAlign = 'right';
  ctx.fillText('31 OKT 2026', 1000, 110);

  // Judul "Imajinasi"
  ctx.font = 'italic 700 52px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.gold;
  ctx.shadowColor = 'rgba(255, 216, 107, 0.45)';
  ctx.shadowBlur = 16;
  ctx.fillText('Imajinasi', 540, 1240);

  // Subtitle
  ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = COLORS.cloud;
  ctx.shadowBlur = 0;
  ctx.letterSpacing = '4px';
  ctx.fillText('FLUID STATE OF MIND', 540, 1275);
  ctx.restore();

  // 7. Micro-grain untuk sentuhan cetakan seni pameran
  applyGrain(ctx, width, height, 0.025);

  return canvas;
}

/**
 * Merender Tema 2: Realitas ("Potret apa adanya di galeri seni")
 * Ukuran kanvas: 1080 x 1350 px
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLCanvasElement} faceCanvas
 * @param {Object} [options]
 * @param {number} [options.seed]
 * @param {number} [options.poseId]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderRealitas(canvas, faceCanvas, options = {}) {
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const seed = options.seed !== undefined ? options.seed : Date.now();
  const rng = mulberry32(seed);
  const poseId = options.poseId || 1;

  if (document.fonts) {
    await document.fonts.ready;
  }

  // 1. Latar Belakang Galeri Seni (Warm Museum Cream)
  ctx.fillStyle = '#F6F4EE';
  ctx.fillRect(0, 0, width, height);

  // 2. Garis Batas Arsitektural & Tanda Registrasi Presisi
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(7, 18, 74, 0.22)';
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Sudut-sudut Ticks (+)
  const bx = 60, by = 60, br = width - 60, bb = height - 60, tick = 14;
  ctx.beginPath();
  // Kiri atas
  ctx.moveTo(bx - tick, by); ctx.lineTo(bx + tick, by);
  ctx.moveTo(bx, by - tick); ctx.lineTo(bx, by + tick);
  // Kanan atas
  ctx.moveTo(br - tick, by); ctx.lineTo(br + tick, by);
  ctx.moveTo(br, by - tick); ctx.lineTo(br, by + tick);
  // Kiri bawah
  ctx.moveTo(bx - tick, bb); ctx.lineTo(bx + tick, bb);
  ctx.moveTo(bx, bb - tick); ctx.lineTo(bx, bb + tick);
  // Kanan bawah
  ctx.moveTo(br - tick, bb); ctx.lineTo(br + tick, bb);
  ctx.moveTo(br, bb - tick); ctx.lineTo(br, bb + tick);
  ctx.stroke();
  ctx.restore();

  // 3. Karakter Maskot MAX 12 sebagai Kurator Seni Berwibawa (T10C)
  // Digambar sebelum instalasi foreground agar layering presisi
  const mascotW = 580;
  const mascotH = Math.round(mascotW * (1200 / 848)); // ~820px
  const mascotX = Math.round(540 - mascotW / 2);
  const mascotY = 230;

  try {
    const mascotCanvas = await createMascotCharacter(faceCanvas, poseId, 'realitas');
    ctx.drawImage(mascotCanvas, mascotX, mascotY, mascotW, mascotH);
  } catch (mErr) {
    console.warn('Compositing maskot gagal, fallback ke wajah langsung:', mErr);
    const feathered = createFeatheredFace(faceCanvas, 600, 750, 280, 360, 30);
    ctx.drawImage(feathered, 240, 205);
  }

  // 4. Aset Instalasi Seni Galeri Kontemporer:
  // - Asset 41: Komputer Vintage Macintosh "Fluid State of Mind" di kanan bawah
  // - Asset 42: Modern Pop-Art Traffic Cone di samping Macintosh
  // - Asset 26: Bunga Kristal Berlian dengan Permata Rubi di kiri bawah
  // - Asset 35: Bunga Teratai Pink Alami (Galeri Flora) di samping kiri
  // - Asset 16: Garis Pembatas Botani Halus simetris di atas teks kuratorial
  try {
    const a41 = await loadImage('assets/images/optimized/41.webp');
    ctx.drawImage(a41, 710, 840, 250, 250);

    const a42 = await loadImage('assets/images/optimized/42.webp');
    ctx.drawImage(a42, 645, 935, 125, 125);

    const a26 = await loadImage('assets/images/optimized/26.webp');
    ctx.drawImage(a26, 90, 830, 250, 270);

    const a35 = await loadImage('assets/images/optimized/35.webp');
    ctx.drawImage(a35, 250, 935, 160, 190);

    const a16 = await loadImage('assets/images/optimized/16.webp');
    ctx.drawImage(a16, 540 - 220, 1055, 440, 45);
  } catch (err) {
    console.warn('Gagal memuat beberapa aset instalasi Realitas:', err);
  }

  // 5. Titik Aksen Rubi Tunggal di Atas (540, 175)
  ctx.save();
  ctx.fillStyle = COLORS.ruby;
  ctx.beginPath();
  ctx.arc(540, 175, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Tipografi Kuratorial
  ctx.save();
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = 'left';
  ctx.fillText('MAX 12', 80, 110);

  ctx.font = '500 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(21, 54, 168, 0.7)';
  ctx.textAlign = 'right';
  ctx.fillText('CATALOGUE NO. 02', 1000, 110);

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(21, 54, 168, 0.2)';
  ctx.beginPath();
  ctx.moveTo(80, 130);
  ctx.lineTo(1000, 130);
  ctx.stroke();

  // Judul "Realitas" di (540, 1145)
  ctx.font = 'italic 600 50px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.ink;
  ctx.fillText('Realitas', 540, 1145);

  // Teks kuratorial pendek di (540, 1190)
  ctx.font = 'italic 400 15px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(7, 18, 74, 0.75)';
  ctx.fillText('Apa adanya. Dalam setiap garis dan diam.', 540, 1190);

  // Garis aksen merah muda pendek
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.rose;
  ctx.beginPath();
  ctx.moveTo(500, 1215);
  ctx.lineTo(580, 1215);
  ctx.stroke();

  // Tanggal & metadata galeri di (540, 1250)
  ctx.font = '600 12px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(7, 18, 74, 0.6)';
  ctx.fillText('31.10.2026 — RUANG LIMINAL', 540, 1250);
  ctx.restore();

  // 7. Micro-grain
  applyGrain(ctx, width, height, 0.02);

  return canvas;
}

/**
 * Merender Tema 3: Surealis ("Ruang di antara keduanya")
 * Ukuran kanvas: 1080 x 1350 px
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLCanvasElement} faceCanvas
 * @param {Object} [options]
 * @param {number} [options.seed]
 * @param {number} [options.poseId]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderSurealis(canvas, faceCanvas, options = {}) {
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const seed = options.seed !== undefined ? options.seed : Date.now();
  const rng = mulberry32(seed);
  const poseId = options.poseId || 1;

  if (document.fonts) {
    await document.fonts.ready;
  }

  // 1. Latar Belakang: Langit Biru Magritte Penuh (Gradien dasar + Awan Asset 19)
  const horizonY = 940;

  // Gambar gradasi langit penuh terlebih dahulu untuk mencegah garis kosong di tepian
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, '#1C54BA');
  skyGrad.addColorStop(0.35, '#4585E2');
  skyGrad.addColorStop(0.7, '#8EBAF7');
  skyGrad.addColorStop(1, '#D8EAFF');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, horizonY + 20);

  try {
    const a19 = await loadImage('assets/images/optimized/19.webp');
    // Rentangkan tekstur awan tanpa batas hitam tepi (crop area non-transparan 78..881)
    ctx.drawImage(a19, 78, 0, 803, 1200, 0, 0, width, horizonY + 20);
  } catch (err) {
    console.warn('Gagal memuat tekstur awan Surealis:', err);
  }

  // 2. Danau Air Dua Alam di Bagian Bawah (y >= horizonY)
  const waterGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  waterGrad.addColorStop(0, '#2654B8');
  waterGrad.addColorStop(0.25, '#183B92');
  waterGrad.addColorStop(0.7, '#102766');
  waterGrad.addColorStop(1, '#09163F');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, horizonY, width, height - horizonY);

  // Garis cakrawala bercahaya lembut
  ctx.save();
  const horizGlow = ctx.createLinearGradient(0, horizonY - 4, 0, horizonY + 8);
  horizGlow.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  horizGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = horizGlow;
  ctx.fillRect(0, horizonY - 4, width, 12);
  ctx.restore();

  // 3. Laputa - Pulau Melayang Kristal (Asset 36)
  const islandW = 600;
  const islandH = 600;
  const islandX = Math.round(540 - islandW / 2);
  const islandY = 530;

  try {
    const a36 = await loadImage('assets/images/optimized/36.webp');

    // Refleksi Pulau di Air Danau (terbalik dan beriak lembut)
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.translate(540, horizonY * 2);
    ctx.scale(1, -0.60);
    ctx.drawImage(a36, islandX - 540, -islandY, islandW, islandH);
    ctx.restore();

    // Gambar Pulau Laputa Asli
    ctx.drawImage(a36, islandX, islandY, islandW, islandH);
  } catch (err) {
    console.warn('Gagal memuat pulau Laputa Surealis:', err);
  }

  // 4. Karakter Maskot MAX 12 di Atas Pulau Laputa (T10C)
  const mascotW = 490;
  const mascotH = Math.round(mascotW * (1200 / 848)); // ~693px
  const mascotX = Math.round(540 - mascotW / 2);
  // Penyesuaian ketinggian: Pose 3 duduk bersila sedikit lebih rendah agar pas di rumput Laputa
  const mascotY = (poseId === 3) ? 290 : 225;

  try {
    const mascotCanvas = await createMascotCharacter(faceCanvas, poseId, 'surealis');

    // Refleksi lembut karakter di air
    ctx.save();
    ctx.globalAlpha = 0.20;
    ctx.translate(540, horizonY * 2);
    ctx.scale(1, -0.50);
    ctx.drawImage(mascotCanvas, mascotX - 540, -mascotY, mascotW, mascotH);
    ctx.restore();

    // Gambar Karakter Maskot Asli di Atas Pulau
    ctx.drawImage(mascotCanvas, mascotX, mascotY, mascotW, mascotH);
  } catch (mErr) {
    console.warn('Compositing maskot gagal, fallback ke wajah langsung:', mErr);
  }

  // 5. Elemen Surealisme Magis Puitis (Kurasi Ketat & Harmonis):
  // - Asset 31: Ikan Mas Bersayap Kupu-Kupu Ungu (Berenang Anggun di Awan Langit Kanan)
  // - Asset 25: Tetesan Air Kristal Berkilau (Menetes dari Dasar Pulau Menuju Danau)
  try {
    const a31 = await loadImage('assets/images/optimized/31.webp');
    ctx.drawImage(a31, 650, 160, 350, 350);

    // Tetesan air kristal (Asset 25) jatuh ke danau dari dasar pulau
    const a25 = await loadImage('assets/images/optimized/25.webp');
    ctx.drawImage(a25, 380, horizonY - 10, 320, 210);
  } catch (err) {
    console.warn('Gagal memuat beberapa elemen surealis:', err);
  }

  // 6. Riak Air Konsentris (Water Ripples) di Danau Bawah
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(165, 205, 255, 0.45)';
  const rippleY = horizonY + 90;
  for (let r = 40; r <= 220; r += 35) {
    ctx.beginPath();
    ctx.ellipse(540, rippleY, r, r * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 7. Tipografi Kurasi Surealis
  ctx.save();
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.fillText('MAX 12', 80, 110);

  ctx.textAlign = 'right';
  ctx.fillText('CATALOGUE NO. 03', 1000, 110);

  // Judul "Surealis" di Danau (540, 1190)
  ctx.font = 'italic 700 52px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(141, 184, 242, 0.6)';
  ctx.shadowBlur = 18;
  ctx.fillText('Surealis', 540, 1200);

  // Subtitle
  ctx.font = 'italic 400 15px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(230, 240, 255, 0.9)';
  ctx.shadowBlur = 0;
  ctx.fillText('Ruang di antara keduanya.', 540, 1240);

  // Metadata bawah
  ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(230, 240, 255, 0.7)';
  ctx.fillText('Tiga Dunia Wajahmu • MAX 12', 540, 1280);
  ctx.restore();

  // 8. Micro-grain
  applyGrain(ctx, width, height, 0.022);

  return canvas;
}
