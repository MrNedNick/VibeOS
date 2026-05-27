<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '@/core/i18n'
import { useStorage } from '@/core/composables/useStorage'

const router = useRouter()
const i18n = useLocale()

const best2048 = useStorage<number>('platform:games:2048:best', 0)
const bestMemoryEasy = useStorage<number>('platform:games:memory:easy:time', 0)
const bestSnake = useStorage<number>('platform:games:snake:best', 0)

const games = computed(() => [
  {
    id: '2048',
    label: i18n.t('games.game2048Name'),
    desc: i18n.t('games.game2048Desc'),
    path: '/games/2048',
    stat: best2048.value > 0 ? `Best: ${best2048.value}` : null,
    color: '#f59e0b',
  },
  {
    id: 'memory',
    label: i18n.t('games.memoryName'),
    desc: i18n.t('games.memoryDesc'),
    path: '/games/memory',
    stat: bestMemoryEasy.value > 0 ? `Best: ${(bestMemoryEasy.value / 1000).toFixed(1)}s` : null,
    color: '#8b5cf6',
  },
  {
    id: 'snake',
    label: i18n.t('games.snakeName'),
    desc: i18n.t('games.snakeDesc'),
    path: '/games/snake',
    stat: bestSnake.value > 0 ? `Best: ${bestSnake.value}` : null,
    color: '#10b981',
  },
])
</script>

<template>
  <div class="lobby">
    <div class="lobby__header">
      <h1 class="lobby__title">{{ i18n.t('games.title') }}</h1>
      <p class="lobby__sub">{{ i18n.t('games.subtitle') }}</p>
    </div>

    <div class="lobby__grid">
      <div
        v-for="game in games"
        :key="game.id"
        class="game-card"
        @click="router.push(game.path)"
      >
        <!-- Visual preview -->
        <div class="game-card__preview" :style="`--game-color: ${game.color}`">
          <!-- 2048 preview: colored tiles -->
          <svg v-if="game.id === '2048'" viewBox="0 0 52 52" class="game-card__svg">
            <rect x="1" y="1" width="23" height="23" rx="4" fill="rgba(245,158,11,0.18)" stroke="rgba(245,158,11,0.5)" stroke-width="1.5"/>
            <text x="12.5" y="16.5" text-anchor="middle" font-size="10" font-weight="700" fill="#f59e0b">2</text>
            <rect x="28" y="1" width="23" height="23" rx="4" fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.6)" stroke-width="1.5"/>
            <text x="39.5" y="16.5" text-anchor="middle" font-size="10" font-weight="700" fill="#f59e0b">4</text>
            <rect x="1" y="28" width="23" height="23" rx="4" fill="rgba(245,158,11,0.48)" stroke="rgba(245,158,11,0.75)" stroke-width="1.5"/>
            <text x="12.5" y="43.5" text-anchor="middle" font-size="10" font-weight="700" fill="#f59e0b">8</text>
            <rect x="28" y="28" width="23" height="23" rx="4" fill="rgba(245,158,11,0.7)" stroke="#f59e0b" stroke-width="1.5"/>
            <text x="39.5" y="43.5" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">16</text>
          </svg>

          <!-- Memory preview: cards grid -->
          <svg v-else-if="game.id === 'memory'" viewBox="0 0 52 52" class="game-card__svg">
            <!-- Flipped card (showing emoji) -->
            <rect x="1" y="1" width="23" height="23" rx="4" fill="rgba(139,92,246,0.22)" stroke="rgba(139,92,246,0.6)" stroke-width="1.5"/>
            <text x="12.5" y="17" text-anchor="middle" font-size="15">⭐</text>
            <!-- Face-down cards -->
            <rect x="28" y="1" width="23" height="23" rx="4" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.35)" stroke-width="1.5"/>
            <text x="39.5" y="16.5" text-anchor="middle" font-size="10" font-weight="700" fill="rgba(139,92,246,0.5)">?</text>
            <rect x="1" y="28" width="23" height="23" rx="4" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.35)" stroke-width="1.5"/>
            <text x="12.5" y="43.5" text-anchor="middle" font-size="10" font-weight="700" fill="rgba(139,92,246,0.5)">?</text>
            <!-- Matching card revealed -->
            <rect x="28" y="28" width="23" height="23" rx="4" fill="rgba(139,92,246,0.22)" stroke="rgba(139,92,246,0.6)" stroke-width="1.5"/>
            <text x="39.5" y="44" text-anchor="middle" font-size="15">⭐</text>
          </svg>

          <!-- Snake preview: pixel snake shape -->
          <svg v-else-if="game.id === 'snake'" viewBox="0 0 52 52" class="game-card__svg">
            <!-- Snake body segments -->
            <rect x="4" y="22" width="9" height="9" rx="2" fill="rgba(16,185,129,0.35)" stroke="rgba(16,185,129,0.6)" stroke-width="1"/>
            <rect x="15" y="22" width="9" height="9" rx="2" fill="rgba(16,185,129,0.5)" stroke="rgba(16,185,129,0.7)" stroke-width="1"/>
            <rect x="26" y="22" width="9" height="9" rx="2" fill="rgba(16,185,129,0.65)" stroke="rgba(16,185,129,0.8)" stroke-width="1"/>
            <rect x="26" y="11" width="9" height="9" rx="2" fill="rgba(16,185,129,0.8)" stroke="rgba(16,185,129,0.9)" stroke-width="1"/>
            <!-- Head -->
            <rect x="37" y="11" width="9" height="9" rx="2" fill="#10b981" stroke="#10b981" stroke-width="1"/>
            <circle cx="39.5" cy="13.5" r="1.5" fill="#fff"/>
            <circle cx="43.5" cy="13.5" r="1.5" fill="#fff"/>
            <!-- Food -->
            <circle cx="40" cy="36" r="4.5" fill="#f59e0b" opacity="0.9"/>
          </svg>
        </div>

        <!-- Card body -->
        <div class="game-card__body">
          <div class="game-card__name">{{ game.label }}</div>
          <div class="game-card__desc">{{ game.desc }}</div>
          <div v-if="game.stat" class="game-card__stat">{{ game.stat }}</div>
        </div>

        <span class="game-card__arrow">→</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.lobby__title {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.lobby__sub {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.lobby__grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 560px;
}

.game-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--t-fast), background var(--t-fast), transform var(--t-fast);
  position: relative;
  overflow: hidden;
}

.game-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--game-color, var(--color-accent));
  border-radius: 4px 0 0 4px;
  opacity: 0;
  transition: opacity var(--t-fast);
}

.game-card:hover {
  border-color: var(--color-surface-elevated);
  background: var(--color-surface-elevated);
}
.game-card:hover::before { opacity: 1; }
.game-card:hover .game-card__arrow { color: var(--game-color, var(--color-accent)); }

/* Preview box */
.game-card__preview {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 6px;
}

.game-card__svg {
  width: 100%;
  height: 100%;
}

/* Body */
.game-card__body {
  flex: 1;
  min-width: 0;
}

.game-card__name {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
}

.game-card__desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 3px;
  line-height: 1.4;
}

.game-card__stat {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  margin-top: 5px;
}

.game-card__arrow {
  font-size: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: color var(--t-fast);
}

@media (max-width: 767px) {
  .lobby__grid { max-width: 100%; }
  .game-card__preview { width: 52px; height: 52px; }
}
</style>
