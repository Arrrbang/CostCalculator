/* -------------------------------------------------
   공통 유틸리티
--------------------------------------------------*/
"use strict";

/* ▷ URL 파라미터에서 path 추출 */
function getPathFromURL () {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("path");
}

/* ▷ 드롭다운 옵션 리셋 */
function resetDropdown (dropdownEl, placeholder = "-- 선택 --") {
  if (!dropdownEl) return;
  dropdownEl.innerHTML = `<option value="">${placeholder}</option>`;
}

/* ▷ 구역 토글 (공통) */
function toggleSection (labelEl, contentId) {
  const content = document.getElementById(contentId);
  if (!content) return;

  const isOpen = content.style.display === "block";
  content.style.display = isOpen ? "none" : "block";

  const arrow = labelEl.querySelector(".arrow");
  if (arrow) arrow.textContent = isOpen ? "▶" : "▼";
}

/* ▷ 파트너/부산·인천 OFC 링크 초기화 */
function initializeLinks () {
  [podBusanLink, podIncheonLink].forEach(a => {
    if (a) { a.href="#"; a.classList.add("disabled-link"); }
  });

  if (partnerLink3) {
    partnerLink3.onclick = null;
    partnerLink3.classList.add("disabled-link");
  }
}

/* ▷ 링크 실제 반영 */
function updateLinks (links) {
  if (!Array.isArray(links) || links.length < 3) { initializeLinks(); return; }

  if (podBusanLink && links[0]?.url) {
    podBusanLink.onclick = () => window.open(links[0].url, "_blank");
    podBusanLink.classList.remove("disabled-link");
  }
  if (podIncheonLink && links[1]?.url) {
    podIncheonLink.onclick = () => window.open(links[1].url, "_blank");
    podIncheonLink.classList.remove("disabled-link");
  }
  if (partnerLink3 && links[2]?.url) {
    partnerLink3.onclick = () => window.open(links[2].url, "_blank");
    partnerLink3.classList.remove("disabled-link");
  }
}

/* ▷ POD TT 리스트 렌더 */
function renderPodTT (ofcData) {
  const listBusan   = document.getElementById("podpusan");
  const listIncheon = document.getElementById("podincheon");
  if (!listBusan || !listIncheon || !ofcData) return;

  const makeLi = ({name="", tt="", note=""}) =>
    `<li>${name} : ${tt}${note ? `<br><span class="note">${note}</span>`: ""}</li>`;

  listBusan.innerHTML   = Object.values(ofcData.busan   || {}).map(makeLi).join("");
  listIncheon.innerHTML = Object.values(ofcData.incheon || {}).map(makeLi).join("");
}

/* ▷ ‘CONSOLE’ 선택 시 안내문 토글 */
function toggleConsoleNote () {
  consoleNote.style.display = (containerDropdown.value === "CONSOLE") ? "block" : "none";
}

/* ▷ 기본 배송비 설명 상단 Insert */
function setBasicDeliveryDesc (desc) {
  const box = document.getElementById("basic-delivery-description");
  if (!box) return;
  let elem = box.querySelector(".delivery-desc");
  if (!elem) {
    elem = document.createElement("div");
    elem.className = "delivery-desc";
    box.prepend(elem);
  }
  elem.innerHTML = desc.replace(/\n/g,"<br>");
}
