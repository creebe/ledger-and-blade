import { useEffect, useState } from 'react';
import { CODEX, CODEX_BY_ID, dateLabel, guideView, OBJECTIVES, rewardText, type CodexCategory } from '../../engine';
import { useStore } from '../../store';
import { Seg, Sheet } from '../kit/common';
import { GuideCard, ReadyNote, useCollect } from '../panels/Guide';
import { Icon } from '../kit/icons';

export type JournalTab = 'notes' | 'codex' | 'chronicle';

function NotesTab() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const [view, setView] = useState<'current' | 'upcoming' | 'done'>('current');
  const v = guideView(g, 3);
  const activeIds = new Set(v.active.map((o) => o.id));
  const waiting = new Map(v.waiting.map((w) => [w.o.id, w.reason]));
  const upcoming = OBJECTIVES.filter((o) => !g.tutorial.done.includes(o.id) && !activeIds.has(o.id));
  const done = OBJECTIVES.filter((o) => g.tutorial.done.includes(o.id));
  const { collecting, collect } = useCollect();
  const chapters = [...new Set(OBJECTIVES.map((o) => o.chapter))];
  return (
    <>
      <Seg
        value={view}
        onChange={setView}
        options={[
          { value: 'current', label: 'Now' },
          { value: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { value: 'done', label: `Done (${done.length})` },
        ]}
      />
      {!g.tutorial.enabled && (
        <p className="hint">
          The notes card is hidden, but your progress and rewards still count.{' '}
          <button className="link-btn" onClick={() => act((d) => void (d.tutorial.enabled = true))}>
            Show it again
          </button>
        </p>
      )}
      {view === 'current' && (g.tutorial.finished ? <p className="small good">All notes complete. You know the ropes.</p> : <GuideCard force />)}
      {view === 'upcoming' &&
        chapters.map((ch) => {
          const list = upcoming.filter((o) => o.chapter === ch);
          if (!list.length) return null;
          return (
            <div key={ch}>
              <h4 className="week-head">{ch}</h4>
              {list.map((o) => (
                <div key={o.id} className="objective">
                  <span className="obj-box" aria-hidden />
                  <div className="card-main">
                    <b>{o.title}</b>
                    <p className="small muted">{o.why}</p>
                    <span className="tiny muted">
                      {waiting.get(o.id) ? `Not yet: ${waiting.get(o.id)}` : 'After the current notes'} · {rewardText(o.reward)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      {view === 'done' &&
        (done.length ? (
          done.map((o) =>
            (g.tutorial.claimed ?? []).includes(o.id) ? (
              <div key={o.id} className="objective">
                <Icon name="check" size={16} style={{ color: 'var(--muted)', marginTop: 3 }} />
                <div className="card-main">
                  <b>{o.title}</b>
                  <span className="tiny muted" style={{ display: 'block' }}>
                    {o.chapter} · collected {rewardText(o.reward)}
                  </span>
                </div>
              </div>
            ) : (
              <ReadyNote key={o.id} o={o} collecting={collecting === o.id} onCollect={() => collect(o)} />
            ),
          )
        ) : (
          <p className="small muted">Nothing completed yet.</p>
        ))}
    </>
  );
}

function CodexTab() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const [open, setOpen] = useState<string | null>(null);
  const [fresh] = useState(() => new Set(g.codex.fresh));
  useEffect(() => {
    if (g.codex.fresh.length) act((d) => void (d.codex.fresh = []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cats: CodexCategory[] = ['Common knowledge', 'History', 'Places', 'People', 'Foes', 'Powers & trades'];
  return (
    <>
      <p className="tiny muted">
        {g.codex.unlocked.length} of {CODEX.length} entries. More are learned by going places, facing new enemies, meeting people, and listening to the street.
      </p>
      {cats.map((cat) => {
        const all = CODEX.filter((e) => e.category === cat);
        const known = all.filter((e) => g.codex.unlocked.includes(e.id));
        return (
          <div key={cat}>
            <h4 className="week-head">
              {cat} <span className="tiny muted">{known.length < all.length ? `· ${all.length - known.length} undiscovered` : ''}</span>
            </h4>
            {known.map((e) => (
              <button key={e.id} className={`codex-entry tappable ${open === e.id ? 'open' : ''}`} onClick={() => setOpen(open === e.id ? null : e.id)}>
                <span className="row between">
                  <b>{e.title}</b>
                  {fresh.has(e.id) && <span className="badge">New</span>}
                </span>
                {open === e.id && (
                  <>
                    <span className="small" style={{ display: 'block', marginTop: 4 }}>
                      {CODEX_BY_ID[e.id].text}
                    </span>
                    <span className="tiny muted" style={{ display: 'block', marginTop: 4 }}>
                      Learned from: {e.source(g)}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        );
      })}
    </>
  );
}

function ChronicleTab() {
  const g = useStore((s) => s.game)!;
  const story = g.dispatches.filter((d) => d.kind === 'story' || d.kind === 'crier').reverse();
  return (
    <>
      {story.length === 0 && <p className="small muted">Nothing yet.</p>}
      {story.map((d) => (
        <div key={d.id} className="chronicle">
          <span className="tiny muted">{dateLabel(d.week)}</span>
          <b className="small" style={{ display: 'block' }}>
            {d.title}
          </b>
          {d.body.slice(0, 3).map((b, i) => (
            <p key={i} className="small muted">
              {b}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

export function JournalSheet({ tab = 'notes' }: { tab?: JournalTab }) {
  const [t, setT] = useState<JournalTab>(tab);
  return (
    <Sheet title="Journal">
      <Seg
        value={t}
        onChange={setT}
        options={[
          { value: 'notes', label: 'Notes' },
          { value: 'codex', label: 'Codex' },
          { value: 'chronicle', label: 'Chronicle' },
        ]}
      />
      {t === 'notes' && <NotesTab />}
      {t === 'codex' && <CodexTab />}
      {t === 'chronicle' && <ChronicleTab />}
    </Sheet>
  );
}
