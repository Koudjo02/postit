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
            <button @click.prevent="modifier(note)" class="action-btn action-btn--edit" title="Modifier">
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
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goTo(currentPage - 1)"
        >
          ←
        </button>

        <button
          v-for="p in totalPages"
          :key="p"
          class="page-btn"
          :class="{ 'page-btn--active': p === currentPage }"
          @click="goTo(p)"
        >
          {{ p }}
        </button>

        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goTo(currentPage + 1)"
        >
          →
        </button>
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

onMounted(() => store.charger_notes())

const totalPages = computed(() => Math.ceil(store.maliste.length / PER_PAGE))

const notesDeLaPage = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return store.maliste.slice(start, start + PER_PAGE)
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

function modifier(note: any) {
  const txt = prompt('Nouveau message :', note.content[0])
  if (txt) {
    store.modifier(note._id, note.title, txt)
  }
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
  gap: 8px;
  margin-top: 48px;
  flex-wrap: wrap;
}

.page-btn {
  width: 38px;
  height: 38px;
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

