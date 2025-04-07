import React, { forwardRef, useMemo } from 'react';
import { Card, YStack, Text, Paragraph, useTheme, XStack, Image as TamaguiImage } from 'tamagui';
import { TouchableOpacity, Platform, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Note } from '@/types/notes';
import Markdown from 'react-native-markdown-display';
import { withOpacity } from '@/utils/styleUtils';

type NoteCardProps = {
  note: Note;
  onPress: () => void;
  onLongPress?: () => void;
  isDragging?: boolean;
};

export const NoteCard = forwardRef<React.ElementRef<typeof TouchableOpacity>, NoteCardProps>(({
  note,
  onPress,
  onLongPress,
  isDragging = false,
}, ref) => {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';
  const paragraphSize = isWeb ? '$4' : '$3';
  
  // Extract first image from note content or attachments
  const previewImage = useMemo(() => {
    // First check attachments
    if (note.attachments && note.attachments.length > 0) {
      const imageAttachment = note.attachments.find(att => att.type === 'image');
      if (imageAttachment) return imageAttachment.url;
    }
    
    // Then check markdown content for images
    if (note.content) {
      const imageMatch = note.content.match(/!\[.*?\]\((.*?)\)/);
      if (imageMatch && imageMatch[1]) return imageMatch[1];
    }
    
    return null;
  }, [note.attachments, note.content]);
  
  // Check for more comprehensive markdown content
  const hasMarkdown = useMemo(() => {
    if (!note.content) return false;
    
    return Boolean(
      note.content.match(/(\*\*.*?\*\*)|(\*.*?\*)|^#+ |!\[.*?\]\(.*?\)|^- |\n- |```.*?```|> |\[.*?\]\(.*?\)|~~.*?~~|^[-*] |\n[-*] /)
    );
  }, [note.content]);
  
  // Process content for display
  const displayContent = useMemo(() => {
    if (!note.content) return '';
    
    // Strip out image syntax for cards to avoid broken image placeholders
    return note.content.replace(/!\[.*?\]\(.*?\)/g, '');
  }, [note.content]);
  
  // Apply direct style for background color
  const cardStyle = StyleSheet.create({
    card: {
      backgroundColor: note.color || (theme.background.val === '#000000' ? '#121212' : theme.background.val),
      // Add shadow and elevation for better visual feedback during drag
      shadowColor: isDragging ? theme.blue9.val : theme.shadowColor?.val || '#000',
      shadowOffset: { width: 0, height: isDragging ? 4 : 2 },
      shadowOpacity: isDragging ? 0.3 : 0.1,
      shadowRadius: isDragging ? 6 : 2,
      elevation: isDragging ? 8 : 2,
      // Add a subtle border during drag
      borderWidth: isDragging ? 1 : 0,
      borderColor: isDragging ? theme.blue9.val : 'transparent',
      overflow: 'hidden'
    }
  });
  
  const textColor = theme.color.val;
  const horizontalPadding = isWeb ? 20 : 16;
  
  // Determine if we should show an image preview at the top
  const showImagePreview = Boolean(previewImage);

  return (
    <TouchableOpacity
      ref={ref}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      activeOpacity={0.7}
      style={{
        width: '100%',
        padding: 2,
        paddingHorizontal: isWeb ? 6 : 2,
        flexShrink: 1,
        alignSelf: 'flex-start',
        height: 'auto',
      }}
    >
      <Card
        elevate
        bordered
        animation="bouncy"
        scale={isDragging ? 1.05 : 1}
        opacity={isDragging ? 0.9 : 1}
        padding="$0"
        minHeight={90}
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.1}
        shadowRadius={2}
        borderRadius={10}
        style={cardStyle.card}
      >
        <YStack gap="$0">
          {showImagePreview && (
            <View style={{ 
              width: '100%', 
              height: 120, 
              backgroundColor: '#eaeaea',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              overflow: 'hidden'
            }}>
              {previewImage && (
                <Image 
                  source={{ uri: previewImage as string }}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    resizeMode: 'cover'
                  }}
                />
              )}
            </View>
          )}
          <Text 
            fontSize="$5" 
            fontWeight="bold" 
            numberOfLines={1}
            fontFamily="$heading"
            padding="$2"
            paddingTop={showImagePreview ? "$2" : "$3"}
            paddingBottom="$1"
            paddingHorizontal={horizontalPadding}
            color={textColor}
          >
            {note.title || 'Untitled Note'}
          </Text>
          
          {hasMarkdown ? (
            <YStack paddingHorizontal={horizontalPadding} paddingBottom="$2">
              <Markdown
                style={{
                  body: {
                    color: textColor,
                    fontSize: isWeb ? 14 : 13,
                    fontFamily: 'Inter-Regular',
                  },
                  paragraph: {
                    marginVertical: 2,
                  },
                  heading1: {
                    fontSize: isWeb ? 18 : 16,
                    fontWeight: 'bold',
                    marginTop: 6,
                    marginBottom: 4,
                    color: textColor,
                  },
                  heading2: {
                    fontSize: isWeb ? 16 : 14,
                    fontWeight: 'bold',
                    marginTop: 5,
                    marginBottom: 3,
                    color: textColor,
                  },
                  heading3: {
                    fontSize: isWeb ? 14 : 13,
                    fontWeight: 'bold',
                    marginTop: 4,
                    marginBottom: 2,
                    color: textColor,
                  },
                  link: {
                    color: theme.blue9.val,
                    textDecorationLine: 'underline',
                  },
                  blockquote: {
                    backgroundColor: withOpacity(theme.backgroundHover.val, 0.1),
                    borderLeftColor: theme.gray8.val,
                    borderLeftWidth: 4,
                    paddingLeft: 8,
                    paddingVertical: 4,
                    marginVertical: 4,
                  },
                  code_inline: {
                    backgroundColor: withOpacity(theme.backgroundHover.val, 0.2),
                    color: theme.blue9.val,
                    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                    padding: 2,
                    borderRadius: 3,
                  },
                  code_block: {
                    backgroundColor: withOpacity(theme.backgroundHover.val, 0.2),
                    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                    padding: 6,
                    borderRadius: 4,
                    fontSize: isWeb ? 12 : 11,
                  },
                  image: {
                    display: 'none',
                  },
                  bullet_list: {
                    marginLeft: 8,
                  },
                  ordered_list: {
                    marginLeft: 8,
                  },
                  list_item: {
                    marginVertical: 1,
                    flexDirection: 'row',
                  },
                  hr: {
                    backgroundColor: theme.gray6.val,
                    height: 1,
                    marginVertical: 6,
                  },
                  table: {
                    borderWidth: 1,
                    borderColor: theme.gray8.val,
                    marginVertical: 4,
                  },
                  thead: {
                    backgroundColor: withOpacity(theme.backgroundHover.val, 0.2),
                  },
                  th: {
                    padding: 4,
                    borderWidth: 1,
                    borderColor: theme.gray8.val,
                  },
                  td: {
                    padding: 4,
                    borderWidth: 1,
                    borderColor: theme.gray8.val,
                  },
                  em: {
                    fontStyle: 'italic',
                  },
                  strong: {
                    fontWeight: 'bold',
                  },
                  del: {
                    textDecorationLine: 'line-through',
                  }
                }}
              >
                {displayContent}
              </Markdown>
            </YStack>
          ) : (
            <Paragraph 
              size={paragraphSize} 
              numberOfLines={2}
              fontFamily="$body"
              paddingHorizontal={horizontalPadding}
              paddingBottom="$2"
              color={textColor}
            >
              {displayContent}
            </Paragraph>
          )}
          
          <XStack 
            paddingHorizontal={horizontalPadding}
            paddingBottom="$3"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text 
              fontSize={isWeb ? "$2" : "$3"} 
              color={theme.gray10.val} 
              fontFamily="$body"
            >
              {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
            </Text>
            
            {note.attachments && note.attachments.length > 0 && (
              <XStack alignItems="center">
                <Ionicons name="image" size={14} color={theme.gray10.val} />
                <Text 
                  fontSize={isWeb ? "$2" : "$3"}
                  color={theme.gray10.val} 
                  marginLeft="$1"
                  fontFamily="$body"
                >
                  {note.attachments.length}
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>
      </Card>
    </TouchableOpacity>
  );
});

NoteCard.displayName = 'NoteCard';