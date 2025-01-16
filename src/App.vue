<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Player } from './types';
import PlayerCard from './components/PlayerCard.vue';
import TeamStats from './components/TeamStats.vue';
import SaveGameModal from './components/SaveGameModal.vue';
import { saveGame } from './db';
import MatchHistory from "./components/MatchHistory.vue";

const showSaveModal = ref(false);
const showHistory = ref(false);


const players = ref<Player[]>([
  {
    id: 1,
    name: "Joueur 1",
    playingTime: 0,
    onCourt: false,
    stats: {
      points2Made: 0,
      points2Missed: 0,
      points3Made: 0,
      points3Missed: 0,
      freeThrowsMade: 0,
      freeThrowsMissed: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 0,
      assists: 0,
      steals: 0,
      block: 0,
      turnovers: 0,
      evaluation: 0,
    },
  },
]);

const addPlayer = () => {
  if (players.value.length >= 10) return;
  const newPlayer: Player = {
    id: players.value.length + 1,
    name: `Joueur ${players.value.length + 1}`,
    playingTime: 0,
    onCourt: false,
    stats: {
      points2Made: 0,
      points2Missed: 0,
      points3Made: 0,
      points3Missed: 0,
      freeThrowsMade: 0,
      freeThrowsMissed: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 0,
      assists: 0,
      steals: 0,
      block: 0,
      turnovers: 0,
      evaluation: 0,
    },
  };
  players.value.push(newPlayer);
};

const playersOnCourt = computed(() => players.value.filter((p) => p.onCourt));

const isTimerRunning = ref(false);
const timerInterval = ref<number | null>(null);

const updatePlayerStat = (playerId: number, statName: keyof Player['stats'], value: number) => {
  const player = players.value.find((p) => p.id === playerId);
  if (player) {
    player.stats[statName] = value;
  }
};

const updatePlayerTime = (playerId: number, seconds: number) => {
  const player = players.value.find((p) => p.id === playerId);
  if (player) {
    player.playingTime = Math.max(0, seconds);
  }
};

const updatePlayerName = (playerId: number, name: string) => {
  const player = players.value.find((p) => p.id === playerId);
  if (player) {
    player.name = name;
  }
};

const resetGame = () => {
  players.value = players.value.map((player, index) => ({
    ...player,
    id: index + 1,
    name: player.name,
    onCourt: false,
    playingTime: 0,
    stats: {
      points2Made: 0,
      points2Missed: 0,
      points3Made: 0,
      points3Missed: 0,
      freeThrowsMade: 0,
      freeThrowsMissed: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 0,
      assists: 0,
      steals: 0,
      block: 0,
      turnovers: 0,
      evaluation: 0,
    },
  }));
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isTimerRunning.value = false;
};

const handleSaveGame = async (gameName: string) => {
  try {
    await saveGame({
      date: new Date(),
      name: gameName,
      players: players.value,
    });
    showSaveModal.value = false;
    resetGame();
    alert('Match sauvegardé avec succès !');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error);
    alert('Erreur lors de la sauvegarde du match');
  }
};

const togglePlayerOnCourt = (playerId: number) => {
  const player = players.value.find((p) => p.id === playerId);
  if (player) {
    if (!player.onCourt && playersOnCourt.value.length >= 5) {
      alert('Maximum 5 joueurs sur le terrain !');
      return;
    }
    player.onCourt = !player.onCourt;
  }
};

const toggleTimer = () => {
  if (isTimerRunning.value) {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  } else {
    timerInterval.value = setInterval(() => {
      players.value.forEach((player) => {
        if (player.onCourt) {
          player.playingTime++;
        }
      });
    }, 1000) as unknown as number;
  }
  isTimerRunning.value = !isTimerRunning.value;
};
</script>

<template>
  <div class="app-container">
    <header class="header">
      <h1>Statistiques de Basketball</h1>
      <div class="header-actions">
        <button
            class="history-btn"
            @click="showHistory = true"
        >
          📊 Historique des matchs
        </button>
        <button
          class="save-game-btn"
          @click="showSaveModal = true"
        >
          💾 Sauvegarder le match
        </button>
        <button
          class="add-player"
          @click="addPlayer"
          :disabled="players.length >= 10"
        >
          Ajouter un joueur ({{ players.length }}/10)
        </button>
      </div>
    </header>

    <div class="game-controls">
      <div class="on-court-players">
        <h3>Joueurs sur le terrain ({{ playersOnCourt.length }}/5)</h3>
        <div class="player-chips">
          <div
              v-for="player in players"
              :key="player.id"
              class="player-chip"
              :class="{ active: player.onCourt }"
              @click="togglePlayerOnCourt(player.id)"
          >
            {{ player.name }}
          </div>
        </div>
      </div>
      <button
          class="timer-btn"
          :class="{ running: isTimerRunning }"
          @click="toggleTimer"
      >
        {{ isTimerRunning ? '⏸ Pause' : '▶️ Démarrer' }} le chrono
      </button>
    </div>

    <TeamStats :players="players" />

    <div class="players-grid">
      <PlayerCard
        v-for="player in players"
        :key="player.id"
        :player="player"
        @update-stat="(statName, value) => updatePlayerStat(player.id, statName, value)"
        @update-time="(seconds) => updatePlayerTime(player.id, seconds)"
        @update-name="(name) => updatePlayerName(player.id, name)"
      />
    </div>

    <SaveGameModal
      :show="showSaveModal"
      @save="handleSaveGame"
      @close="showSaveModal = false"
    />

    <MatchHistory
        :show="showHistory"
        @close="showHistory = false"
    />
  </div>
</template>

<style scoped>
/* Container */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.5rem;
}

/* Header */
.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 1rem;
  color: #1e293b;
  flex: 1;
  min-width: 200px;
}

/* Buttons */
button {
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 300;
  font-size: 0.7rem;
  transition: all 0.3s ease;
}

.add-player,
.save-game-btn,
.history-btn{
  background-color: #4f46e5;
  color: #ffffff;
  margin-right: 0.5rem;
}

.add-player:disabled,
.save-game-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  transform: translateY(-2px);
  filter: brightness(0.9);
}

/* Grid */
.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 0.75rem;
  padding-top: 1rem;
}

/* Game Controls */
.game-controls {
  background: #ffffff;
  padding: 0.5rem;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center; /* Centre horizontalement */
  align-items: center; /* Centre verticalement */
}

/* On Court Players */
.on-court-players {
  margin-bottom: 0.5rem;
}

.on-court-players h3 {
  margin: 0 0 0.25rem 0;
  color: #1e293b;
  font-size: 0.8rem;
}

/* Player Chips */
.player-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.player-chip {
  padding: 0.25rem 0.25rem;
  background: #e2e8f0;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.player-chip.active {
  background: #4f46e5;
  color: #ffffff;
}

/* Timer Button */
.timer-btn {
  width: 25%;
  padding: 0.2rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
  justify-content: center;
  margin: 0 auto; /* Centre le bouton horizontalement dans son conteneur */

}

.timer-btn.running {
  background-color: #ef4444;
  color: white;
}

/* Media Queries for Responsive Design */
@media (min-width: 768px) {
  .header {
    gap: 1rem;
  }

  button {
    font-size: 0.9rem;
  }

  .timer-btn {
    font-size: 1.3rem;
  }
}

@media (min-width: 1024px) {
  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .header h1 {
    font-size: 1.5rem;
  }
}

@media (min-width: 1400px) {
  .players-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
