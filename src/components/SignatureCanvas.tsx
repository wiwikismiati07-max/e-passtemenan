import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, Check, PenLine, Sparkles, CheckCircle2, Trash2 } from 'lucide-react';

interface SignatureCanvasProps {
  label?: string;
  initialValue?: string;
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  height?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  label = 'Tanda Tangan Digital (Layar Sentuh / Mouse)',
  initialValue = '',
  onSave,
  onClear,
  height = 160,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const prevInitialValueRef = useRef<string | undefined>(undefined);

  const [hasSignature, setHasSignature] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#0f172a'); // Default formal deep ink
  const [strokeWidth, setStrokeWidth] = useState(3.2); // Smooth thick line by default
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Redraw or load initial value only when initialValue actually changes
  const renderSignature = useCallback((val?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2.5);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (val && val.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = val;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
      setHasSignature(false);
    }
  }, []);

  useEffect(() => {
    // Only reload from initialValue if it actually changed
    if (prevInitialValueRef.current !== initialValue) {
      prevInitialValueRef.current = initialValue;
      renderSignature(initialValue);
    }
  }, [initialValue, renderSignature]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      renderSignature(prevInitialValueRef.current);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderSignature]);

  const getCanvasPointFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const drawPoint = (point: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    pointsRef.current.push(point);
    const pts = pointsRef.current;

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pts.length === 1) {
      // First point: render smooth dot
      ctx.beginPath();
      ctx.arc(point.x, point.y, strokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (pts.length === 2) {
      // Second point: line from first to midpoint
      const p0 = pts[0];
      const p1 = pts[1];
      const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(mid.x, mid.y);
      ctx.stroke();
    } else {
      // 3 or more points: continuous quadratic bezier curve connecting midpoints
      const p0 = pts[pts.length - 3];
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];

      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.beginPath();
      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.stroke();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    pointsRef.current = [];

    const point = getCanvasPointFromClient(e.clientX, e.clientY);
    drawPoint(point);
    setHasSignature(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    // Process high-frequency coalesced events if available for ultra-smooth lines
    const nativeEvent = e.nativeEvent as any;
    if (nativeEvent && typeof nativeEvent.getCoalescedEvents === 'function') {
      const coalescedEvents: PointerEvent[] = nativeEvent.getCoalescedEvents();
      if (coalescedEvents && coalescedEvents.length > 0) {
        for (let i = 0; i < coalescedEvents.length; i++) {
          const pt = getCanvasPointFromClient(
            coalescedEvents[i].clientX,
            coalescedEvents[i].clientY
          );
          drawPoint(pt);
        }
        return;
      }
    }

    const currentPoint = getCanvasPointFromClient(e.clientX, e.clientY);
    drawPoint(currentPoint);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // Finish last segment
    const pts = pointsRef.current;
    if (pts.length >= 2) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const pLast = pts[pts.length - 1];
          const pPrev = pts[pts.length - 2];
          const mid = { x: (pPrev.x + pLast.x) / 2, y: (pPrev.y + pLast.y) / 2 };
          ctx.beginPath();
          ctx.moveTo(mid.x, mid.y);
          ctx.lineTo(pLast.x, pLast.y);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      }
    }
    pointsRef.current = [];

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    prevInitialValueRef.current = dataUrl;
    onSave(dataUrl);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    pointsRef.current = [];
    prevInitialValueRef.current = '';
    
    // Notify parent of empty signature
    onSave('');
    if (onClear) onClear();
  };

  return (
    <div className="flex flex-col gap-2 w-full" ref={containerRef}>
      {/* Label and Tools Header */}
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{label}</span>
        </label>
        {hasSignature && (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tanda Tangan Siap</span>
          </span>
        )}
      </div>

      {/* Touch Canvas Box */}
      <div className="relative border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 rounded-2xl bg-white dark:bg-slate-900/90 p-1.5 shadow-inner transition-colors">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ height: `${height}px`, touchAction: 'none' }}
          className="w-full bg-slate-50/70 dark:bg-slate-950/70 rounded-xl cursor-crosshair select-none block"
        />

        {/* Placeholder Guide if Empty */}
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500 text-xs gap-1.5 px-4 text-center">
            <PenLine className="w-5 h-5 text-indigo-500/80 animate-pulse" />
            <span className="font-medium">
              Goreskan tanda tangan di sini (Sentuh Layar HP / Tablet / Touchscreen Laptop / Mouse)
            </span>
            <span className="text-[10px] text-slate-400">
              Garis halus, tebal, mulus dan tidak putus-putus
            </span>
          </div>
        )}

        {/* Baseline guide line */}
        <div className="absolute left-6 right-6 bottom-7 border-b border-dashed border-slate-300/60 dark:border-slate-700 pointer-events-none" />
      </div>

      {/* Control bar: Ink selection & Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tinta:</span>
          <div className="flex items-center gap-1.5">
            {[
              { color: '#0f172a', name: 'Hitam Dinas' },
              { color: '#1e3a8a', name: 'Biru Resmi' },
              { color: '#0369a1', name: 'Biru Cerah' },
              { color: '#0f766e', name: 'Teal' },
              { color: '#b91c1c', name: 'Merah' },
            ].map((item) => (
              <button
                key={item.color}
                type="button"
                onClick={() => setStrokeColor(item.color)}
                className={`w-5 h-5 rounded-full border transition-all ${
                  strokeColor === item.color
                    ? 'scale-125 border-indigo-600 dark:border-white shadow-sm ring-2 ring-indigo-200'
                    : 'border-slate-300 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: item.color }}
                title={item.name}
              />
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Stroke thickness */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500">Ketebalan:</span>
            {[
              { label: 'Halus', val: 2.2 },
              { label: 'Sedang (Standar)', val: 3.2 },
              { label: 'Tebal', val: 4.5 },
            ].map((w) => (
              <button
                key={w.val}
                type="button"
                onClick={() => setStrokeWidth(w.val)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  strokeWidth === w.val
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSavedNotice && (
            <span className="text-[10px] text-emerald-600 font-bold animate-fadeIn">
              Tersimpan Otomatis ✓
            </span>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Hapus / Ulang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
