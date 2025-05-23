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
import { NoteCard } from '@/components/notes/NoteCard';
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
  const trashAnimatedStyle = createTrashAnimatedStyle(isTrashVisible);

  const getDynamicTrashThreshold = useCallback(() => {
    const windowHeight = Dimensions.get('window').height;
    const containerHeight = isIpad() ? 120 : 100;
    const bottomInset = insets.bottom || 0;
    const baseThreshold = windowHeight - containerHeight - bottomInset;
    const adjustedThreshold = baseThreshold + scrollOffsetRef.current;
    return Math.max(adjustedThreshold, windowHeight * 0.7);
  }, [insets.bottom]);

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

  // Check if drag position is in trash area using dynamic threshold
  const isYInTrashArea = useCallback(() => {
    const pointerY = lastDragPosition.current.y;
    const threshold = getDynamicTrashThreshold();
    const isInTrash = pointerY >= threshold;
    return isInTrash;
  }, [getDynamicTrashThreshold]);

  // Enhanced drag handling with scroll-aware threshold
  const patchedHandleDragging = useCallback((event: any) => {
    if (!draggingNoteId || isPendingDelete) return;
    const { pageY, pageX } = event.nativeEvent;
    lastDragPosition.current = { x: pageX, y: pageY };
    const inTrash = isYInTrashArea();
    if (inTrash !== isHoveringTrash) {
      try {
        triggerHaptic();
        setIsHoveringTrash(inTrash);
        if (isTrashVisible?.value !== undefined) {
          isTrashVisible.value = inTrash;
        }
      } catch (error) {
        console.error('Error in drag handling:', error);
      }
    }
  }, [draggingNoteId, isPendingDelete, isHoveringTrash, isYInTrashArea]);

  const patchedHandleDragEnd = useCallback((args: any) => {
    if (preventReorder.current || !draggingNoteId) {
      setDraggingNoteId(null);
      isTrashVisible.value = false;
      setIsHoveringTrash(false);
      return;
    }
    
    const inTrash = isYInTrashArea();
    
    if (inTrash) {
      preventReorder.current = true;
      const noteToDelete = notes.find(n => n.id === draggingNoteId);
      
      if (noteToDelete) {
        setIsPendingDelete(true);
        setPendingDeleteNote(noteToDelete);
        setPendingDeletePosition({ x: lastDragPosition.current.x, y: lastDragPosition.current.y });
        noteToDeleteRef.current = draggingNoteId;
        
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
        }).catch(() => {
          setIsPendingDelete(false);
          setPendingDeleteNote(null);
          setDraggingNoteId(null);
          isTrashVisible.value = false;
          setIsHoveringTrash(false);
        });
      } else {
        setIsPendingDelete(false);
        setDraggingNoteId(null);
        isTrashVisible.value = false;
        setIsHoveringTrash(false);
      }
    } else if (!preventReorder.current) {
      noteStore.updateNoteOrder(args.data);
    }
    
    // Final cleanup
    setDraggingNoteId(null);
    isTrashVisible.value = false;
    setIsHoveringTrash(false);
    triggerHaptic();
  }, [draggingNoteId, isYInTrashArea, notes, noteStore, showToast, selectedNote, setIsModalOpen, setSelectedNote, setIsPendingDelete, setPendingDeleteNote, setDraggingNoteId, setIsHoveringTrash]);


  // Handle scroll events to track scroll position
  const handleScroll = useCallback((event: any) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  return (
    <YStack f={1} overflow="visible" mt={isWeb ? 80 : isIpad() ? 65 : isDark ? 75 : 65} bg={isDark ? '#000000' : '$backgroundLight'} marginLeft={isWeb ? 24 : 0}>
      <XStack
        pb={16} px={isIpad() ? 16 : 16}
        backgroundColor={isDark ? '$backgroundDark' : '$backgroundLight' }
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
            paddingLeft: 12,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: 32,
            maxWidth: 1800,
            marginHorizontal: 'auto',
          }}
        >
          {notes.length === 0 ? (
            <NotesEmpty 
              isDark={isDark} 
              primaryColor={preferences.primaryColor} 
              isWeb={isWeb} 
              onAddExampleNote={handleAddExampleNote}
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
          <View style={{ flex: 1, overflow: 'visible' }} onTouchMove={draggingNoteId ? patchedHandleDragging : undefined}>
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
                  ref={noteListItemRef}
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
              onDragBegin={(index) => {
                if (isPendingDelete) return;
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
                paddingBottom: insets.bottom + 120, // Reduced from 500 to 120
                paddingTop: 8
              }}
              ListEmptyComponent={ 
                <NotesEmpty 
                  isDark={isDark} 
                  primaryColor={preferences.primaryColor} 
                  isWeb={isWeb} 
                  onAddExampleNote={handleAddExampleNote}
                /> 
              }
              dragHitSlop={{ top: -20, bottom: -20, left: 0, right: 0 }}
              activationDistance={10}
            />
          </View>

          {isPendingDelete && pendingDeleteNote && (
            <View>
              <NoteCard
                note={pendingDeleteNote}
                onPress={() => {}}
                isDragging={false}
                onEdit={() => {}}
                drag={() => {}}
              />
            </View>
          )}

          <Animated.View style={[noteStyles.trashOverlay, trashAnimatedStyle]}> 
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