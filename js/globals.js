/* -------------------------------------------------
   글로벌 변수 & 주요 DOM 캐싱
--------------------------------------------------*/
"use strict";

//// ❶ 비용·데이터 관련 전역 -----------------------
let currencySymbol   = "";
let dataNonDiplomat  = {};
let dataDiplomat     = {};
let containerTypes   = [];
let basicExtraCost   = {};
let heavyItemData    = {};

//// ❷ 주요 DOM ----------------------------
const dropdown              = document.getElementById("cbm-dropdown");
const containerDropdown     = document.getElementById("container-dropdown");
const result                = document.getElementById("basic-delivery-value");
const nonDiplomat           = document.getElementById("non-diplomat");
const diplomat              = document.getElementById("diplomat");

const stairCbmDropdown      = document.getElementById("staircbm");
const stairFloorDropdown    = document.getElementById("stairfloor");
const stairChargeResult     = document.getElementById("stair-charge");

const heavyItemDropdown     = document.getElementById("heavyitemunit");
const heavyItemValue        = document.getElementById("heavyitem-value");

const storageperiodDropdown = document.getElementById("storageperiod");
const storageValue          = document.getElementById("storage-value");

const totalCostElement      = document.getElementById("total-value");
const poeDropdown           = document.getElementById("poe-dropdown");

//// ❸ 링크 영역 ----------------------------
const podBusanLink  = document.getElementById("pod-link-busan");
const podIncheonLink= document.getElementById("pod-link-incheon");
const partnerLink3  = document.getElementById("link3");

//// ❹ 기타 -------------------------------
const notionBackendURL = "https://notion-backend-liard.vercel.app/notion";
const ofcValueElement  = document.getElementById("average-ofc-value");
const consoleNote      = document.getElementById("console-note");
