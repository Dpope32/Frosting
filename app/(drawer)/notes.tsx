import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { isWeb } from 'tamagui';
import { View, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { YStack, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';

import type { Note, Attachment, Tag } from '@/types';
import { useUserStore, useToastStore, useNoteStore } from '@/store';

import { useNotes } from '@/hooks/useNotes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImagePicker } from '@/hooks/useImagePicker';

import WebDragDrop from '@/components/notes/WebDragDrop';
import { NotesEmpty } from '@/components/notes/NotesEmpty';
import { AddNoteSheet } from '@/components/cardModals/creates/AddNoteSheet';
import { NoteListItem } from '@/components/notes/NoteListItem';
import { AddNoteButton } from '@/components/notes/AddNoteButton';
import { DevToolsButton } from '@/components/notes/DevToolsButton';
import { isIpad } from '@/utils';
import { formatBold, formatItalic, formatUnderline, formatCode, formatBullet, saveNote, handleImagePick as serviceHandleImagePick, triggerHaptic } from '@/services/notes/noteService';
import { setupColumnCalculation, createFormattingHandler, handleMoveNote, handleSelectNote } from '@/services/notes/noteService2';
import { createNoteHandlers } from '@/services';
import { handleAddExampleNote } from '@/services/dev/devNotes';

export const draggedCardBottomYRef = { current: 0 };

export default function NotesScreen() {
  const scrollOffsetRef = useRef<number>(0);
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
  const [isPendingDelete, setIsPendingDelete] = useState(false);
  const [pendingDeleteNote, setPendingDeleteNote] = useState<Note | null>(null);
  const originalIndexRef = useRef<number | null>(null);
  const preventReorder = useRef(false);

  useEffect(() => {return setupColumnCalculation(isWeb, setNumColumns)}, [isWeb]);

  const {  handleTagsChange, handleAddAttachment,  handleRemoveAttachment, handleSelectionChange 
  } = createNoteHandlers(setEditTags, setEditAttachments, setSelection);

  const localHandleBold = createFormattingHandler(formatBold, selection, setEditContent);
  const localHandleItalic = createFormattingHandler(formatItalic, selection, setEditContent);
  const localHandleUnderline = createFormattingHandler(formatUnderline, selection, setEditContent);
  const localHandleCode = createFormattingHandler(formatCode, selection, setEditContent);
  const localHandleBullet = createFormattingHandler(formatBullet, selection, setEditContent);

    const patchedHandleDragEnd = useCallback((args: any) => {
    if (preventReorder.current || !draggingNoteId) {
      // Clean up and exit early
      setDraggingNoteId(null);
      preventReorder.current = false;
      return;
    }

    // Use requestAnimationFrame to ensure smooth UI updates
    requestAnimationFrame(() => {
      // Just reorder the notes - no trash logic
      if (!preventReorder.current && args.data) {
        noteStore.updateNoteOrder(args.data);
      }

      // Clean up drag state after a brief delay to prevent flicker
      setTimeout(() => {
        setDraggingNoteId(null);
        preventReorder.current = false;
      }, 50);

      triggerHaptic();
    });
  }, [draggingNoteId, noteStore]);



  // Handle drag start
  const handleDragBegin = (index: number) => {
    const note = notes[index];
    if (isPendingDelete || !note) return;

    // Reset drag-related state
    setDraggingNoteId(note.id);
    originalIndexRef.current = index;
    preventReorder.current = false;
    
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
            paddingBottom: 100,
            paddingTop: 8,
            paddingHorizontal: 16,
            maxWidth: 1600,
            marginHorizontal: 'auto',
            width: '100%',
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

                />
              )}
              onDragEnd={patchedHandleDragEnd}
              extraData={notes.length} 
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
              activationDistance={15}
              animationConfig={{
                damping: 20,
                mass: 0.2,
                stiffness: 100,
                restSpeedThreshold: 0.2,
                restDisplacementThreshold: 0.2,
              }}
            />
          </View>


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
            noteStore.deleteNote(selectedNote.id);
            setIsModalOpen(false);
            setSelectedNote(null);
            showToast('Note deleted', 'success');
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