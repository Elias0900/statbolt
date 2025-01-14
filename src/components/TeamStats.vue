<script setup lang="ts">
import { computed } from 'vue';
import type { Player, TeamStats } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const props = defineProps<{
  players: Player[];
}>();

const teamStats = computed<TeamStats>(() => {
  const initialStats: TeamStats = {
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
    totalPoints: 0,
    evaluation: 0,
    shootingPercentages: {
      points2: 0,
      points3: 0,
      freeThrows: 0
    }
  };

  const stats = props.players.reduce((acc, player) => {
    Object.keys(player.stats).forEach((key) => {
      const statKey = key as keyof typeof player.stats;
      acc[statKey] += player.stats[statKey];
    });
    return acc;
  }, initialStats);

  stats.totalPoints = (stats.points2Made * 2) + (stats.points3Made * 3) + stats.freeThrowsMade;
  
  stats.shootingPercentages = {
    points2: (stats.points2Made / (stats.points2Made + stats.points2Missed)) * 100 || 0,
    points3: (stats.points3Made / (stats.points3Made + stats.points3Missed)) * 100 || 0,
    freeThrows: (stats.freeThrowsMade / (stats.freeThrowsMade + stats.freeThrowsMissed)) * 100 || 0
  };

  return stats;
});

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const exportStatsPDF = () => {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString('fr-FR');
  
  // Title
  doc.setFontSize(20);
  doc.text('Rapport de Match - ' + now, 20, 20);
  
  // Team Stats
  doc.setFontSize(16);
  doc.text('Statistiques d\'équipe', 20, 40);
  
  const teamData = [
    ['Points totaux', teamStats.value.totalPoints.toString()],
    ['Tirs à 2pts', `${teamStats.value.points2Made}/${teamStats.value.points2Made + teamStats.value.points2Missed} (${teamStats.value.shootingPercentages.points2.toFixed(1)}%)`],
    ['Tirs à 3pts', `${teamStats.value.points3Made}/${teamStats.value.points3Made + teamStats.value.points3Missed} (${teamStats.value.shootingPercentages.points3.toFixed(1)}%)`],
    ['Lancers francs', `${teamStats.value.freeThrowsMade}/${teamStats.value.freeThrowsMade + teamStats.value.freeThrowsMissed} (${teamStats.value.shootingPercentages.freeThrows.toFixed(1)}%)`],
    ['Rebonds Off/Def', `${teamStats.value.offensiveRebounds}/${teamStats.value.defensiveRebounds}`],
    ['Passes décisives', teamStats.value.assists.toString()],
    ['Interceptions', teamStats.value.steals.toString()],
    ['Pertes de balle', teamStats.value.turnovers.toString()]
  ];
  
  (doc as any).autoTable({
    startY: 45,
    head: [['Statistique', 'Valeur']],
    body: teamData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });
  
  // Individual Players Stats
  doc.setFontSize(16);
  doc.text('Statistiques individuelles', 20, (doc as any).lastAutoTable.finalY + 20);
  
  const playerData = props.players.map(player => [
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
    player.stats.evaluation
  ]);
  
  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [['Joueur', 'Temps', 'Pts', '2pts', '3pts', 'LF', 'Reb', 'Pas', 'Int', 'Blk', 'BP', '+/-']],
    body: playerData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });
  
  doc.save('statistiques_match.pdf');
};
</script>

<template>
  <div class="team-stats">
    <div class="team-stats-header">
      <h2>Statistiques d'équipe</h2>
      <div class="stats-container">
      <div class="stat-group">
        <h3>Points</h3>
        <div class="stat-value">Total: {{ teamStats.totalPoints }}</div>
        <div class="stat-row">
          <span>2pts:</span>
          <span>{{ teamStats.points2Made }}/{{ teamStats.points2Made + teamStats.points2Missed }}</span>
          <span class="percentage">{{ teamStats.shootingPercentages.points2.toFixed(1) }}%</span>
        </div>
        <div class="stat-row">
          <span>3pts:</span>
          <span>{{ teamStats.points3Made }}/{{ teamStats.points3Made + teamStats.points3Missed }}</span>
          <span class="percentage">{{ teamStats.shootingPercentages.points3.toFixed(1) }}%</span>
        </div>
        <div class="stat-row">
          <span>LF:</span>
          <span>{{ teamStats.freeThrowsMade }}/{{ teamStats.freeThrowsMade + teamStats.freeThrowsMissed }}</span>
          <span class="percentage">{{ teamStats.shootingPercentages.freeThrows.toFixed(1) }}%</span>
        </div>
      </div>

      <div class="stat-group">
        <h3>Rebonds</h3>
        <div class="stat-row">
          <span>Offensifs:</span>
          <span>{{ teamStats.offensiveRebounds }}</span>
        </div>
        <div class="stat-row">
          <span>Défensifs:</span>
          <span>{{ teamStats.defensiveRebounds }}</span>
        </div>
        <div class="stat-row total">
          <span>Total:</span>
          <span>{{ teamStats.offensiveRebounds + teamStats.defensiveRebounds }}</span>
        </div>
      </div>

      <div class="stat-group">
        <h3>Autres</h3>
        <div class="stat-row">
          <span>Passes décisives:</span>
          <span>{{ teamStats.assists }}</span>
        </div>
        <div class="stat-row">
          <span>Interceptions:</span>
          <span>{{ teamStats.steals }}</span>
        </div>
        <div class="stat-row">
          <span>Pertes de balle:</span>
          <span>{{ teamStats.turnovers }}</span>
        </div>
      </div>
    </div>
      <button class="export-btn" @click="exportStatsPDF">
        📥 Exporter en PDF
      </button>
    </div>
    <!-- Rest of the template remains unchanged -->
  </div>
</template>

<style scoped>
.team-stats {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.team-stats h2 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.5rem;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-group {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
}

.stat-group h3 {
  margin: 0 0 1rem 0;
  color: #475569;
  font-size: 1.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.stat-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row.total {
  font-weight: 600;
  color: #1e293b;
}

.percentage {
  color: #64748b;
}
/* Existing styles remain unchanged */
</style>