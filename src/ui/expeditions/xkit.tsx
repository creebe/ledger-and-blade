// Small shared pieces for the expeditions trial screens.
import type { ReactNode } from 'react';
import { delverMaxHp, DELVER_PROFS, HABITS, SCARS, type Delver } from '../../engine';
import { useX } from '../../expStore';
import { Icon } from '../kit/icons';
import { ProfSilhouette } from './Silhouette';

/** A full-height sheet with Back, the same look as the classic sheets. */
export function XSheet({ title, children, footer, onBack }: { title: ReactNode; children: ReactNode; footer?: ReactNode; onBack?: () => void }) {
  const close = useX((s) => s.close);
  return (
    <div className="sheet-backdrop" onClick={onBack ?? close}>
      <div className="sheet x-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet-head">
          <button className="back-btn" onClick={onBack ?? close} aria-label="Back">
            <Icon name="chevron" size={18} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
          <h2>{title}</h2>
          <span style={{ width: 40 }} />
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

/** HP or grit as a thin bar. Neutral when fine, colored only when it needs attention. */
export function XBar({ v, max, kind, label }: { v: number; max: number; kind: 'hp' | 'grit'; label?: string }) {
  const f = max > 0 ? Math.max(0, Math.min(1, v / max)) : 0;
  const tone = f < 0.3 ? 'bad' : f < 0.55 ? 'mid' : 'ok';
  return (
    <span className={`x-bar x-bar-${kind} x-tone-${tone}`} title={label} aria-label={label ?? `${kind === 'hp' ? 'HP' : 'Grit'} ${v} of ${max}`}>
      <span className="x-bar-fill" style={{ width: `${f * 100}%` }} />
    </span>
  );
}

export function Vitals({ d }: { d: Delver }) {
  const max = delverMaxHp(d);
  return (
    <span className="x-vitals">
      <span className="x-vital">
        <small>HP</small>
        <XBar v={d.hp} max={max} kind="hp" />
        <b className={d.hp < max * 0.3 ? 'bad' : d.hp < max * 0.55 ? 'warn' : ''}>
          {d.hp}/{max}
        </b>
      </span>
      <span className="x-vital">
        <small>Grit</small>
        <XBar v={d.grit} max={100} kind="grit" />
        <b className={d.grit < 30 ? 'bad' : d.grit < 55 ? 'warn' : ''}>{d.grit}</b>
      </span>
    </span>
  );
}

export function Marks({ d }: { d: Delver }) {
  if (!d.scars.length && !d.habits.length) return null;
  return (
    <span className="x-marks">
      {d.scars.map((s) => (
        <span key={s} className="x-mark x-mark-scar" title={SCARS[s].text}>
          {SCARS[s].name}
        </span>
      ))}
      {d.habits.map((h) => (
        <span key={h} className={`x-mark ${HABITS[h].good ? 'x-mark-good' : 'x-mark-bad'}`} title={HABITS[h].text}>
          {HABITS[h].name}
        </span>
      ))}
    </span>
  );
}

/** A member as a card. Tappable when it opens something. */
export function MemberCard({ d, onClick, right, children }: { d: Delver; onClick?: () => void; right?: ReactNode; children?: ReactNode }) {
  return (
    <div
      className={`x-member card ${onClick ? 'tappable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && onClick() : undefined}
    >
      <ProfSilhouette prof={d.prof} />
      <span className="x-member-main">
        <span className="x-member-name">
          <b>{d.epithet ?? d.name}</b>
          <small className="muted">
            {DELVER_PROFS[d.prof].name} · level {d.level}
          </small>
        </span>
        <Vitals d={d} />
        <Marks d={d} />
        {children}
      </span>
      {right}
    </div>
  );
}

export const first = (d: { name: string }) => d.name.split(' ')[0];

/** A blocked reason when the guild is short of crowns, with a way to get more. */
export function xShort(g: { crowns: number; goods: Partial<Record<string, number>> }, need: number, what: string) {
  if (g.crowns >= need) return undefined;
  const hasGoods = Object.values(g.goods).some((n) => (n ?? 0) > 0);
  return {
    text: `${what} costs ${need} crowns, and the guild has ${g.crowns}.`,
    action: hasGoods ? { label: 'Sell loot', run: () => useX.getState().setTab('market') } : { label: 'Plan an expedition', run: () => useX.getState().setView('prep') },
  };
}
