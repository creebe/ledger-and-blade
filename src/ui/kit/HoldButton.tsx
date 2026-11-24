import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../../store';

const HOLD_MS = 650;

/**
 * A button that fires only after it's held down, so a stray or double tap
 * can't trigger it. A short tap explains what to do. Keyboard users can
 * confirm with Enter or Space as normal.
 */
export function HoldButton({ onConfirm, children, hint, className }: { onConfirm: () => void; children: ReactNode; hint: string; className?: string }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const fired = useRef(false);
  const start = () => {
    fired.current = false;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      fired.current = true;
      setHolding(false);
      onConfirm();
    }, HOLD_MS);
  };
  const stop = (tapped: boolean) => {
    window.clearTimeout(timer.current);
    if (holding && tapped && !fired.current) useStore.getState().notify(hint);
    setHolding(false);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <button
      className={`hold-btn ${holding ? 'holding' : ''} ${className ?? ''}`}
      style={{ ['--hold' as string]: `${HOLD_MS}ms` }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        start();
      }}
      onPointerUp={() => stop(true)}
      onPointerCancel={() => stop(false)}
      onPointerMove={(e) => {
        // sliding off the button lets go without confirming
        if (!holding) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) stop(false);
      }}
      onClick={(e) => {
        // a click with no pointer behind it comes from a screen reader or switch control
        if (e.detail === 0) onConfirm();
      }}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onConfirm();
        }
      }}
    >
      <span className="hold-fill" aria-hidden />
      <span className="hold-label">{children}</span>
    </button>
  );
}
