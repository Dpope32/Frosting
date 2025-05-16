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

import { createTrashAnimatedStyle, noteStyles } from '@/utils/noteStyles';
import { formatBold, formatItalic, formatUnderline, formatCode, formatBullet, saveNote, attemptDeleteNote, handleImagePick as serviceHandleImagePick, triggerHaptic } from '@/services/notes/noteService';
import { setupColumnCalculation, createFormattingHandler, handleDragging, handleDragEnd, handleMoveNote, handleSelectNote } from '@/services/notes/noteService2';
import { createNoteHandlers } from '@/services';
import { isIpad } from '@/utils/deviceUtils';

export const draggedCardBottomYRef = { current: 0 };

export default function NotesScreen() {
  // Ref to store computed static trash area threshold
  const trashThresholdRef = useRef<number>(0);
  // Ref to store the actual trash area layout (y, height)
  const trashLayoutRef = useRef<{ y: number; height: number }>({ y: 0, height: 0 });
  const trashAreaViewRef = useRef<View>(null);
  // Ref to the currently dragged card's View
  const draggedCardViewRef = useRef<any>(null);
  // Callback to set the dragged card ref from NoteListItem
  const setDraggedCardRef = useCallback((ref: any) => {
    draggedCardViewRef.current = ref;
  }, []);
  const insets = useSafeAreaInsets();
  // Compute static threshold: window height minus trash area height and safe area bottom inset
  useEffect(() => {
    const windowHeight = Dimensions.get('window').height;
    if (windowHeight <= 0) {
      console.error("Invalid window height detected:", windowHeight);
      return;
    }
    
    const containerHeight = isIpad() ? 120 : 100;
    const bottomInset = insets.bottom || 0;
    const calculatedThreshold = windowHeight - containerHeight - bottomInset;
    
    // Validate threshold to ensure it's a positive number
    if (calculatedThreshold <= 0) {
      console.error("Calculated invalid trash threshold:", { 
        windowHeight, containerHeight, bottomInset, calculatedThreshold 
      });
      // Fallback to a safe minimum value
      trashThresholdRef.current = Math.max(windowHeight * 0.7, 400);  
    } else {
      trashThresholdRef.current = calculatedThreshold;
    }
    
    console.log('Computed static trash threshold Y:', trashThresholdRef.current, {
      windowHeight, containerHeight, bottomInset
    });
  }, [insets.bottom]);
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

  useEffect(() => {return setupColumnCalculation(isWeb, setNumColumns)}, [isWeb]);

  const {  handleTagsChange, handleAddAttachment,  handleRemoveAttachment, handleSelectionChange 
  } = createNoteHandlers(setEditTags, setEditAttachments, setSelection);

  const localHandleBold = createFormattingHandler(formatBold, selection, setEditContent);
  const localHandleItalic = createFormattingHandler(formatItalic, selection, setEditContent);
  const localHandleUnderline = createFormattingHandler(formatUnderline, selection, setEditContent);
  const localHandleCode = createFormattingHandler(formatCode, selection, setEditContent);
  const localHandleBullet = createFormattingHandler(formatBullet, selection, setEditContent);
  const localHandleDragging = handleDragging({ draggingNoteId, isPendingDelete, lastDragPosition, isHoveringTrash, setIsHoveringTrash, isTrashVisible, thresholdRef: trashThresholdRef });
  const localHandleDragEnd = handleDragEnd({
    isHoveringTrash, draggingNoteId, preventReorder, notes, lastDragPosition,
    setIsPendingDelete, setPendingDeleteNote, setPendingDeletePosition,
    noteStore, setDraggingNoteId, isTrashVisible, setIsHoveringTrash,
    attemptDeleteNote, selectedNote, setIsModalOpen, setSelectedNote,
    noteToDeleteRef, preventReorderRef: preventReorder, originalIndexRef,
    isTrashVisibleValue: isTrashVisible, thresholdRef: trashThresholdRef,
    showToast: (message: string, type: string) => {
      showToast(message, type as ToastType);
    }
  });

  // Helper to update trash area position using measureInWindow
  const updateTrashAreaPosition = () => {
    if (trashAreaViewRef.current) {
      trashAreaViewRef.current.measureInWindow((x, y, width, height) => {
        trashLayoutRef.current = { y, height };
      });
    }
  };

  // Patch: Use measured trash area for hit testing
  // Helper to check if a Y is inside the trash area
  const isYInTrashArea = (fingerY: number) => {
    const { y: trashTopY, height: trashHeight } = trashLayoutRef.current;

    // If trash layout hasn't been measured yet, default to false.
    if (!trashTopY || !trashHeight) {
      console.warn('[isYInTrashArea] Trash layout not yet available.');
      return false;
    }

    // Estimate the offset from the finger touch point to the bottom of the card being dragged.
    // This might need tuning based on typical card size and grab point. Let's start with 70 pixels.
    const estimatedCardBottomOffset = 100;
    const estimatedCardBottomY = fingerY + estimatedCardBottomOffset;

    // Define the effective top of the trash area for hit detection.
    // Add a small negative buffer to trigger slightly *before* the card visually hits the absolute top edge, making it feel more responsive.
    const buffer = 20;
    const effectiveTrashTop = trashTopY - buffer;

    // Check if the *estimated bottom* of the card has crossed into the trash zone.
    const isInTrash = estimatedCardBottomY >= effectiveTrashTop;

    // Debug log - Keep this temporarily for testing
    console.log('[isYInTrashArea]', { fingerY, estimatedCardBottomY, trashTopY, effectiveTrashTop, isInTrash });

    return isInTrash;
  };

  // Patch: Wrap the drag handlers to use the measured trash area
  const patchedHandleDragging = (event: any) => {
    if (!draggingNoteId || isPendingDelete) return;
    const { pageY, pageX } = event.nativeEvent;
    lastDragPosition.current = { x: pageX, y: pageY };
    // Only use the finger's Y for trash detection
    const inTrash = isYInTrashArea(pageY);
    // Debug log for drag
    const { y: trashY, height: trashHeight } = trashLayoutRef.current;
    console.log('[DRAGGING] pageY:', pageY, 'trashY:', trashY, 'trashHeight:', trashHeight, 'inTrash:', inTrash);
    if (inTrash !== isHoveringTrash) {
      try {
        triggerHaptic();
        setIsHoveringTrash(inTrash);
        if (isTrashVisible && typeof isTrashVisible.value !== 'undefined') {
          isTrashVisible.value = inTrash;
        }
      } catch (error) {
        // ...
      }
    }
  };

  const patchedHandleDragEnd = (args: any) => {
    // args: { data, from, to }
    if (preventReorder.current === true || !draggingNoteId) {
      setDraggingNoteId(null);
      isTrashVisible.value = false;
      setIsHoveringTrash(false);
      return;
    }
    try {
      const lastY = lastDragPosition.current.y;
      const inTrash = isYInTrashArea(lastY);
      // Debug log for drag end
      const { y: trashY, height: trashHeight } = trashLayoutRef.current;
      console.log('[DRAG END] lastY:', lastY, 'trashY:', trashY, 'trashHeight:', trashHeight, 'inTrash:', inTrash, 'isHoveringTrash:', isHoveringTrash);
      if ((isHoveringTrash || inTrash) && draggingNoteId) {
        preventReorder.current = true;
        const noteToDelete = notes.find(note => note.id === draggingNoteId);
        if (noteToDelete) {
          setIsPendingDelete(true);
          setPendingDeleteNote(noteToDelete);
          setPendingDeletePosition({
            x: lastDragPosition.current.x,
            y: lastY
          });
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
          }).catch(error => {
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
    } catch (error) {
      setIsPendingDelete(false);
      setDraggingNoteId(null);
      isTrashVisible.value = false;
      setIsHoveringTrash(false);
    }
    try {
      setDraggingNoteId(null);
      isTrashVisible.value = false;
      setIsHoveringTrash(false);
      triggerHaptic();
    } catch (error) {}
  };

  const handleAddExampleNote = (note: Note) => {
    // Create a new note with a unique ID but keep the content from the example note
    const newNote = {
      ...note,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('[handleAddExampleNote] Adding example note with ID:', newNote.id, 'and title:', newNote.title);
    console.log('[handleAddExampleNote] New note object:', newNote);

    // Add the note to the store
    noteStore.addNote(newNote);
    showToast(`Added example note: ${newNote.title}`, 'success');
  };

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
              style={{ overflow: 'visible' }}
              dragItemOverflow={true}
              data={notes}
              keyExtractor={(item) => item.id}
              renderItem={({ item, drag, isActive }) => (
                <NoteListItem
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
                  setCardRef={setDraggedCardRef}
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
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 500, paddingTop: 8}}
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
