import React, { useRef, useState, useEffect } from 'react';
import { Platform, TextInput, Keyboard, View, Image, StyleSheet, ScrollView as RNScrollView, KeyboardAvoidingView, Dimensions } from 'react-native';
import { YStack, Button, XStack, Sheet, H3, Text, ScrollView } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { TagSelector } from '../NewTaskModal/TagSelectorNew';
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
  // Enhanced safety checks to prevent iOS crashes
  const safeTags = (editTags || []).filter(tag => tag != null);
  const safeAttachments = (editAttachments || []).filter(attachment => attachment != null);
  
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const editingStartTimeRef = useRef<number>(0);
  const autoCommitTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Simple local title state - no complex syncing
  const [localTitle, setLocalTitle] = useState(editTitle || '');

  useEffect(() => {
    setLocalTitle(editTitle || '');
  }, [editTitle]);

  // Setup keyboard listeners
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        if (isModalOpen) {
          setKeyboardVisible(true);
          setKeyboardHeight(event.endCoordinates.height);
        }
      },
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (isModalOpen) {
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
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      if (autoCommitTimer.current) clearTimeout(autoCommitTimer.current);
    };
  }, [isEditingTitle, isModalOpen]);

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
    if (safeAttachments.length === 0) return null;
    return (
      <YStack gap="$2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            {safeAttachments.map(attachment => (
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
                      onError={(error) => {
                        console.warn('[AddNoteSheet] Image failed to load:', attachment.url, error);
                      }}
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

  // Simple immediate title change handler - no delays or timers
  const handleTitleChange = (text: string) => {
    setLocalTitle(text);
    // Update parent immediately to prevent state conflicts
    setEditTitle(text);
  };

  // Simple commit function for done/blur
  const commitTitleChange = () => {
    if (localTitle.trim()) {
      setEditTitle(localTitle.trim());
    }
    setIsEditingTitle(false);
  };

  // Reset when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setLocalTitle(editTitle || '');
      setIsEditingTitle(false);
    }
  }, [isModalOpen]);

  const handleLocalBold = () => {
    if (selection.start !== selection.end) {
      // Text is selected, wrap it
      const selectedText = editContent.substring(selection.start, selection.end);
      const newContent = 
        editContent.substring(0, selection.start) + 
        `**${selectedText}**` + 
        editContent.substring(selection.end);
      setEditContent(newContent);
    } else {
      // No text selected, insert markdown syntax and position cursor
      const boldSyntax = "****";
      const newContent = 
        editContent.substring(0, selection.start) + 
        boldSyntax + 
        editContent.substring(selection.end);
      setEditContent(newContent);
      
      // Move cursor to the middle of the bold syntax
      const newCursorPos = selection.start + 2; // Position between the **|**
      
      try {
        setTimeout(() => {
          if (contentInputRef.current) {
            contentInputRef.current.focus();
            if (contentInputRef.current.setSelection) {
              contentInputRef.current.setSelection(newCursorPos, newCursorPos);
            }
          }
        }, 10);
      } catch (error) {
        // Silently handle cursor positioning errors
      }
    }
  };

  const handleLocalItalic = () => {
    if (selection.start !== selection.end) {
      // Text is selected, wrap it
      const selectedText = editContent.substring(selection.start, selection.end);
      const newContent = 
        editContent.substring(0, selection.start) + 
        `*${selectedText}*` + 
        editContent.substring(selection.end);
      setEditContent(newContent);
    } else {
      // No text selected, insert markdown syntax and position cursor
      const italicSyntax = "**";
      const newContent = 
        editContent.substring(0, selection.start) + 
        italicSyntax + 
        editContent.substring(selection.end);
      setEditContent(newContent);
      
      // Move cursor to the middle of the italic syntax
      const newCursorPos = selection.start + 1; // Position between the *|*
      
      try {
        setTimeout(() => {
          if (contentInputRef.current) {
            contentInputRef.current.focus();
            if (contentInputRef.current.setSelection) {
              contentInputRef.current.setSelection(newCursorPos, newCursorPos);
            }
          }
        }, 10);
      } catch (error) {
        // Silently handle cursor positioning errors
      }
    }
  };

  const handleLocalUnderline = () => {
    if (selection.start !== selection.end) {
      // Text is selected, wrap it
      const selectedText = editContent.substring(selection.start, selection.end);
      const newContent = 
        editContent.substring(0, selection.start) + 
        `__${selectedText}__` + 
        editContent.substring(selection.end);
      setEditContent(newContent);
    } else {
      // No text selected, insert markdown syntax and position cursor
      const underlineSyntax = "____";
      const newContent = 
        editContent.substring(0, selection.start) + 
        underlineSyntax + 
        editContent.substring(selection.end);
      setEditContent(newContent);
      
      // Move cursor to the middle of the underline syntax
      const newCursorPos = selection.start + 2; // Position between the __|__
      
      try {
        setTimeout(() => {
          if (contentInputRef.current) {
            contentInputRef.current.focus();
            if (contentInputRef.current.setSelection) {
              contentInputRef.current.setSelection(newCursorPos, newCursorPos);
            }
          }
        }, 10);
      } catch (error) {
        // Silently handle cursor positioning errors
      }
    }
  };

  const handleCheckbox = () => {
    const checkboxSyntax = "- [ ] ";
    const newContent = 
      editContent.substring(0, selection.start) + 
      checkboxSyntax + 
      editContent.substring(selection.end);
    setEditContent(newContent);
    
    // Move cursor after the inserted checkbox - with safety check
    const newCursorPos = selection.start + checkboxSyntax.length;
    try {
      setTimeout(() => {
        if (contentInputRef.current) {
          contentInputRef.current.focus();
          if (contentInputRef.current.setSelection) {
            contentInputRef.current.setSelection(newCursorPos, newCursorPos);
          }
        }
      }, 10);
    } catch (error) {
      // Silently handle cursor positioning errors
    }
  };

  const handleCloseKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Sheet
      modal
      open={isModalOpen}
      onOpenChange={handleCloseModal}
      snapPoints={isWeb ? [85] : isIpadDevice ? [92] : [90]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        opacity={0.5}
        backgroundColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)"}
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
          paddingHorizontal="$1"
        >
          {isEditingTitle ? (
            <XStack alignItems="center" flex={1} gap="$2" paddingHorizontal={8} maxWidth="85%">
              <TextInput
                ref={titleInputRef}
                placeholder="Enter title"
                autoCapitalize="sentences" 
                value={localTitle}
                onChangeText={handleTitleChange}
                returnKeyType="done" 
                onSubmitEditing={commitTitleChange}
                style={{ 
                  flex: 1, 
                  paddingVertical: isIpad() ? 8 : 8,
                  fontSize: isIpad() ? 24 : 18,
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  fontFamily: 'System',
                  color: isDark ? '#fff' : '#000',
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
            <XStack alignItems="center" px="$1" gap={0} minHeight={44} flex={1} maxWidth="85%">
              <Text
                fontSize={isIpad() ? "$5" : 18}
                fontWeight="600"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ 
                  flex: 1, 
                  paddingHorizontal: 6, 
                  paddingVertical: isIpad() ? 8 : 8,
                }} 
              >
                {localTitle || editTitle || 'Untitled'}
              </Text>
              <Button
                size={Platform.OS === 'web' ? "$1.5" : "$1"} 
                circular
                icon={<MaterialIcons name="edit" size={Platform.OS === 'web' ? 16 : 18} />} 
                onPress={() => { 
                  setIsEditingTitle(true);
                  // Auto-focus the title input after state update
                  setTimeout(() => {
                    if (titleInputRef.current) {
                      titleInputRef.current.focus();
                    }
                  }, 100);
                }}
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
            flexShrink={0}
            marginLeft="$2"
          />
        </XStack>
        
        <View style={{flex: 1, marginTop: isIpad() ? 6 : 4}}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={
              isIpad() 
                ? (Dimensions.get('window').width > Dimensions.get('window').height ? -220 : -120) // iPad landscape vs portrait
                : Platform.OS === 'ios' ? -100 : 0
            } 
          >
            <YStack flex={1} paddingHorizontal={isIpad() ? "$1" : "$0"}>
              <RNScrollView
                ref={scrollViewRef}
                style={{ 
                  flex: 1, 
                  marginHorizontal: -16,
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
                <YStack 
                  gap={0} 
                  paddingTop={6}
                  display={keyboardVisible ? "none" : "flex"}
                >
                </YStack>
                  <YStack gap={0} paddingTop={4}  >
                  <YStack>
                    <ContentInput
                      ref={contentInputRef}
                      value={editContent}
                      onChangeText={setEditContent}
                      onSelectionChange={handleSelectionChange}
                      numberOfLines={keyboardVisible ? isIpad() ? 10 : 5 : isIpadDevice ? 10 : 12}
                      minHeight={keyboardVisible ? isIpad() ? 500 : 300 : isIpadDevice ? 600 : 450}
                    />
                  </YStack>
                  {renderAttachments()}
                </YStack>
              </RNScrollView>

              {keyboardVisible && (
                <YStack 
                  paddingHorizontal="$0"
                  paddingVertical="$1.5"
                  alignSelf="center"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{ marginBottom: isIpad() ? keyboardHeight - 90 : keyboardHeight - 110, width: '100%'}}
                >
                  <FormattingToolbar
                    onBold={handleLocalBold}
                    onItalic={handleLocalItalic}
                    onUnderline={handleLocalUnderline}
                    onBullet={handleBullet}
                    onCode={handleCode}
                    onCheckbox={handleCheckbox}
                    onAttachImage={handleImagePick}
                    onCloseKeyboard={handleCloseKeyboard}
                  />
                </YStack>
              )}
              
              <YStack 
                style={{
                  paddingTop: Platform.OS === 'web' ? 12 : 4,
                  paddingBottom: Platform.OS === 'web' ? 0 : 4,
                  paddingHorizontal: 6,
                }}
              >
                {!keyboardVisible &&
                <XStack 
                  gap="$10" 
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
                        borderWidth={2}
                        borderColor={isDark ? "$red10" : "$red8"}
                      >
                        <Text color={isDark ? "$red10" : "$red10"} fontFamily="$body" fontSize={13} fontWeight="600">
                          Delete
                        </Text>
                      </Button>
                      
                      <Button
                        backgroundColor={isDark ? "$blue9" :"$blue9"}
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
                        borderColor={isDark ? "$blue10" : "$blue8"}
                        flex={1}
                      >
                        <Text
                          color={isDark ? "white" : "white"}
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
