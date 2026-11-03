# Design Token 導入指南（協力廠商版）

**版本：V1.0**  
**用途：** 提供協力開發廠商依照既有 Design Token，調整現有網站／系統版型樣式。

---

## 1. 本次交付內容

```text
judicial-design-system-vendor-reference-v1.0/
├── design-tokens/
│   ├── tokens.css
│   └── tokens.json
├── reference-ui/
│   ├── index.html
│   ├── README.md
│   └── css/
└── docs/
    └── DESIGN_TOKEN_GUIDE_VENDOR.md
```

| 檔案 | 用途 | 廠商是否直接修改 |
|---|---|---|
| `design-tokens/tokens.css` | Web 實作時直接引用的 CSS Variables | **否** |
| `design-tokens/tokens.json` | Design Token 結構與完整規格參考 | **否，除非雙方另有維護約定** |
| `reference-ui/index.html` | Judicial 目前 UI 結構與元件視覺參考 | **否，僅供參考** |
| `reference-ui/css/` | Judicial 現有元件／頁面／Responsive CSS 參考 | **不要求直接搬用** |
| `docs/DESIGN_TOKEN_GUIDE_VENDOR.md` | Token 使用方式與導入規則 | — |

> 如需新增或修改 Token，請提出變更需求，由 Design Token 維護方更新後重新提供最新版 `tokens.css` / `tokens.json`。


---

## 2. Reference UI 的定位

`reference-ui/` 是目前 Judicial Demo 的**視覺與結構參考實作**。

它的目的不是要求協力廠商複製 Judicial 的 HTML/CSS 架構，而是讓廠商可以確認：

- Button / Form / Table / Card / Badge 等元件目前長什麼樣；
- Typography / Spacing / Radius / Color 如何組合；
- Hover / Focus / Status / Responsive 等樣式如何呈現；
- Design Token 在實際元件裡如何被使用。

```text
tokens.css / tokens.json
= 設計規範

reference-ui
= 現有 Judicial 實作範例

廠商自己的 HTML / Angular / React / Vue
= 最終實作
```

本 Reference UI 不包含應用程式功能 JavaScript，因此導覽、Modal、Upload、Search、API、Auth 等功能不保證可操作。

---

## 4. Web 專案如何使用

HTML / CSS / JavaScript、Angular、React、Vue、Django Template 等 Web 專案皆可引用：

```html
<link rel="stylesheet" href="design-tokens/tokens.css">
```

之後在既有 CSS 中使用 CSS Variables：

```css
.button-primary {
  background: var(--color-action-primary);
  color: var(--color-on-dark);
  border-radius: var(--button-container-radius);
}
```

框架不同不需要改變 Token 命名。

---

## 4. Token 架構

目前 Token 分為三層：

```text
Primitive
    ↓
Semantic
    ↓
Component
```

### Primitive Token

代表基礎值，例如：

```css
--color-brand-700: #205f98;
--font-size-md: 0.875rem;
--spacing-18: 18px;
--radius-lg: 14px;
```

Primitive 是底層尺度與基礎色盤。  
一般 UI 實作若已有對應 Semantic / Component Token，應優先使用後兩者。

### Semantic Token

代表「用途」，例如：

```css
--color-action-primary: #2475c5;
--color-text-primary: #243444;
--color-border-default: #dce3e9;
--color-surface-primary: #ffffff;
```

例如主要操作按鈕應優先使用：

```css
.button-primary {
  background: var(--color-action-primary);
}
```

而不是直接綁定某一個品牌色階。

### Component Token

代表可重複元件的固定設計規則，例如：

```css
--button-container-radius: 9px;
--status-badge-container-radius: var(--radius-pill);
--data-table-cell-padding-inline: var(--spacing-14);
```

適合用於 Button、Badge、Form Control、Data Table、Modal、Toast 等元件。

---

## 5. 修改既有版型的建議流程

例如原本：

```css
.button-primary {
  background: #2475c5;
  border-radius: 9px;
  padding: 10px 18px;
}
```

建議改為：

```css
.button-primary {
  background: var(--color-action-primary);
  border-radius: var(--button-container-radius);
  padding: var(--spacing-10) var(--spacing-18);
}
```

建議流程：

```text
1. 使用 DevTools 找到現有 CSS 值與用途
2. 查詢 tokens.css 是否已有適合的 Token
3. 有適合 Token → 改用既有 Token
4. 沒有適合 Token → 判斷是否真的屬於共用設計規則
5. 若需要新增／修改 Token → 提出變更需求
6. 單頁／局部排版值 → 可保留在原 CSS
7. 完成後進行 Desktop / Tablet / Mobile Visual QA
```

---

## 6. 哪些值適合 Tokenize

通常適合：

- 品牌色
- 文字色
- 背景色
- 邊框色
- Status 色
- Font Size
- Font Weight
- Spacing Scale
- Radius Scale
- Control Height
- Icon Size
- Button / Form Control Radius
- Table Padding
- Modal / Toast 等共用元件規則

---

## 7. 哪些值不一定需要 Tokenize

例如：

```css
grid-template-columns: 280px 1fr;
transform: translateX(2px);
top: 3px;
max-width: 1180px;
```

若屬於：

- 單一頁面版型
- 特殊定位
- Graph / Chart 幾何
- Document / Print Layout
- 特定功能 UI 的局部需求

可保留在原 Component / Page CSS，不需要為了「全部 Token 化」而新增 Token。

---

## 8. Component CSS 與 Token 的分工

### 情況 A：元件改用另一個「已存在」Token

原本：

```css
.badge-status {
  font-size: var(--font-size-xs);
}
```

若只希望這個元件改用較大的既有字級：

```css
.badge-status {
  font-size: var(--font-size-sm);
}
```

這屬於 **Component CSS 調整**，不需要修改 Token 定義。

### 情況 B：Token 本身需要改值

若希望所有使用同一 Token 的元件一起改變，請不要直接修改 `tokens.css`。

請提出 Token 變更需求，由 Design Token 維護方評估影響範圍並重新交付。

### 情況 C：現有 Token 不足

新增 Token 前請先確認：

1. 是否已有可用 Token？
2. 是否真的是跨頁面／跨元件共用規則？
3. 還是只是單頁 Layout 值？

若確實需要新增 Token，請提供：

```text
使用位置 / Selector
目前值
希望值
用途
預期影響範圍
```

---

## 9. tokens.json 與 tokens.css 的定位

```text
tokens.json
= Design Token 結構與完整規格參考

tokens.css
= 本次交付已產生完成、供 Web 實作直接使用的 CSS Variables
```

本次交付不要求協力廠商自行產生 `tokens.css`。

### 請勿：

- 直接改寫 `tokens.css` 的 Token 定義
- 自行新增同義 Token / CSS Variable
- 讓 `tokens.json` 與 `tokens.css` 各自維護成不同版本

### 若需 Token 變更：

```text
提出需求
→ Design Token 維護方更新
→ 重新提供 tokens.json / tokens.css
→ 廠商更新引用
→ Visual QA
```

---

## 10. CSS Migration Example

原始 CSS：

```css
.card {
  background: #ffffff;
  color: #243444;
  border: 1px solid #dce3e9;
  border-radius: 14px;
  padding: 18px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
}
```

Token 化後：

```css
.card {
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-18);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}
```

---

## 11. 實作原則

1. 優先使用既有 Token，不建立同義變數。
2. 色彩類 UI 優先尋找合適的 Semantic Token。
3. Component 有穩定共用規則時，使用既有 Component Token。
4. Primitive Token 可作為底層尺度，但避免在已有語意 Token 時直接綁定用途。
5. 單頁 Layout / Graph / Print 等局部值可保留原 CSS。
6. 不為了「全部 Token 化」而把所有 px 值加入 Token。
7. 不直接修改交付的 `tokens.css` Token 定義。
8. 新增或修改 Token 前先確認影響範圍。
9. Token 變更需求交由 Design Token 維護方更新。
10. 完成樣式調整後必須進行 Visual QA。

---

## 12. 廠商交付前檢查

```text
□ 已優先使用現有 Token
□ 未重複建立同義 Token / CSS Variable
□ Semantic Token 使用合理
□ Component Token 僅用於真正共用的元件規則
□ Local Layout 值沒有被過度 Token 化
□ 未直接改寫交付的 Token 定義
□ CSS syntax validation 通過
□ Desktop / Tablet / Mobile 畫面已確認
□ Hover / Focus / Active / Disabled 狀態已確認
□ Success / Warning / Error / Loading 狀態已確認（若該功能存在）
```

若實作過程發現既有 Token 不足，請將需求與使用情境一併回報，不要自行建立另一套 Token 命名。

---

## 13. 使用原則摘要

```text
Design Token 管「共用設計規則」
Component CSS 管「元件如何使用這些規則」
Page CSS 管「頁面如何排版」
```

本次交付方式：

```text
Design Token 維護方
    ↓
tokens.json + tokens.css
    ↓
協力廠商套用既有版型
    ↓
提出缺少／變更 Token 的需求
    ↓
Design Token 維護方更新並重新交付
```

這樣可以避免各專案自行長出不同版本的 Token。
