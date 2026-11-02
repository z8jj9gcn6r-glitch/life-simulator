import {BIRTH_UTC,YEAR_MS} from './constants.js';
import {formatAge} from './time-format.js';
export function createCharacter(name){return {name:name.trim().slice(0,24),birthUtc:BIRTH_UTC,stats:{strength:10,dexterity:10,endurance:10,intelligence:10,wisdom:10,knowledge:0,charisma:10,reputation:50},skills:{programming:0,english:0,sales:0,communication:0,customerService:0,algorithms:0,debugging:0,logistics:0,navigation:0,timeManagement:0,cleaning:0,precision:0,workOrganization:0,security:0,observation:0,selfDefense:0,discipline:0,cooking:0,foodPreparation:0,workSpeed:0,autoMechanics:0,vehicleDiagnostics:0,engineRepair:0,vehicleElectronics:0,electricalEngineering:0,faultDiagnostics:0,electricalRepair:0,electricalSafety:0,engineering:0,design:0,technicalAnalysis:0,projectManagement:0}}}
export function age(state){return Math.floor(state.gameMs/YEAR_MS)}
export function dateParts(state){
const birth=state.character.birthDate;
const base=typeof birth==='string' && /^\d{4}-\d{2}-\d{2}$/.test(birth)
  ? Date.parse(birth+'T00:00:00Z')
  : BIRTH_UTC;
const d=new Date(base+state.gameMs);return {date:d.toLocaleDateString('ru-RU',{timeZone:'UTC'}),weekday:d.toLocaleDateString('ru-RU',{timeZone:'UTC',weekday:'long'}),time:d.toLocaleTimeString('ru-RU',{timeZone:'UTC',hour:'2-digit',minute:'2-digit'})}}
export function ageWord(n){return n%10===1&&n%100!==11?'год':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'года':'лет'}


export function birthDateText(state) {
  const birth = state.character.birthDate;

  if (
    typeof birth === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(birth)
  ) {
    const [year, month, day] = birth.split('-');
    return `${day}.${month}.${year}`;
  }

  return new Date(BIRTH_UTC).toLocaleDateString(
    'ru-RU',
    {timeZone: 'UTC'}
  );
}
