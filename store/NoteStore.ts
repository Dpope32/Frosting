// store/NoteStore.ts - Updated with sync support
import { create } from 'zustand'
import { StorageUtils } from '@/store/AsyncStorage'
import type { Note } from '@/types'
import { generateNoteId } from '@/services'
import { addSyncLog } from '@/components/sync/syncUtils'

const NOTES_STORAGE_KEY = 'notes-store-data'
const ORDER_STORAGE_KEY = 'notes-store-order'

type NoteStoreState = {
  notes: Record<string, Note>
  noteOrder: string[]
  isLoaded: boolean
  isSyncEnabled: boolean // ADD SYNC SUPPORT
}

type NoteStoreActions = {
  addNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'orderIndex'>) => Promise<void>
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  updateNoteOrder: (orderedNotes: Note[]) => Promise<void>
  togglePinned: (id: string) => Promise<void>
  clearNotes: () => Promise<void>
  loadNotes: () => Promise<void>
  toggleNoteSync: () => void // ADD SYNC TOGGLE
  hydrateFromSync: (syncedData: { notes?: Record<string, Note>; noteOrder?: string[] }) => void // ADD SYNC HYDRATION
}

export type NoteStore = NoteStoreState & NoteStoreActions

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: {},
  noteOrder: [],
  isLoaded: false,
  isSyncEnabled: false, // Default to false for now

  toggleNoteSync: () => {
    set((state) => {
      const newSyncState = !state.isSyncEnabled;
      addSyncLog(`Note sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info');
      return { isSyncEnabled: newSyncState };
    });
  },

  hydrateFromSync: (syncedData: { notes?: Record<string, Note>; noteOrder?: string[] }) => {
    const currentSyncEnabledState = get().isSyncEnabled;
    if (!currentSyncEnabledState) {
      addSyncLog('Note sync is disabled, skipping hydration for NoteStore.', 'info');
      return;
    }

    if (!syncedData.notes) {
      addSyncLog('No notes data in snapshot for NoteStore.', 'info');
      return;
    }

    addSyncLog('🔄 Hydrating NoteStore from sync...', 'info');
    
    const currentNotes = get().notes;
    const currentOrder = get().noteOrder;
    let notesAddedCount = 0;
    let notesMergedCount = 0;

    // Merge notes using timestamp-based conflict resolution
    const mergedNotes = { ...currentNotes };
    
    Object.entries(syncedData.notes).forEach(([noteId, incomingNote]) => {
      const existingNote = currentNotes[noteId];
      
      if (!existingNote) {
        // New note from sync
        mergedNotes[noteId] = incomingNote;
        notesAddedCount++;
      } else {
        // Existing note - use timestamp to resolve conflicts
        const incomingTimestamp = new Date(incomingNote.updatedAt).getTime();
        const existingTimestamp = new Date(existingNote.updatedAt).getTime();
        
        if (incomingTimestamp > existingTimestamp) {
          mergedNotes[noteId] = incomingNote;
          notesMergedCount++;
        }
        // Otherwise keep local version (it's newer)
      }
    });

    // Merge note order - prefer incoming if it has more notes, otherwise keep local
    let mergedOrder = currentOrder;
    if (syncedData.noteOrder && syncedData.noteOrder.length > currentOrder.length) {
      // Incoming order has more notes, use it but add any local-only notes
      const incomingOrderSet = new Set(syncedData.noteOrder);
      const localOnlyNotes = Object.keys(mergedNotes).filter(id => !incomingOrderSet.has(id));
      mergedOrder = [...localOnlyNotes, ...syncedData.noteOrder.filter(id => mergedNotes[id])];
    } else {
      // Keep local order but add any new notes from sync to the beginning
      const localOrderSet = new Set(currentOrder);
      const newNotesFromSync = Object.keys(mergedNotes).filter(id => !localOrderSet.has(id));
      mergedOrder = [...newNotesFromSync, ...currentOrder.filter(id => mergedNotes[id])];
    }

    set({ 
      notes: mergedNotes,
      noteOrder: mergedOrder
    });

    // Save to local storage
    StorageUtils.set(NOTES_STORAGE_KEY, mergedNotes);
    StorageUtils.set(ORDER_STORAGE_KEY, mergedOrder);

    addSyncLog(`Notes hydrated: ${notesAddedCount} added, ${notesMergedCount} merged. Total notes: ${Object.keys(mergedNotes).length}`, 'success');
  },

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
    
    if (get().isSyncEnabled) {
      addSyncLog(`Note added locally: "${noteData.title || 'Untitled'}"`, 'info');
    }
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
      
      if (get().isSyncEnabled) {
        addSyncLog(`Note updated locally: "${updatedNote.title || 'Untitled'}"`, 'info');
      }
    }
  },

  deleteNote: async (id) => {
    const notes = get().notes
    const order = get().noteOrder
    if (notes[id]) {
      const noteTitle = notes[id].title || 'Untitled';
      const { [id]: _, ...remainingNotes } = notes
      const newOrder = order.filter(noteId => noteId !== id)
      
      await StorageUtils.set(NOTES_STORAGE_KEY, remainingNotes)
      await StorageUtils.set(ORDER_STORAGE_KEY, newOrder)
      
      set({ notes: remainingNotes, noteOrder: newOrder })
      
      if (get().isSyncEnabled) {
        addSyncLog(`Note deleted locally: "${noteTitle}"`, 'info');
      }
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
    
    addSyncLog('Notes cleared locally', 'info');
  },
}))