司法互助文件智慧處理系統 Demo

使用方式
1. 解壓縮 judicial-document-ai-demo.zip。
2. 以 Chrome、Edge 或 Safari 開啟 login.html；直接開啟 index.html 時，未登入會自動導向登入頁。
3. 第一次開啟時需保持網路連線，以載入 Bootstrap 與 Lucide Icons。
4. 登入頁預設已填入 Demo 帳號與密碼，可直接按「登入」進入系統。

專案結構
- index.html：系統主介面與各功能區塊。
- login.html：獨立登入介面。
- design-tokens/：Design Token 原始規格、產生工具與 Web CSS Variables。
  - design-tokens/tokens.json：Design Token Source of Truth。
  - design-tokens/build-tokens.js：JSON → CSS 產生與同步檢查工具。
  - design-tokens/tokens.css：自動產生的 CSS Variables，請勿直接手動維護。
- css/base.css：全站基礎樣式。
- css/layout.css：Sidebar、Topbar 與頁面框架。
- css/components.css：按鈕、狀態、表格、上傳及進度元件。
- css/pages/：上傳狀態、校對、搜尋、關聯、報告與後台管理等頁面專屬樣式。
- css/components/overlays.css：Modal、Toast 與報告處理狀態。
- css/responsive.css：列印及 RWD 規則。
- js/core/app.js：導覽、Toast、Overlay 等共用功能。
- js/auth-guard.js：Demo 登入狀態與未登入導向。
- js/features/：文件作業、搜尋報告、後台管理、登入與使用者選單功能。
- js/bootstrap.js：初始化各功能模組。

色彩調整
全站 Design Token 由 design-tokens/tokens.json 管理，並產生至 design-tokens/tokens.css，例如：

:root {
  --color-action-primary: #2475c5;
  --color-status-success: #16877f;
  --color-status-warning: #b7791f;
  --color-status-danger: #bd3d4d;
}

若要調整 Token，請修改 design-tokens/tokens.json，再於專案根目錄執行：

node design-tokens/build-tokens.js
node design-tokens/build-tokens.js --check

一般頁面／元件排版仍直接修改 css/ 下對應檔案；不要直接修改 generated design-tokens/tokens.css。

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
- 稽核日誌操作紀錄列表與匯出示例
- 帳號管理、組織階層資料範圍及角色權限矩陣
- Sidebar 使用者選單、變更密碼提示、登出與登入流程

備註
- 本版本為純前端互動 Demo，所有案件與文件內容均為虛構示例。
- 未串接後端、OCR、LLM、資料庫、權限矩陣及司法互助回拋 API。
