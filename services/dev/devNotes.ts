import { Note } from "@/types";
import { useNoteStore, useToastStore } from "@/store";

export const handleAddExampleNote = (note: Note) => {
  const noteStore = useNoteStore();
  const showToast = useToastStore(state => state.showToast);
    const newNote = {
      ...note,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    noteStore.addNote(newNote);
    showToast(`Added example note: ${newNote.title}`, 'success');
  };