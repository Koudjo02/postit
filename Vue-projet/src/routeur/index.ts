import { createRouter, createWebHistory } from 'vue-router'
import ListenNotes from '../components/ListeNotes.vue'
import CreateNotes from '../components/CreateNotes.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: ListenNotes 
  },
  {
    path: '/ajouter',
    name: 'ajouter',
    component: CreateNotes 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router