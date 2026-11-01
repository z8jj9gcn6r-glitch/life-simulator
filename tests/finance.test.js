import test from 'node:test';
import assert from 'node:assert/strict';
import {newState} from '../js/storage.js';
import {reviveCharacter,processLoanPayments,REVIVE_COST_CENTS} from '../js/economy.js';
import {YEAR_MS} from '../js/constants.js';
function dead(cash=0){const s=newState('Тест');s.dead=true;s.cashCents=cash;return s;}
test('воскрешение за наличные',()=>{const s=dead(6_000_000);assert.equal(reviveCharacter(s).ok,true);assert.equal(s.cashCents,1_000_000);assert.equal(s.speed,0);assert.equal(s.dead,false);assert.equal(s.needs.every(x=>x===100),true);assert.equal(reviveCharacter(s).ok,false);});
test('воскрешение в кредит без денег',()=>{const s=dead();assert.equal(reviveCharacter(s,true).ok,true);assert.equal(s.loans.length,1);assert.equal(s.loans[0].originalCents,REVIVE_COST_CENTS);assert.equal(s.loans[0].apr,.48);});
test('пропуски подряд и сброс при оплате',()=>{const s=dead();reviveCharacter(s,true);const l=s.loans[0],emit=()=>{};for(let i=1;i<=2;i++){s.gameMs=i*YEAR_MS/12;processLoanPayments(s,emit);}assert.equal(l.missedStreak,2);assert.equal(s.creditScore,97);const fine=Math.ceil(l.originalCents*.05);assert(l.balanceCents>=l.originalCents+fine);s.cashCents=2_000_000;s.gameMs=3*YEAR_MS/12;processLoanPayments(s,emit);assert.equal(l.missedStreak,0);assert.equal(s.creditScore,97);s.cashCents=0;for(let i=4;i<=8;i++){s.gameMs=i*YEAR_MS/12;processLoanPayments(s,emit);}assert.equal(l.missedStreak,5);assert.equal(l.apr,.50);assert.equal(l.restricted,true);});
test('кредит не застревает после 120 просрочек',()=>{const s=dead();reviveCharacter(s,true);s.gameMs=121*YEAR_MS/12;processLoanPayments(s,()=>{});assert(s.loans[0].nextDueGameMs>s.gameMs);assert(s.loans[0].missedStreak>=120);});
