import { generateTestNotes } from '@/constants';
import { Note } from '@/types';

export interface ExampleNotesManagerProps {
  onSelectNote: (note: Note) => void;
}

export const useExampleNotes = () => {
  const allNotes = generateTestNotes();
  const exampleNotes = allNotes.filter((_, index) => index !== 1);
  return {
    exampleNotes,
  };
};

export const getExampleNoteTitle = (index: number): string => {
  const titles = [
    "Simple Note",
    "Todo List", 
    "Markdown",
    "Meeting Notes",
    "Multi-Image",
    "Single Image"
  ];
  
  return titles[index] || `Note ${index + 1}`;
}; 