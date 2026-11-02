import { newState, load, save, reset, exportSave } from './storage.js';
import {
  setAdminRoomMode,
  adminDialogMarkup
} from './admin-room.js';
import { advance, setSpeed, background } from './game-engine.js';
import { startAction, cancelAction, instantAction } from './actions.js';
import { deposit, withdraw, reviveCharacter, repayEarly } from './economy.js';
import { SPEEDS } from './constants.js';
import { hire, fire } from './jobs.js';
import { buyItem } from './shop.js';
import { render, modal, closeModal, toast, nameModal, birthModal, transferModal, confirmResetModal, vacanciesPage, shopPage, propertyPage, onlineCoursesPage, trainingsPage, characterStatsPage, adminRoomPage } from './ui.js';

let state = load();
let tab = 0;
let jobsPage = false;
let shopOpen = false;
let propertyOpen = false;
let coursesOpen = false;
let trainingsOpen = false;
let identificationPage = null;
let adminRoomOpen = false;
let adminRoomTab = 'photos';
let adminDialogOpen = false;
let adminMenuOpen = false;
let adminSection = 'control';
let backgrounded = document.visibilityState === 'hidden';


/*
 * BlackFoxia v0.3.64
 * Восстановление страницы после перезагрузки.
 *
 * Навигация хранится отдельно от игрового
 * сохранения и не влияет на симуляцию.
 */

const NAVIGATION_KEY = 'blackfoxia-navigation-v1';

function saveNavigation() {
  try {
    if (!state) {
      sessionStorage.removeItem(NAVIGATION_KEY);
      return;
    }

    const navigation = {
      tab,
      jobsPage,
      shopOpen,
      propertyOpen,
      coursesOpen,
      trainingsOpen,
      identificationPage,
      adminRoomOpen,
      adminRoomTab,
      adminSection,
      adminDialogOpen
    };

    sessionStorage.setItem(
      NAVIGATION_KEY,
      JSON.stringify(navigation)
    );
  } catch (error) {
    console.warn(
      'Не удалось сохранить навигацию:',
      error
    );
  }
}

function restoreNavigation() {
  if (!state) return;

  try {
    const raw = sessionStorage.getItem(
      NAVIGATION_KEY
    );

    if (!raw) return;

    const saved = JSON.parse(raw);

    if (
      !saved ||
      typeof saved !== 'object' ||
      !Number.isInteger(saved.tab) ||
      saved.tab < 0 ||
      saved.tab > 4
    ) {
      return;
    }

    tab = saved.tab;

    if (
      ['control', 'settings', 'journal']
        .includes(saved.adminSection)
    ) {
      adminSection = saved.adminSection;
    }

    // Вложенные страницы раздела «Действия».
    // Одновременно может быть открыта
    // только одна из них.

    jobsPage = false;
    shopOpen = false;
    propertyOpen = false;
    coursesOpen = false;
    trainingsOpen = false;

    if (tab === 1 && !state.dead) {
      const requested = [
        saved.jobsPage === true,
        saved.shopOpen === true,
        saved.propertyOpen === true,
        saved.coursesOpen === true,
        saved.trainingsOpen === true
      ];

      if (requested.filter(Boolean).length === 1) {
        [
          jobsPage,
          shopOpen,
          propertyOpen,
          coursesOpen,
          trainingsOpen
        ] = requested;
      }
    }

    // Страница характеристик.
    identificationPage =
      tab === 3 &&
      !state.dead &&
      saved.identificationPage === 'stats'
        ? 'stats'
        : null;

    // Комната администратора.
    adminRoomOpen =
      tab === 4 &&
      !state.dead &&
      saved.adminRoomOpen === true;

    adminRoomTab =
      saved.adminRoomTab === 'info'
        ? 'info'
        : 'photos';

    // Не восстанавливаем модальные окна,
    // чтобы после перезагрузки не блокировать
    // управление страницей.
    adminDialogOpen = false;

  } catch (error) {
    console.warn(
      'Не удалось восстановить навигацию:',
      error
    );
  }
}

function clearNavigation() {
  try {
    sessionStorage.removeItem(NAVIGATION_KEY);
  } catch (_) {}
}

restoreNavigation();

function redraw() {
 saveNavigation();

 const adminActive = Boolean(
  state && adminRoomOpen && tab === 4 && !state.dead
 );

 setAdminRoomMode(adminActive);

 if (!state) return;

 render(state, tab);
 if (adminRoomOpen && tab === 4 && !state.dead) {
  document.getElementById('pageTitle').textContent =
    '';
  document.getElementById('content').innerHTML =
    adminRoomPage(state, adminMenuOpen, adminSection) +
    (adminDialogOpen ? adminDialogMarkup() : '');
  return;
 }
 if (jobsPage && tab === 1 && !state.dead) {
  document.getElementById('pageTitle').textContent='Вакансии';
  document.getElementById('content').innerHTML=vacanciesPage();
 }
 if (shopOpen && tab === 1 && !state.dead) {
  document.getElementById('pageTitle').textContent='Магазин';
  document.getElementById('content').innerHTML=shopPage(state);
 }
 if (propertyOpen && tab === 1 && !state.dead) {
  document.getElementById('pageTitle').textContent='Имущество';
  document.getElementById('content').innerHTML=propertyPage(state);
 }
 if (coursesOpen && tab === 1 && !state.dead) {
  document.getElementById('pageTitle').textContent='Онлайн курсы';
  document.getElementById('content').innerHTML=onlineCoursesPage(state);
 }
 if (trainingsOpen && tab === 1 && !state.dead) {
  document.getElementById('pageTitle').textContent='Тренировки';
  document.getElementById('content').innerHTML=trainingsPage(state);
 }
 if (
  identificationPage === 'stats' &&
  tab === 3 &&
  !state.dead
 ) {
  document.getElementById('pageTitle').textContent =
    'Характеристики';

  document.getElementById('content').innerHTML =
    characterStatsPage(state);
 }
}
function commit() { save(state); redraw(); }
function start() {
  if (!state) { nameModal(); return; }
  state.speed=0;state.lastReal=Date.now();save(state);
  redraw();
}
function parseCents(text) {
  const normalized = String(text).trim().replace(',', '.');
  if (!/^(?:\d+)(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [d, c=''] = normalized.split('.');
  const amount = Number(d) * 100 + Number(c.padEnd(2, '0'));
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

document.addEventListener('submit', event => {
  if (event.target.id === 'nameForm') {
    event.preventDefault();
    const name = document.getElementById('characterName').value.trim().slice(0, 24);
    if (!name) { toast('Введите имя персонажа'); return; }
    state = newState(name);
    tab = 0;
    jobsPage = false;
    shopOpen = false;
    propertyOpen = false;
    coursesOpen = false;
    trainingsOpen = false;
    identificationPage = null;
    adminRoomOpen = false;
    adminDialogOpen = false;
    clearNavigation();
    save(state);
    redraw();
    birthModal(state);
  }
  if (event.target.id === 'transferForm') {
    event.preventDefault();
    if (!state || state.dead) return;
    advance(state);
    const cents = parseCents(document.getElementById('transferAmount').value);
    if (cents === null) { toast('Введите положительную сумму, не более двух знаков после запятой'); return; }
    const kind = event.target.dataset.type;
    const success = kind === 'deposit' ? deposit(state, cents) : kind === 'withdraw' ? withdraw(state, cents) : false;
    if (!success) { toast('Недостаточно средств'); return; }
    closeModal(); commit(); toast('Операция выполнена');
  }
});

document.addEventListener('click', event => {
  const btn = event.target.closest('button[data-action]');
  if (!btn || btn.disabled) return;
  const action = btn.dataset.action, value = btn.dataset.value;
  if (action === 'close') { closeModal(); return; }
  if (action === 'confirm-reset') {
    reset(); state = null; tab = 0;
    clearNavigation();
    closeModal();
    document.getElementById('content').innerHTML = '';
    document.getElementById('tabs').innerHTML = '';
    nameModal(); return;
  }
  if (action === 'reset') { confirmResetModal(); return; }
  if (!state) return;
  if (action === 'export') { exportSave(state); return; }
  if (action === 'revive-cash' || action === 'revive-credit') {
    const result=reviveCharacter(state,action==='revive-credit');
    if(result.ok){tab=0;commit();toast('Персонаж воскрес');}else toast(result.message);
    return;
  }
  if (action === 'new-life') { reset();state=null;tab=0;clearNavigation();closeModal();document.getElementById('content').innerHTML='';document.getElementById('tabs').innerHTML='';nameModal();return; }
  if (action === 'repay') {
    const loan=(state.loans||[]).find(l=>l.id===Number(value));
    if(!loan)return;
    const input=prompt('Сумма досрочного погашения, $');
    if(input===null)return;
    const cents=parseCents(input);
    if(!cents||!repayEarly(state,loan.id,cents))toast('Не удалось погасить кредит');else{commit();toast('Погашение выполнено');}
    return;
  }
  if (action === 'tab') {
    tab = Number(value);
    jobsPage = false;
    shopOpen = false;
    propertyOpen = false;
    coursesOpen = false;
    trainingsOpen = false;
    identificationPage = null;
    adminRoomOpen = false;
    adminDialogOpen = false;
    redraw();
    return;
  }
  if (action === 'menu') { tab = 4; redraw(); return; }
  if (action === 'settings') { tab = 4; redraw(); return; }
  if (action === 'messages') { modal('События', `<main>${state.events.length ? state.events.slice(0,20).map(x=>`<p>${String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</p>`).join('') : 'Нет новых событий'}<button class="btn" data-action="close">Закрыть</button></main>`); return; }
  advance(state);
  if (state.dead) { redraw(); return; }
  if (action === 'speed') {
    const speed = Number(value);
    if (!SPEEDS.includes(speed)) return;
    setSpeed(state, speed); commit(); return;
  }



  if (action === 'admin-login') {
    if (tab !== 4 || state.dead) return;

    const input = document.getElementById(
      'adminbar-password'
    );

    if (!input) return;

    const password = input.value;

    input.value = '';

    if (password !== '0601') {
      toast('Неверный пароль');
      return;
    }

    adminRoomOpen = true;
    adminSection = 'control';
    adminRoomTab = 'photos';
    adminDialogOpen = false;
    adminMenuOpen = false;
    redraw();
    toast('Вход выполнен');
    return;
  }

  if (action === 'admin-photos') {
    if (!adminRoomOpen || tab !== 4) return;
    adminRoomTab = 'photos';
    redraw();
    return;
  }

  if (action === 'admin-info') {
    if (!adminRoomOpen || tab !== 4) return;
    adminRoomTab = 'info';
    redraw();
    return;
  }

  if (action === 'admin-open-dialog') {
    if (!adminRoomOpen || tab !== 4) return;
    adminDialogOpen = true;
    redraw();
    return;
  }

  if (action === 'admin-close-dialog') {
    if (!adminRoomOpen || tab !== 4) return;
    adminDialogOpen = false;
    redraw();
    return;
  }

  if (action === 'admin-open-section') {
    if (!adminRoomOpen || tab !== 4) return;

    if (
      !['control', 'settings', 'journal']
        .includes(value)
    ) return;

    adminSection = value;
    adminMenuOpen = false;

    redraw();
    return;
  }

  if (action === 'admin-toggle-menu') {
    if (!adminRoomOpen || tab !== 4) return;

    const shell = document.querySelector(
      '.admin500-shell'
    );

    const drawer = document.getElementById(
      'admin500-drawer'
    );

    const menuButton = document.querySelector(
      '.admin500-menu-button'
    );

    const overlay = document.querySelector(
      '.admin500-drawer-overlay'
    );

    if (!shell || !drawer || !menuButton || !overlay) {
      return;
    }

    adminMenuOpen = !adminMenuOpen;

    shell.classList.toggle(
      'admin500-drawer-open',
      adminMenuOpen
    );

    menuButton.setAttribute(
      'aria-expanded',
      String(adminMenuOpen)
    );

    menuButton.setAttribute(
      'aria-label',
      adminMenuOpen
        ? 'Закрыть боковое меню'
        : 'Открыть боковое меню'
    );

    drawer.setAttribute(
      'aria-hidden',
      String(!adminMenuOpen)
    );

    if (adminMenuOpen) {
      drawer.removeAttribute('inert');
      overlay.removeAttribute('inert');
      overlay.removeAttribute('tabindex');
    } else {
      drawer.setAttribute('inert', '');
      overlay.setAttribute('inert', '');
      overlay.setAttribute('tabindex', '-1');
    }

    saveNavigation();
    return;
  }

  if (action === 'admin-back') {
    adminRoomOpen = false;
    adminDialogOpen = false;
    adminMenuOpen = false;
    tab = 4;
    redraw();
    return;
  }

  if (action === 'open-character-stats') {
    tab = 3;
    identificationPage = 'stats';
    redraw();
    return;
  }

  if (action === 'back-to-identification') {
    identificationPage = null;
    tab = 3;
    redraw();
    return;
  }

  if (action === 'open-trainings') {
    jobsPage = false;
    shopOpen = false;
    propertyOpen = false;
    coursesOpen = false;
    trainingsOpen = true;
    tab = 1;
    redraw();
    return;
  }

  if (action === 'start-training') {
    const error = startAction(
      state,
      'training',
      null,
      value
    );

    if (error) {
      toast(error);
    } else {
      trainingsOpen = false;
      commit();
      toast('Тренировка начата');
    }
    return;
  }

  if (action === 'open-courses') {
    trainingsOpen = false;
    jobsPage = false;
    shopOpen = false;
    propertyOpen = false;
    coursesOpen = true;
    tab = 1;
    redraw();
    return;
  }

  if (action === 'start-course') {
    const error = startAction(state, 'course', value);

    if (error) {
      toast(error);
    } else {
      coursesOpen = false;
      commit();
      toast('Обучение начато');
    }
    return;
  }

  if (action === 'find-job') {
    trainingsOpen=false;
    shopOpen=false;
    propertyOpen=false;
    jobsPage=true;
    tab=1;
    redraw();
    return;
  }
  if (action === 'buy-item') {
    const result = buyItem(state, value);
    commit();
    toast(result);
    return;
  }
  if (action === 'open-shop') {
    trainingsOpen=false;
    jobsPage=false;
    propertyOpen=false;
    shopOpen=true;
    tab=1;
    redraw();
    return;
  }
  if (action === 'open-property') {
    trainingsOpen=false;
    jobsPage=false;
    shopOpen=false;
    propertyOpen=true;
    tab=1;
    redraw();
    return;
  }
  if (action === 'back-to-actions') {
    jobsPage=false;
    shopOpen=false;
    propertyOpen=false;
    coursesOpen=false;
    trainingsOpen=false;
    tab=1;
    redraw();
    return;
  }
  if (action === 'hire-job') {
    const result=hire(state,value);
    if (state.employment?.vacancyId===value) {
      jobsPage=false;
      commit();
    }
    toast(result);
    return;
  }
  if (action === 'fire-job') {
    const result=fire(state);
    jobsPage=false;
    commit();
    toast(result);
    return;
  }
  if (action === 'start') {
    const error = startAction(state, value);
    if (error) toast(error); else { commit(); toast('Действие начато'); }
    return;
  }
  if (action === 'cancel') {
    if (cancelAction(state, Number(value))) { commit(); toast('Действие отменено'); }
    return;
  }
  if (action === 'toggle-auto-needs') {
    state.autoNeedsEnabled = !state.autoNeedsEnabled;
    commit();
    toast(
      state.autoNeedsEnabled
        ? 'Автопополнение включено'
        : 'Автопополнение выключено'
    );
    return;
  }

  if (action === 'instant') {
    const result = instantAction(state, value);
    commit(); toast(result); return;
  }
  if (action === 'loan-info') {
    toast('Оформление кредитов пока недоступно');
    return;
  }
  if (action === 'transfer') { transferModal(value); return; }
});

function enterBackground() {
  saveNavigation();
  if (backgrounded) return;
  backgrounded = true;
  if (state) background(state);
}
function enterForeground() {
  if (!backgrounded) return;
  backgrounded = false;
  if (state) { state.speed=0;state.lastReal=Date.now();save(state);redraw(); }
}
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' ? enterBackground() : enterForeground());
window.addEventListener('pagehide', enterBackground);
window.addEventListener('pageshow', enterForeground);
setInterval(() => {
  if (
    !state ||
    backgrounded ||
    document.visibilityState === 'hidden'
  ) return;

  advance(state);

  const activeElement = document.activeElement;

  const adminPasswordFocused =
    tab === 4 &&
    !adminRoomOpen &&
    activeElement?.id === 'adminbar-password';

  if (adminPasswordFocused) {
    // Не уничтожаем активное поле пароля.
    // Симуляция продолжает работать.
    save(state);
    return;
  }

  redraw();
}, 1000);

try { window.Telegram?.WebApp?.ready(); window.Telegram?.WebApp?.expand(); } catch (_) {}
start();
