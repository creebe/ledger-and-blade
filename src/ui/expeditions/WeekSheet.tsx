import { dateLabel } from '../../engine';
import { useX } from '../../expStore';
import { XSheet } from './xkit';

/** What happened while the guild rested: opened after a press-and-hold on Rest a week. */
export function WeekSheet({ fromWeek, crownsBefore, newsBefore }: { fromWeek: number; crownsBefore: number; newsBefore: number }) {
  const g = useX((s) => s.game)!;
  const fresh = g.news.filter((n) => n.week > fromWeek);
  void newsBefore;
  const delta = g.crowns - crownsBefore;
  return (
    <XSheet
      title={`${dateLabel(fromWeek)} is over`}
      footer={
        <button className="btn primary block" onClick={() => useX.getState().close()}>
          Back to the hall
        </button>
      }
    >
      <p className="small">
        The guild rested. Crowns <b className={delta < 0 ? 'bad' : 'good'}>{delta < 0 ? `−${-delta}` : `+${delta}`}</b> (wages and anything due). Members at home healed and got some of their nerve back.
      </p>
      <ul className="x-news">
        {fresh.map((n, i) => (
          <li key={i} className={n.tone ?? ''}>
            {n.text}
          </li>
        ))}
        {!fresh.length && <li className="muted">A quiet week on Tallow Street.</li>}
      </ul>
    </XSheet>
  );
}
