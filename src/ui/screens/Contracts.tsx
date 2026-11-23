import { APPROACH_INFO, FACTIONS, type GameState, type Mission } from '../../engine';
import { useStore } from '../../store';
import { Empty, FactionBadge, Section, TagChip, ThreatPips } from '../common';

/** The strip-map: depart, travel, the phases on site, return home. */
export function MissionTrack({ m, g }: { m: Mission; g: GameState }) {
  const open = useStore((s) => s.open);
  const c = m.contract;
  const travel = c.travelWeeks;
  type Node = { label: string; kind: 'town' | 'road' | 'phase'; done: boolean; current?: boolean; result?: string };
  const nodes: Node[] = [];
  // each node is tied to the week it happens in
  const at = (week: number) => ({ done: g.week > week, current: g.week === week });
  nodes.push({ label: 'Varrow', kind: 'town', done: true });
  for (let i = 0; i < travel; i++) nodes.push({ label: 'Road', kind: 'road', ...at(m.dispatchedWeek + i) });
  c.phases.forEach((p, i) => {
    const log = m.report?.phases[i];
    nodes.push({ label: p.name, kind: 'phase', done: !!m.report, current: !m.report && g.week === m.arriveWeek, result: log?.result ?? (m.report ? 'skipped' : undefined) });
  });
  for (let i = 0; i < travel; i++) nodes.push({ label: 'Road', kind: 'road', ...at(m.arriveWeek + 1 + i) });
  nodes.push({ label: 'Home', kind: 'town', done: false });

  const status = m.report
    ? `${m.report.tier} · ${m.returnWeek <= g.week ? 'home at the end of this week' : `home in ${m.returnWeek - g.week + 1} weeks`}`
    : m.arriveWeek === g.week
      ? 'Reaches the objective at the end of this week'
      : `Arrives in ${m.arriveWeek - g.week + 1} weeks`;

  return (
    <button className="mission-card" onClick={() => (m.report ? open({ kind: 'mission', id: m.id }) : undefined)}>
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
        <span>{status}</span>
        <span className="muted">
          {m.memberIds
            .map((id) => g.members.find((x) => x.id === id)?.name.split(' ')[0])
            .filter(Boolean)
            .join(', ')}
        </span>
      </div>
      {!m.report && (
        <div className="tiny muted">
          Plan: {m.approaches.map((a) => APPROACH_INFO[a].icon + ' ' + APPROACH_INFO[a].name).join(' → ')}
        </div>
      )}
    </button>
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

      <Section title="The Board">
        {board.length === 0 && <Empty>No contracts this week.</Empty>}
        {board.map((c) => (
          <button key={c.id} className={`contract-card ${c.story ? 'story' : ''}`} onClick={() => open({ kind: 'planner', contractId: c.id })} style={{ ['--fc' as string]: FACTIONS[c.patron].color }}>
            <div className="row between">
              <b>{c.title}</b>
              <span className="reward">◉ {c.reward}</span>
            </div>
            <div className="row wrap gap small">
              <FactionBadge id={c.patron} />
              <span className="muted">{c.type}</span>
              <span className="muted">· {c.region}</span>
              {c.travelWeeks > 0 && <span className="muted">· {c.travelWeeks * 2 + 1} wks</span>}
            </div>
            <div className="row between small">
              <ThreatPips value={c.threat} />
              <span className={c.expiresWeek <= g.week ? 'warn' : 'muted'}>{c.expiresWeek <= g.week ? 'Expires this week' : `${c.expiresWeek - g.week + 1} wks left`}</span>
            </div>
            <div className="tags">
              {c.tags.map((t) => (
                <TagChip key={t} id={t} />
              ))}
              {c.hidden.map((h, i) => (h.revealed ? <TagChip key={i} id={h.trueTag} /> : <span key={i} className="tag hidden">?</span>))}
              {c.contestedBy && <span className="tag contested">⚔ Contested</span>}
              {c.story && <span className="tag story">★ Story</span>}
            </div>
          </button>
        ))}
      </Section>
    </div>
  );
}
