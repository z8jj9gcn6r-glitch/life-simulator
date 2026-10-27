import { formatMoney } from './constants.js';

function validCents(amount) {
  return (
    Number.isSafeInteger(amount) &&
    amount > 0
  );
}

export function createEconomy() {
  return {
    cashCents: 30000,
    bankCents: 0,
    lifetimeEarnedCents: 0
  };
}

export function getTotalMoney(state) {
  return state.cashCents + state.bankCents;
}

export function earn(state, amount) {
  if (!validCents(amount)) {
    return false;
  }

  state.cashCents += amount;
  state.lifetimeEarnedCents += amount;

  return true;
}

export function spend(state, amount) {
  if (!validCents(amount)) {
    return false;
  }

  if (state.cashCents < amount) {
    return false;
  }

  state.cashCents -= amount;

  return true;
}

export function deposit(state, amount) {
  if (!validCents(amount)) {
    return false;
  }

  if (state.cashCents < amount) {
    return false;
  }

  state.cashCents -= amount;
  state.bankCents += amount;

  return true;
}

export function withdraw(state, amount) {
  if (!validCents(amount)) {
    return false;
  }

  if (state.bankCents < amount) {
    return false;
  }

  state.bankCents -= amount;
  state.cashCents += amount;

  return true;
}

export function formatBalance(cents) {
  return formatMoney(cents) + ' $';
}
