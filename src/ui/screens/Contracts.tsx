import { FACTIONS, RIVALS, postingInfo, squadLimit, squadsOut, type Contract, type GameState } from '../../engine';
import { Icon } from '../kit/icons';
import { CONTRACT_TYPE_ICON } from '../kit/visual';
import { useStore } from '../../store';
import { Empty, FactionBadge, Section, TagChip, ThreatPips } from '../kit/common';
import { plural, wk } from '../kit/format';
import { HiddenTag } from '../kit/reveal';
import { SquadBadge } from '../expeditions/SquadStrip';

export function ContractsScreen() {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  const setTab = useStore((s) => s.setTab);
  const away = g.missions.filter((m) => !m.report).sort((a, b) => a.number - b.number);
  const out = squadsOut(g);
  const limit = squadLimit(g);
  const board = [...g.board].sort((a, b) => Number(!!b.story) - Number(!!a.story) || a.expiresWeek - b.expiresWeek);
  return (
    <div className="screen">
      <h1 className="screen-title">Contracts</h1>

      {away.length > 0 && (
        <button className="tappable x-field-link" onClick={() => setTab('field')}>
          <span className="x-field-link-badges">
            {away.map((m) => (
              <SquadBadge key={m.id} n={m.number} />
            ))}
          </span>
          <span className="small">
            {plural(away.length, 'squad')} out. Follow them in the Field.
          </span>
        </button>
      )}

      <Section
        title="The Board"
        guide="board"
        right={
          <span className={`small x-board-limit ${out >= limit ? 'warn' : 'muted'}`}>
            {out} of {limit} squads out
          </span>
        }
      >
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
    // a div, not a button, so the "?" tags inside it can be buttons of their own
    <div
      role="button"
      tabIndex={0}
      className={`contract-card tappable ${c.story ? 'story' : ''}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ ['--fc' as string]: FACTIONS[c.patron].color }}
    >
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
        {c.hidden.map((h, i) => (h.revealed ? <TagChip key={i} id={h.trueTag} /> : <HiddenTag key={i} c={c} i={i} />))}
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
    </div>
  );
}
