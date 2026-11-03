# Judicial Reference UI

這個資料夾提供協力廠商參考目前 Judicial Demo 的 HTML 結構與 CSS 元件樣式。

## 用途

```text
design-tokens/
= 設計規範與 Token

reference-ui/
= 現有 Judicial UI 的視覺／元件實作參考
```

`reference-ui/index.html` 不等於正式產品程式碼，也不要求廠商直接複製。

廠商可參考：

- Button
- Form Control
- Table
- Panel / Card
- Badge / Status
- Navigation
- Modal / Overlay
- Empty State
- Responsive layout
- 各 Page 的 spacing / typography / state 樣式

## JavaScript

本 Reference Release **不包含應用程式功能 JavaScript**，因此：

- 導覽切頁不保證可操作
- Modal / Toast / Upload / Search 等互動不保證可操作
- API / Auth / Session 邏輯未提供

僅保留 Lucide CDN 初始化，用於顯示 icon，沒有產品商業邏輯。

## 實作原則

協力廠商應：

1. 以自己的既有框架／HTML 結構為主。
2. 使用 `../design-tokens/tokens.css` 中的 Token。
3. 參考此資料夾的 CSS 了解 Judicial 元件目前的視覺規則。
4. 不必照搬 Judicial HTML class 結構。
5. 若現有 Token 不足，提出 Token 變更需求，不另建一套命名。
