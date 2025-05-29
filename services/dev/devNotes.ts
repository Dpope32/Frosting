import { Note } from "@/types";
import { NoteStore, ToastStore } from "@/store";

export const handleAddExampleNote = (
  note: Note,
  noteStore: NoteStore,
  showToast: ToastStore['showToast']
) => {
  const newNote = {
    ...note,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  noteStore.addNote(newNote);
  showToast(`Added example note: ${newNote.title}`, 'success');
};