import React, { useRef, useState, useEffect } from 'react';
import { Platform, TextInput, Keyboard, View, Image, StyleSheet, ScrollView as RNScrollView, KeyboardAvoidingView, Dimensions, useWindowDimensions } from 'react-native';
import { YStack, Button, XStack, Sheet, H3, Text, ScrollView } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
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

  // Enhanced responsive styling
  const webMaxWidth = 700;
  const webPadding = 32;
  const mobilePadding = 16;
  const contentHorizontalPadding = isWeb ? 24 : isIpadDevice ? 20 : 16;

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
        paddingHorizontal={isWeb ? 0 : isIpad() ? "$4" : "$3.5"}
        paddingBottom={isWeb ? "$4" : "$8"}
        paddingTop={isWeb ? "$3" : Platform.OS === 'web' ? "$2" : isIpad() ? 20 : 18} 
        backgroundColor={isDark ? "rgb(15, 14, 14)" : "rgba(255,255,255,0.98)"}
        maxWidth={isWeb ? webMaxWidth : "100%"} 
        width={isWeb ? webMaxWidth : "100%"} 
        alignSelf="center"
        borderTopLeftRadius={isWeb ? 24 : 20}
        borderTopRightRadius={isWeb ? 24 : 20}
        shadowColor={isDark ? "#000" : "#000"}
        shadowOffset={{ width: 0, height: isWeb ? -4 : -2 }}
        shadowOpacity={isDark ? 0.4 : (isWeb ? 0.12 : 0.08)}
        shadowRadius={isWeb ? 16 : 12}
        elevation={isDark ? 8 : (isWeb ? 5 : 3)}
      >

        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginBottom={isWeb ? 16 : 12}
          paddingTop="$1"
          paddingHorizontal={isWeb ? "$2" : "$1"}
        >
          {isEditingTitle ? (
            <XStack alignItems="center" flex={1} gap="$2" paddingHorizontal={isWeb ? 0 : 8} maxWidth="85%">
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
                  paddingVertical: isWeb ? 16 : isIpad() ? 12 : 10,
                  fontSize: isWeb ? 28 : isIpad() ? 24 : 20,
                  fontWeight: '600',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderWidth: isDark ? 1 : 1.5,
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                  borderRadius: isWeb ? 16 : 12,
                  paddingHorizontal: isWeb ? 20 : 16,
                  fontFamily: 'System',
                  color: isDark ? '#fff' : '#1f2937',
                }} 
                placeholderTextColor={isDark ? "#888" : "#9ca3af"}
              />
              <Button
                size={isWeb ? "$2.5" : Platform.OS === 'web' ? "$1.5" : "$2"} 
                circular
                icon={<MaterialIcons name="check" size={isWeb ? 20 : Platform.OS === 'web' ? 16 : 18} color="white" />} 
                onPress={commitTitleChange}
                backgroundColor={preferences.primaryColor}
                pressStyle={{ 
                  opacity: 0.8,
                  backgroundColor: adjustColor(preferences.primaryColor, -20)
                }}
                shadowColor={isDark ? "transparent" : `${preferences.primaryColor}40`}
                shadowOffset={{ width: 0, height: isWeb ? 3 : 2 }}
                shadowOpacity={isDark ? 0 : 0.3}
                shadowRadius={isWeb ? 6 : 4}
                elevation={isDark ? 0 : 2}
                aria-label="Save title"
              />
            </XStack>
          ) : (
            <XStack alignItems="center" px={isWeb ? "$2" : "$1"} gap={0} minHeight={isWeb ? 52 : 44} flex={1} maxWidth="85%">
              <Text
                fontSize={isWeb ? 28 : isIpad() ? "$5" : 20}
                fontWeight="600"
                numberOfLines={1}
                fontFamily="$body"  
                ellipsizeMode="tail"
                color={isDark ? "#fff" : "#1f2937"}
                style={{ 
                  flex: 1, 
                  paddingHorizontal: isWeb ? 8 : 6, 
                  paddingVertical: isWeb ? 12 : isIpad() ? 8 : 8,
                }} 
              >
                {localTitle || editTitle || 'New Note'}
              </Text>
              <Button
                size={isWeb ? "$2" : Platform.OS === 'web' ? "$1.5" : "$1"} 
                circular
                icon={<MaterialIcons name="edit" size={isWeb ? 20 : Platform.OS === 'web' ? 16 : 18} />} 
                onPress={() => { 
                  setIsEditingTitle(true);
                  setTimeout(() => {
                    if (titleInputRef.current) {
                      titleInputRef.current.focus();
                    }
                  }, 100);
                }}
                backgroundColor="transparent"
                pressStyle={{ 
                  opacity: 0.7,
                  backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"
                }}
                color={isDark ? "#666666" : "#6b7280"}
                borderWidth={0}
                borderColor="transparent"
                aria-label="Edit title"
              />
            </XStack>
          )}
          <Button
            size={isWeb ? "$2.5" : Platform.OS === 'web' ? "$2" : "$2"} 
            circular
            icon={<MaterialIcons name="close" size={isWeb ? 22 : Platform.OS === 'web' ? 18 : 22} color={isDark ? "#fff" : "#374151"} />}
            onPress={handleCloseModal}
            backgroundColor="transparent"
            pressStyle={{ 
              opacity: 0.7,
              backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"
            }}
            borderWidth={0}
            borderColor="transparent"
            flexShrink={0}
            marginLeft="$2"
          />
        </XStack>
        
        <View style={{flex: 1, marginTop: isWeb ? 8 : isIpad() ? 6 : 4}}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={
              isIpadDevice 
                ? (windowWidth > windowHeight ? -220 : -80) 
                : Platform.OS === 'ios' ? -100 : 0
            }
          >
            <YStack flex={1} paddingHorizontal={isWeb ? 0 : isIpad() ? "$1" : "$0"}>
              <RNScrollView
                ref={scrollViewRef}
                style={{ 
                  flex: 1, 
                  marginHorizontal: isWeb ? 0 : 0,
                  maxHeight: keyboardVisible
                    ? isIpadDevice
                      ? Dimensions.get('window').height * 0.65 
                      : '50%'
                    : '100%'
                }}
                contentContainerStyle={{ 
                  paddingBottom: keyboardVisible ? bottomPadding : (isWeb ? 16 : 12),
                  paddingHorizontal: isWeb ? webPadding : 0
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                keyboardDismissMode="none"
              >
                  <YStack 
                    gap={isWeb ? 8 : 5} 
                    paddingHorizontal={isWeb ? 0 : (isIpad() ? 8 : 2)}
                    paddingTop={isWeb ? 4 : 0}
                  >
                  <YStack>
                    <ContentInput
                      ref={contentInputRef}
                      value={editContent}
                      onChangeText={setEditContent}
                      onSelectionChange={handleSelectionChange}
                      numberOfLines={keyboardVisible ? (isIpad() ? 12 : 8) : (isWeb ? 20 : isIpadDevice ? 15 : 16)}
                      minHeight={keyboardVisible ? (isIpad() ? 500 : 350) : (isWeb ? 500 : isIpadDevice ? 700 : 550)}
                    />
                  </YStack>
                  {renderAttachments()}
                </YStack>
              </RNScrollView>

              {keyboardVisible && (
                <YStack 
                  paddingHorizontal={isWeb ? webPadding : "$0"}
                  paddingVertical={isIpadDevice ? "$1.5" : "$2"}
                  alignSelf="center"
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor={isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.98)"}
                  borderTopWidth={isDark ? 1 : 1}
                  borderTopColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
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
                borderTopWidth={isWeb ? 1 : 0}
                borderTopColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                style={{
                  paddingTop: isWeb ? 20 : 16,
                  paddingBottom: isWeb ? 8 : 12,
                  paddingHorizontal: isWeb ? webPadding : 16,
                  marginTop: 'auto',
                  marginHorizontal: isWeb ? 0 : -16,
                }}
              >
                {!keyboardVisible &&
                <XStack 
                  gap={isWeb ? 16 : 12} 
                  justifyContent="space-between" 
                  alignItems="center"
                  paddingHorizontal={isWeb ? 10 : 20}
                  marginHorizontal={isWeb ? 10 : 12}
                >
                  {selectedNote ? (
                    <>
                      <Button
                        backgroundColor={"transparent"}
                        pressStyle={{ 
                          opacity: 0.85,
                          backgroundColor: isDark ? "rgba(255, 69, 58, 0.18)" : "rgba(254, 226, 226, 1)",
                          transform: [{ scale: 0.98 }]
                        }}
                        onPress={handleDeleteNote}
                        borderRadius={isWeb ? 12 : 10}
                        paddingHorizontal={isWeb ? 20 : 16}
                        minWidth={isWeb ? 100 : 80}
                        minHeight={isWeb ? 46 : 44}
                        alignItems="center"
                        justifyContent="center"
                        shadowColor={isDark ? "transparent" : "rgba(220, 38, 38, 0.15)"}
                        shadowOffset={{ width: 0, height: isWeb ? 2 : 1 }}
                        shadowOpacity={isDark ? 0 : 0.25}
                        shadowRadius={isWeb ? 6 : 4}
                        elevation={isDark ? 0 : 2}
                      >
                        <Text 
                          color={isDark ? "rgb(255, 69, 58)" : "rgb(220, 38, 38)"} 
                          fontFamily="$body" 
                          fontSize={isWeb ? 16 : 15} 
                          fontWeight="600"
                          textAlign="center"
                          lineHeight={isWeb ? 20 : 18}
                        >
                          Delete Note
                        </Text>
                      </Button>
                      
                      <Button
                        backgroundColor={isDark ? "rgba(10, 132, 255, 0.15)" : "rgba(59, 130, 246, 1)"}
                        borderRadius={isWeb ? 16 : 14}
                        paddingHorizontal={isWeb ? 24 : 20}
                        onPress={() => {
                          if (localTitle.trim()) {
                            setEditTitle(localTitle.trim());
                          }
                          handleSaveNote();
                        }}
                        pressStyle={{ 
                          opacity: 0.9,
                          backgroundColor: isDark ? "rgba(10, 132, 255, 0.22)" : "rgba(37, 99, 235, 1)",
                          transform: [{ scale: 0.98 }]
                        }}
                        borderWidth={isDark ? 1 : 0}
                        borderColor={isDark ? "rgba(10, 132, 255, 0.3)" : "transparent"}
                        flex={1}
                        shadowColor={isDark ? "transparent" : "rgba(59, 130, 246, 0.25)"}
                        shadowOffset={{ width: 0, height: isWeb ? 3 : 2 }}
                        shadowOpacity={isDark ? 0 : 0.35}
                        shadowRadius={isWeb ? 8 : 6}
                        elevation={isDark ? 0 : 3}
                        minHeight={isWeb ? 50 : 48}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          color={isDark ? "rgb(10, 132, 255)" : "white"}
                          fontFamily="$body"
                          fontSize={isWeb ? 16 : 15}
                          fontWeight="600"
                          textAlign="center"
                          lineHeight={isWeb ? 20 : 18}
                        >
                          Save Changes
                        </Text>
                      </Button>
                    </>
                  ) : (
                      <Button
                        backgroundColor={isDark ? `${preferences.primaryColor}20` : preferences.primaryColor}
                        borderRadius={isWeb ? 16 : 14}
                        paddingHorizontal={isWeb ? 24 : 20}
                        onPress={() => {
                           if (localTitle.trim()) {
                             setEditTitle(localTitle.trim());
                           }
                           handleSaveNote();
                         }}
                        pressStyle={{ 
                          opacity: 0.9,
                          backgroundColor: isDark ? `${preferences.primaryColor}30` : `${adjustColor(preferences.primaryColor, -20)}`,
                          transform: [{ scale: 0.98 }]
                        }}
                        borderWidth={isDark ? 1 : 0}
                        borderColor={isDark ? `${preferences.primaryColor}40` : "transparent"}
                        flex={1}
                        shadowColor={isDark ? "transparent" : `${preferences.primaryColor}30`}
                        shadowOffset={{ width: 0, height: isWeb ? 3 : 2 }}
                        shadowOpacity={isDark ? 0 : 0.35}
                        shadowRadius={isWeb ? 8 : 6}
                        elevation={isDark ? 0 : 3}
                        minHeight={isWeb ? 50 : 48}
                        alignItems="center"
                        justifyContent="center"
                    >
                      <Text
                        color={isDark ? preferences.primaryColor : "white"}
                        fontFamily="$body"
                        fontSize={isWeb ? 16 : 15}
                        fontWeight="600"
                        textAlign="center"
                        lineHeight={isWeb ? 20 : 18}
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
