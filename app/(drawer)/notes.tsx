import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Alert, Dimensions, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { YStack, Button, XStack, Text } from 'tamagui';
import { Plus, RefreshCw } from '@tamagui/lucide-icons';
import { NoteCard } from '@/components/notes/NoteCard';
import { NotesEmpty } from '@/components/notes/NotesEmpty';
import { AddNoteSheet } from '@/components/notes/AddNoteSheet';
import type { Note, Tag, Attachment } from '@/types/notes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/UserStore';
import { useNotes } from '@/hooks/useNotes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImagePicker } from '@/hooks/useImagePicker';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { generateTestNotes } from '@/constants/devNotes';
import { useNoteStore } from '@/store/NoteStore';
import { TrashcanArea } from '@/components/notes/TrashcanArea';
import * as Haptics from 'expo-haptics';
import { useToastStore } from '@/store/ToastStore';
import WebDragDrop from '@/components/notes/WebDragDrop';

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
  const { notes } = useNotes();
  const [numColumns, setNumColumns] = useState(1);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const isTrashVisible = useSharedValue(false);
  const noteToDeleteRef = useRef<string | null>(null);
  const [isHoveringTrash, setIsHoveringTrash] = useState(false);
  
  // Track original position to prevent bouncing
  const originalIndexRef = useRef<number | null>(null);
  const preventReorder = useRef(false);
  
  // Track the last position in the drag
  const lastDragPosition = useRef({ x: 0, y: 0 });
  
  // Callback for WebDragDrop to report drag state changes
  const handleDragStateChange = useCallback((isDragging: boolean, noteId: string | null) => {
    setDraggingNoteId(isDragging ? noteId : null);
    isTrashVisible.value = isDragging;
    
    if (isDragging) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isTrashVisible]);

  // Effect to calculate columns based on screen width for web
  useEffect(() => {
    if (isWeb) {
      const calculateColumns = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth > 1200) {
          setNumColumns(3);
        } else if (screenWidth > 768) {
          setNumColumns(2);
        } else {
          setNumColumns(1);
        }
      };

      calculateColumns();
      window.addEventListener('resize', calculateColumns);
      return () => window.removeEventListener('resize', calculateColumns);
    } else {
      setNumColumns(1);
    }
  }, [isWeb]);

  // Local handlers
  const handleTagsChange = useCallback((tags: Tag[]) => {
    setEditTags(tags);
  }, []);

  const handleAddAttachment = useCallback((attachment: Attachment) => {
    setEditAttachments(prev => [...prev, attachment]);
  }, []);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setEditAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);

  const { pickImage, isLoading: isImagePickerLoading } = useImagePicker();
  const showToast = useToastStore(state => state.showToast);
  const noteStore = useNoteStore();

  // Add test notes function
  const addTestNotes = useCallback(async () => {
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
  }, [noteStore]);

  const clearNotes = useCallback(async () => {
    await noteStore.clearNotes();
  }, [noteStore]);

  const handleAddTestNotes = useCallback(async () => {
    triggerHaptic();
    await addTestNotes();
    showToast('Test notes added', 'success');
  }, [addTestNotes, showToast]);

  const handleClearNotes = useCallback(async () => {
    triggerHaptic();
    await clearNotes();
    showToast('All notes cleared', 'success');
  }, [clearNotes, showToast]);

  const handleEditNote = useCallback((note: Note) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags || []);
    setEditAttachments(note.attachments || []);
    setIsModalOpen(true);
  }, []);

  const handleAttemptDelete = useCallback(async (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);

    // Reset UI state
    isTrashVisible.value = false;
    setDraggingNoteId(null);
    setIsHoveringTrash(false);
    noteToDeleteRef.current = null;
    preventReorder.current = false;

    if (!noteToDelete) {
      console.warn("Attempted to delete a note that wasn't found:", noteId);
      return;
    }

    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

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
                onPress: () => resolve(false)
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => resolve(true),
              },
            ],
            { cancelable: true } 
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
      // If user cancels deletion, restore the original order
      if (originalIndexRef.current !== null) {
        const updatedNotes = [...notes];
        const noteIndex = updatedNotes.findIndex(n => n.id === noteId);
        
        if (noteIndex !== -1 && noteIndex !== originalIndexRef.current) {
          // Remove the note from current position
          const [movedNote] = updatedNotes.splice(noteIndex, 1);
          // Insert back at original position
          updatedNotes.splice(originalIndexRef.current, 0, movedNote);
          
          // Update order properties
          const reorderedNotes = updatedNotes.map((note, index) => ({
            ...note,
            order: index
          }));
          
          // Update store with restored order
          noteStore.updateNoteOrder(reorderedNotes);
        }
      }
    }
    
    // Reset tracking
    originalIndexRef.current = null;
  }, [notes, noteStore, showToast, selectedNote, isTrashVisible]);

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

  const handleSelectionChange = useCallback((event: any) => {
    setSelection(event.nativeEvent.selection);
  }, []);

  const handleUnderline = useCallback(() => {
    if (selection.start === selection.end) return;
    const before = editContent.substring(0, selection.start);
    const selected = editContent.substring(selection.start, selection.end);
    const after = editContent.substring(selection.end);
    setEditContent(`${before}__${selected}__${after}`);
  }, [editContent, selection]);

  const handleCode = useCallback(() => {
    if (selection.start === selection.end) return;
    const before = editContent.substring(0, selection.start);
    const selected = editContent.substring(selection.start, selection.end);
    const after = editContent.substring(selection.end);
    setEditContent(`${before}\`\`\`${selected}\`\`\`${after}`);
  }, [editContent, selection]);

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
    
    if (isUpdating) {
      showToast('Note updated successfully', 'success');
    } else {
      showToast('Note created successfully', 'success');
    }
  }, [selectedNote, editTitle, editContent, editTags, editAttachments, noteStore, showToast]);

  const handleDeleteNoteFromModal = useCallback(async () => {
    if (selectedNote) {
      handleAttemptDelete(selectedNote.id);
    }
  }, [selectedNote, handleAttemptDelete]);

  const handleAddNoteWithHaptic = useCallback(() => {
    triggerHaptic();
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setEditTags([]);
    setEditAttachments([]);
    setIsModalOpen(true);
  }, []);

  // Direct approach to checking if touch is in the trash area
  const isPointInTrashArea = useCallback((y: number) => {
    const { height } = Dimensions.get('window');
    const trashAreaTop = height - 120; // The height of our trash area is 120
    return y > trashAreaTop;
  }, []);

  // Handler for dragging over trash
  const handleDragging = useCallback((evt: any) => {
    if (!draggingNoteId) return;
    
    // Update the last known position
    lastDragPosition.current = {
      x: evt.nativeEvent.pageX,
      y: evt.nativeEvent.pageY
    };
    
    // Check if we're hovering over the trash
    const isOverTrash = isPointInTrashArea(evt.nativeEvent.pageY);
    if (isOverTrash !== isHoveringTrash) {
      setIsHoveringTrash(isOverTrash);
      if (isOverTrash) {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [draggingNoteId, isHoveringTrash, isPointInTrashArea]);

  // Handler for drag end with direct delete approach - FIXED TO PREVENT BOUNCING
  const handleDragEnd = useCallback(({ data, from, to }: { data: Note[]; from: number; to: number }) => {
    // Check if we should delete (if we're hovering over trash)
    if (isHoveringTrash && draggingNoteId) {
      // Set flag to prevent reordering
      preventReorder.current = true;
      
      // If we're dropping in trash area, don't update the list order
      // Instead, immediately attempt to delete the note
      handleAttemptDelete(draggingNoteId);
    } else if (!preventReorder.current) {
      // Only update order if we're not deleting
      noteStore.updateNoteOrder(data);
    }
    
    // Reset state
    setDraggingNoteId(null);
    isTrashVisible.value = false;
    setIsHoveringTrash(false);
    
    // Feedback
    triggerHaptic();
  }, [draggingNoteId, isHoveringTrash, handleAttemptDelete, noteStore]);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Note>) => {
    // Find the index manually - RenderItemParams doesn't include index
    const itemIndex = notes.findIndex(note => note.id === item.id);
    
    return (
      <ScaleDecorator>
        <NoteCard
          note={item}
          onPress={() => {}}
          isDragging={isActive}
          onEdit={handleEditNote}
          drag={() => {
            // Start the drag and save the note ID and original index
            setDraggingNoteId(item.id);
            originalIndexRef.current = itemIndex;
            preventReorder.current = false;
            isTrashVisible.value = true;
            triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
            // Call the original drag function from DraggableFlatList
            drag();
          }}
        />
      </ScaleDecorator>
    );
  }, [handleEditNote, notes]);

  // Create an animated style for trash visibility
  const trashAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isTrashVisible.value ? 1 : 0, { duration: 300 }),
      transform: [
        { translateY: withTiming(isTrashVisible.value ? 0 : 100, { duration: 300 }) }
      ]
    };
  });

  return (
    <YStack
      flex={1}
      backgroundColor={isDark ? '#000000' : '$backgroundLight'}
      style={isWeb ? styles.webContainer : undefined}
      onTouchMove={handleDragging}
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
      
      {isWeb ? (
        <WebDragDrop
          notes={notes}
          isTrashcanVisible={isTrashVisible}
          handleAttemptDelete={handleAttemptDelete}
          onLayoutTrashcan={() => {}}
          onDragStateChange={handleDragStateChange}
          onMoveNote={(dragIndex: number, hoverIndex: number) => {
            const updatedNotes = [...notes];
            const [draggedItem] = updatedNotes.splice(dragIndex, 1);
            updatedNotes.splice(hoverIndex, 0, draggedItem);
            const reorderedNotes = updatedNotes.map((note, index) => ({
              ...note,
              order: index
            }));
            noteStore.updateNoteOrder(reorderedNotes);
          }}
          onSelectNote={handleEditNote}
          onEditNote={handleEditNote}
          numColumns={numColumns}
          bottomPadding={insets.bottom + 80}
        />
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1 }} onTouchMove={handleDragging}>
            <DraggableFlatList
              data={notes}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              onDragEnd={handleDragEnd}
              numColumns={1}
              onDragBegin={(index) => {
                const note = notes[index];
                if (note) {
                  setDraggingNoteId(note.id);
                  originalIndexRef.current = index;
                  preventReorder.current = false;
                  isTrashVisible.value = true;
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
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
              dragItemOverflow={true}
              dragHitSlop={{ top: -20, bottom: -20, left: 0, right: 0 }}
              activationDistance={10}
            />
          </View>
          
          <Animated.View style={[styles.trashOverlay, trashAnimatedStyle]}>
            <TrashcanArea 
              isVisible={true} 
              isHovering={isHoveringTrash}
            />
          </Animated.View>
        </GestureHandlerRootView>
      )}
      
      {!draggingNoteId && (
        <Button
          size="$4"
          circular
          position="absolute"
          bottom={insets.bottom + 20}
          right={24}
          onPress={handleAddNoteWithHaptic}
          backgroundColor={preferences.primaryColor}
          pressStyle={{ scale: 0.95 }}
          animation="quick"
          elevation={4}
          icon={<Plus size={24} color="white" />}
        />
      )}

      {__DEV__ && (
        <XStack 
          position="absolute" 
          bottom={50} 
          left={40} 
          gap={10} 
          zIndex={100}
        >
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
        handleDeleteNote={handleDeleteNoteFromModal}
        handleRemoveAttachment={handleRemoveAttachment}
        handleBold={handleBold}
        handleUnderline={handleUnderline}
        handleCode={handleCode}
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
  },
  trashOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999
  }
});