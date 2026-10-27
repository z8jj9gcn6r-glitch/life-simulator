import { YEAR_MS, clamp } from './constants.js';
import { applyPassive, checkCritical } from './needs.js';
import { advanceTasks } from './actions.js';
import { save } from './storage.js';

const INTERVAL = YEAR_MS / 24;

const clone = s => JSON.parse(JSON.stringify(s));

function snapshot(s) {
  const c = clone(s);
  c.snapshots = [];
  c.events = [];
  return c;
}

function addSnapshot(s) {
  if (s.gameMs - s.lastSnapshotGameMs >= INTERVAL) {
    s.snapshots.push({
      gameMs: s.gameMs,
      data: snapshot(s)
    });

    s.lastSnapshotGameMs = s.gameMs;

    s.snapshots = s.snapshots.filter(
      x => x.gameMs >= s.gameMs - YEAR_MS * 1.3
    );
  }
}

export function advance(s, now = Date.now()) {
  if (!s || s.dead) return;

  if (now < s.lastReal) {
    s.lastReal = now;
    s.events.unshift('Время устройства изменилось');
    save(s);
    return;
  }

  let remaining = Math.min(
    now - s.lastReal,
    365 * 86400000
  );

  if (!remaining) return;

  const emit = m => {
    s.events.unshift(m);
    s.events = s.events.slice(0, 30);
  };

  while (remaining > 0 && !s.dead) {
    const step = Math.min(remaining, 60000);

    remaining -= step;

    const gameStep =
      step * s.speed * YEAR_MS / 3600000;

    if (s.speed > 0) {
      const allowed = Math.min(
        gameStep,
        Math.max(
          0,
          s.lifeLimitYears * YEAR_MS - s.gameMs
        )
      );

      const effectiveReal = gameStep
        ? step * allowed / gameStep
        : 0;

      if (s.speed >= 1) {
        applyPassive(s, effectiveReal);
      }

      advanceTasks(
        s,
        allowed,
        emit,
        s.speed >= 1
      );

      s.gameMs += allowed;

      if (s.speed >= 1) {
        checkCritical(s, emit);
      }

      addSnapshot(s);

      if (
        s.gameMs >=
        s.lifeLimitYears * YEAR_MS
      ) {
        s.dead = true;
        emit('Истекло время жизни');
      }
    }
  }

  s.lastReal = now;

  if (s.dead) {
    s.deathAt = s.gameMs;
    s.speed = 0;
  }

  save(s);
}

export function setSpeed(s, v) {
  advance(s);

  if (!s.dead) {
    s.speed = v;
    s.lastReal = Date.now();
    save(s);
  }
}

export function background(s) {
  advance(s);

  if (!s.dead && s.speed !== 0) {
    s.speed = 0.5;
  }

  s.lastReal = Date.now();
  save(s);
}

export function revive(s) {
  if (!s.dead) return false;

  const target = Math.max(
    0,
    s.deathAt - YEAR_MS / 2
  );

  const match = [...s.snapshots]
    .reverse()
    .find(x => x.gameMs <= target);

  if (!match) return false;

  const oldSnapshots = s.snapshots;
  const data = clone(match.data);

  for (const k of Object.keys(s)) {
    delete s[k];
  }

  Object.assign(s, data);

  s.snapshots = oldSnapshots.filter(
    x => x.gameMs <= s.gameMs
  );

  s.lastSnapshotGameMs = s.gameMs;
  s.lastReal = Date.now();
  s.speed = 0;
  s.dead = false;
  s.deathAt = null;

  s.events.unshift(
    'Воскресение: восстановлено состояние до смерти'
  );

  save(s);

  return true;
}
