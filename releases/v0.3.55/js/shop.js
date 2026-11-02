import { spend } from './economy.js';

export const SHOP_ITEMS = Object.freeze({
  smartphone: Object.freeze({
    title: 'Смартфон',
    priceCents: 25000
  }),
  laptop: Object.freeze({
    title: 'Ноутбук',
    priceCents: 80000
  }),
  bicycle: Object.freeze({
    title: 'Велосипед',
    priceCents: 45000
  })
});

export function buyItem(s, id) {
  const item = SHOP_ITEMS[id];

  if (!item) {
    return 'Товар не найден';
  }

  if (!Array.isArray(s.inventory)) {
    s.inventory = [];
  }

  if (s.inventory.includes(id)) {
    return 'Этот товар уже куплен';
  }

  if (!spend(s, item.priceCents)) {
    return 'Недостаточно наличных';
  }

  s.inventory.push(id);

  return 'Куплено: ' + item.title;
}
