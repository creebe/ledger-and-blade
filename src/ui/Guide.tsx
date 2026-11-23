import { useState } from 'react';
import { claimNote, guideView, rewardText, type Objective } from '../engine';
import { useStore } from '../store';
import { Icon } from './icons';

/** Collect a note's reward with a short flourish before it pays out. */
export function useCollect() {
  const act = useStore((s) => s.act);
  const [collecting, setCollecting] = useState<string | null>(null);
  const collect = (o: Objective) => {
    if (collecting) return;
    setCollecting(o.id);
    window.setTimeout(() => {
      if (act((d) => claimNote(d, o.id))) useStore.getState().notify(`Collected ${rewardText(o.reward)}`);
      setCollecting(null);
    }, 650);
  };
  return { collecting, collect };
}

export function ReadyNote({ o, collecting, onCollect }: { o: Objective; collecting: boolean; onCollect: () => void }) {
  return (
    <div className={`objective ready ${collecting ? 'collecting' : ''}`} role="button" tabIndex={0} onClick={onCollect} onKeyDown={(e) => e.key === 'Enter' && onCollect()}>
      <span className="obj-box done" aria-hidden>
        <Icon name="check" size={13} />
      </span>
      <div className="card-main">
        <b>{o.title}</b>
        <div className="row between" style={{ marginTop: 4 }}>
          <span className="small">Done.</span>
          <span className="collect-btn">
            {collecting ? 'Collected!' : `Collect ${rewardText(o.reward)}`}
          </span>
        </div>
      </div>
      {collecting && <span className="collect-burst" aria-hidden />}
    </div>
  );
}

/** Guildmaster's Notes: rewards to collect, then the next few things worth learning. */
export function GuideCard({ compact, force }: { compact?: boolean; force?: boolean }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const showMe = useStore((s) => s.showMe);
  const { collecting, collect } = useCollect();
  if ((!g.tutorial?.enabled && !force) || g.tutorial.finished) return null;
  const v = guideView(g);
  const claimed = g.tutorial.claimed?.length ?? 0;
  return (
    <section className="guide-card">
      <div className="row between">
        <b className="meta" style={{ color: 'var(--ink)', fontSize: '1.05rem' }}>
          <Icon name="scroll" size={18} /> Guildmaster’s Notes
        </b>
        <span className="meta">
          {claimed}/{v.total}
        </span>
      </div>
      <div className="ap-bar-track" style={{ height: 6, margin: '6px 0 8px' }}>
        <span className="ap-bar-fill" style={{ width: `${(claimed / v.total) * 100}%`, background: 'var(--accent)' }} />
      </div>
      {v.ready.map((o) => (
        <ReadyNote key={o.id} o={o} collecting={collecting === o.id} onCollect={() => collect(o)} />
      ))}
      {v.active.map((o, i) => (
        <div key={o.id} className={`objective tappable ${i === 0 && !v.ready.length ? 'first' : ''}`} role="button" tabIndex={0} onClick={() => showMe(o)} onKeyDown={(e) => e.key === 'Enter' && showMe(o)}>
          <span className="obj-box" aria-hidden />
          <div className="card-main">
            <b>{o.title}</b>
            <p className="small">{o.how}</p>
            {!compact && <p className="tiny muted">{o.why}</p>}
            <span className="tiny muted">{rewardText(o.reward)}</span>
          </div>
        </div>
      ))}
      {v.active.length === 0 && v.ready.length === 0 && <p className="small muted">Nothing to do right now. More notes unlock as the weeks go on.</p>}
      {v.waiting.length > 0 && (
        <p className="tiny muted" style={{ marginTop: 6 }}>
          Later: {v.waiting.map((w) => `${w.o.title} (${w.reason.toLowerCase()})`).join(' · ')}
        </p>
      )}
      <div className="row between">
        <button className="link-btn tiny" onClick={() => useStore.getState().open({ kind: 'journal', tab: 'notes' })}>
          All notes, done and upcoming
        </button>
        {!force && (
          <button className="link-btn tiny" onClick={() => act((d) => void (d.tutorial.enabled = false)) && useStore.getState().notify('Notes card hidden. You can still collect rewards from the Journal.')}>
            Hide
          </button>
        )}
      </div>
    </section>
  );
}

/** One-line nudge in the End Week bar: a reward to collect, or the next note. */
export function GuideNudge() {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  if (!g.tutorial || g.tutorial.finished) return null;
  const v = guideView(g, 1);
  if (v.ready.length) {
    return (
      <button className="guide-nudge ready" onClick={() => open({ kind: 'journal', tab: 'notes' })}>
        <Icon name="check" size={14} />
        <span>
          Collect reward{v.ready.length > 1 ? `s (${v.ready.length})` : ''}
        </span>
      </button>
    );
  }
  if (!g.tutorial.enabled) return null;
  const next = v.active[0];
  if (!next) return null;
  return (
    <button className="guide-nudge" onClick={() => open({ kind: 'journal', tab: 'notes' })}>
      <Icon name="scroll" size={14} />
      <span>{next.title}</span>
    </button>
  );
}
