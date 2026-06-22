<template>
  <div class="create-wrapper">
    <div class="paper-card">
      <div class="paper-holes">
        <div class="hole"></div>
        <div class="hole"></div>
        <div class="hole"></div>
      </div>

      <div class="paper-content">
        <h2 class="form-title">✍️ Laisser un mot</h2>

        <div class="field">
          <label class="field-label">Votre pseudo</label>
          <input
            v-model="pseudo"
            type="text"
            class="field-input"
            placeholder="Ex : Samuel"
            maxlength="30"
          />
        </div>

        <div class="field">
          <label class="field-label">Votre message</label>
          <textarea
            v-model="message"
            class="field-textarea"
            rows="4"
            placeholder="Écrivez votre mot ici..."
            maxlength="300"
          ></textarea>
          <span class="char-count">{{ message.length }}/300</span>
        </div>

        <div v-if="store.errorMessage" class="error-msg">
          ⚠️ {{ store.errorMessage }}
        </div>

        <button
          @click="envoyerNote"
          :disabled="!message.trim() || store.isLoading"
          class="submit-btn"
        >
          <span v-if="store.isLoading" class="btn-spinner"></span>
          <span v-else>📌</span>
          {{ store.isLoading ? 'Envoi...' : 'Épingler sur le mur' }}
        </button>
      </div>
    </div>

    <p class="preview-hint">Votre note apparaîtra sur le mur partagé</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotesStore } from '../stores/store'
import { useRouter } from 'vue-router'

const store = useNotesStore()
const router = useRouter()

const pseudo = ref('')
const message = ref('')

async function envoyerNote() {
  if (!message.value.trim()) return
  await store.ajouter(pseudo.value, message.value)
  if (!store.errorMessage) {
    message.value = ''
    router.push({ name: 'home' })
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

.create-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.paper-card {
  width: 100%;
  max-width: 480px;
  background: #fffef5;
  border-radius: 4px;
  box-shadow:
    3px 3px 0 #d4c898,
    6px 6px 0 #c8ba82,
    0 12px 40px rgba(60,40,20,0.2);
  display: flex;
  overflow: hidden;
}

.paper-holes {
  width: 36px;
  background: #f0e8d0;
  border-right: 2px solid #ddd0b0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 30px 0;
  flex-shrink: 0;
}

.hole {
  width: 14px;
  height: 14px;
  background: #e8dcc8;
  border-radius: 50%;
  border: 1.5px solid #c8b898;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.15);
}

.paper-content {
  flex: 1;
  padding: 32px 28px 28px;
  background-image: repeating-linear-gradient(
    transparent,
    transparent 31px,
    #e8e0cc 31px,
    #e8e0cc 32px
  );
  background-position: 0 48px;
}

.form-title {
  font-family: 'Caveat', cursive;
  font-size: 28px;
  font-weight: 700;
  color: #3d2b1f;
  margin: 0 0 28px;
  line-height: 32px;
}

.field {
  margin-bottom: 24px;
  position: relative;
}

.field-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #8a7060;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.field-input,
.field-textarea {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid #d4c4a0;
  border-radius: 0;
  padding: 6px 0;
  font-family: 'Caveat', cursive;
  font-size: 20px;
  color: #2a1d14;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  resize: none;
}

.field-input::placeholder,
.field-textarea::placeholder {
  color: #c4b090;
}

.field-input:focus,
.field-textarea:focus {
  border-bottom-color: #c8860a;
}

.char-count {
  position: absolute;
  bottom: -18px;
  right: 0;
  font-size: 11px;
  color: #b0a080;
  font-family: 'Inter', sans-serif;
}

.error-msg {
  background: #fff0f0;
  border: 1px solid #ffcccc;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13px;
  color: #cc3333;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  padding: 13px 20px;
  background: #c8860a;
  color: #fff8ee;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 32px;
  box-shadow: 0 3px 0 #8a5a06;
}

.submit-btn:hover:not(:disabled) {
  background: #d4920c;
  transform: translateY(-1px);
  box-shadow: 0 4px 0 #8a5a06;
}

.submit-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #8a5a06;
}

.submit-btn:disabled {
  background: #c8b898;
  color: #e8dcc8;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,248,238,0.3);
  border-top-color: #fff8ee;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.preview-hint {
  margin-top: 16px;
  font-size: 13px;
  color: #9a8070;
  font-family: 'Inter', sans-serif;
}
</style>

