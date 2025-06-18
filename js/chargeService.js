/* -------------------------------------------------
   STAIR / HEAVY ITEM / STORAGE 계산
--------------------------------------------------*/
"use strict";

/* ▷ STAIR */
function calculateStairCharge () {
  const cbm = parseInt(stairCbmDropdown.value,10);
  const floor = parseInt(stairFloorDropdown.value,10);
  const unit = basicExtraCost["STAIR CHARGE"]?.["CBM단가"]||0;

  const descElem=document.getElementById("stair-description");
  if (descElem)
    descElem.innerHTML=(basicExtraCost["STAIR CHARGE"]?.description||"").replace(/\n/g,"<br>");

  if (!isNaN(cbm)&&!isNaN(floor)) {
    stairChargeResult.textContent = `${currencySymbol}${(cbm*(floor-1)*unit).toFixed(2)}`;
  } else stairChargeResult.textContent="";
}

/* ▷ HEAVY ITEM */
function updateHeavyItemDropdown () {
  const heavy = basicExtraCost["HEAVY ITEM"];
  if (!heavy) return;

  document.getElementById("heavyitem-description").textContent = heavy.description||"";

  resetDropdown(heavyItemDropdown,"중량 화물 단위 선택");
  const unit=heavy["단위"]||"";
  for (let i=1;i<=5;i++){
    const opt=document.createElement("option"); opt.value=i; opt.textContent=`${i}${unit}`;
    heavyItemDropdown.appendChild(opt);
  }

  heavyItemDropdown.addEventListener("change", ()=>{
    const sel=parseInt(heavyItemDropdown.value,10);
    const cost=heavy["단가"]||0;
    const calc = !isNaN(sel)?`${currencySymbol}${(sel*cost).toLocaleString()}`:"";
    heavyItemValue.textContent=calc;
  });
}

/* ▷ STORAGE CHARGE */
function updatestorageperiodDropdown () {
  const store = basicExtraCost["STORAGE CHARGE"];
  if (!store||!store["보관 비용"]) return;

  const freeDays=parseInt(store["무료 보관 기간"],10)||0;
  const costObj = store["보관 비용"];
  const unit    = store["단위"]||"일";

  resetDropdown(storageperiodDropdown,`보관 기간 선택 (${unit})`);
  for (let i=1;i<=90;i++){
    const o=document.createElement("option"); o.value=i; o.textContent=`${i}${unit}`;
    storageperiodDropdown.appendChild(o);
  }
  document.getElementById("storage-description").textContent = store.description||"";

  storageperiodDropdown.addEventListener("change", ()=>{
    const selDays=parseInt(storageperiodDropdown.value,10);
    const selCBM = parseInt(dropdown.value||0,10);
    const selCont=containerDropdown.value;
    let chargeable = Math.max(selDays-freeDays,0);

    let baseCost=0;
    if (costObj[selCont]!==undefined){
      baseCost = costObj[selCont]*chargeable;
    } else if (typeof costObj["CBM 범위"]==="object") {
      for (const r in costObj["CBM 범위"]) {
        const [s,e]=r.split("-").map(Number);
        if (selCBM>=s&&selCBM<=e){ baseCost=costObj["CBM 범위"][r]*chargeable; break; }
      }
    }
    if (costObj["단가"]>0) baseCost = chargeable*costObj["단가"]*selCBM;

    storageValue.textContent = `${currencySymbol}${baseCost.toLocaleString()}`;
  });
}

/* ▼ 토글 버튼 (UI) */
document.getElementById("stairchargetitle").addEventListener("click",()=>{
  const details=document.getElementById("stair-charge-details");
  const desc   =document.getElementById("stair-description");
  const label  =document.getElementById("stair-charge-toggle");
  const hid = details.style.display==="none";
  details.style.display = hid?"block":"none";
  desc.style.display    = hid?"block":"none";
  label.textContent     = `${hid?"▼":"▶"} STAIR CHARGE OPTIONS`;
});

document.getElementById("heavyitemrow").addEventListener("click",()=>{
  const d=document.getElementById("heavyitem-details");
  const l=document.getElementById("heavyitem-toggle");
  const hid=d.style.display==="none";
  d.style.display=hid?"block":"none";
  l.textContent  = `${hid?"▼":"▶"} HEAVY ITEM CHARGE`;
});

document.getElementById("storagerow").addEventListener("click",()=>{
  const d=document.getElementById("storage-details");
  const l=document.getElementById("storage-toggle");
  const hid=d.style.display==="none";
  d.style.display=hid?"block":"none";
  l.textContent  = `${hid?"▼":"▶"} STORAGE CHARGE`;
});
