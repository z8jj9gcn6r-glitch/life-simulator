
export const DAY_MS = 86400000;

const FORMS = {
  second: ['секунда', 'секунды', 'секунд'],
  minute: ['минута', 'минуты', 'минут'],
  hour: ['час', 'часа', 'часов'],
  day: ['день', 'дня', 'дней'],
  week: ['неделя', 'недели', 'недель'],
  month: ['месяц', 'месяца', 'месяцев'],
  year: ['год', 'года', 'лет'],
  century: ['век', 'века', 'веков']
};

export function pluralRu(value, one, few, many) {
  const n = Math.abs(Math.trunc(value));
  const lastTwo = n % 100;
  const last = n % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return many;
  }

  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;

  return many;
}

export function formatTime(value, unit) {
  if (!Object.hasOwn(FORMS, unit)) {
    throw new Error('Неизвестная единица времени');
  }

  const n = Math.trunc(Number(value));

  if (!Number.isFinite(n)) {
    throw new Error('Некорректное значение времени');
  }

  return `${n} ${pluralRu(n, ...FORMS[unit])}`;
}

export function formatAge(gameMs) {
  const days = Math.max(
    0,
    Math.floor(gameMs / DAY_MS)
  );

  if (days < 7) {
    return formatTime(days, 'day');
  }

  if (days < 30) {
    return formatTime(Math.floor(days / 7), 'week');
  }

  if (days < 365) {
    return formatTime(
      Math.floor(days * 12 / 365),
      'month'
    );
  }

  if (days < 36500) {
    return formatTime(
      Math.floor(days / 365),
      'year'
    );
  }

  return formatTime(
    Math.floor(days / 36500),
    'century'
  );
}

export function remainingLifeDays(state) {
  const limit = state.lifeLimitYears * 365 * DAY_MS;
  const remaining = Math.max(
    0,
    limit - state.gameMs
  );

  return Math.ceil(remaining / DAY_MS);
}
