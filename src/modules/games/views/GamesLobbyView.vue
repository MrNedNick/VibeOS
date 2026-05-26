<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const GAMES = [
  {
    id: '2048',
    label: '2048',
    description: 'Slide tiles and merge matching numbers to reach 2048.',
    icon: '⊞',
    path: '/games/2048',
    status: 'available' as const,
  },
  {
    id: 'memory',
    label: 'Memory',
    description: 'Flip cards and find all matching pairs.',
    icon: '◈',
    path: '/games/memory',
    status: 'soon' as const,
  },
  {
    id: 'snake',
    label: 'Snake',
    description: 'Eat food, grow longer, avoid the walls.',
    icon: '≈',
    path: '/games/snake',
    status: 'soon' as const,
  },
]
</script>

<template>
  <div class="lobby">
    <div class="lobby__header">
      <h1 class="lobby__title">Games</h1>
      <p class="lobby__sub">Short diversions, built with pure CSS and Canvas</p>
    </div>

    <div class="lobby__grid">
      <div
        v-for="game in GAMES"
        :key="game.id"
        class="game-card"
        :class="{
          'game-card--available': game.status === 'available',
          'game-card--soon': game.status === 'soon',
        }"
        @click="game.status === 'available' && router.push(game.path)"
      >
        <div class="game-card__icon">{{ game.icon }}</div>
        <div class="game-card__body">
          <div class="game-card__name">{{ game.label }}</div>
          <div class="game-card__desc">{{ game.description }}</div>
        </div>
        <span v-if="game.status === 'soon'" class="game-card__badge">soon</span>
        <span v-else class="game-card__arrow">→</span>
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
  max-width: 520px;
}

.game-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: border-color var(--t-fast), background var(--t-fast);
}

.game-card--available {
  cursor: pointer;
}

.game-card--available:hover {
  border-color: var(--color-accent);
  background: var(--color-surface-elevated);
}

.game-card--available:hover .game-card__arrow {
  color: var(--color-accent);
}

.game-card--soon {
  opacity: 0.45;
}

.game-card__icon {
  font-size: 26px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

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
}

.game-card__badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  padding: 3px 7px;
  border-radius: 99px;
  flex-shrink: 0;
}

.game-card__arrow {
  font-size: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: color var(--t-fast);
}

@media (max-width: 767px) {
  .lobby__grid { max-width: 100%; }
}
</style>
