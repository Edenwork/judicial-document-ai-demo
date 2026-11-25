# OCR 原稿檢視器整合手冊

本手冊說明 TWAI Cloud OCR 檢視器原型的實作，供協力廠商開發文件檢視頁時參考。原型在原稿上顯示當頁的 OCR 區塊藍框，滑鼠移入藍框時顯示該區塊的信心度，移出時隱藏提示。

[開啟藍框與信心度 Demo](https://edenwork.github.io/judicial-document-ai-demo/index.html?page=ocr-viewer&document=20261007_001)  
在「原稿影像」中將滑鼠移到藍框上，即可查看該區塊的信心度。

## 1. TWAI Cloud 原型如何顯示原稿與藍框

1. 原稿使用專案內的逐頁 WebP。以示範文件第 1 頁為例，`<img id="ocrPageImage">` 顯示 `assets/ocr/20261007_001-1.webp`。
2. `setPage(pageNo)` 取出同一文件、同一頁的 JSONL 字串，用 `JSON.parse` 讀取該頁 OCR 結果，再呼叫 `renderBoxes(record)`。
3. `renderBoxes(record)` 在原稿上方的 SVG 裡畫出藍框，並把每個框的滑鼠事件與同一區塊的信心度連接起來。

## 2. JSONL 欄位與互動

以下為自行編寫的單頁 JSONL 範例。JSONL 每一行是一筆 JSON。

```json
{"page_no":1,"page":{"width":1200,"height":1600},"regions":[{"bbox":[[120,240],[420,240],[420,288],[120,288]],"confidence":0.93}]}
```

| 資料或互動 | 程式怎麼做 |
| --- | --- |
| 藍框位置 | JavaScript 讀取當頁的 `regions[].bbox`，把 `[x, y]` 座標依序連成 SVG `<polygon>`，疊在原稿圖上。 |
| 圖片縮放 | 用 OCR 頁面的 `page.width` 與 `page.height` 設定 SVG 的 `viewBox="0 0 width height"`。讓 SVG 的顯示寬高等於原稿圖的顯示寬高，藍框便會隨圖一起縮放。 |
| 滑過顯示分數 | `pointerenter` 取得同一個區塊的 `confidence`，在藍框下方顯示提示。用框的水平中心及最下方座標定位。滑鼠移出時由 `pointerleave` 隱藏提示。 |

信心度讀取 `regions[].confidence`。原型直接顯示數值，例如「信心指數 0.93」，缺值時顯示「未提供」。

## 3. 原型對照檔案

以下路徑以原型 Git 專案根目錄為基準。

| 給 RD 的內容 | 用途 |
| --- | --- |
| `assets/ocr/20261007_001-data.js` | 查看逐頁 OCR 資料裡的 `bbox` 與 `confidence` 格式。原型把 JSONL 字串包在 JavaScript 裡供靜態展示，整合時可直接使用既有 JSONL 或由 API 回傳解析後的單頁資料。 |
| `js/features/ocr.js` | 從 `renderBoxes(record)` 參考 SVG、藍框與 hover 的實作，從 `setPage(pageNo)` 參考切換圖片與當頁 OCR 資料的時機。 |
| `index.html` | 找 `.ocr-page-preview`，參考 `#ocrPageImage`、`#ocrBoxOverlay` 和 `#ocrBoxTooltip` 的結構。 |
| `css/pages/ocr.css` | 參考 `.ocr-page-preview`、`.ocr-box-overlay`、`.ocr-bounding-box` 和 `.ocr-box-tooltip` 的定位、藍框樣式與滑鼠事件設定。 |

## 4. TWAI Cloud 原型的圖層結構

以下片段取自原型。`<img>`、SVG 藍框層與提示元素共用同一個容器。原稿的 `src` 由 `setPage(pageNo)` 設定。

```html
<div class="ocr-page-preview">
  <img id="ocrPageImage" alt="">
  <svg id="ocrBoxOverlay" class="ocr-box-overlay"
       preserveAspectRatio="none" aria-hidden="true" hidden></svg>
  <span id="ocrBoxTooltip" class="ocr-box-tooltip" hidden></span>
</div>
```

- 原稿容器設為 `position: relative`。圖片設為區塊元素，保持原始長寬比。SVG 設為 `position: absolute; inset: 0; width: 100%; height: 100%`，覆蓋原稿。
- SVG 整層設 `pointer-events: none`，每個藍框多邊形設 `pointer-events: all`，讓滑鼠可以觸發區塊內的提示。提示本身設 `pointer-events: none`，避免干擾滑鼠事件。
- 將當頁解析後的 OCR 記錄傳給檢視元件。在原型的實作中，由 `renderBoxes(record)` 清除舊框、設定 `viewBox`、建立多邊形並綁定事件。可將這段邏輯接到廠商現有的頁碼切換與畫面更新流程。

## 5. 協力廠商網站的整合示例

以廠商檢視頁的 `page=4` 為例。廠商頁面的「原稿影像」已透過 `<img>` 載入 `/api/app/v1/documents/{documentId}/pages/4/image`。

1. 沿用廠商原有的圖片來源，在主預覽的 `<img>` 上方加入 SVG 與提示，結構可參考第 4 節。
2. 取得廠商手上同一份 PDF、同一版本的 JSONL，選出 `page_no = 4` 的記錄。如果前端能讀取 JSONL，可按行解析。若 JSONL 只在後端，則由廠商既有介面提供單頁 OCR 資料，或依系統架構增加逐頁查詢。各文件可共用同一套畫框程式。
3. 圖片與對應的 OCR 資料就緒後，使用該頁的 `page.width`、`page.height`、`regions[].bbox` 和 `regions[].confidence` 畫框。若圖片 API 輸出的頁面影像只有等比縮放，可直接用 OCR 尺寸作為 `viewBox`。如果圖片經過旋轉、裁切、校正或加留白，須先把座標換算到實際圖面。容器有 padding 或圖片以 `object-fit: contain` 顯示時，SVG 也要對準實際圖面。
4. 切頁時清除舊框和提示。若資料為非同步載入，只套用仍與當前文件版本及頁碼相符的結果。沒有可用 OCR 區塊時，仍顯示原稿。

## 6. 驗收項目

- 開啟一份有 OCR 結果的多頁 PDF，確認所選頁面的藍框與影像上的文字位置對齊。
- 滑過兩個信心度不同的框，核對提示值與 JSONL 中各自的 `confidence`。移出框後提示消失。
- 縮放視窗或使用網站既有的縮放功能，藍框仍與原稿對齊。
- 快速切換頁碼或文件時，畫面只顯示目前頁的藍框與信心度。
- 開啟沒有 OCR 區塊的頁面時，原稿仍可正常顯示。
