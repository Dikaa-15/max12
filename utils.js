/**
 * Tiga Dunia Wajahmu - MAX 12
 * utils.js - PRNG Ber-seed, Canvas Helpers, Masking, Grain & Image Processing
 */

// 1. PRNG Ber-seed: Mulberry32 (DESIGN.md Bab 6)
export function mulberry32(seed) {
  let s = (seed >>> 0) || 123456789;
  return function() {
    let t = s = (s + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomRange(rng, min, max) {
  return min + rng() * (max - min);
}

/**
 * Memotong sumber media (video/gambar) ke rasio 4:5 terpusat dengan opsi mirror
 */
export function cropAndMirrorTo4x5(source, destCanvas = null, options = {}) {
  const targetWidth = options.targetWidth || 960;
  const targetHeight = options.targetHeight || 1200;
  const mirror = options.mirror !== undefined ? options.mirror : true;

  const canvas = destCanvas || document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const sw = source.videoWidth || source.naturalWidth || source.width;
  const sh = source.videoHeight || source.naturalHeight || source.height;

  if (!sw || !sh) {
    console.warn('cropAndMirrorTo4x5: Dimensi sumber tidak valid', { sw, sh });
    return canvas;
  }

  const targetRatio = targetWidth / targetHeight; // 4/5 = 0.8
  const sourceRatio = sw / sh;

  let cropWidth, cropHeight, cropX, cropY;

  if (sourceRatio > targetRatio) {
    cropHeight = sh;
    cropWidth = sh * targetRatio;
    cropX = (sw - cropWidth) / 2;
    cropY = 0;
  } else {
    cropWidth = sw;
    cropHeight = sw / targetRatio;
    cropX = 0;
    cropY = (sh - cropHeight) / 2;
  }

  ctx.save();
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    source,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, canvas.width, canvas.height
  );
  ctx.restore();

  return canvas;
}

/**
 * Menyiapkan wajah ber-mask elips dengan tepi halus (feather 40px)
 * sesuai spesifikasi DESIGN.md Bab 6 (rx 300, ry 390 di kanvas 640x800)
 * 
 * @param {HTMLCanvasElement} sourceFaceCanvas
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @param {number} rx
 * @param {number} ry
 * @param {number} featherRadius
 * @returns {HTMLCanvasElement}
 */
export function createFeatheredFace(sourceFaceCanvas, targetWidth = 640, targetHeight = 800, rx = 300, ry = 390, featherRadius = 40) {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Gambar wajah asli
  if (sourceFaceCanvas && sourceFaceCanvas.width > 0) {
    ctx.drawImage(sourceFaceCanvas, 0, 0, targetWidth, targetHeight);
  } else {
    // Fallback siluet jika tidak ada foto
    ctx.fillStyle = '#1536A8';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // 2. Terapkan Mask Elips atau Bottom Fade via destination-in
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';

  let isSegmented = false;
  try {
    const cornerAlpha = ctx.getImageData(2, 2, 1, 1).data[3];
    const topCornerAlpha = ctx.getImageData(targetWidth - 3, 2, 1, 1).data[3];
    if (cornerAlpha === 0 && topCornerAlpha === 0) {
      isSegmented = true;
    }
  } catch (e) {
    // Fallback jika canvas tainted
  }

  if (isSegmented) {
    // Pertahankan bentuk rambut & siluet kepala alami karakter yang telah terisolasi
    // Hanya berikan feathering gradien lembut pada bagian torso/bawah agar berpadu halus
    const fadeGrad = ctx.createLinearGradient(0, targetHeight - 140, 0, targetHeight);
    fadeGrad.addColorStop(0, 'rgba(0,0,0,1)');
    fadeGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    // Fallback: Terapkan Mask Elips jika foto belum tersegmentasi (kamar belum terhapus)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = targetWidth;
    maskCanvas.height = targetHeight;
    const mctx = maskCanvas.getContext('2d');

    const cx = targetWidth / 2;
    const cy = targetHeight / 2;

    // Normalisasi radius elips dengan scale
    mctx.save();
    mctx.translate(cx, cy);
    const scaleY = ry / rx;
    mctx.scale(1, scaleY);

    const grad = mctx.createRadialGradient(0, 0, rx - featherRadius, 0, 0, rx);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    mctx.fillStyle = grad;
    mctx.beginPath();
    mctx.arc(0, 0, rx, 0, Math.PI * 2);
    mctx.fill();
    mctx.restore();

    // Aplikasikan mask
    ctx.drawImage(maskCanvas, 0, 0);
    clearCanvas(maskCanvas);
  }

  ctx.restore();
  return canvas;
}

/**
 * Menggambar bintang 4 sudut (sparkle) bercahaya (DESIGN.md Sec. 7.1)
 */
export function drawSparkle(ctx, cx, cy, size, color = '#FFD86B', glowColor = '#FFEFA8') {
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = size * 1.2;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Menerapkan lapisan grain monokrom berukuran 1/4 (270x337) lalu di-scale 4x
 * dengan blend mode overlay alpha 0.08 (DESIGN.md Bab 6)
 */
export function applyGrain(ctx, width = 1080, height = 1350, alpha = 0.08) {
  const noiseW = Math.round(width / 4);   // 270
  const noiseH = Math.round(height / 4);  // 337.5 -> 338

  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = noiseW;
  noiseCanvas.height = noiseH;
  const nctx = noiseCanvas.getContext('2d');
  if (!nctx) return;

  const imgData = nctx.createImageData(noiseW, noiseH);
  const data = imgData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const v = (Math.random() * 255) | 0;
    data[i]     = v; // R
    data[i + 1] = v; // G
    data[i + 2] = v; // B
    data[i + 3] = 255;
  }
  nctx.putImageData(imgData, 0, 0);

  // Gambar ke kanvas utama dengan scale 4x dan blend mode overlay
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(noiseCanvas, 0, 0, width, height);
  ctx.restore();

  clearCanvas(noiseCanvas);
}

/**
 * Mengubah kanvas foto ke grayscale berkarakter dengan kurva kontras terkalibrasi
 * (DESIGN.md Bab 7.2 Tema 2: Realitas)
 * - Luminance weighted BT.601
 * - S-curve terkalibrasi: shadow lembut terangkat, highlight terlindungi dari clipping
 * - Micro-sepia warmth (cetakan gelatin silver)
 * 
 * @param {HTMLCanvasElement} canvas
 * @returns {HTMLCanvasElement}
 */
export function applyCalibratedGrayscale(canvas) {
  if (!canvas || canvas.width === 0 || canvas.height === 0) return canvas;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const len = data.length;

  // Pass 1: Analisis distribusi luminance pada area wajah (alpha > 128)
  let minLum = 255;
  let maxLum = 0;
  let validCount = 0;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] < 128) continue;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
    validCount++;
  }

  if (validCount === 0) return canvas;

  const range = Math.max(35, maxLum - minLum);

  // Pass 2: Kalibrasi kontras adaptif (S-curve + shadow lift + highlight protection)
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Normalisasi adaptif berbasis dynamic range potret
    let norm = (lum - minLum) / range;
    norm = Math.max(0, Math.min(1, norm));

    // Shadow lift halus (gamma 0.85 untuk mengangkat detail gelap secara natural)
    norm = Math.pow(norm, 0.85);

    // Kurva kontras S-curve (smoothstep) untuk kedalaman tonal khas cetakan seni
    const sCurve = norm * norm * (3 - 2 * norm);

    // Pemetaan aman: min 20 (tidak hitam pekat mati), max 238 (highlight terlindungi dari terbakar)
    const targetLum = 20 + sCurve * (238 - 20);

    // Sentuhan mikro-sepia hangat (cetakan gelatin silver tua: DESIGN.md Sec. 7.2)
    data[i]     = Math.min(255, Math.round(targetLum + 4)); // R hangat
    data[i + 1] = Math.round(targetLum);                     // G
    data[i + 2] = Math.max(0, Math.round(targetLum - 3));   // B dingin
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Membersihkan canvas dari memori dengan menyetel width dan height ke 0 (AGENTS.md Aturan 2)
 */
export function clearCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  canvas.width = 0;
  canvas.height = 0;
}
