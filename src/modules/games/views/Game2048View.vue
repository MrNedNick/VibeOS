<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@/core/composables/useStorage'

type Grid = (number | null)[][]
const router = useRouter()

// ── State ─────────────────────────────────────────────────────────────
const grid    = ref<Grid>(mkGrid())
const score   = ref(0)
const best    = useStorage<number>('platform:games:2048:best', 0)
const over    = ref(false)
const won     = ref(false)
const cont    = ref(false)   // keep playing after win
const spawnAt = ref('')      // "r-c" of most recent spawn — drives CSS animation

function mkGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(null))
}

// ── New game ──────────────────────────────────────────────────────────
function restart() {
  grid.value  = mkGrid()
  score.value = 0
  over.value  = false
  won.value   = false
  cont.value  = false
  spawnAt.value = ''
  spawnTile()
  spawnTile()
}

// ── Spawn a random tile ───────────────────────────────────────────────
function emptyPos(g: Grid): [number, number][] {
  const out: [number, number][] = []
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (g[r][c] === null) out.push([r, c])
  return out
}

function spawnTile() {
  const g = grid.value.map(row => [...row])
  const pos = emptyPos(g)
  if (!pos.length) return
  const [r, c] = pos[Math.floor(Math.random() * pos.length)]
  g[r][c] = Math.random() < 0.9 ? 2 : 4
  spawnAt.value = `${r}-${c}`
  grid.value = g
}

// ── Slide / merge one row leftward ────────────────────────────────────
function slideRow(row: (number | null)[]): { result: (number | null)[]; gained: number } {
  const vals = row.filter((v): v is number => v !== null)
  const result: (number | null)[] = []
  let gained = 0
  let i = 0
  while (i < vals.length) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      const m = vals[i] * 2
      result.push(m)
      gained += m
      i += 2
    } else {
      result.push(vals[i++])
    }
  }
  while (result.length < 4) result.push(null)
  return { result, gained }
}

function transpose(g: Grid): Grid {
  return Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) => g[c][r])
  )
}

function flipH(g: Grid): Grid {
  return g.map(row => [...row].reverse())
}

// ── Move in a direction ───────────────────────────────────────────────
function move(dir: 'left' | 'right' | 'up' | 'down') {
  if (over.value || (won.value && !cont.value)) return

  // Transform to "slide leftward" coordinate space
  let work = grid.value.map(row => [...row])
  if      (dir === 'right') work = flipH(work)
  else if (dir === 'up')    work = transpose(work)
  else if (dir === 'down')  work = flipH(transpose(work))

  let gained = 0
  let moved  = false

  const slid = work.map(row => {
    const before = row.join(',')
    const { result, gained: g } = slideRow(row)
    if (result.join(',') !== before) moved = true
    gained += g
    return result
  })

  if (!moved) return

  // Inverse transform back to original space
  let final: Grid
  if      (dir === 'left')  final = slid
  else if (dir === 'right') final = flipH(slid)
  else if (dir === 'up')    final = transpose(slid)
  else                      final = transpose(flipH(slid))  // down

  score.value += gained
  if (score.value > (best.value ?? 0)) best.value = score.value
  grid.value = final
  spawnTile()

  // Win: any tile reaches 2048
  if (!cont.value && grid.value.some(row => row.some(v => v === 2048))) {
    won.value = true
    return
  }
  // Game over: board full, no merges possible
  if (!canMove()) over.value = true
}

function canMove(): boolean {
  const g = grid.value
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (g[r][c] === null) return true
      if (r < 3 && g[r + 1][c] === g[r][c]) return true
      if (c < 3 && g[r][c + 1] === g[r][c]) return true
    }
  return false
}

// ── Keyboard ──────────────────────────────────────────────────────────
const KEY_MAP: Record<string, 'left' | 'right' | 'up' | 'down'> = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
  A: 'left', D: 'right', W: 'up', S: 'down',
}

function onKey(e: KeyboardEvent) {
  const dir = KEY_MAP[e.key]
  if (!dir) return
  e.preventDefault()
  move(dir)
}

// ── Touch / swipe ─────────────────────────────────────────────────────
let touch0: { x: number; y: number } | null = null

function onTouchStart(e: TouchEvent) {
  touch0 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function onTouchEnd(e: TouchEvent) {
  if (!touch0) return
  const dx = e.changedTouches[0].clientX - touch0.x
  const dy = e.changedTouches[0].clientY - touch0.y
  touch0 = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
  move(Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down' : 'up')
  )
}

// ── Tile helpers ──────────────────────────────────────────────────────
function tileClass(v: number): string {
  const base = `tile tile--${v}`
  const size = v >= 1000 ? ' tile--4d' : v >= 100 ? ' tile--3d' : ''
  return base + size
}

// ── Lifecycle ─────────────────────────────────────────────────────────
onMounted(() => {
  restart()
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="game">

    <!-- Header -->
    <div class="game__header">
      <button class="game__back" @click="router.push('/games')">← Games</button>
      <div class="game__scores">
        <div class="score-box">
          <span class="score-box__label">Score</span>
          <span class="score-box__val">{{ score }}</span>
        </div>
        <div class="score-box">
          <span class="score-box__label">Best</span>
          <span class="score-box__val">{{ best }}</span>
        </div>
      </div>
    </div>

    <!-- Title row -->
    <div class="game__title-row">
      <div>
        <h1 class="game__title">2048</h1>
        <p class="game__hint">Join the numbers to get <strong>2048</strong></p>
      </div>
      <button class="btn-new" @click="restart">New Game</button>
    </div>

    <!-- Board -->
    <div
      class="board"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <!-- Cell backgrounds -->
      <div
        v-for="i in 16"
        :key="`cell-${i}`"
        class="cell"
      />

      <!-- Tiles (absolutely positioned over grid) -->
      <template v-for="(row, r) in grid" :key="`row-${r}`">
        <template v-for="(val, c) in row" :key="`tile-${r}-${c}`">
          <div
            v-if="val !== null"
            :class="[tileClass(val), spawnAt === `${r}-${c}` ? 'tile--new' : '']"
            :style="{ '--tr': r, '--tc': c }"
          >
            {{ val }}
          </div>
        </template>
      </template>

      <!-- Win overlay -->
      <Transition name="overlay">
        <div v-if="won && !cont" class="overlay overlay--won">
          <p class="overlay__title">You win!</p>
          <p class="overlay__sub">You reached <strong>2048</strong></p>
          <div class="overlay__actions">
            <button class="btn-overlay" @click="cont = true">Keep going</button>
            <button class="btn-overlay btn-overlay--ghost" @click="restart">New game</button>
          </div>
        </div>
      </Transition>

      <!-- Game over overlay -->
      <Transition name="overlay">
        <div v-if="over" class="overlay overlay--over">
          <p class="overlay__title">Game over</p>
          <p class="overlay__sub">Score: <strong>{{ score }}</strong></p>
          <button class="btn-overlay" @click="restart">Try again</button>
        </div>
      </Transition>
    </div>

    <p class="game__controls">Arrow keys or WASD · Swipe on mobile</p>
  </div>
</template>

<style scoped>
/* ── Layout ───────────────────────────────────────────────────────── */
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
  gap: 8px;
}

.score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  padding: 6px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.score-box__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.score-box__val {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.game__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.game__title {
  font-size: 48px;
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

.game__controls {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  font-family: var(--font-mono);
}

/* ── New game button ─────────────────────────────────────────────── */
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
.btn-new:active { opacity: 0.7; }

/* ── Board ───────────────────────────────────────────────────────── */
.board {
  --gap:     8px;
  --pad:     8px;
  --size:    min(440px, calc(100vw - 48px));
  --cell:    calc((var(--size) - 2 * var(--pad) - 3 * var(--gap)) / 4);

  width:        var(--size);
  height:       var(--size);
  background:   #2a2724;
  border-radius: var(--radius);
  padding:      var(--pad);
  display:      grid;
  grid-template-columns: repeat(4, var(--cell));
  grid-template-rows:    repeat(4, var(--cell));
  gap:          var(--gap);
  position:     relative;
  touch-action: none;
  user-select:  none;
}

/* ── Cells (static background slots) ────────────────────────────── */
.cell {
  background:    rgba(255, 255, 255, 0.055);
  border-radius: 6px;
}

/* ── Tiles ───────────────────────────────────────────────────────── */
.tile {
  position: absolute;
  width:  var(--cell);
  height: var(--cell);
  top:  calc(var(--pad) + var(--tr) * (var(--cell) + var(--gap)));
  left: calc(var(--pad) + var(--tc) * (var(--cell) + var(--gap)));

  display:         flex;
  align-items:     center;
  justify-content: center;
  border-radius:   6px;
  font-size:       2rem;
  font-weight:     800;
  line-height:     1;
  transition: top 80ms ease, left 80ms ease, background-color 80ms ease;
}

.tile--3d { font-size: 1.6rem; }
.tile--4d { font-size: 1.3rem; }

/* Spawn pop animation */
.tile--new {
  animation: pop 140ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop {
  0%   { transform: scale(0);    opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1);    opacity: 1; }
}

/* ── Tile colors ─────────────────────────────────────────────────── */
.tile--2    { background: #4e4843; color: #b5aba2; }
.tile--4    { background: #5c5248; color: #cfc5bc; }
.tile--8    { background: #d9762c; color: #fff; }
.tile--16   { background: #d95e24; color: #fff; }
.tile--32   { background: #d9451c; color: #fff; }
.tile--64   { background: #d42c10; color: #fff; }
.tile--128  { background: #d4b220; color: #fff; }
.tile--256  { background: #d4a810; color: #fff; }
.tile--512  { background: #d09a00; color: #fff; }
.tile--1024 { background: #c88e00; color: #fff; }
.tile--2048 {
  background: #2ecc71;
  color: #fff;
  box-shadow: 0 0 24px rgba(46, 204, 113, 0.5);
}
/* Beyond 2048 */
.tile { background: #3498db; color: #fff; }

/* ── Overlays ────────────────────────────────────────────────────── */
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
  z-index: 10;
}

.overlay--won  { background: rgba(46, 204, 113, 0.18); }
.overlay--over { background: rgba(20, 18, 16, 0.75); }

.overlay__title {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.overlay__sub {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

.overlay__actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.btn-overlay {
  padding: 9px 20px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  transition: opacity var(--t-fast);
}
.btn-overlay:hover { opacity: 0.85; }

.btn-overlay--ghost {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

/* Overlay transition */
.overlay-enter-active { transition: opacity 200ms ease, transform 200ms ease; }
.overlay-leave-active { transition: opacity 150ms ease; }
.overlay-enter-from   { opacity: 0; transform: scale(0.95); }
.overlay-leave-to     { opacity: 0; }

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .game { padding-bottom: 16px; }
  .game__title { font-size: 36px; }
  .tile { font-size: 1.6rem; }
  .tile--3d { font-size: 1.3rem; }
  .tile--4d { font-size: 1.1rem; }
}
</style>
