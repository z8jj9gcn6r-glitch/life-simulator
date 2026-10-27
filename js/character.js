import { BIRTH_UTC, YEAR_MS } from './constants.js';

export function createCharacter(name) {
  return {
    name: name.trim().slice(0, 24),
    birthUtc: BIRTH_UTC,

    stats: {
      strength: 10,
      dexterity: 10,
      endurance: 10,
      intelligence: 10,
      wisdom: 10,
      knowledge: 0,
      charisma: 10,
      reputation: 50
    },

    skills: {
      programming: 0,
      english: 0
    }
  };
}

export function age(state) {
  return Math.floor(state.gameMs / YEAR_MS);
}

export function dateParts(state) {
  const d = new Date(BIRTH_UTC + state.gameMs);

  return {
    date: d.toLocaleDateString('ru-RU', {
      timeZone: 'UTC'
    }),

    weekday: d.toLocaleDateString('ru-RU', {
      timeZone: 'UTC',
      weekday: 'long'
    }),

    time: d.toLocaleTimeString('ru-RU', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

export function ageWord(n) {
  return n % 10 === 1 && n % 100 !== 11
    ? 'год'
    : n % 10 >= 2 &&
      n % 10 <= 4 &&
      (n % 100 < 12 || n % 100 > 14)
    ? 'года'
    : 'лет';
}
