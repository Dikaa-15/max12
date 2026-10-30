/**
 * Tiga Dunia Wajahmu - MAX 12
 * utils.js - Canvas Helpers & Image Processing Utilities
 */

/**
 * Memotong (crop) sumber media (video atau image) ke rasio 4:5 berpusat di tengah
 * dan menerapkan mirror secara visual jika diminta.
 * Menghasilkan canvas berkualitas tinggi tanpa distorsi (aspect ratio preserved).
 * 
 * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement} source
 * @param {HTMLCanvasElement} [destCanvas]
 * @param {Object} [options]
 * @param {number} [options.targetWidth=960]
 * @param {number} [options.targetHeight=1200]
 * @param {boolean} [options.mirror=true]
 * @returns {HTMLCanvasElement}
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

  // Dapatkan dimensi sumber
  const sw = source.videoWidth || source.naturalWidth || source.width;
  const sh = source.videoHeight || source.naturalHeight || source.height;

  if (!sw || !sh) {
    console.warn('cropAndMirrorTo4x5: Dimensi sumber tidak valid', { sw, sh });
    return canvas;
  }

  // Hitung crop 4:5 terpusat
  const targetRatio = targetWidth / targetHeight; // 4/5 = 0.8
  const sourceRatio = sw / sh;

  let cropWidth, cropHeight, cropX, cropY;

  if (sourceRatio > targetRatio) {
    // Sumber lebih lebar dari 4:5 (misal 16:9 atau 4:3) -> crop horizontal
    cropHeight = sh;
    cropWidth = sh * targetRatio;
    cropX = (sw - cropWidth) / 2;
    cropY = 0;
  } else {
    // Sumber lebih tinggi atau sama dengan 4:5 -> crop vertikal
    cropWidth = sw;
    cropHeight = sw / targetRatio;
    cropX = 0;
    cropY = (sh - cropHeight) / 2;
  }

  ctx.save();
  // Terapkan mirror horizontal jika diminta (AGENTS.md Aturan 3)
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  // Gambar area tengah yang terpotong ke canvas tujuan
  ctx.drawImage(
    source,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, canvas.width, canvas.height
  );
  ctx.restore();

  return canvas;
}

/**
 * Membersihkan canvas dari memori dengan menyetel width dan height ke 0 (AGENTS.md Aturan 2)
 * @param {HTMLCanvasElement} canvas
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
