// The dashed "?" tag: a hidden danger on a contract. Tapping it spends Intel
// to learn which of the rumoured dangers is the real one (engine `revealTag`).
import { revealCost, revealTag, TAGS, type Contract } from '../../engine';
import { useStore } from '../../store';
import { Btn } from './common';
import { Icon } from './icons';
import { short } from './shortfall';

const tagName = (t: string) => TAGS[t]?.name ?? t;

/** Ask to spend Intel on hidden danger `i` of contract `c`, then reveal it. */
export function askReveal(c: Contract, i: number) {
  const { game: g, confirm, act, notify } = useStore.getState();
  const h = c.hidden[i];
  if (!g || !h || h.revealed) return;
  const cost = revealCost(g);
  confirm({
    title: 'Learn the hidden danger?',
    body: [
      `Your informants will find out which of these the squad will meet: ${h.candidates.map(tagName).join(' or ')}.`,
      'Knowing it tells you what to pack and who to send.',
    ],
    cost: `Costs ${cost} Intel · you have ${g.intel}, leaving ${g.intel - cost}`,
    confirmLabel: `Spend ${cost} Intel`,
    onConfirm: () => {
      if (act((x) => revealTag(x, c.id, i))) notify(`It's ${tagName(h.trueTag)}. ${TAGS[h.trueTag]?.description ?? ''}`.trim());
    },
  });
}

/**
 * One unrevealed hidden danger as a tappable dashed tag. `long` spells out the
 * rumoured candidates (the prep sheet); the short form is a bare "?" (a card).
 * It stops the tap from reaching a tappable card around it.
 */
export function HiddenTag({ c, i, long }: { c: Contract; i: number; long?: boolean }) {
  const g = useStore((s) => s.game)!;
  const h = c.hidden[i];
  const cost = revealCost(g);
  const names = h.candidates.map(tagName).join(' or ');
  return (
    <span className="x-reveal-wrap" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <Btn
        className="tag hidden x-reveal-tag"
        blocked={short(g, 'intel', cost, 'Learning a hidden danger')}
        onClick={() => askReveal(c, i)}
        title={`A hidden danger: ${names}. Tap to learn which it is for ${cost} Intel.`}
      >
        <Icon name="eye" size={14} /> ?{long ? ` ${names}` : ''}
      </Btn>
    </span>
  );
}
