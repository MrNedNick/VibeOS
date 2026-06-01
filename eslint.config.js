// ESLint flat config (ESLint v9) — added S15 T8
// Strategy: warn > error for max-lines so the first pass doesn't block CI.
// Increase strictness gradually as the codebase improves.
import tsPlugin  from '@typescript-eslint/eslint-plugin'
import tsParser  from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  // ── Ignored paths ────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // ── TypeScript source files ──────────────────────────────────────────
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser:        tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      // Catch unused variables (with _prefix escape hatch)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Flag `any` usage — warn first, upgrade to error after store/component tests land
      '@typescript-eslint/no-explicit-any': 'warn',
      // No non-null assertions — use optional chaining instead
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },

  // ── Vue SFC files ─────────────────────────────────────────────────────
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser:        vueParser,
      parserOptions: {
        parser:      tsParser,
        ecmaVersion: 'latest',
        sourceType:  'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      'vue':                 vuePlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // ── Vue rules (essential set) ─────────────────────────────────────
      'vue/multi-word-component-names':  'off',  // VibeOS has single-word views (allowed)
      'vue/no-unused-vars':              'warn',
      'vue/no-unused-components':        'warn',
      'vue/require-v-for-key':           'error',
      'vue/no-use-v-if-with-v-for':      'error',
      'vue/no-mutating-props':           'error',
      // ── God-component guard (S15 T4) ────────────────────────────────
      // warn at 400 lines (natural split point), hard error would be premature
      'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
      // ── TS rules for <script setup> ──────────────────────────────────
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
