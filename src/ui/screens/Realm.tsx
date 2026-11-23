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
  type ClockId,
  type FactionId,
} from '../../engine';
import { useStore } from '../../store';
import { Btn, Meter, Section, StandingBar } from '../common';
import { Icon } from '../icons';
import { CouncilSection } from '../Council';

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
  const plan = g.rivals.hobbs.plan;
  const counter = counterCost(g);

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
        {(Object.keys(FACTIONS) as FactionId[]).map((id) => {
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
        <div className="faction" style={{ ['--fc' as string]: RIVALS.hobbs.color }}>
          <div className="row between">
            <b className="meta" style={{ color: 'var(--ink)', fontSize: '1rem' }}>
              <span className="type-icon" style={{ width: 32, height: 32 }}>
                <Icon name="hobbs" size={18} />
              </span>
              {RIVALS.hobbs.name}
            </b>
            <span className="small">Renown {Math.round(g.rivals.hobbs.renown)} (you: {g.renown})</span>
          </div>
          <p className="small">{RIVALS.hobbs.who}</p>
          <p className="small muted">
            Contracts taken from under you: {g.rivals.hobbs.contractsWon} · Aggression: {g.rivals.hobbs.aggression >= 0.65 ? 'High' : g.rivals.hobbs.aggression >= 0.35 ? 'Moderate' : 'Low'}
          </p>
          {plan?.revealed ? (
            <>
              <p className="warn small">This week: {describePlan(g, plan)}</p>
              {plan.countered && <p className="good small">Countered.</p>}
              {counter && (
                <button
                  className="btn ghost small"
                  onClick={() =>
                    confirm({
                      title: 'Counter Hobb & Daughters?',
                      body: [counter.label + '.', 'Their plan for this week will come to nothing.'],
                      cost: counter.influence ? `Costs ${counter.influence} Influence · you have ${g.influence}` : `Costs ${counter.crowns} crowns · you have ${g.crowns}`,
                      confirmLabel: 'Counter them',
                      onConfirm: () => act((d) => counterRivalPlan(d)) && notify('Countered. Their plan for this week is foiled.'),
                    })
                  }
                >
                  {counter.label}
                  {counter.influence ? ` · ${counter.influence} Influence` : ''}
                </button>
              )}
              {plan.kind === 'contract' && !plan.countered && <p className="tiny muted">Take the contract yourself before the week ends to deny it to them.</p>}
            </>
          ) : (
            <Btn
              className="btn ghost small"
              blocked={g.intel < INTEL_RIVAL_COST ? `Needs ${INTEL_RIVAL_COST} Intel (you have ${g.intel}). Set members to Gather rumors.` : undefined}
              onClick={() =>
                confirm({
                  title: "Spy on Hobb & Daughters?",
                  body: ['Your informants will learn what the Hobbs intend this week: a contract they want, a member they are courting, or rumors they are spreading. Some plans can then be countered.'],
                  cost: `Costs ${INTEL_RIVAL_COST} Intel · you have ${g.intel}`,
                  confirmLabel: `Spend ${INTEL_RIVAL_COST} Intel`,
                  onConfirm: () => act((d) => revealRivalPlan(d)),
                })
              }
            >
              Learn their plans this week · {INTEL_RIVAL_COST} Intel
            </Btn>
          )}
        </div>
      </Section>

    </div>
  );
}
