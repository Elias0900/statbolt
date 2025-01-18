<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  matchName: string;
}>();

const emit = defineEmits<{
  (e: 'save', name: string): void;
  (e: 'close'): void;
}>();

// Initialiser gameName avec la prop matchName
const gameName = ref(props.matchName);

// Regarder les changements de matchName pour synchroniser la variable gameName
watch(() => props.matchName, (newName) => {
  gameName.value = newName;
});

const handleSave = () => {
  if (gameName.value.trim()) {
    emit('save', gameName.value.trim());
    gameName.value = ''; // Resetter après la sauvegarde
  }
};
</script>

<template>
  <div v-if="props.show" class="modal-overlay">
    <div class="modal">
      <h2>Sauvegarder le match</h2>
      <div class="modal-content">
        <input
          v-model="gameName"
          placeholder="Nom du match"
          @keyup.enter="handleSave"
          class="name-input"
        />
        <div class="modal-actions">
          <button @click="emit('close')" class="cancel-btn">Annuler</button>
          <button @click="handleSave" class="save-btn" :disabled="!gameName.trim()">
            Sauvegarder
          </button>
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
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal h2 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.name-input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  background-color: #64748b;
}

.cancel-btn:hover {
  background-color: #475569;
}

.save-btn {
  background-color: #22c55e;
}

.save-btn:hover:not(:disabled) {
  background-color: #16a34a;
}

.save-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}
</style>