import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'


interface Note {
  _id: string;      
  title: string;    
  content: string[]; 
  createdAt: string; 
}

export const useNotesStore = defineStore('notes', () => {
const maliste = ref<Note[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  const url = 'https://postit.zoul.dev/notes'

  async function charger_notes() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await axios.get(url)
      maliste.value = res.data.notes 
    } catch (err: any) {
      errorMessage.value = "Erreur de chargement"
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function ajouter(pseudo: string, message: string) {
    try {
      await axios.post(url, {
        title: pseudo,   
        content: [message] 
      })
      await charger_notes()
    } catch (err) {
      errorMessage.value = "Erreur d'envoi"
    }
  }
async function supprimer(id: string) {
  try {
    await axios.delete(`${url}/${id}`)
    await charger_notes()
  } catch (err) {
    errorMessage.value = "Impossible de supprimer."
  }
}

async function modifier(id: string, nouveauPseudo: string, nouveauMessage: string) {
  try {
    await axios.put(`${url}/${id}`, {
      title: nouveauPseudo,
      content: [nouveauMessage] 
    })
    await charger_notes()
  } catch (err) {
    errorMessage.value = "Erreur lors de la modification."
  }
}

return { maliste, isLoading, errorMessage, charger_notes, ajouter, supprimer, modifier }
})