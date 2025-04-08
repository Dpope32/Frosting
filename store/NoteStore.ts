// store/NoteStore.ts
import { create } from 'zustand'
import { StorageUtils } from '@/store/AsyncStorage'
import type { Note } from '@/types/notes'
import { generateNoteId } from '../services/noteService'

const NOTES_STORAGE_KEY = 'notes-store-data'
const ORDER_STORAGE_KEY = 'notes-store-order'

type NoteStoreState = {
  notes: Record<string, Note>
  noteOrder: string[]
  isLoaded: boolean
}

type NoteStoreActions = {
  addNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'orderIndex'>) => Promise<void>
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  updateNoteOrder: (orderedNotes: Note[]) => Promise<void>
  togglePinned: (id: string) => Promise<void>
  clearNotes: () => Promise<void>
  loadNotes: () => Promise<void>
}

type NoteStore = NoteStoreState & NoteStoreActions

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: {},
  noteOrder: [],
  isLoaded: false,

  loadNotes: async () => {
    if (get().isLoaded) return;
    
    try {
      const storedNotes = await StorageUtils.get<Record<string, Note>>(NOTES_STORAGE_KEY, {})
      const storedOrder = await StorageUtils.get<string[]>(ORDER_STORAGE_KEY, [])

      const safeNotes = storedNotes || {}
      const safeOrder = storedOrder || []

      const validOrder = safeOrder.filter(id => safeNotes[id])
      
      const notesNotInOrder = Object.keys(safeNotes).filter(id => !validOrder.includes(id))
      const finalOrder = [...notesNotInOrder, ...validOrder]

      set({ 
        notes: safeNotes, 
        noteOrder: finalOrder,
        isLoaded: true 
      })
    } catch (error) {
      console.error('Error loading notes:', error)
      set({ isLoaded: true })
    }
  },

  addNote: async (noteData) => {
    const newId = generateNoteId()
    const now = new Date().toISOString()
    const newNote: Note = {
      ...noteData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      isPinned: false,
    }

    const currentNotes = get().notes
    const currentOrder = get().noteOrder

    const newNotes = { ...currentNotes, [newId]: newNote }
    const newOrder = [newId, ...currentOrder]

    await StorageUtils.set(NOTES_STORAGE_KEY, newNotes)
    await StorageUtils.set(ORDER_STORAGE_KEY, newOrder)
    set({ notes: newNotes, noteOrder: newOrder })
  },

  updateNote: async (id, updates) => {
    const notes = get().notes
    if (notes[id]) {
      const updatedNote = {
        ...notes[id],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      const newNotes = { ...notes, [id]: updatedNote }

      await StorageUtils.set(NOTES_STORAGE_KEY, newNotes)
      set({ notes: newNotes })
    }
  },

  deleteNote: async (id) => {
    const notes = get().notes
    const order = get().noteOrder

    if (notes[id]) {
      const { [id]: _, ...remainingNotes } = notes
      const newOrder = order.filter(noteId => noteId !== id)

      await StorageUtils.set(NOTES_STORAGE_KEY, remainingNotes)
      await StorageUtils.set(ORDER_STORAGE_KEY, newOrder)
      set({ notes: remainingNotes, noteOrder: newOrder })
    }
  },

  updateNoteOrder: async (orderedNotes) => {
    const newOrder = orderedNotes.map(note => note.id)
    
    set({ noteOrder: newOrder })
    
    StorageUtils.set(ORDER_STORAGE_KEY, newOrder).catch(error => {
      console.error('Error saving note order:', error)
    })
  },

  togglePinned: async (id) => {
    const notes = get().notes
    if (notes[id]) {
      await get().updateNote(id, { isPinned: !notes[id].isPinned })
    }
  },

  clearNotes: async () => {
    await StorageUtils.set(NOTES_STORAGE_KEY, {})
    await StorageUtils.set(ORDER_STORAGE_KEY, [])
    set({ notes: {}, noteOrder: [] })
  },
}))
