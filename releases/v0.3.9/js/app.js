import { newState, load, save, reset, exportSave } from './storage.js';
import { advance, setSpeed, background } from './game-engine.js';
import { startAction, cancelAction, instantAction } from './actions.js';
import { deposit, withdraw, reviveCharacter, repayEarly } from './economy.js';
import { SPEEDS } from './constants.js';
import { render, modal, closeModal, toast, nameModal, birthModal, transferModal, confirmResetModal } from './ui.js';

let state = load();
let tab = 0;
let backgrounded = document.visibilityState === 'hidden';

function redraw() { if (state) render(state, tab); }
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
    reset(); state = null; tab = 0; closeModal();
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
  if (action === 'new-life') { reset();state=null;tab=0;closeModal();document.getElementById('content').innerHTML='';document.getElementById('tabs').innerHTML='';nameModal();return; }
  if (action === 'repay') {
    const loan=(state.loans||[]).find(l=>l.id===Number(value));
    if(!loan)return;
    const input=prompt('Сумма досрочного погашения, $');
    if(input===null)return;
    const cents=parseCents(input);
    if(!cents||!repayEarly(state,loan.id,cents))toast('Не удалось погасить кредит');else{commit();toast('Погашение выполнено');}
    return;
  }
  if (action === 'tab') { tab = Number(value); redraw(); return; }
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
  if (action === 'start') {
    const error = startAction(state, value);
    if (error) toast(error); else { commit(); toast('Действие начато'); }
    return;
  }
  if (action === 'cancel') {
    if (cancelAction(state, Number(value))) { commit(); toast('Действие отменено'); }
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
  if (!state || backgrounded || document.visibilityState === 'hidden') return;
  advance(state); redraw();
}, 1000);

try { window.Telegram?.WebApp?.ready(); window.Telegram?.WebApp?.expand(); } catch (_) {}
start();
