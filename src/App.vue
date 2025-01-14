<script setup lang="ts">
import { ref } from 'vue';
import type { Player } from './types';
import PlayerCard from './components/PlayerCard.vue';
import TeamStats from './components/TeamStats.vue';
import SaveGameModal from './components/SaveGameModal.vue';
import { saveGame } from './db';

const showSaveModal = ref(false);

const players = ref<Player[]>([
  {
    id: 1,
    name: "Joueur 1",
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
      block:0,
      turnovers: 0,
      evaluation: 0
    }
  }
]);

const addPlayer = () => {
  if (players.value.length >= 10) return;
  const newPlayer: Player = {
    id: players.value.length + 1,
    name: `Joueur ${players.value.length + 1}`,
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
      evaluation: 0
    }
  };
  players.value.push(newPlayer);
};

const updatePlayerStat = (playerId: number, statName: keyof Player['stats'], value: number) => {
  const player = players.value.find(p => p.id === playerId);
  if (player) {
    player.stats[statName] = value;
  }
};

const updatePlayerTime = (playerId: number, seconds: number) => {
  const player = players.value.find(p => p.id === playerId);
  if (player) {
    player.playingTime = Math.max(0, seconds);
  }
};

const updatePlayerName = (playerId: number, name: string) => {
  const player = players.value.find(p => p.id === playerId);
  if (player) {
    player.name = name;
  }
};

const resetGame = () => {
  players.value = players.value.map((player, index) => ({
    ...player,
    id: index + 1,
    name: player.name
  }));
};

const handleSaveGame = async (gameName: string) => {
  try {
    await saveGame({
      date: new Date(),
      name: gameName,
      players: players.value
    });
    showSaveModal.value = false;
    resetGame();
    alert('Match sauvegardé avec succès !');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    alert('Erreur lors de la sauvegarde du match');
    console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
  }
};
</script>

<template>
  <div class="app-container">
    <header class="header">
      <h1>Statistiques de Basketball</h1>
      <div class="header-actions">
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
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #1e293b;
}

.add-player {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.save-game-btn {
  margin-right: 1rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.add-player:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.add-player:not(:disabled):hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
}

@media (min-width: 1400px) {
  .players-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>