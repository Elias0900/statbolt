<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loadGames } from '../db';
import type { Game } from '../types';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const games = ref<Game[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const loadMatchHistory = async () => {
  try {
    loading.value = true;
    error.value = null;
    games.value = await loadGames();
  } catch (e) {
    error.value = "Erreur lors du chargement de l'historique";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (props.show) {
    loadMatchHistory();
  }
});
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Historique des matchs</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="modal-content">
        <div v-if="loading" class="loading">
          Chargement...
        </div>

        <div v-else-if="error" class="error">
          {{ error }}
        </div>

        <div v-else-if="games.length === 0" class="empty">
          Aucun match enregistré
        </div>

        <div v-else class="games-list">
          <div v-for="game in games" :key="game.date.toString()" class="game-item">
            <div class="game-header">
              <h3>{{ game.name }}</h3>
              <span class="game-date">{{ formatDate(game.date) }}</span>
            </div>

            <div class="game-stats">
              <div class="players-count">
                {{ game.players.length }} joueurs
              </div>
              <div class="total-points">
                {{ game.players.reduce((total, player) =>
                  total + (player.stats.points2Made * 2) +
                  (player.stats.points3Made * 3) +
                  player.stats.freeThrowsMade, 0)
                }} points
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
}

.loading, .error, .empty {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.error {
  color: #ef4444;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.game-header h3 {
  margin: 0;
  color: #1e293b;
}

.game-date {
  color: #64748b;
  font-size: 0.9rem;
}

.game-stats {
  display: flex;
  gap: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .modal {
    width: 95%;
    max-height: 95vh;
  }

  .game-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>