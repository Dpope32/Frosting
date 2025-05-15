import React from 'react';
import { Button } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import { setupAddNote } from '@/services';

interface AddNoteButtonProps {
  insets: { bottom: number };
  preferences: { primaryColor: string };
  draggingNoteId: string | null;
  isPendingDelete: boolean;
  setSelectedNote: (note: any) => void;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  setEditTags: (tags: any[]) => void;
  setEditAttachments: (attachments: any[]) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const AddNoteButton: React.FC<AddNoteButtonProps> = ({
  insets,
  preferences,
  draggingNoteId,
  isPendingDelete,
  setSelectedNote,
  setEditTitle,
  setEditContent,
  setEditTags,
  setEditAttachments,
  setIsModalOpen
}) => {
  if (draggingNoteId || isPendingDelete) return null;

  return (
    <Button
      size="$4"
      circular
      position="absolute"
      bottom={insets.bottom + 20}
      right={24}
      onPress={() => setupAddNote({
        setSelectedNote,
        setEditTitle,
        setEditContent,
        setEditTags,
        setEditAttachments,
        setIsModalOpen
      })}
      backgroundColor={preferences.primaryColor}
      pressStyle={{ scale: 0.95 }}
      animation="quick"
      elevation={4}
      icon={<Plus size={24} color="white" />}
    />
  );
}; 