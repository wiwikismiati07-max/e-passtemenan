import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  AlertCircle,
  Loader2,
  FileText,
  RefreshCw,
  ExternalLink,
  Globe,
  FileCode,
} from 'lucide-react';
import { downloadFileSafely, openDocumentSafely } from '../../utils/fileDownloader';

// Configure worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  source: string; // Base64 data URL, Blob URL, or HTTP URL
  title?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  source,
  title = 'Dokumen PDF',
  onDownload,
  onPrint,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Active rendering task ref to cancel on rapid scale/page changes
  const renderTaskRef = useRef<any>(null);

  // Determine file archetype
  const isImage =
    source.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(source);

  const isDocxOrOffice =
    source.includes('wordprocessingml') ||
    source.includes('msword') ||
    source.includes('presentationml') ||
    source.includes('spreadsheetml') ||
    /\.(docx?|pptx?|xlsx?)$/i.test(source);

  const isExternalWebUrl =
    source.startsWith('http') && !source.toLowerCase().includes('.pdf');

  // Load PDF Document
  const loadPdf = useCallback(async () => {
    if (!source || isImage || isDocxOrOffice || isExternalWebUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCurrentPage(1);

    try {
      let loadingTask: any;

      if (source.startsWith('data:')) {
        const base64Index = source.indexOf(';base64,');
        if (base64Index === -1) {
          throw new Error('Format Data URL berkas tidak valid.');
        }
        const base64Str = source.substring(base64Index + 8).replace(/\s/g, '');
        const binaryStr = atob(base64Str);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        loadingTask = pdfjsLib.getDocument({ data: bytes });
      } else {
        try {
          const res = await fetch(source);
          if (!res.ok) throw new Error('Gagal mengambil berkas.');
          const buffer = await res.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        } catch {
          // Fallback to direct URL loading in pdfjs
          loadingTask = pdfjsLib.getDocument(source);
        }
      }

      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setIsLoading(false);
    } catch (err: any) {
      console.error('PDF.js loading error:', err);
      setErrorMsg(err?.message || 'Gagal memuat dokumen PDF.');
      setIsLoading(false);
    }
  }, [source, isImage, isDocxOrOffice, isExternalWebUrl]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  // Render Page to Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      setIsRendering(true);

      // Cancel previous task safely
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale, rotation });
        const pixelRatio = window.devicePixelRatio || 1;

        // Sharp high-resolution canvas size
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);

        // Display size
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        renderTaskRef.current = renderTask;
        await renderTask.promise;
        setIsRendering(false);
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('PDF page rendering interrupted:', err);
        }
        setIsRendering(false);
      }
    },
    [pdfDoc, scale, rotation]
  );

  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage]);

  // Auto-fit scale to container on initial document load
  useEffect(() => {
    if (pdfDoc && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      pdfDoc
        .getPage(1)
        .then((page: any) => {
          const vp = page.getViewport({ scale: 1 });
          if (vp.width > 0 && containerWidth > 0) {
            const fitScale = Math.min(1.6, Math.max(0.75, (containerWidth / vp.width) * 0.92));
            setScale(parseFloat(fitScale.toFixed(2)));
          }
        })
        .catch(() => {});
    }
  }, [pdfDoc]);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(parseFloat((prev + 0.2).toFixed(2)), 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(parseFloat((prev - 0.2).toFixed(2)), 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const ext = isImage ? 'png' : isDocxOrOffice ? 'docx' : 'pdf';
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}.${ext}`;
    downloadFileSafely(source, filename);
    onDownload?.();
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    // Fallback: If canvas is available, print the rendered canvas image cleanly
    if (canvasRef.current) {
      try {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const iframe = document.createElement('iframe');
        iframe.id = 'pdf-canvas-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '1024px';
        iframe.style.height = '768px';
        iframe.style.opacity = '0.01';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <title>${title}</title>
                <style>
                  @page { size: A4 portrait; margin: 10mm; }
                  body { margin: 0; padding: 0; background: #fff; display: flex; justify-content: center; }
                  img { max-width: 100%; height: auto; object-fit: contain; }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" />
              </body>
            </html>
          `);
          doc.close();

          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch {
              window.print();
            } finally {
              setTimeout(() => {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              }, 3000);
            }
          }, 350);
          return;
        }
      } catch (e) {
        console.warn('Canvas print error, falling back to window.print():', e);
      }
    }
    window.print();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  // 1. If Image
  if (isImage) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl overflow-auto min-h-[440px]">
        <img
          src={source}
          alt={title}
          className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-700"
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Gambar</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. If Office / DOCX
  if (isDocxOrOffice) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-2xl border border-slate-700 text-center min-h-[420px] space-y-4">
        <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <FileCode className="w-12 h-12 mx-auto" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dokumen ini tersimpan dalam format berkas Office / Word. Anda dapat mengunduhnya langsung untuk membuka naskah lengkap di Microsoft Word atau Google Docs.
          </p>
        </div>
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Berkas Office / Dokumen</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. If External Web URL
  if (isExternalWebUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-2xl border border-slate-700 text-center min-h-[420px] space-y-4">
        <div className="p-4 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
          <Globe className="w-12 h-12 mx-auto" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Materi ini terhubung ke portal informasi dan regulasi resmi Kementerian / Sekolah.
          </p>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-teal-300 font-mono break-all select-all">
            {source}
          </div>
        </div>
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => openDocumentSafely(source, title)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Kunjungi Laman Sumber Resmi</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. PDF Document Viewer (Canvas)
  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative select-none w-full"
      style={{
        height: isFullscreen ? '100vh' : '65vh',
        minHeight: '480px',
      }}
    >
      {/* Top Toolbar */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-white shrink-0 z-20 shadow-md">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors cursor-pointer text-slate-200"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 px-1">
            <span className="hidden sm:inline">Halaman</span>
            <input
              type="number"
              min={1}
              max={totalPages || 1}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setCurrentPage(val);
                }
              }}
              className="w-12 text-center py-0.5 px-1 bg-slate-800 border border-slate-700 rounded text-teal-400 font-bold text-xs"
            />
            <span className="text-slate-400">/ {totalPages || 1}</span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors cursor-pointer text-slate-200"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Zoom, Scale, Rotate */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={isLoading || scale <= 0.6}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer text-slate-200"
            title="Perkecil (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setScale(1.0)}
            className="text-xs font-semibold text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 cursor-pointer min-w-[50px] text-center"
            title="Reset Zoom ke 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={isLoading || scale >= 2.8}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer text-slate-200"
            title="Perbesar (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={handleRotate}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer text-slate-200 hidden sm:flex"
            title="Putar Dokumen 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer text-slate-200 hidden md:flex"
            title="Cetak Dokumen"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer text-slate-200"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            title="Unduh Berkas PDF Sekarang"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-900/95 relative">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <Loader2 className="w-9 h-9 text-teal-400 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Memuat Dokumen PDF...</p>
              <p className="text-xs text-slate-400">
                Merender halaman secara langsung tanpa pemblokiran browser
              </p>
            </div>
          </div>
        )}

        {/* Error Fallback */}
        {errorMsg && !isLoading && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md space-y-3 bg-slate-800/90 rounded-2xl border border-slate-700 text-slate-200">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Pratinjau Tidak Dapat Ditampilkan Langsung</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {errorMsg.includes('PDF')
                  ? errorMsg
                  : 'Berkas dokumen ini memerlukan unduhan langsung untuk dibuka secara optimal di perangkat Anda.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File PDF Sekarang</span>
              </button>

              <button
                type="button"
                onClick={loadPdf}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Muat Ulang</span>
              </button>
            </div>
          </div>
        )}

        {/* Canvas Display */}
        <div
          className={`transition-opacity duration-200 flex flex-col items-center ${
            isLoading || errorMsg ? 'hidden' : 'block'
          }`}
        >
          {isRendering && (
            <div className="absolute top-4 right-4 bg-slate-950/80 text-teal-300 text-[11px] px-3 py-1 rounded-full border border-teal-800/50 flex items-center gap-1.5 shadow-md z-10">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Merender halaman...</span>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="shadow-2xl rounded-lg bg-white mx-auto block max-w-none transition-transform"
          />
        </div>
      </div>

      {/* Quick Page Navigator Strip if document has multiple pages */}
      {totalPages > 1 && (
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-1.5 flex items-center justify-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Pindah cepat:</span>
          {Array.from({ length: Math.min(totalPages, 12) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              className={`w-6 h-6 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                currentPage === p
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
          {totalPages > 12 && (
            <span className="text-slate-500 text-xs font-bold px-1">...</span>
          )}
        </div>
      )}

      {/* Bottom Bar */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2 truncate max-w-xs sm:max-w-md">
          <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate text-slate-300 font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-teal-400 hidden sm:inline font-medium">
            ✓ PDF Canvas Renderer • Bebas Plugin
          </span>
          <button
            type="button"
            onClick={handleDownload}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
          >
            Unduh Berkas
          </button>
        </div>
      </div>
    </div>
  );
};
