// When an action is blocked because the guild is short of something, say what
// is missing and offer one tap to the place that supplies it.
import { MATERIAL_INFO, type GameState, type MaterialId } from '../../engine';
import type { ToastAction } from '../../store';
import { crowns } from './format';
import { goTo } from './navigate';

export type Blocked = string | { text: string; action?: ToastAction } | false | null | undefined;

export type Res = 'crowns' | 'supplies' | 'intel' | 'influence' | MaterialId;

/** The place to get more of a resource. */
export function getMore(res: Res): ToastAction {
  switch (res) {
    case 'crowns':
      return { label: 'Find paid work', run: () => goTo({ tab: 'contracts', guide: 'board' }) };
    case 'supplies':
      return { label: 'Buy supplies', run: () => goTo({ tab: 'armory', armory: 'market', guide: 'supplies' }) };
    case 'intel':
      return { label: 'Gather rumors', run: () => goTo({ tab: 'roster', guide: 'roster' }) };
    case 'influence':
      return { label: 'Find work for a patron', run: () => goTo({ tab: 'contracts', guide: 'board' }) };
    default:
      return { label: `Buy ${MATERIAL_INFO[res].name}`, run: () => goTo({ tab: 'armory', armory: 'materials', guide: `mat-${res}` }) };
  }
}

const NAMES: Record<string, string> = { supplies: 'supplies', intel: 'Intel', influence: 'Influence' };

/** A blocked reason with a way to get more, or undefined when the guild has enough. */
export function short(g: GameState, res: Res, need: number, what?: string): Blocked {
  const have = res === 'crowns' ? g.crowns : res === 'supplies' ? g.supplies : res === 'intel' ? g.intel : res === 'influence' ? g.influence : g.materials[res];
  if (have >= need) return undefined;
  const text =
    res === 'crowns'
      ? `${what ? `${what} costs` : 'It costs'} ${crowns(need)}, and the treasury holds ${crowns(have)}.`
      : res in NAMES
        ? `${what ? `${what} needs` : 'It needs'} ${need} ${NAMES[res]}, and you have ${have}.`
        : `${what ? `${what} needs` : 'It needs'} ${need} ${MATERIAL_INFO[res as MaterialId].name}, and you have ${have}.`;
  return { text, action: getMore(res) };
}

/** The first shortfall in a list of costs, if any. */
export function firstShort(g: GameState, costs: { res: Res; need: number }[], what?: string): Blocked {
  for (const c of costs) {
    const b = short(g, c.res, c.need, what);
    if (b) return b;
  }
  return undefined;
}

export const blockedText = (b: Blocked) => (!b ? undefined : typeof b === 'string' ? b : b.text);
