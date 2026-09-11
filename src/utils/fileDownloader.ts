/**
 * Safe File Downloader and Document Opener
 * Prevents "about:blank#blocked" in Chrome when handling data: URLs and iframe sandboxes
 */

export function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const arr = dataUrl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error('Failed to convert Data URL to Blob:', err);
    return null;
  }
}

/**
 * Downloads a file safely to the user's computer without navigating top-level window
 */
export function downloadFileSafely(urlOrData: string, defaultFilename: string): void {
  if (!urlOrData) return;

  // Case 1: Data URL (Base64)
  if (urlOrData.startsWith('data:')) {
    const blob = dataUrlToBlob(urlOrData);
    if (!blob) return;

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);
    return;
  }

  // Case 2: Blob URL
  if (urlOrData.startsWith('blob:')) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = urlOrData;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Case 3: HTTP/HTTPS URL
  try {
    // Attempt fetch to force download without opening external tab if CORS permits
    fetch(urlOrData, { mode: 'cors' })
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = defaultFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      })
      .catch(() => {
        // Fallback for cross-origin restricted URLs
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = urlOrData;
        a.download = defaultFilename;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  } catch {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = urlOrData;
    a.download = defaultFilename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Safely opens a document or image without triggering "about:blank#blocked" in Chrome
 * Returns true if opened in a popup/tab, or false if it should fallback to an in-app viewer.
 */
export function openDocumentSafely(urlOrData: string, title = 'Dokumen Edukasi SPANJU'): boolean {
  if (!urlOrData) return false;

  // Case 1: Base64 Data URL - NEVER navigate directly to data: in top-level window!
  if (urlOrData.startsWith('data:')) {
    const blob = dataUrlToBlob(urlOrData);
    if (!blob) return false;

    const blobUrl = URL.createObjectURL(blob);
    const mimeType = blob.type || 'application/pdf';

    // Try opening a viewer window
    try {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="id">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title} - SPANJU</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #1e293b; font-family: system-ui, -apple-system, sans-serif; }
              .header { height: 48px; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #334155; }
              .header h1 { font-size: 13px; margin: 0; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
              .btn { background: #0d9488; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; border: none; }
              .btn:hover { background: #0f766e; }
              .frame-container { height: calc(100% - 48px); width: 100%; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📄 ${title}</h1>
              <a href="${blobUrl}" download="${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf" class="btn">📥 Unduh File</a>
            </div>
            <div class="frame-container">
              <iframe src="${blobUrl}" type="${mimeType}"></iframe>
            </div>
          </body>
          </html>
        `);
        win.document.close();
        return true;
      }
    } catch {
      // If blocked by iframe sandbox, return false to trigger in-app modal
      return false;
    }
    return false;
  }

  // Case 2: HTTP / HTTPS URL
  try {
    const win = window.open(urlOrData, '_blank', 'noopener,noreferrer');
    return !!win;
  } catch {
    return false;
  }
}
