// Preparing an expedition: where the player's skill goes. Route and sponsor,
// four members in ranks, their gear, the pack and the standing orders.
import { useEffect } from 'react';
import {
  DELVER_PROFS,
  EXP_TUNING,
  LENGTHS,
  SUPPLIES,
  SUPPLY_IDS,
  ZONES,
  delverMaxHp,
  gearLookup,
  launchExpedition,
  livingDelvers,
  packCost,
  packSlots,
  planBlocked,
  planWarnings,
  slotsFor,
  suggestPlan,
  type ExpGame,
  type ExpLength,
  type ExpPlan,
  type StandingOrders,
  type SupplyId,
} from '../../engine';
import { useX } from '../../expStore';
import { useStore } from '../../store';
import { Btn, Price, Section, Seg } from '../kit/common';
import { Icon } from '../kit/icons';
import { SponsorCard } from './HallTab';
import { ProfSilhouette } from './Silhouette';
import { Vitals, first } from './xkit';

function startingPlan(g: ExpGame): ExpPlan {
  const lp = g.lastPlan;
  const alive = new Set(livingDelvers(g).filter((d) => d.hp >= 1).map((d) => d.id));
  if (lp && lp.squad.every((id) => alive.has(id))) return { ...JSON.parse(JSON.stringify(lp)), sponsorId: undefined };
  const fresh = suggestPlan(g, lp?.length ?? 'short', lp?.orders);
  return fresh;
}

const ORDER_ROWS: { key: keyof StandingOrders; title: string; options: { value: string; label: string; text: string }[] }[] = [
  {
    key: 'retreat',
    title: 'Turn back',
    options: [
      { value: 'cautious', label: 'Cautious', text: 'Turn back as soon as anyone is badly hurt or shaken, or anyone dies.' },
      { value: 'steady', label: 'Steady', text: 'Turn back when two are badly hurt or shaken, or anyone dies.' },
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
      { value: 'avoid', label: 'Avoid them', text: 'Hide and let them pass. A Scout and soft boots help; plate and the dark do not. Fail and they ambush you.' },
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
      { value: 'freely', label: 'Freely', text: 'Bandage early, spend tokens before anyone gets close to breaking, cast with doses every time.' },
      { value: 'sparingly', label: 'Sparingly', text: 'Bandage the badly hurt, and save doses for the bigger monsters.' },
      { value: 'hoard', label: 'Hoard', text: 'Only in emergencies. Doses are kept for the Kiln and the engines.' },
    ],
  },
];

export function Prep() {
  const g = useX((s) => s.game)!;
  const draft = useX((s) => s.draft);
  const setDraft = useX((s) => s.setDraft);
  const act = useX((s) => s.act);
  const confirm = useStore((s) => s.confirm);
  const notify = useStore((s) => s.notify);
  useEffect(() => {
    if (!draft) setDraft(startingPlan(g));
  }, [draft, g, setDraft]);
  if (!draft) return null;
  const plan = draft;
  const update = (p: Partial<ExpPlan>) => setDraft({ ...plan, ...p });
  const L = LENGTHS[plan.length];
  const crew = livingDelvers(g);
  const squad = plan.squad.map((id) => crew.find((d) => d.id === id));
  const bench = crew.filter((d) => !plan.squad.includes(d.id));
  const used = packSlots(plan.pack);
  const cost = packCost(g, plan.pack);
  const blocked = planBlocked(g, plan);
  const warnings = planWarnings(g, plan);
  const zones = [...new Set(L.route.filter((x) => x !== 'camp' && x !== 'boss'))] as (keyof typeof ZONES)[];

  const place = (id: string, rank: number) => {
    const s = [...plan.squad];
    const at = s.indexOf(id);
    if (at >= 0) {
      [s[at], s[rank]] = [s[rank], s[at]];
    } else {
      s[rank] = id;
    }
    update({ squad: s.filter(Boolean) });
  };
  const move = (i: number, dir: -1 | 1) => {
    const s = [...plan.squad];
    const j = i + dir;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]];
    update({ squad: s });
  };
  const setPack = (k: SupplyId, n: number) => {
    const next = { ...plan.pack, [k]: Math.max(0, n) };
    if (packSlots(next) > EXP_TUNING.packSlots) return notify(`The pack is full. It holds ${EXP_TUNING.packSlots} slots.`);
    update({ pack: next });
  };
  const setOut = () => {
    const away = L.weeks;
    const wages = crew.reduce((s, d) => s + d.wage, 0) * away;
    confirm({
      title: `Send the squad down for ${away === 1 ? 'a week' : `${away} weeks`}?`,
      body: [
        `${squad.map((d) => (d ? first(d) : '')).join(', ')} go down into Old Pellam. ${L.goal}.`,
        `Wages for ${away === 1 ? 'the week' : `${away} weeks`}: ${wages} crowns, paid as they fall due.`,
      ],
      cost: cost ? `${cost} crowns of supplies to buy` : undefined,
      confirmLabel: 'Set out',
      onConfirm: () => {
        const err = act((x) => launchExpedition(x, plan));
        if (err) return notify(err);
        setDraft(undefined);
        useX.getState().setView('log');
      },
    });
  };

  return (
    <div className="app x-app x-prep">
      <header className="topbar x-topbar">
        <div className="row between topbar-row">
          <button className="back-btn" onClick={() => useX.getState().setView('guild')} aria-label="Back to the hall">
            <Icon name="chevron" size={18} style={{ transform: 'rotate(180deg)' }} /> Hall
          </button>
          <b className="x-prep-title">Plan an expedition</b>
          <span className="res-v small">
            <Icon name="coin" size={14} /> <b>{g.crowns}</b>
          </span>
        </div>
      </header>
      <main className="main x-prep-main">
        <Section title="Where">
          <Seg
            value={plan.length}
            onChange={(v: ExpLength) => {
              const sug = suggestPlan(g, v, plan.orders);
              update({ length: v, pack: sug.pack });
            }}
            options={(['short', 'medium', 'long'] as ExpLength[]).map((l) => ({ value: l, label: `${LENGTHS[l].name} · ${LENGTHS[l].weeks} wk` }))}
          />
          <div className="card x-route">
            <b>{L.goal}.</b>
            <span className="small">
              About {L.route.length} rooms through {zones.map((z) => ZONES[z].name).join(', then ')}
              {L.route.includes('camp') ? `, with ${L.route.filter((x) => x === 'camp').length === 1 ? 'a camp site' : 'two camp sites'} on the way` : ''}. Away for {L.weeks === 1 ? 'a week' : `${L.weeks} weeks`}.
            </span>
            <span className="tiny muted">{zones.map((z) => ZONES[z].text).join(' ')}</span>
          </div>
          {g.sponsors.length > 0 && <p className="small muted">Take a sponsor's commission (optional):</p>}
          {g.sponsors.map((s) => (
            <SponsorCard key={s.id} s={s} picked={plan.sponsorId === s.id} onPick={() => update({ sponsorId: plan.sponsorId === s.id ? undefined : s.id })} />
          ))}
        </Section>

        <Section title="The squad, front to back">
          <p className="tiny muted">Ranks 1 and 2 are in front: they can reach with a blade, and most monsters hit them. Bows and spells work from 3 and 4. Tap a member to change their gear.</p>
          {[0, 1, 2, 3].map((i) => {
            const d = squad[i];
            const ok = d ? DELVER_PROFS[d.prof].ranks.includes(i + 1) : true;
            return (
              <div key={i} className="x-rank">
                <span className={`x-rank-n ${ok ? '' : 'x-rank-off'}`}>{i + 1}</span>
                {d ? (
                  <button className="card tappable x-rank-card" onClick={() => useX.getState().open({ kind: 'member', id: d.id })}>
                    <ProfSilhouette prof={d.prof} size={40} />
                    <span className="x-member-main">
                      <span className="x-member-name">
                        <b>{first(d)}</b>
                        <small className="muted">
                          {DELVER_PROFS[d.prof].name} {d.level}
                          {!ok && <span className="warn"> · best in rank {DELVER_PROFS[d.prof].ranks.join(' or ')}</span>}
                        </small>
                      </span>
                      <Vitals d={d} />
                      <small className="muted x-gear-sum">
                        {[d.weapon, d.armor, d.trinket]
                          .map((u) => gearLookup(g)(u)?.name)
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                    </span>
                  </button>
                ) : (
                  <div className="card x-rank-card x-empty-rank">
                    <span className="muted small">Empty. Choose someone from the bench.</span>
                  </div>
                )}
                <span className="x-rank-moves">
                  <button className="btn small ghost" aria-label={`Move ${d ? first(d) : 'rank'} forward`} onClick={() => move(i, -1)} disabled={i === 0 || !d}>
                    ↑
                  </button>
                  <button className="btn small ghost" aria-label={`Move ${d ? first(d) : 'rank'} back`} onClick={() => move(i, 1)} disabled={i >= plan.squad.length - 1 || !d}>
                    ↓
                  </button>
                </span>
              </div>
            );
          })}
          {bench.length > 0 && (
            <>
              <p className="small muted">On the bench, resting at home:</p>
              {bench.map((d) => (
                <div key={d.id} className="x-bench row between">
                  <span className="row gap">
                    <ProfSilhouette prof={d.prof} size={32} />
                    <span>
                      <b>{first(d)}</b> <small className="muted">{DELVER_PROFS[d.prof].name} {d.level} · HP {d.hp}/{delverMaxHp(d)} · grit {d.grit}</small>
                    </span>
                  </span>
                  <span className="row gap x-bench-put">
                    {[0, 1, 2, 3].map((r) => (
                      <Btn
                        key={r}
                        className="btn small"
                        title={`Put ${first(d)} in rank ${r + 1}`}
                        blocked={d.hp < 1 ? `${first(d)} is too badly hurt to go down. Rest them a week first.` : undefined}
                        onClick={() => place(d.id, Math.min(r, plan.squad.length))}
                      >
                        {r + 1}
                      </Btn>
                    ))}
                  </span>
                </div>
              ))}
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
            const buy = Math.max(0, n - g.stores[k]);
            return (
              <div key={k} className="x-pack-row">
                <span className="x-pack-what">
                  <b>{SUPPLIES[k].name}</b>
                  <small className="muted">
                    {' '}
                    · {SUPPLIES[k].perSlot} a slot · {g.stores[k]} in the stores{buy ? `, ${buy} to buy` : ''}
                  </small>
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
          <p className="tiny muted">Nobody can give orders down there. These are what the squad will do.</p>
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
        <button className="btn ghost block small" onClick={() => setDraft(suggestPlan(g, plan.length, plan.orders))}>
          Start again from a suggested plan
        </button>
      </main>
      <div className="x-setout-bar">
        <Btn className="btn primary block x-setout" blocked={blocked} onClick={setOut}>
          Set out{cost ? <> · <Price n={cost} /></> : null}
        </Btn>
      </div>
    </div>
  );
}
