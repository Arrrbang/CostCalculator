/* -------------------------------------------------
   공통 유틸리티
--------------------------------------------------*/
"use strict";

function initializeLinks () {
  // Busan·Incheon 버튼은 처음엔 숨기고,
  // Partner( id="link3" ) 버튼은 항상 보이되 비활성 상태로 둡니다.
  if (podBusanLink)   { podBusanLink.style.display = "none"; }
  if (podIncheonLink) { podIncheonLink.style.display = "none"; }

  if (partnerLink3) {
    partnerLink3.style.display   = "inline-block";   // ← 항상 보이게
    partnerLink3.onclick         = null;             // 아직 URL 없음
    partnerLink3.classList.add("disabled-link");     // 회색·클릭 차단용 클래스
  }
}

/* ▷ 링크 실제 반영 */
function updateLinks (links = []) {
  // Busan / Incheon / Partner 링크 추출
  const lBusan   = links.find(l => l.label?.toLowerCase() === "busanofc"   && l.url);
  const lIncheon = links.find(l => l.label?.toLowerCase() === "incheonofc" && l.url);
  const lPartner = links.find(l => l.label?.toLowerCase() === "partnerinfo"&& l.url);

  // Busan 버튼
  if (lBusan && podBusanLink) {
    podBusanLink.style.display = "inline-block";
    podBusanLink.onclick = () => window.open(lBusan.url, "_blank");
  } else if (podBusanLink) {
    podBusanLink.style.display = "none";
  }

  // Incheon 버튼
  if (lIncheon && podIncheonLink) {
    podIncheonLink.style.display = "inline-block";
    podIncheonLink.onclick = () => window.open(lIncheon.url, "_blank");
  } else if (podIncheonLink) {
    podIncheonLink.style.display = "none";
  }

  // Partner 버튼은 **항상 보임** ― URL 있으면 활성, 없으면 비활성
  if (partnerLink3) {
    if (lPartner) {
      partnerLink3.classList.remove("disabled-link");
      partnerLink3.onclick = () => window.open(lPartner.url, "_blank");
    } else {
      partnerLink3.classList.add("disabled-link");
      partnerLink3.onclick = null;
    }
  }
}

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
  // 세 버튼 모두 ‘숨김’ 상태로 시작
  [podBusanLink, podIncheonLink, partnerLink3].forEach(btn => {
    if (!btn) return;
    btn.style.display = "none";   // ← 화면에 보이지 않도록
    btn.onclick = null;           // 혹시 남아있을 click 제거
  });
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
