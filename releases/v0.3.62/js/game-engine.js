import { YEAR_MS } from './constants.js';
import { applyPassive, checkCritical } from './needs.js';
import { advanceTasks } from './actions.js';
import { nextLoanEventMs, processLoanPayments, accrueBankInterest } from './economy.js';
import { save } from './storage.js';
import { processAutoNeeds } from './auto-needs.js';
import { nextJobEventMs, processJobEvent, advanceJobEffects } from './jobs.js';
const MAX_ACTIVE_MS=2000;
export function advance(s,now=Date.now()){
 if(!s)return;
 const elapsed=Math.max(0,Math.min(MAX_ACTIVE_MS,now-(s.lastReal||now)));
 s.lastReal=now;
 if(s.dead||s.speed===0||typeof document!=='undefined'&&document.visibilityState==='hidden')return;
 const emit=m=>{s.events.unshift(m);s.events=s.events.slice(0,30);};
 let remaining=elapsed*s.speed*YEAR_MS/3600000;
 while(remaining>0&&!s.dead){
  const lifeEnd=s.lifeLimitYears*YEAR_MS;
  const nextDue=nextLoanEventMs(s);
  const nextWork=nextJobEventMs(s);
  let step=Math.min(remaining,Math.max(0,lifeEnd-s.gameMs),Math.max(0,nextDue-s.gameMs),Math.max(0,nextWork-s.gameMs));
  if(step>0){
   applyPassive(s,step);
   advanceTasks(s,step,emit,true);
   advanceJobEffects(s,step,emit);
   const previousGameMs=s.gameMs;
   s.gameMs+=step;remaining-=step;
   accrueBankInterest(s,previousGameMs,s.gameMs);
   processAutoNeeds(s);
   checkCritical(s,emit);
  }
  if(s.dead)break;
  if(nextJobEventMs(s)<=s.gameMs+0.01){
   if(processJobEvent(s,emit))continue;
  }
  if(nextLoanEventMs(s)<=s.gameMs+1){processLoanPayments(s,emit);continue;}
  if(s.gameMs>=lifeEnd){s.dead=true;emit('Истекло время жизни');break;}
  if(step<=0)break;
 }
 if(s.dead){s.deathAt=s.gameMs;s.speed=0;s.tasks=[];}
 save(s);
}
export function setSpeed(s,v){advance(s);if(!s.dead&&[0,.5,1,2,5,10].includes(v)){s.speed=v;s.lastReal=Date.now();save(s);}}
export function background(s){if(!s)return;advance(s);s.speed=0;s.lastReal=Date.now();save(s);}
export function revive(){throw Error('Используйте reviveCharacter из economy.js');}
