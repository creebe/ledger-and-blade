// Preparing an expedition for a contract: the squad in ranks, the pack and
// the standing orders. Reached from the contract board. The trip is sealed
// when the squad leaves the yard at the end of the week.
import { useEffect, useState } from 'react';
import {
  DELVER_PROFS,
  EXP_TUNING,
  PROFESSIONS,
  RIVALS,
  SUPPLIES,
  SUPPLY_IDS,
  ZONES,
  contractRoute,
  dispatchExpedition,
  itemDef,
  living,
  memberBlocked,
  packCost,
  packSlots,
  planBlocked,
  planWarnings,
  postingInfo,
  slotsFor,
  squadLimit,
  squadsOut,
  squadSize,
  stockOf,
  suggestPlan,
  revealCost,
  track,
  type Contract,
  type ExpPlan,
  type GameState,
  type StandingOrders,
  type SupplyId,
} from '../../engine';
import { useStore } from '../../store';
import { Btn, FactionBadge, Price, Section, Seg, Sheet, TagChip } from '../kit/common';
import { Icon } from '../kit/icons';
import { short } from '../kit/shortfall';
import { goTo } from '../kit/navigate';
import { HiddenTag } from '../kit/reveal';
import { ProfSilhouette } from '../expeditions/Silhouette';
import { Marks, Vitals, first } from '../expeditions/xkit';

const ORDER_ROWS: { key: keyof StandingOrders; title: string; options: { value: string; label: string; text: string }[] }[] = [
  {
    key: 'retreat',
    title: 'Turn back',
    options: [
      { value: 'cautious', label: 'Cautious', text: 'Turn back as soon as anyone is badly hurt or worn out, or anyone dies.' },
      { value: 'steady', label: 'Steady', text: 'Turn back when two are badly hurt or worn out, or anyone dies.' },
      { value: 'stubborn', label: 'Stubborn', text: 'Keep going until half the squad is dead or close to it.' },
    ],
  },
  {
    key: 'healFirst',
    title: 'Heal first',
    options: [
      { value: 'worst', label: 'Worst hurt', text: 'Bandages and dressings go to whoever is worst off.' },
      { value: 'front', label: 'Front rank', text: 'Keep the front rank standing, and the rest wait.' },
      { value: 'back', label: 'Back rank', text: 'Keep the casters and shooters up, and the front looks after itself.' },
    ],
  },
  {
    key: 'wanderers',
    title: 'Wandering monsters',
    options: [
      { value: 'avoid', label: 'Avoid them', text: 'Hide and let them pass. A Scout, an Infiltrator and soft boots help; plate and the dark do not. Fail and they ambush you.' },
      { value: 'fight', label: 'Fight them', text: 'Go and meet them. More loot, experience and renown, and more wounds.' },
    ],
  },
  {
    key: 'camp',
    title: 'Camp',
    options: [
      { value: 'sites', label: 'At camp sites', text: 'Only at the safe places on the route.' },
      { value: 'hurt', label: 'When hurt', text: 'Also stop wherever the squad is badly hurt. It costs food, and something may find you.' },
    ],
  },
  {
    key: 'consumables',
    title: 'Supplies',
    options: [
      { value: 'freely', label: 'Freely', text: 'Bandage early and cast with doses every time.' },
      { value: 'sparingly', label: 'Sparingly', text: 'Bandage the badly hurt, and save doses for the bigger monsters.' },
      { value: 'hoard', label: 'Hoard', text: 'Only in emergencies. Doses are kept for the biggest fights.' },
    ],
  },
];

function startingPlan(g: GameState, c: Contract): ExpPlan {
  const sug = suggestPlan(g, c);
  const lp = g.delve?.lastPlan;
  const size = squadSize(c);
  if (lp && lp.squad.length >= size.min && lp.squad.length <= size.max && lp.squad.every((id) => { const m = g.members.find((x) => x.id === id); return m && !memberBlocked(g, m); }))
    return { squad: [...lp.squad], pack: sug.pack, orders: { ...lp.orders } };
  return sug;
}

export function PrepSheet({ contractId }: { contractId: string }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const close = useStore((s) => s.close);
  const confirm = useStore((s) => s.confirm);
  const notify = useStore((s) => s.notify);
  const open = useStore((s) => s.open);
  const c = g.board.find((x) => x.id === contractId);
  const [plan, setPlan] = useState<ExpPlan | undefined>(() => (c ? startingPlan(g, c) : undefined));
  // opening a plan counts for the Guildmaster's Notes
  useEffect(() => {
    useStore.getState().act((s) => track(s, 'why'));
  }, []);
  if (!c || !plan) {
    return (
      <Sheet title="Contract">
        <p className="small muted">That contract is no longer on the board.</p>
      </Sheet>
    );
  }
  const info = postingInfo(g, c);
  const size = squadSize(c);
  const update = (p: Partial<ExpPlan>) => setPlan({ ...plan, ...p });
  const squad = plan.squad.map((id) => g.members.find((m) => m.id === id)!);
  const bench = living(g).filter((m) => !plan.squad.includes(m.id) && m.status !== 'mission');
  const used = packSlots(plan.pack);
  const cost = packCost(g, plan.pack);
  const why = planBlocked(g, c, plan);
  const atLimit = squadsOut(g) >= squadLimit(g);
  const blocked =
    why && cost > g.crowns && why.startsWith('Packing')
      ? short(g, 'crowns', cost, 'the supplies')
      : why && atLimit
        ? { text: why, action: { label: 'See the Field', run: () => goTo({ tab: 'field' }) } }
        : why;
  const warnings = planWarnings(g, c, plan);
  const steps = contractRoute(c);
  const camps = steps.filter((x) => x === 'camp').length;

  const place = (id: string, rank: number) => {
    const s = [...plan.squad];
    if (rank < s.length) s[rank] = id;
    else s.push(id);
    update({ squad: s });
  };
  const move = (i: number, dir: -1 | 1) => {
    const s = [...plan.squad];
    const j = i + dir;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]];
    update({ squad: s });
  };
  const remove = (i: number) => update({ squad: plan.squad.filter((_, k) => k !== i) });
  const setPack = (k: SupplyId, n: number) => {
    const next = { ...plan.pack, [k]: Math.max(0, n) };
    if (packSlots(next) > EXP_TUNING.packSlots) return notify(`The pack is full. It holds ${EXP_TUNING.packSlots} slots.`);
    update({ pack: next });
  };
  const setOut = () => {
    const wages = squad.reduce((t, m) => t + m.wage, 0) * info.weeks;
    confirm({
      title: `Send a squad of ${squad.length} to ${info.siteName}?`,
      body: [
        `${squad.map(first).join(', ')}: ${info.goalText}. They should be away about ${info.weeks === 1 ? 'a week' : `${info.weeks} weeks`}, and leave the yard at the end of this one.`,
        `Their wages while away: about ${wages} crowns.`,
        'Once they leave, nobody can send them orders. The standing orders are all they have.',
      ],
      cost: cost ? `${cost} crowns of supplies to buy · treasury ${g.crowns} → ${g.crowns - cost}` : undefined,
      confirmLabel: 'Set out',
      onConfirm: () => {
        if (act((x) => dispatchExpedition(x, c.id, plan))) {
          close();
          notify(`The squad is getting ready in the yard. They leave for ${info.siteName} at the end of the week.`);
        }
      },
    });
  };

  return (
    <Sheet
      title={c.title}
      footer={
        <Btn className="btn primary block x-setout" blocked={blocked} onClick={setOut}>
          Set out{cost ? <> · <Price n={cost} /></> : null}
        </Btn>
      }
    >
      <div className="x-sheet">
      <p className={`small x-prep-limit ${atLimit ? 'warn' : 'muted'}`}>
        {atLimit
          ? `${squadsOut(g)} of ${squadLimit(g)} squads are out, so this one can't leave until one is home or called off.`
          : `${squadsOut(g)} of ${squadLimit(g)} squads out. The hall can send ${squadLimit(g) - squadsOut(g) === 1 ? 'one more' : `${squadLimit(g) - squadsOut(g)} more`}.`}
      </p>
      <Section title="The job">
        <div className="card x-route">
          <span className="row wrap gap">
            {c.op ? <span className="meta">Your operation against {RIVALS[c.op.rival].name}</span> : <FactionBadge id={c.patron} />}
            <span className="reward">
              <Price n={c.reward} />
            </span>
          </span>
          <b>{info.goalText}.</b>
          <span className="small">
            {info.siteName}: about {steps.length} rooms through {info.zones.map((z) => ZONES[z].name).join(', then ')}
            {camps ? `, with ${camps === 1 ? 'a camp site' : `${camps} camp sites`} on the way` : ''}. Away for about {info.weeks === 1 ? 'a week' : `${info.weeks} weeks`}, road included.
          </span>
          <span className="tiny muted">{c.description}</span>
          <span className="tags">
            {c.tags.map((t) => (
              <TagChip key={t} id={t} />
            ))}
            {c.hidden.map((h, i) =>
              h.revealed ? (
                <TagChip key={i} id={h.trueTag} />
              ) : (
                <HiddenTag key={i} c={c} i={i} long />
              ),
            )}
          </span>
          {c.hidden.some((h) => !h.revealed) && (
            <span className="tiny muted x-reveal-hint">
              A dashed “?” is a danger nobody has confirmed. Tap one to learn which it is for {revealCost(g)} Intel (you have {g.intel}), or give a member the Scout order on the Roster and they'll report back at the end of the week.
            </span>
          )}
        </div>
      </Section>

      <Section title={`The squad, front to back (${size.min === size.max ? size.max : `${size.min} to ${size.max}`})`}>
        <p className="tiny muted">Ranks 1 and 2 are in front: they can reach with a blade, and most enemies hit them. Bows and spells work from further back. Tap a member to change their gear.</p>
        {Array.from({ length: size.max }, (_, i) => {
          const m = squad[i];
          const ok = m ? DELVER_PROFS[m.profession].ranks.includes(i + 1) : true;
          return (
            <div key={i} className="x-rank">
              <span className={`x-rank-n ${ok ? '' : 'x-rank-off'}`}>{i + 1}</span>
              {m ? (
                <button className="card tappable x-rank-card" onClick={() => open({ kind: 'member', id: m.id })}>
                  <ProfSilhouette prof={m.profession} size={40} />
                  <span className="x-member-main">
                    <span className="x-member-name">
                      <b>{first(m)}</b>
                      <small className="muted">
                        {PROFESSIONS[m.profession].name} {m.level}
                        {!ok && <span className="warn"> · best in rank {DELVER_PROFS[m.profession].ranks.join(' or ')}</span>}
                      </small>
                    </span>
                    <Vitals m={m} />
                    <Marks m={m} />
                    <small className="muted x-gear-sum">
                      {[m.loadout.weapon, m.loadout.armor, m.loadout.trinket, ...m.loadout.consumables]
                        .map((u) => itemDef(g, u)?.name)
                        .filter(Boolean)
                        .join(' · ')}
                    </small>
                  </span>
                </button>
              ) : (
                <div className="card x-rank-card x-empty-rank">
                  <span className="muted small">{i < size.min ? 'Empty. Choose someone from the bench.' : 'Empty. Optional.'}</span>
                </div>
              )}
              {m ? (
              <span className="x-rank-moves">
                <button className="btn small ghost" aria-label={`Move ${m ? first(m) : 'rank'} forward`} onClick={() => move(i, -1)} disabled={i === 0 || !m}>
                  ↑
                </button>
                <button className="btn small ghost" aria-label={`Move ${m ? first(m) : 'rank'} back`} onClick={() => move(i, 1)} disabled={i >= plan.squad.length - 1 || !m}>
                  ↓
                </button>
                <button className="btn small ghost" aria-label={`Leave ${m ? first(m) : 'rank'} at home`} onClick={() => remove(i)} disabled={!m}>
                  ×
                </button>
              </span>
              ) : (
                <span className="x-rank-moves x-rank-moves-empty" aria-hidden />
              )}
            </div>
          );
        })}
        {bench.length > 0 && (
          <>
            <p className="small muted">At home:</p>
            {bench.map((m) => {
              const no = memberBlocked(g, m);
              return (
                <div key={m.id} className="x-bench row between">
                  <span className="row gap">
                    <ProfSilhouette prof={m.profession} size={32} />
                    <span>
                      <b>{first(m)}</b>{' '}
                      <small className="muted">
                        {PROFESSIONS[m.profession].name} {m.level} · health {m.health} · fatigue {m.fatigue}
                        {m.exposure ? ` · exposure ${m.exposure}` : ''}
                      </small>
                    </span>
                  </span>
                  <span className="row gap x-bench-put">
                    {Array.from({ length: Math.min(size.max, plan.squad.length + 1) }, (_, r) => (
                      <Btn key={r} className="btn small" title={`Put ${first(m)} in rank ${r + 1}`} blocked={no} onClick={() => place(m.id, r)}>
                        {r + 1}
                      </Btn>
                    ))}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </Section>

      <Section title="The pack" right={<span className={`small ${used >= EXP_TUNING.packSlots ? 'warn' : 'muted'}`}>{used} of {EXP_TUNING.packSlots} slots</span>}>
        <div className="x-pack-meter" aria-hidden>
          {Array.from({ length: EXP_TUNING.packSlots }, (_, i) => (
            <i key={i} className={i < used ? 'on' : ''} />
          ))}
        </div>
        {SUPPLY_IDS.map((k) => {
          const n = plan.pack[k] ?? 0;
          const have = stockOf(g, k);
          const buy = Math.max(0, n - have);
          return (
            <div key={k} className="x-pack-row">
              <span className="x-pack-what">
                <span>
                  <b>{SUPPLIES[k].name}</b>
                  <small className="muted">
                    {' '}
                    · {SUPPLIES[k].perSlot} a slot · {have} {k === 'food' ? 'in the guild supplies' : 'in the stores'}
                    {buy ? `, ${buy} to buy` : ''}
                  </small>
                </span>
                <small className="x-pack-text">{SUPPLIES[k].text}</small>
              </span>
              <span className="x-stepper">
                <button className="btn small" onClick={() => setPack(k, n - 1)} disabled={n === 0} aria-label={`One less ${SUPPLIES[k].one}`}>
                  −
                </button>
                <b>{n}</b>
                <button className="btn small" onClick={() => setPack(k, n + 1)} aria-label={`One more ${SUPPLIES[k].one}`}>
                  +
                </button>
              </span>
              {n > 0 && <small className="muted x-pack-slots">{slotsFor(k, n)} slot{slotsFor(k, n) === 1 ? '' : 's'}</small>}
            </div>
          );
        })}
        {cost > 0 && (
          <p className="small">
            Buying what the stores don't have: <Price n={cost} />
          </p>
        )}
      </Section>

      <Section title="Standing orders">
        <p className="tiny muted">Nobody can send orders once they've gone. These are what the squad will do.</p>
        {ORDER_ROWS.map((row) => {
          const cur = row.options.find((o) => o.value === plan.orders[row.key])!;
          return (
            <div key={row.key} className="x-order">
              <b className="small">{row.title}</b>
              <Seg value={cur.value} onChange={(v) => update({ orders: { ...plan.orders, [row.key]: v } as StandingOrders })} options={row.options.map((o) => ({ value: o.value, label: o.label }))} />
              <small className="muted">{cur.text}</small>
            </div>
          );
        })}
      </Section>

      {warnings.length > 0 && (
        <Section title="Before you go">
          <ul className="x-warnings">
            {warnings.map((w, i) => (
              <li key={i} className="small">
                <Icon name="warn" size={14} /> {w}
              </li>
            ))}
          </ul>
        </Section>
      )}
      <button className="btn ghost block small" onClick={() => setPlan(suggestPlan(g, c, plan.orders))}>
        Start again from a suggested plan
      </button>
      </div>
    </Sheet>
  );
}
