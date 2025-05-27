import React, { useRef, useState, useEffect } from 'react';
import { Platform, TextInput, Keyboard, View, Image, StyleSheet, ScrollView as RNScrollView, KeyboardAvoidingView, Dimensions } from 'react-native';
import { YStack, Button, XStack, Sheet, H3, Text, ScrollView } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { TagSelector } from '@/components/notes/TagSelector';
import { FormattingToolbar } from '@/components/notes/FormattingToolbar';
import { ContentInput } from '@/components/notes/ContentInput'; 
import type { Note, Attachment, Tag } from '@/types';
import { useUserStore } from '@/store';
import { useColorScheme } from '@/hooks';
import { isIpad } from '@/utils';

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
  const titleInputRef = useRef<TextInput>(null);
  const isIpadDevice = isIpad();
  const [isEditingTitle, setIsEditingTitle] = useState(true);
  const editingStartTimeRef = useRef<number>(0);
  const autoCommitTimer = useRef<NodeJS.Timeout | null>(null);
  
  // IMPORTANT: Keep a local copy of the title to edit
  const [localTitle, setLocalTitle] = useState(editTitle || '');

  useEffect(() => {
    setLocalTitle(editTitle || '');
  }, [editTitle]);

  // Focus the title input when the modal opens or when entering edit mode (after 500ms)
  useEffect(() => {
    if (isModalOpen && isEditingTitle) {
      const timer = setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, isEditingTitle]);

  // Setup keyboard listeners
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
        // When keyboard hides while editing title, auto-commit after 1s
        if (isEditingTitle && localTitle.trim() && localTitle.trim() !== editTitle.trim()) {
          if (autoCommitTimer.current) clearTimeout(autoCommitTimer.current);
          autoCommitTimer.current = setTimeout(() => {
            if (isEditingTitle && localTitle.trim() && localTitle.trim() !== editTitle.trim()) commitTitleChange();
          }, 1000);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      if (autoCommitTimer.current) clearTimeout(autoCommitTimer.current);
    };
  }, [isEditingTitle]);

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
                  icon={<MaterialIcons name="delete" size={12} color="white" />}
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

  // Function to commit title changes to parent state
  const commitTitleChange = () => {
    
    // Calculate time since editing started
    const timeNow = Date.now();
    const editingStartTime = editingStartTimeRef.current;
    const timeSinceEditingStarted = timeNow - editingStartTime;
    
    // If we just started editing (within the last 500ms), don't exit editing mode yet
    if (isEditingTitle && timeSinceEditingStarted < 500) {
      return;
    }
    // Only commit if the title is not empty and has changed
    if (localTitle.trim() && localTitle.trim() !== editTitle.trim()) {
      setEditTitle(localTitle.trim());
      setIsEditingTitle(false);
    } else if (!localTitle.trim()) {
      // If title is empty, do not exit editing mode
      return;
    } else {
      // If title hasn't changed, just exit editing mode
      setIsEditingTitle(false);
    }
  };

  // When the title input changes - ONLY update local state
  const handleTitleChange = (text: string) => {
    setLocalTitle(text);
  };

  // Add onBlur to title input to auto-commit after 1s
  const handleTitleBlur = () => {
    // Only auto-commit if the title is not empty and has changed
    if (isEditingTitle && localTitle.trim() && localTitle.trim() !== editTitle.trim()) {
      if (autoCommitTimer.current) clearTimeout(autoCommitTimer.current);
      autoCommitTimer.current = setTimeout(() => {
        if (isEditingTitle && localTitle.trim() && localTitle.trim() !== editTitle.trim()) commitTitleChange();
      }, 1000);
    }
  };

  // Clear timer if editing resumes
  useEffect(() => {
    if (isEditingTitle && autoCommitTimer.current) {
      clearTimeout(autoCommitTimer.current);
      autoCommitTimer.current = null;
    }
  }, [isEditingTitle]);

  // Reset local title and editing state when modal is opened
  useEffect(() => {
    if (isModalOpen) {
      setLocalTitle(editTitle || '');
      setIsEditingTitle(true);
    }
  }, [isModalOpen]);

  return (
    <Sheet
      modal
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      snapPoints={isWeb ? [85] : isIpadDevice ? [75] : [90]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        opacity={0.5}
        backgroundColor={isDark ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0.5)"}
      />
      <Sheet.Frame
        paddingHorizontal={isIpad() ? "$4" : "$3.5"}
        paddingBottom="$8"
        paddingTop={Platform.OS === 'web' ? "$2" : isIpad() ? 20 : 18} 
        backgroundColor={isDark ? "rgb(15, 14, 14)" : "#f1f1f1"}
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
            <XStack alignItems="center" flex={1} gap="$2" paddingHorizontal={12}>
              <TextInput
                ref={titleInputRef}
                placeholder="Enter title"
                autoCapitalize="sentences" 
                value={localTitle}
                onChangeText={handleTitleChange}
                returnKeyType="done" 
                onSubmitEditing={commitTitleChange}
                onBlur={handleTitleBlur}
                style={{ 
                  flex: 1, 
                  paddingVertical: isIpad() ? 8 : 8,
                  fontSize: isIpad() ? 24 : 20,
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  fontFamily: 'System',
                  color: isDark ? '#fff' : '#000',
                  maxWidth: Platform.OS === 'web' ? 210 : isIpad() ? 260 : 175,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                }} 
                placeholderTextColor={isDark ? "#888" : "#999"}
              />
              <Button
                size={Platform.OS === 'web' ? "$1.5" : "$2"} 
                circular
                icon={<MaterialIcons name="check" size={Platform.OS === 'web' ? 16 : 18} color={preferences.primaryColor} />} 
                onPress={commitTitleChange}
                backgroundColor="transparent"
                pressStyle={{ opacity: 0.7 }}
                aria-label="Save title"
              />
            </XStack>
          ) : (
            <XStack alignItems="center" px="$2" gap={0} minHeight={44}>
              <Text
                fontSize={isIpad() ? "$5" : 20}
                fontWeight="600"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1, paddingHorizontal: 6, paddingVertical: isIpad() ? 8 : 8, maxWidth: Platform.OS === 'web' ? 250 : isIpad() ? 300 : 150 }} 
              >
                {localTitle || editTitle || 'Untitled'}
              </Text>
              <Button
                size={Platform.OS === 'web' ? "$1.5" : "$1"} 
                circular
                icon={<MaterialIcons name="edit" size={Platform.OS === 'web' ? 16 : 18} />} 
                onPress={() => { setIsEditingTitle(true) }}
                backgroundColor="transparent"
                pressStyle={{ opacity: 0.7 }}
                color={isDark ? "#555555" : "#ccc"}
                aria-label="Edit title"
              />
            </XStack>
          )}
          <Button
            size={Platform.OS === 'web' ? "$2" : "$2"} 
            circular
            icon={<MaterialIcons name="close" size={Platform.OS === 'web' ? 18 : 22} />}
            onPress={handleCloseModal}
            backgroundColor="transparent"
            pressStyle={{ opacity: 0.7 }}
          />
        </XStack>
        
        <View style={{flex: 1}}>
          <View style={{ height: 1, marginVertical: isIpad() ? 10 : 6, marginHorizontal: -8 }} />
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? -124 : 0} 
          >
            <YStack flex={1} paddingHorizontal={isIpad() ? "$2.5" : "$1.5"}>
              <RNScrollView
                ref={scrollViewRef}
                style={{ 
                  flex: 1, 
                  maxHeight: keyboardVisible
                    ? isIpadDevice
                      ? Dimensions.get('window').height * 0.495 
                      : '50%'
                    : '100%'
                }}
                contentContainerStyle={{ 
                  paddingBottom: keyboardVisible ? bottomPadding : contentPadding
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="none"
              >
                <YStack gap={0} paddingTop={6} marginLeft={-8}>
                    <TagSelector tags={editTags} onTagsChange={handleTagsChange} />
                  </YStack>
                  <YStack gap={0} paddingTop={6} >
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
                  style={{ marginBottom: keyboardHeight - 75}}
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
                  paddingTop: Platform.OS === 'web' ? 12 : 4,
                  paddingBottom: Platform.OS === 'web' ? 0 : 4,
                }}
              >
                {!keyboardVisible &&
                <XStack 
                  gap="$4" 
                  justifyContent="space-between" 
                  marginTop={8}
                  paddingBottom={0}
                  marginBottom={0}
                >
                  {selectedNote ? (
                    <>
                      <Button
                        backgroundColor={isDark ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 0, 0, 0.1)"}
                        pressStyle={{ opacity: 0.7 }}
                        onPress={handleDeleteNote}
                        br={12}
                        py={Platform.OS === 'web' ? "$1" : "$1.5"}
                        flex={1}
                      >
                        <Text color={isDark ? "$red10" : "$red8"} fontFamily="$body" fontSize={13} fontWeight="600">
                          Delete
                        </Text>
                      </Button>
                      
                      <Button
                        backgroundColor={isDark ? `${preferences.primaryColor}40` : `${adjustColor(preferences.primaryColor, 20)}80`}
                        br={12}
                        py={Platform.OS === 'web' ? "$1" : "$1.5"}
                        onPress={() => {
                        if (localTitle.trim()) {
                          setEditTitle(localTitle.trim());
                        }
                        handleSaveNote();
                      }}
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
                          Save
                        </Text>
                      </Button>
                    </>
                  ) : (
                      <Button
                        backgroundColor={isDark ? `${preferences.primaryColor}40` : `${adjustColor(preferences.primaryColor, 20)}80`}
                        br={12}
                        py={Platform.OS === 'web' ? "$1" : "$1.5"}
                        onPress={() => {
                           if (localTitle.trim()) {
                             setEditTitle(localTitle.trim());
                           }
                           handleSaveNote();
                         }}
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
