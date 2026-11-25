import { EXP_TUNING, FACTIONS, GOODS, LENGTHS, MONSTERS, ZONES, buildHall, dateLabel, payDebt, restWeek, type Sponsor } from '../../engine';
import { useX } from '../../expStore';
import { useStore } from '../../store';
import { Btn, Price, Section } from '../kit/common';
import { HoldButton } from '../kit/HoldButton';
import { Icon } from '../kit/icons';
import { xShort } from './xkit';

export function sponsorGoal(s: Sponsor) {
  const g = s.goal;
  if (g.kind === 'reach') return `Reach ${ZONES[g.zone].name}.`;
  if (g.kind === 'bring') return `Bring back ${g.count} ${GOODS[g.good].name.toLowerCase()}.`;
  return g.monster === 'kiln' ? 'Break the Kiln Engine.' : `Kill ${g.count} ${g.count === 1 ? MONSTERS[g.monster].one : MONSTERS[g.monster].plural}.`;
}

export function SponsorCard({ s, picked, onPick }: { s: Sponsor; picked?: boolean; onPick?: () => void }) {
  const f = FACTIONS[s.faction];
  const Tag = onPick ? 'button' : 'div';
  return (
    <Tag className={`card x-sponsor ${onPick ? 'tappable' : ''} ${picked ? 'x-picked' : ''}`} onClick={onPick}>
      <span className="row between">
        <b>
          <span className="x-dot" style={{ background: f.color }} /> {s.title}
        </b>
        <Price n={s.reward} />
      </span>
      <span className="small">{s.text}</span>
      <span className="tiny muted">
        {sponsorGoal(s)} +{s.renown} renown. Open until {dateLabel(s.expiresWeek)}.
      </span>
      {picked && <span className="tiny x-picked-label">Taken for this expedition</span>}
    </Tag>
  );
}

export function HallTab() {
  const g = useX((s) => s.game)!;
  const act = useX((s) => s.act);
  const confirm = useStore((s) => s.confirm);
  const notify = useStore((s) => s.notify);
  const last = g.last;
  const due = Math.min(g.debt.installment, g.debt.principal);

  const rest = () => {
    const before = { fromWeek: g.week, crownsBefore: g.crowns, newsBefore: g.news.length };
    const err = act((d) => restWeek(d));
    if (err) return notify(err);
    useX.getState().open({ kind: 'week', ...before });
  };

  return (
    <div className="screen">
      <h1 className="screen-title">The Hall</h1>
      <p className="muted small">Tallow Street. The steps down to Old Pellam are behind the chandler's.</p>

      {last && (
        <Section title="The last expedition">
          <button className="card tappable x-last" onClick={() => useX.getState().setView('result')}>
            <b>
              {LENGTHS[last.plan.length].name} expedition:{' '}
              <span className={last.outcome === 'complete' ? 'good' : last.outcome === 'lost' ? 'bad' : 'warn'}>
                {last.outcome === 'complete' ? 'done' : last.outcome === 'retreated' ? 'turned back' : 'lost'}
              </span>
            </b>
            <span className="small muted">
              Down to {ZONES[last.deepest].name}. Loot worth {last.lootValue + last.crownsFound} crowns.{' '}
              {last.members.some((m) => m.died) ? `${last.members.filter((m) => m.died).length} dead.` : 'Everyone came home.'}
            </span>
          </button>
        </Section>
      )}

      <Section title="Rest">
        <p className="small">The squad's wounds heal and their nerve comes back a little each week at home. Wages are paid whether anyone goes down or not.</p>
        <HoldButton onConfirm={rest} hint="Hold to rest the guild for a week." className="btn x-rest">
          <Icon name="rest" size={18} /> Hold to rest a week
        </HoldButton>
      </Section>

      <Section title="The Weighhouse">
        {g.debt.principal > 0 ? (
          <>
            <p className="small">
              The guild owes Alderman Coster's Weighhouse <b>{g.debt.principal}</b> crowns. <b>{due}</b> is due on {dateLabel(g.debt.dueWeek)}.
              {g.debt.missed ? <span className="bad"> One payment has been missed. Miss another and the Weighhouse takes the hall.</span> : ' Miss two payments in a row and the Weighhouse takes the hall.'}
            </p>
            <Btn
              className="btn small"
              blocked={xShort(g, due, 'Paying early')}
              onClick={() => confirm({ title: 'Pay the Weighhouse early?', body: `${due} crowns off the note now. The next payment is still due on ${dateLabel(g.debt.dueWeek)}.`, cost: `${due} crowns`, confirmLabel: 'Pay', onConfirm: () => notify(act((d) => payDebt(d, due)) ?? `Paid ${due} crowns.`) })}
            >
              Pay {due} now
            </Btn>
          </>
        ) : (
          <p className="small good">The note is paid off.</p>
        )}
      </Section>

      <Section title="Sponsors">
        <p className="muted small">A faction pays for a goal. Take one when you plan the expedition.</p>
        {g.sponsors.length ? g.sponsors.map((s) => <SponsorCard key={s.id} s={s} />) : <p className="empty">Nobody is offering anything this week.</p>}
      </Section>

      <Section title="The hall">
        {(
          [
            { id: 'infirmary' as const, name: 'Infirmary', text: 'Beds and a basin in the back room. Members at home heal faster.' },
            { id: 'taproom' as const, name: 'Taproom', text: 'The cellar becomes a taproom. Members at home get their grit back faster.' },
          ]
        ).map((h) => (
          <div key={h.id} className="card x-upgrade">
            <span className="row between">
              <b>{h.name}</b>
              {g.hall[h.id] ? <span className="good small">Built</span> : <Price n={EXP_TUNING.hall[h.id]} />}
            </span>
            <span className="small">{h.text}</span>
            {!g.hall[h.id] && (
              <Btn
                className="btn small"
                blocked={xShort(g, EXP_TUNING.hall[h.id], `The ${h.name.toLowerCase()}`)}
                onClick={() => confirm({ title: `Build the ${h.name.toLowerCase()}?`, body: h.text, cost: `${EXP_TUNING.hall[h.id]} crowns`, confirmLabel: 'Build', onConfirm: () => notify(act((d) => buildHall(d, h.id)) ?? `The ${h.name.toLowerCase()} is built.`) })}
              >
                Build
              </Btn>
            )}
          </div>
        ))}
      </Section>

      <Section title="News">
        <ul className="x-news">
          {g.news.slice(0, 10).map((n, i) => (
            <li key={i} className={n.tone ?? ''}>
              <small className="muted">{dateLabel(n.week)}</small> {n.text}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

