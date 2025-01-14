<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Player } from '../types';
import jsPDF from 'jspdf';

const props = defineProps<{
  player: Player;
}>();

const emit = defineEmits<{
  (e: 'updateStat', statName: keyof Player['stats'], value: number): void;
  (e: 'updateTime', seconds: number): void;
  (e: 'updateName', name: string): void;
}>();

const isTimerRunning = ref(false);
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);
const isEditingName = ref(false);
const editedName = ref(props.player.name);

const totalPoints = computed(() => {
  return (props.player.stats.points2Made * 2) +
         (props.player.stats.points3Made * 3) +
         props.player.stats.freeThrowsMade;
});

const shootingPercentage = computed(() => {
  return {
    points2: (props.player.stats.points2Made / (props.player.stats.points2Made + props.player.stats.points2Missed)) * 100 || 0,
    points3: (props.player.stats.points3Made / (props.player.stats.points3Made + props.player.stats.points3Missed)) * 100 || 0,
    freeThrows: (props.player.stats.freeThrowsMade / (props.player.stats.freeThrowsMade + props.player.stats.freeThrowsMissed)) * 100 || 0
  };
});

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const toggleTimer = () => {
  if (isTimerRunning.value) {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
    isTimerRunning.value = false;
  } else {
    timerInterval.value = setInterval(() => {
      emit('updateTime', props.player.playingTime + 1);
    }, 1000);
    isTimerRunning.value = true;
  }
};

const saveName = () => {
  if (editedName.value.trim()) {
    emit('updateName', editedName.value.trim());
  }
  isEditingName.value = false;
};

const decrementStat = (statName: keyof Player['stats']) => {
  if (props.player.stats[statName] > 0) {
    emit('updateStat', statName, props.player.stats[statName] - 1);
  }
};

const exportStatsPDF = () => {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString('fr-FR');
  
  // Title
  doc.setFontSize(20);
  doc.text('Rapport de Match - ' + now, 20, 20);
  
  // Joueur Stats
  doc.setFontSize(16);
  doc.text('Statistiques de ' + props.player.name, 20, 40);
  
  const teamData = [
    ['Points totaux', props.player.stats.points2Made.toString()],
    ['Tirs à 2pts', `${props.player.stats.points2Made} / ${props.player.stats.points2Made + props.player.stats.points2Missed} (${shootingPercentage.value.points2.toFixed(1)}%)`],
    ['Tirs à 3pts', `(${props.player.stats.points3Made} / ${props.player.stats.points3Made + props.player.stats.points3Missed})(${shootingPercentage.value.points3.toFixed(1)}%)`],
    ['Lancer-Francs', `(${props.player.stats.freeThrowsMade} / ${props.player.stats.freeThrowsMade + props.player.stats.freeThrowsMissed})(${shootingPercentage.value.freeThrows}%)`],
    ['Rebonds Off/Def', `${props.player.stats.offensiveRebounds + props.player.stats.defensiveRebounds} (${props.player.stats.offensiveRebounds} / ${props.player.stats.defensiveRebounds}) `],
    ['Passes décisives', props.player.stats.assists.toString()],
    ['Interceptions', props.player.stats.steals.toString()],
    ['Pertes de balle', props.player.stats.turnovers.toString()]
  ];
  
  (doc as any).autoTable({
    startY: 45,
    head: [['Statistique', 'Valeur']],
    body: teamData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });
 
  // Save the PDF with all stats
  doc.save('statistiques_' + props.player.name + '.pdf');
};

</script>

<template>
  <div class="player-card">
    <div class="player-header">
      <button class="edit-btn">✏️</button>
      <div v-if="!isEditingName" @click="isEditingName = true" class="player-name">
        <h4>{{ player.name }}</h4>
        <h4> {{ totalPoints }} Pts</h4>
      </div>
      <div v-else class="name-edit">
        <input 
          v-model="editedName"
          @keyup.enter="saveName"
          @blur="saveName"
          ref="nameInput"
          class="name-input"
        />
      </div>
      <div class="time-control">
        <span class="time-display">{{ formatTime(player.playingTime) }}</span>
        <button 
          class="time-btn"
          :class="{ 'running': isTimerRunning }"
          @click="toggleTimer"
        >
          {{ isTimerRunning ? '⏸' : '▶' }}
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-group">
        <h4>2 Points</h4>
        <div class="stat-controls">
          <button class="success" @click="emit('updateStat', 'points2Made', player.stats.points2Made + 1)">+</button>
          <button class="danger" @click="decrementStat('points2Made')">-</button>
          <span class="stat-value">{{ player.stats.points2Made }}/{{ player.stats.points2Made + player.stats.points2Missed }}</span>
          <button class="success" @click="emit('updateStat', 'points2Missed', player.stats.points2Missed + 1)">Raté</button>
          <button class="danger" @click="decrementStat('points2Missed')">-</button>
        </div>
        <div class="percentage">{{ shootingPercentage.points2.toFixed(1) }}%</div>
      </div>

      <div class="stat-group">
        <h4>3 Points</h4>
        <div class="stat-controls">
          <button class="success" @click="emit('updateStat', 'points3Made', player.stats.points3Made + 1)">+</button>
          <button class="danger" @click="decrementStat('points3Made')">-</button>
          <span class="stat-value">{{ player.stats.points3Made }}/{{ player.stats.points3Made + player.stats.points3Missed }}</span>
          <button class="success" @click="emit('updateStat', 'points3Missed', player.stats.points3Missed + 1)">Raté</button>
          <button class="danger" @click="decrementStat('points3Missed')">-</button>
        </div>
        <div class="percentage">{{ shootingPercentage.points3.toFixed(1) }}%</div>
      </div>

      <div class="stat-group">
        <h4>Lancers Francs</h4>
        <div class="stat-controls">
          <button class="success" @click="emit('updateStat', 'freeThrowsMade', player.stats.freeThrowsMade + 1)">+</button>
          <button class="danger" @click="decrementStat('freeThrowsMade')">-</button>
          <span class="stat-value">{{ player.stats.freeThrowsMade }}/{{ player.stats.freeThrowsMade + player.stats.freeThrowsMissed }}</span>
          <button class="success" @click="emit('updateStat', 'freeThrowsMissed', player.stats.freeThrowsMissed + 1)">Raté</button>
          <button class="danger" @click="decrementStat('freeThrowsMissed')">-</button>
        </div>
        <div class="percentage">{{ shootingPercentage.freeThrows.toFixed(1) }}%</div>
      </div>

      <div class="stat-group">
        <h4>Rebonds</h4>
        <div class="stat-buttons">
          <div class="stat-control-row">
            <button class="neutral" @click="emit('updateStat', 'offensiveRebounds', player.stats.offensiveRebounds + 1)">
              Off: {{ player.stats.offensiveRebounds }}
            </button>
            <button class="danger" @click="decrementStat('offensiveRebounds')">-</button>
          </div>
          <div class="stat-control-row">
            <button class="neutral" @click="emit('updateStat', 'defensiveRebounds', player.stats.defensiveRebounds + 1)">
              Def: {{ player.stats.defensiveRebounds }}
            </button>
            <button class="danger" @click="decrementStat('defensiveRebounds')">-</button>
          </div>
        </div>
      </div>

      <div class="stat-group">
        <h4>Autres</h4>
        <div class="stat-buttons">
          <div class="stat-control-row">
            <button class="neutral" @click="emit('updateStat', 'assists', player.stats.assists + 1)">
              Passes: {{ player.stats.assists }}
            </button>
            <button class="danger" @click="decrementStat('assists')">-</button>
          </div>
          <div class="stat-control-row">
            <button class="neutral" @click="emit('updateStat', 'steals', player.stats.steals + 1)">
              Inter: {{ player.stats.steals }}
            </button>
            <button class="danger" @click="decrementStat('steals')">-</button>
          </div>
          <div class="stat-control-row">
            <button class="neutral" @click="emit('updateStat', 'turnovers', player.stats.turnovers + 1)">
              Pertes: {{ player.stats.turnovers }}
            </button>
            <button class="danger" @click="decrementStat('turnovers')">-</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="total-points">
        Points totaux: {{ totalPoints }}
      </div>
      <button class="export-btn" @click="exportStatsPDF">
        📥 Exporter
      </button>
    </div>
  </div>
</template>

<style scoped>
.player-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.player-card:hover {
  transform: translateY(-2px);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.player-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.player-name h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.edit-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.player-name:hover .edit-btn {
  opacity: 1;
}

.name-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.name-input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1.25rem;
  width: 200px;
}

.time-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-btn {
  padding: 0.5rem;
  font-size: 1.25rem;
  line-height: 1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.time-btn.running {
  background-color: #ef4444;
}

.time-btn.running:hover {
  background-color: #dc2626;
}

.time-display {
  font-family: monospace;
  font-size: 1.25rem;
  color: #475569;
  min-width: 60px;
  text-align: center;
}

.stats-grid {
  display: grid;
  gap: 1rem;
}

.stat-group {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
}

.stat-group h4 {
  margin: 0 0 0.5rem 0;
  color: #475569;
  font-size: 0.875rem;
}

.stat-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  flex: 1;
  text-align: center;
  font-family: monospace;
  font-size: 1.125rem;
}

.stat-buttons {
  display: grid;
  gap: 0.5rem;
}

.stat-control-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.stat-control-row button:first-child {
  flex: 1;
}

button.success {
  background-color: #22c55e;
}

button.success:hover {
  background-color: #16a34a;
}

button.danger {
  background-color: #ef4444;
  padding: 0.25rem 0.5rem;
}

button.danger:hover {
  background-color: #dc2626;
}

button.neutral {
  background-color: #64748b;
}

button.neutral:hover {
  background-color: #475569;
}

.percentage {
  text-align: right;
  font-size: 0.875rem;
  color: #64748b;
}

.card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-points {
  font-weight: 600;
  color: #1e293b;
}

.export-btn {
  background-color: #3b82f6;
  transition: background-color 0.2s ease;
}

.export-btn:hover {
  background-color: #2563eb;
}
</style>