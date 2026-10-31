/**
 * mascot.js - Compositing Tubuh & Mahkota Karakter Maskot MAX 12 (T10C)
 * Menggabungkan wajah pengunjung yang telah ter-stylize (T10B) ke tubuh maskot MAX 12:
 * - 5 Pose Interaktif: Tenang (1), Kagum (2), Merenung (3), Ceria (4), Bebas (5)
 * - Mahkota Kelopak Bunga Matahari Khas Maskot (Golden Sunflower Crown)
 * - Kerah Jas Putih, Dasi Kupu-Kupu (Bowtie), dan Rompi Bulu Bertabur Bunga
 * - Adaptasi Penampilan Tematik (Imajinasi, Realitas, Surealis)
 */

import { clearCanvas } from './utils.js?v=2';

// Cache gambar untuk menghindari reload berulang
const imageCache = new Map();

/**
 * Memuat gambar secara asynchronous dengan caching
 * @param {string} src 
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => reject(new Error(`Gagal memuat gambar: ${src}`));
    img.src = src;
  });
}

/**
 * Menggabungkan wajah ter-stylize ke dalam tubuh karakter maskot MAX 12
 * 
 * @param {HTMLCanvasElement} stylizedFaceCanvas - Wajah pengunjung hasil T10B
 * @param {number} [poseId=1] - Pilihan pose 1 s/d 5
 * @param {string} [theme='imajinasi'] - 'imajinasi' | 'realitas' | 'surealis'
 * @returns {Promise<HTMLCanvasElement>} - Kanvas karakter utuh ukuran 848x1200
 */
export async function createMascotCharacter(stylizedFaceCanvas, poseId = 1, theme = 'imajinasi') {
  const pId = Math.max(1, Math.min(5, parseInt(poseId, 10) || 1));
  const poseSrc = `assets/images/optimized/pose_${pId}.webp`;

  let poseImg;
  try {
    poseImg = await loadImage(poseSrc);
  } catch (err) {
    console.warn(`Gagal memuat pose ${pId}, fallback ke pose 1:`, err);
    poseImg = await loadImage('assets/images/optimized/pose_1.webp');
  }

  const bw = 848;
  const bh = 1200;

  // Kanvas kerja utama
  const mascotCanvas = document.createElement('canvas');
  mascotCanvas.width = bw;
  mascotCanvas.height = bh;
  const ctx = mascotCanvas.getContext('2d');
  if (!ctx) return stylizedFaceCanvas;

  // Koordinat kepala & leher per pose
  let cx = 424;
  let cy = 385;
  let neckY = 555;
  let faceScale = 0.98;

  if (pId === 3) {
    // Pose 3: Merenung (Duduk bersila, tangan bertumpu di bawah dagu)
    cy = 450;
    neckY = 620;
    faceScale = 0.94;
  } else if (pId === 2) {
    // Pose 2: Kagum (Tatap sedikit ke atas)
    cy = 370;
    neckY = 555;
    faceScale = 0.96;
  } else if (pId === 4) {
    // Pose 4: Ceria (Tangan terangkat menyapa)
    cy = 380;
    neckY = 555;
    faceScale = 0.96;
  } else if (pId === 5) {
    // Pose 5: Bebas (Melompat ceria)
    cy = 370;
    neckY = 550;
    faceScale = 0.96;
  }

  // --------------------------------------------------------------------------
  // LAPISAN 0: Lapisan Dasar Rambut Perak Maskot (Solid Silver Hair Backing)
  // Memastikan area dalam mahkota 100% solid sehingga latar belakang langit /
  // kosmik tidak akan bocor menembus kepala pengunjung
  // --------------------------------------------------------------------------
  ctx.save();
  const bgHair = ctx.createRadialGradient(cx, cy, 60, cx, cy, 180);
  bgHair.addColorStop(0, 'rgba(238, 234, 230, 1)');
  bgHair.addColorStop(0.75, 'rgba(226, 222, 216, 1)');
  bgHair.addColorStop(1, 'rgba(215, 210, 204, 0)');
  ctx.fillStyle = bgHair;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 1: Mahkota Kelopak Bunga Matahari & Rambut Perak (Belakang Kepala)
  // Menghapus hanya fitur wajah boneka (mata, hidung, bibir) agar kepala pengunjung masuk,
  // sambil mempertahankan rambut perak mengembang dan mahkota bunga matahari utuh
  // --------------------------------------------------------------------------
  const crownCanvas = document.createElement('canvas');
  crownCanvas.width = bw;
  crownCanvas.height = bh;
  const cctx = crownCanvas.getContext('2d');
  cctx.drawImage(poseImg, 0, 0, bw, bh);

  // Masking elips lembut untuk menghapus hanya mata, hidung, dan bibir boneka
  cctx.save();
  cctx.globalCompositeOperation = 'destination-out';
  const cgrad = cctx.createRadialGradient(cx, cy, 90, cx, cy, 145);
  cgrad.addColorStop(0, 'rgba(0,0,0,1)');
  cgrad.addColorStop(0.85, 'rgba(0,0,0,1)');
  cgrad.addColorStop(1, 'rgba(0,0,0,0)');
  cctx.fillStyle = cgrad;
  cctx.beginPath();
  cctx.ellipse(cx, cy + 10, 140, 155, 0, 0, Math.PI * 2);
  cctx.fill();
  cctx.restore();

  ctx.drawImage(crownCanvas, 0, 0);

  // --------------------------------------------------------------------------
  // LAPISAN 2: Aura Cahaya Lembut Maskot (Subtle Warm Sunburst Glow)
  // Lembut menyebar di belakang kelopak bunga matahari tanpa lingkaran pekat
  // --------------------------------------------------------------------------
  ctx.save();
  const hgrad = ctx.createRadialGradient(cx, cy, 180, cx, cy, 330);
  hgrad.addColorStop(0, 'rgba(255, 220, 110, 0.18)');
  hgrad.addColorStop(0.65, 'rgba(255, 195, 60, 0.06)');
  hgrad.addColorStop(1, 'rgba(255, 180, 40, 0)');
  ctx.fillStyle = hgrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 330, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 3: Wajah Pengunjung yang Telah Ter-stylize (T10B)
  // Diposisikan presisi di pusat mahkota dengan soft feathering
  // --------------------------------------------------------------------------
  if (stylizedFaceCanvas && stylizedFaceCanvas.width > 0) {
    const fw = Math.round(380 * faceScale);
    const fh = Math.round(fw * (stylizedFaceCanvas.height / stylizedFaceCanvas.width));
    const fx = Math.round(cx - fw / 2);
    const fy = Math.round(cy - fh * 0.44);

    // Lembutkan batas wajah agar membaur alami ke rambut perak maskot
    const faceMaskCanvas = document.createElement('canvas');
    faceMaskCanvas.width = fw;
    faceMaskCanvas.height = fh;
    const fctx = faceMaskCanvas.getContext('2d');
    fctx.drawImage(stylizedFaceCanvas, 0, 0, fw, fh);

    fctx.save();
    fctx.globalCompositeOperation = 'destination-in';
    const fgrad = fctx.createRadialGradient(fw / 2, fh * 0.46, fw * 0.32, fw / 2, fh * 0.46, fw * 0.48);
    fgrad.addColorStop(0, 'rgba(0,0,0,1)');
    fgrad.addColorStop(0.85, 'rgba(0,0,0,1)');
    fgrad.addColorStop(1, 'rgba(0,0,0,0)');
    fctx.fillStyle = fgrad;
    fctx.beginPath();
    fctx.ellipse(fw / 2, fh * 0.46, fw * 0.48, fh * 0.48, 0, 0, Math.PI * 2);
    fctx.fill();
    fctx.restore();

    ctx.save();
    ctx.drawImage(faceMaskCanvas, fx, fy);
    ctx.restore();
    clearCanvas(faceMaskCanvas);
  }

  // --------------------------------------------------------------------------
  // LAPISAN 4: Pakaian Depan Maskot (Kerah Jas, Dasi Kupu-Kupu & Rompi Bulu)
  // Menutupi pangkal leher pengunjung sehingga tampak mengenakan kostum utuh
  // --------------------------------------------------------------------------
  const fgCanvas = document.createElement('canvas');
  fgCanvas.width = bw;
  fgCanvas.height = bh;
  const fgctx = fgCanvas.getContext('2d');
  fgctx.drawImage(poseImg, 0, 0, bw, bh);

  // Potong hanya bagian pakaian dari batas leher ke bawah (beserta tangan jika di atas)
  fgctx.save();
  fgctx.globalCompositeOperation = 'destination-in';
  
  // Gradien vertikal lembut pada batas dasi kupu-kupu / leher
  const fgGrad = fgctx.createLinearGradient(0, neckY - 12, 0, neckY + 12);
  fgGrad.addColorStop(0, 'rgba(0,0,0,0)');
  fgGrad.addColorStop(1, 'rgba(0,0,0,1)');
  fgctx.fillStyle = fgGrad;
  fgctx.fillRect(0, neckY - 12, bw, 24);
  
  // Isi penuh pakaian dari leher ke bawah
  fgctx.fillStyle = 'rgba(0,0,0,1)';
  fgctx.fillRect(0, neckY + 12, bw, bh - (neckY + 12));

  // Pertahankan tangan yang terangkat untuk pose ekspresif
  if (pId === 2 || pId === 4 || pId === 5) {
    fgctx.fillRect(0, 320, 240, bh - 320);
    fgctx.fillRect(600, 320, bw - 600, bh - 320);
  } else if (pId === 3) {
    // Pose 3: Tangan bertumpu tepat di bawah dagu
    fgctx.fillRect(230, 560, 390, bh - 560);
  }
  fgctx.restore();

  ctx.drawImage(fgCanvas, 0, 0);

  // Bersihkan kanvas sementara
  clearCanvas(crownCanvas);
  clearCanvas(fgCanvas);

  return mascotCanvas;
}
