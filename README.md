poeis_extracost.json


{
    "links": [
        {
            "label": "OFC",
            "url": ""
        },
        {
            "label": "NOTION",
            "url": ""
        }
    ],
    "화폐단위": "$/€",
  
    "basic-cost-1": {
        "name": "",
        "description": "",
        "NonDiplomat": {
            "CONSOLE": {"단가" : },
            "20DRY": {"단가" : },
            "40HC": {"단가" : }
        },
        "Diplomat": {
            "CONSOLE": {"단가" : },
            "20DRY": {"단가" : },
            "40HC": {"단가" : }
        }
    },
    "extra-cost-1": {
        "name": "FULL SETTING",
        "description": "",
            "CONSOLE": {"단가" : },
            "20DRY": {"단가" : },
            "40HC": {"단가" : }
        },
    "STAIR CHARGE": {
        "description": "INCLUDED",
        "CBM단가": 0
    },
    "HEAVY ITEM": {
        "description": "MORE THAN 100KG",
        "단위": "ITEM",
        "단가": 100
    },
      "STORAGE CHARGE": {
        "description": "미확인",
        "단위": "주",
        "무료 보관 기간": 0,
        "보관 비용": {
          "20DRY": 0,
          "40HC": 0,
          "단가": 0,
          "CBM 범위": {
            "1-10": 50,
            "11-15": 60,
            "16-20": 80,
            "21-25": 100,
            "26-30": 120,
            "31-35": 150,
            "36-60": 200
          }
        }
      },
    "additional-info-1": {
        "name": "진행 전 확인 사항",
        "description": ""
    },
    "additional-info-2": {
        "name": "사용 가능 선사",
        "description": "HMM : T/T 40 DAYS"
    },
    "DATA BASE": {
  	  "description": "업데이트 : 2025.05 \n기초자료 : 2024.10 이트너스 비딩조사"
    },
    "includedInfo": {
        "description": "\\li포함 1\\\/li\n\\li포함 2\\\/li\n\\li포함 3\\\/li"
    },
    "excludedInfo": {
        "description": "\\li불포함 1\\\/li\n\\li불포함 2\\\/li\n\\li불포함 3\\\/li"
    }
}


---------------------------------------------
poedropdown.json

[
  {
    "value": "beirut",
    "label": "New York, USA"
  }
]

--------------------------------------------
poeis_tariff.json

{
  "nonDiplomat": {
      "CONSOLE": {
        "description": "", 
        "ANY": "별도 문의"
      },
      "20DRY": {
        "description": "1-30CBM\n진행 전에 견적 요청 필수", 
        "ANY": "별도 문의"
      },
      "40HC": {
        "description": "31-60CBM\n진행 전에 견적 요청 필수", 
        "ANY": "별도 문의"
      }
  },
  "diplomat": {
      "CONSOLE": {
        "description": "", 
        "ANY": "별도 문의"
      },
      "20DRY": {
        "description": "1-30CBM\n진행 전에 견적 요청 필수", 
        "ANY": "별도 문의"
      },
      "40HC": {
        "description": "31-60CBM\n진행 전에 견적 요청 필수", 
        "ANY": "별도 문의"
      }
  },
  "containerType": [
    "CONSOLE",
    "20DRY",
    "40HC"
  ]
}
