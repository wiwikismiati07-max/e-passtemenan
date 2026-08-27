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
      try {
        srcUrl = URL.createObjectURL(fileOrBlobOrBase64);
        isObjectUrl = true;
      } catch (e) {
        // Fallback to FileReader if createObjectURL fails
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve({
            dataUrl,
            blob: fileOrBlobOrBase64 as Blob,
            sizeKB: Math.round((fileOrBlobOrBase64 as Blob).size / 1024),
            width: 800,
            height: 600,
          });
        };
        reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
        reader.readAsDataURL(fileOrBlobOrBase64 as Blob);
        return;
      }
    }

    const img = new Image();
    // Only set crossOrigin for remote HTTP/HTTPS URLs; never on blob: or data: URLs to prevent CORS block
    if (srcUrl.startsWith('http://') || srcUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

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
              try {
                URL.revokeObjectURL(srcUrl);
              } catch (_) {}
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
              const byteCharacters = atob(dataUrl.split(',')[1] || '');
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
        if (isObjectUrl) {
          try {
            URL.revokeObjectURL(srcUrl);
          } catch (_) {}
        }
        
        // Graceful fallback: return raw dataUrl if canvas operations fail
        if (typeof fileOrBlobOrBase64 === 'string') {
          resolve({
            dataUrl: fileOrBlobOrBase64,
            blob: new Blob([fileOrBlobOrBase64], { type: 'image/jpeg' }),
            sizeKB: Math.round(fileOrBlobOrBase64.length / 1024),
            width: 800,
            height: 600,
          });
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resolve({
              dataUrl,
              blob: fileOrBlobOrBase64 as Blob,
              sizeKB: Math.round((fileOrBlobOrBase64 as Blob).size / 1024),
              width: 800,
              height: 600,
            });
          };
          reader.onerror = () => reject(err);
          reader.readAsDataURL(fileOrBlobOrBase64 as Blob);
        }
      }
    };

    img.onerror = () => {
      if (isObjectUrl) {
        try {
          URL.revokeObjectURL(srcUrl);
        } catch (_) {}
      }

      // If Image fails to load object URL, fallback to FileReader
      if (typeof fileOrBlobOrBase64 !== 'string') {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve({
            dataUrl,
            blob: fileOrBlobOrBase64 as Blob,
            sizeKB: Math.round((fileOrBlobOrBase64 as Blob).size / 1024),
            width: 800,
            height: 600,
          });
        };
        reader.onerror = () => reject(new Error('Gagal memuat file gambar untuk dikompresi'));
        reader.readAsDataURL(fileOrBlobOrBase64 as Blob);
      } else {
        // String URL or Data URL
        resolve({
          dataUrl: fileOrBlobOrBase64,
          blob: new Blob([fileOrBlobOrBase64], { type: 'image/jpeg' }),
          sizeKB: Math.round(fileOrBlobOrBase64.length / 1024),
          width: 800,
          height: 600,
        });
      }
    };

    img.src = srcUrl;
  });
}
