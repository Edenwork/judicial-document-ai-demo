# Design Token Migration

> 專案：Judicial Document AI Demo  
> 目的：將既有 CSS 逐步整理為可維護、可擴充的 Design Token 架構。  
> 原則：每個 Batch 都保留前一批的決策與紀錄，本文件採累積式更新，不只記錄最新一次修改。

---

## Migration Overview

| Batch | 主題 | 狀態 |
|---|---|---|
| Batch 1 | Token Naming Migration | ✅ Completed |
| Batch 2 | Weight / Spacing Normalization | ✅ Completed / Visual QA Passed |
| Batch 3 | Component-specific Normalization | ✅ Implemented / Pending final QA |

整體流程：

```text
Existing Website / HTML / CSS
→ Explore
→ Extract
→ Audit
→ Normalize
→ Token Candidate
→ CSS Migration Mapping
→ Apply
→ Visual QA
→ Refine
→ Token V1.0
```

---

# Batch 1 — Token Naming Migration

## 目標

先建立一致的 Design Token 命名架構，並將既有 CSS 中可安全替換的 hard-coded values / 舊 token 名稱接到新的 token system。

本批以「低風險、盡量不改畫面」為原則，不進行大幅視覺 normalization。

## Token Architecture

採三層結構：

```text
Primitive Token
→ Semantic Token
→ Component Token
```

### Primitive Token

命名原則：property + value / scale。

Spacing 改用實際值命名：

```css
--spacing-4
--spacing-6
--spacing-8
--spacing-10
--spacing-12
--spacing-14
--spacing-16
--spacing-20
--spacing-24
--spacing-32
```

Typography：

```css
--font-size-xs
--font-size-sm
--font-size-md
--font-size-lg
--font-size-xl
--font-size-2xl

--font-weight-regular
--font-weight-medium
--font-weight-semibold
--font-weight-bold
```

Radius：

```css
--radius-sm
--radius-md
--radius-lg
--radius-xl
--radius-pill
```

Reusable size：

```css
--control-height-sm
--control-height-md
--control-height-lg
--icon-size-sm
--icon-size-md
--icon-size-lg
--avatar-size-md
```

### Semantic Token

命名原則：property + role + state。

主要命名調整：

```text
--color-primary              → --color-action-primary
--color-primary-hover        → --color-action-primary-hover
--color-primary-ring         → --color-action-primary-ring

--color-text                 → --color-text-primary
--color-surface              → --color-surface-primary
--color-border               → --color-border-default
--color-background           → --color-surface-page
--color-background-document  → --color-surface-document
--color-document-text        → --color-text-document
```

Brand palette：

```text
--color-primary-50..950 → --color-brand-50..950
```

Status base colors：

```text
--color-success    → --color-status-success
--color-warning    → --color-status-warning
--color-danger     → --color-status-danger
--color-processing → --color-status-processing
```

Status palette variants（例如 `--color-success-700`）保留 palette 型態。

Opacity 命名改為明確百分比：

```text
--color-on-dark-08  → --color-on-dark-opacity-8
--color-on-dark-10  → --color-on-dark-opacity-10
--color-on-dark-025 → --color-on-dark-opacity-2-5
```

Shadow 保留語意命名：

```css
--shadow-panel
--shadow-floating
--shadow-document
--shadow-field
--shadow-sticky
--shadow-mobile-nav
--shadow-modal
```

### Component Token

命名原則：component + element / property + state / size。

例如：

```css
--brand-mark-container-radius
--button-container-radius
--form-control-container-radius
--status-badge-container-radius
--data-table-cell-padding-block
--data-table-cell-padding-inline
```

方向性 spacing 優先採 CSS logical properties：`inline / block`，避免只用 `x / y`。

## Batch 1 Validation

- 全 CSS custom property reference 掃描完成
- Undefined CSS variables：0
- 舊命名 patterns（`--space-*`、`--size-*`、`--color-primary` 等）：0
- ZIP integrity：OK
- CSS brace mismatch：0

## Batch 1 Commit

```text
refactor(design-tokens): 統一 CSS Token 命名規則
```

---

# Batch 2 — Weight / Spacing Normalization

## 目標

在 Batch 1 命名架構穩定後，開始處理已確認可以規則化的 typography weight 與 spacing。

## Font Weight Normalization

```text
650 → 600 / --font-weight-semibold
720 → 700 / --font-weight-bold
750 → 700 / --font-weight-bold
760 → 700 / --font-weight-bold
780 → 700 / --font-weight-bold
```

## Spacing Normalization

只在 spacing-related properties 中收斂：

```text
13px → 14px / --spacing-14
17px → 16px / --spacing-16
19px → 20px / --spacing-20
```

套用範圍：

- padding
- margin
- gap
- 對應方向 variants

## Explicitly NOT Changed

以下即使數值為 13 / 17 / 19，也不自動修改：

- font-size
- width / height
- border-radius
- top / left / right / bottom positioning
- icon dimensions
- feature-specific typography sizes

例如：

```text
17px icon
13px border-radius
17px topbar font-size
```

仍保留原值。

## Batch 2 Validation

- Legacy font weights `650/720/750/760/780` remaining：0
- `13/17/19px` remaining in spacing declarations：0
- Undefined CSS custom property references：0
- Visual QA：Passed，未發現跑版

## Batch 2 Commit

```text
refactor(design-tokens): 收斂字重與間距規則
```

---

# Batch 3 — Component-specific Normalization

## 目標

處理不能單純全域替換、必須先確認元件用途的尺寸。

原則：

```text
可安全映射既有 Primitive scale
→ Normalize

有明確 Component 意義但不適合全域標準化
→ Component Token

可能影響設計意圖 / layout
→ 不自動修改，逐項確認
```

## 1. Radius Normalization

只收斂與既有 radius scale 非常接近、且用途明確的元件：

| 原值 | 新值 | 用途 |
|---:|---:|---|
| 13px | 14px | Login brand mark |
| 13px | 14px | Upload dropzone container |
| 15px | 16px | Upload dropzone icon container |
| 13px | 14px | Relations detail icon container |
| 11px | 10px | Toast container |

既有 Primitive Radius：

```css
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 16px;
```

這不是「所有奇數 radius 一律修改」。只有上述已確認、且接近既有 scale 的元件才收斂。

像 `9px`、`3px`、`50%` 等其他 radius 不會因為不是標準整數 scale 就自動修改。

## 2. Typography Normalization

三個原本皆為 `21px`、用途已確認的字級統一為 `20px`：

```css
--auth-card-title-font-size: 20px;
--report-stat-value-font-size: 20px;
--search-hero-title-font-size: 20px;
```

用途：

- Login 卡片標題
- Report 統計數值
- Search Hero 標題

因此：

```text
21px → 20px
```

屬實際視覺 normalization，不只是 token rename。

## 3. Admin Empty-state Icon Normalization

Admin empty state SVG icon：

```css
--admin-empty-icon-size: 28px;
```

由：

```text
27px → 28px
```

只修改此已確認用途的 icon，不全域替換所有 `27px`。

## 4. Component-specific Values 保留原值

像以下用途雖然也是非標準值，但語意不同，因此暫不因數字相近就一起修改：

- Admin metric typography
- Modal padding
- Report cover spacing
- Responsive layout spacing
- Feature-specific sizes

例如 `22px` 目前可能同時代表 typography、padding、spacing，不適合用一條全域規則處理。

## Batch 3 Visual QA

建議確認：

- Login：卡片標題、brand mark
- Upload：dropzone 外框與 icon
- Search：Hero 標題
- Reports：統計數值
- Admin：empty-state icon
- Relations：detail icon
- Toast：圓角

主要視覺變化：

```text
Radius
13 → 14
15 → 16
11 → 10

Typography（3 個已確認用途）
21 → 20

Admin empty-state icon
27 → 28
```

## Batch 3 Commit

```text
refactor(design-tokens): 收斂元件尺寸與字級規則
```

---

# Current Decisions / Rules

目前已確立：

1. 不把每一個 hard-coded value 都升成 Global Token。
2. Primitive Token 應代表可重複使用的基本 scale。
3. Semantic Token 表達角色與狀態，不表達單一元件。
4. Component Token 用於有明確元件用途、但不應成為全域規則的值。
5. 奇數值不是修改理由；是否 Normalize 取決於用途與既有 scale。
6. 任何會造成實際視覺變動的 normalization，若用途尚未確認，先詢問再改。
7. Feature-specific、graph、print、responsive values 採保守策略。
8. 每一批 Migration 的 CSS 與本 MD 放在同一個 commit。
9. 本 MD 採累積更新：新 Batch 必須保留之前 Batch 的紀錄，不覆蓋成只剩最新一次。

---

# Next

Batch 3 Visual QA 通過後，再盤點尚未標準化的值，例如：

```text
22px
其他 27px
18px
9px radius
其他 feature-specific typography / size
```

逐項判斷：

```text
Normalize to Primitive
vs.
Keep as Component Token
vs.
Keep as intentional exception
```

完成後再進入 Token V1.0 cleanup / documentation。
