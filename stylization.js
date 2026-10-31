/**
 * stylization.js - Pipeline Stylization Karakter Wajah (T10B)
 * Mengubah foto wajah mentah yang telah terisolasi menjadi gaya ilustrasi seni 3D karakter:
 * - Bilateral / Surface Skin Smoothing (menghaluskan noise kamera & pori-pori secara merata)
 * - Cel-Shading & Tonal Mapping (kontur pencahayaan 5 tingkat khas karakter animasi)
 * - Line Art & Contour Enhancement (penegasan garis mata, kacamata, dan senyum)
 * - Warm Blush & Character Life (rona pipi hangat khas maskot MAX 12)
 * - Color Vibrancy Modulation (peningkatan saturasi rona kulit karakter)
 * - Adaptasi palet tematik untuk Imajinasi, Realitas, dan Surealis
 */

import { clearCanvas } from './utils.js?v=2';

/**
 * Mengubah kanvas wajah terisolasi menjadi karakter seni bertekstur ilustratif
 * 
 * @param {HTMLCanvasElement} isolatedCanvas - Kanvas wajah dengan background transparan (dari T10A)
 * @param {string} theme - 'imajinasi' | 'realitas' | 'surealis'
 * @param {Object} [options]
 * @returns {HTMLCanvasElement} - Kanvas baru dengan wajah karakter ter-stylize
 */
export function stylizeCharacterFace(isolatedCanvas, theme = 'imajinasi', options = {}) {
  if (!isolatedCanvas || isolatedCanvas.width === 0 || isolatedCanvas.height === 0) {
    return isolatedCanvas;
  }

  const w = isolatedCanvas.width;
  const h = isolatedCanvas.height;

  // Buat kanvas kerja
  const workCanvas = document.createElement('canvas');
  workCanvas.width = w;
  workCanvas.height = h;
  const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return isolatedCanvas;

  ctx.drawImage(isolatedCanvas, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const len = data.length;

  // --------------------------------------------------------------------------
  // TAHAP 1: Surface / Bilateral Smoothing (Penghalusan Kulit Karakter)
  // Menghilangkan noise sensor webcam namun mempertahankan garis kacamata & mata
  // --------------------------------------------------------------------------
  const smoothed = new Uint8ClampedArray(len);
  const radius = 3;
  const colorThreshold = 32; // Ambang batas tepi warna (lebih halus untuk kulit)

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    for (let x = 0; x < w; x++) {
      const idx = (rowOffset + x) * 4;
      const alpha = data[idx + 3];

      if (alpha < 16) {
        smoothed[idx + 3] = 0;
        continue;
      }

      const r0 = data[idx];
      const g0 = data[idx + 1];
      const b0 = data[idx + 2];

      let sumR = 0, sumG = 0, sumB = 0, sumW = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        const nRowOffset = ny * w;

        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;

          const nIdx = (nRowOffset + nx) * 4;
          if (data[nIdx + 3] < 16) continue;

          const nr = data[nIdx];
          const ng = data[nIdx + 1];
          const nb = data[nIdx + 2];

          // Jarak Manhattan warna
          const colorDiff = Math.abs(r0 - nr) + Math.abs(g0 - ng) + Math.abs(b0 - nb);
          if (colorDiff < colorThreshold * 3) {
            const weight = 1 - (colorDiff / (colorThreshold * 3));
            sumR += nr * weight;
            sumG += ng * weight;
            sumB += nb * weight;
            sumW += weight;
          }
        }
      }

      if (sumW > 0) {
        smoothed[idx] = sumR / sumW;
        smoothed[idx + 1] = sumG / sumW;
        smoothed[idx + 2] = sumB / sumW;
        smoothed[idx + 3] = alpha;
      } else {
        smoothed[idx] = r0;
        smoothed[idx + 1] = g0;
        smoothed[idx + 2] = b0;
        smoothed[idx + 3] = alpha;
      }
    }
  }

  // --------------------------------------------------------------------------
  // TAHAP 2: Luminance Mapping & Sobel Line Art (Outline Ilustrasi)
  // --------------------------------------------------------------------------
  const lum = new Float32Array(w * h);
  for (let i = 0; i < len; i += 4) {
    const pIdx = i / 4;
    lum[pIdx] = 0.299 * smoothed[i] + 0.587 * smoothed[i + 1] + 0.114 * smoothed[i + 2];
  }

  const finalData = new Uint8ClampedArray(len);

  // Palet garis tinta berdasarkan tema
  let inkR = 18, inkG = 22, inkB = 45;
  if (theme === 'realitas') {
    inkR = 25; inkG = 24; inkB = 22; // Charcoal pencil
  } else if (theme === 'surealis') {
    inkR = 15; inkG = 28; inkB = 58; // Indigo ink
  }

  for (let y = 1; y < h - 1; y++) {
    const rowOffset = y * w;
    const prevRowOffset = (y - 1) * w;
    const nextRowOffset = (y + 1) * w;

    for (let x = 1; x < w - 1; x++) {
      const idx = (rowOffset + x) * 4;
      const alpha = smoothed[idx + 3];

      if (alpha < 16) {
        finalData[idx + 3] = 0;
        continue;
      }

      // Kernel Sobel untuk mengekstrak garis bentuk mata, kacamata, dan senyum
      const p00 = lum[prevRowOffset + (x - 1)];
      const p01 = lum[prevRowOffset + x];
      const p02 = lum[prevRowOffset + (x + 1)];
      const p10 = lum[rowOffset + (x - 1)];
      const p12 = lum[rowOffset + (x + 1)];
      const p20 = lum[nextRowOffset + (x - 1)];
      const p21 = lum[nextRowOffset + x];
      const p22 = lum[nextRowOffset + (x + 1)];

      const gx = (p02 + 2 * p12 + p22) - (p00 + 2 * p10 + p20);
      const gy = (p20 + 2 * p21 + p22) - (p00 + 2 * p01 + p02);
      const edgeMag = Math.sqrt(gx * gx + gy * gy);

      let r = smoothed[idx];
      let g = smoothed[idx + 1];
      let b = smoothed[idx + 2];
      const l = lum[rowOffset + x];

      // ----------------------------------------------------------------------
      // TAHAP 3: Cel-Shading Tone Quantization (5 Tingkat Karakter 3D)
      // ----------------------------------------------------------------------
      let factor = 1.0;
      if (l < 55) {
        factor = 0.80; // Deep shadow
      } else if (l < 105) {
        factor = 0.90; // Soft shadow
      } else if (l < 165) {
        factor = 1.0;  // Base midtone
      } else if (l < 215) {
        factor = 1.07; // Light illumination
      } else {
        factor = 1.13; // Radiant highlight (lembut tanpa blowout putih)
      }

      // Perpaduan 50% terkuantisasi + 50% halus untuk kesan 3D clay alami
      let celR = r * (0.50 + 0.50 * factor);
      let celG = g * (0.50 + 0.50 * factor);
      let celB = b * (0.50 + 0.50 * factor);

      // Boost saturasi lembut (+12%) untuk tema berwarna agar karakter segar & hidup
      if (theme !== 'realitas') {
        const avg = (celR + celG + celB) / 3;
        celR = avg + (celR - avg) * 1.12;
        celG = avg + (celG - avg) * 1.12;
        celB = avg + (celB - avg) * 1.12;
      }

      r = Math.min(255, Math.max(0, celR));
      g = Math.min(255, Math.max(0, celG));
      b = Math.min(255, Math.max(0, celB));

      // Lapisan Line Art Ilustrasi: ambang batas 36px untuk menghindari noise bintik
      if (edgeMag > 36) {
        const edgeAlpha = Math.min(0.65, (edgeMag - 36) / 36);
        r = r * (1 - edgeAlpha) + inkR * edgeAlpha;
        g = g * (1 - edgeAlpha) + inkG * edgeAlpha;
        b = b * (1 - edgeAlpha) + inkB * edgeAlpha;
      }

      finalData[idx] = r;
      finalData[idx + 1] = g;
      finalData[idx + 2] = b;
      finalData[idx + 3] = alpha;
    }
  }

  // Masukkan kembali hasil piksel ter-stylize ke kanvas kerja
  const outImgData = new ImageData(finalData, w, h);
  ctx.putImageData(outImgData, 0, 0);

  // --------------------------------------------------------------------------
  // TAHAP 4: Rona Pipi Hangat (Mascot Cheek Blush) & Karakteristik Wajah
  // --------------------------------------------------------------------------
  if (theme !== 'realitas') {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';

    // Rona pipi lembut melintang area pipi & hidung (memberikan kehangatan alami karakter)
    const blushRadius = w * 0.16;
    const leftCheekX = w * 0.36;
    const rightCheekX = w * 0.64;
    const cheekY = h * 0.50;

    const drawCheekBlush = (cx, cy) => {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blushRadius);
      grad.addColorStop(0, 'rgba(255, 120, 150, 0.55)');
      grad.addColorStop(0.6, 'rgba(255, 150, 175, 0.22)');
      grad.addColorStop(1, 'rgba(255, 150, 175, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, blushRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    drawCheekBlush(leftCheekX, cheekY);
    drawCheekBlush(rightCheekX, cheekY);
    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // TAHAP 5: Pastikan 100% Area Luar Subjek Tetap Transparan Bersih
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(isolatedCanvas, 0, 0);
  ctx.restore();

  return workCanvas;
}
