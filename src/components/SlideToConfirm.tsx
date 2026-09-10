import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  busy?: boolean;
  accentColor?: string;
  resetKey?: unknown;
}

const HANDLE_SIZE = 48;
const COMPLETE_THRESHOLD = 0.82;

export default function SlideToConfirm({
  label,
  onConfirm,
  disabled = false,
  busy = false,
  accentColor = 'rgb(var(--color-brand))',
  resetKey,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startXRef = useRef(0);
  const maxDragRef = useRef(0);

  useEffect(() => {
    setDragX(0);
    setCompleted(false);
    setDragging(false);
  }, [resetKey]);

  function maxDrag() {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.clientWidth - HANDLE_SIZE - 8);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (disabled || busy || completed) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    maxDragRef.current = maxDrag();
    startXRef.current = e.clientX - dragX;
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const next = Math.min(maxDragRef.current, Math.max(0, e.clientX - startXRef.current));
    setDragX(next);
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    const max = maxDragRef.current || 1;
    if (dragX / max >= COMPLETE_THRESHOLD) {
      setDragX(max);
      setCompleted(true);
      onConfirm();
    } else {
      setDragX(0);
    }
  }

  const max = maxDragRef.current || maxDrag();
  const progress = max > 0 ? dragX / max : 0;

  return (
    <div
      ref={trackRef}
      className="relative h-14 w-full select-none overflow-hidden rounded-full border border-base-border bg-base-muted"
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${HANDLE_SIZE + dragX + 8}px`,
          background: accentColor,
          opacity: 0.14,
          transition: dragging ? 'none' : 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-700"
        style={{ opacity: Math.max(0, 1 - progress * 1.6) }}
      >
        {busy ? 'Processing…' : completed ? 'Done' : label}
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute left-1 top-1 flex items-center justify-center rounded-full shadow-soft"
        style={{
          width: HANDLE_SIZE,
          height: HANDLE_SIZE,
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          background: accentColor,
          cursor: disabled || busy || completed ? 'default' : 'grab',
          touchAction: 'none',
        }}
      >
        {busy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : completed ? (
          <span className="text-base font-bold text-white">✓</span>
        ) : (
          <span className="text-base font-bold text-white">→</span>
        )}
      </div>
    </div>
  );
}
