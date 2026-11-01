
import { instantAction } from './actions.js';

export const AUTO_NEED_THRESHOLD = 30;

const ACTIONS = [
  { index: 0, action: 'treatment', cost: 3500 },
  { index: 1, action: 'sleep', cost: 0 },
  { index: 2, action: 'eat', cost: 700 },
  { index: 3, action: 'toilet', cost: 300 },
  { index: 4, action: 'shower', cost: 500 },
  { index: 5, action: 'social', cost: 200 },
  { index: 7, action: 'entertainment', cost: 2500 }
];

export function processAutoNeeds(state) {
  if (
    !state ||
    state.dead ||
    !state.autoNeedsEnabled ||
    state.speed <= 0 ||
    !Array.isArray(state.needs)
  ) {
    return 0;
  }

  let completed = 0;

  for (const item of ACTIONS) {
    if (
      !Number.isFinite(state.needs[item.index]) ||
      state.needs[item.index] > AUTO_NEED_THRESHOLD ||
      state.cashCents < item.cost
    ) {
      continue;
    }

    const beforeNeed = state.needs[item.index];
    const beforeCash = state.cashCents;

    instantAction(state, item.action);

    if (
      state.needs[item.index] > beforeNeed ||
      state.cashCents < beforeCash
    ) {
      completed++;
    }
  }

  return completed;
}
