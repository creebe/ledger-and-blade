import { useRef } from 'react';
import { PROFESSIONS, type Assignment, type Member } from '../../engine';
import { useStore } from '../../store';
import { Portrait, readiness } from './visual';

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
