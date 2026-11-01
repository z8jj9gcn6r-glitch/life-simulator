export const NEEDS=['Здоровье','Энергия','Сытость','Туалет','Гигиена','Общение','Настроение','Стресс'];
export const NEED_ICONS=['♥','ϟ','▤','♙','♧','♟','☻','◈'];
export const RATES=[.5,10,12,8,6,4,2,3]; // percentage points per 3 REAL hours
export const YEAR_MS=365*86400000;
export const BIRTH_UTC=Date.UTC(2026,9,26);
export const SPEEDS=[0,.5,1,2,5,10];
export const TABS=['Главная','Действия','Финансы','Персонаж','Ещё'];
export const TAB_ICONS=['⌂','☷','▤','♟','•••'];
export const clamp=(x,a=0,b=100)=>Math.min(b,Math.max(a,x));
export const formatMoney=cents=>(cents/100).toLocaleString('ru-RU',{minimumFractionDigits:0,maximumFractionDigits:2});
export const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
