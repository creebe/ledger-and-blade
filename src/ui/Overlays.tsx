import { useState } from 'react';
import { APPROACH_INFO, canChoose, dateLabel, eventCheckChance, resolveEvent, type GameEvent } from '../engine';
import { exportSave, importSave, slotInfo, useStore } from '../store';
import { ChanceBar, Sheet } from './common';
import { pct } from './format';
import { DispatchItem } from './screens/Hall';

export function EventCard({ ev }: { ev: GameEvent }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  return (
    <div className="event-backdrop">
      <div className="event-card" role="dialog" aria-modal="true">
        <p className="tiny muted">{dateLabel(g.week)}</p>
        <h2>{ev.title}</h2>
        {ev.text.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="choices">
          {ev.choices.map((c, i) => {
            const blocked = canChoose(g, c);
            const chance = eventCheckChance(g, c);
            return (
              <button key={i} className="choice" disabled={!!blocked} onClick={() => act((d) => resolveEvent(d, ev.uid, i))}>
                <b>{c.label}</b>
                {c.detail && <span className="small">{c.detail}</span>}
                {chance !== undefined && (
                  <span className="small">
                    {APPROACH_INFO[c.check!.approach].icon} {APPROACH_INFO[c.check!.approach].name} check: <b>{pct(chance)}</b> (your best at home)
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

export function WeekReport({ dispatchIds, week }: { dispatchIds: string[]; week: number }) {
  const g = useStore((s) => s.game)!;
  const close = useStore((s) => s.close);
  const items = g.dispatches.filter((d) => dispatchIds.includes(d.id));
  const last = g.ledger[g.ledger.length - 1];
  const net = last ? Object.values(last.income).reduce((a, b) => a + b, 0) - Object.values(last.expenses).reduce((a, b) => a + b, 0) : 0;
  return (
    <Sheet
      title={`Week report · ${dateLabel(week)}`}
      footer={
        <button className="btn primary block" onClick={close}>
          Begin {dateLabel(g.week)}
        </button>
      }
    >
      {last && (
        <p className={net < 0 ? 'bad' : 'good'}>
          Net {net >= 0 ? '+' : ''}
          {net}◉ this week. Treasury: {g.crowns}◉
        </p>
      )}
      {items.length === 0 && <p className="muted">A quiet week.</p>}
      {items.map((d) => (
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
  const step = skip ? 0 : 1.1;
  return (
    <Sheet title={m.contract.title}>
      <div className="row between small">
        <span className="muted">
          {m.contract.region} · {m.memberIds.map((x) => g.members.find((y) => y.id === x)?.name.split(' ')[0]).join(', ')}
        </span>
        {!skip && (
          <button className="btn ghost small" onClick={() => setSkip(true)}>
            Skip ⏭
          </button>
        )}
      </div>
      <div className="replay strip vertical">
        {r.phases.map((p, i) => (
          <div key={i} className={`phase-card r-${p.result}`} style={{ animationDelay: `${i * step}s` }}>
            <div className="row between">
              <b>{p.phase}</b>
              <span className="small">
                {APPROACH_INFO[p.approach].icon} {APPROACH_INFO[p.approach].name}
              </span>
            </div>
            <ChanceBar min={p.chance} max={p.chance} animate={!skip} />
            <span className="stamp" style={{ animationDelay: `${i * step + (skip ? 0 : 0.7)}s` }}>
              {STAMP[p.result]}
            </span>
            {p.lines.slice(1).map((l, k) => (
              <p key={k} className="small">
                {l}
              </p>
            ))}
          </div>
        ))}
        {r.phases.length < m.contract.phases.length && (
          <div className="phase-card r-skipped" style={{ animationDelay: `${r.phases.length * step}s` }}>
            <b>Withdrawn</b>
            <p className="small muted">The remaining phases were abandoned.</p>
          </div>
        )}
      </div>
      <div className={`outcome t-${r.tier.replace(' ', '-').toLowerCase()}`} style={{ animationDelay: `${r.phases.length * step + 0.3}s` }}>
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
                <button className="btn ghost small" onClick={() => (!info || confirm('Overwrite this slot?')) && saveSlot(n)}>
                  Save
                </button>
              )}
              <button className="btn ghost small" disabled={!info} onClick={() => confirm('Load this save? Unsaved progress since your last save in a slot is still kept in the autosave until you end a week.') && loadSlot(n)}>
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

export function HelpSheet() {
  return (
    <Sheet title="How to play">
      <div className="help">
        <p>
          You run <b>Ledger & Blade</b>, a guild in Varrow, a city drowning in the realm's debt to Ostrander's bank. Each turn is one week. Plan freely, then press <b>End Week</b>, and everything you set in motion
          resolves at once.
        </p>
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
