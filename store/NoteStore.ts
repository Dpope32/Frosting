// store/NoteStore.ts - Updated with tombstone deletion so sync engine More actions
// can distinguish between deleted and active notes and prevent
// deleted notes from being resynced from other devices
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
  updateNoteOrder: (orderedData: Note[] | string[]) => Promise<void>;
  togglePinned: (id: string) => Promise<void>
  clearNotes: () => Promise<void>
  loadNotes: () => Promise<void>
  toggleNoteSync: () => void
  hydrateFromSync: (syncedData: { notes?: Record<string, Note>; noteOrder?: string[] }) => void
  getActiveNotes: () => Note[] // NEW: Helper to get non-deleted notes
  cleanupOldDeletions: () => Promise<void> // NEW: Cleanup old tombstones
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
        let deletionsAppliedCount = 0;

        // Merge notes using timestamp-based conflict resolution
        const mergedNotes = { ...currentNotes };

        Object.entries(syncedData.notes).forEach(([noteId, incomingNote]) => {
          const existingNote = currentNotes[noteId];

          if (!existingNote) {
            // New note from sync (could be a creation or deletion)
            mergedNotes[noteId] = incomingNote;
            if (incomingNote.deletedAt) {
              deletionsAppliedCount++;
            } else {
              notesAddedCount++;
            }
          } else {
            // Existing note - use timestamp to resolve conflicts
            const incomingTimestamp = new Date(incomingNote.updatedAt).getTime();
            const existingTimestamp = new Date(existingNote.updatedAt).getTime();

            if (incomingTimestamp > existingTimestamp) {
              mergedNotes[noteId] = incomingNote;
              notesMergedCount++;

              // Track if this merge applied a deletion
              if (incomingNote.deletedAt && !existingNote.deletedAt) {
                deletionsAppliedCount++;
              }
            }
            // Otherwise keep local version (it's newer)
          }
        });

        // Filter active notes for order management
        const activeNotes = Object.values(mergedNotes).filter(note => !note.deletedAt);
        const activeNoteIds = new Set(activeNotes.map(note => note.id));

        // Merge note order - only include active (non-deleted) notes
        let mergedOrder = currentOrder.filter(id => activeNoteIds.has(id));
        if (syncedData.noteOrder) {
          const incomingActiveOrder = syncedData.noteOrder.filter(id => activeNoteIds.has(id));
          if (incomingActiveOrder.length > mergedOrder.length) {
            // Incoming order has more active notes, use it but add any local-only notes
            const incomingOrderSet = new Set(incomingActiveOrder);
            const localOnlyNotes = Array.from(activeNoteIds).filter(id => !incomingOrderSet.has(id));
            mergedOrder = [...localOnlyNotes, ...incomingActiveOrder];
          } else {
            // Keep local order but add any new active notes from sync to the beginning
            const localOrderSet = new Set(mergedOrder);
            const newActiveNotesFromSync = Array.from(activeNoteIds).filter(id => !localOrderSet.has(id));
            mergedOrder = [...newActiveNotesFromSync, ...mergedOrder];
          }
        }

        set({ 
          notes: mergedNotes,
          noteOrder: mergedOrder
        });

        // Save to local storage
        StorageUtils.set(NOTES_STORAGE_KEY, mergedNotes);
        StorageUtils.set(ORDER_STORAGE_KEY, mergedOrder);

        const activeCount = activeNotes.length;
        addSyncLog(`Notes hydrated: ${notesAddedCount} added, ${notesMergedCount} merged, ${deletionsAppliedCount} deletions applied. Active notes: ${activeCount}`, 'success');

        // Clean up old deletions periodically
        setTimeout(() => get().cleanupOldDeletions(), 1000);
      },

      loadNotes: async () => {
        if (get().isLoaded) return;
        try {
          const storedNotes = await StorageUtils.get<Record<string, Note>>(NOTES_STORAGE_KEY, {})
          const storedOrder = await StorageUtils.get<string[]>(ORDER_STORAGE_KEY, [])

          const safeNotes = storedNotes || {}
          const safeOrder = storedOrder || []

          // Filter out deleted notes from order and only include active notes
          const activeNotes = Object.values(safeNotes).filter(note => !note.deletedAt);
          const activeNoteIds = new Set(activeNotes.map(note => note.id));
          const validOrder = safeOrder.filter(id => activeNoteIds.has(id));
          const notesNotInOrder = Array.from(activeNoteIds).filter(id => !validOrder.includes(id));
          const finalOrder = [...notesNotInOrder, ...validOrder];

          set({
            notes: safeNotes,
            noteOrder: finalOrder,
            isLoaded: true
          })

          // Clean up old deletions on load
          setTimeout(() => get().cleanupOldDeletions(), 2000);
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
          // Don't set deletedAt for new notes
        }

        const currentNotes = get().notes
        const currentOrder = get().noteOrder
        const newNotes = { ...currentNotes, [newId]: newNote }
        const newOrder = [newId, ...currentOrder]

        await StorageUtils.set(NOTES_STORAGE_KEY, get().notes)
        await StorageUtils.set(ORDER_STORAGE_KEY, get().noteOrder)

        if (get().isSyncEnabled) {
          addSyncLog(`Note added locally: "${noteData.title || 'Untitled'}"`, 'info');
        }
      },

      updateNote: async (id, updates) => {
        const notes = get().notes
        if (notes[id] && !notes[id].deletedAt) { // Prevent updating deleted notes
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
        if (notes[id] && !notes[id].deletedAt) { // Only delete if not already deleted
          const noteTitle = notes[id].title || 'Untitled';
          const now = new Date().toISOString();

          // Mark as deleted instead of removing
          const deletedNote = {
            ...notes[id],
            deletedAt: now,
            updatedAt: now
          };

          const newNotes = { ...notes, [id]: deletedNote };
          const newOrder = order.filter(noteId => noteId !== id); // Remove from order

          await StorageUtils.set(NOTES_STORAGE_KEY, newNotes)
          await StorageUtils.set(ORDER_STORAGE_KEY, newOrder)

          set({ notes: newNotes, noteOrder: newOrder })

          if (get().isSyncEnabled) {
            addSyncLog(`Note deleted locally: "${noteTitle}"`, 'info');
          }
        }
      },

      updateNoteOrder: async (orderedData: Note[] | string[]) => {
        let newOrder: string[];

        if (typeof orderedData[0] === 'string') {
          // Array of IDs
          newOrder = orderedData as string[];
        } else {
          // Array of Note objects - only include active (non-deleted) notes in order
          const activeOrderedNotes = (orderedData as Note[]).filter(note => !note.deletedAt);
          newOrder = activeOrderedNotes.map(note => note.id);
        }

        set({ noteOrder: newOrder });

        StorageUtils.set(ORDER_STORAGE_KEY, newOrder).catch(error => {
          console.error('Error saving note order:', error);
        });
      },

      togglePinned: async (id) => {
        const notes = get().notes
        if (notes[id] && !notes[id].deletedAt) { // Only toggle if not deleted
          await get().updateNote(id, { isPinned: !notes[id].isPinned })
        }
      },

      clearNotes: async () => {
        // Mark all notes as deleted instead of removing them
        const notes = get().notes;
        const now = new Date().toISOString();
        const deletedNotes: Record<string, Note> = {};

        Object.entries(notes).forEach(([id, note]) => {
          deletedNotes[id] = {
            ...note,
            deletedAt: now,
            updatedAt: now
          };
        });

        await StorageUtils.set(NOTES_STORAGE_KEY, deletedNotes)
        await StorageUtils.set(ORDER_STORAGE_KEY, [])
        set({ notes: deletedNotes, noteOrder: [] })

        addSyncLog('All notes marked as deleted locally', 'info');
      },

      cleanupOldDeletions: async () => {
        const notes = get().notes;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let cleanedCount = 0;
        const cleanedNotes: Record<string, Note> = {};

        Object.entries(notes).forEach(([id, note]) => {
          if (note.deletedAt) {
            const deletedDate = new Date(note.deletedAt);
            if (deletedDate < thirtyDaysAgo) {
              // Skip this note (actually delete it after 30 days)
              cleanedCount++;
              return;
            }
          }
          cleanedNotes[id] = note;
        });

        if (cleanedCount > 0) {
          await StorageUtils.set(NOTES_STORAGE_KEY, cleanedNotes);
          set({ notes: cleanedNotes });
          addSyncLog(`Cleaned up ${cleanedCount} old deleted notes (>30 days)`, 'info');
        }
      },
    }),
    {
      name: 'note-sync-storage',
      storage: createPersistStorage<NoteStore>(),
    }
  )
);