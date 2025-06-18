/* -------------------------------------------------
   드롭다운 & 링크 및 기타 UI
--------------------------------------------------*/
"use strict";

/* ▷ CBM 드롭다운 */
function updateCbmDropdown (el, selected) {
  resetDropdown(el, "-- CBM 선택 --");
  for (let i=1;i<=60;i++){
    const opt=document.createElement("option"); opt.value=i; opt.textContent=i;
    el.appendChild(opt);
  }
  el.value = (selected>=1 && selected<=60) ? selected : "";
  el.dispatchEvent(new Event("change"));
}

/* ▷ 컨테이너 타입 */
function updateContainerDropdown (types, el, selected) {
  resetDropdown(el,"-- CONTANIER TYPE 선택 --");
  types.forEach(t=>{
    const o=document.createElement("option"); o.value=t; o.textContent=t;
    el.appendChild(o);
  });
  el.value = types.includes(selected)?selected:"";
}

/* ▷ STAIR CHARGE용 드롭다운 */
function updateStairChargeDropdown () {
  resetDropdown(stairCbmDropdown,"이동 CBM 선택");
  const selectedCBM = parseInt(dropdown.value,10);
  if (!isNaN(selectedCBM)&&selectedCBM>0) {
    for (let i=1;i<=selectedCBM;i++){
      const opt=document.createElement("option"); opt.value=i; opt.textContent=i;
      stairCbmDropdown.appendChild(opt);
    }
  }
  resetDropdown(stairFloorDropdown,"이동 층 선택");
  for (let i=2;i<=10;i++){
    const opt=document.createElement("option"); opt.value=i; opt.textContent=`${i}층`;
    stairFloorDropdown.appendChild(opt);
  }
}

/* ▷ HEAVY ITEM, STORAGE CHARGE 드롭다운은 chargeService.js에서 */
