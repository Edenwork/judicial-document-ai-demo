# Design Tokens V1.0 — JSON Finalization

Date: 2026-09-14

## Files

- `tokens.json` — canonical machine-readable token definition
- `tokens.css` — Web/CSS token snapshot corresponding to this JSON

## Architecture

```text
primitive
semantic
component
```

## Format

`tokens.json` uses the DTCG 2025.10 format and schema.

## Current approved decisions

- Typography font-size tokens use `rem`.
- Project root baseline remains `16px` for the current Judicial Demo implementation.
- There is no `10px / font-size-2xs` token.
- Former `10px / 0.625rem` UI typography was approved to use `--font-size-xs` (`0.6875rem`, 11px at the current root baseline).
- Spacing scale includes `18px` and `28px`.
- Primitive / Semantic / Component layers are preserved.
- Local Graph / Document / Print geometry is intentionally not promoted into the global token file unless it is already represented by a token.

## Validation

```text
CSS custom properties represented: 148
JSON token leaves: 148
DTCG aliases: 8
Unmapped CSS tokens: 0
Broken aliases: 0
JSON parse: Passed
```

## Source-of-truth direction

For future maintenance, prefer:

```text
tokens.json
  ↓ generate / sync
tokens.css
  ↓ consume
application CSS
```

Avoid manually maintaining JSON and CSS independently once generation is introduced.

## Suggested commit

```text
feat(design-tokens): 建立 Design Token JSON V1.0
```
