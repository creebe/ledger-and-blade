import { hireRecruit, ITEMS, living, PROFESSIONS, TRAITS } from '../../engine';
import { useStore } from '../../store';
import { Empty, Meter, Section } from '../common';
import { ASSIGNMENTS, statusLine } from '../MemberSheet';

export function RosterScreen() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const open = useStore((s) => s.open);
  const crew = living(g);
  const fallen = g.members.filter((m) => m.status === 'dead' || m.status === 'left');

  return (
    <div className="screen">
      <h1 className="screen-title">Roster</h1>
      <p className="muted small">
        {crew.length} members · wages {crew.reduce((s, m) => s + m.wage, 0)}◉/week. Idle members follow their weekly assignment. Tap a member to change gear and orders.
      </p>
      <Section>
        {crew.map((m) => (
          <button key={m.id} className="member-row" onClick={() => open({ kind: 'member', id: m.id })}>
            <div className="row between">
              <b>{m.name}</b>
              <span className="small muted">
                {PROFESSIONS[m.profession].name} · Lv {m.level}
              </span>
            </div>
            <div className="mr-bars">
              <span className="tiny">HP</span>
              <Meter value={m.health} tone={m.health < 40 ? 'bad' : m.health < 75 ? 'mid' : 'good'} />
              <span className="tiny">Fresh</span>
              <Meter value={100 - m.fatigue} tone={m.fatigue > 50 ? 'bad' : 'info'} />
              <span className="tiny">Loyal</span>
              <Meter value={m.loyalty} tone={m.loyalty < 35 ? 'bad' : 'good'} />
            </div>
            <div className="row between small">
              <span className={m.status === 'idle' ? '' : 'muted'}>
                {m.status === 'idle' ? `→ ${ASSIGNMENTS.find((a) => a.id === m.assignment)?.label}` : statusLine(m, g)}
              </span>
              <span className="muted">{m.traits.map((t) => TRAITS[t].name).join(', ')}</span>
            </div>
          </button>
        ))}
      </Section>

      <Section title="Hiring Hall">
        <p className="muted small">New faces arrive each week. Lower Town standing affects their quality and sign-on fee.</p>
        {g.recruits.length === 0 && <Empty>No one is looking for work.</Empty>}
        {g.recruits.map((r, i) => {
          const m = r.member;
          return (
            <div key={m.id} className="recruit">
              <div className="row between">
                <b>{m.name}</b>
                <span className="small">{PROFESSIONS[m.profession].name}</span>
              </div>
              <div className="small">
                Might {m.attrs.might} · Finesse {m.attrs.finesse} · Wits {m.attrs.wits} · Resolve {m.attrs.resolve}
              </div>
              <div className="small muted">
                {m.traits.map((t) => TRAITS[t].name).join(', ')} · brings {r.gear.map((x) => ITEMS[x].name).join(', ')}
              </div>
              <div className="row between">
                <span className="small">
                  Wage {m.wage}◉/wk · leaves in {r.expiresWeek - g.week + 1} wk
                </span>
                <button className="btn small primary" disabled={g.crowns < r.signOn} onClick={() => act((d) => hireRecruit(d, i))}>
                  Hire {r.signOn}◉
                </button>
              </div>
            </div>
          );
        })}
      </Section>

      {fallen.length > 0 && (
        <Section title="Gone but not forgotten">
          {fallen.map((m) => (
            <p key={m.id} className="small muted">
              {m.status === 'dead' ? '✝' : '↦'} {m.name}, {PROFESSIONS[m.profession].name}: {m.causeOfDeath}
            </p>
          ))}
        </Section>
      )}
    </div>
  );
}
