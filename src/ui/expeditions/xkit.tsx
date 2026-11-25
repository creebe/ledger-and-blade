// Small shared pieces for the expedition screens: bars, vitals and marks.
import { CHANGES, EXP_TUNING, HABITS, SCARS, type Member } from '../../engine';

/** HP or fatigue as a thin bar. Neutral when fine, colored only when it needs attention.
 * HP is good when full; fatigue is bad when full. */
export function XBar({ v, max, kind, label }: { v: number; max: number; kind: 'hp' | 'fatigue'; label?: string }) {
  const f = max > 0 ? Math.max(0, Math.min(1, v / max)) : 0;
  const F = EXP_TUNING.fatigue;
  const tone = kind === 'fatigue' ? (v >= F.spent ? 'bad' : v >= F.tired ? 'mid' : 'ok') : f < 0.3 ? 'bad' : f < 0.55 ? 'mid' : 'ok';
  return (
    <span className={`x-bar x-bar-${kind} x-tone-${tone}`} title={label} aria-label={label ?? `${kind === 'hp' ? 'Health' : 'Fatigue'} ${v} of ${max}`}>
      <span className="x-bar-fill" style={{ width: `${f * 100}%` }} />
    </span>
  );
}

/** A member's health, fatigue, Exposure and fever. */
export function Vitals({ m }: { m: Member }) {
  const F = EXP_TUNING.fatigue;
  return (
    <span className="x-vitals">
      <span className="x-vital">
        <small>Health</small>
        <XBar v={m.health} max={100} kind="hp" />
        <b className={m.health < 30 ? 'bad' : m.health < 55 ? 'warn' : ''}>{m.health}</b>
      </span>
      <span className="x-vital">
        <small>Fatigue</small>
        <XBar v={m.fatigue} max={100} kind="fatigue" />
        <b className={m.fatigue >= F.spent ? 'bad' : m.fatigue >= F.tired ? 'warn' : ''}>{m.fatigue}</b>
      </span>
      {(m.exposure ?? 0) > 0 && (
        <span className="x-vital x-exposure" title="Exposure: runoff and fever in the body. At 40, 70 and 95 it brings a Sink change.">
          <small>Exposure</small>
          <b>{m.exposure}</b>
        </span>
      )}
      {m.fever && (
        <span className="x-vital">
          <b className="warn">Sink fever, {m.fever.weeks} wk</b>
        </span>
      )}
    </span>
  );
}

/** Scars, Sink changes and habits, as small chips. */
export function Marks({ m }: { m: Member }) {
  const scars = m.scars ?? [];
  const changes = m.changes ?? [];
  const habits = m.habits ?? [];
  if (!scars.length && !habits.length && !changes.length) return null;
  return (
    <span className="x-marks">
      {scars.map((s) => (
        <span key={s} className="x-mark x-mark-scar" title={SCARS[s]?.text}>
          {SCARS[s]?.name ?? s}
        </span>
      ))}
      {changes.map((c) => (
        <span key={c} className="x-mark x-mark-good" title={CHANGES[c]?.text}>
          {CHANGES[c]?.name ?? c}
        </span>
      ))}
      {habits.map((h) => (
        <span key={h} className={`x-mark ${HABITS[h]?.good ? 'x-mark-good' : 'x-mark-bad'}`} title={HABITS[h]?.text}>
          {HABITS[h]?.name ?? h}
        </span>
      ))}
    </span>
  );
}

export const first = (d: { name: string }) => d.name.split(' ')[0];
