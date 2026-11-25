import { cancelDispatch, FACTIONS, RIVALS, postingInfo, squadStatus, type Contract, type GameState, type Mission } from '../../engine';
import { Icon } from '../kit/icons';
import { CONTRACT_TYPE_ICON, Portrait } from '../kit/visual';
import { useStore } from '../../store';
import { Btn, Empty, FactionBadge, Section, TagChip, ThreatPips } from '../kit/common';
import { wk } from '../kit/format';

/** A squad out on an expedition: where they are and the latest line. Tap to read the log. */
function MissionTrack({ m, g }: { m: Mission; g: GameState }) {
  const open = useStore((s) => s.open);
  const st = squadStatus(g, m);
  const preparing = !m.sealed && !m.report;
  const where = m.report
    ? `${m.report.tier} · home`
    : preparing
      ? 'In the yard · leaves at the end of this week'
      : `Week ${st.revealed} of about ${m.plannedWeeks} · ${st.zone ? `${st.zone}, room ${st.room} of ${st.rooms}` : 'on the road'}`;
  return (
    <div className="mission-wrap">
      <button className="mission-card tappable x-squad-card" onClick={() => open({ kind: 'mission', id: m.id })}>
        <div className="row between">
          <b>
            Squad {m.number} · {m.contract.title}
          </b>
          <Icon name="chevron" size={16} />
        </div>
        <span className="meta">
          <Icon name="road" size={14} />
          {st.site} · {where}
        </span>
        <span className="squad-faces">
          {m.memberIds
            .map((id) => g.members.find((x) => x.id === id))
            .filter(Boolean)
            .map((x) => (
              <Portrait key={x!.id} m={x!} size={30} showStatus={false} />
            ))}
        </span>
        {st.latest && <span className="small muted x-squad-latest">{st.latest.text}</span>}
      </button>
      {preparing && (
        <div className="preparing">
          <span className="small">Leaving at the end of this week. Gear can still change:</span>
          <span className="row wrap gap">
            {m.memberIds.map((id) => {
              const x = g.members.find((y) => y.id === id)!;
              return (
                <button key={id} className="btn ghost small" onClick={() => open({ kind: 'member', id })}>
                  <Icon name="armor" size={14} /> {x.name.split(' ')[0]}
                </button>
              );
            })}
            <Btn
              className="btn ghost small danger"
              blocked={m.fieldWeeks?.length ? 'They are already on the road. Only word from the door can call them back now.' : undefined}
              onClick={() =>
                useStore.getState().confirm({
                  title: 'Cancel this dispatch?',
                  body: [`The squad stays home. What they packed goes back to the stores, and "${m.contract.title}" returns to the board.`],
                  confirmLabel: 'Cancel dispatch',
                  onConfirm: () => useStore.getState().act((s) => cancelDispatch(s, m.id)) && useStore.getState().notify('Dispatch cancelled. The squad is back in the hall.'),
                })
              }
            >
              Cancel
            </Btn>
          </span>
        </div>
      )}
    </div>
  );
}

export function ContractsScreen() {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  const board = [...g.board].sort((a, b) => Number(!!b.story) - Number(!!a.story) || a.expiresWeek - b.expiresWeek);
  return (
    <div className="screen">
      <h1 className="screen-title">Contracts</h1>

      {g.missions.length > 0 && (
        <Section title={`In the field (${g.missions.length})`}>
          {g.missions.map((m) => (
            <MissionTrack key={m.id} m={m} g={g} />
          ))}
        </Section>
      )}

      <Section title="The Board" guide="board">
        {board.length === 0 && <Empty>No contracts this week.</Empty>}
        {board.map((c) => (
          <ContractCard key={c.id} c={c} g={g} onOpen={() => open({ kind: 'planner', contractId: c.id })} />
        ))}
      </Section>
    </div>
  );
}

function ContractCard({ c, g, onOpen }: { c: Contract; g: GameState; onOpen: () => void }) {
  const info = postingInfo(g, c);
  const expiring = c.expiresWeek <= g.week;
  return (
    <button className={`contract-card tappable ${c.story ? 'story' : ''}`} onClick={onOpen} style={{ ['--fc' as string]: FACTIONS[c.patron].color }}>
      <div className="card-row">
        <span className="type-icon" title={c.type}>
          <Icon name={CONTRACT_TYPE_ICON[c.type] ?? 'scroll'} size={24} />
        </span>
        <div className="card-main">
          <div className="row between">
            <b>{c.title}</b>
            <span className="reward">
              <Icon name="coin" size={14} /> {c.reward}
            </span>
          </div>
          <div className="row wrap gap">
            {c.op ? (
              <span className="faction-badge" style={{ ['--fc' as string]: RIVALS[c.op.rival].color }}>
                <Icon name={c.op.rival} size={12} /> Your operation against {RIVALS[c.op.rival].name}
              </span>
            ) : (
              <FactionBadge id={c.patron} />
            )}
            <span className="meta">{c.type}</span>
            <span className="meta">
              <Icon name={c.travelWeeks ? 'road' : 'urban'} size={14} />
              {c.region}
            </span>
            <span className="meta">
              <Icon name="clock" size={14} />
              {wk(info.weeks)}
            </span>
          </div>
        </div>
      </div>
      <div className="small x-posting">
        <b>{info.siteName}:</b> {info.goalText}.
      </div>
      <div className="tags">
        {c.tags.map((t) => (
          <TagChip key={t} id={t} />
        ))}
        {c.hidden.map((h, i) => (h.revealed ? <TagChip key={i} id={h.trueTag} /> : <span key={i} className="tag hidden">?</span>))}
        {c.contestedBy && (
          <span className="tag contested">
            <Icon name={c.contestedBy} size={14} /> {RIVALS[c.contestedBy].short}
          </span>
        )}
        {c.story && (
          <span className="tag story">
            <Icon name="quest" size={14} /> Story
          </span>
        )}
      </div>
      <div className="row between small">
        <ThreatPips value={c.threat} />
        <span className={expiring ? 'warn' : 'muted'}>{expiring ? 'Expires this week' : `${wk(c.expiresWeek - g.week + 1)} left`}</span>
      </div>
    </button>
  );
}
