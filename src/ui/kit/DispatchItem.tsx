import type { Dispatch } from '../../engine';
import { useStore } from '../../store';
import { Icon } from './icons';

const KIND_ICON: Record<string, string> = { lore: 'book', crier: 'ear', story: 'quest', mission: 'scroll', economy: 'coin', politics: 'seal', roster: 'people', rival: 'hobbs', warning: 'warn', info: 'info' };

// only warnings and the story get color; everything else is neutral
const KIND_COLOR: Record<string, string> = { story: 'var(--accent)', warning: 'var(--bad)' };

export function DispatchItem({ d }: { d: Dispatch }) {
  const open = useStore((s) => s.open);
  const game = useStore((s) => s.game)!;
  const mission = d.missionId ? [...game.missions, ...game.history].find((m) => m.id === d.missionId) : undefined;
  return (
    <article className={`dispatch k-${d.kind}`}>
      <h4 className="alert-row">
        <Icon name={KIND_ICON[d.kind] ?? 'scroll'} size={16} style={{ color: KIND_COLOR[d.kind] ?? 'var(--ink-2)' }} />
        <span>{d.title}</span>
      </h4>
      {d.body.map((b, i) => (
        <p key={i}>{b}</p>
      ))}
      {mission?.report && (
        <button className="btn ghost small" onClick={() => open({ kind: 'mission', id: mission.id })}>
          ▶ Read the mission report
        </button>
      )}
    </article>
  );
}
