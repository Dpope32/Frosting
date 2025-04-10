import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import { Card, YStack, Text, Paragraph, XStack, ScrollView } from 'tamagui';
import { TouchableOpacity, Platform, StyleSheet, View, Image } from 'react-native';
import type { Note } from '@/types/notes';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ChevronDown, ChevronUp, Pencil } from '@tamagui/lucide-icons';
import { useNoteStore } from '@/store/NoteStore';
import { useMarkdownStyles } from '@/hooks/useMarkdownStyles';
import { ImageViewerModal } from './ImageViewerModal'; 
import { TagChip } from './TagChip';

type NoteCardProps = {
  note: Note;
  onPress: () => void;
  isDragging?: boolean;
  onEdit?: (note: Note) => void;
  drag?: () => void;
};

export const NoteCard = ({
  note,
  onPress,
  isDragging = false,
  onEdit,
  drag,
}: NoteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(note.isExpanded || false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null); 
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const paragraphSize = isWeb ? '$4' : '$3';
  const noteStore = useNoteStore();
  const { colors } = useMarkdownStyles();
  const noTagSpacerHeight = isWeb ? 40 : 6;

  useEffect(() => {
    if (note.isExpanded !== isExpanded) {
      noteStore.updateNote(note.id, { isExpanded });
    }
  }, [isExpanded, note.id]);

  const imageAttachments = useMemo(() => {
    return note.attachments?.filter(att => att.type === 'image') ?? [];
  }, [note.attachments]);

  const hasMarkdown = useMemo(() => {
    if (!note.content) return false;
    return Boolean(
      note.content.match(/(\*\*.*?\*\*)|(\*.*?\*)|^#+ |!\[.*?\]\(.*?\)|^- |\n- |```.*?```|> |\[.*?\]\(.*?\)|~~.*?~~|^[-*] |\n[-*] /)
    );
  }, [note.content]);

  const displayContent = useMemo(() => {
    if (!note.content) return '';
    return note.content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
  }, [note.content]);

  const handlePress = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    noteStore.updateNote(note.id, { isExpanded: newExpandedState });
  };

  const horizontalPadding = isWeb ? 20 : 12;
  const verticalPadding = isWeb ? 16 : 10;

  const cardSpecificStyle = useMemo(() => ({
    backgroundColor: colors.background,
    shadowColor: isDragging ? colors.accent : colors.shadow,
    shadowOffset: { width: 0, height: isDragging ? 4 : 2 },
    shadowOpacity: isDragging ? 0.3 : 0.1,
    shadowRadius: isDragging ? 6 : 2,
    elevation: isDragging ? 8 : 2,
    padding: verticalPadding,
    borderWidth: isDragging ? 1 : 0,
    borderColor: isDragging ? colors.cardBorderDragging : 'transparent',
    overflow: 'hidden' as 'hidden',
  }), [isDragging, colors]);


  return (
    <View style={localStyles.touchableContainer}>
      <Card
        elevate
        bordered
        animation="bouncy"
        scale={isDragging ? 0.9 : 1}
        opacity={isDragging ? 0.9 : 1}
        paddingBottom="$2"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.1}
        shadowRadius={2}
        borderRadius={10}
        style={cardSpecificStyle}
        minWidth={isWeb ? 300 : undefined}
      >
        <YStack gap="$0">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handlePress();
            }}
            onLongPress={(e) => {
              if (drag && !note.isExpanded) {
                e.stopPropagation();
                drag();
              }
            }}
            delayLongPress={300}
            activeOpacity={0.7}
            style={{ width: '100%' }}
          >
            <XStack
              paddingHorizontal={horizontalPadding}
              paddingTop={isWeb ? "$3" : "$2"}
              paddingBottom={isExpanded ? "$2" : (note.tags?.length ? "$3" : "$2")} 
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Text
                flex={1}
                fontSize={isWeb ? "$5" : "$4"}
                fontWeight="bold"
                numberOfLines={1}
                fontFamily="$heading"
                color={colors.text}
                mr="$2"
                className={isWeb ? "note-text" : undefined}
              >
                {note.title || 'Untitled Note'}
              </Text>
              {isExpanded ? (
                <ChevronUp size={isWeb ? 24 : 20} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={isWeb ? 24 : 20} color={colors.textSecondary} />
              )}
            </XStack>
          </TouchableOpacity>

          {!isExpanded ? (
            <TouchableOpacity
              onLongPress={(e) => {
                if (drag && !note.isExpanded) {
                  e.stopPropagation();
                  drag();
                }
              }}
              delayLongPress={300}
              activeOpacity={0.7}
              style={{ width: '100%' }}
            >
              <XStack
                flexWrap="wrap"
                paddingHorizontal={horizontalPadding}
                paddingBottom="$2"
                gap="$2"
                justifyContent="space-between"
                alignItems="center"
              >
                <XStack flexWrap="wrap" gap="$1.5" flexShrink={1} mr="$2" alignItems="center">
                  {note.tags?.map((tag) => (
                    <TagChip key={tag.id} tag={tag} />
                  ))}
                  {(!note.tags || note.tags.length === 0) && (
                    <View style={{ height: noTagSpacerHeight, width: 1 }} />
                  )}
                </XStack>
                <XStack alignItems="center" gap="$2">
                  <Text
                    fontSize={isWeb ? 13 : 10}
                    color={colors.textSecondary}
                    fontFamily="$body"
                    flexShrink={0}
                    className={isWeb ? "note-text" : undefined}
                  >
                    {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
                  </Text>
                </XStack>
              </XStack>
            </TouchableOpacity>
          ) : (
            <YStack>
              <View style={{ flex: 1 }}>
                {hasMarkdown ? (
                  <YStack paddingHorizontal={horizontalPadding} paddingBottom="$2">
                    <Markdown
                      style={{
                        body: { color: colors.text, fontFamily: '$body', fontSize: 16 },
                        heading1: { color: colors.text, fontFamily: '$heading', fontSize: 24 },
                        heading2: { color: colors.text, fontFamily: '$heading', fontSize: 20 },
                        heading3: { color: colors.text, fontFamily: '$heading', fontSize: 18 },
                        link: { color: colors.accent },
                        blockquote: { backgroundColor: colors.cardBorder, padding: 8, borderRadius: 4 },
                        code_inline: { backgroundColor: colors.cardBorder, padding: 4, borderRadius: 4 },
                        code_block: { backgroundColor: colors.cardBorder, padding: 8, borderRadius: 4 },
                        list_item: { color: colors.text },
                        bullet_list: { color: colors.text },
                        ordered_list: { color: colors.text },
                        hr: { backgroundColor: colors.cardBorder, height: 1 },
                        table: { borderWidth: 1, borderColor: colors.tableBorder },
                        thead: { backgroundColor: colors.cardBorder },
                        th: { padding: 4, borderWidth: 1, borderColor: colors.tableBorder, color: colors.text },
                        td: { padding: 4, borderWidth: 1, borderColor: colors.tableBorder, color: colors.text },
                        em: { fontStyle: 'italic', fontFamily: 'Inter-Regular' },
                        strong: { fontWeight: 'bold' },
                        del: { textDecorationLine: 'line-through' }
                      }}
                    >
                      {displayContent || ''}
                    </Markdown>
                  </YStack>
                ) : (
                  <Paragraph
                    size={paragraphSize}
                    fontFamily="$body"
                    paddingHorizontal={horizontalPadding}
                    paddingVertical="$2"
                    color={colors.text}
                    className={isWeb ? "note-text" : undefined}
                  >
                    {displayContent || ''}
                  </Paragraph>
                )}

                {imageAttachments.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    paddingHorizontal={horizontalPadding}
                    paddingBottom="$2"
                    contentContainerStyle={{ gap: 8 }}
                    scrollEventThrottle={16}
                    style={{ flexGrow: 0 }}
                  >
                    {imageAttachments.map((att) => (
                      <TouchableOpacity
                        key={att.id}
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedImageUrl(att.url);
                        }}
                      >
                        <View style={[localStyles.attachmentContainer, { width: 150, height: 120 }]}>
                          <Image
                            source={{ uri: att.url }}
                            style={localStyles.attachmentImage}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  onLongPress={(e) => {
                    if (drag && !note.isExpanded) {
                      e.stopPropagation();
                      drag();
                    }
                  }}
                  delayLongPress={300}
                  activeOpacity={0.7}
                  style={{ width: '100%' }}
                >
                  <XStack
                    flexWrap="wrap"
                    paddingHorizontal={horizontalPadding}
                    paddingTop="$1"
                    paddingBottom="$2"
                    gap="$1.5"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <XStack flexWrap="wrap" gap="$1.5" flexShrink={1} mr="$2" alignItems="center">
                      {note.tags?.map((tag) => (
                        <TagChip key={tag.id} tag={tag} />
                      ))}
                      {(!note.tags || note.tags.length === 0) && (
                        <View style={{ height: noTagSpacerHeight, width: 1 }} />
                      )}
                    </XStack>
                    <XStack paddingBottom={isWeb? 0 : 2} alignItems="center" gap="$2">
                      <Text
                        fontSize={isWeb? 13 : 11}
                        color={colors.textSecondary}
                        fontFamily="$body"
                        flexShrink={0}
                        className={isWeb ? "note-text" : undefined}
                      >
                        {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
                      </Text>
                      {onEdit && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            onEdit(note);
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Pencil size={isWeb ? 18 : 16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      )}
                    </XStack>
                  </XStack>
                </TouchableOpacity>
              </View>
            </YStack>
          )}
        </YStack>
      </Card>
      <ImageViewerModal
        imageUrl={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />
    </View>
  );
};

NoteCard.displayName = 'NoteCard';

const localStyles = StyleSheet.create({
  touchableContainer: {
    width: '100%',
    paddingVertical: Platform.OS === 'web' ? 2 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 2 : 0,
    flexShrink: 1,
    alignSelf: 'flex-start',
    height: 'auto',
  },
  attachmentContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
