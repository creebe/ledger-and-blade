import { dateLabel } from '../../engine';
import { snap, type ResourceSnap, useStore } from '../../store';
import { Sheet } from '../kit/common';
import { Icon } from '../kit/icons';
import { DispatchItem } from '../kit/DispatchItem';
import { living } from '../../engine';
import { num } from '../kit/format';

const RES_LABEL: { key: keyof ResourceSnap; icon: string; name: string; invert?: boolean }[] = [
  { key: 'crowns', icon: 'coin', name: 'Crowns' },
  { key: 'supplies', icon: 'sack', name: 'Supplies' },
  { key: 'intel', icon: 'eye', name: 'Intel' },
  { key: 'influence', icon: 'seal', name: 'Influence' },
  { key: 'renown', icon: 'star', name: 'Renown' },
  { key: 'heat', icon: 'flame', name: 'Heat', invert: true },
];

export function WeekReport({ dispatchIds, week, before }: { dispatchIds: string[]; week: number; before: ResourceSnap }) {
  const g = useStore((s) => s.game)!;
  const close = useStore((s) => s.close);
  const items = g.dispatches.filter((d) => dispatchIds.includes(d.id));
  const after = snap(g);
  const last = g.ledger[g.ledger.length - 1];
  const changes = RES_LABEL.map((r) => ({ ...r, delta: Math.round((after[r.key] - before[r.key]) * 10) / 10 })).filter((r) => r.delta !== 0);
  const missions = items.filter((d) => d.kind === 'mission');
  const rest = items.filter((d) => d.kind !== 'mission');
  return (
    <Sheet
      title="The week's end"
      footer={
        <button className="btn primary block" onClick={close}>
          Begin {dateLabel(g.week)}
        </button>
      }
    >
      <p className="muted small report-date">{dateLabel(week)}</p>
      <div className="delta-row">
        {changes.length === 0 && <span className="muted small">No change to your resources.</span>}
        {changes.map((c, i) => {
          const good = c.invert ? c.delta < 0 : c.delta > 0;
          // the squad eating its supplies is routine: neutral unless the stores now run short
          const routine = c.key === 'supplies' && c.delta < 0 && after.supplies >= living(g).filter((m) => m.status !== 'mission').length * 2;
          return (
            <span key={c.key} className={`delta-chip ${routine ? 'flat' : good ? 'up' : 'down'}`} style={{ animationDelay: `${i * 0.08}s` }}>
              <Icon name={c.icon} size={14} /> {c.delta > 0 ? '+' : ''}
              {num(c.delta)} <small>{c.name}</small>
            </span>
          );
        })}
      </div>
      {last && (
        <details className="small">
          <summary>Where the crowns went</summary>
          <ul className="parts">
            {Object.entries(last.income).map(([k, v]) => (
              <li key={k}>
                {k} <span>+{v}</span>
              </li>
            ))}
            {Object.entries(last.expenses).map(([k, v]) => (
              <li key={k} className="neg">
                {k} <span>{num(-v)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {missions.length > 0 && <h3 className="subhead">From the field</h3>}
      {missions.map((d) => (
        <DispatchItem key={d.id} d={d} />
      ))}
      {rest.length > 0 && <h3 className="subhead">News</h3>}
      {items.length === 0 && <p className="muted">A quiet week.</p>}
      {rest.map((d) => (
        <DispatchItem key={d.id} d={d} />
      ))}
    </Sheet>
  );
}
