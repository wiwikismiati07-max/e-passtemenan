/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image compression utility optimized for mobile HP cameras and laptops.
 * Resizes and compresses photos so they fit within lightweight storage limits (~40KB - 90KB)
 * while maintaining crystal-clear sharpness for official reports and printing.
 */

export interface CompressionResult {
  dataUrl: string;
  blob: Blob;
  sizeKB: number;
  width: number;
  height: number;
}

/**
 * Compress an image File or Blob or Base64 data URL.
 * Target max dimension: 1000px (optimal for A4 report print & mobile screens)
 * Target quality: 0.72 (clean, sharp, lightweight ~50-80KB)
 */
export async function compressImage(
  fileOrBlobOrBase64: File | Blob | string,
  maxDimension = 1000,
  quality = 0.72
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let isObjectUrl = false;

    if (typeof fileOrBlobOrBase64 === 'string') {
      srcUrl = fileOrBlobOrBase64;
    } else {
      srcUrl = URL.createObjectURL(fileOrBlobOrBase64);
      isObjectUrl = true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 600;

        // Calculate proportional aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (!ctx) {
          throw new Error('Canvas 2D context tidak tersedia');
        }

        // Fill white background for transparent images / JPEGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (isObjectUrl) {
              URL.revokeObjectURL(srcUrl);
            }

            if (blob) {
              resolve({
                dataUrl,
                blob,
                sizeKB: Math.round(blob.size / 1024),
                width,
                height,
              });
            } else {
              // Fallback if toBlob fails
              const byteCharacters = atob(dataUrl.split(',')[1]);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const fallbackBlob = new Blob([byteArray], { type: 'image/jpeg' });
              resolve({
                dataUrl,
                blob: fallbackBlob,
                sizeKB: Math.round(fallbackBlob.size / 1024),
                width,
                height,
              });
            }
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        if (isObjectUrl) URL.revokeObjectURL(srcUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (isObjectUrl) URL.revokeObjectURL(srcUrl);
      reject(new Error('Gagal memuat file gambar untuk dikompresi'));
    };

    img.src = srcUrl;
  });
}
