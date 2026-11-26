import React, { useState, type ReactNode } from 'react';
import { FACTIONS, TAGS, type FactionId } from '../../engine';
import { useStore } from '../../store';
import { chanceText } from './format';
import { Icon } from './icons';
import { Toast } from './Toast';
import { num } from './format';
import { type Blocked, blockedText } from './shortfall';

/** How deep this panel sits in the stack (0 = opened from a main screen). */
export const SheetDepth = React.createContext(0);

/**
 * Every panel opens the same way: full height, the screen behind dimmed.
 * A panel opened from another panel keeps its level: it shows only "Back",
 * which returns to the panel underneath. Only the bottom panel has ✕.
 * (The owner lost a whole week report by tapping ✕ on a squad's log.)
 */
export function Sheet({ title, children, onClose, footer }: { title: ReactNode; children: ReactNode; onClose?: () => void; footer?: ReactNode }) {
  const close = useStore((s) => s.close);
  const depth = React.useContext(SheetDepth);
  const nested = depth > 0 && !onClose;
  // the toast shows inside the topmost sheet, just above its footer
  const isTop = useStore((s) => s.sheets.filter((x) => x.kind !== 'confirm').length - 1 === depth);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const dismiss = onClose ?? close;
  const dismissRef = React.useRef(dismiss);
  dismissRef.current = dismiss;
  const swipeDismiss = React.useCallback(() => dismissRef.current(), []);
  useSwipeDown(sheetRef, backdropRef, swipeDismiss);
  return (
    <div className="sheet-backdrop" ref={backdropRef} onClick={onClose ?? close}>
      <div className="sheet" ref={sheetRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={`sheet-head ${nested ? 'sheet-head-nested' : ''}`}>
          {nested && (
            <button className="back-btn" onClick={close} aria-label="Back">
              <Icon name="chevron" size={18} style={{ transform: 'rotate(180deg)' }} /> Back
            </button>
          )}
          <h2>{title}</h2>
          {!nested && (
            <button className="icon-btn" onClick={onClose ?? close} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          )}
        </div>
        <div className="sheet-body">{children}</div>
        {isTop && (
          <div className="sheet-toast">
            <Toast where="in-sheet" />
          </div>
        )}
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Swipe a panel down to close it (one level, like Back or ✕). The drag only
 * starts on the panel's header, or anywhere once its body is scrolled to the
 * top and the finger moves down; otherwise the body scrolls as usual.
 * Confirmations are not panels, so a swipe can't dismiss one.
 */
function useSwipeDown(sheetRef: React.RefObject<HTMLDivElement>, backdropRef: React.RefObject<HTMLDivElement>, onDismiss: () => void) {
  React.useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    let startY = 0;
    let startT = 0;
    let dy = 0;
    let state: 'idle' | 'maybe' | 'drag' | 'scroll' = 'idle';
    const body = () => sheet.querySelector<HTMLElement>('.sheet-body');
    const set = (y: number, animate: boolean) => {
      sheet.style.transition = animate ? 'transform 0.2s ease-out' : 'none';
      sheet.style.transform = y ? `translateY(${y}px)` : '';
      const bd = backdropRef.current;
      if (bd) {
        bd.style.transition = animate ? 'opacity 0.2s ease-out' : 'none';
        bd.style.opacity = y ? String(Math.max(0.35, 1 - y / (sheet.offsetHeight || 600))) : '';
      }
    };
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.target as HTMLElement;
      // controls that drag on their own (sliders, text fields) keep their gesture
      if (t.closest('input, textarea, select, [data-no-swipe]')) return;
      const onHead = !!t.closest('.sheet-head');
      const atTop = (body()?.scrollTop ?? 0) <= 0;
      state = onHead || atTop ? 'maybe' : 'idle';
      startY = e.touches[0].clientY;
      startT = performance.now();
      dy = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (state === 'idle' || state === 'scroll') return;
      dy = e.touches[0].clientY - startY;
      if (state === 'maybe') {
        if (dy < -4) {
          state = 'scroll'; // moving up: an ordinary scroll
          return;
        }
        if (dy < 10) return;
        state = 'drag';
      }
      e.preventDefault();
      set(Math.max(0, dy), false);
    };
    const onEnd = () => {
      if (state !== 'drag') {
        state = 'idle';
        return;
      }
      state = 'idle';
      const speed = dy / Math.max(1, performance.now() - startT);
      if (dy > 120 || (dy > 50 && speed > 0.6)) {
        set(sheet.offsetHeight || 800, true);
        window.setTimeout(onDismiss, 180);
      } else set(0, true);
    };
    sheet.addEventListener('touchstart', onStart, { passive: true });
    sheet.addEventListener('touchmove', onMove, { passive: false });
    sheet.addEventListener('touchend', onEnd);
    sheet.addEventListener('touchcancel', onEnd);
    return () => {
      sheet.removeEventListener('touchstart', onStart);
      sheet.removeEventListener('touchmove', onMove);
      sheet.removeEventListener('touchend', onEnd);
      sheet.removeEventListener('touchcancel', onEnd);
    };
  }, [sheetRef, backdropRef, onDismiss]);
}

export function Section({ title, children, right, guide }: { title?: ReactNode; children: ReactNode; right?: ReactNode; guide?: string }) {
  return (
    <section className="section" data-guide={guide}>
      {(title || right) && (
        <div className="section-head">
          {title && <h3>{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

/** A success chance bar. When min != max the uncertain band is hatched. */
export function ChanceBar({ min, max, animate }: { min: number; max: number; animate?: boolean }) {
  const tone = min >= 0.7 ? 'good' : max < 0.4 ? 'bad' : 'mid';
  return (
    <div className={`chance ${tone} ${animate ? 'animate' : ''}`} aria-label={`Success chance ${chanceText(min, max)}`}>
      <div className="chance-fill" style={{ width: `${min * 100}%` }} />
      {max > min + 0.005 && <div className="chance-range" style={{ left: `${min * 100}%`, width: `${(max - min) * 100}%` }} />}
      <span className="chance-label">{chanceText(min, max)}</span>
    </div>
  );
}

export function Meter({ value, max = 100, tone, label }: { value: number; max?: number; tone?: 'good' | 'bad' | 'mid' | 'info'; label?: string }) {
  return (
    <div className="meter" title={label}>
      <div className={`meter-fill ${tone ?? ''}`} style={{ width: `${Math.max(0, Math.min(1, value / max)) * 100}%` }} />
    </div>
  );
}

/** -100..100 standing bar */
export function StandingBar({ value }: { value: number }) {
  const left = value < 0 ? 50 + value / 2 : 50;
  const width = Math.abs(value) / 2;
  return (
    <div className="standing">
      <div className="standing-mid" />
      <div className={`standing-fill ${value < 0 ? 'neg' : 'pos'}`} style={{ left: `${left}%`, width: `${width}%` }} />
    </div>
  );
}

export function TagChip({ id, hidden, candidates, countered, onClick }: { id?: string; hidden?: boolean; candidates?: string[]; countered?: boolean; onClick?: () => void }) {
  const [open, setOpen] = useState(false);
  if (hidden) {
    return (
      <button className="tag hidden" onClick={onClick}>
        <Icon name="info" size={14} /> ? {candidates?.map((c) => TAGS[c]?.name ?? c).join(' / ')}
      </button>
    );
  }
  const t = id ? TAGS[id] : undefined;
  if (!t) return null;
  return (
    <span className={`tag ${t.kind} ${countered ? 'countered' : ''}`} onClick={() => setOpen(!open)} title={t.description}>
      <Icon name={t.id} size={14} />
      {t.name}
      {countered && <Icon name="check" size={12} />}
      {open && <span className="tag-tip">{t.description}</span>}
    </span>
  );
}

export function FactionBadge({ id }: { id: FactionId }) {
  const f = FACTIONS[id];
  return (
    <span className="faction-badge" style={{ ['--fc' as string]: f.color }}>
      <Icon name={id} size={12} /> {f.short}
    </span>
  );
}

export function ThreatPips({ value }: { value: number }) {
  return (
    <span className="threat" aria-label={`Threat ${value}`}>
      {Array.from({ length: 10 }, (_, i) => (
        <i key={i} className={i < value ? 'on' : ''} />
      ))}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)} role="tab" aria-selected={o.value === value}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * A button that never fails silently: when `blocked` holds a reason, it looks
 * unavailable but a tap explains why instead of doing nothing.
 */
export function Btn({ blocked, onClick, className, children, title, ...rest }: { blocked?: Blocked; onClick: () => void; className?: string; children: ReactNode; title?: string; style?: React.CSSProperties }) {
  const text = blockedText(blocked);
  return (
    <button
      {...rest}
      className={`${className ?? 'btn'} ${blocked ? 'is-blocked' : ''}`}
      aria-disabled={blocked ? true : undefined}
      title={text || title}
      onClick={() => (blocked ? useStore.getState().notify(text!, typeof blocked === 'object' ? blocked.action : undefined) : onClick())}
    >
      {children}
    </button>
  );
}

/** A price in crowns: the number, then a small gold coin (the coin carries the crowns color). */
export function Price({ n }: { n: number }) {
  return (
    <span className="price">
      {num(n)}
      <Icon name="coin" size={12} />
    </span>
  );
}
