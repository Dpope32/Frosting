import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Platform, FlatList } from 'react-native';
import { YStack, H1, Button, Dialog, Input, TextArea, XStack, Adapt, Sheet, Unspaced } from 'tamagui';
import { Plus, X } from '@tamagui/lucide-icons';
import { useNoteStore } from '@/store/NoteStore';
import { NoteCard } from '@/components/notes/NoteCard';
import type { Note } from '@/types/notes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/UserStore';

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const preferences = useUserStore((state) => state.preferences);
  
  // Simple state access with explicit dependencies
  const notes = useNoteStore((state) => state.notes);
  const noteOrder = useNoteStore((state) => state.noteOrder);
  const loadNotes = useNoteStore((state) => state.loadNotes);
  const addNote = useNoteStore((state) => state.addNote);
  const updateNote = useNoteStore((state) => state.updateNote);
  const deleteNote = useNoteStore((state) => state.deleteNote);
  const updateNoteOrder = useNoteStore((state) => state.updateNoteOrder);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const numColumns = 2;

  // Safely load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Compute ordered notes from raw state data
  const orderedNotes = useMemo(() => {
    return noteOrder
      .map(id => notes[id])
      .filter(Boolean)
      .filter(note => !note.archived);
  }, [notes, noteOrder]);

  const handleAddNote = () => {
    setSelectedNote(null); 
    setEditTitle('');
    setEditContent('');
    setIsModalOpen(true);
  };

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsModalOpen(true);
  }, []);

  const handleSaveNote = async () => {
    if (selectedNote) {
      await updateNote(selectedNote.id, { title: editTitle, content: editContent });
    } else {
      await addNote({ title: editTitle, content: editContent });
    }
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = async () => {
    if (selectedNote) {
      await deleteNote(selectedNote.id);
      setIsModalOpen(false);
      setSelectedNote(null);
    }
  };

  // Simplified render item function for FlatList
  const renderItem = useCallback(({ item }: { item: Note }) => {
    return (
      <NoteCard
        note={item}
        onPress={() => handleSelectNote(item)}
      />
    );
  }, [handleSelectNote]);

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top +80} paddingHorizontal={10}>
        <FlatList
            data={orderedNotes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={numColumns}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        />
        <Button
            icon={<Plus color="white" />}
            circular
            size="$6"
            position="absolute"
            bottom={insets.bottom + 20}
            right={20}
            onPress={handleAddNote}
            backgroundColor={preferences.primaryColor}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            shadowColor="black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={3}
        />
        <Dialog
            modal
            open={isModalOpen}
            onOpenChange={(open) => {
            if (!open) {
                setIsModalOpen(false);
                setSelectedNote(null);
            } else {
                setIsModalOpen(true);
            }
            }}
        >
        <Adapt when="sm" platform="touch">
          <Sheet animation="quick" zIndex={200000} modal dismissOnSnapToBottom>
            <Sheet.Frame padding="$4" gap="$4">
              <Adapt.Contents />
            </Sheet.Frame>
            <Sheet.Handle />
          </Sheet>
        </Adapt>
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            animateOnly={['transform', 'opacity']}
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
            width="90%"
            maxWidth={450}
          >
            <Dialog.Title>{selectedNote ? 'Edit Note' : 'Add Note'}</Dialog.Title>
            <Input
              placeholder="Title"
              value={editTitle}
              onChangeText={setEditTitle}
              fontSize="$5"
            />
            <TextArea
              placeholder="Content"
              value={editContent}
              onChangeText={setEditContent}
              numberOfLines={8}
              flex={1} 
              minHeight={150}
              fontSize="$4"
            />

            <XStack justifyContent="space-between" gap="$3">
               {selectedNote && ( 
                 <Button
                   backgroundColor="$red10"
                   pressStyle={{ backgroundColor: '$red9' }}
                   onPress={handleDeleteNote}
                   flex={1}
                 >
                   Delete
                 </Button>
               )}
               <Button
                 backgroundColor="$green10"
                 pressStyle={{ backgroundColor: '$green9' }}
                 onPress={handleSaveNote}
                 flex={1}
               >
                 Save
               </Button>
            </XStack>
            <Unspaced>
              <Dialog.Close asChild>
                <Button
                  position="absolute"
                  top="$3"
                  right="$3"
                  size="$2"
                  circular
                  icon={<X size={18} />}
                />
              </Dialog.Close>
            </Unspaced>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
}