import { DELVER_PROFS, delverMaxHp, dateLabel, hireDelver, livingDelvers, setTask } from '../../engine';
import { useX } from '../../expStore';
import { useStore } from '../../store';
import { Btn, Price, Section, Seg } from '../kit/common';
import { MemberCard, first, xShort } from './xkit';
import { ProfSilhouette } from './Silhouette';

export function SquadTab() {
  const g = useX((s) => s.game)!;
  const act = useX((s) => s.act);
  const confirm = useStore((s) => s.confirm);
  const notify = useStore((s) => s.notify);
  const crew = livingDelvers(g);
  const fallen = g.members.filter((m) => m.status === 'dead');
  return (
    <div className="screen">
      <h1 className="screen-title">The Squad</h1>
      <p className="muted small">
        {crew.length} members, {crew.reduce((s, d) => s + d.wage, 0)} crowns a week in wages. Four go down on each expedition. Tap a member for their gear and record.
      </p>
      <Section title="Members">
        {crew.map((d) => (
          <MemberCard key={d.id} d={d} onClick={() => useX.getState().open({ kind: 'member', id: d.id })}>
            <span className="x-task" onClick={(e) => e.stopPropagation()}>
              <Seg
                value={d.task}
                onChange={(v) => act((x) => setTask(x, d.id, v))}
                options={[
                  { value: 'rest', label: 'Rest' },
                  { value: 'train', label: 'Train (10 a week)' },
                ]}
              />
            </span>
          </MemberCard>
        ))}
      </Section>
      <Section title="Looking for work">
        <p className="muted small">New faces come to the hall every other week. Better ones come as the guild's renown grows.</p>
        {g.recruits.map((r, i) => (
          <div key={r.delver.id} className="card x-recruit">
            <ProfSilhouette prof={r.delver.prof} />
            <span className="x-member-main">
              <b>{r.delver.name}</b>
              <small className="muted">
                {DELVER_PROFS[r.delver.prof].name} · level {r.delver.level} · {delverMaxHp(r.delver)} HP · wage {r.delver.wage}
              </small>
              <small>{DELVER_PROFS[r.delver.prof].blurb}</small>
            </span>
            <Btn
              className="btn small primary"
              blocked={xShort(g, r.signOn, `Signing ${first(r.delver)}`)}
              onClick={() =>
                confirm({
                  title: `Sign ${r.delver.name}?`,
                  body: `A ${DELVER_PROFS[r.delver.prof].name}, with their own starting gear. Their wage is ${r.delver.wage} crowns a week.`,
                  cost: `${r.signOn} crowns to sign`,
                  confirmLabel: 'Sign',
                  onConfirm: () => notify(act((x) => hireDelver(x, i)) ?? `${first(r.delver)} joins the guild.`),
                })
              }
            >
              Sign <Price n={r.signOn} />
            </Btn>
          </div>
        ))}
      </Section>
      {fallen.length > 0 && (
        <Section title="The dead">
          <ul className="x-fallen">
            {fallen.map((d) => (
              <li key={d.id}>
                <b>{d.epithet ?? d.name}</b>, {DELVER_PROFS[d.prof].name.toLowerCase()}, level {d.level}. Died {d.diedWeek ? dateLabel(d.diedWeek) : ''} in Old Pellam: {d.causeOfDeath}.
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
