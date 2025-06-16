//basic cost html 생성
(function () {
  // 두 조건이 모두 충족될 때 init 실행
  let domReady    = false;
  let costReady   = false;

  function tryInit () {
    if (domReady && costReady && window.basicExtraCost) {
      initAdditionalCosts();
    }
  }

  // 1) DOM Content Loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      domReady = true;
      tryInit();
    }, { once: true });
  } else {
    domReady = true;
  }

  // 2) 데이터 준비(custom event)
  document.addEventListener("basicCostReady", () => {
    costReady = true;
    tryInit();
  }, { once: true });

  /* ---------------- 내부 함수 ---------------- */
  function initAdditionalCosts () {
    const container = document.getElementById("additional-costs");
    if (!container) return;

    container.innerHTML = "";

  const costKeys = Object.keys(basicExtraCost)
        .filter(key => /^basic-cost-\\d+$/.test(key))       // ← basic-cost-숫자만
        .sort((a, b) => {
      const ai = +(a.match(/\d+/) || [0])[0];
      const bi = +(b.match(/\d+/) || [0])[0];
      return ai - bi;
    });

    costKeys.forEach((key) => {
      // result-row
      const row = document.createElement("div");
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

      // description
      const desc = document.createElement("p");
      desc.className = "charge-info";
      desc.id = `${key}-description`;
      container.appendChild(desc);
    });

    // 재계산
    const recalc = () => costKeys.forEach(updateDiplomatSensitiveResult);
    [containerDropdown, dropdown, nonDiplomat, diplomat]
      .forEach(el => el && el.addEventListener("change", recalc));

    recalc();
  }
})();
