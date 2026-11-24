import { currentDate, FACTIONS, RIVALS, type GameState } from '../../engine';
import { useStore } from '../../store';
import { Icon } from '../kit/icons';
import { shortDate, weeks } from '../kit/format';

/** "in 3 weeks", or "this week" when it arrives at the end of the current week. */
export const dueText = (left: number) => (left <= 0 ? 'this week' : `in ${weeks(left)}`);

function Dot({ g }: { g: GameState }) {
  const c = currentDate(g);
  if (!c) return null;
  const color = c.def.faction ? FACTIONS[c.def.faction].color : c.def.rival ? RIVALS[c.def.rival].color : undefined;
  return color ? <i className="date-dot" style={{ background: color }} aria-hidden /> : null;
}

/** The current Date as a card: tap for the full sheet. `compact` drops the description. */
export function DateCard({ compact, label = 'Next date' }: { compact?: boolean; label?: string }) {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  const c = currentDate(g);
  if (!c) return null;
  const done = c.targets.filter((t) => t.met).length;
  return (
    <button className={`date-card tappable ${c.weeksLeft === 0 ? 'due-now' : ''}`} onClick={() => open({ kind: 'date' })}>
      <span className="date-card-head">
        <span className="date-kicker">
          <Icon name="date" size={14} /> {label}
        </span>
        <span className={`date-due ${c.weeksLeft === 0 ? 'now' : ''}`}>
          {c.weeksLeft === 0 ? 'Arrives this week' : `${dueText(c.weeksLeft)} · ${shortDate(c.active.dueWeek, g.week)}`}
        </span>
      </span>
      <b className="date-title">{c.def.title}</b>
      <span className="date-who">
        <Dot g={g} />
        {c.def.who}
      </span>
      {!compact && <span className="date-text small">{c.def.text(g)}</span>}
      <span className="date-targets">
        {c.targets.map((t, i) => (
          <span key={i} className={`date-target ${t.met ? 'met' : ''}`}>
            <span className="date-target-row">
              <Icon name={t.met ? 'check' : 'chevron'} size={12} />
              <span className="date-target-label">{t.label}</span>
            </span>
            <span className="date-target-progress">
              <span className="date-bar">
                <span style={{ width: `${Math.round(t.frac * 100)}%` }} />
              </span>
              <span className="date-target-now">{t.now}</span>
            </span>
          </span>
        ))}
      </span>
      <span className="date-score small muted">
        {c.targets.length === 1 ? (done ? 'Met so far.' : 'Not met yet.') : done === c.targets.length ? 'Every target met so far.' : `${done} of ${c.targets.length} targets met so far.`}
      </span>
    </button>
  );
}

/** The pill in the top bar: always in view, tap for the full sheet. */
export function DatePill() {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  const c = currentDate(g);
  if (!c) return null;
  const done = c.targets.filter((t) => t.met).length;
  const all = done === c.targets.length;
  return (
    <button className={`date-pill ${c.weeksLeft === 0 ? 'now' : ''} ${all ? 'all-met' : ''}`} onClick={() => open({ kind: 'date' })} aria-label={`Next date: ${c.def.title}, ${dueText(c.weeksLeft)}. ${done} of ${c.targets.length} targets met.`}>
      <Icon name="date" size={14} />
      <span className="date-pill-title">{c.def.title}</span>
      <span className="date-pill-due">{c.weeksLeft === 0 ? 'this week' : `${c.weeksLeft} wk`}</span>
      <span className="date-pill-pips" aria-hidden>
        {c.targets.map((t, i) => (
          <i key={i} className={t.met ? 'on' : ''} />
        ))}
      </span>
    </button>
  );
}
