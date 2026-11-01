import { createCharacter } from './character.js';
const KEY='life-simulator-v02',OLD='life-sim-v01';
export function newState(name,now=Date.now()){return {version:3,character:createCharacter(name),cashCents:30000,bankCents:0,bankInterestEarnedCents:0,bankInterestRemainder:0,lifetimeEarnedCents:0,gameMs:0,speed:0,lastReal:now,needs:Array(8).fill(100),criticalTriggered:Array(8).fill(false),auto:Array(8).fill(false),tasks:[],nextTaskId:1,lifeLimitYears:100,autoLife:false,dead:false,deathAt:null,events:[],loans:[],nextLoanId:1,creditScore:100,employment:null,autoNeedsEnabled:false};}
function normalize(s){if(!s||![2,3].includes(s.version)||!s.character||typeof s.character.name!=='string'||!Array.isArray(s.needs)||s.needs.length!==8||!Array.isArray(s.tasks))throw Error('Неверный формат сохранения');
 s.version=3;
 s.character.skills =
   s.character.skills &&
   typeof s.character.skills === 'object'
     ? s.character.skills : {};

 for (const key of [
   'sales',
   'communication',
   'customerService',
   'algorithms',
   'debugging',
   'logistics',
   'navigation',
   'timeManagement'
 ]) {
   if (!Number.isSafeInteger(s.character.skills[key]) ||
       s.character.skills[key] < 0) {
     s.character.skills[key] = 0;
   }
 }
s.autoNeedsEnabled=s.autoNeedsEnabled===true;if(!s.employment||typeof s.employment!=='object')s.employment=null;s.speed=0;s.lastReal=Date.now();s.needs=s.needs.map(v=>Number.isFinite(v)?Math.max(0,Math.min(100,v)):100);s.criticalTriggered=Array.isArray(s.criticalTriggered)&&s.criticalTriggered.length===8?s.criticalTriggered:Array(8).fill(false);s.events=Array.isArray(s.events)?s.events.slice(0,30):[];s.loans=Array.isArray(s.loans)?s.loans:[];s.nextLoanId=Number.isSafeInteger(s.nextLoanId)?s.nextLoanId:1;s.creditScore=Number.isFinite(s.creditScore)?Math.max(0,Math.min(100,s.creditScore)):100;s.cashCents=Number.isSafeInteger(s.cashCents)&&s.cashCents>=0?s.cashCents:0;s.bankCents=Number.isSafeInteger(s.bankCents)&&s.bankCents>=0?s.bankCents:0;s.bankInterestEarnedCents=Number.isSafeInteger(s.bankInterestEarnedCents)&&s.bankInterestEarnedCents>=0?s.bankInterestEarnedCents:0;s.bankInterestRemainder=Number.isFinite(s.bankInterestRemainder)&&s.bankInterestRemainder>=0&&s.bankInterestRemainder<1?s.bankInterestRemainder:0;s.gameMs=Number.isFinite(s.gameMs)&&s.gameMs>=0?s.gameMs:0;s.snapshots=undefined;s.lastSnapshotGameMs=undefined;delete s.snapshots;delete s.lastSnapshotGameMs;return s;}
export function load(){try{const raw=localStorage.getItem(KEY);if(raw)return normalize(JSON.parse(raw));const old=JSON.parse(localStorage.getItem(OLD)||'null');if(old?.name){const s=newState(old.name);s.cashCents=Math.max(0,Math.round((old.balance||0)*100));s.bankCents=Math.max(0,Math.round((old.bank||0)*100));s.gameMs=Math.max(0,old.gameMs||0);return s;}}catch(e){console.warn('Сохранение повреждено:',e)}return null;}
export function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch(e){console.error('Ошибка сохранения:',e);return false;}}
export function reset(){localStorage.removeItem(KEY);localStorage.removeItem(OLD);}
export function exportSave(s){const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='life-simulator-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
