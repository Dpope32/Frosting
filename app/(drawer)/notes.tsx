import React, { useState, useCallback } from 'react';
import { Platform, View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { YStack, Button, XStack, Text } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import { NoteCard } from '@/components/notes/NoteCard';
import { NotesEmpty } from '@/components/notes/NotesEmpty';
import { AddNoteSheet } from '@/components/notes/AddNoteSheet';
import type { Note } from '@/types/notes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/UserStore';
import { useNotes } from '@/hooks/useNotes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImagePicker } from '@/hooks/useImagePicker';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const preferences = useUserStore((state) => state.preferences);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const screenWidth = Dimensions.get('window').width;
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  
  const {
    notes,
    selectedNote,
    isModalOpen,
    editTitle,
    editContent,
    editTags,
    editAttachments,
    handleAddNote,
    handleSelectNote,
    handleSaveNote,
    handleDeleteNote,
    handleCloseModal,
    setEditTitle,
    setEditContent,
    handleTagsChange,
    handleAddAttachment,
    handleRemoveAttachment,
    updateNotes, // Make sure this exists in your useNotes hook
  } = useNotes();

  const { pickImage, isLoading: isImagePickerLoading } = useImagePicker();

  // Handle notes reordering
  const handleDragEnd = useCallback(({ data }: { data: Note[] }) => {
    // Update the notes order in your state or database
    updateNotes(data);
  }, [updateNotes]);

  // Improved formatting functions with better selection handling
  const handleBold = useCallback(() => {
    const start = selection.start;
    const end = selection.end;
    
    // If there's no selection, just add bold markers at cursor position
    if (start === end) {
      const newContent = 
        editContent.substring(0, start) + 
        '**bold text**' + 
        editContent.substring(end);
      setEditContent(newContent);
      return;
    }
    
    const selectedText = editContent.substring(start, end);
    const newContent = 
      editContent.substring(0, start) + 
      `**${selectedText}**` + 
      editContent.substring(end);
    setEditContent(newContent);
  }, [editContent, selection, setEditContent]);

  const handleItalic = useCallback(() => {
    const start = selection.start;
    const end = selection.end;
    
    // If there's no selection, just add italic markers at cursor position
    if (start === end) {
      const newContent = 
        editContent.substring(0, start) + 
        '*italic text*' + 
        editContent.substring(end);
      setEditContent(newContent);
      return;
    }
    
    const selectedText = editContent.substring(start, end);
    const newContent = 
      editContent.substring(0, start) + 
      `*${selectedText}*` + 
      editContent.substring(end);
    setEditContent(newContent);
  }, [editContent, selection, setEditContent]);

  const handleBullet = useCallback(() => {
    const start = selection.start;
    const end = selection.end;
    
    // If no selection, just add a bullet point
    if (start === end) {
      const newContent = 
        editContent.substring(0, start) + 
        '\n- ' + 
        editContent.substring(end);
      setEditContent(newContent);
      return;
    }
    
    const selectedText = editContent.substring(start, end);
    
    // Handle multi-line selections
    if (selectedText.includes('\n')) {
      const lines = selectedText.split('\n');
      const bulletedLines = lines.map(line => line.trim() ? `- ${line}` : line).join('\n');
      const newContent = 
        editContent.substring(0, start) + 
        bulletedLines + 
        editContent.substring(end);
      setEditContent(newContent);
    } else {
      // Single line
      const newContent = 
        editContent.substring(0, start) + 
        `- ${selectedText}` + 
        editContent.substring(end);
      setEditContent(newContent);
    }
  }, [editContent, selection, setEditContent]);

  // Improved image handling - only store the markdown, never show it directly
  const handleImagePick = useCallback(async () => {
    try {
      if (isImagePickerLoading) return;
      
      const result = await pickImage();
      if (result) {
        // Generate a more user-friendly name (just the number)
        const imageNum = editAttachments.length + 1;
        const imageName = `Image ${imageNum}`;
        
        // Create attachment record
        const newAttachment = {
          id: Date.now().toString(),
          name: imageName,
          url: result,
          type: 'image'
        };
        
        // Add attachment to storage
        handleAddAttachment(newAttachment);
        
        // Markdown insertion removed - image is attached via handleAddAttachment
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }, [
    pickImage, 
    isImagePickerLoading, 
    editAttachments.length, 
    handleAddAttachment, 
    editContent, 
    selection, 
    setEditContent
  ]);

  // Handle selection change
  const handleSelectionChange = useCallback((event: any) => {
    setSelection(event.nativeEvent.selection);
  }, []);

  // Render each note card with drag functionality
  const renderItem = useCallback(({ item, drag, isActive }: { 
    item: Note; 
    drag: () => void; 
    isActive: boolean 
  }) => (
    <ScaleDecorator activeScale={1.02}>
      <View style={styles.itemContainer}>
        <NoteCard
          note={item}
          onPress={() => handleSelectNote(item)}
          onLongPress={drag}
          isDragging={isActive}
        />
      </View>
    </ScaleDecorator>
  ), [handleSelectNote]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingTop={insets.top + 10}
        paddingBottom={16}
        paddingHorizontal={16}
        backgroundColor="$background"
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
          paddingHorizontal: 6,
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
      />
      <Button
        size="$4"
        circular
        position="absolute"
        bottom={insets.bottom + 20}
        right={20}
        onPress={handleAddNote}
        backgroundColor={preferences.primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
        icon={<Plus size={24} color="white" />}
      />

      <AddNoteSheet
        isModalOpen={isModalOpen}
        selectedNote={selectedNote}
        editTitle={editTitle}
        editContent={editContent}
        editTags={editTags}
        editAttachments={editAttachments}
        handleCloseModal={handleCloseModal}
        setEditTitle={setEditTitle}
        setEditContent={setEditContent}
        handleTagsChange={handleTagsChange}
        handleSaveNote={handleSaveNote}
        handleDeleteNote={handleDeleteNote}
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
});
