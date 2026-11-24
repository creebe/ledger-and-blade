import {
  canLobby,
  DECREE_BY_ID,
  FACTIONS,
  lobby,
  lobbyCost,
  SEAT_NOTE,
  SEATS,
  setPosition,
  tally,
  type AgendaItem,
  type CouncilFaction,
  type GameState,
  type LobbyMethod,
  type Stance,
} from '../../engine';
import { useStore } from '../../store';
import { Btn, Section, Seg } from '../kit/common';
import { Icon } from '../kit/icons';
import { shortDate, weeks, wk } from '../kit/format';
import { short } from '../kit/shortfall';

const FIDS = Object.keys(SEATS) as CouncilFaction[];
const STANCE: Record<string, string> = { '1': 'For', '0': 'Undecided', '-1': 'Against' };

function Seats({ item }: { item: AgendaItem }) {
  const seats: { f: CouncilFaction; p: Stance }[] = [];
  for (const p of [1, 0, -1] as Stance[]) for (const f of FIDS) if (item.positions[f] === p) for (let i = 0; i < SEATS[f]; i++) seats.push({ f, p });
  return (
    <span className="seats" aria-label="Council seats">
      {seats.map((s, i) => (
        <i key={i} className={`seat s${s.p}`} title={`${FACTIONS[s.f].short}: ${STANCE[s.p]}`} />
      ))}
    </span>
  );
}

function DecreeCard({ g, item }: { g: GameState; item: AgendaItem }) {
  const act = useStore((s) => s.act);
  const d = DECREE_BY_ID[item.id];
  const t = tally(item);
  const winning = item.player !== 0 && (item.player > 0) === t.passes;
  const verdict = t.passes ? 'Passes as things stand' : 'Fails as things stand';

  const doLobby = (f: CouncilFaction, method: LobbyMethod) => {
    const c = lobbyCost(g, f);
    const name = FACTIONS[f].name;
    const toward = item.player > 0 ? 'toward supporting it' : 'toward opposing it';
    const spec = {
      influence: { title: `Lobby ${name}`, body: `Call in favors and make your case. ${name} moves one step ${toward}.`, cost: `Costs ${c.influence} Influence · you have ${g.influence}` },
      intel: { title: `Blackmail ${name}`, body: `Use what your informants know. ${name} moves one step ${toward}, but standing with them falls by 4.`, cost: `Costs ${c.intel} Intel · you have ${g.intel}` },
      crowns: { title: `Bribe ${name}`, body: `Quiet purses for the right aldermen. ${name} moves one step ${toward}. Heat +3.`, cost: `Costs ${c.crowns} crowns · you have ${g.crowns}` },
    }[method];
    useStore.getState().confirm({
      title: spec.title,
      body: [spec.body, 'Each faction can be worked on once a week.'],
      cost: spec.cost,
      confirmLabel: 'Do it',
      danger: method !== 'influence',
      onConfirm: () => act((s) => lobby(s, item.id, f, method)) && useStore.getState().notify(`${FACTIONS[f].short} now leans ${STANCE[String(Math.max(-1, Math.min(1, item.positions[f] + item.player)))].toLowerCase()}.`),
    });
  };

  return (
    <div className="decree">
      <div className="row between">
        <b>{d.title}</b>
        <span className="faction-badge" style={{ ['--fc' as string]: FACTIONS[d.sponsor].color }}>
          <Icon name={d.sponsor} size={12} /> {FACTIONS[d.sponsor].short}
        </span>
      </div>
      <p className="small muted">{d.text}</p>
      <ul className="effects">
        {d.effects.map((e, i) => (
          <li key={i} className="small">
            {e}
          </li>
        ))}
      </ul>
      <div className="row between" style={{ margin: '6px 0' }}>
        <Seats item={item} />
        <span className={`small ${item.player ? (winning ? 'good' : 'bad') : 'muted'}`}>
          <b>{verdict}</b> ({t.votesFor}–{t.votesAgainst})
        </span>
      </div>
      {g.council.voteWeek === g.week && <p className="tiny muted">The vote is at the end of this week. Stances are locked.</p>}
      <Seg
        value={String(item.player)}
        onChange={(v) => act((s) => setPosition(s, item.id, Number(v) as Stance))}
        options={[
          { value: '-1', label: 'Oppose' },
          { value: '0', label: 'No stance' },
          { value: '1', label: 'Support' },
        ]}
      />
      <div className="council-factions">
        {FIDS.map((f) => {
          const p = item.positions[f];
          const moved = p !== item.base[f];
          const blocked = canLobby(g, item, f);
          const c = lobbyCost(g, f);
          return (
            <div key={f} className="cf-row">
              <span className="meta" style={{ color: 'var(--ink)' }}>
                <Icon name={f} size={14} style={{ color: FACTIONS[f].color }} />
                {FACTIONS[f].short}
                <small className="muted">
                  {' '}
                  · {SEATS[f]} seats
                </small>
              </span>
              <span className={`stance s${p}`}>
                {STANCE[p]}
                {moved && <small className="muted"> (was {STANCE[item.base[f]].toLowerCase()})</small>}
              </span>
              {item.player !== 0 && p !== item.player && (
                <span className="cf-actions">
                  <Btn className="btn ghost small" blocked={blocked ?? short(g, 'influence', c.influence, 'Lobbying')} title={blocked ?? `${c.influence} Influence`} onClick={() => doLobby(f, 'influence')}>
                    <Icon name="seal" size={14} /> {c.influence}
                  </Btn>
                  <Btn className="btn ghost small" blocked={blocked ?? short(g, 'intel', c.intel, 'Blackmail')} title={blocked ?? `${c.intel} Intel`} onClick={() => doLobby(f, 'intel')}>
                    <Icon name="eye" size={14} /> {c.intel}
                  </Btn>
                  <Btn className="btn ghost small" blocked={blocked ?? short(g, 'crowns', c.crowns, 'A bribe')} title={blocked ?? `${c.crowns} crowns`} onClick={() => doLobby(f, 'crowns')}>
                    <Icon name="coin" size={14} /> {c.crowns}
                  </Btn>
                </span>
              )}
            </div>
          );
        })}
      </div>
      {item.player === 0 && <p className="tiny muted">Take a stance to lobby. Factions on your side when the vote passes your way will thank you; the ones you beat will remember.</p>}
    </div>
  );
}

export function CouncilSection() {
  const g = useStore((s) => s.game)!;
  const c = g.council;
  const seasonWeek = ((g.week - 1) % 12) + 1;
  const untilAgenda = seasonWeek < 7 ? 7 - seasonWeek : 12 - seasonWeek + 7;
  const active = c.active.filter((a) => a.untilWeek >= g.week);
  return (
    <Section
      guide="council"
      title="The Council of Varrow"
      right={
        <span className="meta">
          <Icon name="clock" size={14} />
          {c.agenda.length ? `votes ${c.voteWeek === g.week ? 'this week' : `in ${weeks((c.voteWeek ?? g.week) - g.week + 1)}`}` : `next agenda in ${wk(untilAgenda)}`}
        </span>
      }
    >
      <p className="tiny muted">
        Nine seats: {FIDS.map((f) => `${FACTIONS[f].short} ${SEATS[f]} (${SEAT_NOTE[f].toLowerCase()})`).join(' · ')}. A decree needs more seats for than against.
      </p>
      {c.agenda.length === 0 && <p className="small muted">The Council is not sitting. It posts an agenda in the seventh week of each season and votes at the end of the season.</p>}
      {c.agenda.map((item) => (
        <DecreeCard key={item.id} g={g} item={item} />
      ))}
      {active.length > 0 && (
        <>
          <h4 className="week-head">In force</h4>
          {active.map((a) => (
            <div key={a.id} className="small">
              <b>{DECREE_BY_ID[a.id].title}</b> <span className="muted">· {wk(a.untilWeek - g.week + 1)} left</span>
              <div className="tiny muted">{DECREE_BY_ID[a.id].effects.join(' ')}</div>
            </div>
          ))}
        </>
      )}
      {c.history.length > 0 && (
        <details className="small" style={{ marginTop: 6 }}>
          <summary>Past votes</summary>
          {[...c.history].reverse().slice(0, 8).map((h, i) => (
            <div key={i} className="tiny">
              {shortDate(h.week, g.week)}: {DECREE_BY_ID[h.id].title}, {h.passed ? 'passed' : 'failed'} {h.votesFor}–{h.votesAgainst}
              {h.player ? ` · you ${h.player > 0 ? 'supported' : 'opposed'} it` : ''}
            </div>
          ))}
        </details>
      )}
    </Section>
  );
}
