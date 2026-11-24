import { useRef } from 'react';
import { PROFESSIONS, setAssignment, trainCost, trainWeeks, type Assignment, type Attribute, type Member } from '../../engine';
import { useStore } from '../../store';
import { cap, crowns } from './format';
import { Icon } from './icons';
import { Portrait, readiness } from './visual';

/** One icon per weekly order, used everywhere an order is shown. */
export const ORDER_ICON: Record<Assignment, string> = { rest: 'rest', train: 'train', rumors: 'ear', labor: 'hammer', guard: 'guard', build: 'bricks', scout: 'compass' };

export const ASSIGNMENTS: { id: Assignment; label: string; blurb: string }[] = [
  { id: 'rest', label: 'Rest', blurb: 'Recover fatigue and wounds faster. Small morale gain.' },
  { id: 'train', label: 'Train', blurb: '+1 to an attribute every few weeks. Costs crowns each week and adds fatigue. A Training Yard makes it faster and cheaper.' },
  { id: 'rumors', label: 'Gather rumors', blurb: '+1 Intel per week (+2 for Envoys, Infiltrators and Scouts).' },
  { id: 'labor', label: 'Dock labor', blurb: 'Earn a few crowns based on Might. Tiring and dull.' },
  { id: 'guard', label: 'Guard the hall', blurb: 'Stay home and watch the doors. Each guard makes theft, arson and worse less likely to succeed, and helps catch spies. Mildly tiring.' },
  { id: 'build', label: 'Build', blurb: 'Help with construction: each builder adds half a week of progress. Tiring.' },
  { id: 'scout', label: 'Scout a contract', blurb: "Reveal a contract's hidden tags by week's end. Scouts, Skirmishers and Infiltrators reveal all of them; others reveal one." },
];

export function MemberMini({ m, selected, onClick, onLongPress, blocked }: { m: Member; selected?: boolean; onClick?: () => void; onLongPress?: () => void; blocked?: string }) {
  const g = useStore((s) => s.game)!;
  const timer = useRef<number | undefined>(undefined);
  const long = useRef(false);
  const r = readiness(m, g);
  return (
    <button
      className={`member-mini ${selected ? 'selected' : ''} ${blocked ? 'is-blocked' : ''}`}
      onClick={() => {
        if (long.current) {
          long.current = false;
          return;
        }
        if (blocked) useStore.getState().notify(blocked);
        else onClick?.();
      }}
      onPointerDown={() => {
        if (!onLongPress) return;
        timer.current = window.setTimeout(() => {
          long.current = true;
          onLongPress();
        }, 450);
      }}
      onPointerUp={() => window.clearTimeout(timer.current)}
      onPointerLeave={() => window.clearTimeout(timer.current)}
      onContextMenu={(e) => {
        if (onLongPress) {
          e.preventDefault();
          onLongPress();
        }
      }}
    >
      <span className="row gap">
        <Portrait m={m} size={30} />
        <span className="mm-text">
          <span className="mm-name">{m.name.split(' ')[0]}</span>
          <span className={`mm-prof readiness ${r.tone}`}>{r.text === 'Ready' ? PROFESSIONS[m.profession].name : r.text}</span>
        </span>
      </span>
    </button>
  );
}

/**
 * The weekly orders for one idle member: the list of orders, plus the
 * attribute to train or the contract to scout. Used by the member sheet and
 * by the quick orders sheet opened from a Roster row.
 */
export function OrderPicker({ m, onChosen }: { m: Member; onChosen?: (a: Assignment) => void }) {
  const game = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const choose = (a: (typeof ASSIGNMENTS)[number]) => {
    if (a.id === 'scout') {
      const target = game.board.find((c) => c.hidden.some((h) => !h.revealed));
      if (!target) return useStore.getState().notify('No contract has anything left to scout.');
      act((g) => setAssignment(g, m.id, 'scout', { contractId: m.scoutTarget && g.board.some((c) => c.id === m.scoutTarget) ? m.scoutTarget : target.id }));
    } else if (act((g) => setAssignment(g, m.id, a.id))) {
      useStore.getState().notify(`${m.name.split(' ')[0]}: ${a.label} this week. ${a.id === 'train' ? 'Pick what to train below.' : a.blurb}`);
      onChosen?.(a.id);
    }
  };
  return (
    <>
      <div className="assign">
        {ASSIGNMENTS.filter((a) => a.id !== 'build' || game.construction).map((a) => (
          <button key={a.id} className={`assign-opt ${m.assignment === a.id ? 'on' : ''}`} onClick={() => choose(a)}>
            <span className="card-row">
              <Icon name={ORDER_ICON[a.id]} size={18} />
              <span className="card-main">
                <b>{a.label}</b>
                <small style={{ display: 'block' }}>{a.id === 'train' ? `+1 to an attribute every ${trainWeeks(game)} weeks. Costs ${crowns(trainCost(game))} a week and adds fatigue.` : a.blurb}</small>
              </span>
            </span>
          </button>
        ))}
      </div>
      {m.assignment === 'train' && (
        <div className="row wrap gap">
          {(['might', 'finesse', 'wits', 'resolve'] as Attribute[]).map((a) => (
            <button key={a} className={`btn small ${m.trainAttr === a ? 'primary' : 'ghost'}`} onClick={() => act((g) => setAssignment(g, m.id, 'train', { attr: a }))}>
              {cap(a)}
            </button>
          ))}
          <span className="small muted">
            Progress {m.trainProgress}/{trainWeeks(game)}
          </span>
        </div>
      )}
      {m.assignment === 'scout' && (
        <select className="select" value={m.scoutTarget} onChange={(e) => act((g) => setAssignment(g, m.id, 'scout', { contractId: e.target.value }))}>
          {game.board
            .filter((c) => c.hidden.some((h) => !h.revealed))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
        </select>
      )}
    </>
  );
}
