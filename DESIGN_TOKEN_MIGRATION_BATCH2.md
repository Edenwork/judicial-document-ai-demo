# DESIGN_TOKEN_MIGRATION_BATCH2.md

> Batch 2 — Normalize
> Based on: Batch 1 V2
> Date: 2026-09-11

## Scope

本批只做已確認的規則化，不處理其他尺寸或特殊 Component 值。

### Font weight

```text
650 → 600 / --font-weight-semibold
720 → 700 / --font-weight-bold
750 → 700 / --font-weight-bold
760 → 700 / --font-weight-bold
780 → 700 / --font-weight-bold
```

### Spacing

只在 spacing-related properties 中收斂：

```text
13px → 14px / --spacing-14
17px → 16px / --spacing-16
19px → 20px / --spacing-20
```

套用範圍：`padding`、`margin`、`gap` 與其方向 variants。

## Explicitly NOT changed

以下即使數值為 13 / 17 / 19，也不在本批自動修改：

- font-size
- width / height
- border-radius
- top / left / right / bottom positioning
- icon dimensions
- feature-specific typography sizes

因此例如 `17px icon`、`13px border-radius`、`17px topbar font-size` 仍保留。

## Validation

- Legacy font weights 650/720/750/760/780 remaining: 0
- 13/17/19px remaining in spacing declarations: 0
- Undefined CSS custom property references: 0

## Next

Visual QA：

- Dashboard / Panel
- Modal / Overlay
- Sidebar / Topbar
- Upload
- Search
- Review
- Reports
- Admin
- Relations
- RWD

本批會產生小幅視覺差異，屬預期結果。
