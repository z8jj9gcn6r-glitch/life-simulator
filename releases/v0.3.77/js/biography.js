import { BIRTH_UTC, YEAR_MS } from './constants.js';

const DAY_MS = 86400000;

function birthTimestamp(s) {
  const value = s?.character?.birthDate;

  if (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const timestamp = Date.parse(value + 'T00:00:00Z');

    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  return BIRTH_UTC;
}

export function biographyDate(s, gameMs = s.gameMs) {
  const elapsed = Number.isFinite(gameMs)
    ? Math.max(0, gameMs)
    : 0;

  const date = new Date(
    birthTimestamp(s) + elapsed
  );

  if (!Number.isFinite(date.getTime())) {
    return '—';
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(
    date.getUTCMonth() + 1
  ).padStart(2, '0');

  return `${day}.${month}.${date.getUTCFullYear()}`;
}

export function recordBiography(
  s,
  id,
  text,
  gameMs = s.gameMs
) {
  if (
    !s ||
    typeof id !== 'string' ||
    typeof text !== 'string'
  ) {
    return false;
  }

  if (!Array.isArray(s.biography)) {
    s.biography = [];
  }

  // Каждое достижение записывается только один раз.
  if (s.biography.some(entry => entry.id === id)) {
    return false;
  }

  const at = Number.isFinite(gameMs)
    ? Math.max(0, gameMs)
    : 0;

  s.biography.push({
    id,
    text,
    gameMs: at,
    date: biographyDate(s, at)
  });

  s.biography.sort(
    (a, b) => a.gameMs - b.gameMs
  );

  return true;
}

export function initializeBiography(s) {
  if (!Array.isArray(s.biography)) {
    s.biography = [];
  }

  recordBiography(s, 'birth', 'Родился.', 0);

  return s;
}

export function checkBiographyMilestones(
  s,
  previousGameMs = s.gameMs
) {
  initializeBiography(s);

  const first = Math.max(
    0,
    Number(previousGameMs) || 0
  );

  const current = Math.max(
    0,
    Number(s.gameMs) || 0
  );

  const century = 100 * YEAR_MS;

  if (first < century && current >= century) {
    recordBiography(
      s,
      'centenary',
      'Отметил столетие.',
      century
    );
  }
}
