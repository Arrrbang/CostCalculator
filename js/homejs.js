  // -----------------------로그인 검증 및 검증 실패시 로그인 페이지 이동------------------------------

function redirectToLogin(message) {
  alert(message);
  localStorage.removeItem('token'); 
  window.location.href = 'index.html'; 
}

function verifyToken() {
  const token = localStorage.getItem('token'); 
  if (!token) {
    redirectToLogin('로그인이 해제되었습니다. 다시 로그인해주세요.');
    return;
  }

  fetch('https://backend-beta-lemon.vercel.app/verifyToken', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        redirectToLogin('로그인이 해제되었습니다. 다시 로그인해주세요.');
      }
    })
    .catch(() => {
      redirectToLogin('Error verifying token. Redirecting to login page.');
    });
}


    verifyToken();
//-------------------------------------------------------------------------------------------------    
let currencySymbol = ""; // 화폐 단위를 저장할 변수
let dataNonDiplomat = {};
let dataDiplomat = {};
let containerTypes = [];
let basicExtraCost = {};
let heavyItemData = {};

const dropdown = document.getElementById("cbm-dropdown");
const containerDropdown = document.getElementById("container-dropdown");
const result = document.getElementById("basic-delivery-value");
const nonDiplomat = document.getElementById("non-diplomat");
const diplomat = document.getElementById("diplomat");
const stairCbmDropdown = document.getElementById("staircbm");
const stairFloorDropdown = document.getElementById("stairfloor");
const stairChargeResult = document.getElementById("stair-charge");
const heavyItemDropdown = document.getElementById("heavyitemunit");
const heavyItemValue = document.getElementById("heavyitem-value");
const storageperiodDropdown = document.getElementById("storageperiod");
const storageValue = document.getElementById("storage-value");
const totalCostElement = document.getElementById("total-value");
const poeDropdown = document.getElementById("poe-dropdown");
const link1Element = document.getElementById("link1");
const link2Element = document.getElementById("link2");
const notionBackendURL = 'https://notion-backend-liard.vercel.app/notion';
const ofcValueElement = document.getElementById('average-ofc-value');



//---------------------------------------------------------------------------------
function getPathFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('path'); // 'path' 파라미터의 값을 반환
}


async function fetchMapInfo(fullPath) {
  const parts = fullPath.split("/");
  if (parts.length < 2) return null;

  const regionFolder = parts[1]; // 예: "WestAsia"
  const mapJsonUrl = `https://arrrbang.github.io/CostCalculator/mappage/${regionFolder}.json`;

  try {
    const res = await fetch(mapJsonUrl);
    if (!res.ok) throw new Error("Map JSON fetch failed");
    const mapData = await res.json();

    for (const item of mapData) {
      if (!Array.isArray(item.links)) continue;
      const matched = item.links.find(link => link.path === fullPath);
      if (matched) {
        return {
          name: item.name || "",
          partner: matched.type || ""
        };
      }
    }
  } catch (err) {
    console.error("❌ mappage fetch error:", err);
  }

  return null;
}

    //additional info 가져오기
    function fillBasicDeliverySummary(extraCostData) {
      const summaryDiv = document.getElementById("basic-delivery-summary");
      if (!summaryDiv) return;
    
      let idx = 1;
      let html = "";                       // <li> 들을 모을 문자열
    
      while (extraCostData[`additional-info-${idx}`]) {
        const info = extraCostData[`additional-info-${idx}`];
        const name = info.name || "";
        const desc = (info.description || "").replace(/\n/g, "<br>");
    
        // ▸ 이름만 진하게, 설명은 일반 텍스트
        html += `
          <li style="margin-bottom:6px;">
            <strong>${name}</strong><br>
            <span>${desc}</span>
          </li>`;
        idx++;
      }
    
      // 최종 삽입 (ul 리스트로 감싸기)
      summaryDiv.innerHTML = `<ul style="padding-left:18px; margin:0;">${html}</ul>`;
    }
  //포함&불포함 비용 리스트 가져오기기
  function renderInfoList(data, targetId) {
    const box = document.getElementById(targetId);
    if (!box) return;
  
    const items = Array.isArray(data) ? data : [data];
  
    const html = items.map(({ name = "", description = "" }) => {
      let descHtml = description.replace(/\n/g, "<br>");
      if (descHtml.includes("\\li")) {
        descHtml = `<ul style="margin:0 0 0 16px;">${descHtml
          .replace(/\\li/g, "<li>")
          .replace(/\\\/li/g, "</li>")}</ul>`;
      }
  
      return `
        <div class="info-item">
          <p class="tit">• ${name}</p>
          <p class="desc">${descHtml}</p>
        </div>`;
    }).join("");
  
    box.innerHTML = html;
  }
  
// 🔹 메인 업데이트 함수
async function updateAllInfo() {
  const path = getPathFromURL();
  const poeValue = poeDropdown.value;

  if (!path || !poeValue) {
    console.error('No path or POE value found');
    return;
  }

  // 🔸 mappage에서 name 및 type 가져와서 DOM에 반영
  const mapInfo = await fetchMapInfo(path);
  if (mapInfo) {
    document.getElementById("delivery-address-result").innerText = mapInfo.name;
    document.getElementById("partner-result").innerText = mapInfo.partner;
  } else {
    console.warn("📭 No matching mappage entry found for path:", path);
  }
    const basePath = "https://arrrbang.github.io/CostCalculator";
    const tableJsonPath = `${basePath}/${path}/poeis${poeValue}_tariff.json`;
    const modifiedPath = path.replace(/\/[^/]+\/?$/, "");
    const extraCostJsonPath = `${basePath}/${modifiedPath}/poeis${poeValue}_extracost.json`;

  // 👉 1. tariff.json 처리
  try {
    const tariffRes = await fetch(tableJsonPath);
    if (!tariffRes.ok) throw new Error("Failed to fetch tariff JSON");
    const tariffData = await tariffRes.json();

  } catch (err) {
    console.error("❌ Tariff fetch error:", err);
  }

  // 👉 2. extracost.json 처리
  try {
    const extraRes = await fetch(extraCostJsonPath);
    if (!extraRes.ok) throw new Error("Failed to fetch extraCost JSON");
    const extraCostData = await extraRes.json();
    window.extraCostData = extraCostData;
    fillBasicDeliverySummary(extraCostData);
  
    // DATA BASE는 기존 방식 유지
    const baseBox = document.getElementById("data-description");
    const baseInfo = extraCostData["DATA BASE"];
    if (baseBox && baseInfo?.description) {
      baseBox.innerText = baseInfo.description;
    }
  
    // 포함/불포함 항목 렌더링
    renderInfoList(extraCostData["includedInfo"], "includedInfo");
    renderInfoList(extraCostData["excludedInfo"], "excludedInfo");
  
  } catch (err) {
    console.error("❌ ExtraCost fetch error:", err);
  }
}

// POE 드롭다운 값이 변경될 때마다 실행
poeDropdown.addEventListener("change", updateAllInfo);

//-----------------------------------------------------------------------------------------
// resetDropdown 함수 변경
function resetDropdown(dropdownElement, placeholder = "-- CBM 선택 --") {
  if (!dropdownElement) {
    return; // 잘못된 호출 무시
  }
  dropdownElement.innerHTML = `<option value="">${placeholder}</option>`;
}

// 링크 초기화
function initializeLinks() {
  link1Element.textContent = "POE를 선택하세요.";
  link1Element.onclick = null;
  link1Element.classList.add("disabled-link");

  link2Element.onclick = null;
  link2Element.classList.add("disabled-link");
}

function updateLinks(links) {
  if (!Array.isArray(links) || links.length < 2) {
    initializeLinks();
    return;
  }

  // 링크 1
  if (links[0]?.url) {
    link1Element.textContent = "노션으로 이동하여 상세운임 조회";
    link1Element.classList.remove("disabled-link");
    link1Element.onclick = () => window.open(links[0].url, "_blank");
  } else {
    link1Element.textContent = "업무팀에 별도 문의";
    link1Element.onclick = null;
    link1Element.classList.add("disabled-link");
  }

  // 링크 2
  if (links[1]?.url) {
    link2Element.classList.remove("disabled-link");
    link2Element.onclick = () => window.open(links[1].url, "_blank");
  } else {
    link2Element.onclick = null;
    link2Element.classList.add("disabled-link");
  }
}



async function initializePoeDropdown(path) {
  try {
    const poeDropdownPath = `${path}/poedropdown.json`;

    const response = await fetch(poeDropdownPath);

    if (!response.ok) {
      return;
    }

    const poeOptions = await response.json();

    if (!Array.isArray(poeOptions)) {
      throw new TypeError("POE dropdown data is not an array. Check JSON format.");
    }

    resetDropdown(poeDropdown, "-- POE 선택 --");

    poeOptions.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      poeDropdown.appendChild(opt);
    });

    poeDropdown.addEventListener("change", handlePoeChange);
    } catch {
  }
}

function handlePoeChange() {
  const poeValue = poeDropdown.value;

  if (poeValue) {
    fetchData().then(() => {
      // 기본값 설정 후 업데이트 호출
      updateAllDiplomatSensitiveResults(); // 추가 비용 업데이트

      const stairDescription = basicExtraCost["STAIR CHARGE"]?.description || "";
      const stairDescriptionElement = document.getElementById("stair-description");

      if (stairDescriptionElement) {
        stairDescriptionElement.innerHTML = stairDescription.replace(/\n/g, "<br>"); // \n을 <br>로 변환
      }
    });
  }
}

async function fetchData() {
  try {
    const params = new URLSearchParams(window.location.search);
    const path = params.get("path");
    if (!path) {
      console.error("Path parameter missing for fetchData");
      return;
    }

    const poeValue = poeDropdown.value;
    if (!poeValue) {
      return;
    }


    const basePath = "https://arrrbang.github.io/CostCalculator";
    const tableJsonPath = `${basePath}/${path}/poeis${poeValue}_tariff.json`;
    const modifiedPath = path.replace(/\/[^/]+\/?$/, "");
    const extraCostJsonPath = `${basePath}/${modifiedPath}/poeis${poeValue}_extracost.json`;

    // JSON 데이터 가져오기
    const [tableResponse, extraCostResponse] = await Promise.all([
      fetch(tableJsonPath),
      fetch(extraCostJsonPath),
    ]);

    if (!tableResponse.ok || !extraCostResponse.ok) {
      return;
    }

    // JSON 데이터 파싱
    const tableData = await tableResponse.json();
    const extraCostData = await extraCostResponse.json();

    // 화폐 단위 저장
    currencySymbol = extraCostData["화폐단위"] || "";


    // 링크 업데이트
    if (Array.isArray(tableData.links) && tableData.links.length > 0) {
      updateLinks(tableData.links);
    } else if (Array.isArray(extraCostData.links) && extraCostData.links.length > 0) {
      updateLinks(extraCostData.links);
    } else {
      initializeLinks(); // 기본 링크 초기화
    }

    // 데이터 업데이트
    basicExtraCost = extraCostData;
    window.basicExtraCost = extraCostData;   // 🔹 전역(window)에 복사
    document.dispatchEvent(new Event("basicCostReady")); // 🔹 데이터 준비 알림
    dataNonDiplomat = tableData.nonDiplomat || {};
    dataDiplomat = tableData.diplomat || {};
    containerTypes = tableData.containerType || [];

    // 기타 드롭다운 및 값 업데이트
    const currentCbmValue = parseInt(dropdown?.value, 10) || null;  // 1부터 60까지의 값을 사용
    const currentContainerValue = containerDropdown?.value || null;

    // CBM 드롭다운 및 기타 드롭다운 업데이트
    if (dropdown) {
      updateCbmDropdown(dropdown, currentCbmValue);
    }
    if (containerDropdown) {
      updateContainerDropdown(containerTypes, containerDropdown, currentContainerValue);
    }
    updateStairChargeDropdown();
    updateHeavyItemDropdown();
    updatestorageperiodDropdown();
    calculateTotalCost();
    

    const stairDescription = basicExtraCost["STAIR CHARGE"]?.description || "";
    const stairDescriptionElement = document.getElementById("stair-description");
    if (stairDescriptionElement) {
      stairDescriptionElement.innerHTML = stairDescription.replace(/\n/g, "<br>"); // \n을 <br>로 변환하여 HTML 적용
    }
    updateHeavyItemDropdown(); // HEAVY ITEM 드롭다운 업데이트
  } catch (error) {
  }
}


// DOMContentLoaded 이벤트 리스너
document.addEventListener("DOMContentLoaded", async () => {
  initializeLinks();

  const params = new URLSearchParams(window.location.search);
  const path = params.get("path");

  if (path) {
    await initializePoeDropdown(path);
    fetchData().then(() => {
      updateAllDiplomatSensitiveResults(); // 추가 비용 업데이트
      updateHeavyItemDropdown(); // HEAVY ITEM 드롭다운 업데이트
    });
  } else {
    console.error("Path parameter missing in URL.");
  }

    poeDropdown.addEventListener("change", () => {
    const poeValue = poeDropdown.value;
    if (poeValue) {
      fetchData(); // POE 변경 시 데이터를 다시 불러옵니다.
    }
  });

  // 체크박스 동작 상호 배제
    nonDiplomat.addEventListener("change", () => {
      if (nonDiplomat.checked) {
        diplomat.checked = false; // diplomat 체크 해제
      }
      updateBasicDeliveryCost(); // 기본 배송 비용 업데이트
      updateAllCosts(); // 모든 비용 업데이트
    });

    diplomat.addEventListener("change", () => {
      if (diplomat.checked) {
        nonDiplomat.checked = false; // nonDiplomat 체크 해제
      }
      updateBasicDeliveryCost(); // 기본 배송 비용 업데이트
      updateAllCosts(); // 모든 비용 업데이트
    });
});


function resetDropdown(dropdownElement, placeholder = "-- CBM 선택2 --") {
  if (!dropdownElement) {
    return; // 잘못된 호출 무시
  }
  dropdownElement.innerHTML = `<option value="">${placeholder}</option>`;
}

// CBM 드롭다운 업데이트
function updateCbmDropdown(dropdownElement, selectedValue) {
  resetDropdown(dropdownElement, "-- CBM 선택 --");

  // 1부터 60까지의 숫자 추가
  for (let i = 1; i <= 60; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    dropdownElement.appendChild(option);
  }

  // 기존 선택 값 복원
  if (selectedValue && selectedValue >= 1 && selectedValue <= 60) {
    dropdownElement.value = selectedValue;
  } else {
    dropdownElement.value = ""; // 기본값
  }

  dropdownElement.dispatchEvent(new Event("change"));
}

// 컨테이너 타입 드롭다운 업데이트
function updateContainerDropdown(containerTypes, containerDropdown, selectedValue) {
  resetDropdown(containerDropdown, "-- CONTANIER TYPE 선택 --");
  containerTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    containerDropdown.appendChild(option);
  });

  // 기존 선택 값 복원
  if (selectedValue && containerTypes.includes(selectedValue)) {
    containerDropdown.value = selectedValue;
  } else {
    containerDropdown.value = ""; // 선택값 초기화
  }
}

//------------------OFC 백앤드 처리----------------------------
async function updateOfcValue() {
  const poeValue = poeDropdown.value; // POE 드롭다운의 VALUE 값
  const containerType = containerDropdown.value; // Container Type 값
  const selectedCbm = parseInt(dropdown.value, 10); // 선택된 CBM 값

  // POE, 컨테이너 타입 값, 또는 CBM 값이 없을 경우 처리
  if (!poeValue || !containerType || isNaN(selectedCbm)) {
    ofcValueElement.textContent = "";
    return;
  }

  try {
    // 백엔드 데이터 가져오기
    const response = await fetch(notionBackendURL);
    if (!response.ok) {
      throw new Error(`백엔드 호출 실패: ${response.status}`);
    }

    const notionData = await response.json();

    // 백엔드 데이터에서 POE 및 컨테이너 값에 맞는 데이터 찾기
    const matchingData = notionData.data.find(
      (item) => item.name.toLowerCase() === poeValue.toLowerCase() // 대소문자 무시 비교
    );

    // 매칭 데이터가 없을 경우
    if (!matchingData) {
      ofcValueElement.textContent = "";
      return;
    }

    // 컨테이너 타입이 CONSOLE인 경우 40HC 값 사용
if (containerType === "CONSOLE") {
    const value40HC = matchingData[`value40HC`];
    if (!isNaN(value40HC)) {
        // 40HC 값을 60으로 나누고 CBM 값을 곱한 결과 계산
        const consoleValue = (value40HC / 50) * selectedCbm;
        ofcValueElement.textContent = `$${Number(consoleValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        ofcValueElement.textContent = "";
    }
    return; // CONSOLE 값 처리 완료 후 함수 종료
}

    // 일반 컨테이너 타입 처리
    let value = matchingData[`value${containerType}`];

    // 값이 숫자라면 화폐 단위를 포함해 형식화 (소수점 두 번째 자리까지)
    if (!isNaN(value)) {
        value = `$${Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }


    // 값 업데이트
    ofcValueElement.textContent = value !== null ? value : "";
  } catch (error) {
    console.error("Error fetching OFC value:", error);
    ofcValueElement.textContent = "오류 발생";
  }
}

//------------------basic delivery 처리------------------------
function updateBasicDeliveryCost() {
  const selectedCBM = parseInt(dropdown.value, 10); // 선택된 CBM 값
  const isNonDiplomat = nonDiplomat.checked; // Non-Diplomat 여부
  const isDiplomat = diplomat.checked; // Diplomat 여부
  const selectedContainer = containerDropdown.value; // 선택된 컨테이너 타입

  // 유효성 검사: CBM 값과 체크박스 상태 확인
  if (isNaN(selectedCBM) || selectedCBM < 1 || selectedCBM > 60) {
    result.textContent = "";
    return;
  }

  if (!isNonDiplomat && !isDiplomat) {
    result.textContent = ""; // 기본값
    return;
  }

  // NonDiplomat 또는 Diplomat 데이터 선택
  const dataCategory = isNonDiplomat ? dataNonDiplomat : dataDiplomat;
  let costValue = ""; // 기본값 설정
  let descriptionValue = ""; // 설명 기본값 설정

  if (typeof dataCategory[selectedContainer] === "object") {
    // 컨테이너 타입이 있는 경우
    const containerData = dataCategory[selectedContainer];

    // description 값 가져오기
    descriptionValue = containerData["description"] || ""; // description을 가져옴

    // CBM 값에 해당하는 범위 또는 개별 값 찾기
    const rangeKey = Object.keys(containerData).find(key => {
      if (key.includes("-")) {
        const [start, end] = key.split("-").map(Number);
        return selectedCBM >= start && selectedCBM <= end;
      }
      return selectedCBM == key;
    });

    // 범위 또는 개별값에 해당하는 비용 가져오기
    costValue = rangeKey ? containerData[rangeKey] : containerData["ANY"];
  } else {
    // 컨테이너 타입이 없는 경우
    const cbmData = dataCategory;

    // description 값 바로 가져오기 (컨테이너 타입이 없으면 dataCategory에서 바로 가져옴)
    descriptionValue = cbmData["description"] || ""; // description을 가져옴

    // CBM 값에 해당하는 범위 또는 개별 값 찾기
    const rangeKey = Object.keys(cbmData).find(key => {
      if (key.includes("-")) {
        const [start, end] = key.split("-").map(Number);
        return selectedCBM >= start && selectedCBM <= end;
      }
      return selectedCBM == key;
    });

    // 범위 또는 개별값에 해당하는 비용 가져오기
    costValue = rangeKey ? cbmData[rangeKey] : "";
  }

  // 값이 숫자인 경우 화폐 단위를 추가
  if (!isNaN(costValue)) {
    costValue = `${currencySymbol}${Number(costValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 결과 업데이트
  result.textContent = costValue;
  
/* 기본 배송 설명은 basic-delivery-description 영역에만 표시 */
    const descBox = document.getElementById("basic-delivery-description");
    if (descBox) {
      descBox.innerHTML = `<div>${descriptionValue.replace(/\n/g, "<br>")}</div>` + descBox.innerHTML;
    }
  }

// CBM 드롭다운 값 변경 시 기본 배송 비용 업데이트
dropdown.addEventListener("change", updateBasicDeliveryCost);

// 외교 화물 체크박스 변경 시 기본 배송 비용 업데이트
nonDiplomat.addEventListener("change", updateBasicDeliveryCost);
diplomat.addEventListener("change", updateBasicDeliveryCost);

// 컨테이너 드롭다운 값 변경 시 기본 배송 비용 업데이트
containerDropdown.addEventListener("change", updateBasicDeliveryCost);

//--------------------basic cost 처리---------------------------
function updateDiplomatSensitiveResult(categoryKey) {
  const selectedContainer = containerDropdown.value; // 선택된 컨테이너 타입
  const selectedCBM = parseInt(dropdown.value, 10); // 선택된 CBM 값 (숫자로 변환)
  let result = ""; // 초기 값 설정

  const categoryData = basicExtraCost[categoryKey];

  if (!categoryData) {
    return;
  }

  // NonDiplomat 또는 Diplomat 구분
  const role = nonDiplomat.checked ? "NonDiplomat" : "Diplomat";

  // 해당 컨테이너 타입의 데이터 가져오기
  const costData = categoryData[role]?.[selectedContainer];

  // 1. CBM 범위가 있는지 확인
  if (typeof costData === "object") {
  const rangeKey = Object.keys(costData).find((key) => {
    if (key.includes("-")) {
      const [start, end] = key.split("-").map(Number);
      return selectedCBM >= start && selectedCBM <= end;
    } else if (!isNaN(Number(key))) {
      return selectedCBM === Number(key);
    }
    return false;
  });

    if (rangeKey) {
      // 범위에 맞는 값을 출력
      result = costData[rangeKey] || "";
    } else if (costData["단가"]) {
      // 범위가 없으면 "단가" 항목을 사용하여 계산
      const unitCost = parseFloat(costData["단가"]);
      result = (selectedCBM * unitCost).toFixed(2); // CBM 값과 곱하기
    }
  } 
  // 2. "단가" 항목이 없고, 값 그대로 출력
  else if (typeof costData === "number") {
    result = costData; // 값 그대로 출력
  } 
  // 3. "단가" 항목도 없고, 문자 그대로 출력
  else if (typeof costData === "string") {
    result = costData; // 문자 그대로 출력
  }

  // 4. 기본값이 없을 경우 단위 비용 처리
  if (result === "" && !isNaN(selectedCBM)) {
    const defaultMultiplier = categoryData[role]?.unitMultiplier || 0;
    result = selectedCBM * defaultMultiplier;
  }

  // 5. 화폐 단위 추가 및 천 단위 쉼표 적용
  if (!isNaN(result)) {
    result = `${currencySymbol}${Number(result).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // 6. 업데이트
  const labelElement = document.getElementById(`${categoryKey}-label`);
  const valueElement = document.getElementById(`${categoryKey}-value`);
  const descriptionElement = document.getElementById(`${categoryKey}-description`);

  if (valueElement) valueElement.textContent = result;
  if (descriptionElement) {
    const descriptionText = categoryData.description || "";
    descriptionElement.innerHTML = descriptionText.replace(/\n/g, "<br>");
  }
}

//------------------------------basic cost total 계산------------------------------
// total-value 계산 함수
function calculateTotalCost() {
  let totalCost = 0;

  // 'basic-cost-'로 시작하는 모든 값을 가져오기
  const costValueElements = document.querySelectorAll('[id^="basic-cost-"][id$="-value"]');

  costValueElements.forEach(costValueElement => {
    const costValueText = costValueElement.textContent || "";

    // 화폐 단위 및 쉼표 제거 후 정리
    const cleanedText = costValueText.replace(/[\¥$€₩,]|C\$/g, "").trim();

    // 숫자만 포함된 경우만 처리 (문자 포함 시 제외, "~" 포함 시 제외)
    if (!/^\d+(\.\d+)?$/.test(cleanedText) || costValueText.includes("~")) {
      return;
    }

    const costValue = parseFloat(cleanedText);
    if (!isNaN(costValue)) {
      totalCost += costValue;
    }
  });

  // basic-delivery-value 값도 추가 (동일한 처리 방식 적용)
  const basicDeliveryValueElement = document.getElementById("basic-delivery-value");
  if (basicDeliveryValueElement) {
    const basicDeliveryValueText = basicDeliveryValueElement.textContent || "";

    // 화폐 단위 및 쉼표 제거 후 정리
    const cleanedDeliveryText = basicDeliveryValueText.replace(/[\¥$€₩,]|C\$/g, "").trim();

    // 유효한 숫자만 처리 (문자 포함 시 제외, "~" 포함 시 제외)
    if (/^[0-9.-]+$/.test(cleanedDeliveryText) && !basicDeliveryValueText.includes("~")) {
      const basicDeliveryValue = parseFloat(cleanedDeliveryText);
      if (!isNaN(basicDeliveryValue)) {
        totalCost += basicDeliveryValue;
      }
    }
  }

  // 결과 출력: 화폐 단위를 포함한 형식
  const totalCostElement = document.getElementById("total-value");
  if (totalCostElement) {
    totalCostElement.textContent = `${currencySymbol || ""}${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    console.error("totalCostElement를 찾을 수 없습니다.");
  }

  console.log("Total Cost:", totalCost);
  return totalCost;
}

// MutationObserver 설정
function observeCostChanges() {
  // 기본 배송비와 추가 비용의 변화를 감지할 observer 설정
  const config = { childList: true, subtree: true, characterData: true };

  // basic-cost-?와 basic-delivery-value를 관찰
  const observedElements = [
    ...document.querySelectorAll('[id^="basic-cost-"][id$="-value"]'),
    document.getElementById("basic-delivery-value"),
    document.getElementById("average-ofc-value")
  ];

  observedElements.forEach(element => {
    if (element) {
      const observer = new MutationObserver(() => {
        console.log("값 변경 감지됨, total cost 재계산");
        calculateTotalCost();
      });
      observer.observe(element, config);
    }
  });
}

// DOMContentLoaded 시 호출
document.addEventListener("DOMContentLoaded", () => {
  calculateTotalCost(); // 초기 계산
  observeCostChanges(); // MutationObserver 활성화
});


//-------------------KRW 변환 부분---------------------------
async function updateKrwValueWithAPI() {
    const totalValueElement = document.getElementById("total-value");
    const krwValueElement = document.getElementById("krw-value");

    if (!totalValueElement || !krwValueElement) {
        console.error("필요한 DOM 요소를 찾을 수 없습니다.");
        return;
    }

    // total-value에서 금액 추출
    const totalValueText = totalValueElement.textContent || "";
    const foreignValue = parseFloat(totalValueText.replace(/[\¥$€₩,]|C\$/g, "").replace(/[^0-9.-]+/g, ""));

    if (isNaN(foreignValue)) {
        krwValueElement.textContent = "금액을 계산할 수 없습니다.";
        return;
    }

    // 통화 기호 또는 코드 추출 (USD, GBP 등)
    const currencySymbol = totalValueText.match(/[\¥$€₩£]|[A-Za-z]{3}/);  // 기호 또는 3자리 코드 추출

    if (!currencySymbol) {
        krwValueElement.textContent = "-";
        return;
    }

    try {
        // 환율 API 호출 (ExchangeRate-API 사용)
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/KRW");
        if (!response.ok) {
            throw new Error("환율 데이터를 가져올 수 없습니다.");
        }

        const data = await response.json();

        // 선택된 통화에 맞는 환율 확인
        let rate;

        // 기호 또는 코드에 따른 환율 처리
        if (currencySymbol[0] === '$') { // USD
            rate = data.rates["USD"];
        } else if (currencySymbol[0] === '€') { // EUR
            rate = data.rates["EUR"];
        } else if (currencySymbol[0] === '₩') { // KRW
            rate = 1;
        } else if (currencySymbol[0] === '£') { // GBP
            rate = data.rates["GBP"];
        } else if (currencySymbol[0] === 'C$') { // CAD
            rate = data.rates["CAD"];
        } else if (currencySymbol[0] === '¥') { // JPY
            rate = data.rates["JPY"];
        } else {
            throw new Error("지원되지 않는 통화 기호입니다.");
        }

        if (!rate) {
            throw new Error(`${currencySymbol[0]} 환율 데이터를 찾을 수 없습니다.`);
        }

        // KRW로 변환
        const krwValue = foreignValue / rate;

        // 결과 업데이트
        krwValueElement.textContent = `${Math.floor(krwValue).toLocaleString()}`;
    } catch (error) {
        console.error("환율 계산 중 오류 발생:", error);
        krwValueElement.textContent = "환율 데이터를 가져오는 중 오류 발생";
    }
}

//-------------------extra cost 계산-------------------------
function updateExtraCostResult(categoryKey) {
  const selectedContainer = containerDropdown.value;
  const selectedCBM = parseInt(dropdown.value, 10);
  let result = "";

  const categoryData = basicExtraCost[categoryKey];

  if (!categoryData) {
    return;
  }

  const costData = categoryData[selectedContainer];

  // 1. CBM 범위를 먼저 체크
  if (typeof costData === "object") {
    const rangeKey = Object.keys(costData).find((key) => {
      if (key.includes("-")) {
        const [start, end] = key.split("-").map(Number);
        return selectedCBM >= start && selectedCBM <= end;
      }
      return false;
    });

    if (rangeKey) {
      result = costData[rangeKey] || "";
    } else if (costData["단가"]) {
      // 범위가 없으면 "단가" 사용
      const unitCost = parseFloat(costData["단가"]);
      result = (selectedCBM * unitCost).toFixed(2);
    }
  } 
  // 2. "단가" 항목이 없는 경우, 값 그대로 출력
  else if (typeof costData === "number") {
    result = costData;
  } 
  else if (typeof costData === "string") {
    result = costData;
  }

  // 3. 기본값이 없을 경우 단위 비용 처리
  if (result === "" && !isNaN(selectedCBM)) {
    const defaultMultiplier = categoryData?.unitMultiplier || 0;
    result = selectedCBM * defaultMultiplier;
  }

  // 4. 화폐 단위 추가
  if (!isNaN(result) && result !== "") {
    result = `${currencySymbol}${Number(result).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 5. UI 업데이트
  const labelElement = document.getElementById(`${categoryKey}-label`);
  const valueElement = document.getElementById(`${categoryKey}-value`);
  const descriptionElement = document.getElementById(`${categoryKey}-description`);

  if (valueElement) valueElement.textContent = result;
  if (descriptionElement) {
    const descriptionText = categoryData.description || "";
    descriptionElement.innerHTML = descriptionText.replace(/\n/g, "<br>");
  }
}



//-------------------stair carry charge 업데이트---------------
// POE 드롭다운 선택 시 설명 업데이트 및 계단 비용 계산
poeDropdown.addEventListener("change", () => {
  // POE 드롭다운이 선택된 후에 바로 description 업데이트
  const stairDescription = basicExtraCost["STAIR CHARGE"]?.description || "";
  const stairDescriptionElement = document.getElementById("stair-description");
  if (stairDescriptionElement) {
    stairDescriptionElement.innerHTML = stairDescription.replace(/\n/g, "<br>"); // \n을 <br>로 변환하여 HTML 적용
  }

  // POE 선택 후 계단 비용 계산도 바로 실행
  calculateStairCharge();
});

// 이동 CBM 드롭다운 업데이트
function updateStairChargeDropdown() {
  resetDropdown(stairCbmDropdown, "이동 CBM 선택");

  const selectedCBM = parseInt(dropdown.value, 10); // 상위 CBM 선택값
  if (!isNaN(selectedCBM) && selectedCBM > 0) {
    // STAIR CBM 옵션 추가 (1 ~ selectedCBM 범위)
    for (let i = 1; i <= selectedCBM; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      stairCbmDropdown.appendChild(option);
    }
  } else {
    // 선택된 CBM이 유효하지 않은 경우 추가 옵션을 비웁니다.
    resetDropdown(stairCbmDropdown, "이동 CBM 선택");
  }

  // STAIR FLOOR 옵션 추가 (2 ~ 10 고정)
  resetDropdown(stairFloorDropdown, "이동 층 선택");
  for (let i = 2; i <= 10; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}층`;
    stairFloorDropdown.appendChild(option);
  }
}

// ▼STAIR CHARGE 결과 계산
function calculateStairCharge() {
  const cbmValue = parseInt(stairCbmDropdown.value, 10);
  const floorValue = parseInt(stairFloorDropdown.value, 10);

  // JSON에서 "CBM단가" 값을 가져오기
  const cbmUnitCost = basicExtraCost["STAIR CHARGE"]?.["CBM단가"] || 0; // 기본값은 0

  // description 업데이트
  const stairDescription = basicExtraCost["STAIR CHARGE"]?.description || "";
  const stairDescriptionElement = document.getElementById("stair-description");
  if (stairDescriptionElement) {
    stairDescriptionElement.innerHTML = stairDescription.replace(/\n/g, "<br>"); // \n을 <br>로 변환하여 HTML 적용
  }


  if (!isNaN(cbmValue) && !isNaN(floorValue)) {
    const stairCharge = cbmValue * (floorValue - 1) * cbmUnitCost; // floor-1로 계산
    stairChargeResult.textContent = `${currencySymbol}${stairCharge.toFixed(2)}`; // 소수점 2자리까지 표시
  } else {
    stairChargeResult.textContent = ""; // 기본값
  }
}

//토글부분
document.getElementById("stairchargetitle").addEventListener("click", () => {
  const details = document.getElementById("stair-charge-details");
  const desc    = document.getElementById("stair-description");
  const label   = document.getElementById("stair-charge-toggle");

  const hidden = details.style.display === "none";
  details.style.display = hidden ? "block" : "none";
  desc.style.display    = hidden ? "block" : "none";
  label.textContent     = `${hidden ? "▼" : "▶"} STAIR CHARGE OPTIONS`;
});

//--------------------------------heavy items-----------------------------
function updateHeavyItemDropdown() {
  const heavyItemData = basicExtraCost["HEAVY ITEM"]; // JSON 데이터에서 HEAVY ITEM 가져오기

  if (!heavyItemData) {
    return;
  }

  // 1. heavyitem-description 업데이트
  const descriptionElement = document.getElementById("heavyitem-description");
  if (descriptionElement) {
    descriptionElement.textContent = heavyItemData.description || "";
  }

  // 2. heavyitemunit 드롭다운 옵션 생성
  resetDropdown(heavyItemDropdown, "중량 화물 단위 선택");

  const unit = heavyItemData["단위"] || ""; // 단위 가져오기
  for (let i = 1; i <= 5; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}${unit}`; // 숫자 뒤에 단위 추가
    heavyItemDropdown.appendChild(option);
  }

  // 3. 드롭다운 변경 시 값 계산
  heavyItemDropdown.addEventListener("change", () => {
    const selectedValue = parseInt(heavyItemDropdown.value, 10); // 선택된 숫자 값
    const unitCost = heavyItemData["단가"] || 0; // 단가 가져오기

    // 값 계산
    const calculatedValue = !isNaN(selectedValue) ? `${currencySymbol}${(selectedValue * unitCost).toLocaleString()}` : "None";

    // heavyitem-value 업데이트
    const valueElement = document.getElementById("heavyitem-value");
    if (valueElement) {
      valueElement.textContent = calculatedValue !== "" ? calculatedValue.toLocaleString() : "";
    }
  });
}

document.getElementById("heavyitemrow").addEventListener("click", () => {
  const details = document.getElementById("heavyitem-details");
  const label   = document.getElementById("heavyitem-toggle");

  const hidden = details.style.display === "none";
  details.style.display = hidden ? "block" : "none";
  label.textContent     = `${hidden ? "▼" : "▶"} HEAVY ITEM CHARGE`;
});


//----------------------storage charge 계산-----------------
function updatestorageperiodDropdown() {
  const storageData = basicExtraCost["STORAGE CHARGE"];
  if (!storageData || !storageData["보관 비용"]) {
    console.error("STORAGE CHARGE 데이터가 없음", basicExtraCost);
    return;
  }

  const freeStorageDays = parseInt(storageData["무료 보관 기간"], 10) || 0;
  const storageCostData = storageData["보관 비용"];
  const defaultUnitCost = parseFloat(storageCostData["단가"] ?? 0);
  const unit = storageData["단위"] || "일";

  if (isNaN(freeStorageDays) || isNaN(defaultUnitCost)) {
    console.error("무료 보관 기간 또는 단가가 숫자가 아님");
    return;
  }

  resetDropdown(storageperiodDropdown, `보관 기간 선택 (${unit})`);
  const maxPeriod = 90;

  for (let i = 1; i <= maxPeriod; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}${unit}`;
    storageperiodDropdown.appendChild(option);
  }

  const descriptionElement = document.getElementById("storage-description");
  if (descriptionElement) {
    descriptionElement.textContent = storageData.description || "";
  }

  storageperiodDropdown.addEventListener("change", () => {
    const selectedDays = parseInt(storageperiodDropdown.value, 10);
    const selectedCBM = parseInt(dropdown?.value || 0, 10);
    const selectedContainer = containerDropdown.value; // 선택된 컨테이너 타입
    const valueElement = document.getElementById("storage-value");

    console.log("선택된 컨테이너:", selectedContainer);
    console.log("STORAGE CHARGE 데이터:", storageData);

    if (!selectedContainer || !storageCostData) {
      console.error("컨테이너 선택이 안 됨 또는 STORAGE CHARGE 데이터가 없음");
      return;
    }

    let chargeableDays = selectedDays - freeStorageDays;
    chargeableDays = Math.max(chargeableDays, 0); // 0 이하가 되지 않도록 보정

    let costPerUnit;

    // 20DRY, 40HC 값 처리: CBM과 곱하지 않고 보관 기간만 처리
    if (storageCostData[selectedContainer] !== undefined) {
      // 20DRY, 40HC 값이 있는 경우
      costPerUnit = storageCostData[selectedContainer] * chargeableDays;  // CBM을 곱하지 않고 보관 기간만 곱함
    } else if (typeof storageCostData["CBM 범위"] === "object") {
      // CBM 범위가 있는 경우
      let rangeCost = 0;

      // CBM에 맞는 범위 단가 찾기
      for (const range in storageCostData["CBM 범위"]) {
        const [min, max] = range.split("-").map(Number);
        if (selectedCBM >= min && selectedCBM <= max) {
          rangeCost = storageCostData["CBM 범위"][range];
          break;
        }
      }

      // CBM 범위에서 값을 찾았다면, 해당 값만 곱하고, CBM은 곱하지 않음
      costPerUnit = rangeCost * chargeableDays;
    }

    console.log("costPerUnit 값:", costPerUnit);

    if (costPerUnit === undefined || costPerUnit === 0) {
      console.error(`컨테이너 ${selectedContainer}에 대한 보관 비용이 없음.`);
      return;
    }

    let calculatedValue;
    if (storageCostData["단가"] > 0) {
      // 단가 항목이 있을 때만 CBM과 단가를 곱한 계산을 진행
      calculatedValue = chargeableDays * storageCostData["단가"] * selectedCBM;
    } else {
      // CBM 범위나 20DRY, 40HC의 값 처리
      calculatedValue = costPerUnit;
    }

    const formattedValue = `${currencySymbol}${calculatedValue.toLocaleString()}`;

    if (valueElement) {
      valueElement.textContent = formattedValue;
    }
  });
}

document.getElementById("storagerow").addEventListener("click", () => {
  const details = document.getElementById("storage-details");
  const label   = document.getElementById("storage-toggle");

  const hidden = details.style.display === "none";
  details.style.display = hidden ? "block" : "none";
  label.textContent     = `${hidden ? "▼" : "▶"} STORAGE CHARGE`;
});

//--------------------------------------------------------------------------------


// DOMContentLoaded 후에 호출
document.addEventListener("DOMContentLoaded", () => {
  updateStairChargeDropdown(); // 페이지 로드 후 초기화
  calculateStairCharge(); // 초기값 계산
  updateOfcValue(); // OFC 값 초기화
  calculateTotalCost();
  updateKrwValueWithAPI(); // 초기값 업데이트
    const observer = new MutationObserver(updateKrwValueWithAPI);
    const totalCostElement = document.getElementById("total-value");
    if (totalCostElement) {
        observer.observe(totalCostElement, { childList: true });
    }
});


// 모든 카테고리를 동적으로 업데이트
function updateAllCosts() {
  updateOfcValue(); 
  // basic 비용 업데이트
  Object.keys(basicExtraCost).forEach((categoryKey) => {
    if (categoryKey.startsWith("basic-cost-")) {
      updateDiplomatSensitiveResult(categoryKey);
    }
  });

  // Extra 비용 업데이트
  Object.keys(basicExtraCost).forEach((categoryKey) => {
    if (categoryKey.startsWith("extra-cost-")) {
      updateExtraCostResult(categoryKey);
    }
  });
}

// JSON 데이터 로드 후 호출
fetchData().then(() => {
  updateBasicDeliveryCost(); // 기본 배송 비용 업데이트
  updateAllDiplomatSensitiveResults(); // 추가 비용 업데이트
  updateHeavyItemDropdown(); // HEAVY ITEM 드롭다운 업데이트
  updatestorageperiodDropdown(); // STORAGE CHARGE 드롭다운 업데이트
});


poeDropdown.addEventListener("change", updateAllCosts);
dropdown.addEventListener("change", updateAllCosts);
containerDropdown.addEventListener("change", updateAllCosts);
nonDiplomat.addEventListener("change", updateAllCosts);
diplomat.addEventListener("change", updateAllCosts);

stairCbmDropdown.addEventListener("change", calculateStairCharge);
stairFloorDropdown.addEventListener("change", calculateStairCharge);
dropdown.addEventListener("change", updateStairChargeDropdown);

//-------토글 관련----------

function toggleSection(labelElement, contentId) {
  const content = document.getElementById(contentId);
  if (!content) return;

  const isOpen = content.style.display === "block";
  content.style.display = isOpen ? "none" : "block";

  const arrow = labelElement.querySelector('.arrow');
  if (arrow) {
    arrow.textContent = isOpen ? '▶' : '▼';
  }
}


