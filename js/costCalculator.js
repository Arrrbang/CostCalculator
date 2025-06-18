/* -------------------------------------------------
   기본/추가 비용 계산 + 합계
--------------------------------------------------*/
"use strict";

/* ▷ 기본 배송 비용 */
function updateBasicDeliveryCost () {
  const selectedCBM   = parseInt(dropdown.value,10);
  const isNonDiplomat = nonDiplomat.checked;
  const isDiplomat    = diplomat.checked;
  const selectedCont  = containerDropdown.value;

  if (isNaN(selectedCBM)||selectedCBM<1||selectedCBM>60 || (!isNonDiplomat && !isDiplomat)) {
    result.textContent=""; return;
  }

  const dataCategory  = isNonDiplomat ? dataNonDiplomat : dataDiplomat;
  let costVal="", descVal="";

  if (typeof dataCategory[selectedCont]==="object") {
    const contData = dataCategory[selectedCont];
    descVal = contData.description||"";
    const rangeKey = Object.keys(contData).find(k=>{
      if (k.includes("-")){
        const [s,e]=k.split("-").map(Number);
        return selectedCBM>=s&&selectedCBM<=e;
      }
      return Number(k)===selectedCBM;
    });
    costVal = rangeKey ? contData[rangeKey] : contData["ANY"];
  } else {
    const cbmData=dataCategory;
    descVal=cbmData.description||"";
    const rangeKey = Object.keys(cbmData).find(k=>{
      if (k.includes("-")){
        const [s,e]=k.split("-").map(Number);
        return selectedCBM>=s&&selectedCBM<=e;
      }
      return Number(k)===selectedCBM;
    });
    costVal = rangeKey ? cbmData[rangeKey] : "";
  }

  if (!isNaN(costVal))
    costVal = `${currencySymbol}${Number(costVal).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  result.textContent = costVal;
  setBasicDeliveryDesc(descVal);
}

/* ▷ diplomat 민감 기본 cost */
function updateDiplomatSensitiveResult (key) {
  const selectedCont = containerDropdown.value;
  const selectedCBM  = parseInt(dropdown.value,10);
  let val="";

  const cat = basicExtraCost[key];
  if (!cat) return;

  const role = nonDiplomat.checked ? "NonDiplomat" : "Diplomat";
  const costData = cat[role]?.[selectedCont];

  if (typeof costData === "object") {
    const rk = Object.keys(costData).find(k=>{
      if (k.includes("-")){
        const [s,e]=k.split("-").map(Number);
        return selectedCBM>=s&&selectedCBM<=e;
      } else return Number(k)===selectedCBM;
    });
    if (rk) val = costData[rk];
    else if (costData["단가"]) val = (selectedCBM*parseFloat(costData["단가"])).toFixed(2);
  } else if (typeof costData==="number") val=costData;
  else if (typeof costData==="string")  val=costData;

  if (!isNaN(val)) {
    val = `${currencySymbol}${Number(val).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  }

  document.getElementById(`${key}-value`).textContent = val;
  document.getElementById(`${key}-description`).innerHTML =
      (cat.description||"").replace(/\n/g,"<br>");
}

/* ▷ basic-cost 전체 재계산 */
function updateAllDiplomatSensitiveResults () {
  Object.keys(basicExtraCost)
    .filter(k=>k.startsWith("basic-cost-"))
    .forEach(updateDiplomatSensitiveResult);
}

/* ▷ extra-cost */
function updateExtraCostResult (key) {
  const selectedCont = containerDropdown.value;
  const selectedCBM  = parseInt(dropdown.value,10);
  let val="";

  const cat = basicExtraCost[key];
  if (!cat) return;

  const costData = cat[selectedCont];

  if (typeof costData === "object") {
    const rk = Object.keys(costData).find(k=>{
      if (k.includes("-")){
        const [s,e]=k.split("-").map(Number);
        return selectedCBM>=s&&selectedCBM<=e;
      }
      return false;
    });
    if (rk) val = costData[rk];
    else if (costData["단가"]) val = (selectedCBM*parseFloat(costData["단가"])).toFixed(2);
  } else if (typeof costData==="number") val = costData;
  else if (typeof costData==="string") val = costData;

  if (!isNaN(val))
    val = `${currencySymbol}${Number(val).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  document.getElementById(`${key}-value`).textContent = val;
  document.getElementById(`${key}-description`).innerHTML =
      (cat.description||"").replace(/\n/g,"<br>");
}

/* ▷ TOTAL 계산 */
function calculateTotalCost () {
  let tot=0;

  document.querySelectorAll('[id^="basic-cost-"][id$="-value"]').forEach(el=>{
    const t=el.textContent.replace(/[\¥$€₩,]|C\$/g,"").trim();
    if (/^\d+(\.\d+)?$/.test(t)) tot+=parseFloat(t);
  });

  const baseValTxt = result.textContent.replace(/[\¥$€₩,]|C\$/g,"").trim();
  if (/^\d+(\.\d+)?$/.test(baseValTxt)) tot += parseFloat(baseValTxt);

  totalCostElement.textContent =
    `${currencySymbol}${tot.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  return tot;
}

/* ▷ 모니터링 & 전체 갱신 */
function updateAllCosts () {
  updateOfcValue();
  updateBasicDeliveryCost();
  updateAllDiplomatSensitiveResults();
  Object.keys(basicExtraCost).filter(k=>k.startsWith("extra-cost-")).forEach(updateExtraCostResult);
  calculateTotalCost();
}
