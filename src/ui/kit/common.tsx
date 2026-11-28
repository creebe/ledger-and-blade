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
export function Sheet({ title, children, onClose, onBack, footer }: { title: ReactNode; children: ReactNode; onClose?: () => void; onBack?: () => void; footer?: ReactNode }) {
  const storeClose = useStore((s) => s.close);
  // a panel outside the stack (the playtest note) brings its own Back
  const close = onBack ?? storeClose;
  const depth = React.useContext(SheetDepth);
  const nested = (depth > 0 && !onClose) || !!onBack;
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
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let dy = 0;
    let timer: number | undefined;
    let state: 'idle' | 'maybe' | 'drag' | 'scroll' | 'closing' = 'idle';
    // the dimmed screen behind lightens as the panel goes; the panel itself stays opaque
    // (fading the whole backdrop element let the screen underneath show through the panel's text)
    let dim: [string, number] | undefined;
    const set = (y: number, animate: boolean) => {
      sheet.style.transition = animate ? 'transform 0.2s ease-out' : 'none';
      sheet.style.transform = y ? `translateY(${y}px)` : '';
      const bd = backdropRef.current;
      if (!bd) return;
      if (!y) {
        bd.style.transition = animate ? 'background-color 0.2s ease-out' : 'none';
        bd.style.backgroundColor = '';
        dim = undefined;
        return;
      }
      if (!dim) {
        const m = getComputedStyle(bd).backgroundColor.match(/rgba?\(([^,]+),([^,]+),([^,)]+)(?:,([^)]+))?\)/);
        dim = m ? [`${m[1]},${m[2]},${m[3]}`, m[4] === undefined ? 1 : Number(m[4])] : ['0,0,0', 0.6];
      }
      bd.style.transition = animate ? 'background-color 0.2s ease-out' : 'none';
      bd.style.backgroundColor = `rgba(${dim[0]},${(dim[1] * Math.max(0, 1 - y / (sheet.offsetHeight || 600))).toFixed(3)})`;
    };
    // scrolled to the top means every scroller between the finger and the panel, not just the body
    const scrolledDown = (t: HTMLElement) => {
      for (let el: HTMLElement | null = t; el && el !== sheet; el = el.parentElement) if (el.scrollTop > 0) return true;
      return false;
    };
    const onStart = (e: TouchEvent) => {
      if (state === 'closing') return;
      state = 'idle';
      if (e.touches.length !== 1) return;
      const t = e.target as HTMLElement;
      // controls that drag on their own (sliders, text fields) keep their gesture;
      // the footer holds the press-and-hold End Week, which a drift must not turn into a close
      if (t.closest('input, textarea, select, [data-no-swipe], .sheet-foot')) return;
      const onHead = !!t.closest('.sheet-head');
      state = onHead || !scrolledDown(t) ? 'maybe' : 'idle';
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startT = performance.now();
      dy = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (state !== 'maybe' && state !== 'drag') return;
      if (e.touches.length !== 1) {
        // a second finger: give the gesture back
        state = 'scroll';
        set(0, true);
        return;
      }
      dy = e.touches[0].clientY - startY;
      const dx = e.touches[0].clientX - startX;
      if (state === 'maybe') {
        if (dy < -4 || Math.abs(dx) > Math.abs(dy)) {
          state = 'scroll'; // moving up or sideways: an ordinary scroll (strip map, odds row)
          return;
        }
        if (!e.cancelable) {
          state = 'scroll'; // the browser has already started scrolling
          return;
        }
        // hold the page still from the first downward pixel, so iOS doesn't start its rubber-band
        if (dy > 2) e.preventDefault();
        if (dy < 10) return;
        state = 'drag';
      }
      if (e.cancelable) e.preventDefault();
      set(Math.max(0, dy), false);
    };
    const onEnd = () => {
      if (state !== 'drag') {
        if (state !== 'closing') state = 'idle';
        return;
      }
      const speed = dy / Math.max(1, performance.now() - startT);
      if (dy > 120 || (dy > 50 && speed > 0.6)) {
        state = 'closing';
        set(sheet.offsetHeight || 800, true);
        timer = window.setTimeout(() => {
          onDismiss();
          // if the panel is still here (its close was refused or it was replaced in place), bring it back
          state = 'idle';
          if (sheet.isConnected) set(0, false);
        }, 180);
      } else {
        state = 'idle';
        set(0, true);
      }
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
      window.clearTimeout(timer);
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
