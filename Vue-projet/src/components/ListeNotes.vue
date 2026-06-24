<template>
  <div>
    <div class="board-header">
      <h1 class="board-title">{{ store.maliste.length }} note{{ store.maliste.length > 1 ? 's' : '' }} épinglée{{ store.maliste.length > 1 ? 's' : '' }}</h1>
    </div>

    <div v-if="store.isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Chargement du mur...</p>
    </div>

    <div v-else-if="store.maliste.length === 0" class="empty-state">
      <div class="empty-icon">🗒️</div>
      <p class="empty-title">Le mur est vide</p>
      <p class="empty-sub">Soyez le premier à laisser un mot !</p>
    </div>

    <div v-else>
      <div class="mur">
        <div
          v-for="(note, index) in notesDeLaPage"
          :key="note._id"
          class="postit"
          :class="`postit--color-${(globalIndex(index) % 4) + 1}`"
          :style="{ transform: `rotate(${rotations[globalIndex(index) % rotations.length]}deg)` }"
        >
          <div class="postit-pin"></div>

          <div class="postit-actions">
            <button @click.prevent="ouvrirModale(note)" class="action-btn action-btn--edit" title="Modifier">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button @click.prevent="store.supprimer(note._id)" class="action-btn action-btn--delete" title="Supprimer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            </button>
          </div>

          <p class="postit-author">{{ note.title || 'Anonyme' }}</p>

          <div class="postit-message-wrap">
            <p class="postit-message">
              {{ expanded.has(note._id) ? note.content[0] : truncate(note.content[0]) }}
            </p>
            <button
              v-if="note.content[0].length > MAX_CHARS"
              @click="toggle(note._id)"
              class="read-more"
            >
              {{ expanded.has(note._id) ? 'Réduire ↑' : 'Lire plus ↓' }}
            </button>
          </div>

          <p class="postit-date">{{ new Date(note.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="goTo(currentPage - 1)">←</button>
        <template v-for="p in pageNumbers" :key="p">
          <span v-if="p === '...'" class="page-dots">…</span>
          <button v-else class="page-btn" :class="{ 'page-btn--active': p === currentPage }" @click="goTo(Number(p))">{{ p }}</button>
        </template>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="goTo(currentPage + 1)">→</button>
      </div>
    </div>

    <!-- Modale modification -->
    <div v-if="modaleOuverte" class="modale-overlay" @click.self="fermerModale">
      <div class="modale">
        <div class="modale-pin"></div>
        <h3 class="modale-title">✏️ Modifier la note</h3>

        <div class="modale-field">
          <label class="modale-label">Pseudo</label>
          <input v-model="editPseudo" type="text" class="modale-input" placeholder="Votre pseudo" maxlength="30" />
        </div>

        <div class="modale-field">
          <label class="modale-label">Message</label>
          <textarea v-model="editMessage" class="modale-textarea" rows="4" placeholder="Votre message" maxlength="300"></textarea>
          <span class="modale-count">{{ editMessage.length }}/300</span>
        </div>

        <div class="modale-actions">
          <button class="modale-btn modale-btn--cancel" @click="fermerModale">Annuler</button>
          <button class="modale-btn modale-btn--save" :disabled="!editMessage.trim() || store.isLoading" @click="sauvegarder">
            <span v-if="store.isLoading" class="btn-spinner"></span>
            {{ store.isLoading ? 'Enregistrement...' : '📌 Sauvegarder' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useNotesStore } from '../stores/store'

const store = useNotesStore()
const rotations = [-2.5, 1.5, -1, 2, -1.8, 0.8, -2, 1.2]

const PER_PAGE = 10
const MAX_CHARS = 120

const currentPage = ref(1)
const expanded = ref<Set<string>>(new Set())

// Modale
const modaleOuverte = ref(false)
const noteEnCours = ref<any>(null)
const editPseudo = ref('')
const editMessage = ref('')

onMounted(() => store.charger_notes())

const totalPages = computed(() => Math.ceil(store.maliste.length / PER_PAGE))

const notesDeLaPage = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return store.maliste.slice(start, start + PER_PAGE)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, '...', total]
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
})

function globalIndex(localIndex: number) {
  return (currentPage.value - 1) * PER_PAGE + localIndex
}

function goTo(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function truncate(text: string) {
  if (text.length <= MAX_CHARS) return text
  return text.slice(0, MAX_CHARS).trimEnd() + '...'
}

function toggle(id: string) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
  expanded.value = new Set(expanded.value)
}

function ouvrirModale(note: any) {
  noteEnCours.value = note
  editPseudo.value = note.title || ''
  editMessage.value = note.content[0] || ''
  modaleOuverte.value = true
}

function fermerModale() {
  modaleOuverte.value = false
  noteEnCours.value = null
}

async function sauvegarder() {
  if (!editMessage.value.trim() || !noteEnCours.value) return
  await store.modifier(noteEnCours.value._id, editPseudo.value, editMessage.value)
  fermerModale()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

.board-header { margin-bottom: 28px; }

.board-title {
  font-family: 'Caveat', cursive;
  font-size: 22px;
  color: #5a4030;
  font-weight: 600;
  opacity: 0.7;
}

.mur {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  align-items: flex-start;
}

.postit {
  width: 220px;
  min-height: 200px;
  padding: 18px 16px 36px;
  position: relative;
  cursor: default;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 4px 6px 18px rgba(60,40,20,0.18), 1px 1px 0 rgba(0,0,0,0.08);
}

.postit:hover {
  transform: rotate(0deg) scale(1.04) !important;
  box-shadow: 8px 12px 28px rgba(60,40,20,0.25);
  z-index: 10;
}

.postit--color-1 { background: #fff9a3; }
.postit--color-2 { background: #b5e8c8; }
.postit--color-3 { background: #ffc8c8; }
.postit--color-4 { background: #b8d8f8; }

.postit-pin {
  width: 12px;
  height: 12px;
  background: radial-gradient(circle at 35% 35%, #ff6b6b, #cc0000);
  border-radius: 50%;
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  z-index: 2;
}

.postit-pin::after {
  content: '';
  width: 3px;
  height: 16px;
  background: linear-gradient(to bottom, #999, #666);
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 0 0 2px 2px;
}

.postit-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.postit:hover .postit-actions { opacity: 1; }

.action-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.action-btn--edit { background: rgba(0,0,0,0.1); color: #333; }
.action-btn--edit:hover { background: #4a90d9; color: white; }
.action-btn--delete { background: rgba(0,0,0,0.1); color: #333; }
.action-btn--delete:hover { background: #e53e3e; color: white; }

.postit-author {
  font-family: 'Caveat', cursive;
  font-size: 13px;
  font-weight: 700;
  color: rgba(0,0,0,0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px;
}

.postit-message-wrap { margin-bottom: 8px; }

.postit-message {
  font-family: 'Caveat', cursive;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0 0 4px;
  word-break: break-word;
}

.read-more {
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: rgba(0,0,0,0.4);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s;
}

.read-more:hover { color: rgba(0,0,0,0.7); }

.postit-date {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: rgba(0,0,0,0.35);
  text-align: right;
  margin: 0;
  position: absolute;
  bottom: 12px;
  right: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 48px;
  flex-wrap: nowrap;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(90,64,48,0.25);
  background: rgba(255,249,163,0.5);
  border-radius: 6px;
  font-family: 'Caveat', cursive;
  font-size: 16px;
  font-weight: 600;
  color: #5a4030;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-btn:hover:not(:disabled) {
  background: #fff9a3;
  border-color: #c8860a;
  color: #3d2b1f;
}

.page-btn--active {
  background: #c8860a;
  border-color: #a36e08;
  color: #fff8ee;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-dots {
  width: 28px;
  text-align: center;
  color: #5a4030;
  font-family: 'Caveat', cursive;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Modale */
.modale-overlay {
  position: fixed;
  inset: 0;
  background: rgba(40,25,15,0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modale {
  background: #fffef5;
  border-radius: 4px;
  width: 100%;
  max-width: 420px;
  padding: 32px 28px 28px;
  position: relative;
  box-shadow:
    3px 3px 0 #d4c898,
    6px 6px 0 #c8ba82,
    0 20px 60px rgba(40,25,15,0.35);
  background-image: repeating-linear-gradient(
    transparent,
    transparent 31px,
    #e8e0cc 31px,
    #e8e0cc 32px
  );
  background-position: 0 48px;
}

.modale-pin {
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 35% 35%, #ff6b6b, #cc0000);
  border-radius: 50%;
  position: absolute;
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
}

.modale-title {
  font-family: 'Caveat', cursive;
  font-size: 26px;
  font-weight: 700;
  color: #3d2b1f;
  margin: 0 0 24px;
}

.modale-field {
  margin-bottom: 20px;
  position: relative;
}

.modale-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #8a7060;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.modale-input,
.modale-textarea {
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

.modale-input:focus,
.modale-textarea:focus {
  border-bottom-color: #c8860a;
}

.modale-count {
  position: absolute;
  bottom: -18px;
  right: 0;
  font-size: 11px;
  color: #b0a080;
  font-family: 'Inter', sans-serif;
}

.modale-actions {
  display: flex;
  gap: 10px;
  margin-top: 32px;
}

.modale-btn {
  flex: 1;
  padding: 11px 16px;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.modale-btn--cancel {
  background: rgba(90,64,48,0.1);
  color: #5a4030;
  border: 1.5px solid rgba(90,64,48,0.2);
}

.modale-btn--cancel:hover {
  background: rgba(90,64,48,0.18);
}

.modale-btn--save {
  background: #c8860a;
  color: #fff8ee;
  box-shadow: 0 3px 0 #8a5a06;
}

.modale-btn--save:hover:not(:disabled) {
  background: #d4920c;
  transform: translateY(-1px);
  box-shadow: 0 4px 0 #8a5a06;
}

.modale-btn--save:disabled {
  background: #c8b898;
  color: #e8dcc8;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,248,238,0.3);
  border-top-color: #fff8ee;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Loading / Empty */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: #7a6050;
  font-family: 'Caveat', cursive;
  font-size: 20px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(122,96,80,0.2);
  border-top-color: #c8860a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-title { font-family: 'Caveat', cursive; font-size: 26px; color: #5a4030; margin: 0 0 8px; }
.empty-sub { font-size: 15px; color: #9a8070; margin: 0; }
</style>

