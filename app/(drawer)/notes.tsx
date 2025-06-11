import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { isWeb } from 'tamagui';
import { View, ScrollView, Dimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { YStack, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';

import type { Note, Attachment, Tag } from '@/types';
import { useUserStore, useToastStore, ToastType, useNoteStore } from '@/store';

import { useNotes } from '@/hooks/useNotes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImagePicker } from '@/hooks/useImagePicker';

import TrashcanArea from '@/components/notes/TrashcanArea';
import WebDragDrop from '@/components/notes/WebDragDrop';

import { NotesEmpty } from '@/components/notes/NotesEmpty';
import { AddNoteSheet } from '@/components/cardModals/creates/AddNoteSheet';
import { NoteListItem } from '@/components/notes/NoteListItem';
import { AddNoteButton } from '@/components/notes/AddNoteButton';
import { DevToolsButton } from '@/components/notes/DevToolsButton';

import { createTrashAnimatedStyle, noteStyles, isIpad } from '@/utils';
import { formatBold, formatItalic, formatUnderline, formatCode, formatBullet, saveNote, attemptDeleteNote, handleImagePick as serviceHandleImagePick, triggerHaptic } from '@/services/notes/noteService';
import { setupColumnCalculation, createFormattingHandler, handleMoveNote, handleSelectNote } from '@/services/notes/noteService2';
import { createNoteHandlers } from '@/services';
import { handleAddExampleNote } from '@/services/dev/devNotes';

export const draggedCardBottomYRef = { current: 0 };

export default function NotesScreen() {
  // Dynamic trash area threshold that updates with scroll
  const scrollOffsetRef = useRef<number>(0);
  const trashLayoutRef = useRef<{ y: number; height: number }>({ y: 0, height: 0 });
  const trashAreaViewRef = useRef<View>(null);
  const noteListItemRef = useRef<any>(null);
  const flatListRef = useRef<any>(null);
  const activeNoteListItemRef = useRef<any>(null);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { pickImage, isLoading: isImagePickerLoading } = useImagePicker();
  const showToast = useToastStore(state => state.showToast);
  const noteStore = useNoteStore();
  const isDark = colorScheme === 'dark';
  const preferences = useUserStore((state) => state.preferences);
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
  const [isPendingDelete, setIsPendingDelete] = useState(false);
  const [pendingDeleteNote, setPendingDeleteNote] = useState<Note | null>(null);
  const [pendingDeletePosition, setPendingDeletePosition] = useState({ x: 0, y: 0 });
  const originalIndexRef = useRef<number | null>(null);
  const preventReorder = useRef(false);
  const lastDragPosition = useRef({ x: 0, y: 0 });
  const lastInTrashState = useRef(false); // Store the last known trash state
  const trashAnimatedStyle = createTrashAnimatedStyle(isTrashVisible);










  useEffect(() => {return setupColumnCalculation(isWeb, setNumColumns)}, [isWeb]);

  const {  handleTagsChange, handleAddAttachment,  handleRemoveAttachment, handleSelectionChange 
  } = createNoteHandlers(setEditTags, setEditAttachments, setSelection);

  const localHandleBold = createFormattingHandler(formatBold, selection, setEditContent);
  const localHandleItalic = createFormattingHandler(formatItalic, selection, setEditContent);
  const localHandleUnderline = createFormattingHandler(formatUnderline, selection, setEditContent);
  const localHandleCode = createFormattingHandler(formatCode, selection, setEditContent);
  const localHandleBullet = createFormattingHandler(formatBullet, selection, setEditContent);

  // Update trash area position using measureInWindow
  const updateTrashAreaPosition = useCallback(() => {
    if (trashAreaViewRef.current) {
      trashAreaViewRef.current.measureInWindow((x, y, width, height) => {
        trashLayoutRef.current = { y, height };
      });
    }
  }, []);

  // Check if drag position is in trash area using actual component bounds
  const isYInTrashArea = useCallback(() => {
    const pointerY = lastDragPosition.current.y;
    const trashBounds = trashLayoutRef.current;

    // If we don't have trash bounds yet, use fallback detection
    if (!trashBounds || trashBounds.y === 0) {
      const windowHeight = Dimensions.get('window').height;
      const fallbackThreshold = windowHeight - 200; // More conservative threshold
      const result = pointerY >= fallbackThreshold;
      return result;
    }

    // Use actual trash area bounds with some padding for easier targeting
    const padding = 120; // Increased padding for better UX
    const threshold = trashBounds.y - padding;
    const isInTrash = pointerY >= threshold;

    return isInTrash;
  }, []);

  // Simplified drag handling with reliable coordinate tracking using active item position
  const trackActiveItemPosition = useCallback(() => {
    if (!draggingNoteId || isPendingDelete || !activeNoteListItemRef.current) return;

    // Measure the active dragging item's position
    activeNoteListItemRef.current.measureCard(() => {
      const draggedY = draggedCardBottomYRef.current;
      if (draggedY > 0) {
        lastDragPosition.current = { x: 0, y: draggedY };
        
        // Update trash area bounds
        updateTrashAreaPosition();
        
        const inTrash = isYInTrashArea();
        lastInTrashState.current = inTrash; // Store the trash state
        
        if (inTrash !== isHoveringTrash) {
          try {
            triggerHaptic();
            setIsHoveringTrash(inTrash);
            isTrashVisible.value = inTrash;
          } catch (error) {
            console.error('Error in drag handling:', error);
            setIsHoveringTrash(inTrash);
            isTrashVisible.value = inTrash;
          }
        }
      }
    });
  }, [draggingNoteId, isPendingDelete, isHoveringTrash, isYInTrashArea, updateTrashAreaPosition]);

  // Start tracking position when drag begins
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    if (draggingNoteId && !isPendingDelete) {
      // Track position every 100ms while dragging
      intervalId = setInterval(trackActiveItemPosition, 100);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [draggingNoteId, isPendingDelete, trackActiveItemPosition]);

  const patchedHandleDragEnd = useCallback((args: any) => {
    if (preventReorder.current || !draggingNoteId) {
      // Clean up and exit early
      setDraggingNoteId(null);
      isTrashVisible.value = false;
      setIsHoveringTrash(false);
      preventReorder.current = false;
      lastInTrashState.current = false;
      return;
    }

    // Use the stored trash state instead of recalculating
    const inTrash = lastInTrashState.current;

    if (inTrash) {
      // Prevent reordering when deleting
      preventReorder.current = true;

      const noteToDelete = notes.find(n => n.id === draggingNoteId);
      if (noteToDelete) {
        setIsPendingDelete(true);
        setPendingDeleteNote(noteToDelete);
        setPendingDeletePosition({ x: lastDragPosition.current.x, y: lastDragPosition.current.y });
        noteToDeleteRef.current = draggingNoteId;

        // Attempt to delete the note
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
          preventReorderRef: preventReorder,
          originalIndexRef,
          isTrashVisibleValue: isTrashVisible
        }).catch((error) => {
          console.error('Delete note failed:', error);
          // Reset all states on failure
          setIsPendingDelete(false);
          setPendingDeleteNote(null);
          setDraggingNoteId(null);
          isTrashVisible.value = false;
          setIsHoveringTrash(false);
          preventReorder.current = false;
          lastInTrashState.current = false;
        });
      }
    } else if (!preventReorder.current && args.data) {
      // Only reorder if we're not preventing it and have valid data
      noteStore.updateNoteOrder(args.data);
    }

    // Clean up drag state (but keep delete states if deleting)
    if (!inTrash) {
      setDraggingNoteId(null);
      isTrashVisible.value = false;
      setIsHoveringTrash(false);
      preventReorder.current = false;
      lastInTrashState.current = false;
    }

    triggerHaptic();
  }, [draggingNoteId, notes, noteStore, showToast, selectedNote]);

  // Update trash area position when layout changes
  useEffect(() => {
    updateTrashAreaPosition();
  }, [updateTrashAreaPosition]);

  // Handle drag start with proper initialization
  const handleDragBegin = (index: number) => {
    const note = notes[index];
    if (isPendingDelete || !note) return;

    // Reset all drag-related state
    setDraggingNoteId(note.id);
    originalIndexRef.current = index;
    preventReorder.current = false;
    setIsHoveringTrash(false);
    lastInTrashState.current = false; // Reset trash state

    // Show trash area
    isTrashVisible.value = true;

    // Update trash area position for reliable detection
    updateTrashAreaPosition();

    // Start tracking position immediately
    setTimeout(() => {
      if (activeNoteListItemRef.current) {
        trackActiveItemPosition();
      }
    }, 50);
    
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handle scroll events to track scroll position
  const handleScroll = useCallback((event: any) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  return (
    <YStack f={1} overflow="visible" mt={isWeb ? 80 : isIpad() ? 65 : isDark ? 75 : 65} bg={isDark ? '#0a0a0a' : '$backgroundLight'} marginLeft={0}>
      <XStack
        pb={16} px={isWeb ? 6 : isIpad() ? 16 : 16}
        backgroundColor={isDark ? '#0a0a0a' : '$backgroundLight' }
        justifyContent="space-between" alignItems="center"
      >
      </XStack>
      {isWeb ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 8,
            paddingBottom: 100,
            paddingHorizontal: 0,
            paddingTop: 0,
            paddingLeft: 8,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: 0,
            maxWidth: 1800,
            marginHorizontal: 'auto',
            marginLeft: 16,
            marginRight: 0,
          }}
        >
          {notes.length === 0 ? (
            <NotesEmpty 
              isDark={isDark} 
              primaryColor={preferences.primaryColor} 
              isWeb={isWeb} 
              onAddExampleNote={(note) => handleAddExampleNote(note, noteStore, showToast)}
            />
          ) : (
            <WebDragDrop
              notes={notes}
              onMoveNote={(dragIndex, hoverIndex) => {handleMoveNote({ dragIndex, hoverIndex, notes, noteStore});}}
              onSelectNote={(note) => handleSelectNote({
                note,
                setSelectedNote,
                setEditTitle,
                setEditContent,
                setEditTags,
                setEditAttachments,
                setIsModalOpen
              })}
              onEditNote={(note) => handleSelectNote({
                note,
                setSelectedNote,
                setEditTitle,
                setEditContent,
                setEditTags,
                setEditAttachments,
                setIsModalOpen
              })}
              numColumns={numColumns}
              bottomPadding={insets.bottom + 20}
            />
          )}
        </ScrollView>
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, overflow: 'visible' }}>
            <DraggableFlatList
              ref={flatListRef}
              style={{ overflow: 'visible' }}
              dragItemOverflow={true}
              data={notes}
              keyExtractor={(item) => item.id}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item, drag, isActive }) => (
                <NoteListItem
                  ref={isActive ? activeNoteListItemRef : undefined}
                  item={item}
                  drag={drag}
                  isActive={isActive}
                  notes={notes}
                  isPendingDelete={isPendingDelete}
                  pendingDeleteNote={pendingDeleteNote}
                  setSelectedNote={setSelectedNote}
                  setEditTitle={setEditTitle}
                  setEditContent={setEditContent}
                  setEditTags={setEditTags}
                  setEditAttachments={setEditAttachments}
                  setIsModalOpen={setIsModalOpen}
                  setDraggingNoteId={setDraggingNoteId}
                  originalIndexRef={originalIndexRef}
                  preventReorder={preventReorder}
                  isTrashVisible={isTrashVisible}
                />
              )}
              onDragEnd={patchedHandleDragEnd}
              numColumns={1}
              onDragBegin={handleDragBegin}
              contentContainerStyle={{ 
                paddingHorizontal: isWeb ? 16 : isIpad() ? 8 : 0, 
                paddingBottom: insets.bottom + 120, 
                paddingTop: 8
              }}
              ListEmptyComponent={ 
                <NotesEmpty 
                  isDark={isDark} 
                  primaryColor={preferences.primaryColor} 
                  isWeb={isWeb} 
                  onAddExampleNote={(note) => handleAddExampleNote(note, noteStore, showToast)}
                /> 
              }
              dragHitSlop={{ top: -20, bottom: -20, left: 0, right: 0 }}
              activationDistance={10}
            />
          </View>

          <Animated.View
            style={[
              noteStyles.trashOverlay,
              trashAnimatedStyle,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000, 
                pointerEvents: 'box-none',
              },
            ]}
          >
            <TrashcanArea
              ref={trashAreaViewRef}
              isVisible={true}
              isHovering={isHoveringTrash || isPendingDelete}
              height={isIpad() ? 120 : 100}
              onLayout={updateTrashAreaPosition}
            />
          </Animated.View>
        </GestureHandlerRootView>
      )}
      <AddNoteButton
        insets={insets}
        preferences={preferences}
        draggingNoteId={draggingNoteId}
        isPendingDelete={isPendingDelete}
        setSelectedNote={setSelectedNote}
        setEditTitle={setEditTitle}
        setEditContent={setEditContent}
        setEditTags={setEditTags}
        setEditAttachments={setEditAttachments}
        setIsModalOpen={setIsModalOpen}
      />
      <DevToolsButton isDark={isDark} />
      <AddNoteSheet
        isModalOpen={isModalOpen}
        selectedNote={selectedNote}
        editTitle={editTitle}
        editContent={editContent}
        editTags={editTags}
        editAttachments={editAttachments}
        handleCloseModal={() => { setIsModalOpen(false); setSelectedNote(null)}}
        setEditTitle={setEditTitle}
        setEditContent={setEditContent}
        handleTagsChange={handleTagsChange}
        handleSaveNote={() => saveNote({
          selectedNote, editTitle, editContent, 
          editTags, editAttachments, noteStore,
          showToast, setIsModalOpen, setSelectedNote
        })}
        handleDeleteNote={() => {
          if (selectedNote) {
            attemptDeleteNote({
              noteId: selectedNote.id, notes, noteStore, selectedNote,
              showToast, setIsModalOpen, setSelectedNote, setIsPendingDelete,
              setPendingDeleteNote, setDraggingNoteId, setIsHoveringTrash,
              noteToDeleteRef, preventReorderRef: preventReorder,
              originalIndexRef, isTrashVisibleValue: isTrashVisible
            });
          }
        }}
        handleRemoveAttachment={handleRemoveAttachment}
        handleBold={localHandleBold}
        handleUnderline={localHandleUnderline}
        handleCode={localHandleCode}
        handleItalic={localHandleItalic}
        handleBullet={localHandleBullet}
        handleImagePick={() => serviceHandleImagePick({ pickImage, isImagePickerLoading, editAttachments, handleAddAttachment})}
        onSelectionChange={handleSelectionChange}
      />
    </YStack>
  );  
}