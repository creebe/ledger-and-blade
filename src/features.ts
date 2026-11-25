// Feature flags. The expeditions trial (docs/EXPEDITIONS.md) replaces the
// guild-ledger game on this branch. The classic game is hidden, not deleted:
// add ?classic to the address to play it. The trial saves under its own key.
export const TRIAL_EXPEDITIONS = true;

export function trialOn(): boolean {
  if (!TRIAL_EXPEDITIONS) return false;
  try {
    return !new URLSearchParams(window.location.search).has('classic');
  } catch {
    return true;
  }
}
