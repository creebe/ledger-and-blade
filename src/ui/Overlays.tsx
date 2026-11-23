import { useState } from 'react';
import { APPROACH_INFO, canChoose, checkDetail, dateLabel, PROFESSIONS, resolveEvent, type GameEvent } from '../engine';
import { exportSave, importSave, slotInfo, snap, useStore, type ResourceSnap } from '../store';
import { ChanceBar, Sheet } from './common';
import { pct } from './format';
import { useTheme } from './theme';
import { Icon } from './icons';
import { ap, APPROACHES, ApproachChip, OddsPill } from './visual';
import { DispatchItem } from './screens/Hall';

export function EventCard({ ev }: { ev: GameEvent }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const member = ev.memberId ? g.members.find((m) => m.id === ev.memberId) : undefined;
  const transcript = ev.transcript ?? [];
  return (
    <div className="event-backdrop">
      <div className="event-card" role="dialog" aria-modal="true">
        <p className="tiny muted">
          {dateLabel(g.week)}
          {member ? ` · ${member.name}, ${PROFESSIONS[member.profession].name}` : ''}
        </p>
        <h2>{ev.title}</h2>
        {transcript.length > 0 && (
          <div className="transcript">
            {transcript.map((t, i) => (
              <div key={i} className="exchange">
                <p className="you">▸ {t.choice}</p>
                {t.reply && <p className="reply small">{t.reply}</p>}
              </div>
            ))}
          </div>
        )}
        <div className="event-node" key={ev.node ?? 'root'}>
          {ev.speaker && <p className="speaker">{ev.speaker}</p>}
          {ev.text.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="choices" key={`c-${ev.node ?? 'root'}-${transcript.length}`}>
          {ev.choices.map((c, i) => {
            const blocked = canChoose(g, c);
            const chk = checkDetail(g, c);
            const leadsOn = !!c.next;
            return (
              <button key={i} className={`choice ${leadsOn ? 'talk' : ''}`} disabled={!!blocked} onClick={() => act((d) => resolveEvent(d, ev.uid, i))}>
                <b>
                  {leadsOn && !c.detail ? '💬 ' : ''}
                  {c.label}
                </b>
                {c.detail && <span className="small">{c.detail}</span>}
                {chk && (
                  <span className="small check">
                    <Icon name={c.check!.approach} size={14} style={{ color: ap(c.check!.approach) }} /> {APPROACH_INFO[c.check!.approach].name} check: <b>{pct(chk.chance)}</b>
                    {chk.who ? ` (${chk.who.split(' ')[0]} tries)` : ' (no one at home to try: your people are away)'}
                  </span>
                )}
                {blocked && <span className="small bad">{blocked}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const RES_LABEL: { key: keyof ResourceSnap; icon: string; name: string; invert?: boolean }[] = [
  { key: 'crowns', icon: 'coin', name: 'Crowns' },
  { key: 'supplies', icon: 'sack', name: 'Supplies' },
  { key: 'intel', icon: 'eye', name: 'Intel' },
  { key: 'influence', icon: 'seal', name: 'Influence' },
  { key: 'renown', icon: 'star', name: 'Renown' },
  { key: 'heat', icon: 'flame', name: 'Heat', invert: true },
];

export function WeekReport({ dispatchIds, week, before }: { dispatchIds: string[]; week: number; before: ResourceSnap }) {
  const g = useStore((s) => s.game)!;
  const close = useStore((s) => s.close);
  const items = g.dispatches.filter((d) => dispatchIds.includes(d.id));
  const after = snap(g);
  const last = g.ledger[g.ledger.length - 1];
  const changes = RES_LABEL.map((r) => ({ ...r, delta: Math.round((after[r.key] - before[r.key]) * 10) / 10 })).filter((r) => r.delta !== 0);
  const missions = items.filter((d) => d.kind === 'mission');
  const rest = items.filter((d) => d.kind !== 'mission');
  return (
    <Sheet
      title={`End of week · ${dateLabel(week)}`}
      footer={
        <button className="btn primary block" onClick={close}>
          Begin {dateLabel(g.week)}
        </button>
      }
    >
      <div className="delta-row">
        {changes.length === 0 && <span className="muted small">No change to your resources.</span>}
        {changes.map((c, i) => {
          const good = c.invert ? c.delta < 0 : c.delta > 0;
          return (
            <span key={c.key} className={`delta-chip ${good ? 'up' : 'down'}`} style={{ animationDelay: `${i * 0.08}s` }}>
              <Icon name={c.icon} size={14} /> {c.delta > 0 ? '+' : ''}
              {c.delta} <small>{c.name}</small>
            </span>
          );
        })}
      </div>
      {last && (
        <details className="small">
          <summary>Where the crowns went</summary>
          <ul className="parts">
            {Object.entries(last.income).map(([k, v]) => (
              <li key={k}>
                {k} <span>+{v}</span>
              </li>
            ))}
            {Object.entries(last.expenses).map(([k, v]) => (
              <li key={k} className="neg">
                {k} <span>−{v}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {missions.length > 0 && <h3 className="subhead">From the field</h3>}
      {missions.map((d) => (
        <DispatchItem key={d.id} d={d} />
      ))}
      {rest.length > 0 && <h3 className="subhead">News</h3>}
      {items.length === 0 && <p className="muted">A quiet week.</p>}
      {rest.map((d) => (
        <DispatchItem key={d.id} d={d} />
      ))}
    </Sheet>
  );
}

const STAMP: Record<string, string> = { strong: 'Decisive', success: 'Success', fail: 'Failed', severe: 'Disaster' };

export function MissionReplay({ id }: { id: string }) {
  const g = useStore((s) => s.game)!;
  const m = [...g.missions, ...g.history].find((x) => x.id === id);
  const [skip, setSkip] = useState(false);
  if (!m?.report) return null;
  const r = m.report;
  // reveal one line at a time, like a journal being read aloud
  let t = 0;
  const LINE = skip ? 0 : 0.55;
  const next = (extra = 0) => {
    const at = t;
    t += LINE + extra;
    return { animationDelay: `${at}s` };
  };
  const name = (mid?: string) => g.members.find((x) => x.id === mid)?.name.split(' ')[0];
  const squad = m.memberIds.map((x) => g.members.find((y) => y.id === x)).filter(Boolean);
  return (
    <Sheet title={m.contract.title}>
      <div className="row between small">
        <span className="muted">
          {m.contract.region} · {squad.map((x) => (x!.status === 'dead' ? `✝ ${x!.name.split(' ')[0]}` : x!.name.split(' ')[0])).join(', ')}
        </span>
        {!skip && (
          <button className="btn ghost small" onClick={() => setSkip(true)}>
            Skip ⏭
          </button>
        )}
      </div>
      <div className="journal">
        {r.outbound && (
          <section className="j-section">
            <h4 className="j-head" style={next()}>
              {r.outbound.title}
            </h4>
            {r.outbound.lines.map((l, i) => (
              <p key={i} className="j-line" style={next()}>
                {l}
              </p>
            ))}
          </section>
        )}
        {r.phases.map((p, i) => (
          <section key={i} className={`phase-card r-${p.result}`} style={{ ...next(), borderLeft: `4px solid ${ap(p.approach)}` }}>
            <div className="row between">
              <b>
                {i + 1}. {p.phase}
              </b>
              <span className="meta">
                <Icon name={p.approach} size={14} style={{ color: ap(p.approach) }} />
                {APPROACH_INFO[p.approach].name}
                {p.lead ? ` · ${name(p.lead)}` : ''}
              </span>
            </div>
            {(p.story ?? []).map((l, k) => (
              <p key={k} className="j-line" style={next()}>
                {l}
              </p>
            ))}
            <div className="j-line" style={next()}>
              <ChanceBar min={p.chance} max={p.chance} animate={!skip} />
            </div>
            <span className="stamp" style={next(0.2)}>
              {STAMP[p.result]}
            </span>
            {p.lines.slice(1).map((l, k) => (
              <p key={k} className="j-line wound small" style={next()}>
                {l}
              </p>
            ))}
          </section>
        ))}
        {r.phases.length < m.contract.phases.length && (
          <section className="phase-card r-skipped" style={next()}>
            <b>Withdrawn</b>
            <p className="small muted">The remaining phases were abandoned.</p>
          </section>
        )}
        {r.homeward && (
          <section className="j-section">
            <h4 className="j-head" style={next()}>
              {r.homeward.title}
            </h4>
            {r.homeward.lines.map((l, i) => (
              <p key={i} className="j-line" style={next()}>
                {l}
              </p>
            ))}
          </section>
        )}
      </div>
      <div className={`outcome t-${r.tier.replace(' ', '-').toLowerCase()}`} style={next()}>
        <h3>{r.tier}</h3>
        {r.summary.map((s, i) => (
          <p key={i} className="small">
            {s}
          </p>
        ))}
      </div>
    </Sheet>
  );
}

export function ConfirmSheet({ title, body, cost, confirmLabel, danger, onConfirm }: { title: string; body: string[]; cost?: string; confirmLabel: string; danger?: boolean; onConfirm: () => void }) {
  const close = useStore((s) => s.close);
  return (
    <div className="event-backdrop" onClick={close}>
      <div className="confirm-card" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {body.map((b, i) => (
          <p key={i} className="small">
            {b}
          </p>
        ))}
        {cost && <p className="cost">{cost}</p>}
        <div className="row gap">
          <button className="btn ghost block" onClick={close}>
            Cancel
          </button>
          <button
            className={`btn block ${danger ? 'danger' : 'primary'}`}
            onClick={() => {
              close();
              onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WarningsSheet({ warnings }: { warnings: string[] }) {
  const close = useStore((s) => s.close);
  const endWeek = useStore((s) => s.endWeek);
  return (
    <Sheet
      title="Before you end the week…"
      footer={
        <div className="row gap">
          <button className="btn ghost block" onClick={close}>
            Go back
          </button>
          <button
            className="btn primary block"
            onClick={() => {
              close();
              endWeek();
            }}
          >
            End week anyway
          </button>
        </div>
      }
    >
      <ul className="alerts">
        {warnings.map((w, i) => (
          <li key={i} className="warn">
            {w}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export function MenuSheet() {
  const g = useStore((s) => s.game);
  const { saveSlot, loadSlot, quit, open, loadGame, notify } = useStore.getState();
  const [exported, setExported] = useState('');
  const [importText, setImportText] = useState('');
  return (
    <Sheet title="Guild Ledger">
      <h3 className="subhead">Save</h3>
      {[1, 2, 3].map((n) => {
        const info = slotInfo(n);
        return (
          <div key={n} className="row between slot-row">
            <span className="small">
              Slot {n}: {info ? `Week ${info.week}, ${info.crowns}◉` : 'empty'}
            </span>
            <span className="row gap">
              {g && (
                <button
                  className="btn ghost small"
                  onClick={() =>
                    info
                      ? useStore.getState().confirm({ title: `Overwrite slot ${n}?`, body: `Slot ${n} holds a save from week ${info.week}. It will be replaced with your current game.`, confirmLabel: 'Overwrite', danger: true, onConfirm: () => saveSlot(n) })
                      : saveSlot(n)
                  }
                >
                  Save
                </button>
              )}
              <button
                className="btn ghost small"
                disabled={!info}
                onClick={() =>
                  useStore.getState().confirm({
                    title: `Load slot ${n}?`,
                    body: g ? 'Your current game will be replaced by this save. Anything not saved to a slot will be lost.' : 'Load this save?',
                    confirmLabel: 'Load',
                    onConfirm: () => loadSlot(n),
                  })
                }
              >
                Load
              </button>
            </span>
          </div>
        );
      })}
      <p className="tiny muted">The game also autosaves after every action.</p>
      <h3 className="subhead">Transfer</h3>
      {g && (
        <button className="btn ghost small" onClick={() => setExported(exportSave(g))}>
          Export save as text
        </button>
      )}
      {exported && <textarea className="textarea" readOnly value={exported} onFocus={(e) => e.currentTarget.select()} />}
      <textarea className="textarea" placeholder="Paste a save here to import" value={importText} onChange={(e) => setImportText(e.target.value)} />
      <button
        className="btn ghost small"
        disabled={!importText}
        onClick={() => {
          const imp = importSave(importText);
          if (!imp) return notify('That save could not be read');
          loadGame(imp);
        }}
      >
        Import
      </button>
      <h3 className="subhead">Display</h3>
      <ThemeRow />
      <h3 className="subhead">Game</h3>
      <div className="row wrap gap">
        <button className="btn ghost small" onClick={() => open({ kind: 'help' })}>
          How to play
        </button>
        {g && (
          <button className="btn ghost small" onClick={quit}>
            Back to title
          </button>
        )}
      </div>
    </Sheet>
  );
}

function ThemeRow() {
  const [theme, toggle] = useTheme();
  return (
    <div className="row between slot-row">
      <span className="small">Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
      <button className="btn ghost small" onClick={toggle}>
        Switch to {theme === 'dark' ? '☀ light' : '☾ dark'}
      </button>
    </div>
  );
}

export function HelpSheet() {
  return (
    <Sheet title="How to play">
      <div className="help">
        <p>
          You run <b>Ledger & Blade</b>, a guild in Varrow, a city drowning in the realm's debt to Ostrander's bank. Each turn is one week. Plan freely, then press <b>End Week</b>, and everything you set in motion
          resolves at once.
        </p>
        <h4>Reading the colors</h4>
        <div className="legend">
          {APPROACHES.map((a) => (
            <div key={a} className="legend-row">
              <ApproachChip a={a} small />
              <span className="small muted">{APPROACH_INFO[a].blurb}</span>
            </div>
          ))}
          <div className="legend-row">
            <span className="tag enemy">
              <Icon name="soldiers" size={13} /> Enemy
            </span>
            <span className="tag env">
              <Icon name="cold" size={13} /> Terrain
            </span>
            <span className="small muted">Tags: what you'll face. Dashed “?” tags are unknown.</span>
          </div>
          <div className="legend-row">
            <OddsPill min={0.8} max={0.8} />
            <OddsPill min={0.45} max={0.65} />
            <OddsPill min={0.2} max={0.3} />
            <span className="small muted">Good, uncertain, poor odds.</span>
          </div>
        </div>
        <h4>The ledger</h4>
        <p>
          Wages, hall upkeep and supplies are due every week, and your Weighhouse loan wants a payment every four. Four weeks in the red, or three missed loan payments, and the guild is finished. The Hall shows a
          four-week projection.
        </p>
        <h4>Contracts</h4>
        <p>
          Pick a contract and choose a squad. Each mission is a series of <b>phases</b>, and each phase can be tackled with an <b>approach</b>: Assault, Stealth, Guile, Endurance or Arcana. Every approach uses
          different attributes and adds up the squad differently. Stealth is only as good as your clumsiest member, while Assault counts everyone's blades.
        </p>
        <p>
          Phase odds come from your squad's score against the phase's difficulty. Tap <b>Why?</b> to see every number. The final phase is the objective. Strong results make the next phase easier, and failures make
          it harder and hurt people.
        </p>
        <h4>Tags and preparation</h4>
        <p>
          Enemies and environments have <b>tags</b>. Armored enemies laugh at swords but fear hammers, Fireborn shrug off fire but dread frost, and Cold saps endurance unless someone packs furs. Weapons, oils, salts
          and kit counter tags. Unknown tags (“?”) turn your odds into a <b>range</b>. Spend Intel or send a Scout ahead to know what you face.
        </p>
        <h4>People</h4>
        <p>
          Members tire, bleed, level up and can die for good. Wounded and exhausted members perform badly, so rest them. Idle members can train, gather rumors (Intel), work the docks, or scout a contract. Unpaid or
          unhappy members lose loyalty, and Hobb & Daughters will poach the disloyal.
        </p>
        <h4>The realm</h4>
        <p>
          Every contract pleases someone and annoys someone else. Watch your standing with the Exchequer (who holds your charter), the Weighhouse, Ostrander's and the Lower Town, and keep your Heat low. The Debt
          clocks show where the realm is heading.
        </p>
      </div>
    </Sheet>
  );
}
