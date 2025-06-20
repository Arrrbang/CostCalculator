"use strict";

/* -------------------------------
   1.  USD→KRW 실시간 환율 가져오기
--------------------------------*/
let usdKrwRate = 1300;        // 예비값
async function refreshRate(){
  try{
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/KRW");
    const j = await res.json();
    usdKrwRate = j.rates.USD || usdKrwRate;           // KRW 기준
  }catch(e){
    console.error("환율 API 오류:", e);
  }
}
refreshRate();               // 최초 1회
setInterval(refreshRate, 60*60*1000); // 1시간마다 갱신

/* -------------------------------
   2.  총 합계(KRW) 계산 함수
      (국내·도착지 계산이 끝난 뒤 호출)
--------------------------------*/
function updateConsoleTotal(){
  const usdTxt = document.getElementById("arrival-cost").textContent;
  const krwTxt = document.getElementById("domestic-cost").innerHTML.split("<br>")[1];

  const usdVal = parseFloat(usdTxt.replace(/[^\d.]/g,"")) || 0;
  const krwVal = parseFloat(krwTxt.replace(/[^\d.]/g,"")) || 0;

  const total = Math.round(krwVal + usdVal * usdKrwRate);
  document.getElementById("console-total-krw").textContent = total.toLocaleString();
}

function updatePumexTotal(){
  const usdTxt = document.getElementById("pumex-arrival-cost").textContent;
  const krwTxt = document.getElementById("pumex-domestic-cost").innerHTML.split("<br>")[1];

  const usdVal = parseFloat(usdTxt.replace(/[^\d.]/g,"")) || 0;
  const krwVal = parseFloat(krwTxt.replace(/[^\d.]/g,"")) || 0;

  const total = Math.round(krwVal + usdVal * usdKrwRate);
  document.getElementById("pumex-total-krw").textContent = total.toLocaleString();
}

/* -------------------------------
   3.  기존 계산 함수 끝에 총합 계산 호출
      (updateDomesticDesc / updateArrivalDesc 등 내부 마지막 줄에 추가)
--------------------------------*/
function recalcAll(){
  updateDomesticDesc();
  updateArrivalDesc();
  updateConsoleTotal();

  updatePumexDomesticDesc();
  updatePumexArrivalDesc();
  updatePumexTotal();
}

/* -------------------------------
   4.  이벤트 트리거용 공통 루프
--------------------------------*/
[
  poeSel, partnerSel, consoleSel,
  rate40hcInput, cbmRateInput,
  totalCbmInput, consoleCbmInput
].filter(Boolean).forEach(el=>{
  el.addEventListener("change", recalcAll);
  el.addEventListener("input",  recalcAll);
});
