import { NEEDS, RATES, clamp, YEAR_MS } from './constants.js';
const THREE_GAME_YEARS_MS=3*YEAR_MS;
export const createNeeds=()=>Array(8).fill(100);
export const clampNeed=clamp;
export function changeNeeds(s,changes){if(!Array.isArray(s?.needs))return false;for(const [key,delta] of Object.entries(changes)){const i=Number(key);if(Number.isInteger(i)&&i>=0&&i<8&&Number.isFinite(delta))if(i!==0&&i!==7)s.needs[i]=clamp(s.needs[i]+delta);}return true;}
export function applyPassive(s,gameDelta){
 if(!s||s.dead||!Number.isFinite(gameDelta)||gameDelta<=0)return;
 const covered=new Set();
 for(const t of s.tasks||[])
  for(const k of Object.keys(t.effects||{}))
   covered.add(Number(k));
 for(let i=0;i<8;i++)
  if(!covered.has(i))
   s.needs[i]=clamp(
    s.needs[i]-RATES[i]*gameDelta/THREE_GAME_YEARS_MS
   );
}
export function applyTaskEffects(s,t,fraction){if(!Number.isFinite(fraction)||fraction<=0)return;const changes={};for(const [k,v] of Object.entries(t.effects||{}))changes[k]=v*fraction;changeNeeds(s,changes);}
export function checkCritical(s,emit){for(let i=0;i<8;i++){if(i===0||i===7)continue;if(s.needs[i]<=0&&!s.criticalTriggered[i]){s.criticalTriggered[i]=true;emit('Критическое состояние: '+NEEDS[i]);if(i===3)s.character.stats.reputation=Math.max(0,s.character.stats.reputation-10);}if(s.needs[i]>0)s.criticalTriggered[i]=false;}}
