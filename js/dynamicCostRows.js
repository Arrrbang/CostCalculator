//basic cost html 생성
(function initAdditionalCosts () {
  const container = document.getElementById("additional-costs");
  if (!container || typeof basicExtraCost === "undefined") return;

  /* 기존 행 모두 제거 */
  container.innerHTML = "";

  /* 키 이름(예: basic-cost-1 …)을 숫자 순서로 정렬 */
  const costKeys = Object.keys(basicExtraCost).sort((a, b) => {
    const ai = parseInt((a.match(/\d+/) || [0])[0], 10);
    const bi = parseInt((b.match(/\d+/) || [0])[0], 10);
    return ai - bi;
  });

  /* 각 키마다 <div class="result-row"> + <p> 생성 */
  costKeys.forEach((key) => {
    /* result-row */
    const row = document.createElement("div");
    row.className = "result-row";

    const label = document.createElement("span");
    label.className = "result-label";
    label.style.fontSize = "1rem";
    label.style.fontWeight = "normal";
    label.id = `${key}-label`;

    const value = document.createElement("span");
    value.className = "result-value";
    value.id = `${key}-value`;

    row.appendChild(label);
    row.appendChild(value);
    container.appendChild(row);

    /* description */
    const desc = document.createElement("p");
    desc.className = "charge-info";
    desc.id = `${key}-description`;
    container.appendChild(desc);
  });

  /* 2. 전체 재계산 함수 */
  const recalcAll = () => {
    costKeys.forEach(updateDiplomatSensitiveResult);
  };

  /* 3. 드롭다운·라디오 변화 시 재계산 */
  [containerDropdown, dropdown, nonDiplomat, diplomat].forEach((el) => {
    if (el && el.addEventListener) el.addEventListener("change", recalcAll);
  });

  /* 4. 최초 1회 계산 */
  recalcAll();
})();
