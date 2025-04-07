import React, { useRef, useState, useEffect } from 'react';
import { Platform, TextInput, Keyboard, View, Image, StyleSheet, ScrollView as RNScrollView } from 'react-native';
import { YStack, Button, XStack, Sheet, H2, Text, ScrollView } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { Ionicons } from '@expo/vector-icons';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { TagSelector } from '@/components/notes/TagSelector';
import { FormattingToolbar } from './FormattingToolbar';
import { ContentInput } from './ContentInput'; // Import our new component
import type { Note, Attachment, Tag } from '@/types/notes';
import { useUserStore } from '@/store/UserStore';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AddNoteSheetProps {
  isModalOpen: boolean;
  selectedNote: Note | null;
  editTitle: string;
  editContent: string;
  editTags: Tag[];
  editAttachments: Attachment[];
  handleCloseModal: () => void;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  handleTagsChange: (tags: Tag[]) => void;
  handleSaveNote: () => void;
  handleDeleteNote: () => void;
  handleRemoveAttachment: (id: string) => void;
  handleBold: () => void;
  handleItalic: () => void;
  handleBullet: () => void;
  handleImagePick: () => void;
  onSelectionChange?: (event: any) => void;
}

export function AddNoteSheet({
  isModalOpen,
  selectedNote,
  editTitle,
  editContent,
  editTags,
  editAttachments,
  handleCloseModal,
  setEditTitle,
  setEditContent,
  handleTagsChange,
  handleSaveNote,
  handleDeleteNote,
  handleRemoveAttachment,
  handleBold,
  handleItalic,
  handleBullet,
  handleImagePick,
  onSelectionChange
}: AddNoteSheetProps) {
  const preferences = useUserStore((state) => state.preferences);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const contentInputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<RNScrollView>(null);
  
  // Handle keyboard visibility
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Slight delay to ensure the keyboard is fully shown
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Improved selection handling
  const handleSelectionChange = (event: any) => {
    // Store selection locally
    const newSelection = event.nativeEvent.selection;
    setSelection(newSelection);
    
    // Forward the event to parent if needed
    if (onSelectionChange) {
      onSelectionChange(event);
    }
  };
  
  const adjustColor = (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
  };

  // Render attachment previews
  const renderAttachments = () => {
    if (editAttachments.length === 0) return null;
    
    return (
      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="600">Attachments</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            {editAttachments.map(attachment => (
              <XStack
                key={attachment.id}
                backgroundColor={isDark ? "#1c1c1e" : "#f1f1f1"}
                borderRadius={8}
                overflow="hidden"
                width={120}
                height={90}
                position="relative"
                alignItems="center"
                justifyContent="center"
              >
                {attachment.type === 'image' && (
                  <>
                    <Image 
                      source={{ uri: attachment.url }}
                      style={styles.attachmentImage}
                    />
                    <View style={styles.overlay} />
                  </>
                )}
                
                <Text 
                  color="white"
                  fontSize={13}
                  position="absolute"
                  bottom={8}
                  paddingHorizontal={6}
                  paddingVertical={2}
                  backgroundColor="rgba(0,0,0,0.5)"
                  borderRadius={4}
                  zIndex={2}
                >
                  {attachment.name}
                </Text>
                
                <Button
                  position="absolute"
                  top={4}
                  right={4}
                  size="$1"
                  circular
                  zIndex={2}
                  backgroundColor="rgba(0,0,0,0.5)"
                  onPress={() => handleRemoveAttachment(attachment.id)}
                  icon={<X size={12} color="white" />}
                />
              </XStack>
            ))}
          </XStack>
        </ScrollView>
      </YStack>
    );
  };

  // Platform-specific padding to account for keyboard on mobile
  const contentPadding = Platform.select({
    ios: keyboardVisible ? 320 : 80,
    android: keyboardVisible ? 260 : 80,
    default: 80,
  });

  return (
    <Sheet
      modal
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      snapPoints={isWeb ? [85] : [85]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        opacity={0.5}
      />
      <Sheet.Frame
        paddingHorizontal="$5"
        paddingBottom="$4"
        paddingTop={isWeb ? "$1" : 0}
        backgroundColor="$background"
      >
        <Sheet.Handle />
        
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginBottom="$2"
          paddingTop="$2"
        >
          <H2>{selectedNote ? 'Edit Note' : 'Add Note'}</H2>
          <Button
            size={isWeb ? "$2" : "$3"}
            circular
            icon={<X size={isWeb ? 18 : 22} />}
            onPress={handleCloseModal}
            pressStyle={{ opacity: 0.7 }}
          />
        </XStack>
        
        <RNScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingBottom: contentPadding
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack gap={isWeb ? "$3" : "$2"} paddingTop="$2">
            <DebouncedInput
              placeholder="Title"
              value={editTitle}
              onDebouncedChange={setEditTitle}
              fontSize="$5"
            />
            
            <TagSelector
              tags={editTags}
              onTagsChange={handleTagsChange}
            />
            
            <FormattingToolbar
              onBold={handleBold}
              onItalic={handleItalic}
              onBullet={handleBullet}
              onAttachImage={handleImagePick}
            />
            
            {/* Our new improved content input component */}
            <ContentInput
              ref={contentInputRef}
              value={editContent}
              onChangeText={setEditContent}
              onSelectionChange={handleSelectionChange}
              numberOfLines={keyboardVisible ? 5 : 10}
              minHeight={keyboardVisible ? 100 : 150}
            />
            
            {renderAttachments()}
            
            <YStack gap="$3" paddingTop="$2">
              {selectedNote && (
                <Button
                  backgroundColor={isDark ? "$red10" : "$red8"}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handleDeleteNote}
                  br={8}
                  py={isWeb ? "$1" : "$2"}
                >
                  <Text color="white" fontFamily="$body" fontSize={15} fontWeight="600">
                    Delete Note
                  </Text>
                </Button>
              )}
              
              <Button
                backgroundColor={isDark ? `${preferences.primaryColor}40` : `${adjustColor(preferences.primaryColor, 20)}80`}
                br={8}
                py={isWeb ? "$1" : "$2"}
                onPress={handleSaveNote}
                marginTop={8}
                pressStyle={{ opacity: 0.7 }}
                borderWidth={2}
                borderColor={preferences.primaryColor}
              >
                <Text
                  color={isDark ? "#f9f9f9" : `${adjustColor(preferences.primaryColor, -100)}80`}
                  fontFamily="$body"
                  fontSize={15}
                  fontWeight="600"
                >
                  {selectedNote ? 'Save Changes' : 'Save Note'}
                </Text>
              </Button>
            </YStack>
          </YStack>
        </RNScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  attachmentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
});