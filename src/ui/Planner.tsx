import { useMemo, useState } from 'react';
import {
  memberScore,
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
import { Icon } from './icons';
import { ap, APPROACHES, ApproachChip } from './visual';

/** Who is good at what: members × approaches, with the plan's approaches outlined. */
function StrengthMatrix({ g, members, used, preview }: { g: GameState; members: Member[]; used: Approach[]; preview: boolean }) {
  if (!members.length) return null;
  const rows = members.map((m) => ({ m, s: APPROACHES.map((a) => memberScore(g, m, a, { tags: [], countered: new Set(), members: [m] }).score) }));
  const max = APPROACHES.map((_, i) => Math.max(1, ...rows.map((r) => r.s[i])));
  return (
    <div>
      <p className="tiny muted">{preview ? 'Who is good at what (select members above):' : 'Your squad’s strengths. Outlined columns are used in your plan:'}</p>
      <table className="matrix">
        <thead>
          <tr>
            <th />
            {APPROACHES.map((a) => (
              <th key={a} className={used.includes(a) ? 'used' : ''} style={{ ['--c' as string]: ap(a), color: ap(a) }} title={APPROACH_INFO[a].name}>
                <Icon name={a} size={16} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ m, s }) => (
            <tr key={m.id}>
              <td className="name">{m.name.split(' ')[0]}</td>
              {s.map((v, i) => (
                <td
                  key={i}
                  className={used.includes(APPROACHES[i]) ? 'used' : ''}
                  style={{ ['--c' as string]: ap(APPROACHES[i]), background: `color-mix(in srgb, ${ap(APPROACHES[i])} ${Math.round((v / max[i]) * 55)}%, var(--paper))` }}
                >
                  {v.toFixed(0)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContractHeader({ c, game }: { c: Contract; game: GameState }) {
  const act = useStore((s) => s.act);
  const [flash, setFlash] = useState<number | null>(null);
  const reveal = (i: number) => {
    const h = c.hidden[i];
    const { confirm, notify } = useStore.getState();
    if (game.intel < INTEL_REVEAL_COST) {
      notify(`Revealing costs ${INTEL_REVEAL_COST} Intel and you have ${game.intel}. Set members to Gather Rumors, or send a Scout ahead.`);
      return;
    }
    confirm({
      title: 'Reveal a hidden danger?',
      body: [
        `Your informants will find out which of these you'll face: ${h.candidates.map((t) => TAGS[t]?.name ?? t).join(', ')}.`,
        'Knowing turns the odds range into an exact number, and tells you what gear to bring.',
      ],
      cost: `Costs ${INTEL_REVEAL_COST} Intel · you have ${game.intel}, leaving ${game.intel - INTEL_REVEAL_COST}`,
      confirmLabel: `Spend ${INTEL_REVEAL_COST} Intel`,
      onConfirm: () => {
        if (act((g) => revealTag(g, c.id, i))) {
          setFlash(i);
          window.setTimeout(() => setFlash(null), 2200);
          notify(`Revealed: ${TAGS[h.trueTag]?.name}. ${TAGS[h.trueTag]?.description}`);
        }
      },
    });
  };
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
            <span key={`h${i}`} className={flash === i ? 'flash' : ''}>
              <TagChip id={h.trueTag} />
            </span>
          ) : (
            <TagChip key={`h${i}`} hidden candidates={h.candidates} onClick={() => reveal(i)} />
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
    if (pv.risk === 'High' || pv.risk === 'Deadly' || pv.overall.max < 0.4) {
      useStore.getState().confirm({
        title: pv.risk === 'Deadly' ? 'This could get people killed' : 'Send them anyway?',
        body: [
          `Risk: ${pv.risk}. The objective succeeds ${chanceText(pv.overall.min, pv.overall.max)} of the time.`,
          'Failed phases wound people, and wounds can kill. Better gear, a different approach, or revealing hidden tags may improve the odds.',
        ],
        confirmLabel: 'Dispatch',
        danger: true,
        onConfirm: send,
      });
    } else send();
  };
  const send = () => {
    const ok = act((g) => {
      const err = dispatchMission(g, c.id, selected, approaches, retreat);
      if (!err) for (const id of selected) setAssignment(g, id, 'rest');
      return err;
    });
    if (ok) {
      closeAll();
      useStore.getState().notify(
        `${members.map((m) => m.name.split(' ')[0]).join(', ')} set out for ${c.region} carrying ${pv.supplies} supplies. ${
          c.travelWeeks ? `They arrive in ${c.travelWeeks} week${c.travelWeeks > 1 ? 's' : ''}.` : 'Results at the end of this week.'
        }`,
      );
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
            {members.length > 0 ? <span className={`risk risk-${pv.risk.toLowerCase()}`}>Risk: {pv.risk}</span> : <span className="muted">Risk: —</span>}
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
      <StrengthMatrix g={game} members={members.length ? members : available} used={approaches} preview={!members.length} />
      {pv.countered.length > 0 && (
        <p className="good small">Prepared for: {pv.countered.map((t) => TAGS[t]?.name).join(', ')}</p>
      )}

      <h3 className="subhead">Plan of action</h3>
      {members.length === 0 && <p className="hint">Select members to see your odds for each phase.</p>}
      <ol className="phases">
        {pv.phases.map((p, i) => (
          <li key={i} className={`phase ap-${p.approach}`} style={{ ['--c' as string]: ap(p.approach) }}>
            <div className="row between">
              <strong>
                {i + 1}. {p.phase.name}
              </strong>
              {i === c.phases.length - 1 && <span className="badge">Objective</span>}
            </div>
            <p className="muted small">{p.phase.text}</p>
            <div className="approach-row">
              {p.phase.approaches.map((a) => (
                <ApproachChip key={a} a={a} on={a === p.approach} onClick={() => setManual({ ...manual, [i]: a })} />
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
