import { useState, useCallback, useEffect } from 'react';
import { useNoteStore } from '@/store';
import type { Note, Attachment, Tag } from '@/types';

export const useNotes = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<Tag[]>([]);
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);

  // Get store actions and active notes
  const {
    noteOrder,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    updateNoteOrder,
    getActiveNotes,
  } = useNoteStore();

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Get ordered, active (non-deleted), non-archived notes
  const activeNotes = getActiveNotes();
  const orderedNotes = noteOrder
    .map(id => activeNotes.find(note => note.id === id))
    .filter((note): note is Note => Boolean(note))
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

    const handleReorderNotes = useCallback((newOrder: Note[]) => {
      const newOrderIds = newOrder.map(note => note.id);
      updateNoteOrder(newOrderIds);
    }, [updateNoteOrder]);

  // This is the corrected function that passes IDs, not full objects.
  const updateNotes = useCallback((newNotes: Note[]) => {
    const newOrderIds = newNotes.map(note => note.id);
    useNoteStore.getState().updateNoteOrder(newOrderIds);
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
    handleSaveNote,
    handleDeleteNote,
    setEditTitle,
    setEditContent,
    handleTagsChange,
    handleAddAttachment,
    handleRemoveAttachment,
    handleReorderNotes,
    updateNotes,
  };
};