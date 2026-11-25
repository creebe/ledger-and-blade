import { SITES, dateLabel, feedForWeek, tripWeekOf, weekSummary, type Mission } from '../../engine';
import { SquadBadge } from '../expeditions/SquadStrip';
import { snap, type ResourceSnap, useStore } from '../../store';
import { Sheet } from '../kit/common';
import { Icon } from '../kit/icons';
import { DispatchItem } from '../kit/DispatchItem';
import { living } from '../../engine';
import { num } from '../kit/format';
import { DateCard } from '../panels/DateCard';

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
  const open = useStore((s) => s.open);
  const items = g.dispatches.filter((d) => dispatchIds.includes(d.id));
  const after = snap(g);
  const last = g.ledger[g.ledger.length - 1];
  const changes = RES_LABEL.map((r) => ({ ...r, delta: Math.round((after[r.key] - before[r.key]) * 10) / 10 })).filter((r) => r.delta !== 0);
  const dates = items.filter((d) => d.kind === 'date');
  const missions = items.filter((d) => d.kind === 'mission');
  const rest = items.filter((d) => d.kind !== 'mission' && d.kind !== 'date');
  // every squad whose lines this End Week revealed, for Down below
  const feed = feedForWeek(g, week);
  const below = [...new Set(feed.map((f) => f.missionId))]
    .map((id) => [...g.missions, ...g.history].find((m) => m.id === id))
    .filter((m): m is Mission => !!m && m.report?.tier !== 'Withdrawn')
    .sort((a, b) => a.number - b.number);
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
      {below.length > 0 && (
        <section className="x-below">
          <div className="row between x-below-head">
            <h3 className="subhead">Down below</h3>
            <button className="btn small x-watch-open" onClick={() => open({ kind: 'watch', week })}>
              Watch together
            </button>
          </div>
          {below.map((m) => {
            const sum = weekSummary(m, tripWeekOf(m, week));
            return (
              <button key={m.id} className="tappable x-below-row" onClick={() => open({ kind: 'mission', id: m.id })}>
                <SquadBadge n={m.number} />
                <span className="x-below-main">
                  <b>{SITES[m.contract.expedition.site].name}</b>
                  <small className={sum.dead.length ? 'bad' : sum.down.length ? 'warn' : 'muted'}>{sum.text[0].toUpperCase() + sum.text.slice(1)}.</small>
                </span>
              </button>
            );
          })}
        </section>
      )}
      {dates.map((d) => (
        <article key={d.id} className={`date-result ${d.title.endsWith(': met') ? 'met' : d.title.endsWith(': missed') ? 'missed' : 'off'}`}>
          <DispatchItem d={d} />
        </article>
      ))}
      <DateCard compact label="Coming up" />
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
