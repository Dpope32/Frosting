import React from 'react';
import { generateTestNotes } from '@/constants/devNotes';
import { Note } from '@/types/notes';

export interface ExampleNotesManagerProps {
  onSelectNote: (note: Note) => void;
}

export const useExampleNotes = () => {
  // Get all notes from the dev notes file
  const allNotes = generateTestNotes();
  
  // Filter out the medium note (index 1)
  const exampleNotes = allNotes.filter((_, index) => index !== 1);
  
  return {
    exampleNotes,
  };
};

export const getExampleNoteTitle = (index: number): string => {
  const titles = [
    "Simple Note",
    "Markdown",
    "Multi-Image",
    "Single Image"
  ];
  
  return titles[index];
}; 