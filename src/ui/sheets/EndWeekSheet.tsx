import { buildersSpeed, dateLabel, endWeekWarnings, living, projectLedger, upkeep, weeklyWages } from '../../engine';
import { useStore } from '../../store';
import { Sheet } from '../kit/common';
import { crowns, plural, wk } from '../kit/format';
import { HoldButton } from '../kit/HoldButton';
import { Icon } from '../kit/icons';
import { ASSIGNMENTS } from '../kit/members';
import { DateCard } from '../panels/DateCard';

/** What members at home are doing, for the summary line. */
const DOING: Record<string, string> = {
  rest: 'resting',
  train: 'training',
  rumors: 'gathering rumors',
  labor: 'working the docks',
  guard: 'guarding the hall',
  build: 'building',
  scout: 'scouting',
};

/**
 * The last look before the week resolves: warnings first, then what's locked
 * in, then the next Date. Ending the week takes a press-and-hold.
 */
export function EndWeekSheet() {
  const g = useStore((s) => s.game)!;
  const close = useStore((s) => s.close);
  const endWeek = useStore((s) => s.endWeek);
  const warnings = endWeekWarnings(g);
  const leaving = g.missions.filter((m) => m.dispatchedWeek === g.week && !m.report);
  const below = g.missions.filter((m) => !m.report && m.sealed && m.dispatchedWeek + m.plannedWeeks - 1 !== g.week);
  const returning = g.missions.filter((m) => !m.report && m.dispatchedWeek + m.plannedWeeks - 1 === g.week);
  const home = living(g).filter((m) => m.status === 'idle');
  const orders = ASSIGNMENTS.map((a) => ({ a, n: home.filter((m) => m.assignment === a.id).length })).filter((x) => x.n > 0);
  const loanDue = g.loans.find((l) => l.dueWeek === g.week);
  const bills = weeklyWages(g) + upkeep(g);
  const after = projectLedger(g, 1)[0]?.balance;
  const voting = g.council.agenda.length > 0 && g.council.voteWeek === g.week;
  const name = (id: string) => g.members.find((m) => m.id === id)?.name.split(' ')[0] ?? '';
  return (
    <Sheet
      title="End the week?"
      footer={
        <div className="endweek-foot">
          <button className="btn ghost" onClick={close}>
            Go back
          </button>
          <HoldButton
            className="btn primary"
            hint="Press and hold to end the week."
            onConfirm={() => {
              close();
              endWeek();
            }}
          >
            Hold to end {dateLabel(g.week).split(' · ').slice(0, 2).join(' ')}
          </HoldButton>
        </div>
      }
    >
      <p className="small muted">Everything below happens at once when the week ends, and none of it can be undone.</p>
      {warnings.length > 0 && (
        <>
          <h3 className="subhead">Check first</h3>
          <ul className="alerts">
            {warnings.map((w, i) => (
              <li key={i} className="warn">
                <span className="alert-row">
                  <Icon name="warn" size={18} style={{ color: 'var(--mid)' }} />
                  <span>{w}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      <h3 className="subhead">Locked in</h3>
      <ul className="endweek-list">
        {leaving.map((m) => (
          <li key={m.id}>
            <Icon name="road" size={14} />
            <span>
              <b>{m.contract.title}</b>: {m.memberIds.map(name).join(', ')} {m.memberIds.length === 1 ? 'leaves' : 'leave'} for {m.contract.region}.
            </span>
          </li>
        ))}
        {below.map((m) => (
          <li key={m.id}>
            <Icon name="road" size={14} />
            <span>
              <b>{m.contract.title}</b>: squad {m.number} goes on. Their next stretch is in the week report.
            </span>
          </li>
        ))}
        {returning.map((m) => (
          <li key={m.id}>
            <Icon name="hall" size={14} />
            <span>
              <b>{m.contract.title}</b>: the squad is due home.
            </span>
          </li>
        ))}
        {orders.length > 0 && (
          <li>
            <Icon name="people" size={14} />
            <span>At home: {orders.map((x) => `${x.n} ${DOING[x.a.id]}`).join(', ')}.</span>
          </li>
        )}
        {g.construction && (
          <li>
            <Icon name="bricks" size={14} />
            <span>Building continues, with about {wk(Math.max(1, Math.ceil((g.construction.weeks - g.construction.progress) / buildersSpeed(g))))} left.</span>
          </li>
        )}
        {g.craftQueue.length > 0 && (
          <li>
            <Icon name="anvil" size={14} />
            <span>The workshop works through its queue of {plural(g.craftQueue.length, 'item')}.</span>
          </li>
        )}
        {voting && (
          <li>
            <Icon name="seal" size={14} />
            <span>The Council votes.</span>
          </li>
        )}
        <li>
          <Icon name="coin" size={14} />
          <span>
            Bills: {crowns(bills)} in wages and upkeep{loanDue ? `, plus the loan payment of ${crowns(loanDue.paymentDue)}` : ''}. The treasury should close the week at about {crowns(after ?? g.crowns)}.
          </span>
        </li>
      </ul>
      <DateCard compact />
    </Sheet>
  );
}
