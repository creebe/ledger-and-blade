import { guideView, rewardText } from '../engine';
import { useStore } from '../store';
import { Icon } from './icons';

/** Guildmaster's Notes: the next few things worth learning, with a "Show me". */
export function GuideCard({ compact }: { compact?: boolean }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const showMe = useStore((s) => s.showMe);
  if (!g.tutorial?.enabled || g.tutorial.finished) return null;
  const v = guideView(g);
  return (
    <section className="guide-card">
      <div className="row between">
        <b className="meta" style={{ color: 'var(--ink)', fontSize: '1.05rem' }}>
          <Icon name="scroll" size={18} /> Guildmaster’s Notes
        </b>
        <span className="meta">
          {v.done}/{v.total}
        </span>
      </div>
      <div className="ap-bar-track" style={{ height: 6, margin: '6px 0 8px' }}>
        <span className="ap-bar-fill" style={{ width: `${(v.done / v.total) * 100}%`, background: 'var(--accent)' }} />
      </div>
      {v.active.map((o, i) => (
        <div key={o.id} className={`objective ${i === 0 ? 'first' : ''}`}>
          <span className="obj-box" aria-hidden />
          <div className="card-main">
            <b>{o.title}</b>
            <p className="small">{o.how}</p>
            {!compact && <p className="tiny muted">{o.why}</p>}
            <div className="row between">
              <span className="tiny muted">{rewardText(o.reward)}</span>
              <button className="btn ghost small" onClick={() => showMe(o)}>
                Show me <Icon name="chevron" size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
      {v.active.length === 0 && <p className="small muted">Nothing to do right now. Keep playing: the next notes unlock as the game moves on.</p>}
      {v.waiting.length > 0 && (
        <p className="tiny muted" style={{ marginTop: 6 }}>
          Later: {v.waiting.map((w) => `${w.o.title} (${w.reason.toLowerCase()})`).join(' · ')}
        </p>
      )}
      <button className="link-btn tiny" onClick={() => act((d) => void (d.tutorial.enabled = false)) && useStore.getState().notify('Notes hidden. Turn them back on from the ☰ menu.')}>
        Hide these notes
      </button>
    </section>
  );
}

/** One-line nudge in the End Week bar: the next objective. */
export function GuideNudge() {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  if (!g.tutorial?.enabled || g.tutorial.finished) return null;
  const next = guideView(g, 1).active[0];
  if (!next) return null;
  return (
    <button className="guide-nudge" onClick={() => open({ kind: 'guide' })}>
      <Icon name="scroll" size={14} />
      <span>{next.title}</span>
    </button>
  );
}
