#!/usr/bin/env node
/**
 * S14 T4 — Hex guard
 * Counts hardcoded hex colors in src/**\/*.{vue,ts} (excluding test files and main.css).
 * Fails if the count exceeds MAX_ALLOWED, preventing new violations from being added.
 *
 * Current baseline: 180 (measured 2026-06-13, down from 212 via S9/S11 cleanup).
 * To reduce: replace hex with CSS vars (e.g. #f59e0b → var(--color-warning)).
 * To raise the ceiling: update MAX_ALLOWED with a comment explaining why.
 */
import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const MAX_ALLOWED = 185  // baseline 180 (2026-06-13) + 5 tolerance

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

let output = ''
try {
  output = execSync(
    `grep -rn '#[0-9a-fA-F]\\{6\\}\\b' "${root}/src" --include="*.vue" --include="*.ts" | grep -v '\\.test\\.' | grep -v '// #' || true`,
    { encoding: 'utf-8' }
  )
} catch {
  // grep returns exit 1 when no matches — that's fine
}

const lines = output.split('\n').filter(Boolean)
const count = lines.length

console.log(`Hex colors in src (excluding tests): ${count} / ${MAX_ALLOWED} allowed`)

if (count > MAX_ALLOWED) {
  console.error(`\nERROR: ${count - MAX_ALLOWED} new hardcoded hex violation(s) detected.`)
  console.error('Replace with CSS vars (e.g. var(--color-warning), var(--color-accent)).')
  console.error('\nNew violations:')
  // Show only lines that look new (rough heuristic — show last N)
  lines.slice(-Math.min(20, count - MAX_ALLOWED)).forEach(l => console.error(' ', l))
  process.exit(1)
}

console.log('Hex check passed.')
