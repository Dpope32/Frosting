// --- Note Service 2 ---
// This service was made to extract logic from the notes screen to make it more modular and easier to manage.
// It is used to handle the logic for the notes screen and the note list.
// It is also used to handle the logic for the note list item.

import { Dimensions, ViewStyle } from 'react-native';
import { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import type { Note, Attachment, Tag } from '@/types';
import type { NoteStore } from '@/store';
import { setupEditNote } from './noteService';

export const calculateColumns = (screenWidth: number): number => {
  if (screenWidth > 1200) {
    return 3;
  } else if (screenWidth > 768) {
    return 2;
  } else {
    return 1;
  }
};

export const setupColumnCalculation = (
  isWeb: boolean,
  setNumColumns: (columns: number) => void
): (() => void) | undefined => {
  if (isWeb) {
    const calculateColumnsHandler = () => {
      const screenWidth = window.innerWidth;
      setNumColumns(calculateColumns(screenWidth));
    };
    calculateColumnsHandler();
    window.addEventListener('resize', calculateColumnsHandler);
    return () => window.removeEventListener('resize', calculateColumnsHandler);
  } else {
    setNumColumns(1);
    return undefined;
  }
};

export const createFormattingHandler = (
  formatter: (args: { content: string; selection: { start: number; end: number } }) => string,
  selection: { start: number; end: number },
  setEditContent: (content: string | ((prevContent: string) => string)) => void
) => {
  return () => {
    setEditContent((prevContent: string) => formatter({ content: prevContent, selection }));
  };
};


export interface NoteRenderData {
  note: Note;
  isActive: boolean;
  itemIndex: number;
  isPendingDelete: boolean;
  pendingDeleteNote: Note | null;
}

export const getNoteRenderData = (
  item: Note,
  isActive: boolean,
  notes: Note[],
  isPendingDelete: boolean,
  pendingDeleteNote: Note | null
): NoteRenderData | null => {
  if (isPendingDelete && pendingDeleteNote && pendingDeleteNote.id === item.id) {
    return null;
  }
  const itemIndex = notes.findIndex(note => note.id === item.id);
  return {
    note: item,
    isActive,
    itemIndex,
    isPendingDelete,
    pendingDeleteNote
  };
};

export const createTrashAnimatedStyle = (isTrashVisible: SharedValue<boolean>) => {
  return useAnimatedStyle(() => {
    return {
      opacity: withTiming(isTrashVisible.value ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(isTrashVisible.value ? 0 : 100, { duration: 200 }) }
      ]
    };
  });
};

export const getGhostNoteStyle = (): ViewStyle => {
  return {
    position: 'absolute',
    top: Dimensions.get('window').height - 160,
    left: 20,
    right: 20,
    zIndex: 9999,
    opacity: 0.9
  };
};

interface MoveNoteArgs {
  dragIndex: number;
  hoverIndex: number;
  notes: Note[];
  noteStore: NoteStore;
}

export const handleMoveNote = ({ dragIndex, hoverIndex, notes, noteStore }: MoveNoteArgs) => {
  const updatedNotes = [...notes];
  const [draggedItem] = updatedNotes.splice(dragIndex, 1);
  updatedNotes.splice(hoverIndex, 0, draggedItem);
  const reorderedNotes = updatedNotes.map((note, index) => ({
    ...note, order: index
  }));
  noteStore.updateNoteOrder(reorderedNotes);
};

interface SelectNoteArgs {
  note: Note;
  setSelectedNote: (note: Note | null) => void;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  setEditTags: (tags: Tag[]) => void;
  setEditAttachments: (attachments: Attachment[]) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const handleSelectNote = ({
  note,
  setSelectedNote,
  setEditTitle,
  setEditContent,
  setEditTags,
  setEditAttachments,
  setIsModalOpen
}: SelectNoteArgs) => {
  setupEditNote({
    note,
    setSelectedNote,
    setEditTitle,
    setEditContent,
    setEditTags,
    setEditAttachments,
    setIsModalOpen
  });
};