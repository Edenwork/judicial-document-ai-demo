(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const page = document.getElementById("page-pending-return");
  if (!App || !page) return;

  App.pageMeta["pending-return"] = ["待回拋案件", "查找待回拋案件"];

  App.pageMeta["pending-return-document"] = ["文件 JSON", ""];

  // UI demonstration records; replace with the pending-return API when available.
  const documents = [
    {
      id: "scan-20261119",
      fileName: "掃描_20261119.pdf",
      documentNumber: "1080062971",
      caseType: "我國對外國請求（刑事）",
      uploadedBy: "Justin.Lee",
      uploadedAt: "2026-11-19",
      jsonSource: "調查取證（臺請陸）附件資料",
      documentJson:
        "{\n" +
        "  \"schemaVersion\": \"1.0.0\",\n" +
        "  \"requestId\": \"req-demo-tb-0003\",\n" +
        "  \"收文文號\": \"1152051023\",\n" +
        "  \"caseType\": \"TB\",\n" +
        "  \"caseTypeName\": \"調查取證(臺請陸)\",\n" +
        "  \"sourceUpdatedAt\": \"2026-11-06T09:00:00+08:00\",\n" +
        "  \"generatedAt\": \"2026-11-06T10:00:00+08:00\",\n" +
        "  \"data\": {\n" +
        "    \"TB_Investigation\": {\n" +
        "      \"地區\": \"01\",\n" +
        "      \"國別\": \"CN\",\n" +
        "      \"聯合辦案\": false,\n" +
        "      \"密件\": false,\n" +
        "      \"緊急請求案件\": true,\n" +
        "      \"高風險案件\": true,\n" +
        "      \"不予統計\": false,\n" +
        "      \"不予統計原因\": null,\n" +
        "      \"辦畢日期\": null,\n" +
        "      \"權責機關\": \"0101\",\n" +
        "      \"收文日期\": \"2026-09-18\",\n" +
        "      \"收文文號\": \"1152051023\",\n" +
        "      \"請求機關\": \"0235\",\n" +
        "      \"請求機關案號\": \"115年度檢傳字第00038號\",\n" +
        "      \"受理說明\": \"本署就陳〇銘等六人跨境電信詐欺案，依兩岸互助約定，向大陸地區提出訊問相對人、調取書證及證據之請求，業已受理。\",\n" +
        "      \"備註\": \"案件列高風險；大陸側協助機關以各地檢察署為主，俟回執回傳後續辦。\",\n" +
        "      \"刑事\": true,\n" +
        "      \"民事\": false,\n" +
        "      \"行政及其他\": false,\n" +
        "      \"案由說明\": \"跨境電信詐欺案；請求大陸地區協助訊問相對人及證人、調取銀行往來與通聯資料等書證、證據，必要時為搜索、扣押與鑑定。\",\n" +
        "      \"送達文書\": true,\n" +
        "      \"裁判認可\": false,\n" +
        "      \"行政協查\": false,\n" +
        "      \"分享\": false,\n" +
        "      \"取得證據\": true,\n" +
        "      \"取得證言及陳述\": true,\n" +
        "      \"提供書證\": true,\n" +
        "      \"提供物證\": true,\n" +
        "      \"提供視聽資料\": false,\n" +
        "      \"確定關係人所在或確認其身分\": true,\n" +
        "      \"勘驗\": false,\n" +
        "      \"鑑定\": true,\n" +
        "      \"檢查\": false,\n" +
        "      \"訪視\": true,\n" +
        "      \"調查\": true,\n" +
        "      \"搜索\": true,\n" +
        "      \"扣押\": true,\n" +
        "      \"扣押物品\": \"行動裝置、帳冊、印鑑及車輛等得為證據或贓物之物。\",\n" +
        "      \"罪贓(犯罪所得)移交\": true,\n" +
        "      \"罪贓幣別\": \"CNY\",\n" +
        "      \"罪贓金額\": \"1500000.00\",\n" +
        "      \"禁止處分財產\": true,\n" +
        "      \"禁止處分幣別\": \"CNY\",\n" +
        "      \"禁止處分金額\": \"3000000.00\",\n" +
        "      \"執行沒收裁判\": false,\n" +
        "      \"沒收或追徵幣別\": null,\n" +
        "      \"沒收或追徵金額\": null,\n" +
        "      \"追徵\": false,\n" +
        "      \"追徵幣別\": null,\n" +
        "      \"追徵金額\": null,\n" +
        "      \"變價\": true,\n" +
        "      \"變價幣別\": \"TWD\",\n" +
        "      \"變價金額\": \"850000.00\",\n" +
        "      \"其他\": false,\n" +
        "      \"其他說明\": null\n" +
        "    },\n" +
        "    \"TB_Investigation_Defendant\": [\n" +
        "      {\n" +
        "        \"TBB_DefCHTName\": \"陳〇銘\",\n" +
        "        \"TBB_DefNote\": \"相對人（主要被告）。\"\n" +
        "      },\n" +
        "      {\n" +
        "        \"TBB_DefCHTName\": \"李〇婷\",\n" +
        "        \"TBB_DefNote\": \"證人（銀行往來資料提供人）。\"\n" +
        "      }\n" +
        "    ],\n" +
        "    \"TB_Investigation_Crime\": [\n" +
        "      {\n" +
        "        \"TBC_Crime\": \"01\"\n" +
        "      },\n" +
        "      {\n" +
        "        \"TBC_Crime\": \"02\"\n" +
        "      }\n" +
        "    ],\n" +
        "    \"TB_Investigation_Delivery\": [\n" +
        "      {\n" +
        "        \"TBE_DeliveryDate\": \"2026-09-20\",\n" +
        "        \"TBE_DeliveryNO\": \"115年度檢傳字第00038號\"\n" +
        "      }\n" +
        "    ],\n" +
        "    \"TB_Investigation_Reply\": [\n" +
        "      {\n" +
        "        \"TBF_ReplyNO\": \"115年度回執字第00012號\",\n" +
        "        \"TBF_ReplyDate\": \"2026-10-15\",\n" +
        "        \"TBF_ReceiveNO\": \"陸-回執-CN-2026-10-14-0038\",\n" +
        "        \"TBF_ReceiveDate\": \"2026-10-14\",\n" +
        "        \"TBF_ReplyContent\": \"01\",\n" +
        "        \"TBF_NonCompleteReason\": null,\n" +
        "        \"TBF_Note\": \"大陸側檢察署已完成訊問相對人及調取銀行资料，回執及證文随附。\"\n" +
        "      }\n" +
        "    ],\n" +
        "    \"TB_Investigation_Urge\": [\n" +
        "      {\n" +
        "        \"TBG_ReceiveNO\": \"115年度檢傳字第00038號\",\n" +
        "        \"TBG_ReceiveDate\": \"2026-09-20\",\n" +
        "        \"TBG_SendNO\": \"115年度催字第00005號\",\n" +
        "        \"TBG_SendDate\": \"2026-10-22\",\n" +
        "        \"TBG_Note\": \"案期緊迫，已函催大陸側加快辦理訊問與證文交付。\"\n" +
        "      }\n" +
        "    ]\n" +
        "  }\n" +
        "}\n"
    },
    {
      id: "tf-1152051026",
      fileName: "人身自由(臺請陸).pdf",
      documentNumber: "1152051026",
      caseType: "人身自由(臺請陸)",
      uploadedBy: "Justin.Lee",
      uploadedAt: "2026-11-19",
      jsonSource: "人身自由(臺請陸)附件資料",
      documentJson:
        "{\n" +
        "  \"結構版本\": \"1.0.0\",\n" +
        "  \"請求識別碼\": \"req-demo-tf-0006\",\n" +
        "  \"收文文號\": \"1152051026\",\n" +
        "  \"案件類型代碼\": \"TF\",\n" +
        "  \"案件類型名稱\": \"人身自由(臺請陸)\",\n" +
        "  \"來源更新時間\": \"2026-11-06T09:00:00+08:00\",\n" +
        "  \"回應產生時間\": \"2026-11-06T10:00:00+08:00\",\n" +
        "  \"案件資料\": {\n" +
        "    \"基本資料\": {\n" +
        "      \"地區\": null,\n" +
        "      \"省分\": null,\n" +
        "      \"聯合辦案\": false,\n" +
        "      \"密件\": false,\n" +
        "      \"緊急請求案件\": true,\n" +
        "      \"高風險案件\": false,\n" +
        "      \"不予統計\": false,\n" +
        "      \"不予統計原因\": null,\n" +
        "      \"辦畢日期\": null,\n" +
        "      \"權責機關\": null,\n" +
        "      \"收文文號\": \"1152051026\",\n" +
        "      \"收文日期\": \"2026-11-04\",\n" +
        "      \"已通知在台家屬或服務機構\": false,\n" +
        "      \"受理說明\": \"在臺家屬陳情，請求協查臺籍人士在大陸遭刑事拘留之情形。\",\n" +
        "      \"備註\": \"模擬案件：福建省；已向陸方查詢拘留原因及處所，尚待回覆。\",\n" +
        "      \"人身自由限制時點日期\": \"2026-11-02\",\n" +
        "      \"通報花費\": null,\n" +
        "      \"法律依據備註\": \"依兩岸共同打擊犯罪及司法互助協議第12條辦理人身自由限制訊息通報。\"\n" +
        "    },\n" +
        "    \"法律依據\": [\n" +
        "      {\n" +
        "        \"法律依據\": null\n" +
        "      }\n" +
        "    ],\n" +
        "    \"通知執行機關\": [\n" +
        "      {\n" +
        "        \"通知執行機關\": null\n" +
        "      }\n" +
        "    ],\n" +
        "    \"當事人\": [\n" +
        "      {\n" +
        "        \"中文姓名\": \"測試當事人甲\",\n" +
        "        \"性別\": null,\n" +
        "        \"身分證號\": \"TESTID0001\",\n" +
        "        \"生日\": \"1990-01-01\",\n" +
        "        \"地址\": null,\n" +
        "        \"人身自由限制類型\": null\n" +
        "      }\n" +
        "    ],\n" +
        "    \"送件資料\": []\n" +
        "  }\n" +
        "}\n"
    },
    {
      id: "ti-1152051029",
      fileName: "受刑人移交(陸請臺).pdf",
      documentNumber: "1152051029",
      caseType: "受刑人移交(陸請臺)",
      uploadedBy: "Justin.Lee",
      uploadedAt: "2026-11-19",
      jsonSource: "受刑人移交(陸請臺)附件資料",
      documentJson:
        "{\n" +
        "  \"結構版本\": \"1.0.0\",\n" +
        "  \"請求識別碼\": \"req-demo-ti-0009\",\n" +
        "  \"收文文號\": \"1152051029\",\n" +
        "  \"案件類型代碼\": \"TI\",\n" +
        "  \"案件類型名稱\": \"受刑人移交(陸請臺)\",\n" +
        "  \"來源更新時間\": \"2026-11-06T09:00:00+08:00\",\n" +
        "  \"回應產生時間\": \"2026-11-06T10:00:00+08:00\",\n" +
        "  \"案件資料\": {\n" +
        "    \"基本資料\": {\n" +
        "      \"地區\": null,\n" +
        "      \"省分\": null,\n" +
        "      \"聯合辦案\": false,\n" +
        "      \"密件\": false,\n" +
        "      \"緊急請求案件\": false,\n" +
        "      \"高風險案件\": false,\n" +
        "      \"非協議管道\": false,\n" +
        "      \"不予統計\": false,\n" +
        "      \"不予統計原因\": null,\n" +
        "      \"權責機關\": null,\n" +
        "      \"收文文號\": \"1152051029\",\n" +
        "      \"收文日期\": \"2026-11-04\",\n" +
        "      \"大陸地區判決日期\": \"2026-09-01\",\n" +
        "      \"受理說明\": \"陸方提出受刑人移交請求，擬將在陸服刑之臺籍受刑人接返回臺繼續服刑。\",\n" +
        "      \"備註\": \"模擬案件；須確認三方同意及依法辦理審查與刑期轉換。\",\n" +
        "      \"中文姓名\": null,\n" +
        "      \"與被告關係\": null,\n" +
        "      \"申請人其他資訊\": \"陸方提出移交請求，受刑人意願待確認。\",\n" +
        "      \"被告中文姓名\": \"測試受刑人乙\",\n" +
        "      \"被告性別\": null,\n" +
        "      \"被告證號\": \"TESTID0002\",\n" +
        "      \"被告出生日期\": \"1980-05-12\",\n" +
        "      \"被告在臺通緝情形\": null,\n" +
        "      \"被告其他資訊\": \"模擬涉及販賣毒品案件，判決已確定。\",\n" +
        "      \"服刑處所\": \"福建省某監獄（模擬）\",\n" +
        "      \"原始確定判決刑期\": \"有期徒刑10年\",\n" +
        "      \"最後宣告減刑之刑期\": \"有期徒刑8年\"\n" +
        "    },\n" +
        "    \"案由\": [\n" +
        "      {\n" +
        "        \"案由\": null\n" +
        "      }\n" +
        "    ]\n" +
        "  }\n" +
        "}\n"
    },
    {
      id: "tk-1152051031",
      fileName: "緝捕遣返請求(陸請臺).pdf",
      documentNumber: "1152051031",
      caseType: "緝捕遣返請求(陸請臺)",
      uploadedBy: "Justin.Lee",
      uploadedAt: "2026-11-19",
      jsonSource: "緝捕遣返請求(陸請臺)附件資料",
      documentJson:
        "{\n" +
        "  \"結構版本\": \"1.0.0\",\n" +
        "  \"請求識別碼\": \"req-demo-tk-0011\",\n" +
        "  \"收文文號\": \"1152051031\",\n" +
        "  \"案件類型代碼\": \"TK\",\n" +
        "  \"案件類型名稱\": \"緝捕遣返請求(陸請臺)\",\n" +
        "  \"來源更新時間\": \"2026-11-06T09:00:00+08:00\",\n" +
        "  \"回應產生時間\": \"2026-11-06T10:00:00+08:00\",\n" +
        "  \"案件資料\": {\n" +
        "    \"基本資料\": {\n" +
        "      \"地區\": null,\n" +
        "      \"省分\": null,\n" +
        "      \"聯合辦案\": false,\n" +
        "      \"密件\": false,\n" +
        "      \"緊急請求案件\": true,\n" +
        "      \"高風險案件\": false,\n" +
        "      \"非協議管道\": false,\n" +
        "      \"不予統計\": false,\n" +
        "      \"不予統計原因\": null,\n" +
        "      \"權責機關\": null,\n" +
        "      \"收文日期\": \"2026-11-04\",\n" +
        "      \"收文文號\": \"1152051031\",\n" +
        "      \"請求機關\": null,\n" +
        "      \"請求機關發文文號\": \"TEST-DOC-11-01\",\n" +
        "      \"請求機關發文日期\": \"2026-11-04\",\n" +
        "      \"受理說明\": \"陸方請求協助緝捕涉嫌詐欺而外逃至臺灣之刑事犯罪嫌疑人，並依法辦理遣返。\",\n" +
        "      \"備註\": \"模擬案件；依兩岸司法互助協議第6條辦理，尚待權責機關審查。\",\n" +
        "      \"中文姓名\": null,\n" +
        "      \"其他資訊\": null,\n" +
        "      \"被告中文姓名\": \"測試被告丙\",\n" +
        "      \"被告英文姓名\": null,\n" +
        "      \"被告證號\": \"TESTID0003\",\n" +
        "      \"被告出生日期\": \"1988-03-15\",\n" +
        "      \"被告英文地址\": null,\n" +
        "      \"被告其他資訊\": \"模擬涉及詐欺案件，陸方請求協查；非已完成遣返。\",\n" +
        "      \"日期\": null,\n" +
        "      \"期間\": null\n" +
        "    },\n" +
        "    \"案由\": [\n" +
        "      {\n" +
        "        \"案由\": null\n" +
        "      }\n" +
        "    ],\n" +
        "    \"通緝機關\": [\n" +
        "      {\n" +
        "        \"通緝機關\": null\n" +
        "      }\n" +
        "    ]\n" +
        "  }\n" +
        "}\n"
    },
    {
      id: "scan-20260910-0921",
      fileName: "掃描_20260910_0921.pdf",
      documentNumber: "1080065200",
      caseType: "我國對外國請求（刑事）",
      uploadedBy: "lisa.wu",
      uploadedAt: "2026-09-10",
      jsonSource: "法務部函（副本）・文件擷取示範",
      documentJson: {
        schemaVersion: "1.0.0",
        requestId: "req-demo-se-0001",
        caseTypeName: "外國對我國請求（刑事）",
        data: {
          文件基本資料: {
            文件類型: "法務部函",
            版本: "副本",
            清單文號: "1080065200",
            發文日期: "2021-03-24",
            發文機關: "法務部",
            受文機關: "法務部國際及兩岸法律司",
            速別: "最速件",
            主旨: "瑞典就涉嫌違反著作權法案件向我國提出刑事司法互助補充請求。"
          },
          請求基本資料: {
            請求方: { 國家: "瑞典", 國別代碼: "SE" },
            受請求方: { 地區: "臺灣", 受理機關: "法務部" },
            請求類型: "補充請求",
            案由: "涉嫌違反著作權法"
          },
          辦理事項: [
            {
              項次: 1,
              事項: "詢問證人",
              對象: "能提供涉案比特幣錢包所有人資訊的證人",
              預期取得資料: ["證人說明", "書面證明"]
            },
            {
              項次: 2,
              事項: "確認可取得資料的管道",
              適用條件: "資料僅能在歐洲取得",
              待確認資料: ["國家", "公司", "聯絡對象"]
            }
          ],
          後續處理: {
            辦理指示: "請續依法辦理瑞典提出的補充請求並函復。",
            函復期限: null,
            實際函復文號: null,
            實際函復日期: null
          },
          附件資料: {
            原函索引: "說明五",
            附件明細: null
          },
          來源頁次: {
            已提供頁碼: [1],
            文件總頁數: 2,
            待補頁碼: [2],
            備註: "現有頁面未包含說明五，無法確認附件名稱與件數。"
          }
        }
      }
    },
    {
      id: "scan-20260910-0912-a",
      fileName: "掃描_20260910_0912_重掃.pdf",
      documentNumber: "1080065107",
      caseType: "我國對外國請求（刑事）",
      uploadedBy: "lisa.wu",
      uploadedAt: "2026-09-10",
      jsonSource: "外交部轉函・文件擷取示範",
      documentJson: {
        schemaVersion: "1.0.0",
        requestId: "req-demo-se-0001",
        caseTypeName: "外國對我國請求（刑事）",
        data: {
          文件基本資料: {
            文件類型: "外交部函",
            清單文號: "1080065107",
            發文日期: "2021-03-17",
            發文機關: "外交部",
            正本受文者: ["法務部"],
            副本受文者: ["瑞典貿易暨投資委員會台北辦事處", "駐瑞典代表處"],
            速別: "最速件",
            主旨: "轉送瑞典就涉嫌違反著作權案件提出的司法互助補充請求。"
          },
          請求基本資料: {
            請求方: { 國家: "瑞典", 國別代碼: "SE" },
            受請求方: { 地區: "臺灣", 受理機關: "法務部" },
            請求類型: "補充請求",
            案由: "涉嫌違反著作權法"
          },
          來函依據: [
            {
              來函機關: "瑞典貿易暨投資委員會台北辦事處",
              來函日期: "2021-03-10",
              來函文號: null
            }
          ],
          轉送紀錄: [
            {
              轉送日期: "2021-03-17",
              轉送機關: "外交部",
              收受機關: "法務部",
              方式: "紙本寄送",
              辦理內容: "檢送司法互助補充請求書及相關資料。"
            }
          ],
          附件資料: [
            {
              項次: 1,
              名稱: "瑞典貿易暨投資委員會台北辦事處來函",
              版本: "影本",
              日期: "2021-03-10"
            },
            {
              項次: 2,
              名稱: "司法互助請求書",
              版本: "正本",
              日期: null
            }
          ],
          來源頁次: {
            已提供頁碼: [1],
            文件總頁數: 1,
            待補頁碼: []
          }
        }
      }
    },
    {
      id: "scan-20260910-0912-b",
      fileName: "掃描_20261011_1014.pdf",
      documentNumber: "1080065107",
      caseType: "我國對外國請求（刑事）",
      uploadedBy: "lisa.wu",
      uploadedAt: "2026-10-10",
      jsonSource: "瑞典司法互助補充請求書（中文譯本）・文件擷取示範",
      documentJson: {
        schemaVersion: "1.0.0",
        requestId: "req-demo-se-0001",
        caseTypeName: "外國對我國請求（刑事）",
        data: {
          文件基本資料: {
            文件類型: "刑事犯罪案件司法協助補充申請",
            版本: "中文譯本",
            清單文號: "1080065107",
            請求日期: "2021-01-22",
            譯文認證日期: "2021-01-28",
            主旨: "就涉嫌違反著作權法案件補充請求詢問證人。"
          },
          請求基本資料: {
            請求方: { 國家: "瑞典", 國別代碼: "SE", 請求機關: "瑞典國家檢察部" },
            受請求方: { 地區: "臺灣", 受理機關: "臺灣有管轄權的司法部門" },
            請求類型: "補充請求",
            案由: "涉嫌違反著作權法",
            法律依據: "互惠原則"
          },
          證人詢問: [
            {
              項次: 1,
              詢問對象: "虛擬資產平台的知情代表",
              待查事項: "確認涉案比特幣錢包所有人",
              可接受的回覆形式: ["證人詢問紀錄", "公司代表的書面證明"]
            },
            {
              項次: 2,
              詢問對象: "虛擬資產平台的知情代表",
              適用條件: "資料僅能在歐洲取得",
              待查事項: "確認可提供資料的國家、公司與有權提供資料的人員"
            }
          ],
          保密與時效: {
            請求保密: true,
            保密對象: "相關客戶",
            保密內容: "請勿向相關客戶透露所請求的措施，以免影響調查。",
            時效說明: "存在證據遭移轉或銷毀的風險。",
            指定完成期限: null
          },
          來源頁次: {
            已提供頁碼: [1, 2],
            文件總頁數: 2,
            待補頁碼: []
          }
        }
      }
    }
  ];
  const search = document.getElementById("pendingReturnSearch");
  const body = document.getElementById("pendingReturnBody");
  const count = document.getElementById("pendingReturnCount");
  const summary = document.getElementById("pendingReturnPageSummary");
  const pageNumbers = document.getElementById("pendingReturnPageNumbers");
  const previousPage = document.getElementById("pendingReturnPrevPage");
  const nextPage = document.getElementById("pendingReturnNextPage");
  const dateHeading = document.getElementById("pendingReturnDateHeading");
  const dateSort = document.getElementById("pendingReturnDateSort");
  const dateDirection = document.getElementById("pendingReturnDateDirection");
  const detailTitle = document.getElementById("pendingReturnDocumentTitle");
  const detailNumber = document.getElementById("pendingReturnDocumentNumber");
  const jsonSource = document.getElementById("pendingReturnJsonSource");
  const defaultJsonSource = jsonSource.textContent;
  const jsonBlock = document.getElementById("pendingReturnJsonBlock");
  const jsonContent = document.getElementById("pendingReturnJson");
  const jsonEmpty = document.getElementById("pendingReturnJsonEmpty");
  const back = document.getElementById("pendingReturnBack");
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let sortDirection = "descending";
  const normalize = value => String(value).normalize("NFKC").toLocaleLowerCase("zh-TW").trim();

  function addCell(row, value, className) {
    const cell = document.createElement("td");
    cell.textContent = value || "—";
    if (className) cell.className = className;
    row.appendChild(cell);
    return cell;
  }

  function renderJson(source) {
    const json = typeof source === "string" ? source : JSON.stringify(source, null, 2);
    const tokens = /("(?:\\.|[^"\\])*")([ \t]*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
    const fragment = document.createDocumentFragment();
    let offset = 0;

    for (const match of json.matchAll(tokens)) {
      const [value, quoted, colon, literal] = match;
      const token = document.createElement("span");
      token.className = "json-" + (colon ? "key" : quoted ? "string" : literal ? "literal" : "number");
      token.textContent = quoted || value;
      fragment.append(json.slice(offset, match.index), token);
      if (colon) fragment.append(colon);
      offset = match.index + value.length;
    }
    fragment.append(json.slice(offset));
    jsonContent.replaceChildren(fragment);
  }

  App.loadPendingReturnDocument = function (id) {
    const item = documents.find(document => document.id === id);
    const hasJson = Boolean(item && item.documentJson);

    detailTitle.textContent = item ? item.fileName : "找不到文件";
    detailNumber.textContent = item ? "文號 " + item.documentNumber : "";
    detailNumber.hidden = !item;
    jsonSource.textContent = item?.jsonSource ?? defaultJsonSource;
    jsonSource.hidden = !hasJson;
    jsonBlock.hidden = !hasJson;
    jsonEmpty.hidden = hasJson;
    if (hasJson) {
      renderJson(item.documentJson);
    } else {
      jsonContent.replaceChildren();
      jsonEmpty.textContent = item ? "目前沒有這份文件的 JSON 資料。" : "請返回待回拋案件，重新選取文件。";
    }
  };

  function render() {
    const query = normalize(search.value);
    const matches = documents.filter(function (item) {
      return normalize([item.fileName, item.documentNumber, item.caseType, item.uploadedBy, item.uploadedAt].join(" ")).includes(query);
    }).sort(function (a, b) {
      // ISO dates sort chronologically; equal dates retain their original order.
      const difference = a.uploadedAt.localeCompare(b.uploadedAt);
      return sortDirection === "ascending" ? difference : -difference;
    });
    dateHeading.setAttribute("aria-sort", sortDirection);
    const descending = sortDirection === "descending";
    dateDirection.textContent = descending ? "↓" : "↑";
    dateSort.title = descending ? "改為最舊在前" : "改為最新在前";
    dateSort.setAttribute("aria-label", "上傳日期：目前" + (descending ? "最新" : "最舊") + "在前，點選" + dateSort.title);
    const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageDocuments = matches.slice(startIndex, startIndex + PAGE_SIZE);
    const fragment = document.createDocumentFragment();

    pageDocuments.forEach(function (item) {
      const row = document.createElement("tr");
      const fileCell = addCell(row, "", "pending-return-file");
      const fileLink = document.createElement("a");
      fileLink.href = "?page=pending-return-document&document=" + encodeURIComponent(item.id);
      fileLink.dataset.documentId = item.id;
      fileLink.textContent = item.fileName;
      fileCell.replaceChildren(fileLink);
      addCell(row, item.documentNumber, "pending-return-document-number");
      addCell(row, item.caseType);
      addCell(row, item.uploadedBy);
      const dateCell = document.createElement("td");
      const date = document.createElement("time");
      dateCell.className = "pending-return-date";
      date.dateTime = item.uploadedAt;
      date.textContent = item.uploadedAt;
      dateCell.appendChild(date);
      row.appendChild(dateCell);
      fragment.appendChild(row);
    });

    if (!matches.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.className = "pending-return-empty";
      cell.textContent = query ? "找不到符合條件的待回拋案件" : "目前沒有待回拋案件";
      row.appendChild(cell);
      fragment.appendChild(row);
    }

    body.replaceChildren(fragment);
    count.textContent = query ? "符合 " + matches.length + " 筆，共 " + documents.length + " 筆" : "共 " + documents.length + " 筆";
    summary.textContent = "第 " + (matches.length ? startIndex + 1 : 0) + "–" + (startIndex + pageDocuments.length) + " 筆，共 " + matches.length + " 筆";
    previousPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
    const buttons = document.createDocumentFragment();
    for (let number = 1; number <= totalPages; number += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-sm audit-page-button" + (number === currentPage ? " active" : "");
      button.dataset.pendingReturnPage = String(number);
      button.textContent = String(number);
      button.setAttribute("aria-label", "第 " + number + " 頁");
      button.setAttribute("aria-current", number === currentPage ? "page" : "false");
      buttons.appendChild(button);
    }
    pageNumbers.replaceChildren(buttons);
  }

  body.addEventListener("click", function (event) {
    const link = event.target.closest("a[data-document-id]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    App.goToPage("pending-return-document", { documentId: link.dataset.documentId });
    detailTitle.focus({ preventScroll: true });
  });

  back.addEventListener("click", function (event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (global.history.state && global.history.state.fromPendingReturn) {
      global.history.back();
    } else {
      App.goToPage("pending-return");
    }
  });

  dateSort.addEventListener("click", function () {
    sortDirection = sortDirection === "descending" ? "ascending" : "descending";
    currentPage = 1;
    render();
  });
  search.addEventListener("input", function () {
    currentPage = 1;
    render();
  });
  previousPage.addEventListener("click", function () {
    currentPage -= 1;
    render();
  });
  nextPage.addEventListener("click", function () {
    currentPage += 1;
    render();
  });
  pageNumbers.addEventListener("click", function (event) {
    const button = event.target.closest("[data-pending-return-page]");
    if (!button) return;
    currentPage = Number(button.dataset.pendingReturnPage);
    render();
  });
  render();
})(window);
