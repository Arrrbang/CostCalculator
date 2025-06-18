/* -------------------------------------------------
   POD 별 평균 OFC 백엔드 호출
--------------------------------------------------*/
"use strict";

async function updateOfcValue () {
  const poe = poeDropdown.value;
  const containerType = containerDropdown.value;
  const selectedCbm   = parseInt(dropdown.value,10);

  if (!poe || !containerType || isNaN(selectedCbm)) {
    ofcValueElement.textContent="";
    return;
  }

  try {
    const res = await fetch(notionBackendURL);
    if (!res.ok) throw new Error(res.status);
    const notionData = await res.json();

    const matched = notionData.data.find(item=>item.name.toLowerCase()===poe.toLowerCase());
    if (!matched) { ofcValueElement.textContent=""; return; }

    // CONSOLE 처리
    if (containerType==="CONSOLE") {
      const val40 = matched.value40HC;
      if (!isNaN(val40)) {
        const consoleVal = (val40/50)*selectedCbm;
        ofcValueElement.textContent = `$${Number(consoleVal).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
      }
      return;
    }

    let value = matched[`value${containerType}`];
    if (!isNaN(value))
      value = `$${Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`;

    ofcValueElement.textContent = value ?? "";
  } catch(e){
    console.error("OFC fetch err:",e);
    ofcValueElement.textContent="오류 발생";
  }
}
