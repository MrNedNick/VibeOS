<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '@/core/i18n'

const router = useRouter()
const i18n = useLocale()

// ── Puzzle definitions ────────────────────────────────────────────────
// Each puzzle is [clues, solution] where 0 = empty cell
type Grid = number[][]

const PUZZLES: [Grid, Grid][] = [
  // Puzzle 1 — classic Dell Magazine puzzle
  [
    [
      [5,3,0, 0,7,0, 0,0,0],
      [6,0,0, 1,9,5, 0,0,0],
      [0,9,8, 0,0,0, 0,6,0],
      [8,0,0, 0,6,0, 0,0,3],
      [4,0,0, 8,0,3, 0,0,1],
      [7,0,0, 0,2,0, 0,0,6],
      [0,6,0, 0,0,0, 2,8,0],
      [0,0,0, 4,1,9, 0,0,5],
      [0,0,0, 0,8,0, 0,7,9],
    ],
    [
      [5,3,4, 6,7,8, 9,1,2],
      [6,7,2, 1,9,5, 3,4,8],
      [1,9,8, 3,4,2, 5,6,7],
      [8,5,9, 7,6,1, 4,2,3],
      [4,2,6, 8,5,3, 7,9,1],
      [7,1,3, 9,2,4, 8,5,6],
      [9,6,1, 5,3,7, 2,8,4],
      [2,8,7, 4,1,9, 6,3,5],
      [3,4,5, 2,8,6, 1,7,9],
    ],
  ],
  // Puzzle 2 — Wikipedia example
  [
    [
      [0,0,3, 0,2,0, 6,0,0],
      [9,0,0, 3,0,5, 0,0,1],
      [0,0,1, 8,0,6, 4,0,0],
      [0,0,8, 1,0,2, 9,0,0],
      [7,0,0, 0,0,0, 0,0,8],
      [0,0,6, 7,0,8, 2,0,0],
      [0,0,2, 6,0,9, 5,0,0],
      [8,0,0, 2,0,3, 0,0,9],
      [0,0,5, 0,1,0, 3,0,0],
    ],
    [
      [4,8,3, 9,2,1, 6,5,7],
      [9,6,7, 3,4,5, 8,2,1],
      [2,5,1, 8,7,6, 4,9,3],
      [5,4,8, 1,3,2, 9,7,6],
      [7,2,9, 5,6,4, 1,3,8],
      [1,3,6, 7,9,8, 2,4,5],
      [3,7,2, 6,8,9, 5,1,4],
      [8,1,4, 2,5,3, 7,6,9],
      [6,9,5, 4,1,7, 3,8,2],
    ],
  ],
  // Puzzle 3 — medium difficulty
  [
    [
      [0,0,0, 2,6,0, 7,0,1],
      [6,8,0, 0,7,0, 0,9,0],
      [1,9,0, 0,0,4, 5,0,0],
      [8,2,0, 1,0,0, 0,4,0],
      [0,0,4, 6,0,2, 9,0,0],
      [0,5,0, 0,0,3, 0,2,8],
      [0,0,9, 3,0,0, 0,7,4],
      [0,4,0, 0,5,0, 0,3,6],
      [7,0,3, 0,1,8, 0,0,0],
    ],
    [
      [4,3,5, 2,6,9, 7,8,1],
      [6,8,2, 5,7,1, 4,9,3],
      [1,9,7, 8,3,4, 5,6,2],
      [8,2,6, 1,9,5, 3,4,7],
      [3,7,4, 6,8,2, 9,1,5],
      [9,5,1, 7,4,3, 6,2,8],
      [5,1,9, 3,2,6, 8,7,4],
      [2,4,8, 9,5,7, 1,3,6],
      [7,6,3, 4,1,8, 2,5,9],
    ],
  ],
]

// ── State ─────────────────────────────────────────────────────────────
const puzzleIndex = ref(0)
const grid = ref<Grid>([])
const given = ref<boolean[][]>([])
const solution = ref<Grid>([])
const selected = ref<{ r: number; c: number } | null>(null)
const status = ref<'playing' | 'won'>('playing')

// Timer
const seconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

function startTimer() {
  stopTimer()
  timerInterval = setInterval(() => { seconds.value++ }, 1000)
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

const formattedTime = computed(() => {
  const m = Math.floor(seconds.value / 60)
  const s = seconds.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

// ── Conflict detection ────────────────────────────────────────────────
function hasConflict(r: number, c: number): boolean {
  const val = grid.value[r][c]
  if (!val) return false
  for (let i = 0; i < 9; i++) {
    if (i !== c && grid.value[r][i] === val) return true
    if (i !== r && grid.value[i][c] === val) return true
  }
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const nr = br + dr, nc = bc + dc
      if ((nr !== r || nc !== c) && grid.value[nr][nc] === val) return true
    }
  }
  return false
}

// ── Game control ──────────────────────────────────────────────────────
function loadPuzzle(idx: number) {
  stopTimer()
  puzzleIndex.value = idx
  const [clues, sol] = PUZZLES[idx]
  grid.value = clues.map(row => [...row])
  given.value = clues.map(row => row.map(v => v !== 0))
  solution.value = sol.map(row => [...row])
  selected.value = null
  status.value = 'playing'
  seconds.value = 0
  startTimer()
}

function newGame() {
  const next = (puzzleIndex.value + 1) % PUZZLES.length
  loadPuzzle(next)
}

function selectCell(r: number, c: number) {
  if (status.value === 'won') return
  selected.value = { r, c }
}

function enterNumber(n: number) {
  if (!selected.value || status.value === 'won') return
  const { r, c } = selected.value
  if (given.value[r][c]) return
  grid.value[r][c] = n
  checkWin()
}

function eraseCell() {
  if (!selected.value || status.value === 'won') return
  const { r, c } = selected.value
  if (given.value[r][c]) return
  grid.value[r][c] = 0
}

function checkWin() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid.value[r][c] !== solution.value[r][c]) return
    }
  }
  status.value = 'won'
  stopTimer()
}

// ── Keyboard navigation ───────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (status.value === 'won') return

  if (!selected.value) {
    if (/^[1-9]$/.test(e.key) || e.key === 'Backspace' || e.key === 'Delete' || e.key.startsWith('Arrow')) {
      selected.value = { r: 0, c: 0 }
    }
    return
  }

  const { r, c } = selected.value

  switch (e.key) {
    case 'ArrowUp':    e.preventDefault(); selected.value = { r: Math.max(0, r - 1), c }; break
    case 'ArrowDown':  e.preventDefault(); selected.value = { r: Math.min(8, r + 1), c }; break
    case 'ArrowLeft':  e.preventDefault(); selected.value = { r, c: Math.max(0, c - 1) }; break
    case 'ArrowRight': e.preventDefault(); selected.value = { r, c: Math.min(8, c + 1) }; break
    case 'Backspace':
    case 'Delete':     eraseCell(); break
    default:
      if (/^[1-9]$/.test(e.key)) enterNumber(parseInt(e.key))
  }
}

// ── Cell highlight helpers ────────────────────────────────────────────
function cellClasses(r: number, c: number): Record<string, boolean> {
  const sel = selected.value
  const val = grid.value[r][c]
  const isSelected = sel?.r === r && sel?.c === c
  const isSameNum = !isSelected && !!val && sel !== null && grid.value[sel.r][sel.c] === val
  const isRelated = !isSelected && sel !== null && (
    sel.r === r || sel.c === c ||
    (Math.floor(sel.r / 3) === Math.floor(r / 3) && Math.floor(sel.c / 3) === Math.floor(c / 3))
  )
  return {
    'cell--selected': isSelected,
    'cell--related': isRelated && !isSelected,
    'cell--same-num': isSameNum,
    'cell--given': given.value[r][c],
    'cell--user': !given.value[r][c] && !!val,
    'cell--conflict': !!val && hasConflict(r, c),
    'cell--border-right': c === 2 || c === 5,
    'cell--border-bottom': r === 2 || r === 5,
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => {
  loadPuzzle(0)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  stopTimer()
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="sudoku-view">

    <!-- Header -->
    <div class="sudoku-header">
      <button class="sudoku-back" @click="router.push('/games')">
        {{ i18n.t('games.sudokuBack') }}
      </button>
      <div class="sudoku-meta">
        <span class="sudoku-meta__item">
          <span class="sudoku-meta__label">{{ i18n.t('games.sudokuPuzzle') }}</span>
          <span class="sudoku-meta__value">{{ puzzleIndex + 1 }} / {{ PUZZLES.length }}</span>
        </span>
        <span class="sudoku-meta__item">
          <span class="sudoku-meta__label">{{ i18n.t('games.sudokuTimer') }}</span>
          <span class="sudoku-meta__value sudoku-meta__value--mono">{{ formattedTime }}</span>
        </span>
      </div>
      <button class="sudoku-new-btn" @click="newGame">
        {{ i18n.t('games.sudokuNewGame') }}
      </button>
    </div>

    <!-- Win banner -->
    <Transition name="win-fade">
      <div v-if="status === 'won'" class="sudoku-win">
        <span class="sudoku-win__emoji">🎉</span>
        <div>
          <p class="sudoku-win__title">{{ i18n.t('games.sudokuSolved') }}</p>
          <p class="sudoku-win__sub">{{ i18n.t('games.sudokuSolvedSub') }} · {{ formattedTime }}</p>
        </div>
        <button class="sudoku-new-btn" @click="newGame">
          {{ i18n.t('games.sudokuNewGame') }}
        </button>
      </div>
    </Transition>

    <!-- Game area -->
    <div class="sudoku-game">
      <!-- Grid -->
      <div class="sudoku-grid" :class="{ 'sudoku-grid--won': status === 'won' }">
        <template v-for="(row, r) in grid" :key="r">
          <button
            v-for="(val, c) in row"
            :key="`${r}-${c}`"
            class="cell"
            :class="cellClasses(r, c)"
            @click="selectCell(r, c)"
          >
            {{ val || '' }}
          </button>
        </template>
      </div>

      <!-- Number pad -->
      <div class="sudoku-numpad">
        <button
          v-for="n in 9"
          :key="n"
          class="numpad-btn"
          @click="enterNumber(n)"
        >
          {{ n }}
        </button>
        <button class="numpad-btn numpad-btn--erase" @click="eraseCell">
          {{ i18n.t('games.sudokuErase') }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.sudoku-view {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.sudoku-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.sudoku-back {
  font-size: 14px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: color var(--t-fast);
  font-family: inherit;
}
.sudoku-back:hover { color: var(--color-text-secondary); }

.sudoku-meta {
  display: flex;
  gap: 20px;
}

.sudoku-meta__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.sudoku-meta__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.sudoku-meta__value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.sudoku-meta__value--mono {
  font-family: var(--font-mono);
  font-size: 15px;
}

.sudoku-new-btn {
  padding: 7px 16px;
  border-radius: var(--radius);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: border-color var(--t-fast), color var(--t-fast);
  font-family: inherit;
}
.sudoku-new-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* Win banner */
.sudoku-win {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: color-mix(in srgb, var(--color-success) 10%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-success) 40%, var(--color-border));
  border-radius: var(--radius-lg);
}

.sudoku-win__emoji { font-size: 28px; flex-shrink: 0; }
.sudoku-win__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-success);
  margin: 0;
}
.sudoku-win__sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 2px 0 0;
  font-family: var(--font-mono);
}

.win-fade-enter-active { transition: opacity 300ms ease, transform 300ms var(--ease-spring); }
.win-fade-leave-active { transition: opacity 200ms ease; }
.win-fade-enter-from   { opacity: 0; transform: translateY(-8px); }
.win-fade-leave-to     { opacity: 0; }

/* Game layout */
.sudoku-game {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* Grid */
.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  border: 2px solid var(--color-text-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: opacity var(--t);
  width: 100%;
  max-width: 432px;
  aspect-ratio: 1;
}

.sudoku-grid--won { opacity: 0.6; }

/* Cell */
.cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  transition: background var(--t-fast), color var(--t-fast);
  font-family: inherit;
  color: var(--color-accent);
  padding: 0;
  line-height: 1;
}

/* Box separators */
.cell--border-right  { border-right: 2px solid var(--color-text-secondary); }
.cell--border-bottom { border-bottom: 2px solid var(--color-text-secondary); }

/* Given (pre-filled) cells */
.cell--given {
  color: var(--color-text);
  font-weight: 700;
  background: var(--color-surface-elevated);
  cursor: default;
}

/* Selected cell */
.cell--selected {
  background: color-mix(in srgb, var(--color-accent) 20%, var(--color-surface)) !important;
  color: var(--color-accent);
}

/* Related cells (same row/col/box) */
.cell--related {
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface));
}

/* Same number highlight */
.cell--same-num {
  background: color-mix(in srgb, var(--color-accent) 12%, var(--color-surface));
}

/* Conflict */
.cell--conflict {
  color: var(--color-danger) !important;
  background: color-mix(in srgb, var(--color-danger) 12%, var(--color-surface)) !important;
}

/* Number pad */
.sudoku-numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  flex: 0 0 auto;
}

.numpad-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
  font-family: inherit;
}

.numpad-btn:hover {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.numpad-btn--erase {
  grid-column: span 3;
  height: 36px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
}

.numpad-btn--erase:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, var(--color-surface));
}

/* Responsive */
@media (max-width: 560px) {
  .sudoku-game { gap: 16px; }
  .sudoku-grid { max-width: 100%; }
  .cell { font-size: 14px; }

  .sudoku-numpad {
    width: 100%;
    grid-template-columns: repeat(5, 1fr);
  }

  .numpad-btn {
    width: auto;
    height: 44px;
  }

  .numpad-btn--erase {
    grid-column: span 5;
    height: 36px;
  }
}

@media (max-width: 400px) {
  .cell { font-size: 12px; }
  .sudoku-meta { gap: 14px; }
}
</style>
