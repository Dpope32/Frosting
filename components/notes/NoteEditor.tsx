import React from 'react';
import { AddNoteSheet } from '@/components/cardModals/creates/AddNoteSheet';
import { saveNote, attemptDeleteNote, handleImagePick as serviceHandleImagePick } from '@/services';
import type { Note, Attachment, Tag } from '@/types';
import type { NoteStore } from '@/store';
import type { SharedValue } from 'react-native-reanimated';
import type { ToastType, ToastOptions } from '@/store';

interface NoteEditorProps {
  isModalOpen: boolean;
  selectedNote: Note | null;
  editTitle: string;
  editContent: string;
  editTags: Tag[];
  editAttachments: Attachment[];
  notes: Note[];
  noteStore: NoteStore;
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => string;
  isPendingDelete: boolean;
  isTrashVisible: SharedValue<boolean>;
  noteToDeleteRef: React.MutableRefObject<string | null>;
  preventReorder: React.MutableRefObject<boolean>;
  originalIndexRef: React.MutableRefObject<number | null>;
  setIsModalOpen: (isOpen: boolean) => void;
  setSelectedNote: (note: Note | null) => void;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  setEditTags: (tags: Tag[]) => void;
  setEditAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  setDraggingNoteId: (id: string | null) => void;
  setIsHoveringTrash: (isHovering: boolean) => void;
  setIsPendingDelete: (isPending: boolean) => void;
  setPendingDeleteNote: (note: Note | null) => void;
  handleTagsChange: (tags: Tag[]) => void;
  handleRemoveAttachment: (attachmentId: string) => void;
  handleBold: () => void;
  handleUnderline: () => void;
  handleCode: () => void;
  handleItalic: () => void;
  handleBullet: () => void;
  pickImage: () => Promise<string | null>;
  isImagePickerLoading: boolean;
  onSelectionChange: (event: any) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  isModalOpen,
  selectedNote,
  editTitle,
  editContent,
  editTags,
  editAttachments,
  notes,
  noteStore,
  showToast,
  isTrashVisible,
  noteToDeleteRef,
  preventReorder,
  originalIndexRef,
  setIsModalOpen,
  setSelectedNote,
  setEditTitle,
  setEditContent,
  setEditAttachments,
  setDraggingNoteId,
  setIsHoveringTrash,
  setIsPendingDelete,
  setPendingDeleteNote,
  handleTagsChange,
  handleRemoveAttachment,
  handleBold,
  handleUnderline,
  handleCode,
  handleItalic,
  handleBullet,
  pickImage,
  isImagePickerLoading,
  onSelectionChange
}) => {
  return (
    <AddNoteSheet
      isModalOpen={isModalOpen}
      selectedNote={selectedNote}
      editTitle={editTitle}
      editContent={editContent}
      editTags={editTags}
      editAttachments={editAttachments}
      handleCloseModal={() => {
        setIsModalOpen(false);
        setSelectedNote(null);
      }}
      setEditTitle={setEditTitle}
      setEditContent={setEditContent}
      handleTagsChange={handleTagsChange}
      handleSaveNote={() => saveNote({
        selectedNote,
        editTitle,
        editContent,
        editTags,
        editAttachments,
        noteStore,
        showToast,
        setIsModalOpen,
        setSelectedNote
      })}
      handleDeleteNote={() => {
        if (selectedNote) {
          attemptDeleteNote({
            noteId: selectedNote.id,
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
            preventReorderRef: preventReorder,
            originalIndexRef,
            isTrashVisibleValue: isTrashVisible
          });
        }
      }}
      handleRemoveAttachment={handleRemoveAttachment}
      handleBold={handleBold}
      handleUnderline={handleUnderline}
      handleCode={handleCode}
      handleItalic={handleItalic}
      handleBullet={handleBullet}
      handleImagePick={() => serviceHandleImagePick({
        pickImage,
        isImagePickerLoading,
        editAttachments,
        handleAddAttachment: (attachment: Attachment) => {
          setEditAttachments((prev: Attachment[]) => [...prev, attachment]);
        }
      })}
      onSelectionChange={onSelectionChange}
    />
  );
}; 