/**
 * Tiga Dunia Wajahmu - MAX 12
 * themes.js - Implementasi Rendering Tema Kanvas 1080x1350
 * Berdasarkan spesifikasi DESIGN.md Bab 6 & 7
 */

import {
  mulberry32,
  randomRange,
  createFeatheredFace,
  drawSparkle,
  applyGrain,
  applyCalibratedGrayscale
} from './utils.js?v=2';

// Token Warna (DESIGN.md Bab 3)
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
 * Ukuran kanvas: 1080 x 1350 px (DESIGN.md Bab 7.1)
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLCanvasElement} faceCanvas
 * @param {Object} [options]
 * @param {number} [options.seed]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderImajinasi(canvas, faceCanvas, options = {}) {
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Inisialisasi PRNG ber-seed
  const seed = options.seed !== undefined ? options.seed : Date.now();
  const rng = mulberry32(seed);

  // Tunggu kesiapan font sebelum merender
  if (document.fonts) {
    await document.fonts.ready;
  }

  // --------------------------------------------------------------------------
  // LAPISAN 1: Dasar Gradien Linier
  // (0,0) ultramarine-deep -> (0, 0.45*H) azure -> (0, H) sky
  // --------------------------------------------------------------------------
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, COLORS.ultramarineDeep);
  baseGrad.addColorStop(0.45, COLORS.azure);
  baseGrad.addColorStop(1, COLORS.sky);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // --------------------------------------------------------------------------
  // LAPISAN 2: Awan Lembut (3 blob radial --cloud alpha 0.15)
  // --------------------------------------------------------------------------
  const cloudBlobs = [
    { x: 180,  y: 1180, r: 440 }, // Kiri bawah
    { x: 920,  y: 220,  r: 360 }, // Kanan atas
    { x: 540,  y: 1300, r: 480 }  // Tengah bawah
  ];

  cloudBlobs.forEach(blob => {
    ctx.save();
    const g = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
    g.addColorStop(0, 'rgba(230, 240, 255, 0.18)');
    g.addColorStop(0.6, 'rgba(230, 240, 255, 0.08)');
    g.addColorStop(1, 'rgba(230, 240, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // --------------------------------------------------------------------------
  // LAPISAN 3: Mutiara Besar di (540, 560), radius 340 px
  // Gradien radial dari (500, 520): 0% pearl, 40% sky, 80% azure, 100% ultramarine a:0
  // --------------------------------------------------------------------------
  ctx.save();
  const pearlX = 540;
  const pearlY = 560;
  const pearlRadius = 340;
  const pearlGrad = ctx.createRadialGradient(500, 520, 20, pearlX, pearlY, pearlRadius);
  pearlGrad.addColorStop(0, COLORS.pearl);
  pearlGrad.addColorStop(0.4, COLORS.sky);
  pearlGrad.addColorStop(0.8, COLORS.azure);
  pearlGrad.addColorStop(1, 'rgba(21, 54, 168, 0)');

  ctx.fillStyle = pearlGrad;
  ctx.beginPath();
  ctx.arc(pearlX, pearlY, pearlRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 4: Wajah Pengunjung
  // Face canvas 640x800 di (540, 600), mask elips rx 300, ry 390, feather 40px
  // --------------------------------------------------------------------------
  const faceW = 640;
  const faceH = 800;
  const faceX = 540 - faceW / 2; // 220
  const faceY = 600 - faceH / 2; // 200

  const featheredFace = createFeatheredFace(faceCanvas, faceW, faceH, 300, 390, 40);
  ctx.drawImage(featheredFace, faceX, faceY);

  // Tint gradien overlay pada wajah (gold-glow ke azure)
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const tintGrad = ctx.createRadialGradient(540, 600, 40, 540, 600, 380);
  tintGrad.addColorStop(0, 'rgba(255, 239, 168, 0.22)');
  tintGrad.addColorStop(0.7, 'rgba(47, 99, 214, 0.15)');
  tintGrad.addColorStop(1, 'rgba(47, 99, 214, 0)');
  ctx.fillStyle = tintGrad;
  ctx.beginPath();
  ctx.ellipse(540, 600, 300, 390, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 5: Cincin Cahaya (Halo) & 12 Manik Melingkar
  // Elips rx 320, ry 410, garis 3px gold, shadowBlur 25 gold-glow
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.gold;
  ctx.shadowColor = COLORS.goldGlow;
  ctx.shadowBlur = 25;

  ctx.beginPath();
  ctx.ellipse(540, 600, 320, 410, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 12 titik manik kecil (radius 3.5 px) di keliling elips
  ctx.fillStyle = COLORS.gold;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const bx = 540 + Math.cos(angle) * 320;
    const by = 600 + Math.sin(angle) * 410;
    ctx.beginPath();
    ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 6: Kelopak Kaca (8 - 12 kelopak transparan tumbuh dari tepi)
  // Kurva Bezier ganda, isi gradien sky -> pearl -> transparan, tepi 1.5px pearl
  // --------------------------------------------------------------------------
  const petalCount = Math.round(randomRange(rng, 8, 12));
  const petalAngles = [];
  for (let i = 0; i < petalCount; i++) {
    const baseAngle = (i / petalCount) * Math.PI * 2 + randomRange(rng, -0.15, 0.15);
    petalAngles.push(baseAngle);
  }

  const roseAccentIndexes = [
    Math.floor(randomRange(rng, 0, petalCount / 2)),
    Math.floor(randomRange(rng, petalCount / 2, petalCount))
  ];

  petalAngles.forEach((angle, idx) => {
    ctx.save();
    const baseDist = randomRange(rng, 620, 750);
    const startX = 540 + Math.cos(angle) * baseDist;
    const startY = 600 + Math.sin(angle) * baseDist;

    const tipDist = randomRange(rng, 340, 420);
    const tipAngle = angle + randomRange(rng, -0.3, 0.3);
    const tipX = 540 + Math.cos(tipAngle) * tipDist;
    const tipY = 600 + Math.sin(tipAngle) * tipDist;

    const ctrlDist = (baseDist + tipDist) / 2;
    const curveSpread = randomRange(rng, 40, 80);
    const ctrl1X = 540 + Math.cos(angle + 0.25) * ctrlDist + curveSpread;
    const ctrl1Y = 600 + Math.sin(angle + 0.25) * ctrlDist;
    const ctrl2X = 540 + Math.cos(angle - 0.25) * ctrlDist - curveSpread;
    const ctrl2Y = 600 + Math.sin(angle - 0.25) * ctrlDist;

    const petalGrad = ctx.createLinearGradient(startX, startY, tipX, tipY);
    petalGrad.addColorStop(0, 'rgba(141, 184, 242, 0.35)');
    petalGrad.addColorStop(0.6, 'rgba(247, 250, 255, 0.65)');
    petalGrad.addColorStop(1, 'rgba(247, 250, 255, 0.05)');

    ctx.fillStyle = petalGrad;
    ctx.strokeStyle = 'rgba(247, 250, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(141, 184, 242, 0.4)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(ctrl1X, ctrl1Y, tipX + curveSpread * 0.3, tipY, tipX, tipY);
    ctx.bezierCurveTo(tipX - curveSpread * 0.3, tipY, ctrl2X, ctrl2Y, startX, startY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (roseAccentIndexes.includes(idx)) {
      ctx.fillStyle = COLORS.rose;
      ctx.shadowColor = COLORS.rose;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  // --------------------------------------------------------------------------
  // LAPISAN 7: Kilau & Manik Emas
  // --------------------------------------------------------------------------
  const beadCount = Math.round(randomRange(rng, 22, 30));
  for (let i = 0; i < beadCount; i++) {
    const bAngle = rng() * Math.PI * 2;
    const bDist = randomRange(rng, 240, 520);
    const bx = 540 + Math.cos(bAngle) * bDist;
    const by = 600 + Math.sin(bAngle) * (bDist * 1.15);
    const bRadius = randomRange(rng, 2, 4.5);

    ctx.save();
    ctx.fillStyle = COLORS.gold;
    ctx.shadowColor = COLORS.goldGlow;
    ctx.shadowBlur = bRadius * 3;
    ctx.beginPath();
    ctx.arc(bx, by, bRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const starCount = Math.round(randomRange(rng, 3, 5));
  for (let i = 0; i < starCount; i++) {
    const sx = randomRange(rng, 140, 940);
    const sy = randomRange(rng, 140, 360);
    const sSize = randomRange(rng, 10, 18);
    drawSparkle(ctx, sx, sy, sSize, COLORS.gold, COLORS.goldGlow);
  }

  // --------------------------------------------------------------------------
  // LAPISAN 8: Tipografi
  // --------------------------------------------------------------------------
  ctx.save();

  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(247, 250, 255, 0.75)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('MAX 12', 80, 100);

  ctx.textAlign = 'right';
  ctx.fillText('31 OKT 2026', 1000, 100);

  ctx.font = 'italic 600 56px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.gold;
  ctx.shadowColor = COLORS.goldGlow;
  ctx.shadowBlur = 20;
  ctx.fillText('Imajinasi', 540, 1150);

  ctx.shadowBlur = 0;
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(230, 240, 255, 0.85)';
  ctx.letterSpacing = '3px';
  ctx.fillText('FLUID STATE OF MIND', 540, 1210);

  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 9: Finishing - Monochrome Grain (alpha 0.08)
  // --------------------------------------------------------------------------
  applyGrain(ctx, width, height, 0.08);

  return canvas;
}

/**
 * Merender Tema 2: Realitas ("Potret apa adanya")
 * Ukuran kanvas: 1080 x 1350 px (DESIGN.md Bab 7.2 & TASKS.md T8)
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLCanvasElement} faceCanvas
 * @param {Object} [options]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderRealitas(canvas, faceCanvas, options = {}) {
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  if (document.fonts) {
    await document.fonts.ready;
  }

  // --------------------------------------------------------------------------
  // LAPISAN 1 & 2: Dasar Kertas Hangat Katun & Variasi Pencahayaan Galeri
  // --------------------------------------------------------------------------
  const paperGrad = ctx.createRadialGradient(540, 600, 150, 540, 600, 950);
  paperGrad.addColorStop(0, '#FAF8F3');
  paperGrad.addColorStop(0.7, '#F6F4EE');
  paperGrad.addColorStop(1, '#EDE8DD');
  ctx.fillStyle = paperGrad;
  ctx.fillRect(0, 0, width, height);

  // --------------------------------------------------------------------------
  // LAPISAN 3: Bingkai Garis Tipis & Corner Tick Marks
  // Kotak 940 x 1210 di margin 70 px, garis 1 px ultramarine alpha 0.4
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(21, 54, 168, 0.4)';

  const bx = 70;
  const by = 70;
  const bw = 940;
  const bh = 1210;
  const br = bx + bw; // 1010
  const bb = by + bh; // 1280

  ctx.strokeRect(bx, by, bw, bh);

  // Corner Tick Marks (12 px di 4 sudut)
  const tick = 12;
  ctx.beginPath();
  // Sudut Kiri Atas (70, 70)
  ctx.moveTo(bx - tick, by); ctx.lineTo(bx + tick, by);
  ctx.moveTo(bx, by - tick); ctx.lineTo(bx, by + tick);
  // Sudut Kanan Atas (1010, 70)
  ctx.moveTo(br - tick, by); ctx.lineTo(br + tick, by);
  ctx.moveTo(br, by - tick); ctx.lineTo(br, by + tick);
  // Sudut Kiri Bawah (70, 1280)
  ctx.moveTo(bx - tick, bb); ctx.lineTo(bx + tick, bb);
  ctx.moveTo(bx, bb - tick); ctx.lineTo(bx, bb + tick);
  // Sudut Kanan Bawah (1010, 1280)
  ctx.moveTo(br - tick, bb); ctx.lineTo(br + tick, bb);
  ctx.moveTo(br, bb - tick); ctx.lineTo(br, bb + tick);
  ctx.stroke();
  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 4: Wajah Pengunjung (Grayscale Berkarakter Terkalibrasi)
  // Ukuran 600 x 750 di (540, 580), mask elips rx 280, ry 360, feather 30 px
  // --------------------------------------------------------------------------
  const faceW = 600;
  const faceH = 750;
  const faceX = 540 - faceW / 2; // 240
  const faceY = 580 - faceH / 2; // 205

  const feathered = createFeatheredFace(faceCanvas, faceW, faceH, 280, 360, 30);
  applyCalibratedGrayscale(feathered);
  ctx.drawImage(feathered, faceX, faceY);

  // --------------------------------------------------------------------------
  // LAPISAN 5: Titik Aksen Rubi Tunggal
  // (540, 190), radius 6 px, tanpa glow, tajam dan presisi
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.fillStyle = COLORS.ruby;
  ctx.beginPath();
  ctx.arc(540, 190, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 6: Tipografi Galeri Seni Kontemporer
  // --------------------------------------------------------------------------
  ctx.save();

  // "MAX 12" di kiri atas (80, 110)
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('MAX 12', 80, 110);

  // "CATALOGUE NO. 02" di kanan atas (1000, 110)
  ctx.font = '500 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(21, 54, 168, 0.7)';
  ctx.textAlign = 'right';
  ctx.fillText('CATALOGUE NO. 02', 1000, 110);

  // Garis horizontal tipis 1 px
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(21, 54, 168, 0.2)';
  ctx.beginPath();
  ctx.moveTo(80, 130);
  ctx.lineTo(1000, 130);
  ctx.stroke();

  // Judul: "Realitas" di (540, 1080)
  ctx.font = 'italic 600 48px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.ink;
  ctx.fillText('Realitas', 540, 1080);

  // Teks kuratorial pendek di (540, 1130)
  ctx.font = 'italic 400 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(7, 18, 74, 0.75)';
  ctx.fillText('Apa adanya. Dalam setiap garis dan diam.', 540, 1130);

  // Garis aksen rubi tipis 1 px panjang 80 px di (540, 1160)
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLORS.ruby;
  ctx.beginPath();
  ctx.moveTo(540 - 40, 1160);
  ctx.lineTo(540 + 40, 1160);
  ctx.stroke();

  // Tanggal dan koordinat fiktif pameran di (540, 1200)
  ctx.font = '500 12px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(7, 18, 74, 0.6)';
  ctx.letterSpacing = '2px';
  ctx.fillText('31.10.2026 — RUANG LIMINAL', 540, 1200);

  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 7: Finishing - Grain Kertas Halus (alpha 0.04)
  // --------------------------------------------------------------------------
  applyGrain(ctx, width, height, 0.04);

  return canvas;
}
