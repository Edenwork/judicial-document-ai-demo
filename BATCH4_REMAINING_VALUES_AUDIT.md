# Batch 4 — Remaining Values Audit

> Project: Judicial Document AI Demo  
> Baseline: Batch 3 V3  
> Type: Audit-only — 本批不修改 CSS 視覺值  
> Goal: 盤點 Batch 1–3 後剩餘的 hard-code / irregular values，分類為 Safe Tokenize、Normalize Candidate、Component / Local Exception。

---

## 1. Audit Result Summary

Batch 4 的重點不是追求「0 hard-code」，而是確認每個剩餘值是否有合理存在理由。

### Classification

| Class | Meaning | 本次結論 |
|---|---|---|
| A | Safe Tokenize，不改數值 | 可直接進下一批實作 |
| B | Normalize Candidate，會改視覺 | 先取得 Human Decision |
| C | Component Token | 保留元件語意，不硬塞 Global scale |
| D | Local / Feature Exception | 保留 local CSS |

---

# 2. Typography Audit

目前 Primitive typography：

```css
--font-size-xs: 11px;
--font-size-sm: 12px;
--font-size-md: 14px;
--font-size-lg: 16px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
```

## 2.1 Existing Scale Values Still Hard-coded — Class A

CSS 內仍有大量與既有 token **完全同值**的 font-size：

| Value | Raw occurrences | Recommendation |
|---:|---:|---|
| 11px | 38 | `var(--font-size-xs)` |
| 12px | 17 | `var(--font-size-sm)` |
| 14px | 4 | `var(--font-size-md)` |
| 16px | 2 | `var(--font-size-lg)` |
| 20px | 1 | `var(--font-size-xl)` |
| 24px | 2 | `var(--font-size-2xl)` |

**Decision:** Safe Tokenize。數值不變，可在下一批直接替換。

## 2.2 10px Compact Typography — Class A/C Candidate

`10px` 仍有 **20 個 raw occurrences**，跨多個頁面與元件使用。

這已不是單一 feature exception，具有重複使用性。

### Recommendation

新增 Primitive：

```css
--font-size-2xs: 10px;
```

再將一般 compact label / caption 的 `10px` 接到此 token。

若個別 10px 有特殊用途仍可保留 Component / Local。

## 2.3 Near-scale Typography — Class B

| Current | Occurrences | Candidate | Notes |
|---:|---:|---:|---|
| 13px | 4 | 14px | 一般 UI 可收斂；Review `.paper-kicker` 屬 document typography，建議保留 local 13px |
| 15px | 3 | 16px | Panel heading、brand text、admin selected text |
| 17px | 1 | 16px | Topbar title |
| 25px | 1 | 24px | Report cover heading |
| 27px | 1 | Review | `.metric-value`，建議 Component typography，不直接塞入 Primitive |

### 13px locations

- `layout.css` `.user-card strong`
- `pages/search.css` `.search-tab`
- `pages/reports.css` `.output-option strong`
- `pages/review.css` `.paper-kicker` ← document-specific，建議保留

### 15px locations

- `components.css` `.panel-header h3`
- `layout.css` `.brand strong`
- `pages/admin.css` `.scope-selected strong`

### 17px location

- `layout.css` `.topbar-title h1`

### 25px location

- `components/overlays.css` `.report-cover h2`

### 27px location

- `components.css` `.metric-value`

## 2.4 9px Typography — Class C/D

目前 4 個：

- `.return-target-head small`
- `.auth-security-note`
- Relations graph `.node .sub`
- Admin `.scope-selected small`

`9px` 非一般 UI typography scale，且用途偏 compact / graph / auxiliary text。

**Recommendation:** 不新增 Global Primitive。逐元件保留或建立 Component Token；Graph typography 保留 feature-specific。

---

# 3. Spacing Audit

## 3.1 Existing Primitive Values Still Hard-coded — Class A

現有 spacing scale：

```text
4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 32
```

仍有大量 exact-match raw spacing，可不改畫面直接 Tokenize：

| Value | Raw appearances in spacing properties |
|---:|---:|
| 4px | 13 |
| 6px | 16 |
| 8px | 34 |
| 10px | 24 |
| 12px | 28 |
| 14px | 24 |
| 16px | 21 |
| 20px | 15 |
| 24px | 6 |
| 32px | 3 |

**Recommendation:** 下一批可做 Safe Tokenize。

## 3.2 18px Spacing — Review as Primitive Candidate

`18px` 在 spacing property 中仍有 **22 次**，分布於 Components、Auth、Search、Upload、Reports、Review、Admin、Responsive。

因為使用頻率高，不適合把 22 個地方全部視為偶發 exception。

### Options

A. 新增：

```css
--spacing-18: 18px;
```

優點：零視覺變更、符合實際系統使用。

B. 全部或部分 Normalize 至 16 / 20。

缺點：18 正好位於 16 / 20 中間，沒有單一自然方向，必須逐元件判斷。

### Audit Recommendation

**優先推薦 A：加入 `--spacing-18`。**

理由：它已跨元件大量重複；Design Token 應反映穩定的實際設計規則，不應只為了讓 scale 看起來漂亮而製造 22 個視覺改動。

## 3.3 28px Spacing — Primitive Candidate

`28px` 在 spacing property 中有 **9 次**，主要是較大的 page / layout spacing。

它位於：

```text
24 → 28 → 32
```

形成清楚的 4px large-spacing step。

### Recommendation

可新增：

```css
--spacing-28: 28px;
```

屬零視覺變更的 Tokenization。

## 3.4 5 / 7 / 9 / 11px Spacing — Class B/C

仍有：

| Value | Raw appearances |
|---:|---:|
| 5px | 16 |
| 7px | 16 |
| 9px | 18 |
| 11px | 8 |

這些值都位於兩個既有 scale 中間，因此不可用單一規則盲目替換：

```text
5 → 4 or 6
7 → 6 or 8
9 → 8 or 10
11 → 10 or 12
```

### Recommendation

不要建立 `--spacing-5/7/9/11` 作為第一選擇，也不要全域 round up / down。

下一批若要 Normalize，應依 component group 處理並 Visual QA。

## 3.5 21 / 22 / 25 / 26px Spacing

### 21px

唯一 occurrence：

```css
@media (max-width: 480px) .auth-card {
  padding: 25px 21px;
}
```

Candidate：`24px 20px`，但屬 mobile-specific layout，需 QA。

### 22px

Spacing occurrences 約 6 次，另有 component size / graph usage。

現有明確 Component Tokens 已包含：

```css
--modal-container-padding: 22px;
--modal-content-padding: 22px;
--report-cover-margin-bottom: 22px;
```

**Recommendation:** 不做 global `22 → 20/24`。保留 Component / Local。

### 25px

同一 mobile auth card padding；Candidate 24px，與 21px 一起判斷。

### 26px

約 5 個 spacing uses，主要集中於 page / review document layout。

**Recommendation:** 暫保留 Local Layout，不新增 global token。

---

# 4. Radius Audit

Primitive radius：

```text
8 / 10 / 14 / 16 / pill
```

## 4.1 Exact Scale Radius Still Hard-coded — Class A

目前仍有：

- `10px` × 4
- `16px` × 1
- `999px` × 1

### Recommendation

直接替換：

```text
10px  → var(--radius-md)
16px  → var(--radius-xl)
999px → var(--radius-pill)
```

零視覺變更。

## 4.2 9px Radius — Class B/C

目前 hard-coded：

- Relations `.graph-legend` → 9px
- Report `.report-stat` → 9px

另外既有 Component Tokens：

```css
--button-container-radius: 9px;
--form-control-container-radius: 9px;
```

### Candidate

```text
9px → 10px / --radius-md
```

這會讓 Button / Form Control / Graph Legend / Report Stat 的 radius 更一致，但有 1px 視覺變更。

**Human Decision Required.**

## 4.3 3px Radius — Class D

Review document inline mark / highlight 使用 `3px`。

這是 document annotation 的局部視覺，不是一般 container shape。

**Recommendation:** Keep Local。

## 4.4 50%

圓形 avatar / decorative circle / icon orbit。

**Recommendation:** Keep。`50%` 是幾何語意，不需要硬改成 radius token。

---

# 5. Control Height Audit

目前 Primitive：

```css
--control-height-sm: 32px;
--control-height-md: 38px;
--control-height-lg: 44px;
```

## Class A

以下已是 44px，可直接接 `--control-height-lg`（若語意確為 form/action control）：

- Auth input → 44px
- Auth submit → 44px
- Search tab → 44px

## Class B/C Candidates

| Selector | Current | Candidate | Recommendation |
|---|---:|---:|---|
| Review meta form / update button | 42px | 44px | Normalize candidate |
| Review toolbar select | 34px | 32px | Normalize candidate |
| Review field form control | 36px | 38px | Normalize candidate |
| Admin tab | 36px | keep Component 36 | Tab 不等於 form control |
| Search selection toolbar | 43px | keep / 44 | Toolbar，不直接視為 control |

不要只因數值接近就把所有 `34/36/42/43` 套到 control scale。

---

# 6. Icon / Icon-container Audit

## Existing Primitive

```text
icon.sm = 16
icon.md = 18
icon.lg = 20
```

## 6.1 18px Icons — Class A

已存在 `--icon-size-md: 18px`。

像 Report document icon、Admin metric icon SVG 等可在確認其為一般 icon 後直接 Tokenize，不改尺寸。

## 6.2 17px Icons — Class B

`17px` 在 icon width / height 中大量重複，跨：

- Navigation
- Search
- Upload
- Reports
- Admin
- Toast
- Shared components

它不是偶發值，但位於 16 / 18 中間。

### Recommendation

不建立 `--icon-size-17`。

應依用途決定：

```text
small / inline icon → 16px
medium icon         → 18px
```

需 Visual QA，不做全域替換。

## 6.3 15px Icons — Class B

主要是 chevron / tab / spinner 等 compact icons。

Candidate：16px，但 spinner 等特殊 geometry 可保留 Component Token。

## 6.4 Other Component Sizes

- Auth feature icon container 35px
- Status empty icon 26px
- Search result icon container 36px
- Report output icon container 36px
- Auth / status icon containers 34px
- Admin metric icon container 38px
- Relations detail icon container 44px

這些是 **container size 或 feature-specific size**，不可直接套 icon Primitive。

建議在真正重複時建立 Component size token，而不是為每個值建立 Global size scale。

---

# 7. Feature / Local Exceptions

## Relations / Graph

以下建議保留 feature-specific：

- `620px` graph canvas / min-height
- `22px 22px` graph grid background
- SVG / node geometry
- node 9px sub label
- graph coordinates / halo sizes

Graph 是獨立視覺系統，不應被一般 UI scale 強行收斂。

## Review / Document

建議保留 local：

- document paper spacing / print-like layout
- `.paper-kicker` 13px
- inline mark `border-radius:3px`
- document-specific large horizontal padding

## Auth Decorative Geometry

例如：

- decorative circle 420px
- negative offsets
- concentric ring shadow 54px / 108px

屬視覺 composition，不是 Design Token 候選。

## Responsive-specific Layout

例如：

- negative nav count offset
- breakpoint-specific page padding
- mobile card composition

除非相同規則跨 breakpoint / component 重複，否則保持 local。

---

# 8. Recommended Next Implementation Scope

Audit 完成後，不建議一次處理全部 Class B。

## Batch 5A — Safe Token Cleanup

零視覺變更：

1. Existing font-size raw values → typography tokens
2. Existing spacing raw values → spacing tokens
3. Existing radius raw values → radius tokens
4. Existing 18px icon values → `--icon-size-md`
5. Existing 44px control values → `--control-height-lg`（限 control 語意）
6. 新增 `--font-size-2xs:10px`
7. 建議新增 `--spacing-18:18px`
8. 建議新增 `--spacing-28:28px`

## Batch 5B — Human-approved Normalize

需要先確認：

- general UI `13px font → 14px`
- `15px font → 16px`
- topbar `17px → 16px`
- report cover `25px → 24px`
- `9px radius → 10px` 是否包含 Button / Form Control
- Review controls `42 → 44`, `34 → 32`, `36 → 38`
- 17px icons 如何分到 16 / 18
- mobile auth `25px 21px → 24px 20px` 是否收斂

---

# 9. Human Decision Checklist

建議下一步一次確認以下決策：

| ID | Decision | Recommendation |
|---|---|---|
| D1 | 新增 `--font-size-2xs:10px` | ✅ Yes |
| D2 | 新增 `--spacing-18:18px` | ✅ Yes |
| D3 | 新增 `--spacing-28:28px` | ✅ Yes |
| D4 | 一般 UI 13px typography → 14px；paper kicker 保留 13px | ✅ Yes |
| D5 | 15px typography → 16px | ✅ Yes |
| D6 | Topbar 17px → 16px | ✅ Yes |
| D7 | Report cover 25px → 24px | ✅ Yes |
| D8 | `.metric-value` 27px | 建議保留 Component，之後再決定 27 / 28 |
| D9 | Button / Form / Graph Legend / Report Stat 9px radius → 10px | 建議 Yes，但需 Visual QA |
| D10 | Review control heights 42→44、34→32、36→38 | 建議 Yes，但需 Visual QA |
| D11 | 17px icons | 分類成 16 / 18，不做全域替換 |
| D12 | Mobile Auth 25px 21px → 24px 20px | 可做，但優先度低 |

---

# 10. Batch 4 Conclusion

Batch 4 沒有發現必須「為了消除 hard-code」而重建一大批 Global Token 的必要。

最大的剩餘問題其實是：

1. 很多 **已經有等值 Token** 的 raw values 還沒接上 Token。
2. `10px typography` 使用頻率高，應補一個正式 compact type token。
3. `18px`、`28px` spacing 的實際重用度足以重新評估 Primitive scale。
4. `5/7/9/11px spacing` 不適合全域盲目 round。
5. `9px radius`、control heights、17px icons 屬下一輪真正需要 Human Decision + Visual QA 的 normalization。
6. Graph / Document / Responsive geometry 應允許合理 local hard-code。

因此下一步應先做：

```text
Batch 5A — Safe Token Cleanup
```

再做：

```text
Batch 5B — Approved Visual Normalization
```

而不是繼續追求全站 0 hard-code。
