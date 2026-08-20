司法互助文件智慧處理系統 Demo

使用方式
1. 解壓縮 judicial-document-ai-demo.zip。
2. 以 Chrome、Edge 或 Safari 開啟 index.html。
3. 第一次開啟時需保持網路連線，以載入 Bootstrap 與 Lucide Icons。

專案結構
- index.html：頁面語意與各功能區塊。
- css/tokens.css：全站色彩、陰影及圓角設計變數。
- css/base.css：全站基礎樣式。
- css/layout.css：Sidebar、Topbar 與頁面框架。
- css/components.css：按鈕、狀態、表格、上傳及進度元件。
- css/pages/：上傳狀態、校對、搜尋、關聯、報告與後台管理等頁面專屬樣式。
- css/components/overlays.css：Modal、Toast 與報告處理狀態。
- css/responsive.css：列印及 RWD 規則。
- js/core/app.js：導覽、Toast、Overlay 等共用功能。
- js/features/：文件清單、上傳、校對、搜尋、關聯及報告功能。
- js/bootstrap.js：初始化各功能模組。

色彩調整
全站顏色都集中於 css/tokens.css 的 :root，例如：

:root {
  --color-primary: #2475c5;
  --color-success: #16877f;
  --color-warning: #b7791f;
  --color-danger: #bd3d4d;
}

若要調整主色，優先修改 tokens.css，不需逐頁搜尋色碼。

可操作功能
- 批次上傳示例文件、AI 處理階段動畫與處理狀態篩選
- 文件清單篩選、勾選多份正常文件及批次確認
- 原始請求書與 AI 擷取欄位左右對照
- 正常欄位批次確認、異常欄位修改與主管送審
- 版本紀錄唯讀切換
- 自然語言查詢、條件式篩選及文件結果連結
- 多文件勾選、彙整與網頁／PDF／Word 摘要報告輸出
- 案件／文件關聯圖與節點側欄
- 網頁、PDF（瀏覽器列印）及 Word 報告輸出
- 主管核准與退回操作
- 稽核日誌篩選、操作明細及異動前後內容對照
- 帳號管理、組織階層資料範圍及角色權限矩陣

備註
- 本版本為純前端互動 Demo，所有案件與文件內容均為虛構示例。
- 未串接後端、OCR、LLM、資料庫、權限矩陣及司法互助回拋 API。
