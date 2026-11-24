import { currentDate, DATE_BY_ID, nextDate, projectLedger, stakesLines } from '../../engine';
import { useStore } from '../../store';
import { Sheet } from '../kit/common';
import { crowns, shortDate } from '../kit/format';
import { Icon } from '../kit/icons';
import { DateCard } from '../panels/DateCard';

/** The full view of the Dates: what's coming, what it takes, what's at stake, what came before. */
export function DateSheet() {
  const g = useStore((s) => s.game)!;
  const c = currentDate(g);
  const next = nextDate(g);
  const past = [...g.dates.past].reverse().slice(0, 8);
  const hasCrowns = c?.active.targets.some((t) => t.kind === 'crowns' || t.kind === 'loanPaid');
  const projected = c && hasCrowns ? projectLedger(g, c.weeksLeft + 1)[c.weeksLeft]?.balance : undefined;
  return (
    <Sheet title="Dates">
      <p className="small muted">
        A Date is a day on the guild's calendar worth preparing for. If every target is met when it arrives, the guild collects the reward, and if any one is missed, it pays the
        cost. The next Date is always in view, though events can call one off.
      </p>
      {c ? (
        <>
          <DateCard label="Next Date" still />
          {projected !== undefined && (
            <p className="small date-projection">
              <Icon name="coin" size={14} /> If nothing changes, the treasury will hold about {crowns(projected)} when that week closes.
            </p>
          )}
          <div className="date-stakes">
            <div className="date-stake good-side">
              <h4>If you meet it</h4>
              <ul>
                {stakesLines(c.def.reward).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
            <div className="date-stake bad-side">
              <h4>If you miss it</h4>
              <ul>
                {stakesLines(c.def.cost).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <p className="hint">Nothing is on the calendar this week. A new Date is set at the start of next week.</p>
      )}
      {next && (
        <>
          <h3 className="subhead">After that</h3>
          <div className="date-next">
            <b>{next.title}</b>
            <span className="small muted"> · {next.who}</span>
            <p className="tiny muted">This one is expected next, but events may change it.</p>
          </div>
        </>
      )}
      {past.length > 0 && (
        <>
          <h3 className="subhead">Past Dates</h3>
          <ul className="date-past">
            {past.map((p, i) => (
              <li key={i} className={`small outcome-${p.outcome}`}>
                <Icon name={p.outcome === 'met' ? 'check' : p.outcome === 'missed' ? 'x' : 'exit'} size={14} />
                <span>
                  {DATE_BY_ID[p.id]?.title ?? p.id} · {shortDate(p.week, g.week)}
                </span>
                <span className="date-past-outcome">{p.outcome === 'met' ? 'Met' : p.outcome === 'missed' ? 'Missed' : 'Called off'}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Sheet>
  );
}
