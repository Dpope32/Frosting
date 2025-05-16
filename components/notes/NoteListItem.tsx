import React, { useRef, useEffect } from 'react';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { NoteCard } from './NoteCard';
import * as Haptics from 'expo-haptics';
import type { Note } from '@/types';
import { handleSelectNote } from '@/services';
import { View } from 'react-native';
import { draggedCardBottomYRef } from '../../app/(drawer)/notes';

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
  setCardRef?: (ref: any) => void;
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
  isTrashVisible,
  setCardRef
}) => {
  const cardRef = useRef<View>(null);
  useEffect(() => {
    if (isActive && cardRef.current) {
      // Wait a tick for layout to settle
      setTimeout(() => {
        cardRef.current?.measureInWindow((x, y, width, height) => {
          const bottomY = y + height;
          console.log('[NOTE DRAG] NoteCard bottomY:', bottomY, 'y:', y, 'height:', height);
          if (draggedCardBottomYRef) draggedCardBottomYRef.current = bottomY;
        });
      }, 16);
    }
  }, [isActive]);

  useEffect(() => {
    if (setCardRef) {
      setCardRef(cardRef.current);
    }
  }, [cardRef.current, setCardRef]);

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
      <View ref={node => {
        // Only set if node is not null
        if (node) {
          (cardRef as any).current = node;
          if (setCardRef) setCardRef(node);
        }
      }} collapsable={false}>
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
      </View>
    </ScaleDecorator>
  );
}; 