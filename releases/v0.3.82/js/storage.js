import { createCharacter } from './character.js';
import { initializeBiography } from './biography.js';
const KEY='life-simulator-v02',OLD='life-sim-v01';
export function newState(name,now=Date.now()){return {version:3,character:{
  ...createCharacter(name),
  birthDate:(()=>{
    const d=new Date(now);
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  })()
},cashCents:30000,bankCents:0,bankInterestEarnedCents:0,bankInterestRemainder:0,lifetimeEarnedCents:0,gameMs:0,speed:0,lastReal:now,needs:Array(8).fill(100),criticalTriggered:Array(8).fill(false),auto:Array(8).fill(false),tasks:[],nextTaskId:1,lifeLimitYears:100,autoLife:false,dead:false,deathAt:null,events:[],biography:[],loans:[],nextLoanId:1,creditScore:100,employment:null,inventory:[],autoNeedsEnabled:false};}
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
   'timeManagement',
   'cleaning',
   'precision',
   'workOrganization',
   'security',
   'observation',
   'selfDefense',
   'discipline',
   'cooking',
   'foodPreparation',
   'workSpeed',
   'autoMechanics',
   'vehicleDiagnostics',
   'engineRepair',
   'vehicleElectronics',
   'electricalEngineering',
   'faultDiagnostics',
   'electricalRepair',
   'electricalSafety',
   'engineering',
   'design',
   'technicalAnalysis',
   'projectManagement'
 ]) {
   if (!Number.isSafeInteger(s.character.skills[key]) ||
       s.character.skills[key] < 0) {
     s.character.skills[key] = 0;
   }
 }
s.inventory=Array.isArray(s.inventory)
  ? [...new Set(s.inventory.filter(
      id => typeof id === 'string' &&
      ['smartphone','laptop','computer','bicycle'].includes(id)
    ))]
  : [];
s.autoNeedsEnabled=s.autoNeedsEnabled===true;if(!s.employment||typeof s.employment!=='object')s.employment=null;s.speed=0;s.lastReal=Date.now();s.needs=s.needs.map(v=>Number.isFinite(v)?Math.max(0,Math.min(100,v)):100);s.needs[0]=100;s.needs[7]=100;s.criticalTriggered=Array.isArray(s.criticalTriggered)&&s.criticalTriggered.length===8?s.criticalTriggered:Array(8).fill(false);s.events=Array.isArray(s.events)?s.events.slice(0,30):[];s.loans=Array.isArray(s.loans)?s.loans:[];s.nextLoanId=Number.isSafeInteger(s.nextLoanId)?s.nextLoanId:1;s.creditScore=Number.isFinite(s.creditScore)?Math.max(0,Math.min(100,s.creditScore)):100;s.cashCents=Number.isSafeInteger(s.cashCents)&&s.cashCents>=0?s.cashCents:0;s.bankCents=Number.isSafeInteger(s.bankCents)&&s.bankCents>=0?s.bankCents:0;s.bankInterestEarnedCents=Number.isSafeInteger(s.bankInterestEarnedCents)&&s.bankInterestEarnedCents>=0?s.bankInterestEarnedCents:0;s.bankInterestRemainder=Number.isFinite(s.bankInterestRemainder)&&s.bankInterestRemainder>=0&&s.bankInterestRemainder<1?s.bankInterestRemainder:0;s.gameMs=Number.isFinite(s.gameMs)&&s.gameMs>=0?s.gameMs:0;s.snapshots=undefined;s.lastSnapshotGameMs=undefined;delete s.snapshots;delete s.lastSnapshotGameMs;
s.biography = Array.isArray(s.biography)
  ? s.biography.filter(entry =>
      entry &&
      typeof entry.id === 'string' &&
      typeof entry.text === 'string' &&
      typeof entry.date === 'string' &&
      Number.isFinite(entry.gameMs)
    )
  : [];
initializeBiography(s);
return s;}
export function validateImportedSave(text) {
  if (typeof text !== 'string' || text.length > 5_000_000) {
    throw Error('Файл слишком большой или недоступен');
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (_) {
    throw Error('Файл не содержит корректный JSON');
  }

  if (!parsed || typeof parsed !== 'object' ||
      Array.isArray(parsed) ||
      ![2, 3].includes(parsed.version) ||
      !parsed.character ||
      typeof parsed.character.name !== 'string' ||
      !parsed.character.name.trim() ||
      parsed.character.name.length > 24 ||
      !Array.isArray(parsed.needs) ||
      parsed.needs.length !== 8 ||
      !parsed.needs.every(v => Number.isFinite(v) && v >= 0 && v <= 100) ||
      !Array.isArray(parsed.tasks) ||
      !Number.isSafeInteger(parsed.cashCents) ||
      parsed.cashCents < 0 ||
      !Number.isSafeInteger(parsed.bankCents) ||
      parsed.bankCents < 0 ||
      !Number.isFinite(parsed.gameMs) ||
      parsed.gameMs < 0) {
    throw Error('Файл не соответствует формату сохранения BlackFoxia');
  }

  return normalize(structuredClone(parsed));
}

const IMPORT_BACKUP_KEY = 'life-simulator-v02-pre-import';

export function installImportedSave(imported) {
  const previous = localStorage.getItem(KEY);
  const previousBackup = localStorage.getItem(IMPORT_BACKUP_KEY);

  try {
    const json = JSON.stringify(imported);

    if (previous !== null) {
      localStorage.setItem(IMPORT_BACKUP_KEY, previous);
      if (localStorage.getItem(IMPORT_BACKUP_KEY) !== previous) {
        throw Error('Не удалось проверить резервную копию');
      }
    }
    localStorage.setItem(KEY, json);
    if (localStorage.getItem(KEY) !== json) {
      throw Error('Не удалось проверить запись');
    }
    return true;
  } catch (error) {
    try {
      if (previous === null) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, previous);
      if (previousBackup === null) {
        localStorage.removeItem(IMPORT_BACKUP_KEY);
      } else {
        localStorage.setItem(IMPORT_BACKUP_KEY, previousBackup);
      }
    } catch (rollbackError) {
      console.error('Ошибка отката сохранения:', rollbackError);
    }
    throw Error('Не удалось записать сохранение: ' + error.message);
  }
}

export function load(){try{const raw=localStorage.getItem(KEY);if(raw)return normalize(JSON.parse(raw));const old=JSON.parse(localStorage.getItem(OLD)||'null');if(old?.name){const s=newState(old.name);s.cashCents=Math.max(0,Math.round((old.balance||0)*100));s.bankCents=Math.max(0,Math.round((old.bank||0)*100));s.gameMs=Math.max(0,old.gameMs||0);return s;}}catch(e){console.warn('Сохранение повреждено:',e)}return null;}
export function save(s){
initializeBiography(s);try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch(e){console.error('Ошибка сохранения:',e);return false;}}
export function reset(){localStorage.removeItem(KEY);localStorage.removeItem(OLD);}
export function exportSave(s){const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='life-simulator-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
