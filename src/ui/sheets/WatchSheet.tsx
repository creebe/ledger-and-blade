// Watch together: every squad's lines from the week just ended, merged in the
// order things happened, under one strip per squad. A big moment holds the
// other squads' lines for a beat so it can't scroll past unseen.
// Tap the feed to speed up, Skip to show the rest, tap a strip to follow one squad.
import { useEffect, useMemo, useRef, useState } from 'react';
import { SITES, ZONES, feedForWeek, tripWeekOf, weekLines, type LogLine, type Mission } from '../../engine';
import { useStore } from '../../store';
import { Sheet } from '../kit/common';
import { shortDate } from '../kit/format';
import { SquadBadge, SquadStrip, cellsFromSnap } from '../expeditions/SquadStrip';

const delayFor = (l: LogLine, speed: number) => Math.max(200, Math.min(2600, (480 + l.text.length * 16) / speed));
/** how long a big moment holds the other squads' lines */
const HOLD = 1700;

export function WatchSheet({ week }: { week: number }) {
  const g = useStore((s) => s.game)!;
  const close = useStore((s) => s.close);
  const feed = useMemo(() => feedForWeek(g, week), [g, week]);
  const squads = useMemo(() => {
    const ids = [...new Set(feed.map((f) => f.missionId))];
    return ids
      .map((id) => [...g.missions, ...g.history].find((m) => m.id === id))
      .filter((m): m is Mission => !!m)
      .sort((a, b) => a.number - b.number);
  }, [feed, g]);
  const [shown, setShown] = useState(Math.min(1, feed.length));
  const [speed, setSpeed] = useState(1);
  const [follow, setFollow] = useState<string | undefined>();
  const end = useRef<HTMLDivElement>(null);
  const done = shown >= feed.length;
  const last = feed[shown - 1];
  const holding = !done && last?.line.big ? last.missionId : undefined;

  useEffect(() => {
    if (done) return;
    const next = feed[shown];
    // when following one squad, the others' lines pass without a wait
    const skipping = follow && next && next.missionId !== follow;
    const wait = skipping ? 30 : delayFor(last?.line ?? next.line, speed) + (holding ? HOLD / speed : 0);
    const t = window.setTimeout(() => setShown((n) => n + 1), wait);
    return () => window.clearTimeout(t);
  }, [shown, speed, done, feed, follow, holding, last]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: speed > 1 ? 'auto' : 'smooth', block: 'end' });
  }, [shown, speed, follow]);

  const visible = feed.slice(0, shown);
  return (
    <Sheet
      title="Watch together"
      footer={
        !done ? (
          <div className="row between">
            <span className="small muted x-speed">{speed > 1 ? 'Fast. Tap the feed to slow down.' : 'Tap the feed to speed up.'}</span>
            <button className="btn small ghost x-watch-skip" onClick={() => setShown(feed.length)}>
              Skip
            </button>
          </div>
        ) : (
          <button className="btn primary block" onClick={close}>
            Done
          </button>
        )
      }
    >
      <div className="xl-head x-watch-head">
        <p className="tiny muted x-watch-when">
          Down below, {shortDate(week, g.week)}. {squads.length > 1 ? (follow ? 'Tap the squad again to see everyone.' : 'Tap a squad to follow only them.') : ''}
        </p>
        {squads.map((ms) => {
          const mine = visible.filter((f) => f.missionId === ms.id);
          const at = mine[mine.length - 1]?.line ?? startOfWeek(ms, week);
          if (!at) return null;
          const room = [...mine].reverse().find((f) => f.line.room !== undefined)?.line ?? (at.room !== undefined ? at : undefined);
          const where = room?.zone ? `${ZONES[room.zone].name}, room ${room.room! + 1} of ${ms.result.roomsPlanned}` : 'on the road';
          const waiting = !!holding && holding !== ms.id;
          const on = follow === ms.id;
          return (
            <button
              key={ms.id}
              className={`x-watch-squad ${on ? 'on' : ''} ${(follow && !on) || waiting ? 'x-watch-dim' : ''}`}
              aria-pressed={on}
              onClick={() => squads.length > 1 && setFollow(on ? undefined : ms.id)}
            >
              <span className="x-watch-label">
                <SquadBadge n={ms.number} />
                <b>{SITES[ms.contract.expedition.site].name}</b>
                <small className="muted">{waiting ? 'holding' : where}</small>
              </span>
              <SquadStrip cells={cellsFromSnap(g, ms, at.squad)} size={0} label={`Squad ${ms.number}`} />
            </button>
          );
        })}
      </div>
      {!feed.length && <p className="small muted">Nothing new down below this week.</p>}
      <div className="x-log xl-log x-watch-feed" onClick={() => !done && setSpeed((s) => (s === 1 ? 4 : 1))}>
        {visible.map((f, i) =>
          follow && f.missionId !== follow ? null : (
            <p key={i} className={`x-line x-watch-line x-k-${f.line.kind} ${f.line.big ? 'x-big' : ''} ${i === shown - 1 && !done ? 'x-fresh' : ''}`}>
              <SquadBadge n={f.number} />
              <span>
                {f.line.text}
                {f.line.note && <span className="x-note"> {f.line.note}</span>}
              </span>
            </p>
          ),
        )}
        <div ref={end} className="x-log-end" />
      </div>
    </Sheet>
  );
}

/** The squad as it stood when the week began: the last line of the week before, or the first of this one. */
function startOfWeek(ms: Mission, gameWeek: number): LogLine | undefined {
  const w = tripWeekOf(ms, gameWeek);
  if (!w) return undefined;
  const before = w > 1 ? weekLines(ms, w - 1) : [];
  return before[before.length - 1] ?? weekLines(ms, w)[0];
}
