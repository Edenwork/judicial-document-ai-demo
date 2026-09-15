#!/usr/bin/env node
'use strict';

/**
 * Judicial Design Tokens — JSON -> CSS generator
 *
 * Source of truth: ./tokens.json
 * Generated output: ./css/tokens.css
 *
 * Usage:
 *   node build-tokens.js
 *   node build-tokens.js --check
 *
 * No npm packages required.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const INPUT = path.join(ROOT, 'tokens.json');
const OUTPUT = path.join(ROOT, 'css', 'tokens.css');
const CHECK_MODE = process.argv.includes('--check');

const CSS_EXTENSION = 'com.comma-design.css';

function fail(message) {
  console.error(`\n[design-tokens] ERROR: ${message}`);
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`Cannot read/parse ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

function isToken(node) {
  return node && typeof node === 'object' && !Array.isArray(node) && Object.prototype.hasOwnProperty.call(node, '$value');
}

function collectTokens(node, tokenPath = [], inheritedType = undefined, result = []) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return result;

  const localType = node.$type || inheritedType;

  if (isToken(node)) {
    const cssVariable = node.$extensions?.[CSS_EXTENSION]?.variable;
    if (!cssVariable || !/^--[a-zA-Z0-9_-]+$/.test(cssVariable)) {
      fail(`Token {${tokenPath.join('.')}} is missing a valid ${CSS_EXTENSION}.variable extension.`);
    }
    if (!localType) {
      fail(`Token {${tokenPath.join('.')}} has no $type and does not inherit one.`);
    }

    result.push({
      path: tokenPath.join('.'),
      parts: [...tokenPath],
      type: localType,
      value: node.$value,
      cssVariable,
    });
    return result;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    collectTokens(value, [...tokenPath, key], localType, result);
  }

  return result;
}

function isAlias(value) {
  return typeof value === 'string' && /^\{[^{}]+\}$/.test(value.trim());
}

function aliasPath(value) {
  return value.trim().slice(1, -1);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) fail(`Invalid numeric value: ${value}`);
  return String(Number(value.toFixed(6)));
}

function formatAlpha(alpha) {
  if (!Number.isFinite(alpha)) fail(`Invalid alpha value: ${alpha}`);
  const scaled100 = alpha * 100;
  const decimals = Math.abs(scaled100 - Math.round(scaled100)) < 1e-9 ? 2 : 3;
  const normalized = alpha.toFixed(decimals);
  return normalized.startsWith('0.') ? normalized.slice(1) : normalized;
}

function hexToRgb(hex) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!match) return null;
  const int = Number.parseInt(match[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function serializeColor(value, tokenPath) {
  if (!value || typeof value !== 'object') fail(`Color token {${tokenPath}} must use a DTCG color object.`);

  const alpha = value.alpha ?? 1;
  const hex = typeof value.hex === 'string' ? value.hex.toLowerCase() : null;

  if (hex && alpha === 1) return hex;

  let rgb = hexToRgb(hex);
  if (!rgb && value.colorSpace === 'srgb' && Array.isArray(value.components) && value.components.length >= 3) {
    rgb = value.components.slice(0, 3).map((component) => Math.round(Number(component) * 255));
  }

  if (!rgb) fail(`Color token {${tokenPath}} cannot be converted to CSS.`);

  if (alpha === 1) {
    return `rgb(${rgb.join(', ')})`;
  }

  return `rgba(${rgb.join(', ')}, ${formatAlpha(Number(alpha))})`;
}

function serializeDimension(value, tokenPath) {
  if (!value || typeof value !== 'object' || typeof value.value !== 'number' || typeof value.unit !== 'string') {
    fail(`Dimension token {${tokenPath}} must be { value, unit }.`);
  }
  if (value.value === 0) return '0';
  return `${formatNumber(value.value)}${value.unit}`;
}

function quoteFontFamily(family) {
  const generic = new Set([
    'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
    'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong',
  ]);

  if (generic.has(family) || /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(family)) return family;
  return `"${family.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function serializeFontFamily(value, tokenPath) {
  const families = Array.isArray(value) ? value : [value];
  if (!families.length || families.some((family) => typeof family !== 'string')) {
    fail(`Font family token {${tokenPath}} must be a string or string array.`);
  }
  return families.map(quoteFontFamily).join(', ');
}

function serializeShadow(value, tokenPath) {
  const shadows = Array.isArray(value) ? value : [value];

  return shadows.map((shadow) => {
    if (!shadow || typeof shadow !== 'object') fail(`Shadow token {${tokenPath}} has an invalid value.`);

    const offsetX = serializeDimension(shadow.offsetX, `${tokenPath}.offsetX`);
    const offsetY = serializeDimension(shadow.offsetY, `${tokenPath}.offsetY`);
    const blur = serializeDimension(shadow.blur, `${tokenPath}.blur`);
    const spread = serializeDimension(shadow.spread, `${tokenPath}.spread`);
    const color = serializeColor(shadow.color, `${tokenPath}.color`);

    const parts = [offsetX, offsetY, blur];
    if (spread !== '0') parts.push(spread);
    parts.push(color);
    return parts.join(' ');
  }).join(', ');
}

function resolveAlias(token, tokenMap) {
  const targetPath = aliasPath(token.value);
  const target = tokenMap.get(targetPath);
  if (!target) fail(`Broken alias in {${token.path}} -> {${targetPath}}.`);
  if (target.type !== token.type) {
    fail(`Alias type mismatch: {${token.path}} (${token.type}) -> {${targetPath}} (${target.type}).`);
  }
  return `var(${target.cssVariable})`;
}

function serializeToken(token, tokenMap) {
  if (isAlias(token.value)) return resolveAlias(token, tokenMap);

  switch (token.type) {
    case 'color':
      return serializeColor(token.value, token.path);
    case 'dimension':
      return serializeDimension(token.value, token.path);
    case 'fontFamily':
      return serializeFontFamily(token.value, token.path);
    case 'fontWeight':
    case 'number':
      return formatNumber(Number(token.value));
    case 'shadow':
      return serializeShadow(token.value, token.path);
    default:
      if (typeof token.value === 'string' || typeof token.value === 'number') return String(token.value);
      fail(`Unsupported $type "${token.type}" at {${token.path}}.`);
  }
}

function layerLabel(layer) {
  return {
    primitive: 'Primitive',
    semantic: 'Semantic',
    component: 'Component',
  }[layer] || layer;
}

function generateCss(tokens) {
  const tokenMap = new Map(tokens.map((token) => [token.path, token]));
  const variableMap = new Map();

  for (const token of tokens) {
    if (variableMap.has(token.cssVariable)) {
      fail(`Duplicate CSS variable ${token.cssVariable}: {${variableMap.get(token.cssVariable)}} and {${token.path}}.`);
    }
    variableMap.set(token.cssVariable, token.path);
  }

  const lines = [
    '/*',
    ' * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.',
    ' * Source: tokens.json',
    ' * Generate: node build-tokens.js',
    ' * Validate: node build-tokens.js --check',
    ' */',
    '',
    ':root {',
  ];

  let currentLayer = null;
  let currentGroup = null;

  for (const token of tokens) {
    const layer = token.parts[0] || 'tokens';
    const group = token.parts[1] || 'general';

    if (layer !== currentLayer) {
      if (currentLayer !== null) lines.push('');
      lines.push(`  /* ${layerLabel(layer)} */`);
      currentLayer = layer;
      currentGroup = null;
    }

    if (group !== currentGroup) {
      if (currentGroup !== null) lines.push('');
      lines.push(`  /* ${layerLabel(layer)} · ${group} */`);
      currentGroup = group;
    }

    lines.push(`  ${token.cssVariable}: ${serializeToken(token, tokenMap)};`);
  }

  lines.push('}', '');
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(INPUT)) fail('tokens.json not found next to build-tokens.js.');

  const document = readJson(INPUT);
  const tokens = collectTokens(document);
  if (!tokens.length) fail('No design tokens found in tokens.json.');

  const css = generateCss(tokens);

  if (CHECK_MODE) {
    if (!fs.existsSync(OUTPUT)) fail('css/tokens.css does not exist. Run `node build-tokens.js` first.');
    const current = fs.readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n');
    if (current !== css) {
      console.error('\n[design-tokens] OUT OF SYNC: css/tokens.css differs from tokens.json.');
      console.error('[design-tokens] Run: node build-tokens.js\n');
      process.exit(2);
    }
    console.log(`[design-tokens] OK — ${tokens.length} tokens validated; css/tokens.css is in sync.`);
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, css, 'utf8');
  console.log(`[design-tokens] Generated css/tokens.css from ${tokens.length} tokens.`);
  console.log('[design-tokens] Source of truth: tokens.json');
}

main();
