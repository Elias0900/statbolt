<script setup lang="ts">
import { computed } from 'vue';
import type { Game } from '../types';
import TeamStats from './TeamStats.vue';

const props = defineProps<{
  game: Game;
  onClose: () => void;
}>();

const totalPoints = computed(() => {
  return props.game.players.reduce((total, player) =>
      total + (player.stats.points2Made * 2) +
      (player.stats.points3Made * 3) +
      player.stats.freeThrowsMade, 0
  );
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="match-details">
    <div class="match-header">
      <button class="back-btn" @click="onClose">← Retour</button>
      <div class="match-info">
        <h2>{{ game.name }}</h2>
        <span class="match-date">{{ formatDate(game.date) }}</span>
      </div>
    </div>

    <TeamStats :players="game.players" />

    <div class="players-stats">
      <h3>Statistiques par joueur</h3>
      <div class="stats-table">
        <table>
          <thead>
          <tr>
            <th>Joueur</th>
            <th>Temps</th>
            <th>Points</th>
            <th>2 pts</th>
            <th>3 pts</th>
            <th>LF</th>
            <th>Rebonds</th>
            <th>Passes</th>
            <th>Inter.</th>
            <th>Pertes</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="player in game.players" :key="player.id">
            <td>{{ player.name }}</td>
            <td>{{ formatTime(player.playingTime) }}</td>
            <td>{{ (player.stats.points2Made * 2) + (player.stats.points3Made * 3) + player.stats.freeThrowsMade }}</td>
            <td>{{ player.stats.points2Made }}/{{ player.stats.points2Made + player.stats.points2Missed }}</td>
            <td>{{ player.stats.points3Made }}/{{ player.stats.points3Made + player.stats.points3Missed }}</td>
            <td>{{ player.stats.freeThrowsMade }}/{{ player.stats.freeThrowsMade + player.stats.freeThrowsMissed }}</td>
            <td>{{ player.stats.offensiveRebounds + player.stats.defensiveRebounds }}</td>
            <td>{{ player.stats.assists }}</td>
            <td>{{ player.stats.steals }}</td>
            <td>{{ player.stats.turnovers }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-details {
  padding: 1.5rem;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.back-btn {
  background-color: #64748b;
  padding: 0.5rem 1rem;
}

.back-btn:hover {
  background-color: #475569;
}

.match-info {
  display: flex;
  flex-direction: column;
}

.match-info h2 {
  margin: 0;
  color: #1e293b;
}

.match-date {
  color: #64748b;
  font-size: 0.9rem;
}

.players-stats {
  margin-top: 2rem;
}

.players-stats h3 {
  color: #1e293b;
  margin-bottom: 1rem;
}

.stats-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 0.75rem 1rem;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background-color: #f1f5f9;
  color: #1e293b;
  font-weight: 600;
}

tr:last-child td {
  border-bottom: none;
}

@media (max-width: 768px) {
  .match-details {
    padding: 1rem;
  }

  .stats-table {
    margin: 0 -1rem;
  }

  table {
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.5rem;
  }
}
</style>