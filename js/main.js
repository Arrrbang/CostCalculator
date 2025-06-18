/* -------------------------------------------------
   진입점 & 이벤트 바인딩
--------------------------------------------------*/
"use strict";

document.addEventListener("DOMContentLoaded", async ()=>{
  initializeLinks();
  toggleConsoleNote();

  const path=getPathFromURL();
  if (path) {
    await initializePoeDropdown(path);
    await fetchData();
     await updateAllInfo();
    updateAllCosts();
    updateHeavyItemDropdown();
  }

  // ▼ 이벤트 --------------------------
  poeDropdown     .addEventListener("change", ()=>{ fetchData().then(updateAllCosts); });
  dropdown        .addEventListener("change", ()=>{ updateAllCosts(); updateStairChargeDropdown(); });
  containerDropdown.addEventListener("change", ()=>{ updateAllCosts(); toggleConsoleNote(); });

  [nonDiplomat, diplomat].forEach(chk=>{
    chk.addEventListener("change", ()=>{
      if (chk===nonDiplomat && chk.checked) diplomat.checked=false;
      if (chk===diplomat    && chk.checked) nonDiplomat.checked=false;
      updateAllCosts();
    });
  });

  stairCbmDropdown   .addEventListener("change", calculateStairCharge);
  stairFloorDropdown .addEventListener("change", calculateStairCharge);

  // TOTAL → KRW 변환 모니터링
  const obs=new MutationObserver(updateKrwValueWithAPI);
  if (totalCostElement) obs.observe(totalCostElement,{childList:true});
});

/* TOTAL 변화 초기 반영 */
document.addEventListener("basicCostReady", ()=>{ updateAllCosts(); });
