import { useState } from 'react';
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
  type FactionId,
  type RivalId,
} from '../../engine';
import { useStore } from '../../store';
import { Btn, Meter, Section, StandingBar } from '../kit/common';
import { Icon } from '../kit/icons';
import { CouncilSection } from '../panels/Council';

const CLOCK_ICON: Record<string, string> = { arrears: 'clock', leverage: 'ostranders', unrest: 'crowd', cointrust: 'coin' };

function standingWord(v: number) {
  if (v >= 60) return 'Devoted';
  if (v >= 30) return 'Friendly';
  if (v >= 10) return 'Warm';
  if (v > -10) return 'Neutral';
  if (v > -30) return 'Cool';
  if (v > -60) return 'Hostile';
  return 'Enemy';
}

export function RealmScreen() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const { confirm, notify } = useStore.getState();

  return (
    <div className="screen">
      <h1 className="screen-title">The Realm</h1>

      <CouncilSection />

      <Section title="The Debt">
        <p className="small muted">The realm's crisis moves every week, with or without you. Contracts and choices push these clocks.</p>
        <div className="clocks">
          {(Object.keys(CLOCKS) as ClockId[]).map((c) => {
            const v = g.clocks[c];
            const bad = CLOCKS[c].bad === 'high' ? v : 100 - v;
            return (
              <div key={c} className="clock">
                <div className="row between">
                  <b className="meta" style={{ color: 'var(--ink)' }}>
                    <Icon name={CLOCK_ICON[c]} size={16} style={{ color: bad > 70 ? 'var(--bad)' : bad > 45 ? 'var(--mid)' : 'var(--ink-2)' }} />
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

      <Section
        guide="factions"
        title="Powers of Varrow"
        right={
          <span className="meta">
            <Icon name="seal" size={14} style={{ color: 'var(--r-influence)' }} /> {g.influence} Influence
          </span>
        }
      >
        {(Object.keys(FACTIONS) as FactionId[]).filter((id) => factionKnown(g, id)).map((id) => {
          const f = FACTIONS[id];
          const v = g.factions[id].standing;
          return (
            <div key={id} className="faction" style={{ ['--fc' as string]: f.color }}>
              <div className="row between">
                <b className="meta" style={{ color: 'var(--ink)', fontSize: '1rem' }}>
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
              <Btn className="btn ghost small" blocked={g.petitioned.includes(id) ? 'Already courted this week. Try again next week.' : g.influence < PETITION_COST ? `Needs ${PETITION_COST} Influence (you have ${g.influence}). Influence comes from contracts, events and Council wins.` : undefined} onClick={() =>
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
        title={
          <>
            <Icon name="flame" size={18} style={{ color: 'var(--r-heat)' }} /> Heat
          </>
        }
      >
        <Meter value={g.heat} tone={g.heat >= 60 ? 'bad' : g.heat >= 30 ? 'mid' : 'good'} />
        <p className="small">
          Heat {g.heat}/100. Shady work draws the Exchequer's attention. Above 30, audits start; above 80, Exchequer standing falls weekly; at 100, your charter is in danger.
        </p>
        <Btn className="btn ghost small" blocked={g.heat === 0 ? 'No Heat to cool.' : g.influence < HEAT_COST ? `Needs ${HEAT_COST} Influence (you have ${g.influence})` : undefined} onClick={() =>
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

      <Section title="Rivals" guide="rivals">
        <div className="defense-row">
          <p className="small">
            <Icon name="guards" size={14} /> Hall defense: {Math.round(hallDefense(g) * 100)}% · {guards(g).length} on guard · Spymaster's Den level {level(g, 'den')}
          </p>
          <p className="tiny muted">Assign members to Guard the hall to stop thieves, arsonists and knives in the night. A Den helps catch spies.</p>
          <Btn
            className="btn ghost small"
            blocked={g.intel < SWEEP_COST ? `Needs ${SWEEP_COST} Intel (you have ${g.intel}).` : undefined}
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
        <b className="meta" style={{ color: 'var(--ink)', fontSize: '1rem' }}>
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
            {inTruce(g, id) && <span className="muted"> · truce until week {r.truceUntil}</span>}
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
              blocked={counter.intel && g.intel < counter.intel ? `Needs ${counter.intel} Intel (you have ${g.intel})` : counter.crowns && g.crowns < counter.crowns ? `Needs ${counter.crowns} crowns (you have ${g.crowns})` : counter.influence && g.influence < counter.influence ? `Needs ${counter.influence} Influence (you have ${g.influence})` : undefined}
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
          blocked={g.intel < INTEL_RIVAL_COST ? `Needs ${INTEL_RIVAL_COST} Intel (you have ${g.intel}). Set members to Gather rumors.` : undefined}
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
  const short = (c: { crowns?: number; intel?: number; influence?: number }) =>
    c.crowns && g.crowns < c.crowns ? `Needs ${c.crowns} crowns (you have ${g.crowns})` : c.intel && g.intel < c.intel ? `Needs ${c.intel} Intel (you have ${g.intel})` : c.influence && g.influence < c.influence ? `Needs ${c.influence} Influence (you have ${g.influence})` : undefined;
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
              blocked={o.blocked ?? short(o.cost)}
              onClick={() =>
                confirm({
                  title: `${o.label}?`,
                  body: [o.detail],
                  cost: costText(o.cost) ? `Costs ${costText(o.cost)}` : 'Adds a job to your contract board',
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
