import React, { useState, useCallback } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { YStack, Button, XStack, Text } from 'tamagui';
import { Plus, Trash2, RefreshCw } from '@tamagui/lucide-icons';
import { NoteCard } from '@/components/notes/NoteCard';
import { NotesEmpty } from '@/components/notes/NotesEmpty';
import { AddNoteSheet } from '@/components/notes/AddNoteSheet';
import type { Note, Tag, Attachment } from '@/types/notes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/UserStore';
import { useNotes } from '@/hooks/useNotes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImagePicker } from '@/hooks/useImagePicker';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { generateTestNotes } from '@/constants/devNotes';
import { useNoteStore } from '@/store/NoteStore';
import * as Haptics from 'expo-haptics';
import { useToastStore } from '@/store/ToastStore';

// Helper function to trigger haptics only on non-web platforms
const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
};

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const preferences = useUserStore((state) => state.preferences);

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<Tag[]>([]);
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  const {
    notes,
    handleAddNote,
    handleSaveNote,
    handleDeleteNote,
    handleTagsChange: useNotesHandleTagsChange,
    updateNotes,
  } = useNotes();

  // Local handler for tag changes
  const handleTagsChange = useCallback((tags: Tag[]) => {
    setEditTags(tags);
  }, []);

  // Local handler for adding attachments
  const handleAddAttachment = useCallback((attachment: Attachment) => {
    setEditAttachments(prev => [...prev, attachment]);
  }, []);

  // Local handler for removing attachments
  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setEditAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);

  const { pickImage, isLoading: isImagePickerLoading } = useImagePicker();
  const showToast = useToastStore(state => state.showToast);
  const noteStore = useNoteStore();

  // Add test notes function
  const addTestNotes = useCallback(async () => {
    const testNotes = generateTestNotes();
    // Add notes one by one with a delay
    for (let i = 0; i < testNotes.length; i++) {
      const note = testNotes[i];
      await noteStore.addNote({
        title: note.title,
        content: note.content,
        tags: note.tags,
        attachments: note.attachments
      });
      // Add delay between notes
      if (i < testNotes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }, [noteStore]);

  // Clear all notes function
  const clearNotes = useCallback(async () => {
    await noteStore.clearNotes();
  }, [noteStore]);

  // Handle adding test notes
  const handleAddTestNotes = useCallback(async () => {
    triggerHaptic();
    await addTestNotes();
    showToast('Test notes added', 'success');
  }, [addTestNotes, showToast]);

  // Handle clearing all notes
  const handleClearNotes = useCallback(async () => {
    triggerHaptic();
    await clearNotes();
    showToast('All notes cleared', 'success');
  }, [clearNotes, showToast]);

  // Handle note editing
  const handleEditNote = useCallback((note: Note) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags || []);
    setEditAttachments(note.attachments || []);
    setIsModalOpen(true);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(({ data }: { data: Note[] }) => {
    triggerHaptic();
    
    // Update the store immediately
    noteStore.updateNoteOrder(data);
  }, [noteStore]);

  // Handle image picking
  const handleImagePick = useCallback(async () => {
    try {
      if (isImagePickerLoading) return;
      
      const result = await pickImage();
      if (result) {
        const imageNum = editAttachments.length + 1;
        const imageName = `Image ${imageNum}`;
        
        const newAttachment = {
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
  }, [pickImage, isImagePickerLoading, editAttachments.length, handleAddAttachment]);

  // Handle selection change
  const handleSelectionChange = useCallback((event: any) => {
    setSelection(event.nativeEvent.selection);
  }, []);

  // Handle text formatting
  const handleBold = useCallback(() => {
    if (selection.start === selection.end) return;
    
    const before = editContent.substring(0, selection.start);
    const selected = editContent.substring(selection.start, selection.end);
    const after = editContent.substring(selection.end);
    
    setEditContent(`${before}**${selected}**${after}`);
  }, [editContent, selection]);

  const handleItalic = useCallback(() => {
    if (selection.start === selection.end) return;
    
    const before = editContent.substring(0, selection.start);
    const selected = editContent.substring(selection.start, selection.end);
    const after = editContent.substring(selection.end);
    
    setEditContent(`${before}*${selected}*${after}`);
  }, [editContent, selection]);

  const handleBullet = useCallback(() => {
    const before = editContent.substring(0, selection.start);
    const after = editContent.substring(selection.start);
    
    if (before.endsWith('\n') || before === '') {
      setEditContent(`${before}- ${after}`);
    } else {
      setEditContent(`${before}\n- ${after}`);
    }
  }, [editContent, selection]);

  const handleSaveNoteWithHaptic = useCallback(async () => {
    triggerHaptic();
    const isUpdating = !!selectedNote; // Store whether we're updating before handleSaveNote clears it
    
    // Pass the selectedNote to handleSaveNote
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
    
    if (isUpdating) {
      showToast('Note updated successfully', 'success');
    } else {
      showToast('Note created successfully', 'success');
    }
  }, [selectedNote, editTitle, editContent, editTags, editAttachments, noteStore, showToast]);

  const handleDeleteNoteWithHaptic = useCallback(async () => {
    triggerHaptic();
    
    // Show confirmation dialog
    const confirmDelete = Platform.OS === 'web' 
      ? window.confirm('Are you sure you want to delete this note?')
      : new Promise<boolean>((resolve) => {
          Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(false)
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => resolve(true)
              }
            ]
          );
        });
    
    // Wait for the confirmation dialog to be resolved
    const shouldDelete = await confirmDelete;
    
    if (shouldDelete && selectedNote) {
      await noteStore.deleteNote(selectedNote.id);
      setIsModalOpen(false);
      setSelectedNote(null);
      showToast('Note deleted successfully', 'success');
    }
  }, [selectedNote, noteStore, showToast]);

  const handleAddNoteWithHaptic = useCallback(() => {
    triggerHaptic();
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setEditTags([]);
    setEditAttachments([]);
    setIsModalOpen(true);
  }, []);

  const renderItem = useCallback(({ item, drag, isActive }: { item: Note; drag: () => void; isActive: boolean }) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={!item.isExpanded ? drag : undefined}
          disabled={isActive || item.isExpanded}
          delayLongPress={300}
          style={{ marginBottom: 8 }}
        >
          <NoteCard
            note={item}
            onPress={() => handleEditNote(item)}
            isDragging={isActive}
            onEdit={handleEditNote}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [handleEditNote]);

  return (
    <YStack
      flex={1}
      backgroundColor={isDark ? '#000000' : '$backgroundLight'}
      style={isWeb ? styles.webContainer : undefined}
    >
      <XStack
        paddingTop={insets.top + 20}
        paddingBottom={16}
        paddingHorizontal={16}
        backgroundColor={isDark ? '$backgroundDark' : '$backgroundLight' }
        justifyContent="space-between"
        alignItems="center"
      >
      </XStack>
      
      <DraggableFlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        numColumns={1}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 80,
          paddingTop: 8
        }}
        ListEmptyComponent={
          <NotesEmpty 
            isDark={isDark}
            primaryColor={preferences.primaryColor}
            isWeb={isWeb}
          />
        }
        dragItemOverflow={false}
        dragHitSlop={{ top: -20, bottom: -20, left: 0, right: 0 }}
      />

      <Button
        size="$4"
        circular
        position="absolute"
        bottom={insets.bottom + 20}
        right={20}
        onPress={handleAddNoteWithHaptic}
        backgroundColor={preferences.primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
        icon={<Plus size={24} color="white" />}
      />

      {__DEV__ && (
        <XStack 
          position="absolute" 
          bottom={50} 
          left={40} 
          gap={10} 
          zIndex={100}
        >
          <TouchableOpacity 
            onPress={handleClearNotes}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: isDark ? '#333' : '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 3,
            }}
          >
            <Trash2 size={20} color={isDark ? '#ff6b6b' : '#e74c3c'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleAddTestNotes}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: isDark ? '#333' : '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 3,
            }}
          >
            <RefreshCw size={20} color={isDark ? '#4dabf7' : '#3498db'} />
          </TouchableOpacity>
        </XStack>
      )}

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
        handleSaveNote={handleSaveNoteWithHaptic}
        handleDeleteNote={handleDeleteNoteWithHaptic}
        handleRemoveAttachment={handleRemoveAttachment}
        handleBold={handleBold}
        handleItalic={handleItalic}
        handleBullet={handleBullet}
        handleImagePick={handleImagePick}
        onSelectionChange={handleSelectionChange}
      />
    </YStack>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    padding: 8,
    paddingHorizontal: 12,
  },
  webContainer: {
    overflow: 'visible',
  }
});
