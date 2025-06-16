/*==============================================================
  extra-cost-#  행 자동 생성 + 토글 + 실시간 계산
==============================================================*/
function initExtraCosts () {
  const container = document.getElementById("extra-costs");   // <div id="extra-costs">
  if (!container || !window.basicExtraCost) return;

  container.innerHTML = "";  // 초기화

  /* 1) extra-cost-숫자만 골라 정렬 */
  const costKeys = Object.keys(basicExtraCost)
    .filter(key => /^extra-cost-\d+$/.test(key))
    .sort((a, b) => +(a.match(/\d+/)) - +(b.match(/\d+/)));

  /* 2) DOM 생성 */
  costKeys.forEach(key => {
    /* result-row ------------------------------ */
    const row   = document.createElement("div");
    row.className = "result-row";

    const label = document.createElement("span");
    label.className = "result-label";
    label.style.cssText = "font-size:1rem;font-weight:normal";
    label.id = `${key}-label`;

    const value = document.createElement("span");
    value.className = "result-value";
    value.id = `${key}-value`;

    row.append(label, value);
    container.appendChild(row);

    /* description ----------------------------- */
    const desc = document.createElement("p");
    desc.className = "charge-info";
    desc.id        = `${key}-description`;
    container.appendChild(desc);

    /* 3) 토글 기능 ----------------------------- */
    label.textContent  = `▶ ${basicExtraCost[key].name || ""}`;
    desc.style.display = "none";
    label.addEventListener("click", () => {
      const hidden = desc.style.display === "none";
      desc.style.display = hidden ? "block" : "none";
      label.textContent  = `${hidden ? "▼" : "▶"} ${basicExtraCost[key].name || ""}`;
    });
  });

  /* 4) 계산 함수 ― updateExtraCostResult 사용 */
  const recalc = () => costKeys.forEach(updateExtraCostResult);

  /* 5) 드롭다운·라디오 변화 시 재계산 */
  [containerDropdown, dropdown, nonDiplomat, diplomat]
    .forEach(el => el?.addEventListener("change", recalc));

  recalc();  // 최초 1회
}
