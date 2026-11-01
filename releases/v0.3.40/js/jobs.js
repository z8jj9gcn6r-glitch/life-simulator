import { earn } from './economy.js';
import { changeNeeds } from './needs.js';

const HOUR = 3600000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export const MIN_WORK_HEALTH = 15;

export const VACANCIES = Object.freeze({
  cleaner: {
    title: 'Уборщик',
    company: 'Black Fox Services',
    startHour: 8,
    endHour: 16,
    salaryCents: 4000
  },
  courier: {
    title: 'Курьер',
    company: 'Black Fox Delivery',
    startHour: 9,
    endHour: 17,
    salaryCents: 6500
  },
  seller: {
    title: 'Продавец',
    company: 'Black Fox Market',
    startHour: 10,
    endHour: 18,
    salaryCents: 8500
  },
  programmer: {
    title: 'Программист',
    company: 'Black Fox Technologies',
    startHour: 9,
    endHour: 17,
    salaryCents: 12000
  },
  security: {
    title: 'Охранник',
    company: 'Black Fox Security',
    startHour: 8,
    endHour: 16,
    salaryCents: 7500
  },
  cook: {
    title: 'Повар',
    company: 'Black Fox Restaurant',
    startHour: 10,
    endHour: 18,
    salaryCents: 15000
  },
  mechanic: {
    title: 'Автомеханик',
    company: 'Black Fox Auto',
    startHour: 9,
    endHour: 17,
    salaryCents: 19500
  },
  electrician: {
    title: 'Электрик',
    company: 'Black Fox Energy',
    startHour: 8,
    endHour: 16,
    salaryCents: 24000
  },
  engineer: {
    title: 'Инженер',
    company: 'Black Fox Engineering',
    startHour: 9,
    endHour: 17,
    salaryCents: 33000
  }
});


export function awardSellerProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'seller') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.sales = (skills.sales || 0) + 1;

  if (shifts % 3 === 0) {
    skills.communication =
      (skills.communication || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.customerService =
      (skills.customerService || 0) + 1;
  }

  if (shifts % 10 === 0) {
    stats.charisma += 2;
    stats.reputation += 1;
    stats.wisdom += 1;
    stats.knowledge += 1;
  }
}


export function awardProgrammerProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'programmer') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.programming = (skills.programming || 0) + 1;

  if (shifts % 3 === 0) {
    skills.algorithms = (skills.algorithms || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.debugging = (skills.debugging || 0) + 1;
  }

  if (shifts % 10 === 0) {
    skills.english = (skills.english || 0) + 1;
    skills.communication = (skills.communication || 0) + 1;

    stats.intelligence += 2;
    stats.knowledge += 2;
    stats.wisdom += 1;
    stats.reputation += 1;
  }
}


export function awardCourierProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'courier') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.logistics = (skills.logistics || 0) + 1;

  if (shifts % 3 === 0) {
    skills.navigation = (skills.navigation || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.timeManagement =
      (skills.timeManagement || 0) + 1;
  }

  if (shifts % 10 === 0) {
    skills.communication =
      (skills.communication || 0) + 1;

    skills.customerService =
      (skills.customerService || 0) + 1;

    stats.endurance += 2;
    stats.dexterity += 2;
    stats.strength += 1;
    stats.reputation += 1;
  }
}


export function awardCleanerProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'cleaner') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.cleaning = (skills.cleaning || 0) + 1;

  if (shifts % 3 === 0) {
    skills.precision = (skills.precision || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.timeManagement =
      (skills.timeManagement || 0) + 1;
  }

  if (shifts % 10 === 0) {
    skills.workOrganization =
      (skills.workOrganization || 0) + 1;

    skills.customerService =
      (skills.customerService || 0) + 1;

    stats.endurance += 2;
    stats.dexterity += 1;
    stats.strength += 1;
    stats.reputation += 1;
  }
}


export function awardSecurityProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'security') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.security = (skills.security || 0) + 1;

  if (shifts % 3 === 0) {
    skills.observation = (skills.observation || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.selfDefense = (skills.selfDefense || 0) + 1;
  }

  if (shifts % 10 === 0) {
    skills.communication =
      (skills.communication || 0) + 1;

    skills.discipline =
      (skills.discipline || 0) + 1;

    stats.strength += 2;
    stats.endurance += 1;
    stats.wisdom += 1;
    stats.reputation += 1;
  }
}


export function awardCookProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'cook') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.cooking = (skills.cooking || 0) + 1;

  if (shifts % 3 === 0) {
    skills.foodPreparation =
      (skills.foodPreparation || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.workSpeed =
      (skills.workSpeed || 0) + 1;
  }

  if (shifts % 10 === 0) {
    skills.workOrganization =
      (skills.workOrganization || 0) + 1;

    skills.customerService =
      (skills.customerService || 0) + 1;

    stats.dexterity += 2;
    stats.endurance += 1;
    stats.wisdom += 1;
    stats.reputation += 1;
  }
}


export function awardMechanicProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'mechanic') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.autoMechanics =
    (skills.autoMechanics || 0) + 1;

  if (shifts % 3 === 0) {
    skills.vehicleDiagnostics =
      (skills.vehicleDiagnostics || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.engineRepair =
      (skills.engineRepair || 0) + 1;
  }

  if (shifts % 10 === 0) {
    skills.vehicleElectronics =
      (skills.vehicleElectronics || 0) + 1;

    skills.workOrganization =
      (skills.workOrganization || 0) + 1;

    stats.strength += 2;
    stats.dexterity += 1;
    stats.intelligence += 1;
    stats.reputation += 1;
  }
}


export function awardElectricianProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'electrician') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.electricalEngineering =
    (skills.electricalEngineering || 0) + 1;

  if (shifts % 3 === 0) {
    skills.faultDiagnostics =
      (skills.faultDiagnostics || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.electricalRepair =
      (skills.electricalRepair || 0) + 1;
  }

  if (shifts % 10 === 0) {
    skills.electricalSafety =
      (skills.electricalSafety || 0) + 1;

    skills.workOrganization =
      (skills.workOrganization || 0) + 1;

    stats.intelligence += 2;
    stats.dexterity += 1;
    stats.wisdom += 1;
    stats.reputation += 1;
  }
}


export function awardEngineerProgress(s) {
  const e = s.employment;

  if (!e || e.vacancyId !== 'engineer') {
    return;
  }

  const skills = s.character.skills;
  const stats = s.character.stats;
  const shifts = e.completedShifts;

  skills.engineering =
    (skills.engineering || 0) + 1;

  if (shifts % 3 === 0) {
    skills.design =
      (skills.design || 0) + 1;
  }

  if (shifts % 5 === 0) {
    skills.technicalAnalysis =
      (skills.technicalAnalysis || 0) + 1;
  }

  if (shifts % 10 === 0) {
    skills.projectManagement =
      (skills.projectManagement || 0) + 1;

    skills.workOrganization =
      (skills.workOrganization || 0) + 1;

    stats.intelligence += 2;
    stats.knowledge += 2;
    stats.wisdom += 1;
    stats.reputation += 1;
  }
}

export function hire(s, id) {
  const job = VACANCIES[id];

  if (!job || s.dead) return 'Вакансия недоступна';
  if (s.employment) return 'Сначала необходимо уволиться';

  // Первую смену можно начать не раньше следующего дня.
  const today = Math.floor(s.gameMs / DAY);

  s.employment = {
    vacancyId: id,
    hiredAtMs: s.gameMs,
    firstDay: today + 1,
    lastProcessedDay: today,
    activeDay: null,
    completedShifts: 0,
    missedShifts: 0,
    interruptedShifts: 0,
    totalEarnedCents: 0,
    experience: 0
  };

  return 'Вы устроились: ' + job.title;
}

export function fire(s) {
  if (!s.employment) return 'Вы не трудоустроены';

  s.employment = null;
  return 'Вы уволились';
}

export function jobStatus(s) {
  const e = s.employment;
  if (!e) return 'Безработный';

  const job = VACANCIES[e.vacancyId];
  if (!job) return 'Безработный';

  if (e.activeDay !== null) return 'На работе';

  if (s.needs[0] <= MIN_WORK_HEALTH) {
    return 'Плохое здоровье';
  }

  return 'Ожидает смены';
}

function isWeekday(day) {
  return day % 7 < 5;
}

function startTime(day, job) {
  return day * DAY + job.startHour * HOUR;
}

function endTime(day, job) {
  return day * DAY + job.endHour * HOUR;
}

export function nextJobEventMs(s) {
  const e = s.employment;
  if (!e || s.dead) return Infinity;

  const job = VACANCIES[e.vacancyId];
  if (!job) return Infinity;

  if (e.activeDay !== null) {
    return endTime(e.activeDay, job);
  }

  let day = Math.max(
    e.firstDay,
    e.lastProcessedDay + 1,
    Math.floor(s.gameMs / DAY)
  );

  for (let i = 0; i < 8; i++, day++) {
    if (!isWeekday(day)) continue;

    const start = startTime(day, job);

    if (start >= s.gameMs - 0.01) {
      return start;
    }
  }

  return Infinity;
}

export function processJobEvent(s, emit) {
  const e = s.employment;
  if (!e || s.dead) return false;

  const job = VACANCIES[e.vacancyId];
  if (!job) return false;

  if (e.activeDay !== null) {
    const day = e.activeDay;

    if (s.gameMs + 0.01 < endTime(day, job)) {
      return false;
    }

    e.activeDay = null;
    e.lastProcessedDay = day;

    if (s.needs[0] <= MIN_WORK_HEALTH) {
      e.interruptedShifts++;
      emit('Рабочая смена прервана из-за здоровья');
      return true;
    }

    if (!earn(s, job.salaryCents)) {
      emit('Не удалось начислить зарплату');
      return true;
    }

    e.completedShifts++;
    e.experience++;
    awardSellerProgress(s);
    awardProgrammerProgress(s);
    awardCourierProgress(s);
    awardCleanerProgress(s);
    awardSecurityProgress(s);
    awardCookProgress(s);
    awardMechanicProgress(s);
    awardElectricianProgress(s);
    awardEngineerProgress(s);
    e.totalEarnedCents += job.salaryCents;

    emit(
      'Смена завершена: ' + job.title +
      ' · +' + job.salaryCents / 100 + ' $'
    );

    return true;
  }

  const day = Math.floor(s.gameMs / DAY);

  if (day < e.firstDay ||
      day <= e.lastProcessedDay ||
      !isWeekday(day)) {
    return false;
  }

  const start = startTime(day, job);

  if (s.gameMs + 0.01 < start) return false;

  if (s.needs[0] <= MIN_WORK_HEALTH) {
    e.lastProcessedDay = day;
    e.missedShifts++;
    emit('Работа пропущена: плохое здоровье');
    return true;
  }

  // Во время работы не запускаем новые ручные действия.
  e.activeDay = day;

  emit('Началась смена: ' + job.title);
  return true;
}

export function advanceJobEffects(s, gameDelta, emit) {
  const e = s.employment;
  if (!e || e.activeDay === null || gameDelta <= 0) {
    return;
  }

  const job = VACANCIES[e.vacancyId];
  if (!job) return;

  const shiftMs = (
    job.endHour - job.startHour
  ) * HOUR;

  const fraction = gameDelta / shiftMs;

  // Эффекты прежней работы:
  // энергия −15, настроение −5 за полную смену.
  changeNeeds(s, {
    1: -15 * fraction,
    6: -5 * fraction
  });

  if (s.needs[0] <= MIN_WORK_HEALTH) {
    e.activeDay = null;
    e.lastProcessedDay = Math.floor(s.gameMs / DAY);
    e.interruptedShifts++;
    emit('Смена прервана: критическое здоровье');
  }
}
