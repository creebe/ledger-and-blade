// Shared visual building blocks: approach colors, portraits, strength bars,
// item icons, odds pills. The same color always means the same thing.
import { useMemo } from 'react';
import {
  APPROACH_INFO,
  bestApproaches,
  living,
  memberScore,
  PROFESSIONS,
  previewMission,
  TAGS,
  type Approach,
  type Contract,
  type GameState,
  type ItemDef,
  type Member,
  type ProfessionId,
} from '../../engine';
import { Icon } from './icons';
import { pct } from './format';

export const APPROACHES: Approach[] = ['assault', 'stealth', 'guile', 'endurance', 'arcana'];

/** Each profession takes the color of the approach it is best at. */
export const PROFESSION_APPROACH: Record<ProfessionId, Approach> = {
  vanguard: 'assault',
  skirmisher: 'endurance',
  marksman: 'assault',
  arcanist: 'arcana',
  chaplain: 'endurance',
  scout: 'stealth',
  envoy: 'guile',
  infiltrator: 'stealth',
};

export const ap = (a: Approach) => `var(--ap-${a})`;

export function ApproachChip({ a, on, onClick, small }: { a: Approach; on?: boolean; onClick?: () => void; small?: boolean }) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag className={`ap-chip ${on ? 'on' : ''} ${small ? 'small' : ''}`} style={{ ['--c' as string]: ap(a) }} onClick={onClick} title={APPROACH_INFO[a].blurb}>
      <Icon name={a} size={small ? 13 : 15} />
      <span>{APPROACH_INFO[a].name}</span>
    </Tag>
  );
}

/** Short, scannable readiness for a member: what they can do right now. */
export function readiness(m: Member, g?: GameState): { text: string; tone: '' | 'mid' | 'bad' } {
  if (m.status === 'dead') return { text: 'Dead', tone: 'bad' };
  if (m.status === 'left') return { text: 'Gone', tone: '' };
  if (m.status === 'mission') {
    const ms = g?.missions.find((x) => x.id === m.missionId);
    if (ms && ms.dispatchedWeek === g!.week && !ms.report) return { text: 'Leaving this week', tone: '' };
    return { text: ms ? `Away · back wk ${ms.returnWeek}` : 'Away', tone: '' };
  }
  if (m.health < 40) return { text: `Wounded (${m.health} HP)`, tone: 'bad' };
  if (m.health < 70) return { text: `Hurt (${m.health} HP)`, tone: 'mid' };
  if (m.fatigue > 50) return { text: 'Exhausted', tone: 'mid' };
  if (m.loyalty < 30) return { text: 'Disloyal', tone: 'bad' };
  if (m.morale < 30) return { text: 'Low morale', tone: 'mid' };
  return { text: 'Ready', tone: '' };
}

/** A member's portrait: their Profession's symbol, plus one dot only when something needs attention. */
export function Portrait({ m, size = 40, showStatus = true }: { m: Member; size?: number; showStatus?: boolean }) {
  const r = readiness(m);
  return (
    <span className={`portrait ${m.status === 'dead' ? 'dead' : ''}`} style={{ width: size, height: size }} title={`${m.name}, ${PROFESSIONS[m.profession].name}`}>
      <Icon name={m.profession} size={Math.round(size * 0.55)} />
      {showStatus && (r.tone || m.status === 'mission') && <span className={`portrait-dot ${r.tone || 'away'}`} />}
    </span>
  );
}

/** A member's two strongest approaches, as plain text. */
export function TopStrengths({ g, m }: { g: GameState; m: Member }) {
  const scores = APPROACHES.map((a) => ({ a, s: memberScore(g, m, a, { tags: [], countered: new Set(), members: [m] }).score })).sort((x, y) => y.s - x.s);
  return (
    <span className="top-strengths">
      {scores.slice(0, 2).map(({ a, s }) => (
        <span key={a} className="meta">
          <Icon name={a} size={13} />
          {APPROACH_INFO[a].name} {s.toFixed(0)}
        </span>
      ))}
    </span>
  );
}

/** Five small bars: how good this member is at each approach (current gear, no tags). */
export function ApproachBars({ g, m, highlight }: { g: GameState; m: Member; highlight?: Approach[] }) {
  const scores = APPROACHES.map((a) => ({ a, s: memberScore(g, m, a, { tags: [], countered: new Set(), members: [m] }).score }));
  return (
    <span className="ap-bars" aria-label="Approach strengths">
      {scores.map(({ a, s }) => (
        <span key={a} className={`ap-bar ${highlight && !highlight.includes(a) ? 'dim' : ''}`} style={{ ['--c' as string]: ap(a) }} title={`${APPROACH_INFO[a].name}: ${s.toFixed(0)}`}>
          <Icon name={a} size={11} />
          <span className="ap-bar-track">
            <span className="ap-bar-fill" style={{ width: `${Math.min(100, (s / (a === 'assault' ? 26 : 20)) * 100)}%` }} />
          </span>
        </span>
      ))}
    </span>
  );
}

function slotIcon(def: ItemDef) {
  if (def.slot === 'weapon') return def.ranged ? 'marksman' : def.bonus?.arcana ? 'arcanist' : 'weapon';
  if (def.slot === 'armor') return 'armor';
  if (def.slot === 'trinket') return 'trinket';
  return 'flask';
}

export function ItemIcon({ def, size = 22 }: { def: ItemDef; size?: number }) {
  const el = def.element ?? def.grantsElement;
  return (
    <span className="item-icon" style={{ ['--el' as string]: el ? `var(--el-${el})` : undefined, width: size + 12, height: size + 12 }}>
      <Icon name={slotIcon(def)} size={size} />
      {el && (
        <span className="item-el">
          <Icon name={el} size={11} />
        </span>
      )}
    </span>
  );
}

/** Compact stat chips for an item: damage, element, armor, bonuses, counters. */
export function ItemStats({ def }: { def: ItemDef }) {
  const chips: { key: string; icon?: string; text: string; el?: string }[] = [];
  if (def.slot === 'weapon') chips.push({ key: 'dmg', text: `${cap(def.damage)} ${def.power}` });
  const el = def.element ?? def.grantsElement;
  if (el) chips.push({ key: 'el', icon: el, text: cap(el), el: `var(--el-${el})` });
  if (def.slot === 'armor') chips.push({ key: 'arm', icon: 'armor', text: `${cap(def.weight)} · ${def.protection}` });
  for (const [a, v] of Object.entries(def.bonus ?? {})) chips.push({ key: a, icon: a, text: `${v! > 0 ? '+' : ''}${v} ${APPROACH_INFO[a as Approach].name}` });
  for (const t of def.counters ?? []) chips.push({ key: t, icon: t, text: `vs ${TAGS[t]?.name}` });
  if (def.mending) chips.push({ key: 'mend', icon: 'heart', text: 'Saves a life' });
  return (
    <span className="stat-chips">
      {chips.map((c) => (
        <span key={c.key} className={`stat-chip ${c.el ? 'el' : ''}`} style={c.el ? { ['--el' as string]: c.el } : undefined}>
          {c.icon && <Icon name={c.icon} size={12} />}
          {c.text}
        </span>
      ))}
    </span>
  );
}

const cap = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : '');

export function OddsPill({ min, max, label }: { min: number; max: number; label?: string }) {
  const tone = min >= 0.7 ? 'good' : max < 0.4 ? 'bad' : 'mid';
  const txt = Math.round(min * 100) === Math.round(max * 100) ? pct(min) : `${pct(min)}–${pct(max)}`;
  return (
    <span className={`odds-pill ${tone}`}>
      {label && <small>{label}</small>}
      {txt}
    </span>
  );
}

export const CONTRACT_TYPE_ICON: Record<string, string> = {
  Hunt: 'beasts',
  Escort: 'open_road',
  Collection: 'coin',
  Peacekeeping: 'crowd',
  Smuggling: 'sack',
  Investigation: 'eye',
  Clearance: 'skull',
  Expedition: 'compass',
  Heist: 'infiltrator',
  Diplomacy: 'envoy',
  Story: 'quest',
};

/** The phases of a contract as a chain of approach options. */
export function PhaseStrip({ c, chosen }: { c: Contract; chosen?: Approach[] }) {
  return (
    <span className="phase-strip" aria-label="Phases and possible approaches">
      {c.phases.map((p, i) => (
        <span key={i} className={`ps-step ${i === c.phases.length - 1 ? 'ps-goal' : ''}`} title={`${p.name}: ${p.approaches.map((a) => APPROACH_INFO[a].name).join(' or ')}`}>
          {(chosen ? [chosen[i]] : p.approaches).map((a) => (
            <span key={a} className="ps-ap" style={{ color: ap(a) }}>
              <Icon name={a} size={14} />
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/**
 * The best odds the guild could get on this contract right now with idle
 * members, using a quick greedy squad pick. A scanning aid, not a promise.
 */
function bestSquadOdds(g: GameState, c: Contract): { min: number; max: number; size: number } | null {
  const idle = living(g).filter((m) => m.status === 'idle' && m.health >= 40);
  if (idle.length < c.minSquad) return null;
  const solo = (m: Member) => previewMission(g, c, [m], bestApproaches(g, c, [m])).phases.reduce((s, p) => s + p.chance, 0);
  const ranked = [...idle].sort((a, b) => solo(b) - solo(a));
  let best: { min: number; max: number; size: number } | null = null;
  for (let n = c.minSquad; n <= Math.min(c.maxSquad, ranked.length); n++) {
    const team = ranked.slice(0, n);
    const pv = previewMission(g, c, team, bestApproaches(g, c, team));
    const min = Math.min(...pv.phases.map((p) => p.min));
    const max = Math.min(...pv.phases.map((p) => p.max));
    if (!best || min > best.min + 0.02) best = { min, max, size: n };
  }
  return best;
}

export function useBestOdds(g: GameState, c: Contract) {
  // recompute when the roster or the contract changes
  return useMemo(() => bestSquadOdds(g, c), [g.members, g.items, c]); // eslint-disable-line react-hooks/exhaustive-deps
}

