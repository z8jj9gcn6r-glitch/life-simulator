import { YEAR_MS, formatMoney } from './constants.js';
export const REVIVE_COST_CENTS = 5_000_000;
export const RESCUE_BANK = 'BLACK FOX CAPITAL';
export const BASE_APR = 0.48;
export const LOAN_MONTHS = 120;
const MONTH_MS = YEAR_MS / 12;
const valid = n => Number.isSafeInteger(n) && n > 0;
export const getTotalMoney = s => s.cashCents + s.bankCents;
export function earn(s,n){if(!valid(n)||!Number.isSafeInteger(s.cashCents+n))return false;s.cashCents+=n;s.lifetimeEarnedCents+=n;return true;}
export function spend(s,n){if(!valid(n)||s.cashCents<n)return false;s.cashCents-=n;return true;}
export function deposit(s,n){if(!valid(n)||s.cashCents<n)return false;s.cashCents-=n;s.bankCents+=n;return true;}
export function withdraw(s,n){if(!valid(n)||s.bankCents<n)return false;s.bankCents-=n;s.cashCents+=n;return true;}
export const formatBalance = cents => formatMoney(cents)+' $';
export function creditPayment(principalCents,apr=BASE_APR,months=LOAN_MONTHS){const r=apr/12;return Math.ceil(principalCents*r/(1-Math.pow(1+r,-months)));}
function charge(s,amount){const total=getTotalMoney(s);if(total<amount)return false;const cash=Math.min(s.cashCents,amount);s.cashCents-=cash;s.bankCents-=amount-cash;return true;}
export function canBorrow(s){return !(s.loans||[]).some(l=>l.restricted);}
export function reviveCharacter(s,withCredit=false){
 if(!s?.dead)return {ok:false,message:'Персонаж жив'};
 const available=getTotalMoney(s),shortfall=Math.max(0,REVIVE_COST_CENTS-available);
 if(shortfall&&!withCredit)return {ok:false,message:'Недостаточно денег: требуется кредит'};
 if(shortfall&&!canBorrow(s))return {ok:false,message:'Банк отказал: действуют кредитные ограничения'};
 const loan=shortfall?{
  id:s.nextLoanId||1,bank:RESCUE_BANK,originalCents:shortfall,
  // Комиссия 5% капитализируется: иначе при нулевом балансе её невозможно оплатить.
  balanceCents:shortfall+Math.ceil(shortfall*0.05),apr:BASE_APR,
  paymentCents:creditPayment(shortfall+Math.ceil(shortfall*0.05)),
  paymentsLeft:LOAN_MONTHS,nextDueGameMs:s.gameMs+MONTH_MS,
  missedStreak:0,restricted:false
 }:null;
 // Commit only after all eligibility checks have passed.
 const paid=Math.min(available,REVIVE_COST_CENTS);charge(s,paid);
 if(loan){s.loans??=[];s.loans.push(loan);s.nextLoanId=(s.nextLoanId||1)+1;}
 s.needs=Array(8).fill(100);s.criticalTriggered=Array(8).fill(false);
 s.tasks=[];s.dead=false;s.deathAt=null;s.speed=0;s.lastReal=Date.now();
 s.events.unshift(loan?`Воскрешение: ${formatBalance(paid)} оплачено, кредит ${formatBalance(shortfall)}`:`Воскрешение: оплачено ${formatBalance(paid)}`);
 return {ok:true,credit:!!loan,borrowedCents:shortfall};
}
export function nextLoanEventMs(s){return Math.min(Infinity,...(s.loans||[]).map(l=>l.nextDueGameMs));}
export function processLoanPayments(s,emit){
 for(const loan of [...(s.loans||[])]){
  while(loan.nextDueGameMs<=s.gameMs+1 && loan.balanceCents>0){
   const interest=Math.ceil(loan.balanceCents*loan.apr/12);
   const due=Math.min(loan.balanceCents+interest,loan.paymentCents);
   if(charge(s,due)){
    loan.balanceCents=loan.balanceCents+interest-due;
    loan.paymentsLeft=Math.max(1,loan.paymentsLeft-1);
    loan.missedStreak=0;loan.restricted=false;
    emit(`Кредит: платёж ${formatBalance(due)} выполнен`);
   }else{
    loan.balanceCents+=interest;
    loan.missedStreak++;
    const n=loan.missedStreak;
    if(n===1)emit('BLACK FOX CAPITAL: пропущен платёж');
    if(n===2){const fine=Math.ceil(loan.originalCents*0.05);loan.balanceCents+=fine;s.creditScore=Math.max(0,(s.creditScore??100)-3);emit(`Штраф ${formatBalance(fine)}; кредитная история −3 п.п.`);}
    if(n===3){loan.restricted=true;emit('BLACK FOX CAPITAL: новые кредиты ограничены');}
    if(n===5){loan.apr+=0.02;loan.paymentCents=creditPayment(loan.balanceCents,loan.apr,Math.max(1,loan.paymentsLeft));emit('BLACK FOX CAPITAL: ставка повышена на 2 п.п.');}
   }
   loan.nextDueGameMs+=MONTH_MS;
  }
  if(loan.balanceCents<=0){s.loans=s.loans.filter(x=>x.id!==loan.id);emit('Кредит погашен');}
 }
}
export function repayEarly(s,id,amount){const loan=(s.loans||[]).find(l=>l.id===id);if(!loan||!valid(amount))return false;const payment=Math.min(amount,loan.balanceCents);if(!charge(s,payment))return false;loan.balanceCents-=payment;if(loan.balanceCents<=0)s.loans=s.loans.filter(l=>l.id!==id);else loan.paymentCents=creditPayment(loan.balanceCents,loan.apr,Math.max(1,loan.paymentsLeft));return true;}
