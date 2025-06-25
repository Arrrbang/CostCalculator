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
  poeDropdown.addEventListener("change", () => {
    fetchData().then(() => {
      updateAllInfo();          // ← 추가
      updateAllCosts();         // ← 기존
    });
  });

  dropdown.addEventListener("change", () => {
    updateAllInfo();            // CBM 바뀌어도 다시 채움(선택)
    updateAllCosts();
    updateStairChargeDropdown();
  });

  containerDropdown.addEventListener("change", () => {
    updateAllInfo();            // 컨테이너 바뀔 때도 필요
    updateAllCosts();
    toggleConsoleNote();
  });

  [nonDiplomat, diplomat].forEach(chk => {
    chk.addEventListener("change", () => {
      if (chk === nonDiplomat && chk.checked) diplomat.checked = false;
      if (chk === diplomat && chk.checked)    nonDiplomat.checked = false;
      updateAllInfo();          // diplomat 구분이 바뀌면 설명도 달라질 수 있음
      updateAllCosts();
    });
  });

  stairCbmDropdown  .addEventListener("change", calculateStairCharge);
  stairFloorDropdown.addEventListener("change", calculateStairCharge);

  // TOTAL → KRW 변환 모니터링
  const obs = new MutationObserver(updateKrwValueWithAPI);
  if (totalCostElement) obs.observe(totalCostElement, { childList: true });
});
