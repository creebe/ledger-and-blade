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
import { Meter, Section, StandingBar } from '../common';

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
  const plan = g.rivals.hobbs.plan;
  const counter = counterCost(g);
  const story = g.dispatches.filter((d) => d.kind === 'story').reverse();

  return (
    <div className="screen">
      <h1 className="screen-title">The Realm</h1>

      <Section title="The Debt">
        <p className="small muted">The realm's crisis moves every week, with or without you. Contracts and choices push these clocks.</p>
        <div className="clocks">
          {(Object.keys(CLOCKS) as ClockId[]).map((c) => {
            const v = g.clocks[c];
            const bad = CLOCKS[c].bad === 'high' ? v : 100 - v;
            return (
              <div key={c} className="clock">
                <div className="row between">
                  <b>{CLOCKS[c].name}</b>
                  <span>{Math.round(v)}</span>
                </div>
                <Meter value={v} tone={bad > 70 ? 'bad' : bad > 45 ? 'mid' : 'good'} />
                <p className="tiny muted">{CLOCKS[c].description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Powers of Varrow" right={<span className="small">Influence: {g.influence}</span>}>
        {(Object.keys(FACTIONS) as FactionId[]).map((id) => {
          const f = FACTIONS[id];
          const v = g.factions[id].standing;
          return (
            <div key={id} className="faction" style={{ ['--fc' as string]: f.color }}>
              <div className="row between">
                <b>
                  {f.sigil} {f.name}
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
              <button className="btn ghost small" disabled={g.influence < PETITION_COST || g.petitioned.includes(id)} onClick={() => act((d) => petition(d, id))}>
                {g.petitioned.includes(id) ? 'Petitioned this week' : `Court them (+6) · ${PETITION_COST} Influence`}
              </button>
            </div>
          );
        })}
      </Section>

      <Section title="Heat">
        <Meter value={g.heat} tone={g.heat >= 60 ? 'bad' : g.heat >= 30 ? 'mid' : 'good'} />
        <p className="small">
          Heat {g.heat}/100. Shady work draws the Exchequer's attention. Above 30, audits start; above 80, Exchequer standing falls weekly; at 100, your charter is in danger.
        </p>
        <button className="btn ghost small" disabled={g.influence < HEAT_COST || g.heat === 0} onClick={() => act((d) => coolHeat(d))}>
          Grease palms (−12 Heat) · {HEAT_COST} Influence
        </button>
      </Section>

      <Section title="Rivals">
        <div className="faction" style={{ ['--fc' as string]: RIVALS.hobbs.color }}>
          <div className="row between">
            <b>
              {RIVALS.hobbs.sigil} {RIVALS.hobbs.name}
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
                <button className="btn ghost small" onClick={() => act((d) => counterRivalPlan(d))}>
                  {counter.label}
                  {counter.influence ? ` · ${counter.influence} Influence` : ''}
                </button>
              )}
              {plan.kind === 'contract' && !plan.countered && <p className="tiny muted">Take the contract yourself before the week ends to deny it to them.</p>}
            </>
          ) : (
            <button className="btn ghost small" disabled={g.intel < INTEL_RIVAL_COST} onClick={() => act((d) => revealRivalPlan(d))}>
              Learn their plans this week · {INTEL_RIVAL_COST} Intel
            </button>
          )}
        </div>
      </Section>

      <Section title="Chronicle">
        {story.map((d) => (
          <div key={d.id} className="chronicle">
            <b className="small">{d.title}</b>
            <p className="small muted">{d.body[0]}</p>
          </div>
        ))}
      </Section>
    </div>
  );
}
