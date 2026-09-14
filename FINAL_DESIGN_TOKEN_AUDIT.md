# FINAL_DESIGN_TOKEN_AUDIT.md

> Project: Judicial Document AI Demo  
> Audit date: 2026-09-14  
> Status: **Conditional Pass — Safe cleanup completed; a small set of design decisions remains before V1.0.**

---

## 1. Executive Summary

Final Audit 已完成，並同步執行 **Batch 7 — Safe Token Cleanup**。

Batch 7 僅把「已有完全等值 Token」的 raw value 接回既有 Token，因此不改變視覺數值：

| Safe cleanup | Replacements |
|---|---:|
| Existing font-size tokens | 61 |
| Existing font-weight tokens | 31 |
| Existing spacing tokens | 184 |
| Existing radius tokens | 6 |
| **Total** | **282** |

Final Audit 結果：目前沒有 undefined CSS variable、沒有舊核心 Token 名稱殘留、沒有 CSS brace error，也沒有 raw color 漏出 Token layer。Component scope 內的 `--metric-color / --metric-tone / --status-color / --status-tone` 皆有對應局部定義，屬於合法 scoped custom properties。

目前**不建議立刻標成 V1.0**，原因不是程式錯誤，而是仍有少數「是否升級成正式 Token」的架構決策尚未確認。

---

## 2. Static Validation

| Check | Result |
|---|---|
| CSS files | 13 |
| Undefined CSS variables | **0** |
| CSS brace errors | **0** |
| Hard-coded colors outside `tokens.css` | **0** |
| Deprecated core token names | **0** |
| Remaining exact existing-token font-size hard-codes | **0** |
| Remaining numeric 400/500/600/700 font-weight hard-codes | **0** |
| Remaining exact existing-token spacing hard-codes | **0** |
| Remaining exact existing-token radius hard-codes | **0** |

Expected result for the Safe Cleanup categories: `0` remaining.

---

## 3. Responsive Typography Review

### Result: PASS / No global mobile font-size override recommended

- `html { font-size: 16px; }` 已建立 rem baseline。
- 一般 UI typography 透過 rem 保留使用者字級縮放能力。
- `responsive.css` 沒有全域縮小字級，這是刻意保留的行為。
- Mobile / Tablet 主要調整 layout、grid、padding、navigation，不應因螢幕較小就把所有 UI 文字縮小。
- Auth hero 已使用 `clamp(1.875rem, 3.4vw, 3rem)`，本身已有 fluid responsive typography。

因此目前不需要新增例如：

```css
@media (max-width: 780px) {
  html { font-size: 14px; }
}
```

這種做法會把整站字體一起縮小，不建議。

---

## 4. Remaining Typography Decisions

以下 font-size 已使用 rem，但沒有對應現有 Primitive Token。這些不能只因數字接近就自動 normalize：

| Value | Occurrences | Examples |
|---|---:|---|
| `0.625rem` | 20 | layout.css:208, components.css:69, components.css:565 |
| `0.8125rem` | 4 | layout.css:159, pages/search.css:15, pages/review.css:148 |
| `0.5625rem` | 4 | components.css:349, pages/auth.css:309, pages/admin.css:388 |
| `0.9375rem` | 3 | layout.css:51, components.css:91, pages/admin.css:393 |
| `1.0625rem` | 1 | layout.css:279 |
| `1.6875rem` | 1 | components.css:259 |
| `1.5625rem` | 1 | components/overlays.css:231 |
| `clamp(1.875rem, 3.4vw, 3rem)` | 1 | pages/auth.css:99 |
| `1.875rem` | 1 | pages/auth.css:339 |

### Main candidate

`0.625rem = 10px` 出現頻率最高。若後續確認它代表穩定的 micro/caption typography，可以考慮新增：

```css
--font-size-2xs: 0.625rem;
```

但在確認用途前，Final Audit 不自動新增。

`9px / 13px / 15px / 17px / 25px / 27px / 30px` 等則多半屬於 Graph、特殊標題、Icon-like text 或 feature-specific typography，應逐用途判斷。

---

## 5. Remaining Spacing Decisions

Batch 7 已把所有可直接對應目前 spacing scale 的 raw values 接回 Token。

剩餘非 scale spacing：

| Value | Occurrences | Examples |
|---|---:|---|
| `18` | 18 | components.css:541, components.css:594, responsive.css:161 |
| `9` | 16 | layout.css:131, layout.css:192, components.css:156 |
| `5` | 15 | layout.css:67, layout.css:182, components.css:134 |
| `7` | 15 | components.css:265, components.css:401, pages/search.css:249 |
| `3` | 9 | layout.css:35, components.css:67, components.css:394 |
| `2` | 9 | layout.css:112, layout.css:206, layout.css:284 |
| `28` | 9 | layout.css:267, components.css:29, responsive.css:80 |
| `11` | 6 | layout.css:33, layout.css:75, components/overlays.css:109 |
| `34` | 6 | components.css:290, responsive.css:227, components/overlays.css:215 |
| `26` | 4 | components.css:29, pages/auth.css:330, pages/review.css:123 |
| `22` | 4 | responsive.css:66, components/overlays.css:150, pages/review.css:166 |
| `1` | 4 | responsive.css:68, pages/search.css:304, pages/review.css:170 |
| `42` | 3 | components.css:29, components/overlays.css:312, pages/auth.css:17 |
| `40` | 3 | components.css:426, components/overlays.css:215, pages/auth.css:158 |
| `44` | 3 | pages/search.css:99, pages/auth.css:231, pages/auth.css:334 |
| `54` | 2 | layout.css:101, responsive.css:128 |
| `56` | 2 | responsive.css:149, pages/review.css:138 |
| `30` | 1 | pages/search.css:63 |
| `36` | 1 | pages/auth.css:17 |
| `88` | 1 | pages/auth.css:17 |
| `72` | 1 | pages/auth.css:77 |
| `39` | 1 | pages/auth.css:227 |
| `48` | 1 | pages/auth.css:348 |
| `25` | 1 | pages/auth.css:362 |
| `21` | 1 | pages/auth.css:362 |
| `62` | 1 | pages/review.css:138 |

### Strong Primitive candidates

目前最值得決策的是：

```text
18px — high reuse across multiple components
28px — repeated across layout/components
```

可選方案：

```css
--spacing-18: 18px;
--spacing-28: 28px;
```

這不會改畫面，只是正式承認目前產品已穩定使用的 spacing step。

其餘 `2 / 3 / 5 / 7 / 9 / 11px` 等，多數更適合作為 component/local micro-spacing，不建議為了消除 hard-code 全部升級成 Primitive。

---

## 6. Radius Review

目前既有 Primitive radius：

```text
8 / 10 / 14 / 16 / pill
```

Batch 7 已將可完全對應的 raw radius 接回既有 Token。

仍保留的特殊 radius 主要是：

```text
9px — shared component / graph-specific cases
3px — document highlight mark
```

其中 `9px` 已經有 `--button-container-radius` / `--form-control-container-radius` 這類 Component Token 的先例，因此不需要為了「零 hard-code」強制塞進 Primitive radius scale。

---

## 7. Graph / Document / Print Exceptions

### Relations / Graph

保留 Local / Feature-specific：

- graph canvas dimensions
- SVG node / edge geometry
- graph background grid size
- node-specific micro typography
- graph toolbar / legend geometry

理由：Graph 是獨立視覺系統，不應強迫共用一般 UI scale。

### Review / Document

保留 Local / Feature-specific：

- paper width / min-height
- document page padding
- serif font stack
- legal-document letter spacing
- highlight mark geometry

理由：這些值描述文件紙張與閱讀版型，而非一般 application component。

### Print

`@media print` 目前主要控制 visibility / positioning / preview output，沒有需要抽成 Design Token 的特殊 typography scale。

---

## 8. V1.0 Gate

### Completed

- [x] Primitive / Semantic / Component architecture
- [x] Token naming convention
- [x] Color migration
- [x] Font weight normalization
- [x] Spacing normalization rules
- [x] Component normalization
- [x] Font-size `px → rem`
- [x] `html { font-size: 16px; }` baseline
- [x] Existing-token safe cleanup
- [x] Undefined variable validation
- [x] Deprecated naming validation
- [x] Responsive typography review
- [x] Graph / document / print exception review

### Remaining decisions before V1.0

- [ ] Decide whether `10px` becomes `--font-size-2xs`
- [ ] Decide whether `18px` becomes `--spacing-18`
- [ ] Decide whether `28px` becomes `--spacing-28`
- [ ] Final Visual QA after Batch 7 (should be visually identical)
- [ ] Mark Token System as V1.0 Stable

---

## 9. Recommendation

Final Audit 結論是：**Design Token 架構本身已成立，現在不是大規模重構階段了。**

只剩三個小型 Token architecture decisions（10px typography、18px / 28px spacing）與最後一次 QA。完成後即可封版 V1.0。
