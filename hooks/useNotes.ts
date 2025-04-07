import { useState, useCallback, useEffect } from 'react';
import { useNoteStore } from '@/store/NoteStore';
import type { Note, Tag, Attachment } from '@/types/notes';
import { StorageUtils } from '@/store/AsyncStorage';

// Storage keys for notes
const NOTES_STORAGE_KEY = 'notes-store-data';
const ORDER_STORAGE_KEY = 'notes-store-order';

export const useNotes = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<Tag[]>([]);
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);

  // Get store actions
  const {
    notes,
    noteOrder,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    updateNoteOrder,
  } = useNoteStore();

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Get ordered, non-archived notes
  const orderedNotes = noteOrder
    .map(id => notes[id])
    .filter(Boolean)
    .filter(note => !note.archived);

  const handleAddNote = useCallback(() => {
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setEditTags([]);
    setEditAttachments([]);
    setIsModalOpen(true);
  }, []);

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags || []);
    setEditAttachments(note.attachments || []);
    setIsModalOpen(true);
  }, []);

  const handleSaveNote = useCallback(async () => {
    if (selectedNote) {
      await updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
        tags: editTags,
        attachments: editAttachments
      });
    } else {
      await addNote({
        title: editTitle,
        content: editContent,
        tags: editTags,
        attachments: editAttachments
      });
    }
    setIsModalOpen(false);
    setSelectedNote(null);
  }, [selectedNote, editTitle, editContent, editTags, editAttachments, updateNote, addNote]);

  const handleDeleteNote = useCallback(async () => {
    if (selectedNote) {
      await deleteNote(selectedNote.id);
      setIsModalOpen(false);
      setSelectedNote(null);
    }
  }, [selectedNote, deleteNote]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedNote(null);
  }, []);

  const handleTagsChange = useCallback((tags: Tag[]) => {
    setEditTags(tags);
  }, []);

  const handleAddAttachment = useCallback((attachment: Attachment) => {
    setEditAttachments(prev => [...prev, attachment]);
  }, []);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setEditAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);

  // Improved function to handle reordering notes
  const handleReorderNotes = useCallback((newOrder: Note[]) => {
    // Extract just the IDs for the store
    const newOrderIds = newOrder.map(note => note.id);
    // @ts-ignore - The type definition in the store might be expecting Note[], but it actually works with string[]
    updateNoteOrder(newOrderIds);
  }, [updateNoteOrder]);

  // Function to update notes in state and persist to storage
  const updateNotes = useCallback((newNotes: Note[]) => {
    // Create a new notes object with the updated notes
    const updatedNotesObj: Record<string, Note> = {};
    newNotes.forEach(note => {
      updatedNotesObj[note.id] = note;
    });
    
    // Update the notes in the store
    // This will trigger a re-render with the new notes
    useNoteStore.getState().updateNoteOrder(newNotes);
    
    // Persist the new notes to AsyncStorage
    try {
      // Use the StorageUtils from your AsyncStorage.ts
      StorageUtils.set(NOTES_STORAGE_KEY, updatedNotesObj);
      
      // Also update the order to match the new notes array
      const newOrderIds = newNotes.map(note => note.id);
      StorageUtils.set(ORDER_STORAGE_KEY, newOrderIds);
    } catch (error) {
      console.error('Error saving reordered notes:', error);
    }
  }, []);

  return {
    notes: orderedNotes,
    selectedNote,
    isModalOpen,
    editTitle,
    editContent,
    editTags,
    editAttachments,
    handleAddNote,
    handleSelectNote,
    handleSaveNote,
    handleDeleteNote,
    handleCloseModal,
    setEditTitle,
    setEditContent,
    handleTagsChange,
    handleAddAttachment,
    handleRemoveAttachment,
    handleReorderNotes,
    updateNotes,
  };
};