import { useRef, useState } from 'react';
import { PROLOGUE } from '../../engine';

const SEEN = 'lab.prologue.seen';

/** Whether this device has been shown the prologue. */
export function prologueSeen(): boolean {
  try {
    return localStorage.getItem(SEEN) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN, '1');
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

/**
 * The prologue: a few pages on the Debt, Varrow and the guilds, read before the
 * first new guild. It can be skipped, and read again from the title and start
 * screens. The buttons stay at the bottom of the screen, so they don't move
 * from page to page.
 */
export function Prologue({ onDone, doneLabel }: { onDone: () => void; doneLabel: string }) {
  const [page, setPageState] = useState(0);
  // a long page can scroll on a short phone; start each page at the top so the heading stays put
  const setPage = (n: number) => {
    setPageState(n);
    window.scrollTo(0, 0);
  };
  const p = PROLOGUE[page];
  const last = page === PROLOGUE.length - 1;
  const nextRef = useRef<HTMLButtonElement>(null);
  // Back hides itself on the first page; hand its keyboard focus to Next so it isn't lost
  const back = () => {
    if (page === 1) nextRef.current?.focus();
    setPage(page - 1);
  };
  const finish = () => {
    markSeen();
    onDone();
  };
  return (
    <div className="prologue-screen">
      <div className="prologue-top">
        <span className="prologue-dots" role="img" aria-label={`Page ${page + 1} of ${PROLOGUE.length}`}>
          {PROLOGUE.map((_, i) => (
            <span key={i} className={`prologue-dot ${i === page ? 'on' : ''}`} />
          ))}
        </span>
        {!last && (
          <button className="link-btn prologue-skip" onClick={finish}>
            Skip
          </button>
        )}
      </div>
      <div className="prologue-page" key={page}>
        <p className="prologue-kicker">Ledger &amp; Blade</p>
        <h1>{p.title}</h1>
        {p.paragraphs.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
      <div className="prologue-actions">
        {/* on the first page Back keeps its place but is hidden, so Next doesn't move */}
        <button className="btn ghost" onClick={back} style={page === 0 ? { visibility: 'hidden' } : undefined} aria-hidden={page === 0}>
          Back
        </button>
        <button ref={nextRef} className="btn primary" onClick={() => (last ? finish() : setPage(page + 1))}>
          {last ? doneLabel : 'Next'}
        </button>
      </div>
    </div>
  );
}
