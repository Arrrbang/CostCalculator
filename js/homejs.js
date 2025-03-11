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

// resetDropdown 함수 변경
function resetDropdown(dropdownElement, placeholder = "-- CBM 선택 --") {
  if (!dropdownElement) {
    return; // 잘못된 호출 무시
  }
  dropdownElement.innerHTML = `<option value="">${placeholder}</option>`;
}

// 링크 초기화
function initializeLinks() {
  link1Element.textContent = "Default Link 1";
  link1Element.onclick = () => console.log("Default Link 1 clicked");
  link1Element.style.pointerEvents = "none";
  link1Element.style.color = "gray";

  link2Element.textContent = "Default Link 2";
  link2Element.onclick = () => console.log("Default Link 2 clicked");
  link2Element.style.pointerEvents = "none";
  link2Element.style.color = "gray";
}

// 링크 업데이트
function updateLinks(links) {

  if (!Array.isArray(links) || links.length < 2) {
    initializeLinks();
    return;
  }

   // 링크 1 업데이트
  if (links[0]?.url) {
    link1Element.textContent = links[0].label || "Default Link 1";
    link1Element.style.pointerEvents = "auto";
    link1Element.style.color = "white";
    link1Element.onclick = () => {
      window.open(links[0].url, "_blank");
    };
  } else {
    link1Element.textContent = "Default Link 1";
    link1Element.style.pointerEvents = "none";
    link1Element.style.color = "gray";
  }

  // 링크 2 업데이트
  if (links[1]?.url) {
    link2Element.textContent = links[1].label || "Default Link 2";
    link2Element.style.pointerEvents = "auto";
    link2Element.style.color = "white";
    link2Element.onclick = () => {
      window.open(links[1].url, "_blank");
    };
  } else {
    link2Element.textContent = "Default Link 2";
    link2Element.style.pointerEvents = "none";
    link2Element.style.color = "gray";
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
        stairDescriptionElement.textContent = stairDescription; // 설명 업데이트
      }
    });
  } else {
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

    // "DATA BASE"의 description 값 가져오기
    const dataBaseDescription = extraCostData["DATA BASE"]?.description || ""; // 기본값 설정
    const dataDescriptionElement = document.getElementById("data-description");
    if (dataDescriptionElement) {
      dataDescriptionElement.textContent = dataBaseDescription;  // description을 업데이트
    }

    //additional info 가져오기
    let additionalInfoIndex = 1;  // 추가 정보 항목의 번호 (예: 1, 2, 3 ...)
      while (extraCostData[`additional-info-${additionalInfoIndex}`]) {
        const additionalInfo = extraCostData[`additional-info-${additionalInfoIndex}`];

        // name을 추가
        const labelElement = document.getElementById(`additional-info-${additionalInfoIndex}-label`);
        if (labelElement) {
          labelElement.textContent = additionalInfo.name || "";  // name을 업데이트
        }

        // description을 추가
        const descriptionElement = document.getElementById(`additional-info-${additionalInfoIndex}-description`);
      if (descriptionElement) {
        const descriptionText = additionalInfo.description || "";
        descriptionElement.innerHTML = descriptionText.replace(/\n/g, "<br>");  // \n을 <br>로 변경하여 HTML로 삽입
      }

        additionalInfoIndex++;  // 다음 항목으로 넘어감
      }

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
      stairDescriptionElement.textContent = stairDescription; // 설명 업데이트
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
        const consoleValue = (value40HC / 60) * selectedCbm;
        ofcValueElement.textContent = `${currencySymbol}${Number(consoleValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        ofcValueElement.textContent = "";
    }
    return; // CONSOLE 값 처리 완료 후 함수 종료
}

    // 일반 컨테이너 타입 처리
    let value = matchingData[`value${containerType}`];

    // 값이 숫자라면 화폐 단위를 포함해 형식화 (소수점 두 번째 자리까지)
    if (!isNaN(value)) {
        value = `${currencySymbol}${Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
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

  if (typeof dataCategory[selectedContainer] === "object") {
    // 컨테이너 타입이 있는 경우
    const containerData = dataCategory[selectedContainer];

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

  // 5. 화폐 단위 추가
  if (!isNaN(result) && result !== "") {
      result = `${currencySymbol}${Number(result).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 6. 업데이트
  const labelElement = document.getElementById(`${categoryKey}-label`);
  const valueElement = document.getElementById(`${categoryKey}-value`);
  const descriptionElement = document.getElementById(`${categoryKey}-description`);

  if (labelElement) labelElement.textContent = categoryData.name || "";
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

    // 숫자만 포함된 경우에만 처리 (쉼표 제거 후 범위(~) 포함 시 제외)
    const cleanedText = costValueText.replace(/[\¥$€₩,]/g, "").trim();
    
    if (!/^[0-9.-]+$/.test(cleanedText) || costValueText.includes("~")) {
      return; // 숫자가 아닌 문자가 포함되었거나 "~"가 있으면 제외
    }

    // 화폐 단위 및 숫자만 추출
    const costValue = parseFloat(costValueText.replace(/[\¥$€₩]/g, "").replace(/[^0-9.-]+/g, ""));
    if (!isNaN(costValue)) {
      totalCost += costValue;
    }
  });

  // basic-delivery-value 값도 추가
  const basicDeliveryValueElement = document.getElementById("basic-delivery-value");
  const basicDeliveryValueText = basicDeliveryValueElement ? basicDeliveryValueElement.textContent : "";

  const basicDeliveryValue = parseFloat(basicDeliveryValueText.replace(/[\¥$€₩]/g, "").replace(/[^0-9.-]+/g, ""));
  if (!isNaN(basicDeliveryValue)) {
    totalCost += basicDeliveryValue;
  }

  // 결과 출력: 화폐 단위를 포함한 형식
  const totalCostElement = document.getElementById("total-value"); // totalCostElement를 정의
  if (totalCostElement) {
    totalCostElement.textContent = `${currencySymbol || ""}${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    console.error("totalCostElement가 정의되지 않았습니다.");
  }
}

// MutationObserver 설정
function observeCostChanges() {
  // 기본 배송비와 추가 비용의 변화를 감지할 observer 설정
  const config = { childList: true, subtree: true };

  // basic-cost-?와 basic-delivery-value를 관찰
  const observedElements = [
    ...document.querySelectorAll('[id^="basic-cost-"][id$="-value"]'),
    document.getElementById("basic-delivery-value"),
    document.getElementById("average-ofc-value")
  ];

  observedElements.forEach(element => {
    if (element) {
      const observer = new MutationObserver(calculateTotalCost);
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
    const foreignValue = parseFloat(totalValueText.replace(/[\¥$€₩£]/g, "").replace(/[^0-9.-]+/g, ""));

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
        } else if (currencySymbol[0] === 'CAD') { // CAD
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
  const selectedContainer = containerDropdown.value; // 선택된 컨테이너 타입
  const selectedCBM = parseInt(dropdown.value, 10); // 선택된 CBM 값 (숫자로 변환)
  let result = ""; // 초기 값 설정

  const categoryData = basicExtraCost[categoryKey];

  if (!categoryData) {
    return;
  }

  // 해당 컨테이너 타입의 데이터 가져오기
  const costData = categoryData[selectedContainer];

  // 1. "단가"가 있는지 확인하고, CBM 범위가 있는지 확인
  if (typeof costData === "object" && costData["단가"]) {
    // CBM 범위가 있는 경우 범위 적용
    const rangeKey = Object.keys(costData).find((key) => {
      if (key.includes("-")) {
        const [start, end] = key.split("-").map(Number);
        return selectedCBM >= start && selectedCBM <= end;
      }
      return false;
    });

    if (rangeKey) {
      result = costData[rangeKey] || "";
    } else {
      // 범위가 없으면 단가를 사용
      const unitCost = parseFloat(costData["단가"]);
      result = (selectedCBM * unitCost).toFixed(2); // CBM 값과 곱하기
    }
  } 
  // 2. "단가" 항목이 없고, CBM 범위가 있는지 확인
  else if (typeof costData === "object") {
    // 범위 처리: "1-30", "31-60" 같은 범위 체크
    const rangeKey = Object.keys(costData).find((key) => {
      if (key.includes("-")) {
        const [start, end] = key.split("-").map(Number);
        return selectedCBM >= start && selectedCBM <= end;
      }
      return false;
    });
    // 범위에 맞는 값을 출력
    result = costData[rangeKey] || "";
  } 
  // 3. "단가" 항목이 없고, 값 그대로 출력
  else if (typeof costData === "number") {
    result = costData; // 값 그대로 출력
  } 
  // 4. "단가" 항목도 없고, 문자 그대로 출력
  else if (typeof costData === "string") {
    result = costData; // 문자 그대로 출력
  }

  // 5. 기본값이 없을 경우 단위 비용 처리
  if (result === "" && !isNaN(selectedCBM)) {
    const defaultMultiplier = categoryData?.unitMultiplier || 0;
    result = selectedCBM * defaultMultiplier;
  }

  // 6. 화폐 단위 추가
  if (!isNaN(result) && result !== "") {
    result = `${currencySymbol}${Number(result).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 7. 업데이트
  const labelElement = document.getElementById(`${categoryKey}-label`);
  const valueElement = document.getElementById(`${categoryKey}-value`);
  const descriptionElement = document.getElementById(`${categoryKey}-description`);

  if (labelElement) labelElement.textContent = categoryData.name || "";
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
    stairDescriptionElement.textContent = stairDescription;
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
    stairDescriptionElement.textContent = stairDescription; // description 업데이트
  }

  if (!isNaN(cbmValue) && !isNaN(floorValue)) {
    const stairCharge = cbmValue * (floorValue - 1) * cbmUnitCost; // floor-1로 계산
    stairChargeResult.textContent = `${currencySymbol}${stairCharge.toFixed(2)}`; // 소수점 2자리까지 표시
  } else {
    stairChargeResult.textContent = ""; // 기본값
  }
}


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
//----------------------storage charge 계산-----------------
function updatestorageperiodDropdown() {
  const storageData = basicExtraCost["STORAGE CHARGE"]; // JSON에서 STORAGE CHARGE 가져오기

  if (!storageData) {
    return;
  }

  // 1. 무료 보관 기간과 보관 비용 단가, 단위 설정
  const freeStorageDays = parseInt(storageData["무료 보관 기간"], 10) || 0; // 기본값은 0
  const storageUnitCost = parseFloat(storageData["보관 비용 단가"]) || 0; // 기본 보관 단가
  const unit = storageData["단위"] || "일"; // 단위 값 (기본값은 '일')

  if (isNaN(freeStorageDays) || isNaN(storageUnitCost)) {
    return;
  }

  // 2. storageperiod 드롭다운 옵션 생성 (1일부터 시작)
  resetDropdown(storageperiodDropdown, `보관 기간 선택 (${unit})`);

  const maxPeriod = 90; // 최대 기간 설정

  for (let i = 1; i <= maxPeriod; i++) { 
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}${unit}`; // 단위를 포함하여 옵션 표시
    storageperiodDropdown.appendChild(option);
  }

  // 3. 설명 업데이트
  const descriptionElement = document.getElementById("storage-description");
  if (descriptionElement) {
    descriptionElement.textContent = storageData.description || "";
  }

  // 4. 드롭다운 변경 시 값 계산
  storageperiodDropdown.addEventListener("change", () => {
    const selectedDays = parseInt(storageperiodDropdown.value, 10); // 선택된 보관 기간
    const selectedCBM = parseInt(dropdown.value, 10); // 선택된 CBM 값

    const valueElement = document.getElementById("storage-value");

    if (!isNaN(selectedDays) && !isNaN(selectedCBM)) {
      // 선택된 일수에서 무료 보관 일수를 제외
      let chargeableDays = selectedDays - freeStorageDays;

      // 무료 보관 기간 이내일 경우
      if (chargeableDays <=0) {
        if (valueElement) {
          valueElement.textContent = "무료 보관"; // 무료 기간 이내 메시지 표시
        }
        return; // 비용 계산을 하지 않고 종료
      }

      // 비용 계산: (유료 보관 일수 * 단가 * CBM)
      const calculatedValue = chargeableDays * storageUnitCost * selectedCBM;
      const formattedValue = `${currencySymbol}${calculatedValue.toLocaleString()}`; // 형식화된 결과

      // id="storage-value" 업데이트
      if (valueElement) {
        valueElement.textContent = formattedValue;
      }
    } else {
      // 선택되지 않은 경우 기본값
      if (valueElement) {
        valueElement.textContent = "";
      }
    }
  });
}


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
