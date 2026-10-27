import { RATES, clamp } from './constants.js';

const NEED_NAMES = [
  'Здоровье',
  'Энергия',
  'Сытость',
  'Туалет',
  'Гигиена',
  'Общение',
  'Настроение',
  'Стресс'
];

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export function createNeeds() {
  return Array(8).fill(100);
}

export function clampNeed(value) {
  return clamp(value);
}

export function changeNeeds(state, changes) {
  if (!state || !Array.isArray(state.needs)) {
    return false;
  }

  for (const [key, amount] of Object.entries(changes)) {
    const index = Number(key);

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= 8 ||
      !Number.isFinite(amount)
    ) {
      continue;
    }

    state.needs[index] = clampNeed(
      state.needs[index] + amount
    );
  }

  return true;
}

export function applyPassive(state, realMs) {
  if (
    !state ||
    state.dead ||
    state.speed < 1 ||
    !Number.isFinite(realMs) ||
    realMs <= 0
  ) {
    return;
  }

  const covered = new Set();

  for (const task of state.tasks) {
    for (const key of Object.keys(task.effects || {})) {
      covered.add(Number(key));
    }
  }

  for (let i = 0; i < 8; i++) {
    if (covered.has(i)) {
      continue;
    }

    const decrease = RATES[i] * realMs / THREE_HOURS_MS;

    state.needs[i] = clampNeed(
      state.needs[i] - decrease
    );
  }
}

export function applyTaskEffects(state, task, fraction) {
  if (
    !state ||
    !task ||
    !task.effects ||
    !Number.isFinite(fraction) ||
    fraction <= 0
  ) {
    return;
  }

  for (const [key, amount] of Object.entries(task.effects)) {
    const index = Number(key);

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= 8 ||
      !Number.isFinite(amount)
    ) {
      continue;
    }

    state.needs[index] = clampNeed(
      state.needs[index] + amount * fraction
    );
  }
}

export function checkCritical(state, emit) {
  if (!state || !Array.isArray(state.needs)) {
    return;
  }

  for (let i = 0; i < 8; i++) {
    const value = state.needs[i];

    if (value <= 0 && !state.criticalTriggered[i]) {
      state.criticalTriggered[i] = true;

      emit(
        'Критическое состояние: ' + NEED_NAMES[i]
      );

      if (i === 2) {
        state.needs[0] = clampNeed(
          state.needs[0] - 50
        );
      }

      if (i === 3) {
        state.character.stats.reputation = Math.max(
          0,
          state.character.stats.reputation - 10
        );
      }

      if (i === 0) {
        state.dead = true;
      }
    }

    if (value > 0) {
      state.criticalTriggered[i] = false;
    }
  }

  if (state.needs[0] <= 0) {
    state.dead = true;
  }
}
