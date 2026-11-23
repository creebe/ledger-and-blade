import { dateLabel, upkeep, living, projectLedger, repayLoan, weeklyWages, type Dispatch, type GameState } from '../../engine';
import { useStore } from '../../store';
import { Btn, Empty, Section } from '../common';
import { Icon } from '../icons';
import { BuildingsSection } from '../Buildings';
import { GuideCard } from '../Guide';

const KIND_ICON: Record<string, string> = { lore: 'book', crier: 'ear', story: 'quest', mission: 'scroll', economy: 'coin', politics: 'seal', roster: 'people', rival: 'hobbs', warning: 'warn', info: 'info' };
// only warnings and the story get color; everything else is neutral
const KIND_COLOR: Record<string, string> = { story: 'var(--accent)', warning: 'var(--bad)' };

export function alerts(g: GameState): { tone: 'warn' | 'bad' | 'info'; text: string }[] {
  const out: { tone: 'warn' | 'bad' | 'info'; text: string }[] = [];
  if (g.pendingEvents.length) out.push({ tone: 'warn', text: `${g.pendingEvents.length} dispatch(es) await your decision.` });
  for (const l of g.loans) {
    const inWeeks = l.dueWeek - g.week;
    if (inWeeks <= 1) out.push({ tone: g.crowns < l.paymentDue + weeklyWages(g) ? 'bad' : 'warn', text: `Loan payment of ${l.paymentDue}◉ due ${inWeeks <= 0 ? 'this week' : 'next week'}.` });
    if (l.missed) out.push({ tone: 'bad', text: `Missed loan payments: ${l.missed} of 3.` });
  }
  if (g.insolventWeeks) out.push({ tone: 'bad', text: `In the red for ${g.insolventWeeks} week(s). At 4, the guild is bankrupt.` });
  if (g.charterWeeks) out.push({ tone: 'bad', text: `Charter in danger: ${6 - g.charterWeeks} week(s) left to fix it.` });
  if (g.heat >= 60) out.push({ tone: 'warn', text: `Heat is ${g.heat}. The Exchequer is watching.` });
  const back = g.missions.filter((m) => m.returnWeek === g.week);
  if (back.length) out.push({ tone: 'info', text: `${back.length} squad(s) return at the end of this week.` });
  const arriving = g.missions.filter((m) => !m.report && m.arriveWeek === g.week);
  if (arriving.length) out.push({ tone: 'info', text: `${arriving.length} squad(s) reach their objective this week.` });
  const home = living(g).filter((m) => m.status !== 'mission').length;
  if (g.supplies < home * 2) out.push({ tone: 'warn', text: `Supplies are low (${g.supplies}). Buy more at the Armory.` });
  const story = g.board.find((c) => c.story);
  if (story) out.push({ tone: 'info', text: `Story contract available: "${story.title}".` });
  return out;
}

export function DispatchItem({ d }: { d: Dispatch }) {
  const open = useStore((s) => s.open);
  const game = useStore((s) => s.game)!;
  const mission = d.missionId ? [...game.missions, ...game.history].find((m) => m.id === d.missionId) : undefined;
  return (
    <article className={`dispatch k-${d.kind}`}>
      <h4 className="alert-row">
        <Icon name={KIND_ICON[d.kind] ?? 'scroll'} size={16} style={{ color: KIND_COLOR[d.kind] ?? 'var(--ink-2)' }} />
        <span>{d.title}</span>
      </h4>
      {d.body.map((b, i) => (
        <p key={i}>{b}</p>
      ))}
      {mission?.report && (
        <button className="btn ghost small" onClick={() => open({ kind: 'mission', id: mission.id })}>
          ▶ Read the mission report
        </button>
      )}
    </article>
  );
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
  const feed = [...g.dispatches].reverse().slice(0, 40);
  const weeks = [...new Set(feed.map((d) => d.week))];

  return (
    <div className="screen">
      <h1 className="screen-title">The Hall</h1>
      <p className="muted">{dateLabel(g.week)}</p>

      <GuideCard compact />

      {al.length > 0 && (
        <Section title="Attention">
          <ul className="alerts">
            {al.map((a, i) => (
              <li key={i} className={`${a.tone} alert-row`}>
                <Icon name={a.tone === 'bad' ? 'warn' : a.tone === 'warn' ? 'info' : 'clock'} size={16} style={{ color: a.tone === 'bad' ? 'var(--bad)' : a.tone === 'warn' ? 'var(--mid)' : 'var(--ink-2)' }} />
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="The Ledger">
        <div className="ledger-grid">
          <div>
            <span className="muted small">Weekly costs</span>
            <b>
              {weeklyWages(g) + upkeep(g)}◉
            </b>
            <span className="tiny muted">
              wages {weeklyWages(g)} + upkeep {upkeep(g)}
            </span>
          </div>
          <div>
            <span className="muted small">This week so far</span>
            <b className={sum(book.income) - sum(book.expenses) < 0 ? 'neg' : sum(book.income) - sum(book.expenses) > 0 ? 'pos' : ''}>
              {sum(book.income) - sum(book.expenses) >= 0 ? '+' : ''}
              {sum(book.income) - sum(book.expenses)}◉
            </b>
          </div>
          {last && (
            <div>
              <span className="muted small">Last week</span>
              <b className={sum(last.income) - sum(last.expenses) < 0 ? 'neg' : sum(last.income) - sum(last.expenses) > 0 ? 'pos' : ''}>
                {sum(last.income) - sum(last.expenses) >= 0 ? '+' : ''}
                {sum(last.income) - sum(last.expenses)}◉
              </b>
            </div>
          )}
        </div>
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
                <td>−{p.wages + p.upkeep}</td>
                <td>{p.loan ? `−${p.loan}` : '—'}</td>
                <td>{p.expectedIncome ? `+${p.expectedIncome}` : '—'}</td>
                <td className={p.balance < 0 ? 'neg' : ''}>{p.balance}</td>
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
                  {k} <span>−{v}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Section>

      <BuildingsSection />

      <Section title="Debt" guide="debt">
        {loan ? (
          <>
            <p>
              You owe the Weighhouse <b>{Math.ceil(loan.principal)}◉</b> at {Math.round(loan.weeklyRate * 100)}% interest per week. Next payment: <b>{loan.paymentDue}◉</b>{' '}
              {loan.dueWeek === g.week ? 'at the end of this week' : `in ${loan.dueWeek - g.week} weeks`}.
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
                      body: [`Your debt falls from ${Math.ceil(loan.principal)} to ${Math.ceil(loan.principal - n)}, saving about ${Math.round(n * loan.weeklyRate * 10) / 10}◉ interest every week.`, `Make sure you can still cover wages: ${weeklyWages(g) + upkeep(g)}◉ a week.`],
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
        {weeks.map((w) => (
          <div key={w}>
            <h4 className="week-head">{dateLabel(w)}</h4>
            {feed
              .filter((d) => d.week === w)
              .map((d) => (
                <DispatchItem key={d.id} d={d} />
              ))}
          </div>
        ))}
      </Section>
    </div>
  );
}
