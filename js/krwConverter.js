/* -------------------------------------------------
   총액 → KRW 변환
--------------------------------------------------*/
"use strict";

async function updateKrwValueWithAPI () {
  const krwValEl=document.getElementById("krw-value");
  if (!krwValEl||!totalCostElement) return;

  const totalTxt=totalCostElement.textContent||"";
  const foreignVal=parseFloat(totalTxt.replace(/[\¥$€₩,]|C\$/g,"").replace(/[^0-9.-]+/g,""));
  if (isNaN(foreignVal)) { krwValEl.textContent="-"; return; }

  const symbol = totalTxt.match(/[\¥$€₩£]|[A-Za-z]{3}/);
  if (!symbol){ krwValEl.textContent="-"; return; }

  try{
    const res=await fetch("https://api.exchangerate-api.com/v4/latest/KRW");
    if (!res.ok) throw new Error();
    const data=await res.json();

    const rates={ "$":"USD","€":"EUR","₩":"KRW","£":"GBP","¥":"JPY","C$":"CAD" };
    const key=rates[symbol[0]]||symbol[0];
    const rate=data.rates[key];
    if (!rate) throw new Error("rate miss");

    const krw = foreignVal/rate;
    krwValEl.textContent = Math.floor(krw).toLocaleString();
  }catch(e){
    console.error(e);
    krwValEl.textContent="환율 오류";
  }
}
