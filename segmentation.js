/**
 * segmentation.js - Modul Segmentasi Subjek & Isolasi Wajah Lokal
 * Bagian dari T10A: Memisahkan wajah, rambut, dan siluet kepala pengunjung
 * dari latar belakang ruangan secara bersih, 100% di browser tanpa koneksi internet.
 */

let segmenterInstance = null;
let isInitializing = false;
let initPromise = null;

/**
 * Memuat library MediaPipe Selfie Segmentation secara lokal dari assets/lib/mediapipe/
 * @returns {Promise<void>}
 */
function loadMediaPipeScript() {
  if (typeof window.SelfieSegmentation !== 'undefined') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="selfie_segmentation.js"]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'assets/lib/mediapipe/selfie_segmentation.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error('Gagal memuat selfie_segmentation.js lokal: ' + err));
    document.head.appendChild(script);
  });
}

/**
 * Menginisialisasi dan melakukan pre-warm pada model segmentasi agar proses saat capture instan.
 * @returns {Promise<boolean>}
 */
export async function initSegmenter() {
  if (segmenterInstance) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await loadMediaPipeScript();

      if (typeof window.SelfieSegmentation === 'undefined') {
        console.warn('SelfieSegmentation tidak terdefinisi di window.');
        return false;
      }

      const segmenter = new window.SelfieSegmentation({
        locateFile: (file) => `assets/lib/mediapipe/${file}`
      });

      // Model 1: General/Landscape model (akurasi tinggi untuk potret)
      segmenter.setOptions({
        modelSelection: 1
      });

      await segmenter.initialize();

      // Pre-warm model dengan kanvas kecil 1x1 agar WASM siap di memori
      const warmupCanvas = document.createElement('canvas');
      warmupCanvas.width = 16;
      warmupCanvas.height = 16;
      const ctx = warmupCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFD86B';
        ctx.fillRect(0, 0, 16, 16);
      }

      await new Promise((res) => {
        const timeout = setTimeout(res, 2000);
        segmenter.onResults(() => {
          clearTimeout(timeout);
          res();
        });
        segmenter.send({ image: warmupCanvas }).catch(() => res());
      });

      segmenterInstance = segmenter;
      console.log('MediaPipe SelfieSegmenter berhasil diinisialisasi lokal.');
      return true;
    } catch (err) {
      console.warn('Inisialisasi MediaPipe gagal, akan memakai fallback segmentasi:', err);
      segmenterInstance = null;
      return false;
    }
  })();

  return initPromise;
}

/**
 * Mengisolasi subjek (kepala, wajah, rambut, dan leher) dari latar belakang ruangan.
 * Menghasilkan kanvas baru dengan transparansi penuh di luar tubuh subjek.
 * 
 * @param {HTMLCanvasElement} inputCanvas
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function isolateSubject(inputCanvas) {
  if (!inputCanvas || inputCanvas.width === 0 || inputCanvas.height === 0) {
    return inputCanvas;
  }

  // Coba gunakan MediaPipe Selfie Segmenter
  if (!segmenterInstance) {
    await initSegmenter();
  }

  if (segmenterInstance) {
    try {
      const resultCanvas = await runMediaPipeSegmentation(inputCanvas);
      if (resultCanvas) {
        return resultCanvas;
      }
    } catch (err) {
      console.warn('Eksekusi segmentasi MediaPipe gagal, beralih ke fallback:', err);
    }
  }

  // Fallback cerdas jika WASM tidak tersedia
  return runFallbackSegmentation(inputCanvas);
}

/**
 * Menjalankan segmentasi berbasis MediaPipe dengan feathering tepi halus
 * @param {HTMLCanvasElement} inputCanvas
 * @returns {Promise<HTMLCanvasElement|null>}
 */
function runMediaPipeSegmentation(inputCanvas) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('Segmentasi MediaPipe timeout (4s), memakai fallback.');
      resolve(null);
    }, 4000);

    segmenterInstance.onResults((results) => {
      clearTimeout(timeout);
      if (!results || !results.segmentationMask) {
        resolve(null);
        return;
      }

      const outCanvas = document.createElement('canvas');
      outCanvas.width = inputCanvas.width;
      outCanvas.height = inputCanvas.height;
      const ctx = outCanvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // 1. Gambar mask segmentasi dengan sedikit blur (2.5px) agar tepi rambut/bahu halus & anti-aliased
      ctx.save();
      ctx.filter = 'blur(2px)';
      ctx.drawImage(results.segmentationMask, 0, 0, outCanvas.width, outCanvas.height);
      ctx.filter = 'none';

      // 2. Gabungkan foto wajah asli ke dalam area mask (source-in)
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(inputCanvas, 0, 0, outCanvas.width, outCanvas.height);

      // 3. Beri gradasi fade lembut pada bagian terbawah (leher/dada bawah)
      // agar menyatu sempurna dengan kerah jas maskot di T10C
      ctx.globalCompositeOperation = 'destination-out';
      const fadeGrad = ctx.createLinearGradient(0, outCanvas.height * 0.85, 0, outCanvas.height);
      fadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      fadeGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, outCanvas.height * 0.85, outCanvas.width, outCanvas.height * 0.15);

      ctx.restore();
      resolve(outCanvas);
    });

    segmenterInstance.send({ image: inputCanvas }).catch((err) => {
      clearTimeout(timeout);
      console.warn('Error saat mengirim frame ke segmenter:', err);
      resolve(null);
    });
  });
}

/**
 * Fallback segmentasi adaptif jika WebAssembly tidak didukung perangkat
 * Menggunakan gradasi kontur oval halus dengan deteksi fokus tengah
 * @param {HTMLCanvasElement} inputCanvas
 * @returns {HTMLCanvasElement}
 */
function runFallbackSegmentation(inputCanvas) {
  const w = inputCanvas.width;
  const h = inputCanvas.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return inputCanvas;

  // Mask oval adaptif berpusat di wajah
  const cx = w * 0.5;
  const cy = h * 0.46;
  const rx = w * 0.36;
  const ry = h * 0.42;

  ctx.save();
  const radGrad = ctx.createRadialGradient(cx, cy, rx * 0.55, cx, cy, rx);
  radGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
  radGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.95)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(inputCanvas, 0, 0, w, h);
  ctx.restore();

  return outCanvas;
}
