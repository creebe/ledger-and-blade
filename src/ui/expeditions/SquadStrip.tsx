// The compact squad strip used by the Field cards and Watch together: one cell
// per member in rank order, with health, Fatigue and Exposure. Squads are told
// apart by their number badge, never by color; color stays for meaning.
import { EXP_TUNING, type GameState, type Mission, type ProfessionId, type SquadSnap } from '../../engine';
import { ProfSilhouette } from './Silhouette';
import { XBar } from './xkit';

export interface StripCell {
  id: string;
  name: string;
  prof?: ProfessionId;
  hp: number;
  maxHp: number;
  fatigue: number;
  exposure: number;
  fever?: boolean;
  state: SquadSnap['state'][number];
}

/** The squad's number in a circle: how the merged feed tells squads apart. */
export function SquadBadge({ n }: { n: number }) {
  return (
    <span className="x-badge" aria-label={`Squad ${n}`}>
      {n}
    </span>
  );
}

/** Strip cells from a log snapshot (what the player has seen of the trip). */
export function cellsFromSnap(g: GameState, ms: Mission, snap: SquadSnap): StripCell[] {
  return ms.result.squad.map((id, i) => {
    const m = g.members.find((x) => x.id === id);
    return {
      id,
      name: (ms.result.names[i] ?? m?.name ?? '?').split(' ')[0],
      prof: m?.profession,
      hp: snap.hp[i] ?? 0,
      maxHp: snap.maxHp[i] ?? 1,
      fatigue: snap.fatigue[i] ?? 0,
      exposure: snap.exposure[i] ?? 0,
      fever: !!snap.fever?.[i],
      state: snap.state[i] ?? 'ok',
    };
  });
}

/** Strip cells from the members as they stand at home (a squad still in the yard). */
export function cellsFromMembers(g: GameState, ms: Mission): StripCell[] {
  return ms.memberIds.flatMap((id) => {
    const m = g.members.find((x) => x.id === id);
    if (!m) return [];
    return [{ id, name: m.name.split(' ')[0], prof: m.profession, hp: m.health, maxHp: 100, fatigue: m.fatigue, exposure: m.exposure ?? 0, fever: !!m.fever, state: 'ok' as const }];
  });
}

const stateText = (c: StripCell) =>
  c.state === 'dead' ? 'dead' : c.state === 'down' ? 'down' : c.state === 'out' ? 'carried' : c.state === 'spent' ? 'spent' : c.fever ? 'fever' : '';

/** One row of small cells. `size` is the silhouette size; 0 hides it. */
export function SquadStrip({ cells, size = 26, label }: { cells: StripCell[]; size?: number; label?: string }) {
  const X = EXP_TUNING.exposure;
  return (
    <div className="x-mini-strip" aria-label={label ?? 'The squad'} style={{ ['--x-cells' as string]: Math.max(3, cells.length) }}>
      {cells.map((c) => {
        const st = stateText(c);
        // orange when the next Sink change is close
        const expTone = X.thresholds.some((t) => c.exposure >= t - 10 && c.exposure < t) ? 'warn' : '';
        return (
          <div key={c.id} className={`x-mini-cell x-st-${c.state}`}>
            {size > 0 && c.prof && <ProfSilhouette prof={c.prof} size={size} state={c.state} />}
            <span className="x-mini-body">
              <span className="x-mini-name">{c.name}</span>
              <XBar v={c.hp} max={c.maxHp} kind="hp" label={`${c.name}: health ${c.hp} of ${c.maxHp}`} />
              <XBar v={c.fatigue} max={100} kind="fatigue" label={`${c.name}: Fatigue ${c.fatigue}`} />
              <span className="x-mini-num">{st ? <span className="x-mini-state">{st}</span> : `${c.hp}/${c.maxHp}`}</span>
              {c.exposure > 0 && (
                <span className={`x-mini-exp ${expTone}`} title={`Exposure ${c.exposure}. A Sink change comes at ${X.thresholds.join(', ')}.`}>
                  Exposure {c.exposure}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
