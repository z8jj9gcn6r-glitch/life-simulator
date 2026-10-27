import {createCharacter} from './character.js';

const KEY='life-simulator-v02';
const OLD='life-sim-v01';

export function newState(name,now=Date.now()){
  return {
    version:2,
    character:createCharacter(name),
    cashCents:30000,
    bankCents:0,
    lifetimeEarnedCents:0,
    gameMs:0,
    speed:1,
    lastReal:now,
    needs:Array(8).fill(100),
    criticalTriggered:Array(8).fill(false),
    auto:Array(8).fill(false),
    tasks:[],
    nextTaskId:1,
    lifeLimitYears:100,
    autoLife:false,
    dead:false,
    deathAt:null,
    events:[],
    snapshots:[],
    lastSnapshotGameMs:0
  };
}

export function load(){
  try{
    const raw=localStorage.getItem(KEY);

    if(raw){
      const s=JSON.parse(raw);

      if(
        s.version!==2||
        !s.character||
        !Array.isArray(s.needs)||
        s.needs.length!==8||
        !Array.isArray(s.tasks)
      ){
        throw Error('Некорректное сохранение');
      }

      return s;
    }

    const old=JSON.parse(
      localStorage.getItem(OLD)||'null'
    );

    if(old?.name){
      const s=newState(old.name);

      s.cashCents=Math.round((old.balance||0)*100);
      s.bankCents=Math.round((old.bank||0)*100);
      s.gameMs=old.gameMs||0;
      s.speed=old.speed||0;
      s.needs=old.needs||s.needs;
      s.auto=old.auto||s.auto;

      if(old.task){
        s.events.push(
          'Действие из v0.1 не перенесено: формат несовместим'
        );
      }

      return s;
    }
  }catch(e){
    console.warn('Сохранение не загружено:',e);
  }

  return null;
}

export function save(s){
  try{
    localStorage.setItem(KEY,JSON.stringify(s));
    return true;
  }catch(e){
    console.error('Ошибка сохранения:',e);
    return false;
  }
}

export function reset(){
  localStorage.removeItem(KEY);
  localStorage.removeItem(OLD);
}

export function exportSave(s){
  const blob=new Blob(
    [JSON.stringify(s,null,2)],
    {type:'application/json'}
  );

  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');

  a.href=url;
  a.download='life-simulator-save.json';
  a.click();

  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
