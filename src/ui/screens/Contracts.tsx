import type React from 'react';
import { cancelDispatch, FACTIONS, RIVALS, missionWeeks, type Contract, type GameState, type Mission } from '../../engine';
import { Icon } from '../kit/icons';
import { CONTRACT_TYPE_ICON, OddsPill, PhaseStrip, Portrait, useBestOdds } from '../kit/visual';
import { useStore } from '../../store';
import { Empty, FactionBadge, Section, TagChip, ThreatPips } from '../kit/common';

/** Tappable only once there's a report to read; otherwise a plain panel. */
function MissionShell({ report, onOpen, children }: { report: boolean; onOpen: () => void; children: React.ReactNode }) {
  return report ? (
    <button className="mission-card tappable" onClick={onOpen}>
      {children}
    </button>
  ) : (
    <div className="mission-card">{children}</div>
  );
}

/** The strip-map: depart, travel, the phases on site, return home. */
function MissionTrack({ m, g }: { m: Mission; g: GameState }) {
  const open = useStore((s) => s.open);
  const c = m.contract;
  const travel = c.travelWeeks;
  type Node = { label: string; kind: 'town' | 'road' | 'site'; done: boolean; current?: boolean; result?: string };
  const nodes: Node[] = [];
  // each node is tied to the week it happens in
  const at = (week: number) => ({ done: g.week > week, current: g.week === week });
  nodes.push({ label: 'Varrow', kind: 'town', done: true });
  for (let i = 0; i < travel; i++) nodes.push({ label: 'Road', kind: 'road', ...at(m.dispatchedWeek + i) });
  c.phases.forEach((p, i) => {
    const log = m.report?.phases[i];
    nodes.push({ label: p.name, kind: 'site', done: !!m.report, current: !m.report && g.week === m.arriveWeek, result: log?.result ?? (m.report ? 'skipped' : undefined) });
  });
  for (let i = 0; i < travel; i++) nodes.push({ label: 'Road', kind: 'road', ...at(m.arriveWeek + 1 + i) });
  nodes.push({ label: 'Home', kind: 'town', done: false });

  const status = m.report
    ? `${m.report.tier} · ${m.returnWeek <= g.week ? 'home at the end of this week' : `home in ${m.returnWeek - g.week + 1} weeks`}`
    : m.arriveWeek === g.week
      ? 'Reaches the objective at the end of this week'
      : `Arrives in ${m.arriveWeek - g.week + 1} weeks`;

  const preparing = m.dispatchedWeek === g.week && !m.report;
  return (
    <div className="mission-wrap">
    <MissionShell report={!!m.report} onOpen={() => open({ kind: 'mission', id: m.id })}>
      <div className="row between">
        <b>{c.title}</b>
        <span className="small muted">{c.region}</span>
      </div>
      <div className="strip" aria-label="Mission route">
        {nodes.map((n, i) => (
          <div key={i} className={`node ${n.kind} ${n.done ? 'done' : ''} ${n.current ? 'current' : ''} ${n.result ? `r-${n.result}` : ''}`}>
            <span className="dot" />
            <span className="node-l">{n.kind === 'road' ? '' : n.label}</span>
          </div>
        ))}
      </div>
      <div className="row between small">
        <span className="squad-faces">
          {m.memberIds
            .map((id) => g.members.find((x) => x.id === id))
            .filter(Boolean)
            .map((x) => (
              <Portrait key={x!.id} m={x!} size={30} showStatus={false} />
            ))}
        </span>
        <span className="meta">
          <Icon name="clock" size={13} />
          {status}
        </span>
      </div>
      {m.report && <div className="tiny" style={{ marginTop: 4 }}>Tap to read the journal</div>}
      {!m.report && (
        <div className="row gap tiny muted" style={{ marginTop: 4 }}>
          Plan: <PhaseStrip c={c} chosen={m.approaches} />
        </div>
      )}
    </MissionShell>
    {preparing && (
      <div className="preparing">
        <span className="small">Leaving at the end of this week. Gear can still change:</span>
        <span className="row wrap gap">
          {m.memberIds.map((id) => {
            const x = g.members.find((y) => y.id === id)!;
            return (
              <button key={id} className="btn ghost small" onClick={() => open({ kind: 'member', id })}>
                <Icon name="armor" size={13} /> {x.name.split(' ')[0]}
              </button>
            );
          })}
          <button
            className="btn ghost small danger"
            onClick={() =>
              useStore.getState().confirm({
                title: 'Cancel this dispatch?',
                body: [`The squad stays home. The ${m.supplies} supplies they packed go back to the stores, and "${c.title}" returns to the board.`],
                confirmLabel: 'Cancel dispatch',
                onConfirm: () => useStore.getState().act((s) => cancelDispatch(s, m.id)) && useStore.getState().notify('Dispatch cancelled. The squad is back in the hall.'),
              })
            }
          >
            Cancel
          </button>
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

      <Section title={`In the field (${g.missions.length})`}>
        {g.missions.length === 0 && <Empty>No squads in the field.</Empty>}
        {g.missions.map((m) => (
          <MissionTrack key={m.id} m={m} g={g} />
        ))}
      </Section>

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
  const best = useBestOdds(g, c);
  const expiring = c.expiresWeek <= g.week;
  return (
    <button className={`contract-card tappable ${c.story ? 'story' : ''}`} onClick={onOpen} style={{ ['--fc' as string]: FACTIONS[c.patron].color }}>
      <div className="card-row">
        <span className="type-icon" title={c.type}>
          <Icon name={CONTRACT_TYPE_ICON[c.type] ?? 'scroll'} size={22} />
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
              <Icon name={c.travelWeeks ? 'road' : 'urban'} size={13} />
              {c.region}
            </span>
            <span className="meta">
              <Icon name="clock" size={13} />
              {missionWeeks(c, g)}w
            </span>
          </div>
        </div>
      </div>
      <div className="row between" style={{ marginTop: 6 }}>
        <PhaseStrip c={c} />
        {best ? <OddsPill min={best.min} max={best.max} label="best squad" /> : <span className="meta">Not enough people free</span>}
      </div>
      <div className="tags">
        {c.tags.map((t) => (
          <TagChip key={t} id={t} />
        ))}
        {c.hidden.map((h, i) => (h.revealed ? <TagChip key={i} id={h.trueTag} /> : <span key={i} className="tag hidden">?</span>))}
        {c.contestedBy && (
          <span className="tag contested">
            <Icon name={c.contestedBy} size={13} /> {RIVALS[c.contestedBy].short}
          </span>
        )}
        {c.story && (
          <span className="tag story">
            <Icon name="quest" size={13} /> Story
          </span>
        )}
      </div>
      <div className="row between small">
        <ThreatPips value={c.threat} />
        <span className={expiring ? 'warn' : 'muted'}>{expiring ? 'Expires this week' : `${c.expiresWeek - g.week + 1} wks left`}</span>
      </div>
    </button>
  );
}
