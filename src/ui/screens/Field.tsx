// The Field tab: every squad out, as a card with its number, where it is, the
// squad strip and the latest notable line. A squad still in the yard (its
// dispatch week) can be re-geared or called off from here.
import { cancelDispatch, squadLimit, squadStatus, squadsOut, visibleLog, type GameState, type Mission } from '../../engine';
import { useStore } from '../../store';
import { Btn, Empty, Section } from '../kit/common';
import { Icon } from '../kit/icons';
import { goTo } from '../kit/navigate';
import { shortDate } from '../kit/format';
import { SquadBadge, SquadStrip, cellsFromMembers, cellsFromSnap } from '../expeditions/SquadStrip';

/** The line most worth showing on a card: the last big moment seen, or else the last line. */
function notableLine(g: GameState, m: Mission) {
  const seen = visibleLog(g, m);
  return [...seen].reverse().find((l) => l.big) ?? seen[seen.length - 1];
}

function FieldCard({ m, g }: { m: Mission; g: GameState }) {
  const open = useStore((s) => s.open);
  const st = squadStatus(g, m);
  const where = st.preparing
    ? m.fieldWeeks?.length
      ? 'They have left by the gate, and the trip begins at the end of this week.'
      : 'In the yard. They leave at the end of this week.'
    : `Week ${st.revealed} of about ${m.plannedWeeks}, ${st.zone ? `in ${st.zone}, room ${st.room} of ${st.rooms}` : 'on the road'}.`;
  const cells = st.squad ? cellsFromSnap(g, m, st.squad) : cellsFromMembers(g, m);
  const line = notableLine(g, m);
  return (
    <div className="x-field-wrap">
      <button className="tappable x-field-card" onClick={() => open({ kind: 'mission', id: m.id })} aria-label={`Squad ${m.number}, ${st.site}. Open the log.`}>
        <span className="x-field-head">
          <SquadBadge n={m.number} />
          <span className="x-field-title">
            <b>{st.site}</b>
            <small className="muted">{m.contract.title}</small>
          </span>
        </span>
        <span className={`small x-field-where ${st.preparing ? 'x-field-yard' : ''}`}>
          <Icon name={st.preparing ? 'clock' : 'road'} size={14} /> {where}
        </span>
        <SquadStrip cells={cells} label={`Squad ${m.number}`} />
        {line && <span className={`small x-field-line ${line.big ? 'x-big' : ''}`}>{line.text}</span>}
      </button>
      {st.preparing && <YardPanel m={m} g={g} />}
    </div>
  );
}

/** A squad waiting in the yard: change their gear, or call them off. */
function YardPanel({ m, g }: { m: Mission; g: GameState }) {
  const open = useStore((s) => s.open);
  const doorFired = !!m.fieldWeeks?.length;
  return (
    <div className="x-yard">
      <span className="small">Their gear can still change until End Week. Tap a name to see what they carry.</span>
      <span className="row wrap gap">
        {m.memberIds.map((id) => {
          const x = g.members.find((y) => y.id === id);
          if (!x) return null;
          return (
            <button key={id} className="btn ghost small" onClick={() => open({ kind: 'member', id })}>
              <Icon name="armor" size={14} /> {x.name.split(' ')[0]}
            </button>
          );
        })}
        <Btn
          className="btn ghost small danger x-yard-calloff"
          blocked={doorFired ? 'They have already left by the gate, so nobody can call them back now.' : undefined}
          onClick={() =>
            useStore.getState().confirm({
              title: `Call off squad ${m.number}?`,
              body: [`The squad stays home. What they packed goes back to the stores, and "${m.contract.title}" returns to the board.`],
              confirmLabel: 'Call them off',
              onConfirm: () => useStore.getState().act((s) => cancelDispatch(s, m.id)) && useStore.getState().notify(`Squad ${m.number} stays home and is back in the hall.`),
            })
          }
        >
          Call off
        </Btn>
      </span>
    </div>
  );
}

export function FieldScreen() {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  const out = g.missions.filter((m) => !m.report).sort((a, b) => a.number - b.number);
  const limit = squadLimit(g);
  const used = squadsOut(g);
  const home = [...g.history].reverse().filter((m) => m.report && m.report.tier !== 'Withdrawn').slice(0, 3);
  return (
    <div className="screen">
      <h1 className="screen-title">Field</h1>
      <p className="small muted x-field-limit">
        {used} of {limit} squads out.{limit < 3 && used >= limit ? ' A Muster room in the Hall would let a third go.' : ''}
      </p>
      <Section title="Squads out">
        {out.length === 0 && (
          <Empty>
            Nobody is out. Squads leave from the contract board.{' '}
            <button className="link-btn" onClick={() => goTo({ tab: 'contracts', guide: 'board' })}>
              See the board
            </button>
          </Empty>
        )}
        {out.map((m) => (
          <FieldCard key={m.id} m={m} g={g} />
        ))}
      </Section>
      {home.length > 0 && (
        <Section title="Contracts recently completed">
          {home.map((m) => (
            <button key={m.id} className="tappable x-home-row" onClick={() => open({ kind: 'mission', id: m.id })}>
              <span className="x-field-title">
                <b>{m.contract.title}</b>
                <small className="muted">
                  {m.report!.tier}. Home {shortDate(m.returnWeek + 1, g.week)}.
                </small>
              </span>
            </button>
          ))}
        </Section>
      )}
    </div>
  );
}
