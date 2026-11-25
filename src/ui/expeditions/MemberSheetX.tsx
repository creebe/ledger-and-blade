import { useState } from 'react';
import { CONDITIONS, DELVER_PROFS, EXP_TUNING, GEAR, HABITS, SCARS, delverStats, dismissDelver, equipGear, gearLookup, livingDelvers, storedGear, treatExposure } from '../../engine';
import { useX } from '../../expStore';
import { useStore } from '../../store';
import { Btn, Section } from '../kit/common';
import { gearLine } from './MarketTab';
import { ProfSilhouette } from './Silhouette';
import { Vitals, XSheet, first, xShort } from './xkit';

const SLOTS = [
  { id: 'weapon' as const, name: 'Weapon' },
  { id: 'armor' as const, name: 'Armor' },
  { id: 'trinket' as const, name: 'Trinket' },
];

export function MemberSheetX({ id }: { id: string }) {
  const g = useX((s) => s.game)!;
  const act = useX((s) => s.act);
  const confirm = useStore((s) => s.confirm);
  const notify = useStore((s) => s.notify);
  const [picking, setPicking] = useState<'weapon' | 'armor' | 'trinket' | null>(null);
  const d = livingDelvers(g).find((m) => m.id === id);
  if (!d) return null;
  const prof = DELVER_PROFS[d.prof];
  const st = delverStats(d, gearLookup(g));
  const next = EXP_TUNING.xp.levels[d.level] as number | undefined;
  const options = picking ? storedGear(g).filter((it) => GEAR[it.defId].slot === picking) : [];
  return (
    <XSheet title={d.epithet ?? d.name}>
      <div className="x-member-head">
        <ProfSilhouette prof={d.prof} size={64} />
        <div>
          <b>{prof.name}</b>, level {d.level}
          <div className="small muted">{prof.blurb}</div>
          <div className="tiny muted">
            {next ? `${d.xp} of ${next} experience to level ${d.level + 1}.` : 'At the highest level for now.'} Wage {d.wage} a week. {d.dives} expeditions, {d.kills} kills.
          </div>
        </div>
      </div>
      <Vitals d={d} />
      <div className="x-stats">
        <span>
          Aim <b>{st.acc}</b>
        </span>
        <span>
          Dodge <b>{st.dodge}</b>
        </span>
        <span>
          Armor <b>{st.prot}</b>
        </span>
        <span>
          Might <b>{d.attrs.might}</b>
        </span>
        <span>
          Finesse <b>{d.attrs.finesse}</b>
        </span>
        <span>
          Wits <b>{d.attrs.wits}</b>
        </span>
        <span>
          Resolve <b>{d.attrs.resolve}</b>
        </span>
      </div>
      <Section title="Gear">
        {SLOTS.map((s) => {
          const def = gearLookup(g)(d[s.id]);
          return (
            <button key={s.id} className="card tappable x-slot" onClick={() => setPicking(picking === s.id ? null : s.id)}>
              <small className="muted">{s.name}</small>
              <b>{def?.name ?? 'Nothing'}</b>
              {def && <small className="muted">{gearLine(def)}</small>}
            </button>
          );
        })}
        {picking && (
          <div className="x-picker">
            <p className="small muted">From the store, for the {SLOTS.find((x) => x.id === picking)!.name.toLowerCase()}:</p>
            {options.length === 0 && <p className="empty">Nothing in the store for that slot. The market sells more.</p>}
            {options.map((it) => (
              <button
                key={it.uid}
                className="card tappable x-slot"
                onClick={() => {
                  const err = act((x) => equipGear(x, d.id, picking, it.uid));
                  if (err) notify(err);
                  setPicking(null);
                }}
              >
                <b>{GEAR[it.defId].name}</b>
                <small className="muted">{gearLine(GEAR[it.defId])}</small>
              </button>
            ))}
            {d[picking] && (
              <Btn className="btn small ghost" onClick={() => (act((x) => equipGear(x, d.id, picking, undefined)), setPicking(null))}>
                Take it off
              </Btn>
            )}
          </div>
        )}
      </Section>
      <Section title="Fatigue and Exposure">
        <p className="small">
          Fatigue {d.fatigue} of 100. At {EXP_TUNING.fatigue.tired} they lose a little aim and dodge; at {EXP_TUNING.fatigue.spent} a lot, and they fumble; at 100 they have to be carried. A week at home takes off {EXP_TUNING.home.rest}.
        </p>
        <p className="small">
          Exposure {d.exposure} of 100: the College Sink's runoff in their body. Past {EXP_TUNING.exposure.thresholds.join(', ')} it leaves a lasting condition. It fades by {EXP_TUNING.exposure.homeDrop} a week at home.
        </p>
        {d.exposure > 0 && (
          <Btn
            className="btn small"
            blocked={xShort(g, EXP_TUNING.exposure.treatCost, "A night in Saint Oda's fever beds")}
            onClick={() =>
              confirm({
                title: `Send ${first(d)} to Saint Oda's?`,
                body: `A night in the fever beds draws ${EXP_TUNING.exposure.treat} Exposure out of them. Sister Brune's people use vinegar, charcoal and a great deal of water.`,
                cost: `${EXP_TUNING.exposure.treatCost} crowns`,
                confirmLabel: 'Send them',
                onConfirm: () => notify(act((x) => treatExposure(x, d.id)) ?? `${first(d)} comes back from Saint Oda's smelling of vinegar.`),
              })
            }
          >
            Treat at Saint Oda's
          </Btn>
        )}
      </Section>
      <Section title="Skills">
        <p className="tiny muted">Best from rank {prof.ranks.join(' or ')}.</p>
        {prof.skills.map((s) => (
          <p key={s.name} className="small">
            <b>{s.name}.</b> {s.text}
          </p>
        ))}
      </Section>
      {(d.scars.length > 0 || d.habits.length > 0 || (d.conditions ?? []).length > 0) && (
        <Section title="Scars, conditions and habits">
          {(d.conditions ?? []).map((c) => (
            <p key={c} className="small">
              <b className={CONDITIONS[c].good ? 'good' : 'bad'}>{CONDITIONS[c].name}.</b> {CONDITIONS[c].text}
            </p>
          ))}
          {d.scars.map((s) => (
            <p key={s} className="small">
              <b>{SCARS[s].name}.</b> {SCARS[s].text}
            </p>
          ))}
          {d.habits.map((h) => (
            <p key={h} className="small">
              <b className={HABITS[h].good ? 'good' : 'bad'}>{HABITS[h].name}.</b> {HABITS[h].text}
            </p>
          ))}
        </Section>
      )}
      {d.deeds.length > 0 && (
        <Section title="What they're known for">
          <ul className="x-deeds">
            {d.deeds.map((x, i) => (
              <li key={i} className="small">
                {first(d)} {x}.
              </li>
            ))}
          </ul>
          <p className="tiny muted">Fame {d.fame}. At {EXP_TUNING.fame.epithet}, the Lower Town gives them a name.</p>
        </Section>
      )}
      <Section title="Let them go">
        <Btn
          className="btn small danger"
          onClick={() =>
            confirm({
              title: `Let ${first(d)} go?`,
              body: 'They leave the guild for good, and they take the gear they are wearing with them.',
              confirmLabel: 'Let them go',
              danger: true,
              onConfirm: () => {
                useX.getState().close();
                notify(act((x) => dismissDelver(x, d.id)) ?? `${first(d)} has gone.`);
              },
            })
          }
        >
          Dismiss {first(d)}
        </Btn>
      </Section>
    </XSheet>
  );
}
