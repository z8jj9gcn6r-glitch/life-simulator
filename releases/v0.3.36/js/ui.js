import { NEEDS, SPEEDS, TABS, TAB_ICONS, esc, formatMoney, YEAR_MS } from './constants.js';
import { age, ageWord, dateParts } from './character.js';
import { DEFINITIONS, canStart } from './actions.js';
import { VACANCIES, jobStatus } from './jobs.js';
import { SHOP_ITEMS } from './shop.js';
import { REVIVE_COST_CENTS, creditPayment, getTotalMoney } from './economy.js';

const FINANCE_SVG_ICON = "<svg class=\"finance-outline-icon\" viewBox=\"0 0 64 64\" width=\"26\" height=\"26\" fill=\"none\" stroke=\"#DCE1EB\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M37 10 L37 5 Q37 3 34 3 L30 3 Q27 3 27 6 L27 10 Q14 11 12 22 Q11 31 24 34 L37 38 Q45 41 42 48 Q40 54 31 54 Q21 54 14 48 L9 55 Q16 61 27 62 L27 63 L37 63 L37 60 Q51 58 53 47 Q55 35 41 31 L27 27 Q20 25 22 20 Q24 15 32 15 Q40 15 47 20 L54 13 Q47 8 37 10 Z\"/></svg>";
const ACTIONS_GLOBE_ICON = "<svg class=\"actions-globe-icon\" viewBox=\"0 0 64 64\" width=\"26\" height=\"26\" fill=\"none\" stroke=\"#DCE1EB\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"32\" cy=\"32\" r=\"27\"/><path d=\"M12 18 L18 15 L21 11 L26 13 L25 19 L20 21 L18 26 L13 26 L11 31\"/><path d=\"M28 8 L32 13 L38 12 L40 17 L35 21 L29 20 L27 25 L32 28 L37 26 L42 30 L40 36 L35 39 L34 46 L29 54 L25 51 L23 44 L19 40 L18 33 L23 29 L27 31\"/><path d=\"M46 14 L49 20 L55 22 M49 34 L56 37 L54 44\"/></svg>";
const $ = id => document.getElementById(id);
const money = cents => formatMoney(cents) + ' $';
const button = (title, action, value = '', cls = 'btn') => `<button type="button" class="${cls}" data-action="${action}" data-value="${esc(value)}">${title}</button>`;
const section = (title, body) => `<section class="card"><div class="sectiontitle">${title}</div>${body}</section>`;

function speeds(s) {
  return `<div class="card speed"><label>Скорость времени</label>${SPEEDS.map(v => button(v === 0 ? '⏸' : '×' + String(v).replace('.', ','), 'speed', v, 'btn' + (s.speed === v ? ' active' : ''))).join('')}</div>`;
}
function needs(s) {
  return section('Потребности', `<div class="needs">${NEEDS.map((name, i) => {
    const n = Math.max(0, Math.min(100, Number(s.needs[i]) || 0));
    return `<div class="need"><div class="needline"><span>${name}</span><b>${Math.round(n)}%</b></div><div class="bar"><div class="fill${n <= 20 ? ' low' : ''}" style="width:${n}%"></div></div></div>`;
  }).join('')}</div>`);
}
function taskRows(s) {
  return s.tasks.length ? s.tasks.map(t => `<div class="row"><div><b>${esc(t.title)}</b><br><small>${Math.min(100, Math.round(100 * t.progress / t.duration))}% завершено</small></div><div>${button('Отменить', 'cancel', t.id, 'btn smallbtn')}</div></div>`).join('') : '<div class="status muted">Активных действий нет.</div>';
}

function quickActions(s) {
  return `<section class="card quick-actions-card">
    <div class="sectiontitle quick-actions-title">
      <span>Быстрые действия</span>
      <button
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
      </button>
    </div>
    <div class="actions">${button('Поесть(7$)', 'instant', 'eat')}${button('Принять душ(5$)', 'instant', 'shower')}${button('Сходить в туалет(3$)', 'instant', 'toilet')}${button('Пообщаться(2$)', 'instant', 'social')}${button('Лечение(35$)', 'instant', 'treatment')}${button('Развлечься(25$)', 'instant', 'entertainment')}${button('Сон(3$)', 'instant', 'sleep')}${button('Повеселиться(5$)', 'instant', 'mood')}</div>
  </section>`;
}
function home(s) {
  const d = dateParts(s), years = age(s);
  const active = s.tasks.length ? s.tasks.map(t => esc(t.title)).join(', ') : 'нет';
  return `<div class="card pad identity"><div class="identity-info"><b>${esc(s.character.name)}</b><p>${years} ${ageWord(years)}</p><p>Баланс: ${money(s.cashCents)}</p><p>Активные действия: ${active}</p></div><div class="date">${esc(d.weekday)}<strong>${esc(d.time)}</strong>${esc(d.date)}</div></div>${quickActions(s)}${needs(s)}`;
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
    .filter(([key]) => key !== 'work')
    .map(([key, d]) => `
      <div class="row">
        <div>
          <b>${esc(d.title)}</b><br>
          <small>${d.duration / 3600000} игровых ч.</small>
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

  return section('Действия', work + other + shop + property)
    + section('В процессе', taskRows(s));
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
function character(s) {
  const statNames = {strength:'Сила',dexterity:'Ловкость',endurance:'Выносливость',intelligence:'Интеллект',wisdom:'Мудрость',knowledge:'Знания',charisma:'Харизма',reputation:'Репутация'};
  const skillNames = {programming:'Программирование',english:'Английский язык',sales:'Продажи',communication:'Коммуникация',customerService:'Обслуживание клиентов',algorithms:'Алгоритмы',debugging:'Отладка',logistics:'Логистика',navigation:'Ориентирование',timeManagement:'Тайм-менеджмент',cleaning:'Клининг',precision:'Аккуратность',workOrganization:'Организация труда',security:'Безопасность',observation:'Наблюдательность',selfDefense:'Самооборона',discipline:'Дисциплина',cooking:'Кулинария',foodPreparation:'Приготовление блюд',workSpeed:'Скорость работы',autoMechanics:'Автомеханика',vehicleDiagnostics:'Диагностика автомобилей',engineRepair:'Ремонт двигателей',vehicleElectronics:'Электроника автомобилей',electricalEngineering:'Электротехника',faultDiagnostics:'Диагностика неисправностей',electricalRepair:'Ремонт электрооборудования',electricalSafety:'Техника безопасности',engineering:'Инженерное дело',design:'Проектирование',technicalAnalysis:'Технический анализ',projectManagement:'Управление проектами'};
  return section('Статистика', `<div class="row"><span>Имя</span><b>${esc(s.character.name)}</b></div><div class="row"><span>Возраст</span><b>${age(s)} ${ageWord(age(s))}</b></div>`) + section('Характеристики', Object.entries(s.character.stats).map(([k,v])=>`<div class="row"><span>${statNames[k] || esc(k)}</span><b>${Number(v)}</b></div>`).join('')) + section('Навыки', Object.entries(s.character.skills).map(([k,v])=>`<div class="row"><span>${skillNames[k] || esc(k)}</span><b>${Number(v)}</b></div>`).join(''));
}
function more(s) {
  const left = Math.max(0, s.lifeLimitYears - s.gameMs / YEAR_MS);
  return speeds(s) + section('Жизнь', `<div class="row"><span>Осталось</span><b>${left.toFixed(2)} года</b></div><div class="row"><span>Автопродление</span><b>Пока не реализовано</b></div>`) + section('Сохранение', `<div class="actions">${button('Экспорт сохранения', 'export')}${button('Начать заново', 'reset')}</div>`) + section('Журнал событий', s.events.length ? s.events.slice(0, 15).map(e=>`<div class="row">${esc(e)}</div>`).join('') : '<div class="status muted">Событий пока нет.</div>');
}
function dead(s) {
 const funds=getTotalMoney(s),short=Math.max(0,REVIVE_COST_CENTS-funds);
 const loansRestricted=(s.loans||[]).some(l=>l.restricted);
 return section('ЖИЗНЬ ЗАВЕРШЕНА', `<div class="status"><p>Статистика ${esc(s.character.name)} умер в возрасте ${age(s)} ${ageWord(age(s))}.</p><p>Воскрешение: <b>${money(REVIVE_COST_CENTS)}</b>.</p><p>Доступно: ${money(funds)}.</p>${short?`<p>Не хватает ${money(short)}. Экстренный кредит BLACK FOX CAPITAL: 48% годовых, 10 игровых лет, комиссия 5%.</p><p>Ориентировочный платёж: ${money(creditPayment(short+Math.ceil(short*.05)))}/игровой месяц.</p>${loansRestricted?'<p>Новый кредит недоступен из-за просрочек.</p>':button('Воскреснуть в кредит', 'revive-credit', '', 'btn primary')}`:button('Воскреснуть за 50 000 $','revive-cash','','btn primary')}<p>${button('Начать новую жизнь','new-life')}</p></div>`);
}

export function render(s, tab = 0) {
  $('pageTitle').textContent = s.dead ? 'Конец жизни' : TABS[tab];
  $('tabs').innerHTML = TABS.map((name,i)=>`<button type="button" class="${i===tab?'selected':''}" data-action="tab" data-value="${i}" ${s.dead?'disabled':''}><span>${i===1 ? ACTIONS_GLOBE_ICON : i===2 ? FINANCE_SVG_ICON : i===4 ? `<svg class="settings-hex-icon" viewBox="0 0 64 64" width="26" height="26" fill="none" stroke="#DCE1EB" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M26 2 L38 2 L44 12 L38 22 L26 22 L20 12 Z"/><path d="M8 15 L20 15 L26 25 L20 35 L8 35 L2 25 Z"/><path d="M44 15 L56 15 L62 25 L56 35 L44 35 L38 25 Z"/><path d="M8 37 L20 37 L26 47 L20 57 L8 57 L2 47 Z"/><path d="M44 37 L56 37 L62 47 L56 57 L44 57 L38 47 Z"/><path d="M26 42 L38 42 L44 52 L38 62 L26 62 L20 52 Z"/></svg>` : i===3 ? `<svg class="statistics-outline-icon" viewBox="0 0 64 64" width="26" height="26" fill="none" stroke="#DCE1EB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6" y="39" width="12" height="19"/><rect x="26" y="26" width="12" height="32"/><rect x="46" y="9" width="12" height="49"/></svg>` : TAB_ICONS[i]}</span>${name}</button>`).join('');
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
  modal('Вы родились!', `<p><b>${esc(s.character.name)}</b>, добро пожаловать!</p><p>Дата рождения: ${esc(d.date)}</p><p>Время жизни: 100 лет.</p><p>Подарок семьи: <b>300 $</b>.</p>${button('Продолжить', 'close', '', 'btn primary')}`);
}
export function transferModal(type) {
  modal(type === 'deposit' ? 'Положить в банк' : 'Снять из банка', `<form id="transferForm" data-type="${type}"><label for="transferAmount">Сумма в долларах</label><input id="transferAmount" inputmode="decimal" type="text" required placeholder="Например, 25,50"><button type="submit" class="btn primary">Подтвердить</button>${button('Отмена', 'close')}</form>`);
}
export function confirmResetModal() {
  modal('Начать заново?', `<p>Текущее сохранение будет удалено без возможности восстановления. Сначала можно экспортировать его.</p>${button('Удалить сохранение', 'confirm-reset', '', 'btn')}${button('Отмена', 'close')}`);
}
