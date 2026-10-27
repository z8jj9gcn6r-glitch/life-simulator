export function createEconomy() {
  return {
    cash: 300,
    bank: 0,
    totalEarned: 0,
    totalSpent: 0
  };
}

export function getTotalMoney(economy) {
  return economy.cash + economy.bank;
}

export function earnMoney(economy, amount) {
  const value = Math.max(0, Number(amount) || 0);

  economy.cash += value;
  economy.totalEarned += value;

  return value;
}

export function spendMoney(economy, amount) {
  const value = Math.max(0, Number(amount) || 0);

  if (economy.cash < value) {
    return false;
  }

  economy.cash -= value;
  economy.totalSpent += value;

  return true;
}

export function depositMoney(economy, amount) {
  const value = Math.max(0, Number(amount) || 0);

  if (economy.cash < value) {
    return false;
  }

  economy.cash -= value;
  economy.bank += value;

  return true;
}

export function withdrawMoney(economy, amount) {
  const value = Math.max(0, Number(amount) || 0);

  if (economy.bank < value) {
    return false;
  }

  economy.bank -= value;
  economy.cash += value;

  return true;
}

export function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(amount);
}
