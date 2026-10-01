import React, { useState, useRef, useCallback } from 'react';

interface SplitImageSliderProps {
  originalSrc: string;
  annotatedSrc: string;
  originalLabel?: string;
  annotatedLabel?: string;
}

export const SplitImageSlider: React.FC<SplitImageSliderProps> = ({
  originalSrc,
  annotatedSrc,
  originalLabel = 'Original Capture',
  annotatedLabel = 'AI Telemetry Overlay',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  }, []);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      className="relative w-full aspect-[16/10] bg-black rounded-lg overflow-hidden select-none border border-[#1E3A5F] shadow-2xl cursor-ew-resize"
    >
      {/* Annotated Background (Underneath) */}
      <img
        src={annotatedSrc}
        alt={annotatedLabel}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Original Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={originalSrc}
          alt={originalLabel}
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
            maxWidth: 'none',
          }}
        />
      </div>

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle circle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0B1528] border-2 border-sky-400 flex items-center justify-center shadow-lg pointer-events-auto cursor-ew-resize hover:scale-110 transition-transform"
        >
          <div className="flex gap-1">
            <span className="w-0.5 h-3 bg-sky-400 rounded-full"></span>
            <span className="w-0.5 h-3 bg-sky-400 rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Floating Labels */}
      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-300 pointer-events-none">
        {originalLabel}
      </div>
      <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-sky-300 pointer-events-none">
        {annotatedLabel}
      </div>
    </div>
  );
};
