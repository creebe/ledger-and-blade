import { useRef, useState } from 'react';
import {
  APPROACH_INFO,
  dismissMember,
  equip,
  equippedBy,
  ITEMS,
  memberScore,
  PROFESSIONS,
  setAssignment,
  TRAITS,
  TRAIN_COST,
  xpToLevel,
  type Approach,
  type Assignment,
  type Attribute,
  type GameState,
  type ItemSlot,
  type Member,
} from '../engine';
import { useStore } from '../store';
import { Meter, Sheet } from './common';
import { cap, itemSummary, SLOT_LABEL } from './format';

const STATUS_LABEL: Record<Member['status'], string> = {
  idle: 'At the hall',
  mission: 'On a mission',
  recovering: 'Recovering',
  dead: 'Dead',
  left: 'Gone',
};

export const ASSIGNMENTS: { id: Assignment; label: string; blurb: string }[] = [
  { id: 'rest', label: 'Rest', blurb: 'Recover fatigue and wounds faster. Small morale gain.' },
  { id: 'train', label: 'Train', blurb: `+1 to an attribute every 3 weeks. Costs ${TRAIN_COST} crowns/week and adds fatigue.` },
  { id: 'rumors', label: 'Gather rumors', blurb: '+1 Intel per week (+2 for Envoys, Infiltrators and Scouts).' },
  { id: 'labor', label: 'Dock labor', blurb: 'Earn a few crowns based on Might. Tiring and dull.' },
  { id: 'scout', label: 'Scout a contract', blurb: "Reveal a contract's hidden tags by week's end. Scouts, Skirmishers and Infiltrators reveal all of them; others reveal one." },
];

export function statusLine(m: Member, game: GameState) {
  if (m.status === 'mission') {
    const ms = game.missions.find((x) => x.id === m.missionId);
    if (!ms) return 'On a mission';
    const left = ms.returnWeek - game.week;
    return `On "${ms.contract.title}", back ${left <= 0 ? 'at the end of this week' : `in ${left + 1} weeks`}`;
  }
  if (m.status === 'recovering') return 'Recovering from wounds';
  return STATUS_LABEL[m.status];
}

export function MemberMini({ m, selected, onClick, onLongPress, disabled }: { m: Member; selected?: boolean; onClick?: () => void; onLongPress?: () => void; disabled?: boolean }) {
  const timer = useRef<number | undefined>(undefined);
  const long = useRef(false);
  const prof = PROFESSIONS[m.profession];
  return (
    <button
      className={`member-mini ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => {
        if (long.current) {
          long.current = false;
          return;
        }
        if (!disabled || !onLongPress) onClick?.();
      }}
      onPointerDown={() => {
        if (!onLongPress) return;
        timer.current = window.setTimeout(() => {
          long.current = true;
          onLongPress();
        }, 450);
      }}
      onPointerUp={() => window.clearTimeout(timer.current)}
      onPointerLeave={() => window.clearTimeout(timer.current)}
      onContextMenu={(e) => {
        if (onLongPress) {
          e.preventDefault();
          onLongPress();
        }
      }}
    >
      <span className="mm-name">{m.name.split(' ')[0]}</span>
      <span className="mm-prof">{prof.name}</span>
      <span className="mm-bars">
        <Meter value={m.health} tone={m.health < 40 ? 'bad' : m.health < 75 ? 'mid' : 'good'} label="Health" />
        <Meter value={100 - m.fatigue} tone={m.fatigue > 50 ? 'bad' : m.fatigue > 20 ? 'mid' : 'info'} label="Freshness" />
      </span>
      {m.status !== 'idle' && <span className="mm-status">{m.status === 'mission' ? 'Away' : 'Hurt'}</span>}
    </button>
  );
}

export function MemberSheet({ id }: { id: string }) {
  const game = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const close = useStore((s) => s.close);
  const [slotPick, setSlotPick] = useState<{ slot: ItemSlot; index: number } | null>(null);
  const m = game.members.find((x) => x.id === id);
  if (!m) return null;
  const prof = PROFESSIONS[m.profession];
  const locked = m.status === 'mission' || m.status === 'dead' || m.status === 'left';
  const ctx = { tags: [], countered: new Set<string>(), members: [m] };
  const scores = (Object.keys(APPROACH_INFO) as Approach[]).map((a) => ({ a, s: memberScore(game, m, a, ctx).score }));

  const slotItem = (uid?: string) => {
    const inst = uid ? game.items.find((i) => i.uid === uid) : undefined;
    return inst ? ITEMS[inst.defId] : undefined;
  };

  const slots: { slot: ItemSlot; index: number; uid?: string }[] = [
    { slot: 'weapon', index: 0, uid: m.loadout.weapon },
    { slot: 'armor', index: 0, uid: m.loadout.armor },
    { slot: 'trinket', index: 0, uid: m.loadout.trinket },
    { slot: 'consumable', index: 0, uid: m.loadout.consumables[0] },
    { slot: 'consumable', index: 1, uid: m.loadout.consumables[1] },
  ];

  return (
    <Sheet title={m.name}>
      <div className="row between">
        <span>
          <b>{prof.name}</b> · Level {m.level} <span className="muted small">({m.xp}/{xpToLevel(m.level)} xp)</span>
        </span>
        <span className="muted">{m.wage}◉/wk</span>
      </div>
      <p className="muted small">{prof.blurb}</p>
      <p className="small">{statusLine(m, game)}{m.causeOfDeath ? ` · ${m.causeOfDeath}` : ''}</p>

      <div className="attrs">
        {(['might', 'finesse', 'wits', 'resolve'] as Attribute[]).map((a) => (
          <div key={a} className="attr">
            <span className="attr-v">{m.attrs[a]}</span>
            <span className="attr-l">{cap(a)}</span>
          </div>
        ))}
      </div>

      <div className="vitals">
        <label>Health <Meter value={m.health} tone={m.health < 40 ? 'bad' : m.health < 75 ? 'mid' : 'good'} /> <span>{m.health}</span></label>
        <label>Fatigue <Meter value={m.fatigue} tone={m.fatigue > 50 ? 'bad' : 'mid'} /> <span>{m.fatigue}</span></label>
        <label>Morale <Meter value={m.morale} tone={m.morale < 35 ? 'bad' : 'good'} /> <span>{Math.round(m.morale)}</span></label>
        <label>Loyalty <Meter value={m.loyalty} tone={m.loyalty < 35 ? 'bad' : 'good'} /> <span>{m.loyalty}</span></label>
      </div>

      <div className="traits">
        {m.traits.map((t) => (
          <span key={t} className={`trait ${TRAITS[t].negative ? 'neg' : ''}`} title={TRAITS[t].description}>
            {TRAITS[t].name}
            <small>{TRAITS[t].description}</small>
          </span>
        ))}
      </div>

      <h3 className="subhead">Approach strength <span className="muted small">(no tags, current gear)</span></h3>
      <div className="scores">
        {scores.map(({ a, s }) => (
          <div key={a} className="score">
            <span>{APPROACH_INFO[a].icon}</span>
            <b>{s.toFixed(0)}</b>
            <small>{APPROACH_INFO[a].name}</small>
          </div>
        ))}
      </div>

      <h3 className="subhead">Gear</h3>
      <div className="slots">
        {slots.map((sl) => {
          const def = slotItem(sl.uid);
          return (
            <button key={`${sl.slot}${sl.index}`} className="slot" disabled={locked} onClick={() => setSlotPick({ slot: sl.slot, index: sl.index })}>
              <span className="slot-l">{SLOT_LABEL[sl.slot]}</span>
              <span className="slot-v">{def ? def.name : '—'}</span>
              {def && <span className="slot-s">{itemSummary(def)}</span>}
            </button>
          );
        })}
      </div>

      {slotPick && (
        <div className="picker">
          <div className="row between">
            <h4>Choose {SLOT_LABEL[slotPick.slot].toLowerCase()}</h4>
            <button className="icon-btn" onClick={() => setSlotPick(null)}>
              ✕
            </button>
          </div>
          <button
            className="pick-item"
            onClick={() => {
              act((g) => equip(g, m.id, slotPick.slot, undefined, slotPick.index));
              setSlotPick(null);
            }}
          >
            <b>Nothing</b>
          </button>
          {game.items
            .filter((i) => ITEMS[i.defId].slot === slotPick.slot)
            .map((i) => {
              const def = ITEMS[i.defId];
              const holder = equippedBy(game, i.uid);
              return (
                <button
                  key={i.uid}
                  className="pick-item"
                  disabled={holder?.status === 'mission'}
                  onClick={() => {
                    act((g) => equip(g, m.id, slotPick.slot, i.uid, slotPick.index));
                    setSlotPick(null);
                  }}
                >
                  <b>{def.name}</b>
                  <span className="small">{itemSummary(def)}</span>
                  <span className="tiny muted">{holder ? (holder.id === m.id ? 'Equipped' : `Held by ${holder.name.split(' ')[0]}`) : 'In stores'}</span>
                </button>
              );
            })}
          {game.items.filter((i) => ITEMS[i.defId].slot === slotPick.slot).length === 0 && <p className="muted small">None in the armory. Buy some at the market.</p>}
        </div>
      )}

      {!locked && m.status === 'idle' && (
        <>
          <h3 className="subhead">This week</h3>
          <div className="assign">
            {ASSIGNMENTS.map((a) => (
              <button
                key={a.id}
                className={`assign-opt ${m.assignment === a.id ? 'on' : ''}`}
                onClick={() => {
                  if (a.id === 'scout') {
                    const target = game.board.find((c) => c.hidden.some((h) => !h.revealed));
                    if (!target) return useStore.getState().notify('No contract has anything left to scout');
                    act((g) => setAssignment(g, m.id, 'scout', { contractId: m.scoutTarget && g.board.some((c) => c.id === m.scoutTarget) ? m.scoutTarget : target.id }));
                  } else act((g) => setAssignment(g, m.id, a.id));
                }}
              >
                <b>{a.label}</b>
                <small>{a.blurb}</small>
              </button>
            ))}
          </div>
          {m.assignment === 'train' && (
            <div className="row wrap gap">
              {(['might', 'finesse', 'wits', 'resolve'] as Attribute[]).map((a) => (
                <button key={a} className={`btn small ${m.trainAttr === a ? 'primary' : 'ghost'}`} onClick={() => act((g) => setAssignment(g, m.id, 'train', { attr: a }))}>
                  {cap(a)}
                </button>
              ))}
              <span className="small muted">Progress {m.trainProgress}/3</span>
            </div>
          )}
          {m.assignment === 'scout' && (
            <select className="select" value={m.scoutTarget} onChange={(e) => act((g) => setAssignment(g, m.id, 'scout', { contractId: e.target.value }))}>
              {game.board
                .filter((c) => c.hidden.some((h) => !h.revealed))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </select>
          )}
        </>
      )}

      {!locked && (
        <button
          className="btn danger ghost block"
          onClick={() => {
            if (confirm(`Dismiss ${m.name}? Their gear stays in the armory.`)) {
              act((g) => dismissMember(g, m.id));
              close();
            }
          }}
        >
          Dismiss from the guild
        </button>
      )}
    </Sheet>
  );
}
