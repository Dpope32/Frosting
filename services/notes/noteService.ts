import { generateTestNotes } from "@/constants";
import { Dimensions, Platform, Alert } from "react-native";
import { NoteStore, ToastStore } from "@/store";
import * as Haptics from "expo-haptics";
import type { Note, Attachment, Tag } from '@/types';
import type { SharedValue } from "react-native-reanimated"; 
import { isIpad } from '@/utils';

export const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
};

export const generateNoteId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const addTestNotesInternal = async (noteStore: NoteStore) => { 
  const testNotes = generateTestNotes();
  for (let i = 0; i < testNotes.length; i++) {
    const note = testNotes[i];
    await noteStore.addNote({
      title: note.title,
      content: note.content,
      tags: note.tags,
      attachments: note.attachments
    });
     if (i < testNotes.length - 1) {
     await new Promise(resolve => setTimeout(resolve, 300));
      }
  }
};


export const handleAddTestNotes = async (noteStore: NoteStore, showToast: ToastStore['showToast']) => {
  triggerHaptic();
  await addTestNotesInternal(noteStore);
  showToast('Test notes added', 'success');
};

interface FormatArgs {
  content: string;
  selection: { start: number; end: number };
}

export const formatBold = ({ content, selection }: FormatArgs): string => {
  if (selection.start === selection.end) return content;
  const before = content.substring(0, selection.start);
  const selected = content.substring(selection.start, selection.end);
  const after = content.substring(selection.end);
  return `${before}**${selected}**${after}`;
};

export const formatItalic = ({ content, selection }: FormatArgs): string => {
  if (selection.start === selection.end) return content;
  const before = content.substring(0, selection.start);
  const selected = content.substring(selection.start, selection.end);
  const after = content.substring(selection.end);
  return `${before}*${selected}*${after}`;
};

export const formatUnderline = ({ content, selection }: FormatArgs): string => {
    if (selection.start === selection.end) return content;
    const before = content.substring(0, selection.start);
    const selected = content.substring(selection.start, selection.end);
    const after = content.substring(selection.end);
    return `${before}__${selected}__${after}`;
};

export const formatCode = ({ content, selection }: FormatArgs): string => {
    if (selection.start === selection.end) return content;
    const before = content.substring(0, selection.start);
    const selected = content.substring(selection.start, selection.end);
    const after = content.substring(selection.end);
    return `${before}\`${selected}\`${after}`;
};

export const formatBullet = ({ content, selection }: FormatArgs): string => {
  const before = content.substring(0, selection.start);
  const after = content.substring(selection.start);
  if (before.endsWith('\n') || before === '') {
    return `${before}- ${after}`;
  } else {
    return `${before}\n- ${after}`;
  }
};

interface SetupEditArgs {
    note: Note;
    setSelectedNote: (note: Note | null) => void;
    setEditTitle: (title: string) => void;
    setEditContent: (content: string) => void;
    setEditTags: (tags: Tag[]) => void;
    setEditAttachments: (attachments: Attachment[]) => void;
    setIsModalOpen: (isOpen: boolean) => void;
}

export const setupEditNote = ({
    note,
    setSelectedNote,
    setEditTitle,
    setEditContent,
    setEditTags,
    setEditAttachments,
    setIsModalOpen
}: SetupEditArgs) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedNote(note);
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
    // Filter out null/undefined values to prevent iOS crashes
    setEditTags((note.tags || []).filter(tag => tag != null));
    setEditAttachments((note.attachments || []).filter(attachment => attachment != null));
    setIsModalOpen(true);
};

interface SetupAddArgs {
    setSelectedNote: (note: Note | null) => void;
    setEditTitle: (title: string) => void;
    setEditContent: (content: string) => void;
    setEditTags: (tags: Tag[]) => void;
    setEditAttachments: (attachments: Attachment[]) => void;
    setIsModalOpen: (isOpen: boolean) => void;
}

export const setupAddNote = ({
    setSelectedNote,
    setEditTitle,
    setEditContent,
    setEditTags,
    setEditAttachments,
    setIsModalOpen
}: SetupAddArgs) => {
    triggerHaptic();
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setEditTags([]);
    setEditAttachments([]);
    setIsModalOpen(true);
};


interface SaveNoteArgs {
    selectedNote: Note | null;
    editTitle: string;
    editContent: string;
    editTags: Tag[];
    editAttachments: Attachment[];
    noteStore: NoteStore; 
    showToast: ToastStore['showToast']; 
    setIsModalOpen: (isOpen: boolean) => void;
    setSelectedNote: (note: Note | null) => void;
}

export const saveNote = async ({
    selectedNote,
    editTitle,
    editContent,
    editTags,
    editAttachments,
    noteStore,
    showToast,
    setIsModalOpen,
    setSelectedNote
}: SaveNoteArgs) => {
    triggerHaptic();
    const isUpdating = !!selectedNote;

    if (selectedNote) {
      await noteStore.updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
        tags: editTags,
        attachments: editAttachments
      });
    } else {
      await noteStore.addNote({
        title: editTitle,
        content: editContent,
        tags: editTags,
        attachments: editAttachments
      });
    }

    setIsModalOpen(false);
    setSelectedNote(null);

    showToast(isUpdating ? 'Note updated successfully' : 'Note created successfully', 'success');
};

interface AttemptDeleteArgs {
    noteId: string;
    notes: Note[]; 
    noteStore: NoteStore; 
    showToast: ToastStore['showToast']; 
    selectedNote: Note | null; 
    setIsModalOpen: (isOpen: boolean) => void;
    setSelectedNote: (note: Note | null) => void;
    setIsPendingDelete: (isPending: boolean) => void;
    setPendingDeleteNote: (note: Note | null) => void;
    setDraggingNoteId: (id: string | null) => void;
    setIsHoveringTrash: (isHovering: boolean) => void;
    noteToDeleteRef: React.MutableRefObject<string | null>;
    preventReorderRef: React.MutableRefObject<boolean>;
    originalIndexRef: React.MutableRefObject<number | null>;
    isTrashVisibleValue: SharedValue<boolean>;
}

export const attemptDeleteNote = async ({
    noteId,
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
}: AttemptDeleteArgs) => {
    
    // Immediate state updates to prevent UI freezing
    // Set these flags right away to prevent further interaction
    preventReorderRef.current = true;
    
    // Find the note to delete
    const noteToDelete = notes.find(n => n.id === noteId);
    if (!noteToDelete) {
      console.warn("Attempted to delete a note that wasn't found:", noteId);
      // Clean up even if note not found
      setTimeout(() => {
        setIsPendingDelete(false);
        setPendingDeleteNote(null);
        setDraggingNoteId(null);
        if (isTrashVisibleValue) isTrashVisibleValue.value = false;
        setIsHoveringTrash(false);
        if (noteToDeleteRef) noteToDeleteRef.current = null;
        preventReorderRef.current = false;
        if (originalIndexRef) originalIndexRef.current = null;
      }, 100);
      return;
    }
    
    // Provide haptic feedback
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Use a timeout to ensure the UI has time to update before showing the confirmation dialog
    // Increased timeout for iPad which may need more time to render large note cards
    setTimeout(async () => {
      try {
        const confirmDelete = Platform.OS === 'web'
            ? window.confirm(`Are you sure you want to delete "${noteToDelete.title || 'Untitled Note'}"?`)
            : await new Promise<boolean>((resolve) => {
                Alert.alert(
                  'Delete Note',
                  `Are you sure you want to delete "${noteToDelete.title || 'Untitled Note'}"?`,
                  [
                    { 
                      text: 'Cancel', 
                      style: 'cancel', 
                      onPress: () => {
                        resolve(false);
                      } 
                    },
                    { 
                      text: 'Delete', 
                      style: 'destructive', 
                      onPress: () => {
                        resolve(true);
                      } 
                    },
                  ],
                  { cancelable: true, onDismiss: () => resolve(false) }
                );
              });

        
        if (confirmDelete) {
            await noteStore.deleteNote(noteId);
            if (selectedNote?.id === noteId) {
                setIsModalOpen(false);
                setSelectedNote(null);
            }
            showToast('Note deleted', 'success');
        } else {
            // If user cancels deletion, restore the note to its original position
            if (originalIndexRef.current !== null) {
                const updatedNotes = [...notes];
                const noteIndex = updatedNotes.findIndex(n => n.id === noteId);

                if (noteIndex !== -1 && noteIndex !== originalIndexRef.current) {
                    const [movedNote] = updatedNotes.splice(noteIndex, 1);
                    updatedNotes.splice(originalIndexRef.current, 0, movedNote);
                    const reorderedNotes = updatedNotes.map((note, index) => ({
                        ...note,
                        order: index
                    }));
                    noteStore.updateNoteOrder(reorderedNotes);
                }
            }
        }
      } catch (error) {
        console.error("Error in delete confirmation:", error);
        showToast('Failed to delete note', 'error');
      } finally {
        setIsPendingDelete(false);
        setPendingDeleteNote(null);
        setDraggingNoteId(null);
        if (isTrashVisibleValue) isTrashVisibleValue.value = false;
        setIsHoveringTrash(false);
        if (noteToDeleteRef) noteToDeleteRef.current = null;
        preventReorderRef.current = false;
        if (originalIndexRef) originalIndexRef.current = null;
      }
    }, isIpad() ? 200 : 100); 
};


interface ImagePickArgs {
    pickImage: () => Promise<string | null>;
    isImagePickerLoading: boolean;
    editAttachments: Attachment[];
    handleAddAttachment: (attachment: Attachment) => void;
}

export const handleImagePick = async ({
    pickImage,
    isImagePickerLoading,
    editAttachments,
    handleAddAttachment
}: ImagePickArgs) => {
    try {
        if (isImagePickerLoading) return;

        const result = await pickImage();
        if (result) {
            const imageNum = editAttachments.length + 1;
            const imageName = `Image ${imageNum}`;

            const newAttachment: Attachment = {
                id: Date.now().toString(),
                name: imageName,
                url: result,
                type: 'image'
            };

            handleAddAttachment(newAttachment);
        }
    } catch (error) {
        console.error('Error picking image:', error);
    }
};


export const isPointInTrashArea = (y: number): boolean => {
    // Safety check for invalid y values
    if (y <= 0) {
        console.warn('Invalid y coordinate for trash area check:', y);
        return false;
    }

    const { height } = Dimensions.get('window');
    
    // Safety check for window dimensions
    if (!height || height <= 0) {
        console.warn('Invalid window height for trash area check:', height);
        return false;
    }
    const trashAreaPercent = isIpad() ? 0.70 : 0.80; 
    const trashAreaThreshold = height * trashAreaPercent;
    const isInArea = y > trashAreaThreshold;
    return isInArea;
};
