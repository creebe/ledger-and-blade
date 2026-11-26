import { useState } from 'react';
import { EXP_TUNING, treatExposure, APPROACH_INFO, FAME_TIERS, LEGEND_NEEDS, ITEMS, PROFESSIONS, SIGNATURES, TRAITS, awayReason, dismissMember, equip, equippedBy, fameTier, isPreparing, laidUp, memberScore, type Approach, type Attribute, type GameState, type ItemSlot, type Member, xpToLevel } from '../../engine';
import { useStore } from '../../store';
import { Btn, Meter, Sheet } from '../kit/common';
import { SLOT_LABEL, cap, crowns, datedLine, shortDate } from '../kit/format';
import { Icon } from '../kit/icons';
import { ItemIcon, ItemStats, PROFESSION_APPROACH, Portrait, ap } from '../kit/visual';
import { OrderPicker, restingInfo } from '../kit/members';
import { Marks } from '../expeditions/xkit';
import { short } from '../kit/shortfall';

const STATUS_LABEL: Record<Member['status'], string> = {
  idle: 'At the hall',
  mission: 'On a mission',
  recovering: 'Recovering',
  dead: 'Dead',
  left: 'Gone',
};

function statusLine(m: Member, game: GameState) {
  if (m.status === 'mission') {
    const ms = game.missions.find((x) => x.id === m.missionId);
    if (!ms) return 'On a mission';
    const left = ms.dispatchedWeek + ms.plannedWeeks - 1 - game.week;
    return `On "${ms.contract.title}", back ${left <= 0 ? 'at the end of this week' : `in ${left + 1} weeks`}`;
  }
  const lay = laidUp(game, m);
  if (lay) {
    const when = lay.weeks === 1 ? 'next week' : `in ${lay.weeks} weeks`;
    return lay.why === 'fever' ? `In bed with the Sink fever, up ${when}` : `Resting with wounds, fit ${when}`;
  }
  return STATUS_LABEL[m.status];
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
              <Icon name={m.profession} size={18} style={{ color: ap(PROFESSION_APPROACH[m.profession]) }} /> <b>{prof.name}</b> · Lv {m.level}
            </span>
            <span className="meta">{crowns(m.wage)} a week</span>
          </div>
          <div className="ap-bar-track xp-track" title={`${m.xp}/${xpToLevel(m.level)} xp to next level`}>
            <span className="ap-bar-fill progress-fill" style={{ width: `${(m.xp / xpToLevel(m.level)) * 100}%` }} />
          </div>
          <p className="muted small">{prof.blurb}</p>
        </div>
      </div>
      <FameBlock m={m} />
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
        {(m.exposure ?? 0) > 0 && (
          <label title="Runoff and fever in the body. At 40, 70 and 95 it brings a Sink change.">
            <span className="meta"><Icon name="flask" size={14} />Exposure</span> <Meter value={m.exposure} tone="mid" /> <span>{m.exposure}</span>
          </label>
        )}
      </div>
      {m.fever && <p className="small warn">In bed with the Sink fever for {m.fever.weeks === 1 ? 'another week' : `${m.fever.weeks} more weeks`}. They'll get up changed.</p>}
      <Marks m={m} />
      {(m.exposure ?? 0) > 0 && m.status !== 'mission' && m.status !== 'dead' && m.status !== 'left' && (
        <Btn
          className="btn ghost small"
          blocked={short(game, 'crowns', EXP_TUNING.exposure.treatCost, "Saint Oda's fever beds")}
          onClick={() =>
            useStore.getState().confirm({
              title: `Send ${m.name.split(' ')[0]} to Saint Oda's?`,
              body: [`A night in the fever beds draws ${EXP_TUNING.exposure.treat} Exposure out of them. It puts off a Sink change; it doesn't undo one they already have.`],
              cost: `Costs ${crowns(EXP_TUNING.exposure.treatCost)} · treasury ${game.crowns} → ${game.crowns - EXP_TUNING.exposure.treatCost}`,
              confirmLabel: 'Send them',
              onConfirm: () =>
                useStore.getState().act((d) => treatExposure(d, m.id)) &&
                useStore.getState().notify(`${m.name.split(' ')[0]} spends a night at Saint Oda's. Exposure is down to ${Math.max(0, (m.exposure ?? 0) - EXP_TUNING.exposure.treat)}.`),
            })
          }
        >
          Saint Oda's fever beds · −{EXP_TUNING.exposure.treat} Exposure
        </Btn>
      )}

      {!locked && restingInfo(game, m) ? (
        <>
          <h3 className="subhead">This week</h3>
          <p className="hint member-resting">
            <Icon name="rest" size={14} /> {restingInfo(game, m)!.why}
          </p>
        </>
      ) : (
        !locked &&
        m.status === 'idle' && (
          <>
            <h3 className="subhead">This week</h3>
            <OrderPicker m={m} />
          </>
        )
      )}

      <div className="traits">
        {m.traits.map((t) => (
          <span key={t} className={`trait ${TRAITS[t].negative ? 'neg' : ''}`} title={TRAITS[t].description}>
            {TRAITS[t].name}
            <small>{TRAITS[t].description}</small>
          </span>
        ))}
      </div>

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
        <p className="small muted">No missions yet. Joined in {shortDate(m.joinedWeek, game.week)}.</p>
      ) : (
        <ul className="record">
          {[...(m.record ?? [])].reverse().map((r, i) => (
            <li key={i} className="small">
              {datedLine(r, game.week)}
            </li>
          ))}
        </ul>
      )}

      {!locked && (
        <button
          className="btn danger ghost block"
          onClick={() =>
            useStore.getState().confirm({
              title: `Dismiss ${m.name}?`,
              body: [`They leave the guild for good. Their gear stays in the armory, and you save ${crowns(m.wage)} a week.`, 'The others will notice (morale −3).'],
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

/** Standing in the city: fame tier, the name the street uses, a Legend's signature, and the stories told about them. */
function FameBlock({ m }: { m: Member }) {
  const game = useStore((s) => s.game)!;
  const tier = fameTier(m);
  const fame = m.fame ?? 0;
  const next = FAME_TIERS[Math.min(3, tier + 1)];
  const stories = (m.feats ?? []).filter((f) => f.text);
  const sig = m.signature ? SIGNATURES[m.signature] : undefined;
  if (!fame && !stories.length) return null;
  return (
    <div className={`fame-block ${tier === 3 ? 'legend' : ''}`}>
      <b className="meta">
        <Icon name="fame" size={14} />
        {m.epithet ? `${m.epithet}, a Legend of Varrow` : tier ? FAME_TIERS[tier].name : 'Not yet known'}
      </b>
      <p className="tiny muted fame-line">
        {tier < 3 ? `Fame ${fame} of ${next.min} to be ${next.name}${next.name === 'Legendary' ? ` (also needs level ${LEGEND_NEEDS.level} and ${LEGEND_NEEDS.missions} missions)` : ''}.` : `Fame ${fame}.`}
      </p>
      {sig && (
        <p className="small">
          <b>{sig.name}.</b> {sig.text}
        </p>
      )}
      {stories.length > 0 && (
        <ul className="record">
          {[...stories].reverse().slice(0, 4).map((f, i) => (
            <li key={i} className="small">
              {shortDate(f.week, game.week)}: people tell {f.text}.
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
