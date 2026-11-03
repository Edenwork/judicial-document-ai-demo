# Judicial Design System — Vendor Reference Release V1.0

提供協力開發廠商依照 Judicial 現有 Design Token 與 UI 視覺規範，調整既有系統版型樣式。

---

## 交付內容

```text
judicial-design-system-vendor-reference-v1.0/
├── README.md
│
├── design-tokens/
│   ├── tokens.css
│   └── tokens.json
│
├── docs/
│   └── DESIGN_TOKEN_GUIDE_VENDOR.md
│
└── reference-ui/
    ├── README.md
    ├── index.html
    └── css/
```

### design-tokens/

#### `tokens.css`

Web 專案實作時使用的 Design Token CSS Variables。

例如：

```css
.button-primary {
  background: var(--color-action-primary);
  color: var(--color-on-dark);
}
```

#### `tokens.json`

Design Token 的完整結構與規格參考。

本次交付不要求協力廠商自行產生 `tokens.css`。

---

## reference-ui/

提供目前 Judicial UI 的 HTML 結構與 CSS 實作參考。

可用於確認：

- Button
- Form Control
- Table
- Card / Panel
- Badge / Status
- Navigation
- Modal / Overlay
- Empty State
- Typography
- Spacing
- Responsive Layout

`reference-ui` 為 **Reference Implementation**，不是要求直接複製的正式產品程式碼。

協力廠商應以自己的既有系統架構為主，例如：

```text
HTML / CSS / JavaScript
Angular
React / Next.js
Vue / Nuxt
Server-side Template
```

並依 Design Token 套用對應樣式。

---

## docs/

`DESIGN_TOKEN_GUIDE_VENDOR.md` 說明：

- Token 架構
- Token 使用方式
- Primitive / Semantic / Component Token 分工
- CSS Migration 原則
- Component CSS 與 Token 的責任範圍
- 哪些值需要 Tokenize
- 哪些 Layout 值可保留在原 CSS
- 廠商交付前檢查項目

實作前建議先閱讀此文件。

---

## 實作原則

請遵循以下原則：

1. 優先使用既有 Design Token。
2. 若已有 Semantic Token，UI 樣式優先使用 Semantic Token。
3. Component 共用樣式使用既有 Component Token。
4. 不自行建立同義 Token 或另一套 Token 命名。
5. 單頁 Layout、Graph、Document、Print 等局部數值可保留原 CSS。
6. 不需要為了「全部 Token 化」而把所有 px 值建立成 Token。
7. 不直接修改交付的 Token 定義。
8. 若現有 Token 不足，請提出變更需求。
9. 完成後需進行 Desktop / Tablet / Mobile Visual QA。

---

## Token 變更流程

如實作時發現現有 Token 不足，請提供：

```text
使用頁面／元件
Selector 或元件名稱
目前值
希望值
用途
預期影響範圍
```

由 Design Token 維護方統一評估後更新。

建議流程：

```text
廠商提出需求
        ↓
Design Token 維護方評估
        ↓
更新 Token
        ↓
重新提供 tokens.json / tokens.css
        ↓
廠商更新實作
        ↓
Visual QA
```

---

## 簡單理解

```text
Design Token
= 共用設計規則

Reference UI
= Judicial 現有元件長什麼樣

Vendor Application
= 廠商自己的系統與版型
```

不需要照搬 Judicial 的 HTML，只需依既有系統架構套用 Design Token，並以 Reference UI 對照元件視覺。
