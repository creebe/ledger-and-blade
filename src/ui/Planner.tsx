import { useMemo, useState } from 'react';
import {
  APPROACH_INFO,
  bestApproaches,
  dispatchMission,
  INTEL_REVEAL_COST,
  living,
  PROFESSIONS,
  previewMission,
  REGIONS,
  revealTag,
  setAssignment,
  TAGS,
  type Approach,
  type Contract,
  type GameState,
  type Member,
} from '../engine';
import { useStore } from '../store';
import { ChanceBar, FactionBadge, Sheet, TagChip, ThreatPips } from './common';
import { chanceText, signed } from './format';
import { MemberMini } from './MemberSheet';

export function ContractHeader({ c, game }: { c: Contract; game: GameState }) {
  const act = useStore((s) => s.act);
  return (
    <div className="contract-head">
      <div className="row wrap gap">
        <FactionBadge id={c.patron} />
        <span className="muted">{c.type}</span>
        <span className="muted">· {c.region}{c.travelWeeks ? ` (${c.travelWeeks}w away)` : ''}</span>
      </div>
      <p className="desc">{c.description}</p>
      <div className="row between">
        <span>
          Threat <ThreatPips value={c.threat} />
        </span>
        <span className="reward">◉ {c.reward}</span>
      </div>
      <div className="tags">
        {c.tags.map((t) => (
          <TagChip key={t} id={t} />
        ))}
        {c.hidden.map((h, i) =>
          h.revealed ? (
            <TagChip key={`h${i}`} id={h.trueTag} />
          ) : (
            <TagChip
              key={`h${i}`}
              hidden
              candidates={h.candidates}
              onClick={() => {
                if (game.intel < INTEL_REVEAL_COST) useStore.getState().notify(`Revealing costs ${INTEL_REVEAL_COST} Intel. Assign members to gather rumors or scout.`);
                else act((g) => revealTag(g, c.id, i));
              }}
            />
          ),
        )}
      </div>
      {c.hidden.some((h) => !h.revealed) && (
        <p className="hint">Unknown tags make the odds a range. Tap a “?” to reveal it for {INTEL_REVEAL_COST} Intel (you have {game.intel}), or send a Scout ahead from the Roster.</p>
      )}
      {c.contestedBy && <p className="warn">⚔ Hobb & Daughters want this one. It may not last the week.</p>}
      <p className="muted small">
        Expires {c.expiresWeek <= game.week ? 'this week' : `in ${c.expiresWeek - game.week + 1} weeks`} · squad {c.minSquad}–{c.maxSquad}
      </p>
    </div>
  );
}

export function Planner({ contractId }: { contractId: string }) {
  const game = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const open = useStore((s) => s.open);
  const closeAll = useStore((s) => s.closeAll);
  const c = game.board.find((x) => x.id === contractId);
  const [selected, setSelected] = useState<string[]>([]);
  const [manual, setManual] = useState<Record<number, Approach>>({});
  const [retreat, setRetreat] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const crew = living(game);
  const members = useMemo(() => selected.map((id) => crew.find((m) => m.id === id)).filter(Boolean) as Member[], [selected, crew]);

  if (!c) {
    return (
      <Sheet title="Contract gone">
        <p>This contract is no longer on the board.</p>
      </Sheet>
    );
  }

  const auto = bestApproaches(game, c, members);
  const approaches = c.phases.map((_, i) => manual[i] ?? auto[i]);
  const pv = previewMission(game, c, members, approaches);
  const available = crew.filter((m) => m.status === 'idle');
  const busy = crew.filter((m) => m.status !== 'idle');

  const toggle = (m: Member) => {
    if (selected.includes(m.id)) setSelected(selected.filter((x) => x !== m.id));
    else if (selected.length < c.maxSquad) setSelected([...selected, m.id]);
    else useStore.getState().notify(`At most ${c.maxSquad} members`);
  };

  const canSend = members.length >= c.minSquad && game.supplies >= pv.supplies;
  const dispatch = () => {
    const ok = act((g) => {
      const err = dispatchMission(g, c.id, selected, approaches, retreat);
      if (!err) for (const id of selected) setAssignment(g, id, 'rest');
      return err;
    });
    if (ok) {
      closeAll();
      useStore.getState().notify(`Squad dispatched to ${c.region}`);
    }
  };

  return (
    <Sheet
      title={c.title}
      footer={
        <div className="planner-foot">
          <div className="row between small">
            <span>
              Supplies {pv.supplies} <span className="muted">(have {game.supplies})</span>
            </span>
            <span>
              Takes {pv.weeks} week{pv.weeks > 1 ? 's' : ''}
            </span>
            <span className={`risk risk-${pv.risk.toLowerCase()}`}>Risk: {pv.risk}</span>
          </div>
          <button className="btn primary block" disabled={!canSend} onClick={dispatch}>
            {members.length < c.minSquad ? `Select at least ${c.minSquad}` : game.supplies < pv.supplies ? 'Not enough supplies' : `Dispatch squad (${members.length})`}
          </button>
        </div>
      }
    >
      <ContractHeader c={c} game={game} />

      <h3 className="subhead">Squad</h3>
      <div className="member-pick">
        {available.map((m) => (
          <MemberMini key={m.id} m={m} selected={selected.includes(m.id)} onClick={() => toggle(m)} onLongPress={() => open({ kind: 'member', id: m.id })} disabled={m.health < 40} />
        ))}
        {busy.map((m) => (
          <MemberMini key={m.id} m={m} disabled onClick={() => open({ kind: 'member', id: m.id })} />
        ))}
      </div>
      {members.length > 0 && (
        <div className="row wrap gap small">
          {members.map((m) => (
            <button key={m.id} className="btn ghost small" onClick={() => open({ kind: 'member', id: m.id })}>
              ⚙ Gear: {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}
      {pv.countered.length > 0 && (
        <p className="good small">Prepared for: {pv.countered.map((t) => TAGS[t]?.name).join(', ')}</p>
      )}

      <h3 className="subhead">Plan of action</h3>
      {members.length === 0 && <p className="hint">Select members to see your odds for each phase.</p>}
      <ol className="phases">
        {pv.phases.map((p, i) => (
          <li key={i} className="phase">
            <div className="row between">
              <strong>
                {i + 1}. {p.phase.name}
              </strong>
              {i === c.phases.length - 1 && <span className="badge">Objective</span>}
            </div>
            <p className="muted small">{p.phase.text}</p>
            <div className="approach-row">
              {p.phase.approaches.map((a) => (
                <button
                  key={a}
                  className={`approach ${a === p.approach ? 'on' : ''}`}
                  onClick={() => setManual({ ...manual, [i]: a })}
                  title={APPROACH_INFO[a].blurb}
                >
                  {APPROACH_INFO[a].icon} {APPROACH_INFO[a].name}
                </button>
              ))}
            </div>
            {members.length > 0 && (
              <>
                <button className="bar-btn" onClick={() => setExpanded(expanded === i ? null : i)} aria-expanded={expanded === i}>
                  <ChanceBar min={p.min} max={p.max} />
                  <span className="small muted">{expanded === i ? 'Hide' : 'Why?'}</span>
                </button>
                {expanded === i && (
                  <div className="breakdown">
                    <p className="small muted">{APPROACH_INFO[p.approach].blurb}</p>
                    <div className="cols">
                      <div>
                        <h4>Squad {p.score.score.toFixed(1)}</h4>
                        <p className="tiny muted">{p.score.method}</p>
                        {p.score.members.map((m) => (
                          <details key={m.id}>
                            <summary>
                              {m.name.split(' ')[0]} <b>{m.score.toFixed(1)}</b>
                            </summary>
                            <ul className="parts">
                              {m.parts.map((x, k) => (
                                <li key={k} className={x.value < 0 ? 'neg' : ''}>
                                  {x.label} <span>{signed(x.value)}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ))}
                      </div>
                      <div>
                        <h4>Difficulty {p.difficulty.value.toFixed(1)}</h4>
                        <ul className="parts">
                          {p.difficulty.parts.map((x, k) => (
                            <li key={k} className={x.value > 0 && k > 0 ? 'neg' : ''}>
                              {x.label} <span>{k === 0 ? x.value.toFixed(1) : signed(x.value)}</span>
                            </li>
                          ))}
                        </ul>
                        {!p.certain && <p className="tiny muted">Known tags only. Unknown tags may change this; see the range.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
      {members.length > 0 && (
        <p className="small muted">
          Mission succeeds if the objective succeeds: {chanceText(pv.overall.min, pv.overall.max)} before knock-on effects. A strong result in one phase makes the next easier,
          and a failure makes it harder.
        </p>
      )}
      <label className="toggle">
        <input type="checkbox" checked={retreat} onChange={(e) => setRetreat(e.target.checked)} />
        <span>Withdraw if anyone is critically wounded (safer, but the contract fails)</span>
      </label>
      <p className="tiny muted">Hold a member to see their gear and details. Destination: {REGIONS[Object.keys(REGIONS).find((k) => REGIONS[k].name === c.region) ?? 'varrow']?.description}</p>
      <p className="tiny muted">
        Professions: {[...new Set(members.map((m) => PROFESSIONS[m.profession].name))].join(', ') || 'none selected'}
      </p>
    </Sheet>
  );
}
