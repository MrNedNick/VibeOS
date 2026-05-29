<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { useEventBus } from '@/core/events'
import { UiIcon } from '@/ui'

// ── Constants ────────────────────────────────────────────────────────────
const COLS = 10
const ROWS = 20
const CELL = 30  // px per cell
const PREVIEW_CELLS = 4

// ── Tetrominoes ──────────────────────────────────────────────────────────
type Piece = { shape: number[][]; color: string; name: string }

const PIECES: Piece[] = [
  { name: 'I', color: '#06b6d4', shape: [[1,1,1,1]] },
  { name: 'O', color: '#eab308', shape: [[1,1],[1,1]] },
  { name: 'T', color: '#a855f7', shape: [[0,1,0],[1,1,1]] },
  { name: 'S', color: '#22c55e', shape: [[0,1,1],[1,1,0]] },
  { name: 'Z', color: '#ef4444', shape: [[1,1,0],[0,1,1]] },
  { name: 'J', color: '#4f8ef7', shape: [[1,0,0],[1,1,1]] },
  { name: 'L', color: '#f97316', shape: [[0,0,1],[1,1,1]] },
]

// ── Types ────────────────────────────────────────────────────────────────
type Board = (string | null)[][]
type GameState = 'idle' | 'playing' | 'paused' | 'over'

interface FallingPiece {
  piece: Piece
  x: number
  y: number
  rotation: number
}

// ── State ────────────────────────────────────────────────────────────────
const bestScore = useStorage<number>('platform:games:tetris:best', 0)
const events = useEventBus()

const state       = ref<GameState>('idle')
const board       = ref<Board>(emptyBoard())
const falling     = ref<FallingPiece | null>(null)
const nextPiece   = ref<Piece>(randomPiece())
const score       = ref(0)
const lines       = ref(0)
const level       = ref(1)
const ghostY      = ref(0)
const canvasRef   = ref<HTMLCanvasElement>()

let rafId         = 0
let lastTime      = 0
let dropAcc       = 0

// ── Helpers ──────────────────────────────────────────────────────────────
function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function randomPiece(): Piece {
  return PIECES[Math.floor(Math.random() * PIECES.length)]
}

function rotate(shape: number[][], times = 1): number[][] {
  let s = shape
  for (let i = 0; i < times; i++) {
    s = s[0].map((_, ci) => s.map(row => row[ci]).reverse())
  }
  return s
}

function currentShape(): number[][] {
  if (!falling.value) return []
  return rotate(falling.value.piece.shape, falling.value.rotation)
}

function fits(shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const nr = y + r, nc = x + c
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false
      if (board.value[nr][nc]) return false
    }
  }
  return true
}

function calcGhost(): number {
  if (!falling.value) return 0
  const shape = currentShape()
  let gy = falling.value.y
  while (fits(shape, falling.value.x, gy + 1)) gy++
  return gy
}

// ── Game logic ────────────────────────────────────────────────────────────
function spawnPiece(): boolean {
  const piece = nextPiece.value
  nextPiece.value = randomPiece()
  const shape = piece.shape
  const x = Math.floor((COLS - shape[0].length) / 2)
  const y = 0
  if (!fits(shape, x, y)) return false  // game over
  falling.value = { piece, x, y, rotation: 0 }
  ghostY.value = calcGhost()
  return true
}

function lockPiece(): void {
  if (!falling.value) return
  const shape = currentShape()
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const nr = falling.value.y + r
      if (nr >= 0 && nr < ROWS) {
        board.value[nr][falling.value.x + c] = falling.value.piece.color
      }
    }
  }
  clearLines()
  falling.value = null
}

function clearLines(): void {
  const cleared: number[] = []
  for (let r = 0; r < ROWS; r++) {
    if (board.value[r].every(c => c !== null)) cleared.push(r)
  }
  if (!cleared.length) return

  const newBoard = board.value.filter((_, r) => !cleared.includes(r))
  while (newBoard.length < ROWS) newBoard.unshift(Array(COLS).fill(null))
  board.value = newBoard

  const points = [0, 100, 300, 500, 800][Math.min(cleared.length, 4)] * level.value
  score.value += points
  lines.value += cleared.length
  level.value = Math.floor(lines.value / 10) + 1
  if (score.value > bestScore.value) bestScore.value = score.value
}

function dropInterval(): number {
  return Math.max(80, 1000 - (level.value - 1) * 90)
}

function tryMove(dx: number, dy: number): boolean {
  if (!falling.value) return false
  const nx = falling.value.x + dx
  const ny = falling.value.y + dy
  if (fits(currentShape(), nx, ny)) {
    falling.value.x = nx
    falling.value.y = ny
    ghostY.value = calcGhost()
    return true
  }
  return false
}

function tryRotate(): void {
  if (!falling.value) return
  const newRot = (falling.value.rotation + 1) % 4
  const shape  = rotate(falling.value.piece.shape, newRot)
  // Wall kick — try x offset +1/-1 if center fails
  for (const dx of [0, 1, -1, 2, -2]) {
    if (fits(shape, falling.value.x + dx, falling.value.y)) {
      falling.value.rotation = newRot
      falling.value.x += dx
      ghostY.value = calcGhost()
      return
    }
  }
}

function hardDrop(): void {
  if (!falling.value) return
  falling.value.y = ghostY.value
  lockPiece()
  if (!spawnPiece()) endGame()
}

function softDrop(): void {
  if (!falling.value) return
  if (!tryMove(0, 1)) {
    lockPiece()
    if (!spawnPiece()) endGame()
  } else {
    score.value += 1
  }
}

// ── Game loop ─────────────────────────────────────────────────────────────
function gameLoop(ts: number): void {
  if (state.value !== 'playing') return
  const dt = ts - lastTime
  lastTime = ts
  dropAcc += dt
  if (dropAcc >= dropInterval()) {
    dropAcc = 0
    softDrop()
  }
  draw()
  rafId = requestAnimationFrame(gameLoop)
}

function startGame(): void {
  board.value = emptyBoard()
  score.value = 0
  lines.value = 0
  level.value = 1
  nextPiece.value = randomPiece()
  falling.value = null
  state.value = 'playing'
  dropAcc = 0
  if (!spawnPiece()) return
  lastTime = performance.now()
  rafId = requestAnimationFrame(gameLoop)
}

function pauseGame(): void {
  if (state.value === 'playing') {
    state.value = 'paused'
    cancelAnimationFrame(rafId)
  } else if (state.value === 'paused') {
    state.value = 'playing'
    lastTime = performance.now()
    rafId = requestAnimationFrame(gameLoop)
  }
}

function endGame(): void {
  state.value = 'over'
  cancelAnimationFrame(rafId)
  events.emit({ type: 'games:tetris:gameover', score: score.value, timestamp: new Date().toISOString() } as never)
}

// ── Rendering ──────────────────────────────────────────────────────────────
const GHOST_ALPHA = 0.22

function draw(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#0d0d0d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke()
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke()
  }

  // Locked cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = board.value[r][c]
      if (color) drawCell(ctx, c, r, color)
    }
  }

  if (falling.value) {
    const shape = currentShape()

    // Ghost
    const ghost = ghostY.value
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue
        drawCell(ctx, falling.value.x + c, ghost + r, falling.value.piece.color, GHOST_ALPHA)
      }
    }

    // Active piece
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue
        drawCell(ctx, falling.value.x + c, falling.value.y + r, falling.value.piece.color)
      }
    }
  }
}

function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, alpha = 1): void {
  const pad = 1
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.fillRect(x * CELL + pad, y * CELL + pad, CELL - pad * 2, CELL - pad * 2)

  // Highlight top-left
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(x * CELL + pad, y * CELL + pad, CELL - pad * 2, 3)
  ctx.fillRect(x * CELL + pad, y * CELL + pad, 3, CELL - pad * 2)

  ctx.globalAlpha = 1
}

// ── Preview canvas ─────────────────────────────────────────────────────────
const previewRef = ref<HTMLCanvasElement>()

function drawPreview(): void {
  const canvas = previewRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const sz = PREVIEW_CELLS * 24
  ctx.clearRect(0, 0, sz, sz)
  const shape = nextPiece.value.shape
  const offX = Math.floor((PREVIEW_CELLS - shape[0].length) / 2)
  const offY = Math.floor((PREVIEW_CELLS - shape.length) / 2)
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      ctx.fillStyle = nextPiece.value.color
      ctx.fillRect((offX + c) * 24 + 1, (offY + r) * 24 + 1, 22, 22)
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fillRect((offX + c) * 24 + 1, (offY + r) * 24 + 1, 22, 3)
      ctx.fillRect((offX + c) * 24 + 1, (offY + r) * 24 + 1, 3, 22)
    }
  }
}

watch(nextPiece, () => drawPreview(), { flush: 'post' })

// ── Keyboard ──────────────────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent): void {
  if (state.value !== 'playing') return
  switch (e.key) {
    case 'ArrowLeft':  e.preventDefault(); tryMove(-1, 0); break
    case 'ArrowRight': e.preventDefault(); tryMove(1, 0); break
    case 'ArrowDown':  e.preventDefault(); softDrop(); break
    case 'ArrowUp':
    case 'x':          e.preventDefault(); tryRotate(); break
    case ' ':          e.preventDefault(); hardDrop(); break
    case 'p':
    case 'P':          pauseGame(); break
  }
}

// ── Touch / swipe ─────────────────────────────────────────────────────────
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent): void {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent): void {
  if (state.value !== 'playing') return
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  const adx = Math.abs(dx), ady = Math.abs(dy)

  if (adx < 8 && ady < 8) {
    tryRotate()
    return
  }
  if (adx > ady) {
    if (dx > 20) tryMove(1, 0)
    else if (dx < -20) tryMove(-1, 0)
  } else {
    if (dy > 30) hardDrop()
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  drawPreview()
  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('keydown', onKeydown)
})

// Score formatting
const formattedScore = computed(() => score.value.toString().padStart(6, '0'))
</script>

<template>
  <div class="tetris">

    <!-- Header -->
    <div class="tetris__header">
      <div>
        <h1 class="tetris__title">Tetris</h1>
        <p class="tetris__sub">← → move · ↑ or X rotate · ↓ soft drop · Space hard drop · P pause</p>
      </div>
      <div class="tetris__best-row">
        <span class="tetris__best-label">Best</span>
        <span class="tetris__best-val">{{ bestScore }}</span>
      </div>
    </div>

    <!-- Game area -->
    <div class="tetris__arena">

      <!-- Left: score / stats -->
      <div class="tetris__side tetris__side--left">
        <div class="tetris__stat">
          <span class="tetris__stat-label">Score</span>
          <span class="tetris__stat-val tetris__stat-val--mono">{{ formattedScore }}</span>
        </div>
        <div class="tetris__stat">
          <span class="tetris__stat-label">Level</span>
          <span class="tetris__stat-val">{{ level }}</span>
        </div>
        <div class="tetris__stat">
          <span class="tetris__stat-label">Lines</span>
          <span class="tetris__stat-val">{{ lines }}</span>
        </div>
      </div>

      <!-- Board -->
      <div
        class="tetris__board-wrap"
        @touchstart.prevent="onTouchStart"
        @touchend.prevent="onTouchEnd"
      >
        <canvas
          ref="canvasRef"
          class="tetris__canvas"
          :width="COLS * CELL"
          :height="ROWS * CELL"
        />

        <!-- Overlay: idle -->
        <div v-if="state === 'idle'" class="tetris__overlay">
          <div class="tetris__overlay-content">
            <div class="tetris__overlay-title">Tetris</div>
            <button class="tetris__start-btn" @click="startGame">
              <UiIcon name="Play" :size="16" />
              Start game
            </button>
          </div>
        </div>

        <!-- Overlay: paused -->
        <div v-else-if="state === 'paused'" class="tetris__overlay tetris__overlay--dim">
          <div class="tetris__overlay-content">
            <div class="tetris__overlay-title">Paused</div>
            <button class="tetris__start-btn" @click="pauseGame">
              <UiIcon name="Play" :size="16" />
              Resume
            </button>
          </div>
        </div>

        <!-- Overlay: game over -->
        <div v-else-if="state === 'over'" class="tetris__overlay tetris__overlay--over">
          <div class="tetris__overlay-content">
            <div class="tetris__overlay-title">Game over</div>
            <div class="tetris__overlay-score">{{ score }}</div>
            <div v-if="score >= bestScore && score > 0" class="tetris__overlay-best">New best! 🎉</div>
            <button class="tetris__start-btn" @click="startGame">
              <UiIcon name="RotateCcw" :size="15" />
              Play again
            </button>
          </div>
        </div>
      </div>

      <!-- Right: next piece -->
      <div class="tetris__side tetris__side--right">
        <div class="tetris__next-label">Next</div>
        <canvas
          ref="previewRef"
          class="tetris__preview"
          :width="PREVIEW_CELLS * 24"
          :height="PREVIEW_CELLS * 24"
        />

        <!-- Mobile controls -->
        <div class="tetris__mobile-ctrl">
          <button class="tetris__ctrl-btn" @click="tryMove(-1, 0)">
            <UiIcon name="ChevronLeft" :size="18" />
          </button>
          <div class="tetris__ctrl-col">
            <button class="tetris__ctrl-btn" @click="tryRotate">
              <UiIcon name="RotateCw" :size="16" />
            </button>
            <button class="tetris__ctrl-btn" @click="softDrop">
              <UiIcon name="ChevronDown" :size="18" />
            </button>
          </div>
          <button class="tetris__ctrl-btn" @click="tryMove(1, 0)">
            <UiIcon name="ChevronRight" :size="18" />
          </button>
        </div>
        <button
          v-if="state === 'playing'"
          class="tetris__ctrl-btn tetris__ctrl-hard-drop"
          @click="hardDrop"
        >
          <UiIcon name="ChevronsDown" :size="18" />
          Drop
        </button>
        <button
          v-if="state === 'playing' || state === 'paused'"
          class="tetris__pause-btn"
          @click="pauseGame"
        >{{ state === 'paused' ? 'Resume' : 'Pause' }}</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.tetris {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.tetris__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.tetris__title {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.tetris__sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
  font-family: var(--font-mono);
}

.tetris__best-row {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.tetris__best-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
}

.tetris__best-val {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--color-accent);
}

/* Arena */
.tetris__arena {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  justify-content: center;
}

/* Sides */
.tetris__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 90px;
  padding-top: 4px;
}

.tetris__side--left { align-items: flex-end; }
.tetris__side--right { align-items: flex-start; }

.tetris__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tetris__stat-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
}

.tetris__stat-val {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
}

.tetris__stat-val--mono { font-family: var(--font-mono); }

/* Board */
.tetris__board-wrap {
  position: relative;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.tetris__canvas {
  display: block;
  background: var(--color-bg);
}

/* Next piece */
.tetris__next-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
}

.tetris__preview {
  display: block;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
}

/* Mobile controls */
.tetris__mobile-ctrl {
  display: none;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

.tetris__ctrl-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tetris__ctrl-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--t-fast);
}
.tetris__ctrl-btn:hover { background: var(--color-border); }
.tetris__ctrl-btn:active { background: var(--color-accent-muted); color: var(--color-accent); }

.tetris__ctrl-hard-drop {
  display: none;
  gap: 6px;
  width: auto;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
}

.tetris__pause-btn {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 5px 12px;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
  margin-top: 4px;
}
.tetris__pause-btn:hover { background: var(--color-surface-elevated); color: var(--color-text); }

/* Overlays */
.tetris__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-bg) 80%, transparent);
  backdrop-filter: blur(3px);
}

.tetris__overlay--dim {
  background: color-mix(in srgb, var(--color-bg) 70%, transparent);
}

.tetris__overlay--over {
  background: color-mix(in srgb, #ef4444 8%, var(--color-bg) 88%, transparent);
}

.tetris__overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.tetris__overlay-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.03em;
}

.tetris__overlay-score {
  font-size: 36px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--color-accent);
}

.tetris__overlay-best {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
}

.tetris__start-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity var(--t-fast);
}
.tetris__start-btn:hover { opacity: 0.88; }

/* Mobile / tablet */
@media (max-width: 767px) {
  .tetris__sub { display: none; }
  .tetris__arena { gap: 12px; }
  .tetris__side--left { min-width: 60px; }
  .tetris__mobile-ctrl { display: flex; }
  .tetris__ctrl-hard-drop { display: flex; }
  .tetris__stat-val { font-size: 18px; }
}
</style>
