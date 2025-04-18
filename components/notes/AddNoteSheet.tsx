import React, { useRef, useState, useEffect } from 'react';
import { Platform, TextInput, Keyboard, View, Image, StyleSheet, ScrollView as RNScrollView } from 'react-native';
import { YStack, Button, XStack, Sheet, H3, Text, ScrollView, isWeb } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { TagSelector } from '@/components/notes/TagSelector';
import { FormattingToolbar } from './FormattingToolbar';
import { ContentInput } from './ContentInput'; 
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
  handleUnderline: () => void;
  handleBullet: () => void;
  handleCode: () => void;
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
  handleUnderline,
  handleBullet,
  handleCode,
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
  
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
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


  const handleSelectionChange = (event: any) => {
    const newSelection = event.nativeEvent.selection;
    setSelection(newSelection);
    
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

  const renderAttachments = () => {
    if (editAttachments.length === 0) return null;
    
    return (
      <YStack gap="$2">
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

  const contentPadding = Platform.select({
    ios: keyboardVisible ? 340 : 80,
    android: keyboardVisible ? 280 : 80,
    default: 80,
  });

  return (
    <Sheet
      modal
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      snapPoints={isWeb ? [85] : [93]}
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
        maxWidth={isWeb ? 600 : "100%"}
        width={isWeb ? 600 : "100%"} 
        alignSelf="center"
      >
        <Sheet.Handle />
        
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginBottom="$2"
          paddingTop="$2"
        >
          <H3>{selectedNote ? 'Edit Note' : 'Add Note'}</H3>
          <Button
            size={isWeb ? "$2" : "$2"}
            circular
            icon={<X size={isWeb ? 18 : 22} />}
            onPress={handleCloseModal}
            pressStyle={{ opacity: 0.7 }}
          />
        </XStack>
        
        <YStack flex={1}>
          <RNScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingBottom: contentPadding
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            <YStack gap={isWeb ? "$3" : "$0"} paddingTop="$2">
              <DebouncedInput
                placeholder="Title"
                autoCapitalize='words'
                value={editTitle}
                onDebouncedChange={setEditTitle}
                fontSize="$5"
              />
              
              <FormattingToolbar
                onBold={handleBold}
                onItalic={handleItalic}
                onUnderline={handleUnderline}
                onBullet={handleBullet}
                onCode={handleCode}
                onAttachImage={handleImagePick}
              />
              
              <ContentInput
                ref={contentInputRef}
                value={editContent}
                onChangeText={setEditContent}
                onSelectionChange={handleSelectionChange}
                numberOfLines={keyboardVisible ? 8 : 12}
                minHeight={keyboardVisible ? 100 : 350}
              />
              {renderAttachments()}
            </YStack>
          </RNScrollView>
          <TagSelector tags={editTags} onTagsChange={handleTagsChange}/>
          <XStack 
            gap="$2" 
            justifyContent="space-between" 
            paddingTop="$4"
            paddingBottom="$2"
            marginBottom="$4"
            borderTopWidth={1}
            borderTopColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          >
            {selectedNote ? (
              <>
                <Button
                  backgroundColor={isDark ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 0, 0, 0.1)"}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handleDeleteNote}
                  br={12}
                  py={isWeb ? "$1" : "$1.5"}
                  flex={1}
                >
                  <Text color={isDark ? "$red10" : "$red8"} fontFamily="$body" fontSize={13} fontWeight="600">
                    Delete Note
                  </Text>
                </Button>
                
                <Button
                  backgroundColor={isDark ? `${preferences.primaryColor}40` : `${adjustColor(preferences.primaryColor, 20)}80`}
                  br={12}
                  py={isWeb ? "$1" : "$1.5"}
                  onPress={handleSaveNote}
                  pressStyle={{ opacity: 0.7 }}
                  borderWidth={2}
                  borderColor={preferences.primaryColor}
                  flex={1}
                >
                  <Text
                    color={isDark ? "#f9f9f9" : `${adjustColor(preferences.primaryColor, -100)}80`}
                    fontFamily="$body"
                    fontSize={13}
                    fontWeight="600"
                  >
                    Save Changes
                  </Text>
                </Button>
              </>
            ) : (
              <Button
                backgroundColor={isDark ? `${preferences.primaryColor}40` : `${adjustColor(preferences.primaryColor, 20)}80`}
                br={12}
                py={isWeb ? "$1" : "$1.5"}
                onPress={handleSaveNote}
                pressStyle={{ opacity: 0.7 }}
                borderWidth={2}
                borderColor={preferences.primaryColor}
                flex={1}
              >
                <Text
                  color={isDark ? "#f9f9f9" : `${adjustColor(preferences.primaryColor, -100)}80`}
                  fontFamily="$body"
                  fontSize={14}
                  fontWeight="600"
                >
                  Save Note
                </Text>
              </Button>
            )}
          </XStack>
        </YStack>
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
