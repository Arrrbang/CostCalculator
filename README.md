| 파일명                     | 설명
| -------------------------- | -----------------------------------------------------------------------------------------------------------------------
| **`js/globals.js`**        | - 전역 변수 정의<br>- 주요 DOM 요소 캐싱                                                                                           
| **`js/utils.js`**          | - 공통 유틸리티 함수 모음<br>- URL 파싱, 드롭다운 초기화<br>- 포함/불포함/요약 설명 렌더링<br>- 링크 설정 및 섹션 토글                                         
| **`js/dataService.js`**    | - JSON 데이터 로딩 (`tariff`, `extracost`)<br>- POE 드롭다운 동적 생성<br>- 지도 기반 주소/파트너 정보 출력<br>- 포함비용, 불포함비용, POD TT, 요약 설명 등 렌더링 
| **`js/uiService.js`**      | - CBM, 컨테이너, STAIR 드롭다운 동적 구성                                                                                           
| **`js/ofcService.js`**     | - Notion Backend 호출<br>- POD 별 평균 OFC 비용 계산 및 표시                                                                        
| **`js/costCalculator.js`** | - 기본 배송비 계산<br>- diplomat 민감 요금 계산<br>- extra-cost 계산<br>- 총 비용 계산 (합계)                                                 
| **`js/chargeService.js`**  | - STAIR CHARGE 계산 및 토글<br>- HEAVY ITEM 요금 처리<br>- STORAGE 요금 처리<br>- 각 섹션 이벤트 핸들링 포함                                    
| **`js/krwConverter.js`**   | - 환율 API 호출<br>- 총액을 KRW로 변환하여 표시                                                                                       
| **`js/main.js`**           | - 앱 초기 진입점<br>- 이벤트 바인딩<br>- fetchData → render → calculate 흐름 연결                                                       
| **`js/login.js`**          | - 로그인 토큰 검증 및 리다이렉션 처리 
| **`js/basicCostRows.js`**  | - 기본 배송비 표 구성용 행 생성    
| **`js/extraCostRows.js`**  | - 추가 요금 항목 표 구성용 행 생성  
