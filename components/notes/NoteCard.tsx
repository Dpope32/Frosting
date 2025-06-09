// TODO: fix the type errors
// TODO: add a check for the note content to be empty
//@ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { Card, YStack, Text, Paragraph, XStack, ScrollView, isWeb } from 'tamagui';
import { TouchableOpacity, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Note } from '@/types';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import { MaterialIcons } from '@expo/vector-icons';
import { useNoteStore } from '@/store';
import { useMarkdownStyles } from '@/hooks/useMarkdownStyles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SimpleImageViewer } from './SimpleImageViewer';
import { TagChip } from './TagChip';
import { isIpad } from '@/utils';
import { CachedImage } from '@/components/common/CachedImage';
import { addSyncLog } from '@/components/sync/syncUtils';

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
  const [checkboxUpdateKey, setCheckboxUpdateKey] = useState(0);
  const [checkboxRenderCount, setCheckboxRenderCount] = useState(0);
  const paragraphSize = isWeb ? '$4' : '$3';
  const noteStore = useNoteStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { colors, markdownStyles } = useMarkdownStyles();
  const noTagSpacerHeight = isWeb ? 40 : 6;
  const horizontalPadding = isWeb ? 20 : isIpad() ? 12 : 12;
  const verticalPadding = isWeb ? 6 : isIpad() ? 8 : 10;
  const attachmentWidth = isWeb ? 150 : 120;
  const attachmentHeight = isWeb ? 120 : 96;

  useEffect(() => {
    if (note.isExpanded !== isExpanded) {
      noteStore.updateNote(note.id, { isExpanded });
    }
  }, [isExpanded, note.id]);

  // Reset checkbox counter when content changes
  useEffect(() => {
    setCheckboxRenderCount(0);
  }, [note.content, checkboxUpdateKey]);

  const imageAttachments = useMemo(() => {
    const allImageAttachments = note.attachments?.filter(att => att.type === 'image') ?? [];
    const validImageAttachments = allImageAttachments.filter(att => att.url);
    
    // Log if we have image attachments without URLs (likely missing after sync)
    const missingUrls = allImageAttachments.length - validImageAttachments.length;
    if (missingUrls > 0) {
      addSyncLog(
        `${missingUrls} image(s) missing URLs in note: ${note.title || 'Untitled'}`,
        'warning',
        'Image attachments found without URLs, likely due to workspace sync not including images from other clients'
      );
    }
    
    return validImageAttachments;
  }, [note.attachments, note.title]);

  const hasMarkdown = useMemo(() => {
    if (!note.content) return false;
    const result = Boolean(
      note.content.match(/(\*\*.*?\*\*)|(\*.*?\*)|^#+ |!\[.*?\]\(.*?\)|^- (?!\[)|^- \[[xX ]\]|\n- (?!\[)|\n- \[[xX ]\]|```.*?```|> |\[.*?\]\(.*?\)|~~.*?~~|^[\*] |^[\*] (?!\[)|\n[\*] |\n[\*] (?!\[)/m)
    );
    console.log('hasMarkdown check - content:', note.content, 'result:', result);
    return result;
  }, [note.content]);

  const displayContent = useMemo(() => {
    if (!note.content) return '';
    const result = note.content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
    console.log('displayContent - original:', note.content, 'processed:', result);
    return result;
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
    overflow: 'hidden' as 'hidden',
    position: 'relative' as 'relative',
  }), [isDragging, colors]);

  // Custom rule for checkboxes
  const checkboxRule: RenderRules = {
    list_item: (() => {
      let renderCheckboxCount = 0; // Track checkbox count during this render cycle
      
      return (node, children, parent, styles) => {
        const findCheckboxString = (childrenArr: any[]): RegExpMatchArray | null => {
          for (const child of childrenArr) {
            if (typeof child === 'string') {
              let match = child.match(/^[-*]\s+\[([ xX])\]\s?(.*)/);
              if (!match) {
                match = child.match(/^\[([ xX])\]\s?(.*)/);
              }
              if (!match) {
                // Look for just the checkbox part
                const checkboxMatch = child.match(/\[([ xX])\]/);
                if (checkboxMatch) {
                  const labelMatch = child.match(/\[([ xX])\]\s?(.*)/);
                  return [child, checkboxMatch[1], labelMatch ? labelMatch[2] : ''];
                }
              }
              if (match) {
                return match;
              }
            } else if (Array.isArray(child)) {
              const match = findCheckboxString(child);
              if (match) return match;
            } else if (child && typeof child === 'object' && child.props && child.props.children) {
              const match = findCheckboxString(
                Array.isArray(child.props.children) ? child.props.children : [child.props.children]
              );
              if (match) return match;
            }
          }
          return null;
        };

        const match: RegExpMatchArray | null = findCheckboxString(children);
        
        if (match) {
          const checked = match[1].toLowerCase() === 'x';
          const label = match[2] || '';
          
          // Use the current render count as the checkbox index
          const thisCheckboxIndex = renderCheckboxCount;
          renderCheckboxCount++;
          
          const handleToggle = () => {
            let checkboxCount = 0;
            let newContent = (note.content || '').replace(/^([-*]\s+\[)([ xX])(\]\s?.*)$/gm, (fullMatch, prefix, state, suffix) => {
              if (checkboxCount === thisCheckboxIndex) {
                checkboxCount++;
                const newState = state.toLowerCase() === 'x' ? ' ' : 'x';
                return prefix + newState + suffix;
              }
              checkboxCount++;
              return fullMatch;
            });
            
            // If no replacement was made with the list item pattern, try standalone checkbox pattern
            if (newContent === (note.content || '')) {
              checkboxCount = 0;
              newContent = (note.content || '').replace(/\[([ xX])\]/g, (fullMatch, state) => {
                if (checkboxCount === thisCheckboxIndex) {
                  checkboxCount++;
                  return state.toLowerCase() === 'x' ? '[ ]' : '[x]';
                }
                checkboxCount++;
                return fullMatch;
              });
            }
            
            if (newContent !== (note.content || '')) {
              noteStore.updateNote(note.id, { content: newContent });
              setCheckboxUpdateKey(prev => prev + 1);
            }
          };

          if (isExpanded) {
            return (
              <TouchableOpacity
                key={`checkbox-${thisCheckboxIndex}-${checkboxUpdateKey}`}
                onPress={handleToggle}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}
              >
                <View style={[
                  markdownStyles.checkbox_unchecked,
                  checked && markdownStyles.checkbox_checked,
                  !markdownStyles.checkbox_unchecked && {
                    width: 20,
                    height: 20,
                    borderWidth: 1.5,
                    borderRadius: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                ]}>
                  {checked && <Text style={[markdownStyles.checkbox_icon, { marginBottom: 2 }]}>✓</Text>}
                </View>
                <Text style={[
                  markdownStyles.checkbox,
                  checked && { textDecorationLine: 'line-through', color: '#888' },
                  !markdownStyles.checkbox && { flex: 1, fontSize: 16, color: colors.text, fontFamily: '$body' }
                ]}>{label}</Text>
              </TouchableOpacity>
            );
          } else {
            return (
              <View
                key={`checkbox-readonly-${thisCheckboxIndex}-${checkboxUpdateKey}`}
                style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}
              >
                <View style={[
                  markdownStyles.checkbox_unchecked,
                  checked && markdownStyles.checkbox_checked,
                  !markdownStyles.checkbox_unchecked && {
                    width: 20,
                    height: 20,
                    borderWidth: 1.5,
                    borderRadius: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                ]}>
                  {checked && <Text style={[markdownStyles.checkbox_icon, { marginBottom: 2 }]}>✓</Text>}
                </View>
                <Text style={[
                  markdownStyles.checkbox,
                  checked && { textDecorationLine: 'line-through', color: '#888' },
                  !markdownStyles.checkbox && { flex: 1, fontSize: 16, color: colors.text, fontFamily: '$body' }
                ]}>{label}</Text>
              </View>
            );
          }
        }

        return (
          <View
            key={node.key || node.index || Math.random().toString()}
            style={{ flexDirection: 'row', alignItems: 'flex-start' }}
            pointerEvents="box-none"
          >
            <Text style={{ marginRight: 8, fontSize: 16, color: colors.text, lineHeight: 20 }}>•</Text>
            <View style={{ flex: 1 }} pointerEvents="box-none">{children}</View>
          </View>
        );
      };
    })()
  };

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
        minWidth={isWeb ? 250 : undefined}
        maxWidth={isWeb ? 600 : undefined}
      >
        <LinearGradient
          colors={isDark ? 
            ['#171c22', '#1a1f25', '#1d2228', '#20252c'] : 
            ['#f6f8f5', '#f1f4ef', '#ecefea', '#e7eae5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: isDark ? '#282e36' : '#dde3d8',
            opacity: 0.98,
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
                <MaterialIcons name="keyboard-arrow-up" size={isWeb ? 24 : 20} color={colors.textSecondary} />
              ) : (
                <MaterialIcons name="keyboard-arrow-down" size={isWeb ? 24 : 20} color={colors.textSecondary} />
              )}
            </XStack>
          </TouchableOpacity>

          {isExpanded && (
          <View
            style={{
              height: 1,
              backgroundColor: colors.cardBorder,
              marginHorizontal: horizontalPadding, 
              marginTop: 1,
              marginBottom: 6,
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
                flexWrap="nowrap"
                paddingHorizontal={horizontalPadding}
                paddingBottom={isWeb ? note.tags?.length ? "$3" : "$2" : "$2"}
                gap="$2"
                justifyContent="space-between"
                alignItems="center"
              >
                <XStack flexWrap="nowrap" gap="$1.5" flexShrink={1} mr="$2" alignItems="center">
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
                    <Markdown 
                      key={`${note.id}-${checkboxUpdateKey}`}
                      style={markdownStyles}
                      rules={/- \[[ xX]\]/.test(displayContent) ? checkboxRule : undefined}
                    >
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
                    flexWrap="nowrap"
                    paddingHorizontal={horizontalPadding}
                    paddingTop="$1"
                    paddingBottom="$2"
                    gap="$1.5"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <XStack flexWrap="nowrap" gap="$1.5" flexShrink={1} mr="$2" alignItems="center">
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
                          <MaterialIcons name="edit" size={isWeb ? 18 : 16} color={colors.textSecondary} />
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
    width: Platform.OS === 'web' ? '100%' : '100%',
    paddingVertical: Platform.OS === 'web' ? 0 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 2 : 12,
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