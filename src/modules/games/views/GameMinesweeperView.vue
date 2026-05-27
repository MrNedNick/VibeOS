<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@/core/composables/useStorage'

const router = useRouter()

// ── Config ────────────────────────────────────────────────────────────
const ROWS = 9
const COLS = 9
const MINES = 10

// ── Types ─────────────────────────────────────────────────────────────
type GameState = 'idle' | 'playing' | 'won' | 'lost'

interface Cell {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
}

// ── State ─────────────────────────────────────────────────────────────
const best = useStorage<number>('platform:games:minesweeper:best', 0)
const gameState = ref<GameState>('idle')
const board = ref<Cell[][]>([])
const flagCount = ref(0)
const elapsed = ref(0)
let timerInterval = 0

// ── Board helpers ──────────────────────────────────────────────────────
function makeEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false, revealed: false, flagged: false, adjacent: 0,
    }))
  )
}

function countAdjacentMines(b: Cell[][], r: number, c: number): number {
  let count = 0
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].mine) count++
    }
  return count
}

function placeMines(b: Cell[][], safeR: number, safeC: number): void {
  const safe = new Set<string>()
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++)
      safe.add(`${safeR + dr},${safeC + dc}`)

  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (!b[r][c].mine && !safe.has(`${r},${c}`)) {
      b[r][c].mine = true
      placed++
    }
  }
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      b[r][c].adjacent = countAdjacentMines(b, r, c)
}

function floodReveal(b: Cell[][], r: number, c: number): void {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return
  const cell = b[r][c]
  if (cell.revealed || cell.flagged || cell.mine) return
  cell.revealed = true
  if (cell.adjacent === 0) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        if (dr !== 0 || dc !== 0) floodReveal(b, r + dr, c + dc)
  }
}

// ── Game actions ───────────────────────────────────────────────────────
function startGame(): void {
  board.value = makeEmptyBoard()
  flagCount.value = 0
  elapsed.value = 0
  gameState.value = 'idle'
  clearInterval(timerInterval)
}

function reveal(r: number, c: number): void {
  const b = board.value
  const cell = b[r][c]
  if (cell.flagged || cell.revealed) return

  if (gameState.value === 'idle') {
    placeMines(b, r, c)
    gameState.value = 'playing'
    timerInterval = setInterval(() => { elapsed.value++ }, 1000) as unknown as number
  }
  if (gameState.value !== 'playing') return

  if (cell.mine) {
    // Reveal all mines
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLS; col++)
        if (b[row][col].mine) b[row][col].revealed = true
    gameState.value = 'lost'
    clearInterval(timerInterval)
    return
  }

  floodReveal(b, r, c)
  checkWin()
}

function toggleFlag(r: number, c: number): void {
  if (gameState.value !== 'playing' && gameState.value !== 'idle') return
  const cell = board.value[r][c]
  if (cell.revealed) return
  cell.flagged = !cell.flagged
  flagCount.value += cell.flagged ? 1 : -1
}

function checkWin(): void {
  const b = board.value
  const allSafeCellsRevealed = b.every(row =>
    row.every(cell => cell.mine || cell.revealed)
  )
  if (allSafeCellsRevealed) {
    gameState.value = 'won'
    clearInterval(timerInterval)
    if (best.value === 0 || elapsed.value < best.value) best.value = elapsed.value
  }
}

// ── Display helpers ────────────────────────────────────────────────────
const minesLeft = computed(() => MINES - flagCount.value)

const adjacentColor: Record<number, string> = {
  1: '#3b82f6', 2: '#16a34a', 3: '#ef4444', 4: '#1d4ed8',
  5: '#dc2626', 6: '#0891b2', 7: '#7c3aed', 8: '#374151',
}

function cellLabel(cell: Cell): string {
  if (!cell.revealed) return cell.flagged ? '🚩' : ''
  if (cell.mine) return '💣'
  if (cell.adjacent === 0) return ''
  return String(cell.adjacent)
}

function cellClass(cell: Cell): Record<string, boolean> {
  return {
    'cell--hidden': !cell.revealed && !cell.flagged,
    'cell--flag': cell.flagged && !cell.revealed,
    'cell--revealed': cell.revealed && !cell.mine,
    'cell--mine': cell.revealed && cell.mine,
    'cell--safe': cell.revealed && !cell.mine && cell.adjacent === 0,
  }
}

// ── Keyboard ───────────────────────────────────────────────────────────
function onKey(e: KeyboardEvent) {
  if (e.key === 'r' || e.key === 'R') startGame()
}

onMounted(() => {
  startGame()
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  clearInterval(timerInterval)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="game">

    <!-- Header -->
    <div class="game__header">
      <button class="game__back" @click="router.push('/games')">← Games</button>
      <div class="game__scores">
        <div class="score-box">
          <span class="score-box__label">Mines</span>
          <span class="score-box__val">{{ minesLeft }}</span>
        </div>
        <div class="score-box">
          <span class="score-box__label">Time</span>
          <span class="score-box__val">{{ elapsed }}s</span>
        </div>
        <div class="score-box">
          <span class="score-box__label">Best</span>
          <span class="score-box__val">{{ best > 0 ? `${best}s` : '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Title row -->
    <div class="game__title-row">
      <div>
        <h1 class="game__title">Minesweeper</h1>
        <p class="game__hint">
          <span v-if="gameState === 'idle'">Click any cell to start</span>
          <span v-else-if="gameState === 'playing'">Left click: reveal · Right click: flag</span>
          <span v-else-if="gameState === 'won'">You win! 🎉</span>
          <span v-else>Boom! Hit a mine.</span>
        </p>
      </div>
      <button class="btn-new" @click="startGame">New Game</button>
    </div>

    <!-- Board -->
    <div class="board-wrap">
      <div class="board">
        <div
          v-for="(row, r) in board"
          :key="r"
          class="board__row"
        >
          <button
            v-for="(cell, c) in row"
            :key="c"
            class="cell"
            :class="cellClass(cell)"
            :style="cell.revealed && cell.adjacent > 0 && !cell.mine
              ? { color: adjacentColor[cell.adjacent] }
              : {}"
            :disabled="gameState === 'won' || gameState === 'lost'"
            @click="reveal(r, c)"
            @click.right.prevent="toggleFlag(r, c)"
            @contextmenu.prevent="toggleFlag(r, c)"
          >{{ cellLabel(cell) }}</button>
        </div>
      </div>

      <!-- Overlays -->
      <Transition name="overlay">
        <div v-if="gameState === 'won'" class="overlay overlay--win">
          <p class="overlay__title">You Win!</p>
          <p class="overlay__sub">
            Cleared in {{ elapsed }}s
            <span v-if="best === elapsed"> · 🏆 New best!</span>
          </p>
          <button class="btn-overlay" @click="startGame">Play again</button>
        </div>
      </Transition>

      <Transition name="overlay">
        <div v-if="gameState === 'lost'" class="overlay overlay--lose">
          <p class="overlay__title">Boom!</p>
          <p class="overlay__sub">You hit a mine.</p>
          <button class="btn-overlay" @click="startGame">Try again</button>
        </div>
      </Transition>
    </div>

    <p class="game__controls">Left click: reveal · Right click / long press: flag · R: new game</p>

  </div>
</template>

<style scoped>
.game {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}

.game__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.game__back {
  font-size: 14px;
  color: var(--color-text-muted);
  transition: color var(--t-fast);
  padding: 4px 0;
}
.game__back:hover { color: var(--color-text); }

.game__scores {
  display: flex;
  gap: 6px;
}

.score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 58px;
  padding: 5px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.score-box__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.score-box__val {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
  color: var(--color-text);
  line-height: 1.2;
}

.game__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.game__title {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.03em;
}

.game__hint {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.btn-new {
  padding: 8px 16px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  transition: opacity var(--t-fast);
  flex-shrink: 0;
}
.btn-new:hover { opacity: 0.85; }

/* ── Board ────────────────────────────────────────────────────────────── */
.board-wrap {
  position: relative;
  display: inline-block;
  width: 100%;
}

.board {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 8px;
  width: 100%;
}

.board__row {
  display: flex;
  gap: 2px;
}

.cell {
  flex: 1;
  aspect-ratio: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(10px, 2.2vw, 16px);
  font-weight: 700;
  font-family: var(--font-mono);
  border-radius: 3px;
  cursor: pointer;
  transition: background var(--t-fast), transform var(--t-fast);
  border: 1px solid transparent;
  user-select: none;
  -webkit-user-select: none;
}

.cell--hidden {
  background: var(--color-surface-elevated);
  border-color: var(--color-border);
}
.cell--hidden:not(:disabled):hover {
  background: color-mix(in srgb, var(--color-accent) 15%, var(--color-surface-elevated));
  border-color: var(--color-accent);
}

.cell--flag {
  background: color-mix(in srgb, #f59e0b 12%, var(--color-surface-elevated));
  border-color: rgba(245,158,11,0.4);
}

.cell--revealed {
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-bg));
  border-color: var(--color-border);
  cursor: default;
}

.cell--safe {
  background: var(--color-bg);
  border-color: transparent;
}

.cell--mine {
  background: color-mix(in srgb, #ef4444 20%, var(--color-surface));
  border-color: rgba(239,68,68,0.4);
  cursor: default;
}

.cell:disabled { cursor: default; }

/* ── Overlays ─────────────────────────────────────────────────────────── */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: var(--radius);
  backdrop-filter: blur(4px);
}

.overlay--win  { background: rgba(0,0,0,0.78); }
.overlay--lose { background: rgba(0,0,0,0.82); }

.overlay__title {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.overlay__sub {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

.btn-overlay {
  margin-top: 4px;
  padding: 9px 22px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  transition: opacity var(--t-fast);
  cursor: pointer;
}
.btn-overlay:hover { opacity: 0.85; }

.overlay-enter-active { transition: opacity 200ms ease, transform 200ms ease; }
.overlay-leave-active { transition: opacity 150ms ease; }
.overlay-enter-from   { opacity: 0; transform: scale(0.97); }
.overlay-leave-to     { opacity: 0; }

/* ── Footer ───────────────────────────────────────────────────────────── */
.game__controls {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  font-family: var(--font-mono);
  margin: 0;
}

/* ── Responsive ───────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .game__title  { font-size: 28px; }
  .board        { padding: 5px; gap: 1px; }
  .board__row   { gap: 1px; }
  .cell         { font-size: clamp(8px, 3.5vw, 14px); border-radius: 2px; }
  .score-box    { min-width: 48px; padding: 4px 8px; }
  .score-box__val { font-size: 15px; }
}
</style>
