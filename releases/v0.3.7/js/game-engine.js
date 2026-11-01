import { YEAR_MS } from './constants.js';
import { applyPassive, checkCritical } from './needs.js';
import { advanceTasks } from './actions.js';
import { nextLoanEventMs, processLoanPayments } from './economy.js';
import { save } from './storage.js';
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
  let step=Math.min(remaining,Math.max(0,lifeEnd-s.gameMs),Math.max(0,nextDue-s.gameMs));
  if(step>0){
   if(s.speed>=1)applyPassive(s,step*3600000/(s.speed*YEAR_MS));
   advanceTasks(s,step,emit,s.speed>=1);
   s.gameMs+=step;remaining-=step;
   if(s.speed>=1)checkCritical(s,emit);
  }
  if(s.dead)break;
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
