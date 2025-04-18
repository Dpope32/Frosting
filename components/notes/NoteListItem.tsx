import React from 'react';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { NoteCard } from './NoteCard';
import * as Haptics from 'expo-haptics';
import type { Note } from '@/types/notes';
import { handleSelectNote } from '@/services/noteService2';

interface NoteListItemProps {
  item: Note;
  drag: () => void;
  isActive: boolean;
  notes: Note[];
  isPendingDelete: boolean;
  pendingDeleteNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  setEditTags: (tags: any[]) => void;
  setEditAttachments: (attachments: any[]) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setDraggingNoteId: (id: string | null) => void;
  originalIndexRef: React.MutableRefObject<number | null>;
  preventReorder: React.MutableRefObject<boolean>;
  isTrashVisible: { value: boolean };
}

export const NoteListItem: React.FC<NoteListItemProps> = ({
  item,
  drag,
  isActive,
  notes,
  isPendingDelete,
  pendingDeleteNote,
  setSelectedNote,
  setEditTitle,
  setEditContent,
  setEditTags,
  setEditAttachments,
  setIsModalOpen,
  setDraggingNoteId,
  originalIndexRef,
  preventReorder,
  isTrashVisible
}) => {
  const renderData = {
    note: item,
    isActive,
    itemIndex: notes.findIndex(note => note.id === item.id),
    isPendingDelete,
    pendingDeleteNote
  };

  if (!renderData) return null;

  return (
    <ScaleDecorator>
      <NoteCard
        note={renderData.note}
        onPress={() => {}}
        isDragging={renderData.isActive}
        onEdit={() => handleSelectNote({
          note: renderData.note,
          setSelectedNote,
          setEditTitle,
          setEditContent,
          setEditTags,
          setEditAttachments,
          setIsModalOpen
        })}
        drag={() => {
          if (isPendingDelete) return;

          setDraggingNoteId(renderData.note.id);
          originalIndexRef.current = renderData.itemIndex;
          preventReorder.current = false;
          isTrashVisible.value = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          drag();
        }}
      />
    </ScaleDecorator>
  );
}; 