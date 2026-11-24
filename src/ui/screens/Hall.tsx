import { useState } from 'react';
import { dateLabel, living, projectLedger, repayLoan, type GameState, upkeep, weeklyWages } from '../../engine';
import { type Tab, useStore } from '../../store';
import { crowns, crownsDelta, num, plural, weeks } from '../kit/format';
import { Btn, Empty, Section } from '../kit/common';
import { Icon } from '../kit/icons';
import { BuildingsSection } from '../panels/Buildings';
import { GuideCard } from '../panels/Guide';
import { DispatchItem } from '../kit/DispatchItem';

/** Where tapping an alert takes the player. */
export interface AlertTarget {
  tab?: Tab;
  /** a `data-guide` anchor to scroll to on that tab */
  guide?: string;
  /** the Realm sub-tab to show */
  realm?: string;
  /** open this contract's planner */
  planner?: string;
}

export function alerts(g: GameState): { tone: 'warn' | 'bad' | 'info'; text: string; to?: AlertTarget }[] {
  const out: { tone: 'warn' | 'bad' | 'info'; text: string; to?: AlertTarget }[] = [];
  if (g.pendingEvents.length) out.push({ tone: 'warn', text: `${plural(g.pendingEvents.length, 'dispatch', 'dispatches')} ${g.pendingEvents.length === 1 ? 'awaits' : 'await'} your decision.` });
  for (const l of g.loans) {
    const inWeeks = l.dueWeek - g.week;
    if (inWeeks <= 1) out.push({ tone: g.crowns < l.paymentDue + weeklyWages(g) ? 'bad' : 'warn', text: `Loan payment of ${crowns(l.paymentDue)} due ${inWeeks <= 0 ? 'this week' : 'next week'}.`, to: { tab: 'hall', guide: 'debt' } });
    if (l.missed) out.push({ tone: 'bad', text: `Missed loan payments: ${l.missed} of 3.`, to: { tab: 'hall', guide: 'debt' } });
  }
  if (g.insolventWeeks) out.push({ tone: 'bad', text: `In the red for ${plural(g.insolventWeeks, 'week')}. At 4, the guild is bankrupt.`, to: { tab: 'hall', guide: 'ledger' } });
  if (g.charterWeeks) out.push({ tone: 'bad', text: `Charter in danger: ${plural(6 - g.charterWeeks, 'week')} left to fix it.`, to: { tab: 'realm', realm: 'powers', guide: 'heat' } });
  if (g.heat >= 60) out.push({ tone: 'warn', text: `Heat is ${g.heat}. The Exchequer is watching.`, to: { tab: 'realm', realm: 'powers', guide: 'heat' } });
  const back = g.missions.filter((m) => m.returnWeek === g.week);
  if (back.length) out.push({ tone: 'info', text: `${plural(back.length, 'squad')} ${back.length === 1 ? 'returns' : 'return'} at the end of this week.`, to: { tab: 'contracts' } });
  const arriving = g.missions.filter((m) => !m.report && m.arriveWeek === g.week);
  if (arriving.length) out.push({ tone: 'info', text: `${plural(arriving.length, 'squad')} ${arriving.length === 1 ? 'reaches its' : 'reach their'} objective this week.`, to: { tab: 'contracts' } });
  const home = living(g).filter((m) => m.status !== 'mission').length;
  if (g.supplies < home * 2) out.push({ tone: 'warn', text: `Supplies are low (${g.supplies}). Buy more at the Armory.`, to: { tab: 'armory' } });
  const story = g.board.find((c) => c.story);
  if (story) out.push({ tone: 'info', text: `Story contract available: "${story.title}".`, to: { planner: story.id } });
  return out;
}

/** Follow an alert: switch tab, pick the Realm sub-tab, scroll to the anchor, or open a planner. */
export function goTo(to: AlertTarget) {
  const st = useStore.getState();
  if (to.planner) return st.open({ kind: 'planner', contractId: to.planner });
  if (to.realm) {
    try {
      localStorage.setItem('lab.realm.tab', to.realm);
    } catch {
      /* ignore */
    }
  }
  if (to.tab) st.setTab(to.tab);
  window.setTimeout(() => {
    if (to.guide) document.querySelector(`[data-guide="${to.guide}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 60);
}

export function HallScreen() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const proj = projectLedger(g, 4);
  const last = g.ledger[g.ledger.length - 1];
  const book = g.weekBook;
  const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);
  const loan = g.loans[0];
  const al = alerts(g);
  const [older, setOlder] = useState(false);
  // this week and last week; older news on request
  const all = [...g.dispatches].reverse().slice(0, 40);
  const feed = older ? all : all.filter((d) => d.week >= g.week - 1);
  const feedWeeks = [...new Set(feed.map((d) => d.week))];
  const net = (r: { income: Record<string, number>; expenses: Record<string, number> }) => sum(r.income) - sum(r.expenses);

  return (
    <div className="screen">
      <h1 className="screen-title">The Hall</h1>

      <GuideCard compact />

      {al.length > 0 && (
        <Section title="Attention">
          <ul className="alerts">
            {al.map((a, i) => (
              <li key={i} className={`${a.tone} ${a.to ? 'has-target' : ''}`}>
                {a.to ? (
                  <button className="alert-row alert-go tappable" onClick={() => goTo(a.to!)}>
                    <Icon name={a.tone === 'info' ? 'info' : 'warn'} size={18} style={{ color: a.tone === 'bad' ? 'var(--bad)' : a.tone === 'warn' ? 'var(--mid)' : 'var(--ink-2)' }} />
                    <span>{a.text}</span>
                  </button>
                ) : (
                  <span className="alert-row">
                    <Icon name={a.tone === 'info' ? 'info' : 'warn'} size={18} style={{ color: a.tone === 'bad' ? 'var(--bad)' : a.tone === 'warn' ? 'var(--mid)' : 'var(--ink-2)' }} />
                    <span>{a.text}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="The Ledger" guide="ledger">
        <div className="ledger-grid">
          <div>
            <span className="muted small">Weekly costs</span>
            <b>{crowns(weeklyWages(g) + upkeep(g))}</b>
            <span className="tiny muted">
              wages {weeklyWages(g)} + upkeep {upkeep(g)}
            </span>
          </div>
          <div>
            <span className="muted small">This week so far</span>
            <b className={net(book) < 0 ? 'neg' : net(book) > 0 ? 'pos' : ''}>{crownsDelta(net(book))}</b>
          </div>
          {last && (
            <div>
              <span className="muted small">Last week</span>
              <b className={net(last) < 0 ? 'neg' : net(last) > 0 ? 'pos' : ''}>{crownsDelta(net(last))}</b>
            </div>
          )}
        </div>
        {loan && (
          <button className="loan-line tappable" onClick={() => goTo({ tab: 'hall', guide: 'debt' })}>
            <Icon name="seal" size={14} />
            <span>
              Loan: {crowns(Math.ceil(loan.principal))} owed · {crowns(loan.paymentDue)} due {loan.dueWeek <= g.week ? 'this week' : `in ${weeks(loan.dueWeek - g.week)}`}
            </span>
          </button>
        )}
        <table className="proj">
          <thead>
            <tr>
              <th>Week</th>
              <th>Costs</th>
              <th>Loan</th>
              <th>Expected</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {proj.map((p) => (
              <tr key={p.week}>
                <td>{p.week === g.week ? 'Now' : `+${p.week - g.week}`}</td>
                <td>{num(-(p.wages + p.upkeep))}</td>
                <td>{p.loan ? num(-p.loan) : '—'}</td>
                <td>{p.expectedIncome ? `+${p.expectedIncome}` : '—'}</td>
                <td className={p.balance < 0 ? 'neg' : ''}>{num(p.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tiny muted">The projection counts known costs and the listed pay of squads already in the field. Supplies are bought separately.</p>
        {last && (
          <details>
            <summary className="small">Last week in detail</summary>
            <ul className="parts">
              {Object.entries(last.income).map(([k, v]) => (
                <li key={k}>
                  {k} <span>+{v}</span>
                </li>
              ))}
              {Object.entries(last.expenses).map(([k, v]) => (
                <li key={k} className="neg">
                  {k} <span>{num(-v)}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Section>

      <BuildingsSection />

      <Section title="The Loan" guide="debt">
        {loan ? (
          <>
            <p>
              You owe the Weighhouse <b>{crowns(Math.ceil(loan.principal))}</b> at {Math.round(loan.weeklyRate * 100)}% interest per week. Next payment: <b>{crowns(loan.paymentDue)}</b>{' '}
              {loan.dueWeek === g.week ? 'at the end of this week' : `in ${weeks(loan.dueWeek - g.week)}`}.
            </p>
            <div className="row wrap gap">
              {[50, 100, 250].map((n) => (
                <Btn
                  key={n}
                  className="btn ghost small"
                  blocked={g.crowns < n ? `Need ${n} crowns (you have ${g.crowns})` : undefined}
                  onClick={() =>
                    useStore.getState().confirm({
                      title: `Repay ${n} crowns early?`,
                      body: [`Your debt falls from ${Math.ceil(loan.principal)} to ${Math.ceil(loan.principal - n)}, saving about ${crowns(Math.round(n * loan.weeklyRate * 10) / 10)} interest every week.`, `Make sure you can still cover wages: ${crowns(weeklyWages(g) + upkeep(g))} a week.`],
                      cost: `Treasury ${g.crowns} → ${g.crowns - n}`,
                      confirmLabel: `Repay ${n}`,
                      onConfirm: () => act((d) => repayLoan(d, n)),
                    })
                  }
                >
                  Repay {n}
                </Btn>
              ))}
              <Btn
                className="btn ghost small"
                blocked={g.crowns < loan.principal ? `Need ${Math.ceil(loan.principal)} crowns to clear the debt` : undefined}
                onClick={() =>
                  useStore.getState().confirm({
                    title: 'Clear the whole debt?',
                    body: ['The Weighhouse returns your note, and the guild owes nothing.'],
                    cost: `Treasury ${g.crowns} → ${g.crowns - Math.ceil(loan.principal)}`,
                    confirmLabel: 'Repay all',
                    onConfirm: () => act((d) => repayLoan(d, Math.ceil(loan.principal))),
                  })
                }
              >
                Repay all
              </Btn>
            </div>
            <p className="tiny muted">Paying early reduces the interest that piles up each week. Missing 3 payments means ruin.</p>
          </>
        ) : (
          <p className="good">The guild is debt-free.</p>
        )}
      </Section>

      <Section title="Dispatches" guide="dispatches">
        {feed.length === 0 && <Empty>Nothing yet.</Empty>}
        {feedWeeks.map((w) => (
          <div key={w}>
            <h4 className="week-head">{dateLabel(w)}</h4>
            {feed
              .filter((d) => d.week === w)
              .map((d) => (
                <DispatchItem key={d.id} d={d} />
              ))}
          </div>
        ))}
        {!older && all.length > feed.length && (
          <button className="btn ghost small block" onClick={() => setOlder(true)}>
            Show older dispatches
          </button>
        )}
      </Section>
    </div>
  );
}
