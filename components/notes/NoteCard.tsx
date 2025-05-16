// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { Card, YStack, Text, Paragraph, XStack, ScrollView, isWeb } from 'tamagui';
import { TouchableOpacity, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Note } from '@/types';
import Markdown from 'react-native-markdown-display';
import { ChevronDown, ChevronUp, Pencil } from '@tamagui/lucide-icons';
import { useNoteStore } from '@/store';
import { useMarkdownStyles } from '@/hooks/useMarkdownStyles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SimpleImageViewer } from './SimpleImageViewer';
import { TagChip } from './TagChip';
import { isIpad } from '@/utils/deviceUtils';
import { CachedImage } from '@/components/common/CachedImage';

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
  const paragraphSize = isWeb ? '$4' : '$3';
  const noteStore = useNoteStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { colors, markdownStyles } = useMarkdownStyles();
  const noTagSpacerHeight = isWeb ? 40 : 6;
  const horizontalPadding = isWeb ? 20 : isIpad() ? 12 : 12;
  const verticalPadding = isWeb ? 16 : isIpad() ? 8 : 10;
  const attachmentWidth = isWeb ? 150 : 120;
  const attachmentHeight = isWeb ? 120 : 96;

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

  const cardSpecificStyle = useMemo(() => ({
    shadowColor: isDragging ? colors.accent : colors.shadow,
    shadowOffset: { width: 0, height: isDragging ? 4 : 2 },
    shadowOpacity: isDragging ? 0.3 : 0.1,
    shadowRadius: isDragging ? 6 : 2,
    elevation: isDragging ? 8 : 2,
    padding: verticalPadding,
    borderWidth: isDragging ? 1 : 0,
    borderColor: isDragging ? colors.cardBorderDragging : '#1c1c1c',
    overflow: 'hidden' as 'hidden',
    position: 'relative' as 'relative',
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
        borderWidth={1}
        borderColor={isDragging ? colors.cardBorderDragging : '#9c9c9c'}
      >
        <LinearGradient
          colors={isDark ? ['rgb(7, 7, 7)', 'rgb(15, 15, 15)', 'rgb(20, 19, 19)', 'rgb(25, 25, 25)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: 9,
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? undefined : '#9c9c9c',
          }}
        />
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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                fontSize={isWeb ? "$5" : isIpad() ? 20 : 19}
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

          {isExpanded && (
          <View
            style={{
              height: 2,
              backgroundColor: colors.cardBorder,
              marginHorizontal: horizontalPadding,
              marginTop: 4,
              marginBottom: 2,
              borderRadius: 2,
            }}
          />
        )}

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
                    fontSize={isWeb ? 13 : isIpad() ? 14 : 12}
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
                    <Markdown style={markdownStyles}>
                      {displayContent || ''}
                    </Markdown>
                  </YStack>
                ) : (
                  <Paragraph
                    size={paragraphSize}
                    fontFamily="$body"
                    paddingHorizontal={horizontalPadding + 4}
                    paddingVertical="$2"
                    color={colors.text}
                    className={isWeb ? "note-text" : undefined}
                    fontSize={isWeb ? 16 : isIpad() ? 15 : 15}
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
                    contentContainerStyle={{ gap: 8, paddingRight: horizontalPadding }}
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
                        <View style={[localStyles.attachmentContainer, { width: attachmentWidth, height: attachmentHeight }]}>
                          <CachedImage
                            uri={att.url}
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
      <SimpleImageViewer
        imageUrl={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
        isDark={isDark}
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
