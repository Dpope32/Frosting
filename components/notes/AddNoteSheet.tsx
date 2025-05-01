import React, { useRef, useState, useEffect } from 'react';
import { Platform, TextInput, Keyboard, View, Image, StyleSheet, ScrollView as RNScrollView, KeyboardAvoidingView, Dimensions } from 'react-native';
import { YStack, Button, XStack, Sheet, H3, Text, ScrollView } from 'tamagui';
import { X, Pencil } from '@tamagui/lucide-icons';
import { useAutoFocus } from '@/hooks/useAutoFocus'; // Import the hook
import { DebouncedInput, DebouncedInputHandle } from '@/components/shared/debouncedInput';
import { TagSelector } from '@/components/notes/TagSelector';
import { FormattingToolbar } from './FormattingToolbar';
import { ContentInput } from './ContentInput'; 
import type { Note, Attachment, Tag } from '@/types/notes';
import { useUserStore } from '@/store/UserStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isIpad } from '@/utils/deviceUtils';

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<RNScrollView>(null);
  const titleInputRef = useRef<DebouncedInputHandle>(null);
  const isIpadDevice = isIpad();
  const [isEditingTitle, setIsEditingTitle] = useState(true);

  useAutoFocus(titleInputRef, 300, isModalOpen && isEditingTitle); // Reduced delay

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        // Removed setIsEditingTitle(false) here
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []); // Removed isEditingTitle dependency

  // Removed the old useEffect for autofocus

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

  const contentPadding = isWeb ? 20 : isIpadDevice ? 16 : keyboardVisible ? 20 : 20;
  const bottomPadding = isIpadDevice && keyboardVisible ? 70 : 0;

  return (
    <Sheet
      modal
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      snapPoints={isWeb ? [85] : [90]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        opacity={0.5}
      />
      <Sheet.Frame
        paddingHorizontal={isIpad() ? "$4" : "$2"}
        paddingBottom="$8"
        paddingTop={Platform.OS === 'web' ? "$2" : isIpad() ? 16 : 14} 
        backgroundColor={isDark ? "rgb(10, 10, 10)" : "#f1f1f1"}
        maxWidth={Platform.OS === 'web' ? 600 : "100%"} 
        width={Platform.OS === 'web' ? 600 : "100%"} 
        alignSelf="center"
      >

        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginBottom={0}
          paddingTop="$1"
        >
          {isEditingTitle ? (
            <DebouncedInput
              ref={titleInputRef}
              placeholder="Title"
              autoCapitalize="words" 
              value={editTitle}
              onDebouncedChange={setEditTitle}
              onBlur={() => setIsEditingTitle(false)} 
              returnKeyType="done" 
              backgroundColor="transparent"
              borderWidth={0}
              fontSize={24}
              autoComplete="off"
              autoFocus={true}
              style={{ flex: 1, paddingVertical: isIpad() ? 8 : 8, maxWidth: Platform.OS === 'web' ? 250 : isIpad() ? 300 : 220 }} 
              placeholderTextColor="#aaa"
            />
          ) : (
            <XStack alignItems="center" gap="$2" minHeight={44}>
              <Text
                fontSize="$5"
                fontWeight="600"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1, paddingHorizontal: 8, paddingVertical: isIpad() ? 8 : 8, maxWidth: Platform.OS === 'web' ? 250 : isIpad() ? 300 : 220 }} 
              >
                {editTitle || 'Untitled'}
              </Text>
              <Button
                size={Platform.OS === 'web' ? "$1.5" : "$2"} 
                circular
                icon={<Pencil size={Platform.OS === 'web' ? 16 : 18} />} 
                onPress={() => setIsEditingTitle(true)}
                backgroundColor="transparent"
                pressStyle={{ opacity: 0.7 }}
                aria-label="Edit title"
              />
            </XStack>
          )}
          <Button
            size={Platform.OS === 'web' ? "$2" : "$2"} 
            circular
            icon={<X size={Platform.OS === 'web' ? 18 : 22} />}
            onPress={handleCloseModal}
            backgroundColor="transparent"
            pressStyle={{ opacity: 0.7 }}
          />
        </XStack>
        
        <View style={{flex: 1}}>
          <View style={{ height: 1, marginVertical: 12, marginHorizontal: -10 }} />
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? -124 : 0} 
          >
            <YStack flex={1} paddingHorizontal={isIpad() ? "$2.5" : "$2.5"}>
              <RNScrollView
                ref={scrollViewRef}
                style={{ 
                  flex: 1, 
                  maxHeight: keyboardVisible
                    ? isIpadDevice
                      ? Dimensions.get('window').height * 0.495 
                      : '48%'
                    : '100%'
                }}
                contentContainerStyle={{ 
                  paddingBottom: keyboardVisible ? bottomPadding : contentPadding
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="none" // Keep keyboard open
              >
                <YStack gap={0} paddingTop={0}>
                  <YStack>
                    <TagSelector tags={editTags} onTagsChange={handleTagsChange} />
                  </YStack>
                  <View style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', marginVertical: 12, marginHorizontal: -10 }} />
                  <YStack>
                    <ContentInput
                      ref={contentInputRef}
                      value={editContent}
                      onChangeText={setEditContent}
                      onSelectionChange={handleSelectionChange}
                      numberOfLines={keyboardVisible ? 5 : 12}
                      minHeight={keyboardVisible ? 300 : isIpadDevice ? 400 : 450}
                    />
                  </YStack>
                  {renderAttachments()}
                </YStack>
              </RNScrollView>

              {keyboardVisible && (
                <YStack 
                  paddingHorizontal="$2"
                  paddingVertical="$1.5"
                  borderTopWidth={1}
                  borderTopColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                  alignSelf="center"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <FormattingToolbar
                    onBold={handleBold}
                    onItalic={handleItalic}
                    onUnderline={handleUnderline}
                    onBullet={handleBullet}
                    onCode={handleCode}
                    onAttachImage={handleImagePick}
                  />
                </YStack>
              )}
              
              <YStack 
                style={{
                  paddingTop: Platform.OS === 'web' ? 12 : 4, // Use Platform.OS
                  paddingBottom: Platform.OS === 'web' ? 0 : 4, // Use Platform.OS
                }}
              >
                {!keyboardVisible && // Only show buttons when keyboard is hidden
                <XStack 
                  gap="$2" 
                  justifyContent="space-between" 
                  marginTop={8}
                  paddingBottom={0}
                  marginBottom={0}
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
                        py={Platform.OS === 'web' ? "$1" : "$1.5"} // Use Platform.OS
                        flex={1}
                      >
                        <Text color={isDark ? "$red10" : "$red8"} fontFamily="$body" fontSize={13} fontWeight="600">
                          Delete Note
                        </Text>
                      </Button>
                      
                      <Button
                        backgroundColor={isDark ? `${preferences.primaryColor}40` : `${adjustColor(preferences.primaryColor, 20)}80`}
                        br={12}
                        py={Platform.OS === 'web' ? "$1" : "$1.5"} // Use Platform.OS
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
                        py={Platform.OS === 'web' ? "$1" : "$1.5"} // Use Platform.OS
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
                }
              </YStack>
            </YStack>
          </KeyboardAvoidingView>
        </View>
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
