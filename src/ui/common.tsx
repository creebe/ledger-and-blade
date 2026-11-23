import { useState, type ReactNode } from 'react';
import { FACTIONS, TAGS, type FactionId } from '../engine';
import { useStore } from '../store';
import { chanceText } from './format';
import { Icon } from './icons';

export function Sheet({ title, children, onClose, footer }: { title: ReactNode; children: ReactNode; onClose?: () => void; footer?: ReactNode }) {
  const close = useStore((s) => s.close);
  return (
    <div className="sheet-backdrop" onClick={onClose ?? close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose ?? close} aria-label="Close">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Section({ title, children, right }: { title?: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="section">
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
        <Icon name="info" size={13} /> ? {candidates?.map((c) => TAGS[c]?.name ?? c).join(' / ')}
      </button>
    );
  }
  const t = id ? TAGS[id] : undefined;
  if (!t) return null;
  return (
    <span className={`tag ${t.kind} ${countered ? 'countered' : ''}`} onClick={() => setOpen(!open)} title={t.description}>
      <Icon name={t.id} size={13} />
      {t.name}
      {countered && ' ✓'}
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
