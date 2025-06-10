// store/NoteStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StorageUtils, createPersistStorage } from '@/store/AsyncStorage'
import type { Note } from '@/types'
import { addSyncLog } from '@/components/sync/syncUtils'

const NOTES_STORAGE_KEY = 'notes-store-data'
const ORDER_STORAGE_KEY = 'notes-store-order'

type NoteStoreState = {
  notes: Record<string, Note>
  noteOrder: string[]
  isLoaded: boolean
  isSyncEnabled: boolean
}

type NoteStoreActions = {
  addNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'orderIndex' | 'deletedAt'>) => Promise<void>
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  updateNoteOrder: (orderedData: string[]) => Promise<void>
  togglePinned: (id: string) => Promise<void>
  clearNotes: () => Promise<void>
  loadNotes: () => Promise<void>
  toggleNoteSync: () => void
  hydrateFromSync: (syncedData: { notes?: Record<string, Note>; noteOrder?: string[] }) => void
  getActiveNotes: () => Note[]
  cleanupOldDeletions: () => Promise<void>
}

export type NoteStore = NoteStoreState & NoteStoreActions

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: {},
      noteOrder: [],
      isLoaded: false,
      isSyncEnabled: false,

      toggleNoteSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
          addSyncLog(`Note sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info');
          return { isSyncEnabled: newSyncState };
        });
      },

      getActiveNotes: () => {
        const notes = get().notes;
        return Object.values(notes).filter(note => !note.deletedAt);
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
          
          const activeNotes = Object.values(safeNotes).filter(note => !note.deletedAt)
          const activeNoteIds = new Set(activeNotes.map(note => note.id))
          const validOrder = safeOrder.filter(id => activeNoteIds.has(id))
          const notesNotInOrder = Array.from(activeNoteIds).filter(id => !validOrder.includes(id))
          const finalOrder = [...notesNotInOrder, ...validOrder]
          
          set({
            notes: safeNotes,
            noteOrder: finalOrder,
            isLoaded: true
          })
          setTimeout(() => get().cleanupOldDeletions(), 2000)
        } catch (error) {
          console.error('Error loading notes:', error)
          set({ isLoaded: true })
        }
      },

      addNote: async (noteData) => {
        const now = new Date().toISOString()
        const newId = Date.now().toString()
        
        const newNote: Note = {
          ...noteData,
          id: newId,
          createdAt: now,
          updatedAt: now,
          isPinned: false,
        }
        
        set(state => ({
          notes: { ...state.notes, [newId]: newNote },
          noteOrder: [newId, ...state.noteOrder],
        }))
        
        await StorageUtils.set(NOTES_STORAGE_KEY, get().notes)
        await StorageUtils.set(ORDER_STORAGE_KEY, get().noteOrder)
        
        if (get().isSyncEnabled) {
          addSyncLog(`Note added locally: "${noteData.title || 'Untitled'}"`, 'info');
        }
      },

      updateNote: async (id, updates) => {
        set(state => {
          if (!state.notes[id] || state.notes[id].deletedAt) return {};
          const updatedNote = { ...state.notes[id], ...updates, updatedAt: new Date().toISOString() };
          return { notes: { ...state.notes, [id]: updatedNote } };
        });
        await StorageUtils.set(NOTES_STORAGE_KEY, get().notes);

        if (get().isSyncEnabled) {
          const note = get().notes[id];
          if (note) {
            addSyncLog(`Note updated locally: "${note.title || 'Untitled'}"`, 'info');
          }
        }
      },

      deleteNote: async (id) => {
        set(state => {
          if (!state.notes[id] || state.notes[id].deletedAt) return {};
          const now = new Date().toISOString();
          const deletedNote = { ...state.notes[id], deletedAt: now, updatedAt: now };
          const newNotes = { ...state.notes, [id]: deletedNote };
          const newOrder = state.noteOrder.filter(noteId => noteId !== id);
          return { notes: newNotes, noteOrder: newOrder };
        });
        await StorageUtils.set(NOTES_STORAGE_KEY, get().notes);
        await StorageUtils.set(ORDER_STORAGE_KEY, get().noteOrder);

        if (get().isSyncEnabled) {
          const note = get().notes[id];
          if (note) {
            addSyncLog(`Note deleted locally: "${note.title || 'Untitled'}"`, 'info');
          }
        }
      },

      updateNoteOrder: async (orderedIds) => {
        set({ noteOrder: orderedIds });
        await StorageUtils.set(ORDER_STORAGE_KEY, orderedIds);
      },

      togglePinned: async (id) => {
        const notes = get().notes;
        if (notes[id]) {
          await get().updateNote(id, { isPinned: !notes[id].isPinned });
        }
      },

      clearNotes: async () => {
        await StorageUtils.set(NOTES_STORAGE_KEY, {});
        await StorageUtils.set(ORDER_STORAGE_KEY, []);
        set({ notes: {}, noteOrder: [] });
        
        addSyncLog('Notes cleared locally', 'info');
      },

      cleanupOldDeletions: async () => {
        const notes = get().notes;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
        
        let cleanedCount = 0;
        const cleanedNotes = { ...notes };
        
        Object.entries(notes).forEach(([id, note]) => {
          if (note.deletedAt) {
            const deletedDate = new Date(note.deletedAt);
            if (deletedDate < cutoffDate) {
              delete cleanedNotes[id];
              cleanedCount++;
            }
          }
        });
        
        if (cleanedCount > 0) {
          set({ notes: cleanedNotes });
          await StorageUtils.set(NOTES_STORAGE_KEY, cleanedNotes);
          addSyncLog(`Cleaned up ${cleanedCount} old deleted notes`, 'info');
        }
      },
    }),
    {
      name: 'notes-store',
      storage: createPersistStorage<NoteStore>(),
    }
  )
);