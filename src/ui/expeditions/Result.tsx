// What came back up: loot, deeds, the dead, and what happened to each member.
import { DELVER_PROFS, GOODS, HABITS, LENGTHS, SCARS, SUPPLIES, ZONES, type GoodId, type SupplyId } from '../../engine';
import { useX } from '../../expStore';
import { Price, Section } from '../kit/common';
import { ProfSilhouette } from './Silhouette';

export function ResultScreen() {
  const g = useX((s) => s.game)!;
  const res = g.last!;
  const L = LENGTHS[res.plan.length];
  const sponsor = res.plan.sponsorId;
  const loot = (Object.keys(res.loot) as GoodId[]).filter((k) => (res.loot[k] ?? 0) > 0);
  const used = (Object.keys(res.used) as SupplyId[]).filter((k) => (res.used[k] ?? 0) > 0);
  const headline = res.outcome === 'complete' ? 'The job is done' : res.outcome === 'retreated' ? 'They turned back' : 'The squad was lost';
  return (
    <div className="app x-app x-result">
      <main className="main">
        <h1 className={`screen-title ${res.outcome === 'lost' ? 'bad' : ''}`}>{headline}</h1>
        <p className="small">
          {L.name} expedition: {res.roomsCleared} of {res.roomsPlanned} rooms, down to {ZONES[res.deepest].name}.
        </p>
        <Section title="Brought home">
          {loot.length ? (
            <ul className="x-list">
              {loot.map((k) => (
                <li key={k} className="row between">
                  <span>
                    {res.loot[k]} × {GOODS[k].name}
                  </span>
                  <Price n={(res.loot[k] ?? 0) * GOODS[k].value} />
                </li>
              ))}
              {res.crownsFound > 0 && (
                <li className="row between">
                  <span>Coin taken off the grubbers and out of vaults</span>
                  <Price n={res.crownsFound} />
                </li>
              )}
            </ul>
          ) : (
            <p className="empty">Nothing came back up.</p>
          )}
          {sponsor && <p className={`small ${res.sponsorMet ? 'good' : 'warn'}`}>{res.sponsorMet ? "The sponsor's goal was met, and they have paid." : "The sponsor's goal was not met. The offer stands until it runs out."}</p>}
          {res.deeds.length > 0 && (
            <ul className="x-list">
              {res.deeds.map((d, i) => (
                <li key={i} className="good small">
                  {d}
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="The squad">
          {res.members.map((o) => {
            const d = g.members.find((m) => m.id === o.id)!;
            return (
              <div key={o.id} className={`card x-outcome ${o.died ? 'x-outcome-dead' : ''}`}>
                <ProfSilhouette prof={d.prof} size={40} state={o.died ? 'dead' : 'ok'} />
                <span className="x-member-main">
                  <b>{d.epithet ?? d.name}</b>
                  <small className="muted">
                    {DELVER_PROFS[d.prof].name} · level {d.level}
                  </small>
                  {o.died ? (
                    <span className="small bad">Died in Old Pellam: {o.died}.</span>
                  ) : (
                    <span className="small">
                      HP {o.hp}, grit {o.grit}. {o.kills ? `${o.kills} kill${o.kills === 1 ? '' : 's'}. ` : ''}+{o.xp} experience.
                    </span>
                  )}
                  {o.scars.map((s) => (
                    <span key={s} className="small warn">
                      New scar: {SCARS[s].name}. {SCARS[s].text}
                    </span>
                  ))}
                  {o.habits.map((h) => (
                    <span key={h} className={`small ${HABITS[h].good ? 'good' : 'bad'}`}>
                      New habit: {HABITS[h].name}. {HABITS[h].text}
                    </span>
                  ))}
                  {o.deeds.map((x, i) => (
                    <span key={i} className="small muted">
                      {d.name.split(' ')[0]} {x}.
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </Section>
        {used.length > 0 && (
          <Section title="Used from the pack">
            <p className="small">
              {used.map((k) => `${res.used[k]} ${SUPPLIES[k].name.toLowerCase()}`).join(', ')}. What was left has gone back into the stores.
            </p>
          </Section>
        )}
        <div className="x-result-actions">
          <button className="btn ghost block" onClick={() => useX.getState().setView('log', true)}>
            Read the log again
          </button>
          <button className="btn primary block" onClick={() => useX.getState().setView('guild')}>
            Back to the hall
          </button>
        </div>
      </main>
    </div>
  );
}
