<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@/core/composables/useStorage'

const router = useRouter()

// ── Card themes ────────────────────────────────────────────────────────
interface MemoryTheme {
  id: string
  name: string
  emoji: string
  pool: string[]
  unlock: number  // total wins required
}

const THEMES: MemoryTheme[] = [
  {
    id: 'animals', name: 'Animals', emoji: '🦊', unlock: 0,
    pool: ['🦊', '🐼', '🦁', '🦋', '🐸', '🦄', '🐙', '🦅', '🦚', '🦜', '🐬', '🦈', '🦩', '🦝', '🐺', '🦓'],
  },
  {
    id: 'food', name: 'Food', emoji: '🍕', unlock: 3,
    pool: ['🍕', '🍔', '🍣', '🍦', '🍓', '🍇', '🌮', '🍩', '🍜', '🥑', '🍎', '🍋', '🥐', '🍰', '🌯', '🍿'],
  },
  {
    id: 'symbols', name: 'Symbols', emoji: '⭐', unlock: 7,
    pool: ['⭐', '🌙', '☀️', '🌊', '🔥', '⚡', '🎵', '💎', '🎯', '🧩', '🎲', '🎸', '🌸', '❄️', '🌈', '💫'],
  },
  {
    id: 'nature', name: 'Nature', emoji: '🌿', unlock: 15,
    pool: ['🌿', '🌺', '🍄', '🌴', '🦋', '🌻', '🍀', '🌵', '🐚', '🌾', '🍁', '🌷', '🌰', '🐝', '🦔', '🌍'],
  },
]

const totalWins       = useStorage<number>('platform:games:memory:wins', 0)
const unlockedThemes  = useStorage<string[]>('platform:games:memory:unlocked', ['animals'])
const activeThemeId   = useStorage<string>('platform:games:memory:theme', 'animals')
const newThemeUnlock  = ref<string | null>(null)

const activeTheme = computed(() => THEMES.find(t => t.id === activeThemeId.value) ?? THEMES[0])
const themesWithStatus = computed(() =>
  THEMES.map(t => ({ ...t, unlocked: unlockedThemes.value.includes(t.id), active: activeThemeId.value === t.id }))
)

// ── Emoji pool — uses active theme ─────────────────────────────────────
const EMOJI_POOL = computed(() => activeTheme.value.pool)

type Difficulty = 'easy' | 'hard'

const GRID: Record<Difficulty, { cols: number; pairs: number }> = {
  easy: { cols: 4, pairs: 8  },  // 4×4
  hard: { cols: 6, pairs: 12 },  // 6×4
}

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

// ── State ──────────────────────────────────────────────────────────────
const difficulty = ref<Difficulty>('easy')
const cards      = ref<Card[]>([])
const selected   = ref<number[]>([])
const moves      = ref(0)
const elapsed    = ref(0)
const started    = ref(false)
const won        = ref(false)
const locking    = ref(false)

// ── Best scores ────────────────────────────────────────────────────────
const bestEasyTime  = useStorage<number>('platform:games:memory:easy:time',  0)
const bestEasyMoves = useStorage<number>('platform:games:memory:easy:moves', 0)
const bestHardTime  = useStorage<number>('platform:games:memory:hard:time',  0)
const bestHardMoves = useStorage<number>('platform:games:memory:hard:moves', 0)

const bestTime  = computed(() => difficulty.value === 'easy' ? bestEasyTime.value  : bestHardTime.value)
const bestMoves = computed(() => difficulty.value === 'easy' ? bestEasyMoves.value : bestHardMoves.value)

// ── Timer ──────────────────────────────────────────────────────────────
let timerHandle = 0

function startTimer() {
  clearInterval(timerHandle)
  timerHandle = window.setInterval(() => { elapsed.value++ }, 1000)
}

function stopTimer() {
  clearInterval(timerHandle)
}

// ── Shuffle ────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── New game ───────────────────────────────────────────────────────────
function restart(diff?: Difficulty) {
  if (diff) difficulty.value = diff
  stopTimer()

  const { pairs } = GRID[difficulty.value]
  const emojis = shuffle(EMOJI_POOL.value).slice(0, pairs)
  const deck   = shuffle([...emojis, ...emojis])

  cards.value    = deck.map((emoji, idx) => ({ id: idx, emoji, flipped: false, matched: false }))
  selected.value = []
  moves.value    = 0
  elapsed.value  = 0
  started.value  = false
  won.value      = false
  locking.value  = false
}

// ── Card click ─────────────────────────────────────────────────────────
function clickCard(card: Card) {
  if (locking.value || card.matched || card.flipped || won.value) return
  if (selected.value.length >= 2) return

  if (!started.value) { started.value = true; startTimer() }

  card.flipped = true
  selected.value.push(card.id)

  if (selected.value.length === 2) checkMatch()
}

function checkMatch() {
  const [id1, id2] = selected.value
  const c1 = cards.value.find(c => c.id === id1)!
  const c2 = cards.value.find(c => c.id === id2)!

  moves.value++

  if (c1.emoji === c2.emoji) {
    c1.matched = true
    c2.matched = true
    selected.value = []

    if (cards.value.every(c => c.matched)) {
      stopTimer()
      won.value = true
      saveBest()
    }
  } else {
    locking.value = true
    setTimeout(() => {
      c1.flipped = false
      c2.flipped = false
      selected.value = []
      locking.value = false
    }, 850)
  }
}

function saveBest() {
  if (difficulty.value === 'easy') {
    if (!bestEasyTime.value || elapsed.value < bestEasyTime.value)   bestEasyTime.value  = elapsed.value
    if (!bestEasyMoves.value || moves.value   < bestEasyMoves.value) bestEasyMoves.value = moves.value
  } else {
    if (!bestHardTime.value || elapsed.value < bestHardTime.value)   bestHardTime.value  = elapsed.value
    if (!bestHardMoves.value || moves.value   < bestHardMoves.value) bestHardMoves.value = moves.value
  }
  totalWins.value++
  // Check theme unlocks
  for (const theme of THEMES) {
    if (theme.unlock > 0 && totalWins.value >= theme.unlock && !unlockedThemes.value.includes(theme.id)) {
      unlockedThemes.value = [...unlockedThemes.value, theme.id]
      newThemeUnlock.value = theme.name
      setTimeout(() => { newThemeUnlock.value = null }, 4000)
      break
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────
function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

const matchedPairs = computed(() => cards.value.filter(c => c.matched).length / 2)
const totalPairs   = computed(() => GRID[difficulty.value].pairs)
const gridCols     = computed(() => GRID[difficulty.value].cols)

// ── Lifecycle ──────────────────────────────────────────────────────────
onMounted(restart)
onUnmounted(stopTimer)
</script>

<template>
  <div class="game">

    <!-- Header -->
    <div class="game__header">
      <button class="game__back" @click="router.push('/games')">← Games</button>
      <div class="game__scores">
        <div class="score-box">
          <span class="score-box__label">Time</span>
          <span class="score-box__val">{{ fmt(elapsed) }}</span>
        </div>
        <div class="score-box">
          <span class="score-box__label">Moves</span>
          <span class="score-box__val">{{ moves }}</span>
        </div>
        <div v-if="bestTime" class="score-box score-box--best">
          <span class="score-box__label">Best</span>
          <span class="score-box__val">{{ fmt(bestTime) }} · {{ bestMoves }}m</span>
        </div>
      </div>
    </div>

    <!-- Title row -->
    <div class="game__title-row">
      <div>
        <h1 class="game__title">Memory</h1>
        <p class="game__hint">
          {{ matchedPairs }} / {{ totalPairs }} pairs found
        </p>
      </div>
      <div class="game__controls-row">
        <div class="diff-toggle">
          <button
            class="diff-btn"
            :class="{ 'diff-btn--active': difficulty === 'easy' }"
            @click="restart('easy')"
          >4×4</button>
          <button
            class="diff-btn"
            :class="{ 'diff-btn--active': difficulty === 'hard' }"
            @click="restart('hard')"
          >6×4</button>
        </div>
        <button class="btn-new" @click="restart()">Shuffle</button>
      </div>
    </div>

    <!-- Board -->
    <div class="board" :style="{ '--cols': gridCols }">
      <div
        v-for="card in cards"
        :key="card.id"
        class="card"
        :class="{
          'card--flipped':  card.flipped || card.matched,
          'card--matched':  card.matched,
          'card--disabled': locking && !card.flipped && !card.matched,
        }"
        @click="clickCard(card)"
      >
        <div class="card__inner">
          <div class="card__face card__face--back">
            <span class="card__back-mark">//</span>
          </div>
          <div class="card__face card__face--front">
            {{ card.emoji }}
          </div>
        </div>
      </div>
    </div>

    <!-- Win overlay -->
    <Transition name="overlay">
      <div v-if="won" class="win-overlay">
        <div class="win-card">
          <div class="win-card__icon">🎉</div>
          <h2 class="win-card__title">All pairs found!</h2>
          <div class="win-card__stats">
            <div class="win-stat">
              <span class="win-stat__label">Time</span>
              <span class="win-stat__val">{{ fmt(elapsed) }}</span>
            </div>
            <div class="win-stat">
              <span class="win-stat__label">Moves</span>
              <span class="win-stat__val">{{ moves }}</span>
            </div>
          </div>
          <p v-if="bestTime === elapsed || bestMoves === moves" class="win-card__best">
            🏆 New best!
          </p>
          <div class="win-card__actions">
            <button class="btn-new" @click="restart()">Play again</button>
            <button class="btn-ghost" @click="router.push('/games')">← Games</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Theme unlock banner -->
    <Transition name="unlock-fade">
      <div v-if="newThemeUnlock" class="game__unlock-banner">
        🎨 New theme unlocked: <strong>{{ newThemeUnlock }}</strong>!
      </div>
    </Transition>

    <!-- Theme picker -->
    <div class="game__themes">
      <span class="game__themes-label">Card themes:</span>
      <button
        v-for="theme in themesWithStatus"
        :key="theme.id"
        class="game__theme-btn"
        :class="{ 'game__theme-btn--active': theme.active, 'game__theme-btn--locked': !theme.unlocked }"
        :title="theme.unlocked ? theme.name : `${theme.name} — win ${theme.unlock} games to unlock`"
        :disabled="!theme.unlocked"
        @click="activeThemeId = theme.id; restart()"
      >
        {{ theme.emoji }}
        <span class="game__theme-btn-name">{{ theme.name }}</span>
        <span v-if="!theme.unlocked" class="game__theme-btn-lock">🔒 {{ theme.unlock }}W</span>
      </button>
    </div>

    <p class="game__hint-footer">Click cards to flip · Match all pairs to win · {{ totalWins }} win{{ totalWins !== 1 ? 's' : '' }}</p>
  </div>
</template>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────── */
.game {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
  position: relative;
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
  min-width: 60px;
  padding: 5px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.score-box--best { min-width: 80px; }

.score-box__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.score-box__val {
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-text);
  line-height: 1.3;
  white-space: nowrap;
}

/* ── Title row ───────────────────────────────────────────────────────── */
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
  letter-spacing: -0.02em;
}

.game__hint {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
  font-family: var(--font-mono);
}

.game__controls-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diff-toggle {
  display: flex;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.diff-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}

.diff-btn--active {
  background: var(--color-accent);
  color: #fff;
}

.btn-new {
  padding: 8px 16px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  transition: opacity var(--t-fast);
  white-space: nowrap;
}
.btn-new:hover { opacity: 0.85; }

/* ── Board ───────────────────────────────────────────────────────────── */
.board {
  --cols: 4;
  --gap: 8px;
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: var(--gap);
  width: 100%;
}

/* ── Card ────────────────────────────────────────────────────────────── */
.card {
  aspect-ratio: 1;
  cursor: pointer;
  perspective: 700px;
}

.card--disabled { cursor: default; }

.card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 380ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card--flipped .card__inner {
  transform: rotateY(180deg);
}

.card__face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Face-down */
.card__face--back {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  transition: background var(--t-fast);
}

.card:not(.card--flipped):not(.card--disabled):hover .card__face--back {
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-elevated));
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
}

.card__back-mark {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-border);
  user-select: none;
}

/* Face-up */
.card__face--front {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transform: rotateY(180deg);
  font-size: clamp(1.2rem, 4vw, 2rem);
  line-height: 1;
  user-select: none;
}

/* Matched state */
.card--matched .card__face--front {
  background: var(--color-accent-muted);
  border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
}

/* ── Win overlay ─────────────────────────────────────────────────────── */
.win-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  z-index: 100;
  padding: 24px;
}

.win-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 340px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}

.win-card__icon { font-size: 48px; line-height: 1; }

.win-card__title {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.win-card__stats {
  display: flex;
  gap: 24px;
}

.win-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.win-stat__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.win-stat__val {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  font-family: var(--font-mono);
}

.win-card__best {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-accent);
  margin: 0;
}

.win-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn-ghost {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: background var(--t-fast);
}
.btn-ghost:hover { background: var(--color-border); }

/* ── Footer hint ─────────────────────────────────────────────────────── */
/* Theme picker */
.game__themes {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 8px 0 2px;
}
.game__themes-label { font-size: 12px; color: var(--color-text-muted); margin-right: 4px; }
.game__theme-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; font-size: 12px; font-family: inherit;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  background: transparent; color: var(--color-text-muted); cursor: pointer;
  transition: all var(--t-fast);
}
.game__theme-btn:hover:not(:disabled):not(.game__theme-btn--active) {
  background: var(--color-surface-elevated); color: var(--color-text);
}
.game__theme-btn--active {
  background: var(--color-accent-muted); border-color: var(--color-accent); color: var(--color-accent);
}
.game__theme-btn--locked { opacity: 0.45; cursor: not-allowed; }
.game__theme-btn-name { font-weight: 500; }
.game__theme-btn-lock { font-size: 10px; color: var(--color-text-muted); }

.game__unlock-banner {
  padding: 8px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500;
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
  color: var(--color-text); text-align: center;
}
.unlock-fade-enter-active { transition: opacity 0.3s ease; }
.unlock-fade-leave-active { transition: opacity 0.2s ease; }
.unlock-fade-enter-from, .unlock-fade-leave-to { opacity: 0; }

.game__hint-footer {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  font-family: var(--font-mono);
  margin: 0;
}

/* Overlay transition */
.overlay-enter-active { transition: opacity 220ms ease, transform 220ms var(--ease-spring); }
.overlay-leave-active { transition: opacity 160ms ease; }
.overlay-enter-from   { opacity: 0; transform: scale(0.94); }
.overlay-leave-to     { opacity: 0; }

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .game { padding-bottom: 16px; }
  .game__title { font-size: 28px; }
  .game__controls-row { flex-direction: column; align-items: flex-end; gap: 6px; }
  .board { --gap: 6px; }
  .win-card { padding: 28px 24px; }
  .win-stat__val { font-size: 22px; }
}
</style>
