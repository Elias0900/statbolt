<script setup lang="ts">
import {ref, onMounted, Ref, watch} from 'vue';
import { loadGames } from '../db';
import type { Game } from '../types';
import jsPDF from "jspdf";

// Props et événements
const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// États
const games: Ref<Game[]> = ref([]); // Tableau vide par défaut
const loading: Ref<boolean> = ref(false);
const error: Ref<string | null> = ref(null);

// Formatage de la date
const formatDate = (date: Date) => {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Chargement des données
const fetchGames = async () => {
  loading.value = true; // Active l'état de chargement
  error.value = null; // Réinitialise l'erreur précédente

  try {
    const loadedGames = await loadGames(); // Appel à la méthode `loadGames`
    games.value = loadedGames; // Mise à jour des jeux
  } catch (e: any) {
    console.error('Erreur lors du chargement des jeux :', e);
    error.value = e.message || 'Erreur inattendue lors du chargement des jeux.';
  } finally {
    loading.value = false; // Désactive l'état de chargement
  }
};

// Monté du composant ou changement de `props.show`
onMounted(() => {
  if (props.show) {
    fetchGames();
  }
});

// Recharger les données si `props.show` change
watch(() => props.show, (newValue) => {
  if (newValue) {
    fetchGames();
  }
});


// Export en PDF
const exportStatsPDF = (game: Game) => {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString('fr-FR');

  // Title
  doc.setFontSize(20);
  doc.text('Rapport de Match - ' + game.name + ' ' + now, 20, 20);

  // Statistiques de l'équipe
  doc.setFontSize(16);
  doc.text('Statistiques d\'équipe', 20, 40);

  const teamData = [
    ['Points totaux', game.players.reduce((total, player) =>
        total + (player.stats.points2Made * 2) +
        (player.stats.points3Made * 3) +
        player.stats.freeThrowsMade, 0).toString()],
    // Ajoutez d'autres statistiques d'équipe ici...
  ];

  (doc as any).autoTable({
    startY: 45,
    head: [['Statistique', 'Valeur']],
    body: teamData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Statistiques des joueurs
  doc.setFontSize(16);
  doc.text('Statistiques individuelles', 20, (doc as any).lastAutoTable.finalY + 20);

  const playerData = game.players.map(player => [
    player.name,
    formatTime(player.playingTime),
    (player.stats.points2Made * 2 + player.stats.points3Made * 3 + player.stats.freeThrowsMade).toString(),
    `${player.stats.points2Made}/${player.stats.points2Made + player.stats.points2Missed}`,
    `${player.stats.points3Made}/${player.stats.points3Made + player.stats.points3Missed}`,
    `${player.stats.freeThrowsMade}/${player.stats.freeThrowsMade + player.stats.freeThrowsMissed}`,
    (player.stats.offensiveRebounds + player.stats.defensiveRebounds).toString(),
    player.stats.assists.toString(),
    player.stats.steals.toString(),
    player.stats.block.toString(),
    player.stats.turnovers.toString(),
    player.stats.evaluation.toString()
  ]);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [['Joueur', 'Temps', 'Pts', '2pts', '3pts', 'LF', 'Reb', 'Pas', 'Int', 'Blk', 'BP', '+/-']],
    body: playerData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Sauvegarder le PDF
  doc.save('statistiques_match.pdf');
};

// Formatage du temps de jeu
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Monté du composant
onMounted(() => {
  if (props.show) {
    loadGames();
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
        <!-- Indicateur de chargement -->
        <div v-if="loading" class="loading">
          Chargement...
        </div>

        <!-- Gestion des erreurs -->
        <div v-else-if="error" class="error">
          {{ error }}
        </div>

        <!-- Aucun match trouvé -->
        <div v-else-if="games.length === 0" class="empty">
          Aucun match enregistré
        </div>

        <!-- Liste des matchs -->
        <div v-else class="games-list">
          <div v-for="game in games" :key="game.id || game.date.toString()" class="game-item">
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
              <div class="export">
              </div>
            </div>
            <button @click="exportStatsPDF(game)" class="export-btn">Exporter en PDF</button>

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
  flex-direction: column;
  gap: 10px;
}

.game-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  justify-content: space-between;
  gap: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}

.export-btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.export-btn:hover {
  background-color: #4338ca;
}

@media (max-width: 640px) {
  .modal {
    width: 95%;
    max-height: 95vh;
  }

  .game-header-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .game-stats {
    flex-direction: column;
  }

  .export-btn {
    align-self: flex-start;
    margin-top: 10px;
  }
}
</style>
