// The expedition, read live: lines appear one at a time at a readable pace.
// Tap the log to speed it up; Skip shows the rest at once.
import { useEffect, useRef, useState } from 'react';
import { LENGTHS, type LogLine } from '../../engine';
import { useX } from '../../expStore';
import { Icon } from '../kit/icons';
import { MonsterSilhouette, ProfSilhouette } from './Silhouette';
import { XBar } from './xkit';

const delayFor = (l: LogLine, speed: number) => Math.max(260, Math.min(2800, (520 + l.text.length * 17 + (l.big ? 500 : 0)) / speed));

export function LiveLog() {
  const g = useX((s) => s.game)!;
  const replay = useX((s) => s.replay);
  const res = g.last!;
  const log = res.log;
  const [shown, setShown] = useState(replay ? log.length : 1);
  const [speed, setSpeed] = useState(1);
  const end = useRef<HTMLDivElement>(null);
  const done = shown >= log.length;
  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), delayFor(log[shown - 1], speed));
    return () => window.clearTimeout(t);
  }, [shown, speed, done, log]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: speed > 1 ? 'auto' : 'smooth', block: 'end' });
  }, [shown, speed]);
  const cur = log[Math.max(0, shown - 1)];
  const squad = res.plan.squad.map((id) => g.members.find((m) => m.id === id)!);
  const foes = cur.enemies;
  return (
    <div className="app x-app x-log-app">
      <header className="x-log-head">
        <div className="row between">
          <b className="x-log-title">{LENGTHS[res.plan.length].name} expedition · Old Pellam</b>
          {!done ? (
            <button className="btn small ghost" onClick={() => setShown(log.length)}>
              Skip
            </button>
          ) : (
            <span className="small muted">{replay ? 'The log' : 'Done'}</span>
          )}
        </div>
        <div className="x-strip" aria-label="The squad">
          {squad.map((d, i) => {
            const st = cur.squad.state[i];
            return (
              <div key={d.id} className={`x-strip-cell x-st-${st}`}>
                <ProfSilhouette prof={d.prof} size={38} state={st} />
                <span className="x-strip-name">{d.name.split(' ')[0]}</span>
                <XBar v={cur.squad.hp[i]} max={cur.squad.maxHp[i]} kind="hp" label={`HP ${cur.squad.hp[i]} of ${cur.squad.maxHp[i]}`} />
                <XBar v={cur.squad.grit[i]} max={100} kind="grit" label={`Grit ${cur.squad.grit[i]}`} />
                <span className="x-strip-num">
                  {st === 'dead' ? 'dead' : st === 'down' ? 'down' : st === 'shaken' ? 'shaken' : `${cur.squad.hp[i]} hp · ${cur.squad.grit[i]}`}
                </span>
              </div>
            );
          })}
        </div>
        {foes && foes.length > 0 && (
          <div className="x-foes" aria-label="Enemies">
            {foes.map((f, i) => (
              <div key={i} className={`x-foe ${f.hp <= 0 ? 'x-foe-dead' : ''}`}>
                <MonsterSilhouette monster={f.monster} size={34} dead={f.hp <= 0} />
                <span className="x-foe-name">{f.name.replace(/^the /, '')}</span>
                <XBar v={f.hp} max={f.maxHp} kind="hp" />
              </div>
            ))}
          </div>
        )}
      </header>
      <main className="x-log" onClick={() => !done && setSpeed((s) => (s === 1 ? 4 : 1))}>
        {log.slice(0, shown).map((l, i) => (
          <p key={i} className={`x-line x-k-${l.kind} ${l.big ? 'x-big' : ''} ${i === shown - 1 && !done ? 'x-fresh' : ''}`}>
            {l.text}
            {l.note && <span className="x-note"> {l.note}</span>}
          </p>
        ))}
        <div ref={end} className="x-log-end" />
      </main>
      <footer className="x-log-foot">
        {done ? (
          <button className="btn primary block" onClick={() => useX.getState().setView('result')}>
            {replay ? 'Back' : 'Back to the guild'} <Icon name="chevron" size={16} />
          </button>
        ) : (
          <span className="small muted x-speed">{speed > 1 ? 'Fast. Tap the log to slow down.' : 'Tap the log to speed up.'}</span>
        )}
      </footer>
    </div>
  );
}
