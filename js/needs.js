import { NEEDS, NEEDS_DRAIN_3H } from './constants.js';

export function createNeeds() {
  return Object.fromEntries(
    NEEDS.map(need => [need, 100])
  );
}

export function clampNeed(value) {
  return Math.max(0, Math.min(100, value));
}

export function changeNeed(needs, key, amount) {
  if (!(key in needs)) return false;

  needs[key] = clampNeed(
    needs[key] + amount
  );

  return true;
}

export function drainNeeds(needs, elapsedMs, speed) {
  if (speed < 1 || elapsedMs <= 0) {
    return;
  }

  const fraction = elapsedMs / (3 * 60 * 60 * 1000);

  for (const key of NEEDS) {
    const rate = NEEDS_DRAIN_3H[key] ?? 0;

    needs[key] = clampNeed(
      needs[key] - rate * fraction
    );
  }
}

export function getCriticalNeeds(needs) {
  return NEEDS.filter(
    key => needs[key] <= 20
  );
}

export function getAverageNeeds(needs) {
  const total = NEEDS.reduce(
    (sum, key) => sum + needs[key],
    0
  );

  return total / NEEDS.length;
}
