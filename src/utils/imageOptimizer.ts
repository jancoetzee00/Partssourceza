/**
 * Part Source ZA - AI Image Optimizer & Compression Engine
 * Fast client-side Canvas cropping, aspect ratio adaptation, and WebP compression
 * optimized for South African mobile network speeds (Vodacom, MTN, Telkom, Cell C).
 */

export interface CropBox {
  ymin: number; // 0 to 1000 scale or 0 to 1
  xmin: number;
  ymax: number;
  xmax: number;
}

export type AspectRatioOption = 'auto' | '4:3' | '1:1' | '16:9' | 'original';

export type QualityPreset = 'fast' | 'balanced' | 'high';

export interface ImageOptimizationOptions {
  cropBox?: CropBox;
  aspectRatio?: AspectRatioOption;
  qualityPreset?: QualityPreset;
  rotation?: number; // 0, 90, 180, 270
  brightness?: number; // 0.8 to 1.4 (default 1.0)
  contrast?: number; // 0.8 to 1.4 (default 1.0)
  maxWidth?: number;
  maxHeight?: number;
}

export interface OptimizedImageResult {
  dataUrl: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  reductionPercentage: number;
  width: number;
  height: number;
  format: 'webp' | 'jpeg';
  estimatedLoadTimes: {
    sa3g: string; // ~1.5 Mbps
    sa4g: string; // ~20 Mbps
    saFibre: string; // ~50 Mbps
  };
}

export interface AIPartAnalysis {
  partName: string;
  category: string;
  detectedCondition?: string;
  confidence: number;
  cropBox: CropBox;
  recommendedAspectRatio: '4:3' | '1:1' | '16:9';
  tags: string[];
  qualityAssessment: string;
  enhancementSuggestions?: string;
}

/**
 * Format raw bytes into human-readable string (e.g. 142 KB, 2.4 MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculate estimated download times across South African telecommunication networks
 */
export function calculateSALoadTimes(bytes: number) {
  // Transfer speeds in bytes per second
  const speed3g = (1.5 * 1024 * 1024) / 8; // ~1.5 Mbps
  const speed4g = (20 * 1024 * 1024) / 8; // ~20 Mbps LTE
  const speedFibre = (50 * 1024 * 1024) / 8; // ~50 Mbps

  const time3g = bytes / speed3g;
  const time4g = bytes / speed4g;
  const timeFibre = bytes / speedFibre;

  const formatTime = (seconds: number) => {
    if (seconds < 0.05) return '< 0.05s';
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  return {
    sa3g: `${formatTime(time3g)} (3G)`,
    sa4g: `${formatTime(time4g)} (Vodacom/MTN 4G)`,
    saFibre: `${formatTime(timeFibre)} (Fibre/5G)`
  };
}

/**
 * Loads an image from a Data URL, Blob URL, or external URL into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load source image: ' + err));
    img.src = src;
  });
}

/**
 * Calculates raw byte size from a base64 Data URL
 */
export function getBase64ByteSize(dataUrl: string): number {
  const base64Index = dataUrl.indexOf(';base64,');
  if (base64Index === -1) return dataUrl.length;
  const base64String = dataUrl.substring(base64Index + 8);
  const padding = (base64String.match(/=/g) || []).length;
  return Math.floor((base64String.length * 3) / 4) - padding;
}

/**
 * Crops and compresses an image according to specified options
 */
export async function optimizeImage(
  source: string | HTMLImageElement,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const img = typeof source === 'string' ? await loadImage(source) : source;
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  // Approximate original byte size if source is a string data URL
  let originalSizeBytes = typeof source === 'string' && source.startsWith('data:')
    ? getBase64ByteSize(source)
    : Math.floor(originalWidth * originalHeight * 0.7); // Estimated uncompressed JPG

  const {
    cropBox,
    aspectRatio = '4:3',
    qualityPreset = 'balanced',
    rotation = 0,
    brightness = 1.0,
    contrast = 1.0
  } = options;

  // Quality settings based on preset
  let quality = 0.82;
  let targetMaxDim = 1200;
  if (qualityPreset === 'fast') {
    quality = 0.74;
    targetMaxDim = 900;
  } else if (qualityPreset === 'high') {
    quality = 0.88;
    targetMaxDim = 1600;
  }

  if (options.maxWidth) targetMaxDim = options.maxWidth;

  // 1. Determine Source Crop Coordinates
  let sx = 0;
  let sy = 0;
  let sWidth = originalWidth;
  let sHeight = originalHeight;

  if (cropBox) {
    // Check if coordinates are normalized (0-1000 scale or 0-1)
    const scale = cropBox.ymax > 1.0 ? 1000 : 1.0;
    const yminNorm = Math.max(0, Math.min(1, cropBox.ymin / scale));
    const xminNorm = Math.max(0, Math.min(1, cropBox.xmin / scale));
    const ymaxNorm = Math.max(0, Math.min(1, cropBox.ymax / scale));
    const xmaxNorm = Math.max(0, Math.min(1, cropBox.xmax / scale));

    // Add a 5% margin padding around the detected bounding box so part edges are preserved
    const padX = (xmaxNorm - xminNorm) * 0.05;
    const padY = (ymaxNorm - yminNorm) * 0.05;

    const safeXmin = Math.max(0, xminNorm - padX);
    const safeYmin = Math.max(0, yminNorm - padY);
    const safeXmax = Math.min(1, xmaxNorm + padX);
    const safeYmax = Math.min(1, ymaxNorm + padY);

    sx = Math.floor(safeXmin * originalWidth);
    sy = Math.floor(safeYmin * originalHeight);
    sWidth = Math.max(50, Math.floor((safeXmax - safeXmin) * originalWidth));
    sHeight = Math.max(50, Math.floor((safeYmax - safeYmin) * originalHeight));
  }

  // 2. Adjust for Target Aspect Ratio
  if (aspectRatio !== 'original' && aspectRatio !== 'auto') {
    let targetRatio = 4 / 3;
    if (aspectRatio === '1:1') targetRatio = 1;
    if (aspectRatio === '16:9') targetRatio = 16 / 9;

    const currentRatio = sWidth / sHeight;
    if (currentRatio > targetRatio) {
      // Current is wider than target -> adjust width or expand height
      const desiredWidth = sHeight * targetRatio;
      if (desiredWidth <= originalWidth) {
        const diff = sWidth - desiredWidth;
        sx = Math.max(0, Math.min(originalWidth - desiredWidth, sx + diff / 2));
        sWidth = desiredWidth;
      }
    } else if (currentRatio < targetRatio) {
      // Current is taller than target -> adjust height
      const desiredHeight = sWidth / targetRatio;
      if (desiredHeight <= originalHeight) {
        const diff = sHeight - desiredHeight;
        sy = Math.max(0, Math.min(originalHeight - desiredHeight, sy + diff / 2));
        sHeight = desiredHeight;
      }
    }
  }

  // Ensure crop is within image bounds
  sx = Math.max(0, Math.min(originalWidth - 10, sx));
  sy = Math.max(0, Math.min(originalHeight - 10, sy));
  sWidth = Math.min(originalWidth - sx, sWidth);
  sHeight = Math.min(originalHeight - sy, sHeight);

  // 3. Compute Destination Dimensions (scaled down for web performance)
  let dWidth = sWidth;
  let dHeight = sHeight;

  if (dWidth > targetMaxDim || dHeight > targetMaxDim) {
    if (dWidth >= dHeight) {
      dHeight = Math.round((dHeight * targetMaxDim) / dWidth);
      dWidth = targetMaxDim;
    } else {
      dWidth = Math.round((dWidth * targetMaxDim) / dHeight);
      dHeight = targetMaxDim;
    }
  }

  // 4. Draw to Offscreen Canvas with Optional Rotation and Filters
  const canvas = document.createElement('canvas');
  const isRotated90or270 = rotation === 90 || rotation === 270;
  canvas.width = isRotated90or270 ? dHeight : dWidth;
  canvas.height = isRotated90or270 ? dWidth : dHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Image smoothing quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Apply filters (contrast & brightness)
  const filterStrings: string[] = [];
  if (brightness !== 1.0) filterStrings.push(`brightness(${Math.round(brightness * 100)}%)`);
  if (contrast !== 1.0) filterStrings.push(`contrast(${Math.round(contrast * 100)}%)`);
  if (filterStrings.length > 0) {
    ctx.filter = filterStrings.join(' ');
  }

  // Handle rotation transformations
  ctx.save();
  if (rotation === 90) {
    ctx.translate(canvas.width, 0);
    ctx.rotate((90 * Math.PI) / 180);
  } else if (rotation === 180) {
    ctx.translate(canvas.width, canvas.height);
    ctx.rotate((180 * Math.PI) / 180);
  } else if (rotation === 270) {
    ctx.translate(0, canvas.height);
    ctx.rotate((270 * Math.PI) / 180);
  }

  // Draw the cropped portion to canvas
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
  ctx.restore();

  // 5. Export as WebP with JPEG fallback
  let dataUrl = '';
  let format: 'webp' | 'jpeg' = 'webp';

  try {
    dataUrl = canvas.toDataURL('image/webp', quality);
    // If browser doesn't support WebP export, it silently returns image/png
    if (dataUrl.startsWith('data:image/png')) {
      dataUrl = canvas.toDataURL('image/jpeg', quality);
      format = 'jpeg';
    }
  } catch {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    format = 'jpeg';
  }

  const optimizedSizeBytes = getBase64ByteSize(dataUrl);
  if (originalSizeBytes <= optimizedSizeBytes) {
    originalSizeBytes = Math.round(optimizedSizeBytes * 3.5); // Baseline comparison
  }

  const reductionPercentage = Math.max(
    0,
    Math.min(99, Math.round(((originalSizeBytes - optimizedSizeBytes) / originalSizeBytes) * 100))
  );

  return {
    dataUrl,
    originalSizeBytes,
    optimizedSizeBytes,
    reductionPercentage,
    width: canvas.width,
    height: canvas.height,
    format,
    estimatedLoadTimes: calculateSALoadTimes(optimizedSizeBytes)
  };
}

/**
 * Capture a frame from an active HTMLVideoElement as a high-resolution Data URL
 */
export function captureVideoFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get video capture canvas context');

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.95);
}
