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
  let cy = 370;
  let neckY = 500;
  let faceScale = 0.94;

  if (pId === 3) {
    // Pose 3: Merenung (Duduk bersila, tangan bertumpu di bawah dagu)
    cy = 390;
    neckY = 480;
    faceScale = 0.90;
  } else if (pId === 2) {
    // Pose 2: Kagum (Tatap sedikit ke atas)
    cy = 365;
    neckY = 495;
  } else if (pId === 5) {
    // Pose 5: Bebas (Melompat ceria)
    cy = 370;
    neckY = 500;
  }

  // --------------------------------------------------------------------------
  // LAPISAN 1: Mahkota Kelopak Bunga Matahari (Belakang Kepala)
  // Menghapus wajah boneka & rambut perak agar kepala pengunjung bisa masuk
  // --------------------------------------------------------------------------
  const crownCanvas = document.createElement('canvas');
  crownCanvas.width = bw;
  crownCanvas.height = bh;
  const cctx = crownCanvas.getContext('2d');
  cctx.drawImage(poseImg, 0, 0, bw, bh);

  // Masking elips untuk memotong bagian dalam mahkota bunga
  cctx.save();
  cctx.globalCompositeOperation = 'destination-out';
  const cgrad = cctx.createRadialGradient(cx, cy, 150, cx, cy, 215);
  cgrad.addColorStop(0, 'rgba(0,0,0,1)');
  cgrad.addColorStop(0.85, 'rgba(0,0,0,1)');
  cgrad.addColorStop(1, 'rgba(0,0,0,0)');
  cctx.fillStyle = cgrad;
  cctx.beginPath();
  cctx.arc(cx, cy, 215, 0, Math.PI * 2);
  cctx.fill();
  cctx.restore();

  ctx.drawImage(crownCanvas, 0, 0);

  // --------------------------------------------------------------------------
  // LAPISAN 2: Binar Aura Bunga / Sunburst Halo di Belakang Kepala Pengunjung
  // --------------------------------------------------------------------------
  ctx.save();
  let haloColor = 'rgba(255, 195, 45, 0.75)';
  let haloOuter = 'rgba(255, 160, 30, 0)';
  if (theme === 'realitas') {
    haloColor = 'rgba(235, 230, 220, 0.65)';
    haloOuter = 'rgba(200, 195, 185, 0)';
  } else if (theme === 'surealis') {
    haloColor = 'rgba(160, 205, 255, 0.70)';
    haloOuter = 'rgba(47, 99, 214, 0)';
  }

  const hgrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 225);
  hgrad.addColorStop(0, haloColor);
  hgrad.addColorStop(0.7, haloColor.replace(/[\d\.]+\)$/, '0.35)'));
  hgrad.addColorStop(1, haloOuter);
  ctx.fillStyle = hgrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 225, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --------------------------------------------------------------------------
  // LAPISAN 3: Wajah Pengunjung yang Telah Ter-stylize (T10B)
  // Diposisikan presisi di pusat mahkota dan di atas kerah jas
  // --------------------------------------------------------------------------
  if (stylizedFaceCanvas && stylizedFaceCanvas.width > 0) {
    const fw = Math.round(400 * faceScale);
    const fh = Math.round(fw * (stylizedFaceCanvas.height / stylizedFaceCanvas.width));
    const fx = Math.round(cx - fw / 2);
    const fy = Math.round(cy - fh * 0.44);

    ctx.save();
    ctx.drawImage(stylizedFaceCanvas, fx, fy, fw, fh);
    ctx.restore();
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
  const fgGrad = fgctx.createLinearGradient(0, neckY - 15, 0, neckY + 15);
  fgGrad.addColorStop(0, 'rgba(0,0,0,0)');
  fgGrad.addColorStop(1, 'rgba(0,0,0,1)');
  fgctx.fillStyle = fgGrad;
  fgctx.fillRect(0, neckY - 15, bw, 30);
  
  // Isi penuh pakaian dari leher ke bawah
  fgctx.fillStyle = 'rgba(0,0,0,1)';
  fgctx.fillRect(0, neckY + 15, bw, bh - (neckY + 15));

  // Pertahankan tangan yang terangkat untuk pose ekspresif
  if (pId === 2 || pId === 4 || pId === 5) {
    fgctx.fillRect(0, 320, 240, bh - 320);
    fgctx.fillRect(600, 320, bw - 600, bh - 320);
  } else if (pId === 3) {
    // Pose 3: Tangan bertumpu tepat di bawah dagu
    fgctx.fillRect(250, 480, 350, bh - 480);
  }
  fgctx.restore();

  ctx.drawImage(fgCanvas, 0, 0);

  // --------------------------------------------------------------------------
  // LAPISAN 5: Adaptasi Karakter Sesuai Tema
  // --------------------------------------------------------------------------
  if (theme === 'realitas') {
    // Tema Realitas: Karakter kurator galeri seni berwibawa
    // Mengubah pakaian & karakter menjadi monokrom gelatin-silver terkalibrasi
    // Simpan salinan alpha mask sebelum blending agar piksel transparan tidak terisi
    const mask = document.createElement('canvas');
    mask.width = bw;
    mask.height = bh;
    const mctx = mask.getContext('2d');
    mctx.drawImage(mascotCanvas, 0, 0);

    ctx.save();
    // Efek monokrom kuratorial
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(128, 128, 128, 0.75)';
    ctx.fillRect(0, 0, bw, bh);

    // Kehangatan sepia tipis cetakan seni
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(235, 220, 200, 0.25)';
    ctx.fillRect(0, 0, bw, bh);

    // Terapkan kembali alpha mask agar piksel luar tetap murni transparan (0 alpha)
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0);
    ctx.restore();

    clearCanvas(mask);
  }

  // Bersihkan kanvas sementara
  clearCanvas(crownCanvas);
  clearCanvas(fgCanvas);

  return mascotCanvas;
}
