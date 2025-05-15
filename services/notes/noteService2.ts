// --- Note Service 2 ---
// This service was made to extract logic from the notes screen to make it more modular and easier to manage.
// It is used to handle the logic for the notes screen and the note list.
// It is also used to handle the logic for the note list item.

import { Dimensions, ViewStyle } from 'react-native';
import { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import type { Note, Attachment } from '@/types/notes';
import type { Tag } from '@/types/tag';
import type { NoteStore } from '@/store/NoteStore';
import { triggerHaptic, setupEditNote } from './noteService';
import { isIpad } from '@/utils/deviceUtils';
import { GestureResponderEvent } from 'react-native';
import React from 'react';

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
  lastDragPosition: React.MutableRefObject<{ x: number; y: number }>;
  isHoveringTrash: boolean;
  setIsHoveringTrash: (isHovering: boolean) => void;
  isTrashVisible: SharedValue<boolean>;
  draggingNoteId: string | null;
  isPendingDelete: boolean;
  thresholdRef: React.MutableRefObject<number>;
}

export const handleDragging = ({
  isHoveringTrash,
  lastDragPosition,
  setIsHoveringTrash,
  isTrashVisible,
  draggingNoteId,
  isPendingDelete,
  thresholdRef,
}: HandleDraggingArgs) => (event: GestureResponderEvent) => {
  // Only proceed if a note is currently being dragged
  if (!draggingNoteId || isPendingDelete) return;
  const { pageY } = event.nativeEvent;

  // Ensure we capture the position even if we don't trigger other effects
  lastDragPosition.current = {
    x: event.nativeEvent.pageX,
    y: pageY
  };
  
  // Calculate buffer threshold so card bottom touching counts as in-trash
  const threshold = thresholdRef.current;
  // Ensure we have a valid threshold before proceeding
  if (!threshold || threshold <= 0) {
    console.warn('Invalid threshold value:', threshold);
    return;
  }

  // Determine if the touch point is within the trash area
  const touchInTrashArea = pageY > threshold;
  console.log('handleDragging threshold check:', { threshold, pageY, touchInTrashArea });
  
  // Only trigger haptic feedback when crossing the trash area boundary
  if (touchInTrashArea !== isHoveringTrash) {
    try {
      triggerHaptic();
      setIsHoveringTrash(touchInTrashArea);
      if (isTrashVisible && typeof isTrashVisible.value !== 'undefined') {
        isTrashVisible.value = touchInTrashArea;
      } else {
        console.warn("isTrashVisible is undefined or doesn't have a value property");
      }
    } catch (error) {
      console.error("Error updating trash hover state:", error);
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
  thresholdRef: React.MutableRefObject<number>;
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
  thresholdRef,
  showToast
}: HandleDragEndArgs) => ({ data, from, to }: { data: Note[]; from: number; to: number }) => {
  // Safety check - ensure we aren't already processing a delete
  if (preventReorder.current === true || !draggingNoteId) {
    setDraggingNoteId(null);
    isTrashVisible.value = false;
    setIsHoveringTrash(false);
    return;
  }
  
  try {
  // Buffer threshold strike: bottom of card touching area counts
  const threshold = thresholdRef.current;
  // Make sure we have a valid threshold
  if (!threshold || threshold <= 0) {
    console.warn('Invalid threshold value in drag end:', threshold);
    noteStore.updateNoteOrder(data);
    setDraggingNoteId(null);
    isTrashVisible.value = false;
    setIsHoveringTrash(false);
    return;
  }
  
  // Determine if the last drag position is within the trash area
  const lastY = lastDragPosition.current.y;
  const isOverTrash = lastY > threshold;
  console.log('handleDragEnd threshold check:', { threshold, lastY, isHoveringTrash, isOverTrash, draggingNoteId });
    
    // If the note is in the trash area or was hovering over it, attempt to delete it
    if ((isHoveringTrash || isOverTrash) && draggingNoteId) {
      preventReorder.current = true;
      const noteToDelete = notes.find(note => note.id === draggingNoteId);
      if (noteToDelete) {
        setIsPendingDelete(true);
        setPendingDeleteNote(noteToDelete);
        setPendingDeletePosition({
          x: lastDragPosition.current.x,
          y: lastDragPosition.current.y
        });
        
        // Store the note ID to delete in the ref to ensure it's available during the delete process
        noteToDeleteRef.current = draggingNoteId;
        
        // Call attemptDeleteNote with the correct parameters
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
        }).catch(error => {
          console.error("Error attempting to delete note:", error);
          // Reset states on error
          setIsPendingDelete(false);
          setPendingDeleteNote(null);
          setDraggingNoteId(null);
          isTrashVisible.value = false;
          setIsHoveringTrash(false);
        });
      } else {
        console.log("Note not found:", draggingNoteId);
        setIsPendingDelete(false);
        setDraggingNoteId(null);
        isTrashVisible.value = false;
        setIsHoveringTrash(false);
      }
    } else if (!preventReorder.current) {
      // If not in trash area, update the note order
      noteStore.updateNoteOrder(data);
    }
  } catch (error) {
    console.error("Error in handleDragEnd:", error);
    // Ensure states are reset even on error
    setIsPendingDelete(false);
    setDraggingNoteId(null);
    isTrashVisible.value = false;
    setIsHoveringTrash(false);
  }

  // Always clean up these states, wrapped in try/catch for safety
  try {
    setDraggingNoteId(null);
    isTrashVisible.value = false;
    setIsHoveringTrash(false);
    triggerHaptic();
  } catch (error) {
    console.error("Error cleaning up drag end states:", error);
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
