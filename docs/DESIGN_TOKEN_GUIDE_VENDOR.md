# Design Token 導入指南（外部廠商版）

版本：V1.0  
用途：提供外部開發廠商依照既有 Design Token，調整現有網站／系統版型樣式。

---

## 1. 交付內容

本 Design Token 套件建議包含：

```text
design-tokens/
├── tokens.json
├── build-tokens.js        # Token 產生／驗證工具
└── tokens.css             # Web 使用的 generated CSS

docs/
└── DESIGN_TOKEN_GUIDE_VENDOR.md
```

各檔案用途：

| 檔案 | 用途 |
|---|---|
| `design-tokens/tokens.json` | Design Token 的機器可讀規格來源 |
| `design-tokens/tokens.css` | 前端可直接使用的 CSS Variables |
| `docs/DESIGN_TOKEN_GUIDE_VENDOR.md` | 本文件，說明套用方式與規則 |
| `design-tokens/build-tokens.js` | 將 `tokens.json` 自動產生為 `tokens.css` |

---

## 2. 實作時應優先使用 tokens.css

若現有系統是一般 HTML / CSS / JavaScript、Angular、React、Vue、Django Template 等 Web 專案，皆可直接引用：

```html
<link rel="stylesheet" href="design-tokens/tokens.css">
```

然後在既有 CSS 中使用：

```css
.button-primary {
  background: var(--color-action-primary);
  color: var(--color-text-on-primary);
  border-radius: var(--button-container-radius);
}
```

不需要因為框架不同而改變 Token 的命名或架構。

---

## 3. Token 架構

目前 Token 分為三層：

```text
Primitive
↓
Semantic
↓
Component
```

### Primitive Token

代表最基礎的設計值。

例如：

```css
--color-brand-700: #2475c5;
--font-size-md: 0.875rem;
--spacing-18: 18px;
--radius-lg: 14px;
```

Primitive 通常不建議直接大量使用在頁面 Component 上。

---

### Semantic Token

代表「用途」。

例如：

```css
--color-action-primary: var(--color-brand-700);
--color-text-primary: ...;
--color-border-default: ...;
--color-surface-primary: ...;
```

開發時應優先使用 Semantic Token。

例如：

```css
.button-primary {
  background: var(--color-action-primary);
}
```

而不是：

```css
.button-primary {
  background: var(--color-brand-700);
}
```

Semantic Token 可以讓之後換品牌色或主題時，不必逐一修改元件。

---

### Component Token

代表某一類元件的固定設計規則。

例如：

```css
--button-container-radius: 9px;
--status-badge-container-radius: var(--radius-pill);
--data-table-cell-padding-inline: var(--spacing-14);
```

適合用於：

- Button
- Badge
- Form Control
- Data Table
- Modal
- Toast
- Login / Auth
- Search
- Admin UI

---

## 4. 修改既有版型時的建議流程

請先使用瀏覽器 DevTools 檢查現有元件。

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
1. 找到現有 CSS 值
2. 查 tokens.css 是否已有對應 Token
3. 有對應 Token → 直接替換
4. 沒有對應 Token → 判斷是否為共用設計規則
5. 共用規則 → 提出新增 Token
6. 單頁／局部排版值 → 保留在原 CSS
```

---

## 5. 哪些值應該 Tokenize

適合 Tokenize：

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
- Button Radius
- Form Control Radius
- Table Padding
- Modal / Toast 等共用元件規則

---

## 6. 哪些值不一定需要 Tokenize

以下通常可以保留在頁面或 Component CSS：

```css
grid-template-columns: 280px 1fr;
transform: translateX(2px);
top: 3px;
max-width: 1180px;
```

只要這些數值屬於：

- 單一頁面版型
- 特殊定位
- Graph / Chart 幾何
- Document / Print Layout
- 特定功能 UI 的局部需求

就不需要為了「全部 Token 化」而強行加入 Design Token。

---

## 7. 修改 Token 與修改 Component CSS 的差異

### 只想改某個 Component

例如：

```css
.badge-status {
  font-size: var(--font-size-xs);
}
```

若只希望 Badge 使用較大的現有字級：

```css
.badge-status {
  font-size: var(--font-size-sm);
}
```

此時不需要修改 `tokens.json`。

因為：

```text
--font-size-xs
--font-size-sm
```

都已經是現有 Token。

這只是改變「Component 使用哪個 Token」。

---

### 要修改 Token 本身

例如所有使用：

```css
var(--font-size-xs)
```

的地方都應該一起變大。

此時才修改：

```text
tokens.json
```

再重新產生：

```text
tokens.css
```

---

### 要新增 Component Token

如果某個 Component 有穩定且獨立的設計規則，可以新增 Component Token。

例如：

```text
status badge 字級
```

可以新增：

```css
--status-badge-font-size: var(--font-size-sm);
```

之後：

```css
.badge-status {
  font-size: var(--status-badge-font-size);
}
```

---

## 8. tokens.json 與 tokens.css 的關係

正式流程：

```text
design-tokens/tokens.json
    ↓
design-tokens/build-tokens.js
    ↓
design-tokens/tokens.css
```

`design-tokens/tokens.json` 為 Source of Truth。

`design-tokens/tokens.css` 為產生後提供 Web 使用的 CSS Variables。

若專案已採用自動產生流程：

> 請勿直接修改 `tokens.css`。

正確流程：

```text
修改 design-tokens/tokens.json
→ 執行 design-tokens/build-tokens.js
→ 重新產生 design-tokens/tokens.css
→ 開啟網頁確認
```

---

## 9. 產生 tokens.css

如有提供 `design-tokens/build-tokens.js`，可在專案根目錄執行：

```bash
node design-tokens/build-tokens.js
```

檢查 JSON 與 CSS 是否同步：

```bash
node design-tokens/build-tokens.js --check
```

Node.js 僅用於 Design Token 的 Build / Validation。

網站本身不需要依賴 Node.js 才能執行。

---

## 10. 外部廠商實作原則

請遵守：

1. 優先使用既有 Token，不要重新建立同義變數。
2. 優先使用 Semantic Token，而非直接使用 Primitive Color。
3. Component 有明確共用規則時，才建立 Component Token。
4. 頁面局部排版值可保留在原 CSS。
5. 不要為了 Token 化而將所有 px 數值加入 JSON。
6. 不要直接修改 generated `tokens.css`。
7. 新增 Token 前，先確認現有 Token 是否可滿足需求。
8. 若需要改變既有 Token 定義，請先確認影響範圍。
9. 修改完成後需執行 Visual QA。
10. 不得假設 Token 修改只會影響目前畫面。

---

## 11. 建議的 CSS Migration Example

原始 CSS：

```css
.card {
  background: #ffffff;
  color: #17202a;
  border: 1px solid #d9dee5;
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

## 12. 廠商交付前檢查

交付前請確認：

```text
□ 未重複建立已有 Token
□ 沒有大量新增意義不明的 Primitive
□ Semantic Token 使用合理
□ Component Token 僅用於真正共用的 Component 規則
□ Local Layout 值沒有被過度 Token 化
□ tokens.json 與 tokens.css 同步
□ build-tokens.js --check 通過
□ CSS syntax validation 通過
□ Desktop / Tablet / Mobile 畫面已確認
□ Hover / Focus / Disabled / Error 等狀態已確認
```

---

## 13. Design Token 使用原則摘要

可以用一句話理解：

```text
Design Token 管「共用設計規則」
Component CSS 管「元件怎麼使用這些規則」
Page CSS 管「頁面怎麼排版」
```

因此：

```text
tokens.json
≠ 整個網站 CSS
```

而是：

```text
tokens.json
↓
tokens.css
↓
Components / Pages 使用 Token
```

這也是本 Design Token 導入方式的核心原則。
