import {YEAR_MS,clamp} from './constants.js';
import {earn,spend} from './economy.js';
import {applyTaskEffects,changeNeeds} from './needs.js';
// Effects are applied proportionally across action progress, never multiplied by speed twice.
export const DEFINITIONS={work:{title:'Работа: Программист',duration:8*3600000,effects:{1:-15,6:-5},rewardCents:12000,lock:'awake',compatible:['course']},course:{title:'Онлайн-курс: Английский язык',duration:4*3600000,effects:{1:-10,6:3},rewardCents:0,lock:'study',compatible:['work']},sleep:{title:'Сон',duration:8*3600000,effects:{1:55,2:-8,3:-10},rewardCents:0,lock:'sleep',compatible:[]},training:{title:'Тренировка',duration:2*3600000,effects:{1:-12,6:8},rewardCents:0,lock:'training',compatible:[]}};
export function canStart(state,key){if(state.dead)return 'Персонаж погиб';const def=DEFINITIONS[key];if(!def)return 'Неизвестное действие';if(state.tasks.some(t=>t.key===key))return 'Действие уже выполняется';for(const t of state.tasks){const other=DEFINITIONS[t.key];if(!def.compatible.includes(t.key)||!other.compatible.includes(key))return 'Действия несовместимы'}return null}
export function startAction(state,key){const error=canStart(state,key);if(error)return error;const d=DEFINITIONS[key];state.tasks.push({id:state.nextTaskId++,key,title:d.title,duration:d.duration,progress:0,effects:d.effects,rewardCents:d.rewardCents});return null}
export function advanceTasks(state,gameDelta,emit,affectNeeds=true){for(const t of [...state.tasks]){const step=Math.min(gameDelta,t.duration-t.progress);t.progress+=step;if(affectNeeds)applyTaskEffects(state,t,step/t.duration);if(t.progress>=t.duration-0.01){state.tasks=state.tasks.filter(x=>x.id!==t.id);if(t.rewardCents)earn(state,t.rewardCents);if(t.key==='course')state.character.skills.english++;if(t.key==='work')state.character.skills.programming++;emit(t.title+' завершено'+(t.rewardCents?' · +'+t.rewardCents/100+' $':''))}}}
export function cancelAction(state,id){const t=state.tasks.find(t=>t.id===id);if(!t)return false;state.tasks=state.tasks.filter(t=>t.id!==id);return true}
export function instantAction(state,key){
  if(state.dead)return 'Персонаж погиб';

  const options={
    eat:{cost:700,effects:{2:25,3:-3},message:'Вы поели'},
    shower:{cost:500,effects:{4:45,3:-6},message:'Душ принят'},
    toilet:{cost:300,effects:{3:40},message:'Вы сходили в туалет'},
    social:{cost:200,effects:{5:30,6:5},message:'Вы пообщались'},
    treatment:{cost:3500,effects:{0:30},message:'Лечение завершено'},
    entertainment:{cost:2500,effects:{7:25},message:'Вы развлеклись'}
  };

  const action=options[key];
  if(!action)return 'Действие недоступно';
  if(!spend(state,action.cost))return 'Недостаточно денег';

  changeNeeds(state,action.effects);
  return action.message+' · −'+action.cost/100+' $';
}

