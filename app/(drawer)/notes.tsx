import React, { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { isWeb } from 'tamagui';
import { View } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { YStack, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';

import type { Note, Tag, Attachment } from '@/types/notes';
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
import { AddNoteSheet } from '@/components/notes/AddNoteSheet';
import { NoteListItem } from '@/components/notes/NoteListItem';
import { AddNoteButton } from '@/components/notes/AddNoteButton';
import { DevToolsButton } from '@/components/notes/DevToolsButton';

import { createTrashAnimatedStyle, getGhostNoteStyle, noteStyles } from '@/utils/noteStyles';
import { formatBold, formatItalic, formatUnderline, formatCode, formatBullet, saveNote, attemptDeleteNote, handleImagePick as serviceHandleImagePick, triggerHaptic } from '@/services/noteService';
import { setupColumnCalculation, createFormattingHandler, handleDragging, handleDragEnd, handleMoveNote, handleSelectNote } from '@/services/noteService2';
import { createNoteHandlers } from '@/services/noteHandlers';
import { isIpad } from '@/utils/deviceUtils';

export default function NotesScreen() {
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

  useEffect(() => {return setupColumnCalculation(isWeb, setNumColumns)}, [isWeb]);

  const { 
    handleTagsChange, 
    handleAddAttachment, 
    handleRemoveAttachment, 
    handleSelectionChange 
  } = createNoteHandlers(setEditTags, setEditAttachments, setSelection);

  const localHandleBold = createFormattingHandler(formatBold, selection, setEditContent);
  const localHandleItalic = createFormattingHandler(formatItalic, selection, setEditContent);
  const localHandleUnderline = createFormattingHandler(formatUnderline, selection, setEditContent);
  const localHandleCode = createFormattingHandler(formatCode, selection, setEditContent);
  const localHandleBullet = createFormattingHandler(formatBullet, selection, setEditContent);
  const localHandleDragging = handleDragging({ draggingNoteId, isPendingDelete, lastDragPosition, isHoveringTrash, setIsHoveringTrash, isTrashVisible});
  const localHandleDragEnd = handleDragEnd({
    isHoveringTrash, draggingNoteId, preventReorder, notes, lastDragPosition,
    setIsPendingDelete, setPendingDeleteNote, setPendingDeletePosition,
    noteStore, setDraggingNoteId, isTrashVisible, setIsHoveringTrash,
    attemptDeleteNote, selectedNote, setIsModalOpen, setSelectedNote,
    noteToDeleteRef, preventReorderRef: preventReorder, originalIndexRef,
    isTrashVisibleValue: isTrashVisible, showToast: (message: string, type: string) => {
      showToast(message, type as ToastType);
    }
  });

  const trashAnimatedStyle = createTrashAnimatedStyle(isTrashVisible);
  const ghostNoteStyle = getGhostNoteStyle();

  return (
    <YStack flex={1} backgroundColor={isDark ? '#000000' : '$backgroundLight'} style={isWeb ? noteStyles.webContainer : undefined} onTouchMove={localHandleDragging} >
      <XStack
        paddingTop={isIpad() ? insets.top + 70 : insets.top + 24}
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
        onMoveNote={(dragIndex, hoverIndex) => {handleMoveNote({ dragIndex, hoverIndex, notes, noteStore});
        }}
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
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1 }} onTouchMove={localHandleDragging}>
            <DraggableFlatList
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
              ListEmptyComponent={ <NotesEmpty isDark={isDark} primaryColor={preferences.primaryColor} isWeb={isWeb} /> }
              dragItemOverflow={true}
              dragHitSlop={{ top: -20, bottom: -20, left: 0, right: 0 }}
              activationDistance={10}
            />
          </View>

          {isPendingDelete && pendingDeleteNote && (
            <View style={ghostNoteStyle}>
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
              isVisible={true}
              isHovering={isHoveringTrash || isPendingDelete}
              height={isIpad() ? 120 : 80}
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
