// --- Note Service 2 ---
// This service was made to extract logic from the notes screen to make it more modular and easier to manage.
// It is used to handle the logic for the notes screen and the note list.
// It is also used to handle the logic for the note list item.

import { Dimensions, ViewStyle } from 'react-native';
import { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Note, Tag, Attachment } from '@/types/notes';
import type { NoteStore } from '@/store/NoteStore';
import { triggerHaptic, setupEditNote, isPointInTrashArea } from './noteService';

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

interface HandleDraggingArgs {
  draggingNoteId: string | null;
  isPendingDelete: boolean;
  lastDragPosition: React.MutableRefObject<{ x: number; y: number }>;
  isHoveringTrash: boolean;
  setIsHoveringTrash: (isHovering: boolean) => void;
}

export const handleDragging = ({
    draggingNoteId,
    isPendingDelete,
    lastDragPosition,
    isHoveringTrash,
    setIsHoveringTrash
    }: HandleDraggingArgs) => (evt: any) => {
    if (!draggingNoteId || isPendingDelete) return;
    
    lastDragPosition.current = {
        x: evt.nativeEvent.pageX,
        y: evt.nativeEvent.pageY
    };
  
  const isOverTrash = isPointInTrashArea(evt.nativeEvent.pageY);
  if (isOverTrash !== isHoveringTrash) {
    setIsHoveringTrash(isOverTrash);
    if (isOverTrash) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }
  }
};

interface HandleDragEndArgs {
  isHoveringTrash: boolean;
  draggingNoteId: string | null;
  preventReorder: React.MutableRefObject<boolean>;
  notes: Note[];
  lastDragPosition: React.MutableRefObject<{ x: number; y: number }>;
  setIsPendingDelete: (isPending: boolean) => void;
  setPendingDeleteNote: (note: Note | null) => void;
  setPendingDeletePosition: (position: { x: number; y: number }) => void;
  noteStore: NoteStore;
  setDraggingNoteId: (id: string | null) => void;
  isTrashVisible: SharedValue<boolean>;
  setIsHoveringTrash: (isHovering: boolean) => void;
  attemptDeleteNote: (args: any) => Promise<void>;
  selectedNote: Note | null;
  setIsModalOpen: (isOpen: boolean) => void;
  setSelectedNote: (note: Note | null) => void;
  noteToDeleteRef: React.MutableRefObject<string | null>;
  preventReorderRef: React.MutableRefObject<boolean>;
  originalIndexRef: React.MutableRefObject<number | null>;
  isTrashVisibleValue: SharedValue<boolean>;
  showToast: (message: string, type: string) => void;
}

export const handleDragEnd = ({
  isHoveringTrash,
  draggingNoteId,
  preventReorder,
  notes,
  lastDragPosition,
  setIsPendingDelete,
  setPendingDeleteNote,
  setPendingDeletePosition,
  noteStore,
  setDraggingNoteId,
  isTrashVisible,
  setIsHoveringTrash,
  attemptDeleteNote,
  selectedNote,
  setIsModalOpen,
  setSelectedNote,
  noteToDeleteRef,
  preventReorderRef,
  originalIndexRef,
  isTrashVisibleValue,
  showToast
}: HandleDragEndArgs) => ({ data, from, to }: { data: Note[]; from: number; to: number }) => {
  if (isHoveringTrash && draggingNoteId) {
    preventReorder.current = true;
    const noteToDelete = notes.find(note => note.id === draggingNoteId);
    if (noteToDelete) {
      setIsPendingDelete(true);
      setPendingDeleteNote(noteToDelete);
      setPendingDeletePosition({
        x: lastDragPosition.current.x,
        y: lastDragPosition.current.y
      });
      
      attemptDeleteNote({
        noteId: draggingNoteId,
        notes,
        noteStore,
        showToast,
        selectedNote,
        setIsModalOpen,
        setSelectedNote,
        setIsPendingDelete,
        setPendingDeleteNote,
        setDraggingNoteId,
        setIsHoveringTrash,
        noteToDeleteRef,
        preventReorderRef,
        originalIndexRef,
        isTrashVisibleValue
      });
    }
  } else if (!preventReorder.current) {
    noteStore.updateNoteOrder(data);

    setDraggingNoteId(null);
    isTrashVisible.value = false;
    setIsHoveringTrash(false);
    triggerHaptic();
  }
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
      opacity: withTiming(isTrashVisible.value ? 1 : 0, { duration: 300 }),
      transform: [
        { translateY: withTiming(isTrashVisible.value ? 0 : 100, { duration: 300 }) }
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