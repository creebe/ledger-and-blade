// One squad's expedition log, as far as it has been revealed. The latest
// week's lines play in at a readable pace; tap to speed up, Skip to show all.
import { useEffect, useMemo, useRef, useState } from 'react';
import { PROFESSIONS, SITES, track, revealedWeeks, squadStatus, visibleLog, type LogLine } from '../../engine';
import { useStore } from '../../store';
import { Sheet } from '../kit/common';
import { MonsterSilhouette, ProfSilhouette } from '../expeditions/Silhouette';
import { XBar } from '../expeditions/xkit';

const delayFor = (l: LogLine, speed: number) => Math.max(220, Math.min(2600, (480 + l.text.length * 16 + (l.big ? 500 : 0)) / speed));

export function ExpLogSheet({ id }: { id: string }) {
  const g = useStore((s) => s.game)!;
  const ms = [...g.missions, ...g.history].find((m) => m.id === id);
  const log = useMemo(() => (ms ? visibleLog(g, ms) : []), [g, ms]);
  const weeksSeen = ms ? revealedWeeks(g, ms) : 0;
  // lines of the latest revealed week play in; the rest are already read
  const firstNew = Math.max(0, log.findIndex((l) => l.week === weeksSeen));
  const [shown, setShown] = useState(() => (ms?.report ? log.length : Math.min(log.length, firstNew + 1)));
  const [speed, setSpeed] = useState(1);
  const end = useRef<HTMLDivElement>(null);
  // reading a finished trip's log counts for the Guildmaster's Notes
  useEffect(() => {
    if (ms?.report) useStore.getState().act((s) => track(s, 'journal'));
  }, [ms?.id, ms?.report]);
  const done = shown >= log.length;
  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), delayFor(log[shown - 1] ?? log[0], speed));
    return () => window.clearTimeout(t);
  }, [shown, speed, done, log]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: speed > 1 ? 'auto' : 'smooth', block: 'end' });
  }, [shown, speed]);
  if (!ms) return <Sheet title="Expedition">Nothing to show.</Sheet>;
  const st = squadStatus(g, ms);
  const cur = log[Math.max(0, shown - 1)];
  const squad = ms.result.squad.map((mid) => g.members.find((m) => m.id === mid));
  const foes = cur?.enemies;
  const title = `Squad ${ms.number} · ${SITES[ms.contract.expedition.site].name}`;
  return (
    <Sheet
      title={title}
      footer={
        !done ? (
          <div className="row between">
            <span className="small muted x-speed">{speed > 1 ? 'Fast. Tap the log to slow down.' : 'Tap the log to speed up.'}</span>
            <button className="btn small ghost" onClick={() => setShown(log.length)}>
              Skip
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="x-sheet">
      <div className="xl-head">
        <p className="small muted">
          {ms.contract.title}.{' '}
          {ms.report
            ? `${ms.report.tier}.`
            : !ms.sealed
              ? 'Still in the yard: they leave at the end of the week.'
              : `Week ${st.revealed} of about ${ms.plannedWeeks}${st.zone ? `, in ${st.zone}, room ${st.room} of ${st.rooms}` : ', on the road'}.`}
        </p>
        {cur && (
          <div className="x-strip" aria-label="The squad">
            {squad.map((m, i) => {
              const state = cur.squad.state[i];
              if (!m || state === undefined) return null;
              return (
                <div key={m.id} className={`x-strip-cell x-st-${state}`}>
                  <ProfSilhouette prof={m.profession} size={38} state={state} />
                  <span className="x-strip-name">{m.name.split(' ')[0]}</span>
                  <XBar v={cur.squad.hp[i]} max={cur.squad.maxHp[i]} kind="hp" label={`HP ${cur.squad.hp[i]} of ${cur.squad.maxHp[i]}`} />
                  <XBar v={cur.squad.fatigue[i]} max={100} kind="fatigue" label={`Fatigue ${cur.squad.fatigue[i]}`} />
                  <span className="x-strip-num">
                    {state === 'dead' ? 'dead' : state === 'down' ? 'down' : state === 'out' ? 'carried' : `${cur.squad.hp[i]} hp${state === 'spent' ? ' · spent' : ''}${cur.squad.fever?.[i] ? ' · fever' : ''}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
      </div>
      {!log.length && <p className="small muted">Nothing yet. The first stretch of the trip shows in the week report after End Week.</p>}
      <div className="x-log xl-log" onClick={() => !done && setSpeed((s) => (s === 1 ? 4 : 1))}>
        {log.slice(0, shown).map((l, i) => (
          <div key={i}>
            {(i === 0 || log[i - 1].week !== l.week) && <h4 className="xl-week">Week {l.week}</h4>}
            <p className={`x-line x-k-${l.kind} ${l.big ? 'x-big' : ''} ${i === shown - 1 && !done ? 'x-fresh' : ''}`}>
              {l.text}
              {l.note && <span className="x-note"> {l.note}</span>}
            </p>
          </div>
        ))}
        <div ref={end} className="x-log-end" />
      </div>
      {ms.report && done && (
        <div className="card xl-result">
          <b>{ms.report.tier}</b>
          {ms.report.summary.map((l, i) => (
            <span key={i} className="small">
              {l}
            </span>
          ))}
          <span className="tiny muted">{squad.filter(Boolean).map((m) => `${m!.name.split(' ')[0]} (${PROFESSIONS[m!.profession].name})`).join(', ')}</span>
        </div>
      )}
      </div>
    </Sheet>
  );
}
