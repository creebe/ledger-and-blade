import { useRef, useState } from 'react';
import {
  APPROACH_INFO,
  awayReason,
  dismissMember,
  isPreparing,
  equip,
  equippedBy,
  ITEMS,
  memberScore,
  PROFESSIONS,
  setAssignment,
  TRAITS,
  trainCost,
  trainWeeks,
  xpToLevel,
  type Approach,
  type Assignment,
  type Attribute,
  type GameState,
  type ItemSlot,
  type Member,
} from '../engine';
import { useStore } from '../store';
import { Btn, Meter, Sheet } from './common';
import { cap, SLOT_LABEL } from './format';
import { Icon } from './icons';
import { ap, ItemIcon, ItemStats, PROFESSION_APPROACH, Portrait, readiness } from './visual';

const STATUS_LABEL: Record<Member['status'], string> = {
  idle: 'At the hall',
  mission: 'On a mission',
  recovering: 'Recovering',
  dead: 'Dead',
  left: 'Gone',
};

export const ASSIGNMENTS: { id: Assignment; label: string; blurb: string }[] = [
  { id: 'rest', label: 'Rest', blurb: 'Recover fatigue and wounds faster. Small morale gain.' },
  { id: 'train', label: 'Train', blurb: '+1 to an attribute every few weeks. Costs crowns each week and adds fatigue. A Training Yard makes it faster and cheaper.' },
  { id: 'rumors', label: 'Gather rumors', blurb: '+1 Intel per week (+2 for Envoys, Infiltrators and Scouts).' },
  { id: 'labor', label: 'Dock labor', blurb: 'Earn a few crowns based on Might. Tiring and dull.' },
  { id: 'build', label: 'Build', blurb: 'Help with construction: each builder adds half a week of progress. Tiring.' },
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

export function MemberMini({ m, selected, onClick, onLongPress, blocked }: { m: Member; selected?: boolean; onClick?: () => void; onLongPress?: () => void; blocked?: string }) {
  const g = useStore((s) => s.game)!;
  const timer = useRef<number | undefined>(undefined);
  const long = useRef(false);
  const r = readiness(m, g);
  return (
    <button
      className={`member-mini ${selected ? 'selected' : ''} ${blocked ? 'is-blocked' : ''}`}
      onClick={() => {
        if (long.current) {
          long.current = false;
          return;
        }
        if (blocked) useStore.getState().notify(blocked);
        else onClick?.();
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
      <span className="row gap">
        <Portrait m={m} size={30} />
        <span className="mm-text">
          <span className="mm-name">{m.name.split(' ')[0]}</span>
          <span className={`mm-prof readiness ${r.tone}`}>{r.text === 'Ready' ? PROFESSIONS[m.profession].name : r.text}</span>
        </span>
      </span>
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
  const lockReason = m.status === 'dead' || m.status === 'left' ? `${m.name.split(' ')[0]} is no longer with the guild.` : awayReason(game, m);
  const locked = !!lockReason || m.status === 'mission';
  const preparing = isPreparing(game, m);
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
      <div className="card-row">
        <Portrait m={m} size={60} />
        <div className="card-main">
          <div className="row between">
            <span>
              <Icon name={m.profession} size={16} style={{ color: ap(PROFESSION_APPROACH[m.profession]) }} /> <b>{prof.name}</b> · Level {m.level}
            </span>
            <span className="meta">
              <Icon name="coin" size={13} />
              {m.wage}/wk
            </span>
          </div>
          <div className="ap-bar-track" title={`${m.xp}/${xpToLevel(m.level)} xp to next level`} style={{ margin: '4px 0' }}>
            <span className="ap-bar-fill" style={{ width: `${(m.xp / xpToLevel(m.level)) * 100}%`, background: 'var(--gold)' }} />
          </div>
          <p className="muted small">{prof.blurb}</p>
        </div>
      </div>
      <p className="small">
        {statusLine(m, game)}
        {m.causeOfDeath ? ` · ${m.causeOfDeath}` : ''}
      </p>
      {preparing && <p className="hint">Leaving at the end of this week. You can still change their gear, or cancel the dispatch from Contracts.</p>}
      {lockReason && m.status === 'mission' && <p className="hint">{lockReason}</p>}

      <div className="attrs">
        {(['might', 'finesse', 'wits', 'resolve'] as Attribute[]).map((a) => (
          <div key={a} className="attr">
            <span className="attr-v">{m.attrs[a]}</span>
            <span className="attr-l">{cap(a)}</span>
          </div>
        ))}
      </div>

      <div className="vitals">
        <label><span className="meta"><Icon name="heart" size={14} />Health</span> <Meter value={m.health} tone={m.health < 40 ? 'bad' : m.health < 75 ? 'mid' : 'good'} /> <span>{m.health}</span></label>
        <label><span className="meta"><Icon name="bolt" size={14} />Fatigue</span> <Meter value={m.fatigue} tone={m.fatigue > 50 ? 'bad' : 'mid'} /> <span>{m.fatigue}</span></label>
        <label><span className="meta"><Icon name="smile" size={14} />Morale</span> <Meter value={m.morale} tone={m.morale < 35 ? 'bad' : 'good'} /> <span>{Math.round(m.morale)}</span></label>
        <label><span className="meta"><Icon name="link" size={14} />Loyalty</span> <Meter value={m.loyalty} tone={m.loyalty < 35 ? 'bad' : 'good'} /> <span>{m.loyalty}</span></label>
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
          <div key={a} className="score" style={{ color: ap(a), borderColor: `color-mix(in srgb, ${ap(a)} 45%, var(--line))` }}>
            <Icon name={a} size={18} />
            <b style={{ color: 'var(--ink)' }}>{s.toFixed(0)}</b>
            <small>{APPROACH_INFO[a].name}</small>
          </div>
        ))}
      </div>

      <h3 className="subhead">Service record</h3>
      {(m.record ?? []).length === 0 ? (
        <p className="small muted">No missions yet. Joined in week {m.joinedWeek}.</p>
      ) : (
        <ul className="record">
          {[...(m.record ?? [])].reverse().map((r, i) => (
            <li key={i} className="small">
              {r}
            </li>
          ))}
        </ul>
      )}

      <h3 className="subhead">Gear</h3>
      <div className="slots">
        {slots.map((sl) => {
          const def = slotItem(sl.uid);
          return (
            <Btn key={`${sl.slot}${sl.index}`} className="slot slot-row-v" blocked={lockReason} onClick={() => setSlotPick({ slot: sl.slot, index: sl.index })}>
              {def ? (
                <ItemIcon def={def} size={20} />
              ) : (
                <span className="item-icon empty" style={{ width: 32, height: 32 }}>
                  <Icon name={sl.slot === 'consumable' ? 'flask' : sl.slot} size={18} />
                </span>
              )}
              <span className="card-main">
                <span className="slot-l">{SLOT_LABEL[sl.slot]}</span>
                <span className="slot-v">{def ? def.name : 'Empty'}</span>
                {def && <ItemStats def={def} />}
              </span>
            </Btn>
          );
        })}
      </div>

      {slotPick && (
        <div className="picker">
          <div className="row between">
            <h4>Choose {SLOT_LABEL[slotPick.slot].toLowerCase()}</h4>
            <button className="icon-btn" onClick={() => setSlotPick(null)}>
              <Icon name="x" size={18} />
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
                <Btn
                  key={i.uid}
                  className="pick-item"
                  blocked={holder && holder.id !== m.id ? awayReason(game, holder) : undefined}
                  onClick={() => {
                    if (act((g) => equip(g, m.id, slotPick.slot, i.uid, slotPick.index)))
                      useStore.getState().notify(`${m.name.split(' ')[0]} now carries ${def.name}${holder && holder.id !== m.id ? `, taken from ${holder.name.split(' ')[0]}` : ''}.`);
                    setSlotPick(null);
                  }}
                >
                  <span className="card-row">
                    <ItemIcon def={def} size={18} />
                    <span className="card-main">
                      <b>{def.name}</b>
                      <ItemStats def={def} />
                      <span className="tiny muted" style={{ display: 'block' }}>
                        {holder ? (holder.id === m.id ? 'Equipped' : `Held by ${holder.name.split(' ')[0]}`) : 'In stores'}
                      </span>
                    </span>
                  </span>
                </Btn>
              );
            })}
          {game.items.filter((i) => ITEMS[i.defId].slot === slotPick.slot).length === 0 && <p className="muted small">None in the armory. Buy some at the market.</p>}
        </div>
      )}

      {!locked && m.status === 'idle' && (
        <>
          <h3 className="subhead">This week</h3>
          <div className="assign">
            {ASSIGNMENTS.filter((a) => a.id !== 'build' || game.construction).map((a) => (
              <button
                key={a.id}
                className={`assign-opt ${m.assignment === a.id ? 'on' : ''}`}
                onClick={() => {
                  if (a.id === 'scout') {
                    const target = game.board.find((c) => c.hidden.some((h) => !h.revealed));
                    if (!target) return useStore.getState().notify('No contract has anything left to scout');
                    act((g) => setAssignment(g, m.id, 'scout', { contractId: m.scoutTarget && g.board.some((c) => c.id === m.scoutTarget) ? m.scoutTarget : target.id }));
                  } else if (act((g) => setAssignment(g, m.id, a.id))) useStore.getState().notify(`${m.name.split(' ')[0]}: ${a.label} this week. ${a.blurb}`);
                }}
              >
                <span className="card-row">
                  <Icon name={({ rest: 'rest', train: 'train', rumors: 'ear', labor: 'hammer', scout: 'compass', build: 'anvil' } as Record<string, string>)[a.id]} size={20} />
                  <span className="card-main">
                    <b>{a.label}</b>
                    <small style={{ display: 'block' }}>
                      {a.id === 'train' ? `+1 to an attribute every ${trainWeeks(game)} weeks. Costs ${trainCost(game)} crowns a week and adds fatigue.` : a.blurb}
                    </small>
                  </span>
                </span>
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
              <span className="small muted">Progress {m.trainProgress}/{trainWeeks(game)}</span>
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
          onClick={() =>
            useStore.getState().confirm({
              title: `Dismiss ${m.name}?`,
              body: [`They leave the guild for good. Their gear stays in the armory, and you save ${m.wage}◉ a week.`, 'The others will notice (morale −3).'],
              confirmLabel: 'Dismiss',
              danger: true,
              onConfirm: () => {
                act((g) => dismissMember(g, m.id));
                close();
              },
            })
          }
        >
          Dismiss from the guild
        </button>
      )}
    </Sheet>
  );
}
