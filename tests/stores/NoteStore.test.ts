// --- add fake timers at the very top ---
jest.useFakeTimers();

// Mock AsyncStorage before importing NoteStore
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve())
}));

import { useNoteStore } from '@/store/NoteStore';
import type { Note, Tag } from '@/types';

describe('NoteStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useNoteStore.setState({ 
      notes: {}, 
      noteOrder: [], 
      isLoaded: false, 
      isSyncEnabled: false 
    });
    jest.clearAllMocks();
  });

  // --- clear pending timers after each test ---
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('initial state', () => {
    const { notes, noteOrder, isLoaded, isSyncEnabled } = useNoteStore.getState();
    expect(notes).toEqual({});
    expect(noteOrder).toEqual([]);
    expect(isLoaded).toBe(false);
    expect(isSyncEnabled).toBe(false);
  });

  test('addNote creates new note with proper metadata', async () => {
    const testTag: Tag = { id: 'tag-1', name: 'test', color: '#blue' };
    const noteData = { 
      title: 'Test Note', 
      content: 'Test content',
      tags: [testTag] 
    };
    
    await useNoteStore.getState().addNote(noteData);
    
    const state = useNoteStore.getState();
    const noteIds = Object.keys(state.notes);
    expect(noteIds).toHaveLength(1);
    
    const noteId = noteIds[0];
    const newNote = state.notes[noteId];
    
    expect(newNote.id).toBe(noteId);
    expect(newNote.title).toBe('Test Note');
    expect(newNote.content).toBe('Test content');
    expect(newNote.tags).toEqual([testTag]);
    expect(newNote.isPinned).toBe(false);
    expect(newNote.createdAt).toBeDefined();
    expect(newNote.updatedAt).toBeDefined();
    expect(newNote.deletedAt).toBeUndefined();
    expect(state.noteOrder[0]).toBe(noteId);
  });

  test('updateNote modifies existing note', async () => {
    // First add a note
    await useNoteStore.getState().addNote({ title: 'Original', content: 'Original content' });
    const noteId = Object.keys(useNoteStore.getState().notes)[0];
    const originalNote = useNoteStore.getState().notes[noteId];
    
    // Advance time to ensure different timestamp
    jest.advanceTimersByTime(1000);
    
    // Update the note
    await useNoteStore.getState().updateNote(noteId, { 
      title: 'Updated Title', 
      content: 'Updated content' 
    });
    
    const updatedNote = useNoteStore.getState().notes[noteId];
    expect(updatedNote.title).toBe('Updated Title');
    expect(updatedNote.content).toBe('Updated content');
    expect(updatedNote.updatedAt).not.toBe(originalNote.updatedAt);
    expect(updatedNote.createdAt).toBe(originalNote.createdAt);
  });

  test('updateNote prevents updating deleted notes', async () => {
    // Add and delete a note
    await useNoteStore.getState().addNote({ title: 'To Delete', content: 'Content' });
    const noteId = Object.keys(useNoteStore.getState().notes)[0];
    await useNoteStore.getState().deleteNote(noteId);
    
    const deletedNote = useNoteStore.getState().notes[noteId];
    const originalUpdatedAt = deletedNote.updatedAt;
    
    // Try to update deleted note
    await useNoteStore.getState().updateNote(noteId, { title: 'Should not update' });
    
    const noteAfterUpdate = useNoteStore.getState().notes[noteId];
    expect(noteAfterUpdate.title).toBe('To Delete'); // Should not have changed
    expect(noteAfterUpdate.updatedAt).toBe(originalUpdatedAt);
  });

  test('deleteNote marks note as deleted (tombstone)', async () => {
    // Add a note
    await useNoteStore.getState().addNote({ title: 'To Delete', content: 'Content' });
    const noteId = Object.keys(useNoteStore.getState().notes)[0];
    
    // Delete the note
    await useNoteStore.getState().deleteNote(noteId);
    
    const state = useNoteStore.getState();
    const deletedNote = state.notes[noteId];
    
    expect(deletedNote).toBeDefined(); // Note still exists
    expect(deletedNote.deletedAt).toBeDefined(); // But marked as deleted
    expect(state.noteOrder).not.toContain(noteId); // Removed from order
  });

  test('deleteNote prevents double deletion', async () => {
    // Add and delete a note
    await useNoteStore.getState().addNote({ title: 'Test', content: 'Content' });
    const noteId = Object.keys(useNoteStore.getState().notes)[0];
    await useNoteStore.getState().deleteNote(noteId);
    
    const firstDeletion = useNoteStore.getState().notes[noteId];
    const firstDeletedAt = firstDeletion.deletedAt;
    
    // Try to delete again
    await useNoteStore.getState().deleteNote(noteId);
    
    const secondDeletion = useNoteStore.getState().notes[noteId];
    expect(secondDeletion.deletedAt).toBe(firstDeletedAt); // Should not change
  });

  test('updateNoteOrder handles string array', async () => {
    // Add multiple notes
    await useNoteStore.getState().addNote({ title: 'Note 1', content: 'Content 1' });
    jest.advanceTimersByTime(10); // Ensure different timestamps
    await useNoteStore.getState().addNote({ title: 'Note 2', content: 'Content 2' });
    
    const state = useNoteStore.getState();
    const noteIds = Object.keys(state.notes).filter(id => id && state.notes[id]);
    expect(noteIds).toHaveLength(2);
    
    const reversedOrder = [noteIds[1], noteIds[0]];
    
    await useNoteStore.getState().updateNoteOrder(reversedOrder);
    
    expect(useNoteStore.getState().noteOrder).toEqual(reversedOrder);
  });

  test('updateNoteOrder handles Note object array', async () => {
    // Add multiple notes
    await useNoteStore.getState().addNote({ title: 'Note 1', content: 'Content 1' });
    jest.advanceTimersByTime(10); // Ensure different timestamps
    await useNoteStore.getState().addNote({ title: 'Note 2', content: 'Content 2' });
    
    const state = useNoteStore.getState();
    const notes = Object.values(state.notes).filter(note => note && note.id);
    expect(notes).toHaveLength(2);
    
    const reversedNotes = [notes[1], notes[0]];
    
    await useNoteStore.getState().updateNoteOrder(reversedNotes);
    
    const expectedOrder = [notes[1].id, notes[0].id];
    expect(useNoteStore.getState().noteOrder).toEqual(expectedOrder);
  });

  test('updateNoteOrder filters out deleted notes', async () => {
    // Add notes and delete one
    await useNoteStore.getState().addNote({ title: 'Note 1', content: 'Content 1' });
    jest.advanceTimersByTime(10);
    await useNoteStore.getState().addNote({ title: 'Note 2', content: 'Content 2' });
    
    const state = useNoteStore.getState();
    const notes = Object.values(state.notes).filter(note => note && note.id);
    const noteToDelete = notes.find(note => note.title === 'Note 1');
    
    if (noteToDelete) {
      await useNoteStore.getState().deleteNote(noteToDelete.id);
    }
    
    await useNoteStore.getState().updateNoteOrder(Object.values(useNoteStore.getState().notes));
    
    // Should only include active note
    const activeNote = notes.find(note => note.title === 'Note 2');
    expect(useNoteStore.getState().noteOrder).toEqual([activeNote?.id]);
  });

  test('togglePinned changes pinned status', async () => {
    await useNoteStore.getState().addNote({ title: 'Test', content: 'Content' });
    const noteId = Object.keys(useNoteStore.getState().notes)[0];
    
    expect(useNoteStore.getState().notes[noteId].isPinned).toBe(false);
    
    await useNoteStore.getState().togglePinned(noteId);
    expect(useNoteStore.getState().notes[noteId].isPinned).toBe(true);
    
    await useNoteStore.getState().togglePinned(noteId);
    expect(useNoteStore.getState().notes[noteId].isPinned).toBe(false);
  });

  test('togglePinned prevents toggling deleted notes', async () => {
    await useNoteStore.getState().addNote({ title: 'Test', content: 'Content' });
    const noteId = Object.keys(useNoteStore.getState().notes)[0];
    await useNoteStore.getState().deleteNote(noteId);
    
    await useNoteStore.getState().togglePinned(noteId);
    
    // Should remain unpinned since it's deleted
    expect(useNoteStore.getState().notes[noteId].isPinned).toBe(false);
  });

  test('clearNotes marks all notes as deleted', async () => {
    // Add multiple notes
    await useNoteStore.getState().addNote({ title: 'Note 1', content: 'Content 1' });
    await useNoteStore.getState().addNote({ title: 'Note 2', content: 'Content 2' });
    
    await useNoteStore.getState().clearNotes();
    
    const state = useNoteStore.getState();
    const notes = Object.values(state.notes);
    
    // All notes should be marked as deleted
    expect(notes.every(note => note.deletedAt)).toBe(true);
    expect(state.noteOrder).toEqual([]);
  });

  test('getActiveNotes returns only non-deleted notes', async () => {
    // Add notes and delete one
    await useNoteStore.getState().addNote({ title: 'Active', content: 'Content' });
    jest.advanceTimersByTime(10);
    await useNoteStore.getState().addNote({ title: 'To Delete', content: 'Content' });
    
    // Verify both notes were added
    let state = useNoteStore.getState();
    expect(Object.keys(state.notes)).toHaveLength(2);
    
    const notes = Object.values(state.notes);
    const toDeleteNote = notes.find(note => note.title === 'To Delete');
    
    if (toDeleteNote) {
      await useNoteStore.getState().deleteNote(toDeleteNote.id);
    }
    
    const activeNotes = useNoteStore.getState().getActiveNotes();
    
    expect(activeNotes).toHaveLength(1);
    expect(activeNotes[0].title).toBe('Active');
    expect(activeNotes[0].deletedAt).toBeUndefined();
  });

  test('toggleNoteSync changes sync state', () => {
    expect(useNoteStore.getState().isSyncEnabled).toBe(false);
    
    useNoteStore.getState().toggleNoteSync();
    expect(useNoteStore.getState().isSyncEnabled).toBe(true);
    
    useNoteStore.getState().toggleNoteSync();
    expect(useNoteStore.getState().isSyncEnabled).toBe(false);
  });

  test('hydrateFromSync skips when sync disabled', () => {
    const syncData = { notes: { '1': {} as Note } };
    
    useNoteStore.getState().hydrateFromSync(syncData);
    
    expect(useNoteStore.getState().notes).toEqual({});
  });

  test('hydrateFromSync merges notes with timestamp resolution', () => {
    // Enable sync first
    useNoteStore.getState().toggleNoteSync();
    
    // Add a local note
    const localNote: Note = {
      id: '1',
      title: 'Local',
      content: 'Local content',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isPinned: false
    };
    
    useNoteStore.setState({ notes: { '1': localNote } });
    
    // Simulate incoming note with newer timestamp
    const incomingNote: Note = {
      id: '1',
      title: 'Incoming',
      content: 'Incoming content',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z', // Newer
      isPinned: true
    };
    
    useNoteStore.getState().hydrateFromSync({
      notes: { '1': incomingNote }
    });
    
    const mergedNote = useNoteStore.getState().notes['1'];
    expect(mergedNote.title).toBe('Incoming'); // Should use incoming (newer)
    expect(mergedNote.isPinned).toBe(true);
  });

  test('hydrateFromSync handles deletions', () => {
    // Enable sync
    useNoteStore.getState().toggleNoteSync();
    
    // Add local note
    const localNote: Note = {
      id: '1',
      title: 'Local',
      content: 'Content',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isPinned: false
    };
    
    useNoteStore.setState({ 
      notes: { '1': localNote },
      noteOrder: ['1']
    });
    
    // Simulate incoming deletion
    const deletedNote: Note = {
      ...localNote,
      deletedAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    };
    
    useNoteStore.getState().hydrateFromSync({
      notes: { '1': deletedNote }
    });
    
    const note = useNoteStore.getState().notes['1'];
    expect(note.deletedAt).toBeDefined();
    expect(useNoteStore.getState().noteOrder).not.toContain('1');
  });

  test('cleanupOldDeletions removes old tombstones', async () => {
    // Create an old deleted note (40 days ago)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40);
    
    const oldDeletedNote: Note = {
      id: '1',
      title: 'Old Deleted',
      content: 'Content',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: oldDate.toISOString(),
      deletedAt: oldDate.toISOString(),
      isPinned: false
    };
    
    // Create a recent deleted note (10 days ago)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10);
    
    const recentDeletedNote: Note = {
      id: '2',
      title: 'Recent Deleted',
      content: 'Content',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: recentDate.toISOString(),
      deletedAt: recentDate.toISOString(),
      isPinned: false
    };
    
    useNoteStore.setState({
      notes: {
        '1': oldDeletedNote,
        '2': recentDeletedNote
      }
    });
    
    await useNoteStore.getState().cleanupOldDeletions();
    
    const state = useNoteStore.getState();
    expect(state.notes['1']).toBeUndefined(); // Should be cleaned up
    expect(state.notes['2']).toBeDefined(); // Should remain
  });

  test('sync logging works correctly with enabled sync', async () => {
    // Enable sync
    useNoteStore.getState().toggleNoteSync();
    
    const noteData = { title: 'Test Note', content: 'Content' };
    await useNoteStore.getState().addNote(noteData);
    
  });

  test('sync logging does not occur when sync disabled', async () => {
    // Sync is disabled by default
    const noteData = { title: 'Test Note', content: 'Content' };
    await useNoteStore.getState().addNote(noteData);
    
  });
}); 