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

  // 2. Terapkan Mask Elips dengan Feathering via destination-in
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';

  // Buat kanvas mask sementara untuk gradien elips
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
  ctx.restore();

  // Bersihkan mask sementara
  clearCanvas(maskCanvas);

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
