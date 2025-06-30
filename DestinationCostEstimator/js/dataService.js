/* -------------------------------------------------
   데이터 Fetch & 최초 초기화
--------------------------------------------------*/
"use strict";

/* ▷ mappage/{Region}.json 조회하여 주소/파트너명 매핑 */
async function fetchMapInfo (fullPath) {
  const parts = fullPath.split("/");
  if (parts.length < 2) return null;

  const regionFolder = parts[1];
  const mapJsonUrl   = `https://arrrbang.github.io/CostCalculator/DestinationCostEstimator/mappage/${regionFolder}.json`;

  try {
    const res = await fetch(mapJsonUrl);
    if (!res.ok) throw new Error("Map JSON fetch failed");
    const mapData = await res.json();

    for (const item of mapData) {
      if (!Array.isArray(item.links)) continue;
      const matched = item.links.find(link => link.path === fullPath);
      if (matched) {
        return { name: item.name || "", partner: matched.type || "" };
      }
    }
  } catch (e) {
    console.error("❌ mappage fetch error:", e);
  }
  return null;
}

/* ▷ 추가 정보(요약·포함·불포함) 출력 */
function fillBasicDeliverySummary (extraCostData) {
  const box = document.getElementById("basic-delivery-summary");
  if (!box) return;

  let idx=1, html="";
  const list = Array.isArray(extraCostData["additional-info"])
      ? extraCostData["additional-info"]
      : (()=>{ const tmp=[]; while (extraCostData[`additional-info-${idx}`]) { tmp.push(extraCostData[`additional-info-${idx}`]); idx++; } return tmp; })();

  list.forEach(({name="",description=""})=>{
    html+=`<li style="margin-bottom:6px;"><strong>${name}</strong><br>${description.replace(/\n/g,"<br>")}</li>`;
  });
  box.innerHTML=`<ul style="padding-left:18px;margin:0;">${html}</ul>`;
}

/* ▷ 포함/불포함 리스트 */
function renderInfoList (data, targetId) {
  const box = document.getElementById(targetId);
  if (!box) return;
  if (!data) { box.innerHTML=""; return; }

  const items = Array.isArray(data) ? data : [data];
   box.innerHTML = items.filter(Boolean).map(({name="",description=""})=>{
     const nameHtml = name.replace(/\\n|\n/g, "<br>");
     let descHtml = description.replace(/\\n|\n/g, "<br>");
     if (descHtml.includes("\\li")) {
       descHtml = `<ul style="margin:0 0 0 16px;">${descHtml.replace(/\\li/g,"<li>").replace(/\\\/li/g,"</li>")}</ul>`;
     }
     return `<div class="info-item"><p class="tit">• ${nameHtml}</p><p class="desc">${descHtml}</p></div>`;
   }).join("");
}

/* ▷ POE 드롭다운 로드 */
async function initializePoeDropdown (path) {
  try {
    const response = await fetch(`${path}/poedropdown.json`);
    if (!response.ok) return;
    const poeOptions = await response.json();
    if (!Array.isArray(poeOptions)) throw new TypeError("POE dropdown JSON 형식 오류");

    resetDropdown(poeDropdown, "-- POE 선택 --");
    poeOptions.forEach(opt=>{
      const o=document.createElement("option");
      o.value=opt.value; o.textContent=opt.label;
      poeDropdown.appendChild(o);
    });
    poeDropdown.addEventListener("change", handlePoeChange);
  } catch(e){ console.error(e); }
}

/* ▷ POE 변경 시 */
function handlePoeChange () {
  if (poeDropdown.value) {
    fetchData().then(()=>{
      // 🔔 basic cost 섹션 다시 생성하도록 강제 트리거
      document.dispatchEvent(new Event("basicCostReady"));

      updateAllDiplomatSensitiveResults();
      const stairDescElem = document.getElementById("stair-description");
      if (stairDescElem) {
        stairDescElem.innerHTML = (basicExtraCost["STAIR CHARGE"]?.description||"").replace(/\n/g,"<br>");
      }
    });
  }
}

/* ▷ tariff/extracost JSON 로드 및 전역 세팅 */
async function fetchData () {
  try {
    const path = getPathFromURL();
    const poe  = poeDropdown.value;
    if (!path || !poe) return;

    const basePath       = "https://arrrbang.github.io/CostCalculator/DestinationCostEstimator";
    const tariffURL      = `${basePath}/${path}/poeis${poe}_tariff.json`;
    const modifiedPath   = path.replace(/\/[^/]+\/?$/,"");
    const extraCostURL   = `${basePath}/${modifiedPath}/poeis${poe}_extracost.json`;

    const [tariffRes, extraRes] = await Promise.all([fetch(tariffURL), fetch(extraCostURL)]);
    if (!tariffRes.ok || !extraRes.ok) return;

    const tariffData    = await tariffRes.json();
    const extraCostData = await extraRes.json();

    currencySymbol    = extraCostData["화폐단위"] || "";
    basicExtraCost    = extraCostData;
    window.basicExtraCost = extraCostData;
    window.ofcOrigin = extraCostData.ofc?.notion_OFC || "";
    document.dispatchEvent(new Event("basicCostReady"));

    dataNonDiplomat   = tariffData.nonDiplomat || {};
    dataDiplomat      = tariffData.diplomat    || {};
    containerTypes    = tariffData.containerType || [];

    // 링크
   if (Array.isArray(extraCostData.links) && extraCostData.links.length) {
     updateLinks(extraCostData.links);
   } else {
     initializeLinks();
   }

    // CBM/컨테이너 드롭다운 갱신
    updateCbmDropdown(dropdown, parseInt(dropdown.value,10)||null);
    updateContainerDropdown(containerTypes, containerDropdown, containerDropdown.value);
    updateStairChargeDropdown();
    updateHeavyItemDropdown();
    updatestorageperiodDropdown();
    calculateTotalCost();

  } catch(e){ console.error(e); }
}

/* ▷ 페이지 중간에 호출되는 main 업데이트 */
async function updateAllInfo () {
  const path = getPathFromURL();
  const poe  = poeDropdown.value;
  if (!path || !poe) return;

  const mapInfo = await fetchMapInfo(path);
  if (mapInfo) {
    document.getElementById("delivery-address-result").innerText = mapInfo.name;
    document.getElementById("partner-result").innerText          = mapInfo.partner;
  }

  const basePath     = "https://arrrbang.github.io/CostCalculator/DestinationCostEstimator";
  const tariffURL    = `${basePath}/${path}/poeis${poe}_tariff.json`;
  const extraCostURL = `${basePath}/${path.replace(/\/[^/]+\/?$/,"")}/poeis${poe}_extracost.json`;

  // tariff
  try { await fetch(tariffURL); } catch(e){ console.error("Tariff fetch error:",e); }

  // extracost
  try {
    const res = await fetch(extraCostURL);
    if (!res.ok) throw new Error();
    const extraData = await res.json();
    window.extraCostData = extraData;

    fillBasicDeliverySummary(extraData);
    renderPodTT(extraData.ofc);

    const baseBox = document.getElementById("data-description");
    if (baseBox && extraData["DATA BASE"]?.description) {
      baseBox.innerText = extraData["DATA BASE"].description;
    }
    renderInfoList(extraData["includedInfo"], "includedInfo");
    renderInfoList(extraData["excludedInfo"], "excludedInfo");
  } catch(e){ console.error("❌ ExtraCost fetch error:", e); }
}
