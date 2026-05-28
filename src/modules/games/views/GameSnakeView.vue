<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@/core/composables/useStorage'

const router = useRouter()

// ── Grid constants ─────────────────────────────────────────────────────
const COLS = 20
const ROWS = 20
const CANVAS_SIZE = 400
const CS = CANVAS_SIZE / COLS

// ── Types ──────────────────────────────────────────────────────────────
type Dir = 'up' | 'down' | 'left' | 'right'
type State = 'idle' | 'running' | 'over'
interface Pos { x: number; y: number }

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }
const DX: Record<Dir, number> = { left: -1, right: 1, up: 0,  down: 0  }
const DY: Record<Dir, number> = { left: 0,  right: 0, up: -1, down: 1  }

// ── Skins ──────────────────────────────────────────────────────────────
interface Skin {
  id:       string
  name:     string
  emoji:    string
  head:     string   // hex / rgb
  bodyRgb:  string   // "r,g,b" for rgba() body
  glow:     string   // shadow colour
  food:     string   // food dot colour
  foodGlow: string
  unlock:   number   // personal-best score required to unlock
}

const SKINS: Skin[] = [
  { id: 'blue',     name: 'Default',   emoji: '🔵', head: '#4f8ef7', bodyRgb: '79,142,247',  glow: '#4f8ef7', food: '#34d058', foodGlow: '#34d058', unlock: 0  },
  { id: 'emerald',  name: 'Emerald',   emoji: '🟢', head: '#34d399', bodyRgb: '52,211,153',  glow: '#34d399', food: '#f59e0b', foodGlow: '#f59e0b', unlock: 5  },
  { id: 'crimson',  name: 'Crimson',   emoji: '🔴', head: '#f87171', bodyRgb: '248,113,113', glow: '#f87171', food: '#a78bfa', foodGlow: '#a78bfa', unlock: 15 },
  { id: 'amethyst', name: 'Amethyst',  emoji: '🟣', head: '#a78bfa', bodyRgb: '167,139,250', glow: '#a78bfa', food: '#fbbf24', foodGlow: '#fbbf24', unlock: 25 },
  { id: 'gold',     name: 'Golden',    emoji: '🌟', head: '#fbbf24', bodyRgb: '251,191,36',  glow: '#fbbf24', food: '#f472b6', foodGlow: '#f472b6', unlock: 40 },
]

// ── Persistent state ───────────────────────────────────────────────────
const best           = useStorage<number>('platform:games:snake:best', 0)
const unlockedSkins  = useStorage<string[]>('platform:games:snake:unlocked', ['blue'])
const activeSkinId   = useStorage<string>('platform:games:snake:skin', 'blue')

// ── Reactive state ─────────────────────────────────────────────────────
const canvas     = ref<HTMLCanvasElement>()
const score      = ref(0)
const gameState  = ref<State>('idle')
const paused     = ref(false)
const newBest    = ref(false)         // flash on new PB
const newUnlocks = ref<Skin[]>([])    // skins unlocked this round

// ── Computed ───────────────────────────────────────────────────────────
const activeSkin = computed(() =>
  SKINS.find(s => s.id === activeSkinId.value) ?? SKINS[0]
)

const skinsWithStatus = computed(() =>
  SKINS.map(s => ({
    ...s,
    unlocked: unlockedSkins.value.includes(s.id),
    active:   activeSkinId.value === s.id,
  }))
)

// ── Mutable game data ──────────────────────────────────────────────────
let snake:   Pos[]  = []
let food:    Pos    = { x: 15, y: 10 }
let dir:     Dir    = 'right'
let nextDir: Dir    = 'right'
let tickMs   = 150
let lastTick = 0
let rafId    = 0

// ── Setup ──────────────────────────────────────────────────────────────
function startGame() {
  snake   = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
  dir     = 'right'
  nextDir = 'right'
  score.value    = 0
  tickMs         = 150
  lastTick       = 0
  paused.value   = false
  newBest.value  = false
  newUnlocks.value = []
  gameState.value  = 'running'
  spawnFood()
}

function spawnFood() {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`))
  const empty: Pos[] = []
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y })
  if (empty.length) food = empty[Math.floor(Math.random() * empty.length)]
}

// ── Tick ───────────────────────────────────────────────────────────────
function tick() {
  dir = nextDir
  const head = snake[0]
  const next: Pos = { x: head.x + DX[dir], y: head.y + DY[dir] }
  next.x = ((next.x % COLS) + COLS) % COLS
  next.y = ((next.y % ROWS) + ROWS) % ROWS
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].x === next.x && snake[i].y === next.y) { endGame(); return }
  }
  snake.unshift(next)
  if (next.x === food.x && next.y === food.y) {
    score.value++
    // Personal best
    if (score.value > (best.value ?? 0)) {
      best.value    = score.value
      newBest.value = true
      checkUnlocks()
    }
    tickMs = Math.max(72, 150 - score.value * 4)
    spawnFood()
  } else {
    snake.pop()
  }
}

function checkUnlocks() {
  const pb = best.value ?? 0
  const freshUnlocks: Skin[] = []
  for (const skin of SKINS) {
    if (pb >= skin.unlock && !unlockedSkins.value.includes(skin.id)) {
      unlockedSkins.value = [...unlockedSkins.value, skin.id]
      freshUnlocks.push(skin)
    }
  }
  if (freshUnlocks.length) newUnlocks.value = freshUnlocks
}

function endGame() {
  gameState.value = 'over'
}

// ── Skin selector ──────────────────────────────────────────────────────
function selectSkin(id: string) {
  if (unlockedSkins.value.includes(id)) activeSkinId.value = id
}

// ── Game loop ──────────────────────────────────────────────────────────
function loop(now: number) {
  rafId = requestAnimationFrame(loop)
  if (gameState.value === 'idle') { draw(); return }
  if (gameState.value === 'over' || paused.value) { draw(); return }
  if (!lastTick) lastTick = now
  const delta = now - lastTick
  if (delta >= tickMs) { lastTick = now; tick() }
  draw()
}

// ── Draw ───────────────────────────────────────────────────────────────
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y);  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h);  ctx.arcTo(x,     y + h, x,     y + h - r, r)
  ctx.lineTo(x, y + r);      ctx.arcTo(x,     y,     x + r, y,         r)
  ctx.closePath()
}

function draw() {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')!
  const skin = activeSkin.value

  // Background
  ctx.fillStyle = '#0e0e10'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 0.5
  for (let i = 1; i < COLS; i++) {
    ctx.beginPath(); ctx.moveTo(i * CS, 0); ctx.lineTo(i * CS, CANVAS_SIZE); ctx.stroke()
  }
  for (let i = 1; i < ROWS; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * CS); ctx.lineTo(CANVAS_SIZE, i * CS); ctx.stroke()
  }

  // Food
  ctx.save()
  ctx.fillStyle  = skin.food
  ctx.shadowColor = skin.foodGlow
  ctx.shadowBlur  = 10
  ctx.beginPath()
  ctx.arc(food.x * CS + CS / 2, food.y * CS + CS / 2, CS * 0.32, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Snake body
  for (let i = snake.length - 1; i >= 1; i--) {
    const t     = 1 - i / snake.length
    const alpha = 0.28 + t * 0.52
    ctx.fillStyle = `rgba(${skin.bodyRgb},${alpha.toFixed(2)})`
    const pad = 2.5
    rrect(ctx, snake[i].x * CS + pad, snake[i].y * CS + pad, CS - pad * 2, CS - pad * 2, 3)
    ctx.fill()
  }

  // Snake head
  if (snake.length > 0) {
    const h = snake[0]
    ctx.save()
    ctx.fillStyle   = skin.head
    ctx.shadowColor = skin.glow
    ctx.shadowBlur  = 8
    rrect(ctx, h.x * CS + 1.5, h.y * CS + 1.5, CS - 3, CS - 3, 4)
    ctx.fill()
    ctx.restore()

    // Eyes
    ctx.fillStyle = '#fff'
    const ex = h.x * CS + CS / 2
    const ey = h.y * CS + CS / 2
    const eR = 1.8, eGap = 3.5
    if (dir === 'right') {
      ctx.beginPath(); ctx.arc(ex + 3, ey - eGap, eR, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(ex + 3, ey + eGap, eR, 0, Math.PI * 2); ctx.fill()
    } else if (dir === 'left') {
      ctx.beginPath(); ctx.arc(ex - 3, ey - eGap, eR, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(ex - 3, ey + eGap, eR, 0, Math.PI * 2); ctx.fill()
    } else if (dir === 'up') {
      ctx.beginPath(); ctx.arc(ex - eGap, ey - 3, eR, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(ex + eGap, ey - 3, eR, 0, Math.PI * 2); ctx.fill()
    } else {
      ctx.beginPath(); ctx.arc(ex - eGap, ey + 3, eR, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(ex + eGap, ey + 3, eR, 0, Math.PI * 2); ctx.fill()
    }
  }

  // Paused dim
  if (paused.value) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  }
}

// ── Direction ──────────────────────────────────────────────────────────
function setDir(d: Dir) {
  if (d !== OPPOSITE[dir]) nextDir = d
}

// ── Keyboard ───────────────────────────────────────────────────────────
const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  W: 'up', S: 'down', A: 'left', D: 'right',
}

function onKey(e: KeyboardEvent) {
  const d = KEY_DIR[e.key]
  if (d) {
    e.preventDefault()
    if (gameState.value === 'running') setDir(d)
    else startGame()
    return
  }
  if (e.key === ' ') {
    e.preventDefault()
    if (gameState.value === 'running') paused.value = !paused.value
    else startGame()
  }
}

// ── Touch / swipe ──────────────────────────────────────────────────────
let touch0: { x: number; y: number } | null = null

function onTouchStart(e: TouchEvent) {
  touch0 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function onTouchEnd(e: TouchEvent) {
  if (!touch0) return
  const dx = e.changedTouches[0].clientX - touch0.x
  const dy = e.changedTouches[0].clientY - touch0.y
  touch0 = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    if (gameState.value !== 'running') startGame()
    return
  }
  const d = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down' : 'up')
  if (gameState.value === 'running') setDir(d as Dir)
  else startGame()
}

// ── Lifecycle ──────────────────────────────────────────────────────────
onMounted(() => {
  rafId = requestAnimationFrame(loop)
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  cancelAnimationFrame(rafId)
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
          <span class="score-box__label">Score</span>
          <span class="score-box__val">{{ score }}</span>
        </div>
        <div class="score-box">
          <span class="score-box__label">Best</span>
          <span class="score-box__val">{{ best }}</span>
        </div>
        <div v-if="gameState === 'running'" class="score-box">
          <span class="score-box__label">Length</span>
          <span class="score-box__val">{{ snake.length }}</span>
        </div>
      </div>
    </div>

    <!-- Title row -->
    <div class="game__title-row">
      <div>
        <h1 class="game__title">Snake</h1>
        <p class="game__hint">
          <span v-if="gameState === 'idle'">Press any arrow key to start</span>
          <span v-else-if="gameState === 'running' && paused">Paused</span>
          <span v-else-if="gameState === 'running'">Eat the green dot — walls wrap around</span>
          <span v-else>Game over</span>
        </p>
      </div>
      <button v-if="gameState !== 'idle'" class="btn-new" @click="startGame">New Game</button>
    </div>

    <!-- Board -->
    <div
      class="board-wrap"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <canvas ref="canvas" class="board" :width="400" :height="400" />

      <!-- Idle overlay -->
      <Transition name="overlay">
        <div v-if="gameState === 'idle'" class="overlay">
          <p class="overlay__title">Snake</p>
          <p class="overlay__sub">Eat food, grow longer, wrap through walls.</p>
          <button class="btn-overlay" @click="startGame">Play</button>
        </div>
      </Transition>

      <!-- Game over overlay -->
      <Transition name="overlay">
        <div v-if="gameState === 'over'" class="overlay overlay--over">
          <p class="overlay__title">Game Over</p>
          <p class="overlay__score">
            Score: <strong>{{ score }}</strong>
            <span v-if="newBest && score > 0" class="overlay__pb"> 🏆 New best!</span>
          </p>

          <!-- Unlock notification -->
          <Transition name="unlock-pop">
            <div v-if="newUnlocks.length" class="overlay__unlocks">
              <span class="overlay__unlocks-title">🎨 Skin{{ newUnlocks.length > 1 ? 's' : '' }} unlocked!</span>
              <div class="overlay__unlocks-skins">
                <span v-for="s in newUnlocks" :key="s.id" class="overlay__unlock-badge">
                  {{ s.emoji }} {{ s.name }}
                </span>
              </div>
            </div>
          </Transition>

          <div class="overlay__actions">
            <button class="btn-overlay" @click="startGame">Try again</button>
            <button class="btn-overlay btn-overlay--ghost" @click="router.push('/games')">← Games</button>
          </div>
        </div>
      </Transition>

      <!-- Paused overlay -->
      <Transition name="overlay">
        <div v-if="paused && gameState === 'running'" class="overlay overlay--paused">
          <p class="overlay__title">Paused</p>
          <button class="btn-overlay" @click="paused = false">Resume</button>
        </div>
      </Transition>
    </div>

    <p class="game__controls">Arrow keys or WASD · Space to pause · Swipe on mobile</p>

    <!-- Skin picker -->
    <div class="skin-picker">
      <h3 class="skin-picker__title">Skins</h3>
      <div class="skin-picker__grid">
        <button
          v-for="skin in skinsWithStatus"
          :key="skin.id"
          class="skin-card"
          :class="{
            'skin-card--active':   skin.active,
            'skin-card--locked':   !skin.unlocked,
          }"
          :title="skin.unlocked ? skin.name : `Unlock at ${skin.unlock} PB`"
          @click="selectSkin(skin.id)"
        >
          <span class="skin-card__preview" :style="{ background: skin.head }" />
          <span class="skin-card__emoji">{{ skin.unlocked ? skin.emoji : '🔒' }}</span>
          <span class="skin-card__name">{{ skin.name }}</span>
          <span v-if="!skin.unlocked" class="skin-card__req">{{ skin.unlock }}+</span>
          <span v-else-if="skin.active" class="skin-card__check">✓</span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Layout ───────────────────────────────────────────────────────────── */
.game {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
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
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
  color: var(--color-text);
  line-height: 1.2;
}

/* ── Title row ────────────────────────────────────────────────────────── */
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
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.board {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  touch-action: none;
  user-select: none;
}

/* ── Overlays ─────────────────────────────────────────────────────────── */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(8, 8, 10, 0.82);
  backdrop-filter: blur(4px);
}
.overlay--over   { background: rgba(8, 8, 10, 0.88); }
.overlay--paused { background: rgba(8, 8, 10, 0.70); }

.overlay__title {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}
.overlay__score {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}
.overlay__pb {
  color: #fbbf24;
  font-weight: 600;
}

/* Unlock notification */
.overlay__unlocks {
  background: rgba(79,142,247,0.12);
  border: 1px solid rgba(79,142,247,0.3);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  text-align: center;
  max-width: 260px;
}
.overlay__unlocks-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent);
  display: block;
  margin-bottom: 4px;
}
.overlay__unlocks-skins {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
.overlay__unlock-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border-radius: 99px;
  padding: 2px 8px;
}

.overlay__actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn-overlay {
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
.btn-overlay--ghost {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

/* Overlay transitions */
.overlay-enter-active { transition: opacity 200ms ease, transform 200ms ease; }
.overlay-leave-active { transition: opacity 150ms ease; }
.overlay-enter-from   { opacity: 0; transform: scale(0.97); }
.overlay-leave-to     { opacity: 0; }

.unlock-pop-enter-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.unlock-pop-enter-from   { opacity: 0; transform: scale(0.7); }

/* ── Controls hint ────────────────────────────────────────────────────── */
.game__controls {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  font-family: var(--font-mono);
  margin: 0;
}

/* ── Skin picker ──────────────────────────────────────────────────────── */
.skin-picker {
  margin-top: 4px;
}
.skin-picker__title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0 0 10px;
}
.skin-picker__grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.skin-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, opacity 0.15s;
  min-width: 72px;
  position: relative;
}
.skin-card:hover:not(.skin-card--locked) {
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}
.skin-card--active {
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}
.skin-card--locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.skin-card__preview {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  display: block;
  box-shadow: 0 0 8px currentColor;
}
.skin-card--locked .skin-card__preview {
  filter: grayscale(1);
  box-shadow: none;
}

.skin-card__emoji {
  font-size: 16px;
  line-height: 1;
}
.skin-card__name {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.skin-card__req {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}
.skin-card__check {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 10px;
  font-weight: 800;
  color: var(--color-accent);
}

/* ── Responsive ───────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .game__title     { font-size: 36px; }
  .overlay__title  { font-size: 28px; }
  .skin-picker__grid { gap: 6px; }
  .skin-card       { min-width: 60px; padding: 8px 10px; }
}
</style>
