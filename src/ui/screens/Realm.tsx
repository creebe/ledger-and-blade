import { useEffect, useState } from 'react';
import {
  CLOCKS,
  coolHeat,
  counterCost,
  counterRivalPlan,
  describePlan,
  FACTIONS,
  HEAT_COST,
  INTEL_RIVAL_COST,
  petition,
  PETITION_COST,
  revealRivalPlan,
  RIVALS,
  activeRivals,
  feudStage,
  guards,
  hallDefense,
  inTruce,
  level,
  operationOptions,
  runOperation,
  STAGES,
  sweepForSpies,
  SWEEP_COST,
  factionKnown,
  type ClockId,
  type GameState,
  type FactionId,
  type RivalId,
} from '../../engine';
import { useStore } from '../../store';
import { Btn, Meter, Section, Seg, StandingBar } from '../kit/common';
import { shortDate } from '../kit/format';
import { firstShort, short } from '../kit/shortfall';
import { Icon } from '../kit/icons';
import { CouncilSection } from '../panels/Council';

/** The first of crowns, Intel or Influence the guild is short of, with a way to get more. */
const costsShort = (g: GameState, c: { crowns?: number; intel?: number; influence?: number }, what: string) =>
  firstShort(
    g,
    [
      ...(c.crowns ? [{ res: 'crowns' as const, need: c.crowns }] : []),
      ...(c.intel ? [{ res: 'intel' as const, need: c.intel }] : []),
      ...(c.influence ? [{ res: 'influence' as const, need: c.influence }] : []),
    ],
    what,
  );

const CLOCK_ICON: Record<string, string> = { arrears: 'arrears', leverage: 'ostranders', unrest: 'crowd', cointrust: 'coin' };

function standingWord(v: number) {
  if (v >= 60) return 'Devoted';
  if (v >= 30) return 'Friendly';
  if (v >= 10) return 'Warm';
  if (v > -10) return 'Neutral';
  if (v > -30) return 'Cool';
  if (v > -60) return 'Hostile';
  return 'Enemy';
}

type RealmTab = 'council' | 'powers' | 'rivals' | 'debt';
const REALM_KEY = 'lab.realm.tab';
/** Which sub-tab holds each guided anchor, so the notes can point into the Realm. */
const GUIDE_TAB: Record<string, RealmTab> = { council: 'council', factions: 'powers', heat: 'powers', rivals: 'rivals', clocks: 'debt' };

function readRealmTab(): RealmTab {
  try {
    const v = localStorage.getItem(REALM_KEY);
    if (v === 'council' || v === 'powers' || v === 'rivals' || v === 'debt') return v;
  } catch {
    /* ignore */
  }
  return 'council';
}

export function RealmScreen() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const guideTarget = useStore((s) => s.guideTarget);
  const { confirm, notify } = useStore.getState();
  const stored = useStore((s) => s.subTabs.realm) as RealmTab | undefined;
  const tab: RealmTab = stored ?? readRealmTab();
  const setTab = (t: RealmTab) => {
    useStore.getState().setSubTab('realm', t);
    try {
      localStorage.setItem(REALM_KEY, t);
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    if (guideTarget && GUIDE_TAB[guideTarget]) setTab(GUIDE_TAB[guideTarget]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideTarget]);
  const undecided = g.council.agenda.filter((a) => a.player === 0).length;
  const plansToAnswer = activeRivals(g).filter((id) => g.rivals[id].plan?.revealed && !g.rivals[id].plan?.countered).length;

  return (
    <div className="screen">
      <h1 className="screen-title">The Realm</h1>
      <Seg
        value={tab}
        onChange={setTab}
        options={[
          { value: 'council', label: <span className="seg-l">Council{undecided ? <i className="seg-dot" aria-label={`${undecided} decrees without a stance`} /> : null}</span> },
          { value: 'powers', label: 'Powers' },
          { value: 'rivals', label: <span className="seg-l">Rivals{plansToAnswer ? <i className="seg-dot" aria-label={`${plansToAnswer} plans revealed`} /> : null}</span> },
          { value: 'debt', label: 'The Debt' },
        ]}
      />

      {tab === 'council' && <CouncilSection />}

      {tab === 'debt' && (
      <Section title="The Debt" guide="clocks">
        <p className="small muted">The realm's crisis moves every week, with or without you. Contracts and choices push these clocks.</p>
        <div className="clocks">
          {(Object.keys(CLOCKS) as ClockId[]).map((c) => {
            const v = g.clocks[c];
            const bad = CLOCKS[c].bad === 'high' ? v : 100 - v;
            return (
              <div key={c} className="clock">
                <div className="row between">
                  <b className="meta" style={{ color: 'var(--ink)' }}>
                    <Icon name={CLOCK_ICON[c]} size={18} style={{ color: bad > 70 ? 'var(--bad)' : bad > 45 ? 'var(--mid)' : 'var(--ink-2)' }} />
                    {CLOCKS[c].name}
                  </b>
                  <span>{Math.round(v)}</span>
                </div>
                <Meter value={v} tone={bad > 70 ? 'bad' : bad > 45 ? 'mid' : 'good'} />
                <p className="tiny muted">{CLOCKS[c].description}</p>
              </div>
            );
          })}
        </div>
      </Section>
      )}

      {tab === 'powers' && (
      <>
      <Section
        guide="factions"
        title="Powers of Varrow"
        right={
          <span className="meta">
            <Icon name="seal" size={14} /> {g.influence} Influence
          </span>
        }
      >
        {(Object.keys(FACTIONS) as FactionId[]).filter((id) => factionKnown(g, id)).map((id) => {
          const f = FACTIONS[id];
          const v = g.factions[id].standing;
          return (
            <div key={id} className="faction" style={{ ['--fc' as string]: f.color }}>
              <div className="row between">
                <b className="meta card-title">
                  <span className="type-icon" style={{ width: 32, height: 32 }}>
                    <Icon name={id} size={18} />
                  </span>
                  {f.name}
                </b>
                <span className="small">
                  {standingWord(v)} ({v > 0 ? '+' : ''}
                  {v})
                </span>
              </div>
              <StandingBar value={v} />
              <p className="small">{f.who}</p>
              <p className="small muted">
                <i>On the Debt:</i> {f.stance}
              </p>
              <p className="tiny muted">{f.perks}</p>
              <Btn className="btn ghost small" blocked={g.petitioned.includes(id) ? 'Already courted this week. Try again next week.' : short(g, 'influence', PETITION_COST, 'Courting them')} onClick={() =>
                  confirm({
                    title: `Court ${f.name}?`,
                    body: [
                      `You call in favors, send gifts and attend the right dinners. Standing with ${f.name} rises by 6 (now ${v}).`,
                      id === 'ostranders' && !g.flags.ostranders_open ? 'This also tells Factor Vorn you are open to bank work.' : 'You can court each faction once a week.',
                    ],
                    cost: `Costs ${PETITION_COST} Influence · you have ${g.influence}`,
                    confirmLabel: `Spend ${PETITION_COST} Influence`,
                    onConfirm: () => act((d) => petition(d, id)) && notify(`${f.name}: standing ${v} → ${Math.min(100, v + 6)}`),
                  })
                }>
                {g.petitioned.includes(id) ? 'Petitioned this week' : `Court them (+6) · ${PETITION_COST} Influence`}
              </Btn>
            </div>
          );
        })}
      </Section>

      <Section
        guide="heat"
        title={
          <>
            <Icon name="flame" size={18} /> Heat
          </>
        }
      >
        <Meter value={g.heat} tone={g.heat >= 60 ? 'bad' : g.heat >= 30 ? 'mid' : 'good'} />
        <p className="small">
          Heat {g.heat}/100. Shady work draws the Exchequer's attention. Above 30, audits start; above 80, Exchequer standing falls weekly; at 100, your charter is in danger.
        </p>
        <Btn className="btn ghost small" blocked={g.heat === 0 ? 'No Heat to cool.' : short(g, 'influence', HEAT_COST, 'Greasing palms')} onClick={() =>
            confirm({
              title: 'Grease some palms?',
              body: [`A few quiet payments to the right Exchequer clerks. Heat falls from ${g.heat} to ${Math.max(0, g.heat - 12)}.`],
              cost: `Costs ${HEAT_COST} Influence · you have ${g.influence}`,
              confirmLabel: `Spend ${HEAT_COST} Influence`,
              onConfirm: () => act((d) => coolHeat(d)) && notify(`Heat ${g.heat} → ${Math.max(0, g.heat - 12)}`),
            })
          }>
          Grease palms (−12 Heat) · {HEAT_COST} Influence
        </Btn>
      </Section>
      </>
      )}

      {tab === 'rivals' && (
      <Section title="Rivals" guide="rivals">
        <div className="defense-row">
          <p className="small">
            <Icon name="guard" size={14} /> Hall defense: {Math.round(hallDefense(g) * 100)}% · {guards(g).length} on guard · Spymaster's Den level {level(g, 'den')}
          </p>
          <p className="tiny muted">Assign members to Guard the hall to stop thieves, arsonists and knives in the night. A Den helps catch spies.</p>
          <Btn
            className="btn ghost small"
            blocked={short(g, 'intel', SWEEP_COST, 'A search')}
            onClick={() =>
              confirm({
                title: 'Search the hall for spies?',
                body: ["Your people go through the hall and question the new faces. Any rival's spy has a good chance of being found."],
                cost: `Costs ${SWEEP_COST} Intel · you have ${g.intel}`,
                confirmLabel: `Spend ${SWEEP_COST} Intel`,
                onConfirm: () => act((d) => sweepForSpies(d)),
              })
            }
          >
            Search the hall for spies · {SWEEP_COST} Intel
          </Btn>
        </div>
        {activeRivals(g).map((id) => (
          <RivalCard key={id} id={id} />
        ))}
      </Section>
      )}

    </div>
  );
}

function RivalCard({ id }: { id: RivalId }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const { confirm, notify } = useStore.getState();
  const r = g.rivals[id];
  const info = RIVALS[id];
  const plan = r.plan;
  const counter = counterCost(g, id);
  const spyBody: Record<RivalId, string> = {
    hobbs: 'Your informants will learn what the Hobbs intend this week: a contract they want, a member they are courting, or rumors they are spreading. Some plans can then be countered.',
    ninth: 'Your informants will learn what the Ninth intend this week: a contract they want, or one of your people Mayne is trying to hire. Both can be dealt with.',
    assay: 'Your informants will learn whether the Assay Office means to take a contract or inspect your stillroom this week. An inspection can be put off.',
  };
  return (
    <div className="faction" style={{ ['--fc' as string]: info.color }}>
      <div className="row between">
        <b className="meta card-title">
          <span className="type-icon" style={{ width: 32, height: 32 }}>
            <Icon name={id} size={18} />
          </span>
          {info.name}
        </b>
        <span className="small">Renown {Math.round(r.renown)} (you: {g.renown})</span>
      </div>
      <p className="small">{info.who}</p>
      <p className="small muted">
        Contracts taken from under you: {r.contractsWon} · Aggression: {r.aggression >= 0.65 ? 'High' : r.aggression >= 0.35 ? 'Moderate' : 'Low'}
        {id === 'assay' && (g.flags.assay_licensed ? ' · Licensed' : ' · Not licensed')}
      </p>
      <div className="feud">
        <div className="row between">
          <span className="small">
            <b>{STAGES[feudStage(g, id)]}</b>
            {inTruce(g, id) && <span className="muted"> · truce until {shortDate(r.truceUntil!, g.week)}</span>}
            {r.ourSpy && <span className="muted"> · your spy is inside</span>}
          </span>
          <span className="tiny muted">Feud {Math.round(r.feud ?? 0)}/100</span>
        </div>
        <Meter value={r.feud ?? 0} tone={feudStage(g, id) === 2 ? 'bad' : feudStage(g, id) === 1 ? 'mid' : 'good'} />
      </div>
      {plan?.revealed ? (
        <>
          <p className="warn small">This week: {describePlan(g, plan, id)}</p>
          {plan.countered && <p className="good small">Countered.</p>}
          {counter && (
            <Btn
              className="btn ghost small"
              blocked={costsShort(g, counter, 'Countering them')}
              onClick={() =>
                confirm({
                  title: `Counter ${info.name}?`,
                  body: [counter.label + '.', 'Their plan for this week will come to nothing.'],
                  cost: counter.influence ? `Costs ${counter.influence} Influence · you have ${g.influence}` : counter.intel ? `Costs ${counter.intel} Intel · you have ${g.intel}` : `Costs ${counter.crowns} crowns · you have ${g.crowns}`,
                  confirmLabel: 'Counter them',
                  onConfirm: () => act((d) => counterRivalPlan(d, id)) && notify('Countered. Their plan for this week is foiled.'),
                })
              }
            >
              {counter.label}
              {counter.influence ? ` · ${counter.influence} Influence` : ''}
            </Btn>
          )}
          {plan.kind === 'contract' && !plan.countered && <p className="tiny muted">Take the contract yourself before the week ends to deny it to them.</p>}
        </>
      ) : (
        <Btn
          className="btn ghost small"
          blocked={short(g, 'intel', INTEL_RIVAL_COST, 'Spying on them')}
          onClick={() =>
            confirm({
              title: `Spy on ${info.name}?`,
              body: [spyBody[id]],
              cost: `Costs ${INTEL_RIVAL_COST} Intel · you have ${g.intel}`,
              confirmLabel: `Spend ${INTEL_RIVAL_COST} Intel`,
              onConfirm: () => act((d) => revealRivalPlan(d, id)),
            })
          }
        >
          Learn their plans this week · {INTEL_RIVAL_COST} Intel
        </Btn>
      )}
      <Operations id={id} />
    </div>
  );
}

function Operations({ id }: { id: RivalId }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const { confirm, notify } = useStore.getState();
  const [open, setOpen] = useState(false);
  const opts = operationOptions(g, id);
  const costText = (c: { crowns?: number; intel?: number; influence?: number }) =>
    [c.crowns && `${c.crowns} crowns`, c.intel && `${c.intel} Intel`, c.influence && `${c.influence} Influence`].filter(Boolean).join(', ');
  const haveText = (c: { crowns?: number; intel?: number; influence?: number }) =>
    [c.crowns && `${g.crowns} crowns`, c.intel && `${g.intel} Intel`, c.influence && `${g.influence} Influence`].filter(Boolean).join(', ');
  return (
    <div className="ops">
      <button className="link-btn small" onClick={() => setOpen(!open)}>
        {open ? 'Hide operations' : `Operations against ${RIVALS[id].name}`}
      </button>
      {open &&
        opts.map((o) => (
          <div key={o.kind} className="op-row">
            <Btn
              className="btn ghost small"
              blocked={o.blocked ?? costsShort(g, o.cost, 'This operation')}
              onClick={() =>
                confirm({
                  title: `${o.label}?`,
                  body: [o.detail],
                  cost: costText(o.cost) ? `Costs ${costText(o.cost)} · you have ${haveText(o.cost)}` : 'Adds a job to your contract board',
                  confirmLabel: o.label,
                  onConfirm: () => act((d) => runOperation(d, id, o.kind)) && notify(o.label),
                })
              }
            >
              {o.label}
              {costText(o.cost) ? ` · ${costText(o.cost)}` : ''}
            </Btn>
            <p className="tiny muted">{o.detail}</p>
          </div>
        ))}
    </div>
  );
}
