# Design Tokens V1.0 — JSON Source of Truth + CSS Generator

Date: 2026-09-14

## Files

```text
design-tokens/
├── tokens.json          ← canonical machine-readable source of truth
├── build-tokens.js      ← zero-dependency Node.js generator
└── tokens.css           ← generated Web/CSS output
```

## Architecture

```text
primitive
semantic
component
```

## Format

`tokens.json` uses the DTCG 2025.10 token structure with `$type`, `$value`, and aliases/references.

CSS variable names are stored explicitly in each token's extension:

```text
$extensions.com.comma-design.css.variable
```

This prevents the generator from guessing CSS variable names from token paths.

## Current approved decisions

- Typography font-size tokens use `rem`.
- Judicial Demo currently uses a `16px` root baseline in the application CSS.
- There is no `10px / font-size-2xs` token.
- Former `10px / 0.625rem` UI typography was approved to use `--font-size-xs` (`0.6875rem`, 11px at the current root baseline).
- Spacing scale includes `18px` and `28px`.
- Primitive / Semantic / Component layers are preserved.
- Local Graph / Document / Print geometry remains local unless it represents a reusable design rule.

## Token pipeline

The project now uses:

```text
design-tokens/tokens.json
    ↓
design-tokens/build-tokens.js
    ↓
design-tokens/tokens.css
    ↓
application CSS
```

From this point forward, `design-tokens/tokens.json` is the canonical Design Token source. `design-tokens/tokens.css` is generated output and should not be independently maintained.

## Requirements

The generator is plain JavaScript executed by Node.js.

It has **no npm package dependencies** and does not require `npm install`.

Recommended:

```text
Node.js 18+
```

The website itself does not need Node.js at runtime. Node.js is only used during development/build/validation.

## Generate CSS

From the project root:

```bash
node design-tokens/build-tokens.js
```

This reads:

```text
design-tokens/tokens.json
```

and writes:

```text
design-tokens/tokens.css
```

The generated CSS contains an auto-generated warning header and should not be edited manually.

## Validate synchronization

Run:

```bash
node design-tokens/build-tokens.js --check
```

If JSON and CSS match:

```text
[design-tokens] OK — 148 tokens validated; design-tokens/tokens.css is in sync.
```

If `design-tokens/tokens.css` was manually changed or is stale, validation exits with an error and instructs the developer to regenerate it.

This command is suitable for future CI integration.

## Generator validation

The generator validates:

- JSON parsing;
- token discovery;
- token `$type` presence/inheritance;
- CSS variable metadata;
- duplicate CSS variable names;
- broken aliases;
- alias type mismatch;
- supported token serialization;
- generated CSS synchronization in `--check` mode.

Supported token types in the current Judicial token set:

```text
color
dimension
fontFamily
fontWeight
shadow
number / simple scalar fallback
```

Aliases are emitted as CSS variables instead of duplicated values.

Example:

```json
{
  "$type": "dimension",
  "$value": "{primitive.radius.pill}"
}
```

becomes:

```css
--status-badge-container-radius: var(--radius-pill);
```

## Validation result

Current V1.0 pipeline was verified against the approved CSS token snapshot:

```text
JSON token leaves: 148
Generated CSS variables: 148
Missing CSS variables: 0
Extra CSS variables: 0
Value differences: 0
Broken aliases: 0
Generator --check: Passed
JavaScript syntax check: Passed
```

The generated file may organize comments/order differently from the previous manually maintained CSS, but all 148 CSS variable names and values are preserved exactly.

## Maintenance rule

From now on:

```text
DO:
edit design-tokens/tokens.json
→ node design-tokens/build-tokens.js
→ node design-tokens/build-tokens.js --check
→ commit design-tokens/tokens.json + generated design-tokens/tokens.css
```

Avoid:

```text
edit design-tokens/tokens.json
+
independently edit design-tokens/tokens.css
```

If a new token cannot be represented by the generator yet, extend the generator intentionally rather than silently hand-maintaining two conflicting sources.

## Framework compatibility

This pipeline is not tied to the website framework.

`design-tokens/tokens.css` is normal CSS and can be consumed by:

```text
Plain HTML/CSS/JS
React / Next.js
Angular
Vue / Nuxt
Django / Flask / FastAPI templates
other web stacks
```

The current generator uses Node.js because it is a small, portable build utility. A Python project could later replace it with an equivalent Python generator without changing the token architecture.

## Suggested commit

```text
feat(design-tokens): 建立 JSON 至 CSS Token 產生流程
```
