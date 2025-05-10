import React, { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { isWeb } from 'tamagui';
import { View, ScrollView, Dimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { YStack, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';

import type { Note, Attachment } from '@/types/notes';
import type { Tag } from '@/types/tag';
import { useUserStore } from '@/store/UserStore';
import { useToastStore, ToastType } from '@/store/ToastStore';
import { useNoteStore } from '@/store/NoteStore';

import { useNotes } from '@/hooks/useNotes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImagePicker } from '@/hooks/useImagePicker';

import { TrashcanArea } from '@/components/notes/TrashcanArea';
import WebDragDrop from '@/components/notes/WebDragDrop';
import { NoteCard } from '@/components/notes/NoteCard';
import { NotesEmpty } from '@/components/notes/NotesEmpty';
import { AddNoteSheet } from '@/components/cardModals/creates/AddNoteSheet';
import { NoteListItem } from '@/components/notes/NoteListItem';
import { AddNoteButton } from '@/components/notes/AddNoteButton';
import { DevToolsButton } from '@/components/notes/DevToolsButton';

import { createTrashAnimatedStyle, noteStyles } from '@/utils/noteStyles';
import { formatBold, formatItalic, formatUnderline, formatCode, formatBullet, saveNote, attemptDeleteNote, handleImagePick as serviceHandleImagePick, triggerHaptic } from '@/services/noteService';
import { setupColumnCalculation, createFormattingHandler, handleDragging, handleDragEnd, handleMoveNote, handleSelectNote } from '@/services/noteService2';
import { createNoteHandlers } from '@/services/noteHandlers';
import { isIpad } from '@/utils/deviceUtils';

export default function NotesScreen() {
  // Ref to store computed static trash area threshold
  const trashThresholdRef = useRef<number>(0);
  const insets = useSafeAreaInsets();
  // Compute static threshold: window height minus trash area height and safe area bottom inset
  useEffect(() => {
    const windowHeight = Dimensions.get('window').height;
    const containerHeight = isIpad() ? 120 : 100;
    trashThresholdRef.current = windowHeight - containerHeight - insets.bottom;
    console.log('Computed static trash threshold Y:', trashThresholdRef.current);
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

  const handleAddExampleNote = (note: Note) => {
    // Create a new note with a unique ID but keep the content from the example note
    const newNote = {
      ...note,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
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
          <View style={{ flex: 1, overflow: 'visible' }} onTouchMove={draggingNoteId ? localHandleDragging : undefined}>
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
                />
              )}
              onDragEnd={localHandleDragEnd}
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
            <TrashcanArea isVisible={true} isHovering={isHoveringTrash || isPendingDelete} height={isIpad() ? 120 : 100}/>
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
