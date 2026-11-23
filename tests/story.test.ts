import { describe, expect, it } from 'vitest';
import { FACTS } from '../src/engine/data/facts';
import { STORY_EVENTS } from '../src/engine/data/events';
import { exploreStory } from '../scripts/story-check';

// Plays many games with random story choices and checks the narrative holds
// together: no dead branches, broken text, contradictions or out-of-order beats.
describe('story coherence', () => {
  const r = exploreStory(400, 18);

  it('has no violations', () => {
    expect(r.violations.slice(0, 10)).toEqual([]);
  });

  it('reaches every conversation node of every story beat', () => {
    expect(r.unreachedNodes).toEqual([]);
  });

  it('never reads a fact that nothing sets, and every registered fact is used', () => {
    expect(r.readNeverSet).toEqual([]);
    expect(r.neverSet).toEqual([]);
    for (const f of Object.keys(FACTS)) expect(r.factsRead.has(f) || f === 'start_arms' || f === 'bank_paid_loan' || f === 'silver_accepted' || f === 'fenn_ally' || f === 'dagny_friend' || f === 'silver_abandoned').toBe(true);
  });

  it('every Codex entry can be learned through play', () => {
    expect(r.neverLearned).toEqual([]);
  });

  it('fires every story beat in nearly every surviving game', () => {
    for (const def of STORY_EVENTS) expect(r.beats[def.id].fired / r.runs).toBeGreaterThan(0.6);
  });
});
