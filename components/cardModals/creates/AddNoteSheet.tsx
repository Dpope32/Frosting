import React, { useRef, useState, useEffect } from 'react';
import { Platform, TextInput, Keyboard, View, Image, StyleSheet, ScrollView as RNScrollView, KeyboardAvoidingView, Dimensions, useWindowDimensions } from 'react-native';
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
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
                backgroundColor={isDark ? "#1c1c1e" : "rgba(248, 250, 252, 0.95)"}
                borderRadius={12}
                overflow="hidden"
                width={120}
                height={90}
                position="relative"
                alignItems="center"
                justifyContent="center"
                borderWidth={isDark ? 0 : 1}
                borderColor={isDark ? "transparent" : "rgba(226, 232, 240, 0.8)"}
                shadowColor={isDark ? "transparent" : "rgba(0,0,0,0.1)"}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={isDark ? 0 : 0.25}
                shadowRadius={4}
                elevation={isDark ? 0 : 2}
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

  const contentPadding = isWeb ? 20 : isIpadDevice ? 16 :  20;
  const bottomPadding = isIpadDevice && keyboardVisible ? 0 : 0;

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
        opacity={isDark ? 0.6 : 0.4}
        backgroundColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(15,15,15,0.3)"}
      />
      <Sheet.Frame
        paddingHorizontal={isIpad() ? "$4" : "$3.5"}
        paddingBottom="$8"
        paddingTop={Platform.OS === 'web' ? "$2" : isIpad() ? 20 : 18} 
        backgroundColor={isDark ? "rgb(15, 14, 14)" : "rgba(255,255,255,0.98)"}
        maxWidth={Platform.OS === 'web' ? 600 : "100%"} 
        width={Platform.OS === 'web' ? 600 : "100%"} 
        alignSelf="center"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
        shadowColor={isDark ? "#000" : "#000"}
        shadowOffset={{ width: 0, height: -2 }}
        shadowOpacity={isDark ? 0.4 : 0.08}
        shadowRadius={12}
        elevation={isDark ? 8 : 3}
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
                placeholder="Enter note title..."
                autoCapitalize="sentences" 
                value={localTitle}
                onChangeText={handleTitleChange}
                returnKeyType="done" 
                onSubmitEditing={commitTitleChange}
                style={{ 
                  flex: 1, 
                  paddingVertical: isIpad() ? 12 : 10,
                  fontSize: isIpad() ? 24 : 20,
                  fontWeight: '600',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderWidth: isDark ? 1 : 1.5,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  fontFamily: 'System',
                  color: isDark ? '#fff' : '#1f2937',
                }} 
                placeholderTextColor={isDark ? "#888" : "#9ca3af"}
              />
              <Button
                size={Platform.OS === 'web' ? "$1.5" : "$2"} 
                circular
                icon={<MaterialIcons name="check" size={Platform.OS === 'web' ? 16 : 18} color="white" />} 
                onPress={commitTitleChange}
                backgroundColor={preferences.primaryColor}
                pressStyle={{ 
                  opacity: 0.8,
                  backgroundColor: adjustColor(preferences.primaryColor, -20)
                }}
                shadowColor={isDark ? "transparent" : `${preferences.primaryColor}40`}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={isDark ? 0 : 0.3}
                shadowRadius={4}
                elevation={isDark ? 0 : 2}
                aria-label="Save title"
              />
            </XStack>
          ) : (
            <XStack alignItems="center" px="$1" gap={0} minHeight={44} flex={1} maxWidth="85%">
              <Text
                fontSize={isIpad() ? "$5" : 20}
                fontWeight="600"
                numberOfLines={1}
                ellipsizeMode="tail"
                color={isDark ? "#fff" : "#1f2937"}
                style={{ 
                  flex: 1, 
                  paddingHorizontal: 6, 
                  paddingVertical: isIpad() ? 8 : 8,
                }} 
              >
                {localTitle || editTitle || 'Untitled Note'}
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
                backgroundColor={isDark ? "transparent" : "rgba(0,0,0,0.04)"}
                pressStyle={{ 
                  opacity: 0.7,
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
                }}
                color={isDark ? "#555555" : "#6b7280"}
                borderWidth={isDark ? 0 : 1}
                borderColor={isDark ? "transparent" : "rgba(0,0,0,0.06)"}
                aria-label="Edit title"
              />
            </XStack>
          )}
          <Button
            size={Platform.OS === 'web' ? "$2" : "$2"} 
            circular
            icon={<MaterialIcons name="close" size={Platform.OS === 'web' ? 18 : 22} color={isDark ? "#fff" : "#374151"} />}
            onPress={handleCloseModal}
            backgroundColor={isDark ? "transparent" : "rgba(0,0,0,0.04)"}
            pressStyle={{ 
              opacity: 0.7,
              backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
            }}
            borderWidth={isDark ? 0 : 1}
            borderColor={isDark ? "transparent" : "rgba(0,0,0,0.06)"}
            flexShrink={0}
            marginLeft="$2"
          />
        </XStack>
        
        <View style={{flex: 1, marginTop: isIpad() ? 6 : 4}}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={
              isIpadDevice 
                ? (windowWidth > windowHeight ? -220 : -80) 
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
                      ? Dimensions.get('window').height * 0.65 
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
                  <YStack gap={0} px={isIpad() ? 8 : 4} >
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
                  paddingVertical={isIpadDevice ? "$1.5" : "$2"}
                  alignSelf="center"
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor={isDark ? "transparent" : "rgba(255,255,255,0.95)"}
                  borderTopWidth={isDark ? 0 : 1}
                  borderTopColor={isDark ? "transparent" : "rgba(0,0,0,0.05)"}
                  style={{ 
                    marginBottom: isIpadDevice 
                      ? (windowWidth > windowHeight
                          ? keyboardHeight - 50 
                          : keyboardHeight - 90) 
                      : keyboardHeight - 110, 
                    width: '100%'
                  }}
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
                        backgroundColor={isDark ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 240, 240, 0.9)"}
                        pressStyle={{ 
                          opacity: 0.8,
                          backgroundColor: isDark ? "rgba(255, 0, 0, 0.3)" : "rgba(255, 220, 220, 0.95)"
                        }}
                        onPress={handleDeleteNote}
                        br={16}
                        py={Platform.OS === 'web' ? "$2" : "$2.5"}
                        flex={1}
                        borderWidth={isDark ? 2 : 1.5}
                        borderColor={isDark ? "$red10" : "rgba(220, 38, 38, 0.4)"}
                        shadowColor={isDark ? "transparent" : "rgba(220, 38, 38, 0.2)"}
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={isDark ? 0 : 0.3}
                        shadowRadius={6}
                        elevation={isDark ? 0 : 2}
                      >
                        <Text 
                          color={isDark ? "$red10" : "rgb(185, 28, 28)"} 
                          fontFamily="$body" 
                          fontSize={14} 
                          fontWeight="600"
                        >
                          Delete
                        </Text>
                      </Button>
                      
                      <Button
                        backgroundColor={isDark ? "$blue9" : "rgba(59, 130, 246, 0.95)"}
                        br={16}
                        py={Platform.OS === 'web' ? "$2" : "$2.5"}
                        onPress={() => {
                        if (localTitle.trim()) {
                          setEditTitle(localTitle.trim());
                        }
                        handleSaveNote();
                      }}
                        pressStyle={{ 
                          opacity: 0.9,
                          backgroundColor: isDark ? "$blue10" : "rgba(37, 99, 235, 0.98)"
                        }}
                        borderWidth={isDark ? 2 : 0}
                        borderColor={isDark ? "$blue10" : "transparent"}
                        flex={1}
                        shadowColor={isDark ? "transparent" : "rgba(59, 130, 246, 0.3)"}
                        shadowOffset={{ width: 0, height: 3 }}
                        shadowOpacity={isDark ? 0 : 0.4}
                        shadowRadius={8}
                        elevation={isDark ? 0 : 3}
                      >
                        <Text
                          color="white"
                          fontFamily="$body"
                          fontSize={14}
                          fontWeight="600"
                        >
                          Save Changes
                        </Text>
                      </Button>
                    </>
                  ) : (
                      <Button
                        backgroundColor={isDark ? `${preferences.primaryColor}40` : `${preferences.primaryColor}95`}
                        br={16}
                        py={Platform.OS === 'web' ? "$2" : "$2.5"}
                        onPress={() => {
                           if (localTitle.trim()) {
                             setEditTitle(localTitle.trim());
                           }
                           handleSaveNote();
                         }}
                        pressStyle={{ 
                          opacity: 0.9,
                          backgroundColor: isDark ? `${preferences.primaryColor}60` : `${adjustColor(preferences.primaryColor, -20)}`
                        }}
                        borderWidth={isDark ? 2 : 0}
                        borderColor={isDark ? preferences.primaryColor : "transparent"}
                        flex={1}
                        shadowColor={isDark ? "transparent" : `${preferences.primaryColor}40`}
                        shadowOffset={{ width: 0, height: 3 }}
                        shadowOpacity={isDark ? 0 : 0.4}
                        shadowRadius={8}
                        elevation={isDark ? 0 : 3}
                    >
                      <Text
                        color={isDark ? "#f9f9f9" : "white"}
                        fontFamily="$body"
                        fontSize={14}
                        fontWeight="600"
                      >
                        Create Note
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
