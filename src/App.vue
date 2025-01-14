<script setup lang="ts">
import { ref } from 'vue';
import type { Player } from './types';
import PlayerCard from './components/PlayerCard.vue';
import TeamStats from './components/TeamStats.vue';
import SaveGameModal from './components/SaveGameModal.vue';
import { saveGame } from './db';

const showSaveModal = ref(false);

const initialPlayerState: Player = {
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
    turnovers: 0
  }
};

const players = ref<Player[]>([{ ...initialPlayerState }]);

const addPlayer = () => {
  if (players.value.length >= 10) return;
  const newPlayer: Player = {
    ...initialPlayerState,
    id: players.value.length + 1,
    name: `Joueur ${players.value.length + 1}`,
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
    ...initialPlayerState,
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
/* Existing styles remain unchanged */
</style>