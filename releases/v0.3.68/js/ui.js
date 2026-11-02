import { NEEDS, SPEEDS, TABS, esc, formatMoney, YEAR_MS } from './constants.js';
import {
  age,
  ageWord,
  dateParts,
  birthDateText
} from './character.js';
import {
  formatAge,
  formatTime,
  remainingLifeDays,
  formatLifeReserve
} from './time-format.js';
import { DEFINITIONS, canStart, ONLINE_COURSES, TRAINING_CATEGORIES } from './actions.js';
import { VACANCIES, jobStatus } from './jobs.js';
import { SHOP_ITEMS } from './shop.js';
import { REVIVE_COST_CENTS, creditPayment, getTotalMoney } from './economy.js';


const NAV_ICON_NAMES = [
  'home',
  'actions',
  'finances',
  'statistics',
  'settings'
];

const NAV_ICON_URLS = NAV_ICON_NAMES.map(name =>
  new URL(`../assets/icons/${name}.svg`, import.meta.url).href
);

const $ = id => document.getElementById(id);
const money = cents => formatMoney(cents) + ' $';
const button = (title, action, value = '', cls = 'btn') => `<button type="button" class="${cls}" data-action="${action}" data-value="${esc(value)}">${title}</button>`;
const section = (title, body) => `<section class="card"><div class="sectiontitle">${title}</div>${body}</section>`;

function speeds(s) {
  return `<div class="speed home-speed">
    <div class="home-speed-buttons">
      ${SPEEDS.map(v => button(
        v === 0 ? '⏸' : '×' + String(v).replace('.', ','),
        'speed',
        v,
        'btn' + (s.speed === v ? ' active' : '')
      )).join('')}
    </div>
  </div>`;
}
function needs(s) {
  return section('Потребности', `<div class="needs">${NEEDS.map((name, i) => {
    if (i === 0 || i === 7) return '';
    const n = Math.max(0, Math.min(100, Number(s.needs[i]) || 0));
    return `<div class="need"><div class="needline"><span>${name}</span><b>${Math.round(n)}%</b></div><div class="bar"><div class="fill${n <= 20 ? ' low' : ''}" style="width:${n}%"></div></div></div>`;
  }).join('')}</div>`);
}
function taskRows(s) {
  return s.tasks.length ? s.tasks.map(t => `<div class="row"><div><b>${esc(t.title)}</b><br><small>${Math.min(100, Math.round(100 * t.progress / t.duration))}% завершено</small></div><div>${button('Отменить', 'cancel', t.id, 'btn smallbtn')}</div></div>`).join('') : '<div class="status muted">Активных действий нет.</div>';
}

function quickActions(s, showAutoToggle = false, showButtons = true) {
  return `<section class="card quick-actions-card">
    <div class="sectiontitle quick-actions-title">
      <span>Быстрые действия</span>
      ${showAutoToggle ? `<button
        type="button"
        class="auto-needs-switch ${s.autoNeedsEnabled ? 'is-on' : ''}"
        data-action="toggle-auto-needs"
        role="switch"
        aria-checked="${s.autoNeedsEnabled ? 'true' : 'false'}"
        aria-label="Автопополнение потребностей"
      >
        <span class="auto-needs-switch-text">
          ${s.autoNeedsEnabled ? 'ВКЛ' : 'ВЫКЛ'}
        </span>
        <span class="auto-needs-switch-thumb"></span>
      </button>` : ''}
    </div>
    ${showButtons ? `<div class="actions">${button('Поесть(7$)', 'instant', 'eat')}${button('Принять душ(5$)', 'instant', 'shower')}${button('Сходить в туалет(3$)', 'instant', 'toilet')}${button('Пообщаться(2$)', 'instant', 'social')}${button('Сон(3$)', 'instant', 'sleep')}${button('Повеселиться(5$)', 'instant', 'mood')}</div>` : ''}
  </section>`;
}
function home(s) {
  const d = dateParts(s);
  const years = age(s);
  const active = s.tasks.length
    ? s.tasks.map(t => esc(t.title)).join(', ')
    : 'нет';

  const identity = `<div class="card pad identity home-identity">
    <div class="home-identity-top">
    <div class="identity-info">
      <b>${esc(s.character.name)}</b>
      <p>${formatAge(s.gameMs)}</p>
      <p>Баланс: ${money(s.cashCents)}</p>
      <p>Активные действия: ${active}</p>
    </div>
    <div class="date">
      ${esc(d.weekday)}
      <strong>${esc(d.time)}</strong>
      ${esc(d.date)}
    </div>
    </div>
    ${speeds(s)}
  </div>`;

  return identity + needs(s) + quickActions(s);
}
function actions(s) {
  const e = s.employment;
  const job = e ? VACANCIES[e.vacancyId] : null;

  const work = job
    ? `<div class="row">
         <div>
           <b>${esc(job.title)}</b><br>
           <small>${esc(job.company)}</small>
         </div>
         ${button('Уволиться', 'fire-job', '', 'btn smallbtn')}
       </div>
       <div class="row"><span>График</span>
         <b>Пн–Пт, ${job.startHour}:00–${job.endHour}:00</b>
       </div>
       <div class="row"><span>Зарплата за смену</span>
         <b>${money(job.salaryCents)}</b>
       </div>
       <div class="row"><span>Статус</span>
         <b>${esc(jobStatus(s))}</b>
       </div>
       <div class="row"><span>Завершено смен</span>
         <b>${e.completedShifts}</b>
       </div>
       <div class="row"><span>Пропущено смен</span>
         <b>${e.missedShifts}</b>
       </div>
       <div class="row"><span>Прервано смен</span>
         <b>${e.interruptedShifts}</b>
       </div>
       <div class="row"><span>Заработано</span>
         <b>${money(e.totalEarnedCents)}</b>
       </div>
       <div class="row"><span>Опыт</span>
         <b>${e.experience}</b>
       </div>`
    : `<div class="row">
         <div><b>Работа</b><br>
           <small>Выберите постоянную работу</small>
         </div>
         ${button('Найти', 'find-job', '', 'btn smallbtn')}
       </div>`;

  const other = Object.entries(DEFINITIONS)
    .filter(([key]) => key !== 'work' && key !== 'course' && key !== 'training')
    .map(([key, d]) => `
      <div class="row">
        <div>
          <b>${esc(d.title)}</b><br>
          <small>${formatTime(d.duration / 3600000, 'hour')}</small>
        </div>
        ${button(
          key === 'course' ? 'Выбрать' : 'Начать',
          'start',
          key,
          'btn smallbtn'
        ).replace(
          '<button ',
          '<button ' + (canStart(s, key) ? 'disabled ' : '')
        )}
      </div>
    `).join('');


  const courses = `<div class="row">
    <div>
      <b>Онлайн курсы</b><br>
      <small>Обучение и развитие навыков</small>
    </div>
    ${button('Выбрать', 'open-courses', '', 'btn smallbtn')}
  </div>`;


  const trainings = `<div class="row">
    <div>
      <b>Тренировки</b><br>
      <small>Развитие характеристик персонажа</small>
    </div>
    ${button('Старт', 'open-trainings', '', 'btn smallbtn')}
  </div>`;

  const shop = `<div class="row">
    <div>
      <b>Магазин</b><br>
      <small>Товары и покупки</small>
    </div>
    ${button('Открыть', 'open-shop', '', 'btn smallbtn')}
  </div>`;

  const property = `<div class="row">
    <div>
      <b>Имущество</b><br>
      <small>Собственность персонажа</small>
    </div>
    ${button('Смотреть', 'open-property', '', 'btn smallbtn')}
  </div>`;

  return section(
    'Действия',
    work + courses + trainings + other + shop + property
  );
}



export function propertyPage(s) {
  const owned = Array.isArray(s.inventory)
    ? s.inventory
    : [];

  const items = owned
    .filter(id => Object.hasOwn(SHOP_ITEMS, id))
    .map(id => {
      const item = SHOP_ITEMS[id];

      return `<div class="row">
        <span>${esc(item.title)}</span>
        <b>${money(item.priceCents)}</b>
      </div>`;
    }).join('');

  return `<section class="card property-card">
    <div class="sectiontitle">
      <span>Имущество</span>
      ${button('‹ Назад', 'back-to-actions', '', 'btn')}
    </div>
    ${items || `<div class="status muted">
      У вас пока нет имущества.
    </div>`}
  </section>`;
}

export function shopPage(s) {
  const owned = Array.isArray(s.inventory)
    ? s.inventory
    : [];

  return `<section class="card shop-card">
    <div class="sectiontitle">
      <span>Магазин</span>
      ${button('‹ Назад', 'back-to-actions', '', 'btn')}
    </div>
    ${Object.entries(SHOP_ITEMS).map(([id, item]) => `
      <div class="row">
        <div>
          <b>${esc(item.title)}</b><br>
          <small>${money(item.priceCents)}</small>
        </div>
        ${owned.includes(id)
          ? '<b>Куплено</b>'
          : button('Купить', 'buy-item', id, 'btn smallbtn')}
      </div>
    `).join('')}
  </section>`;
}



export function trainingsPage(s) {
  const busy = Boolean(canStart(s, 'training'));

  return `<section class="card trainings-card">
    <div class="sectiontitle">
      <span>Тренировки</span>
      ${button('‹ Назад', 'back-to-actions', '', 'btn')}
    </div>
    ${Object.entries(TRAINING_CATEGORIES).map(([id, item]) => `
      <div class="row">
        <div>
          <b>${esc(item.title)}</b><br>
          <small>${formatTime(2, 'hour')}</small><br>
          <small>${esc(item.statTitle)} +1</small>
        </div>
        ${button(
          'Начать',
          'start-training',
          id,
          'btn smallbtn'
        ).replace(
          '<button ',
          '<button ' + (busy ? 'disabled ' : '')
        )}
      </div>
    `).join('')}
  </section>`;
}

export function onlineCoursesPage(s) {
  const busy = Boolean(canStart(s, 'course'));

  return `<section class="card courses-card">
    <div class="sectiontitle">
      <span>Онлайн курсы</span>
      ${button('‹ Назад', 'back-to-actions', '', 'btn')}
    </div>
    ${Object.entries(ONLINE_COURSES).map(([id, course]) => `
      <div class="row">
        <div>
          <b>${esc(course.title)}</b><br>
          <small>${formatTime(course.duration / 3600000, 'hour')}</small><br>
          <small>${esc(course.skillTitle)} +1</small>
        </div>
        ${button(
          'Начать',
          'start-course',
          id,
          'btn smallbtn'
        ).replace(
          '<button ',
          '<button ' + (busy ? 'disabled ' : '')
        )}
      </div>
    `).join('')}
  </section>`;
}

export function vacanciesPage() {
  return `<section class="card vacancies-card">
    <div class="sectiontitle vacancies-title">
      <span>Вакансии</span>
      ${button('‹ Назад', 'back-to-actions', '', 'btn')}
    </div>
`
    + Object.entries(VACANCIES).map(([id, job]) => `
      <div class="row">
        <div>
          <b>${esc(job.title)}</b><br>
          <small>${esc(job.company)}</small><br>
          <small>Пн–Пт,
            ${job.startHour}:00–${job.endHour}:00
          </small><br>
          <small>${money(job.salaryCents)} за смену</small>
        </div>
        ${button('Устроиться', 'hire-job', id, 'btn smallbtn')}
      </div>
    `).join('')
    + `</section>`;
}

function finances(s) {
  return section('Ваши средства', `<div class="row"><span>Наличные</span><b>${money(s.cashCents)}</b></div><div class="row"><span>Банк</span><b>${money(s.bankCents)}</b></div><div class="row"><span>Всего</span><b>${money(s.cashCents + s.bankCents)}</b></div><div class="row"><span>Заработано за жизнь</span><b>${money(s.lifetimeEarnedCents)}</b></div>`) + section('Банковские операции', `<div class="actions">${button('Положить в банк', 'transfer', 'deposit')}${button('Снять из банка', 'transfer', 'withdraw')}${button('Взять в кредит', 'loan-info')}</div><div class="row"><span>Баланс банка</span><b>${money(s.bankCents)}</b></div><div class="row"><span>Ставка</span><b>14% годовых</b></div><div class="row"><span>Капитализация</span><b>Ежедневно</b></div><div class="row"><span>Заработано на процентах</span><b>${money(s.bankInterestEarnedCents || 0)}</b></div><div class="status hint">Суммы вводятся в долларах; расчёты ведутся в целых центах.</div>`) + section('BLACK FOX CAPITAL — кредиты', `<div class="row"><span>Кредитная история</span><b>${s.creditScore ?? 100}%</b></div>${(s.loans||[]).length ? s.loans.map(l=>`<div class="status"><b>Вторая жизнь №${l.id}</b><p>Долг: ${money(l.balanceCents)} · ставка ${(l.apr*100).toFixed(0)}%</p><p>Платёж: ${money(l.paymentCents)} · пропущено подряд: ${l.missedStreak}</p>${button('Досрочно погасить', 'repay', l.id)}</div>`).join('') : '<div class="status muted">Кредитов нет.</div>'}`);
}
const CHARACTER_STAT_NAMES = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  endurance: 'Выносливость',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  knowledge: 'Знания',
  charisma: 'Харизма',
  reputation: 'Репутация'
};

const CHARACTER_SKILL_NAMES = {
  programming: 'Программирование',
  english: 'Английский язык',
  sales: 'Продажи',
  communication: 'Коммуникация',
  customerService: 'Обслуживание клиентов',
  algorithms: 'Алгоритмы',
  debugging: 'Отладка',
  logistics: 'Логистика',
  navigation: 'Ориентирование',
  timeManagement: 'Тайм-менеджмент',
  cleaning: 'Клининг',
  precision: 'Аккуратность',
  workOrganization: 'Организация труда',
  security: 'Безопасность',
  observation: 'Наблюдательность',
  selfDefense: 'Самооборона',
  discipline: 'Дисциплина',
  cooking: 'Кулинария',
  foodPreparation: 'Приготовление блюд',
  workSpeed: 'Скорость работы',
  autoMechanics: 'Автомеханика',
  vehicleDiagnostics: 'Диагностика автомобилей',
  engineRepair: 'Ремонт двигателей',
  vehicleElectronics: 'Электроника автомобилей',
  electricalEngineering: 'Электротехника',
  faultDiagnostics: 'Диагностика неисправностей',
  electricalRepair: 'Ремонт электрооборудования',
  electricalSafety: 'Техника безопасности',
  engineering: 'Инженерное дело',
  design: 'Проектирование',
  technicalAnalysis: 'Технический анализ',
  projectManagement: 'Управление проектами'
};


function eventsJournal(s) {
  return section(
    'Журнал событий',
    s.events.length
      ? s.events.slice(0, 15).map(
          e => `<div class="row">${esc(e)}</div>`
        ).join('')
      : '<div class="status muted">Событий пока нет.</div>'
  );
}

function character(s) {
  const reserve = remainingLifeDays(s);

  const identification = section(
    'Удостоверение',
    `<div class="row">
      <span>Имя</span>
      <b>${esc(s.character.name)}</b>
    </div>
    <div class="row">
      <span>Дата рождения</span>
      <b>${esc(birthDateText(s))}</b>
    </div>
    <div class="row">
      <span>Возраст</span>
      <b>${formatAge(s.gameMs)}</b>
    </div>
    <div class="row">
      <span>Скиллы</span>
      ${button(
        'Подробнее',
        'open-character-stats',
        '',
        'btn smallbtn'
      )}
    </div>

    <div class="row">
      <span>Запас</span>
      <b>${formatLifeReserve(reserve)}</b>
    </div>`
  );

  return identification;
}

export function characterStatsPage(s) {
  const rows = Object.entries(
    CHARACTER_STAT_NAMES
  ).map(([key, title]) => {
    const value = Number(s.character.stats[key] ?? 0);

    return `<div class="row">
      <span>${esc(title)}</span>
      <b>${Number.isFinite(value) ? value : 0}</b>
    </div>`;
  }).join('');

  const skills = Object.entries(
    s.character.skills
  ).map(([key, rawValue]) => {
    const title = CHARACTER_SKILL_NAMES[key] || key;
    const value = Number(rawValue);

    return `<div class="row">
      <span>${esc(title)}</span>
      <b>${Number.isFinite(value) ? value : 0}</b>
    </div>`;
  }).join('');

  const statsCard = `<section class="card">
    <div class="sectiontitle">
      <span>Характеристики</span>
      ${button(
        '‹ Назад',
        'back-to-identification',
        '',
        'btn'
      )}
    </div>
    ${rows}
  </section>`;

  const skillsCard = section(
    'Навыки',
    skills || '<div class="row">Навыков пока нет</div>'
  );

  return statsCard + skillsCard;
}

function more(s) {
  const inProgress = section(
    'В процессе',
    taskRows(s)
  );

  const journal = eventsJournal(s);

  const saving = section(
    'Сохранение',
    `<div class="actions">
      ${button('Экспорт сохранения', 'export')}
      ${button('Начать заново', 'reset')}
    </div>`
  );

  const adminbar = section(
    'Админбар',
    `<div class="adminbar-controls">
      <button
        type="button"
        class="adminbar-login"
        data-action="admin-login"
      >Вход</button>
      <input
        type="password"
        id="adminbar-password"
        class="adminbar-password"
        placeholder="Пароль"
        aria-label="Пароль администратора"
        autocomplete="off"
        inputmode="numeric"
        maxlength="20"
      >
    </div>`
  );

  return adminbar + inProgress + journal + saving;
}

export function adminRoomPage(s, menuOpen = false) {
  return `
    <div
      class="admin500 admin500-shell
        ${menuOpen ? 'admin500-drawer-open' : ''}"
    >

      <aside
        id="admin500-drawer"
        class="admin500-drawer"
        aria-label="Боковое меню администратора"
        aria-hidden="${!menuOpen}"
        ${menuOpen ? '' : 'inert'}
      >

        <div class="admin500-drawer-profile">
          <div class="admin500-drawer-avatar">
            BFX
          </div>

          <div class="admin500-drawer-profile-text">
            <strong>BlackFoxia</strong>
            <span>ADM</span>
          </div>

          <button
            type="button"
            class="admin500-drawer-close"
            data-action="admin-toggle-menu"
            aria-label="Закрыть меню"
            ${menuOpen ? '' : 'tabindex="-1"'}
          >×</button>
        </div>

        <div class="admin500-drawer-group">
          <div class="admin500-drawer-group-title">
            АДМИНИСТРИРОВАНИЕ
          </div>

          <div class="admin500-drawer-row">
            <span class="admin500-drawer-icon">⚙</span>
            <span>Управление</span>
          </div>

          <div class="admin500-drawer-row">
            <span class="admin500-drawer-icon">▤</span>
            <span>Параметры</span>
          </div>

          <div class="admin500-drawer-row">
            <span class="admin500-drawer-icon">◷</span>
            <span>Журнал</span>
          </div>
        </div>

        <div class="admin500-drawer-group">
          <div class="admin500-drawer-group-title">
            ИНФОРМАЦИЯ
          </div>

          <div class="admin500-drawer-row">
            <span class="admin500-drawer-icon">ⓘ</span>
            <span>О проекте</span>
          </div>
        </div>

      </aside>

      <div class="admin500-stage">

        <header class="admin500-header">

          <button
            type="button"
            class="admin500-back"
            data-action="admin-back"
          >‹ Назад</button>

          <button
            type="button"
            class="admin500-menu-button"
            data-action="admin-toggle-menu"
            aria-label="Открыть боковое меню"
            aria-expanded="${menuOpen}"
            aria-controls="admin500-drawer"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </header>

        <main
          class="admin500-empty-room"
          aria-label="ADM"
        >
          <div class="admin500-quick-actions">
            ${quickActions(s, true, false)}
          </div>
        </main>

        <button
          type="button"
          class="admin500-drawer-overlay"
          data-action="admin-toggle-menu"
          aria-label="Закрыть боковое меню"
          ${menuOpen ? '' : 'tabindex="-1" inert'}
        ></button>

      </div>

    </div>
  `;
}

function dead(s) {
 const funds=getTotalMoney(s),short=Math.max(0,REVIVE_COST_CENTS-funds);
 const loansRestricted=(s.loans||[]).some(l=>l.restricted);
 return section('ЖИЗНЬ ЗАВЕРШЕНА', `<div class="status"><p>Статистика ${esc(s.character.name)} умер в возрасте ${formatAge(s.gameMs)}.</p><p>Воскрешение: <b>${money(REVIVE_COST_CENTS)}</b>.</p><p>Доступно: ${money(funds)}.</p>${short?`<p>Не хватает ${money(short)}. Экстренный кредит BLACK FOX CAPITAL: 48% годовых, 10 игровых лет, комиссия 5%.</p><p>Ориентировочный платёж: ${money(creditPayment(short+Math.ceil(short*.05)))}/игровой месяц.</p>${loansRestricted?'<p>Новый кредит недоступен из-за просрочек.</p>':button('Воскреснуть в кредит', 'revive-credit', '', 'btn primary')}`:button('Воскреснуть за 50 000 $','revive-cash','','btn primary')}<p>${button('Начать новую жизнь','new-life')}</p></div>`);
}

export function render(s, tab = 0) {
  $('pageTitle').textContent = s.dead ? 'Конец жизни' : TABS[tab];
  $('tabs').innerHTML = TABS.map((name,i)=>`<button type="button" class="${i===tab?'selected':''}" data-action="tab" data-value="${i}" ${s.dead?'disabled':''}><span class="nav-icon-slot"><img class="nav-svg-icon" src="${NAV_ICON_URLS[i]}" width="26" height="26" alt="" aria-hidden="true" draggable="false"></span>${name}</button>`).join('');
  $('content').innerHTML = s.dead ? dead(s) : [home,actions,finances,character,more][tab](s);
}
export function modal(title, html) {
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = `<main>${html}</main>`;
  $('overlay').classList.remove('hidden');
}
export function closeModal() { $('overlay').classList.add('hidden'); }
let toastTimer;
export function toast(message) {
  const el = $('toast'); el.textContent = message; el.classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.add('hidden'), 2800);
}
export function nameModal() {
  modal('Новая жизнь', `<p>Как зовут вашего персонажа?</p><form id="nameForm"><input id="characterName" maxlength="24" required autocomplete="off" placeholder="Имя персонажа"><button class="btn primary" type="submit">Начать жизнь</button></form>`);
}
export function birthModal(s) {
  const d = dateParts(s);
  modal('Вы родились!', `<p><b>${esc(s.character.name)}</b>, добро пожаловать!</p><p>Дата рождения: ${esc(birthDateText(s))}</p><p>Время жизни: 100 лет.</p><p>Подарок семьи: <b>300 $</b>.</p>${button('Продолжить', 'close', '', 'btn primary')}`);
}
export function transferModal(type) {
  modal(type === 'deposit' ? 'Положить в банк' : 'Снять из банка', `<form id="transferForm" data-type="${type}"><label for="transferAmount">Сумма в долларах</label><input id="transferAmount" inputmode="decimal" type="text" required placeholder="Например, 25,50"><button type="submit" class="btn primary">Подтвердить</button>${button('Отмена', 'close')}</form>`);
}
export function confirmResetModal() {
  modal('Начать заново?', `<p>Текущее сохранение будет удалено без возможности восстановления. Сначала можно экспортировать его.</p>${button('Удалить сохранение', 'confirm-reset', '', 'btn')}${button('Отмена', 'close')}`);
}
