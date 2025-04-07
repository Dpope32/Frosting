import React, { forwardRef } from 'react';
import { Card, YStack, Text, Paragraph, useTheme, isWeb } from 'tamagui';
import { TouchableOpacity, Platform } from 'react-native';
import type { Note } from '@/types/notes';

type NoteCardProps = {
  note: Note;
  onPress: () => void;
  isDragging?: boolean;
  dragRef?: React.Ref<any>;
};

export const NoteCard = forwardRef<any, NoteCardProps>(({
  note,
  onPress,
  isDragging = false,
  dragRef
}, ref) => {
  const theme = useTheme();
  const cardBackgroundColor = note.color || theme.background.val;
  const paragraphSize = Platform.OS === 'web' ? '$5' : '$3';

  return (
    <TouchableOpacity
      ref={dragRef || ref}
      onPress={onPress}
      disabled={isDragging}
      style={{
        width: '100%',
        padding: 5,
        paddingHorizontal: isWeb ? 10 : 5,
      }}
    >
      <Card
        elevate
        bordered
        animation="bouncy"
        scale={isDragging ? 1.05 : 1}
        opacity={isDragging ? 0.8 : 1}
        backgroundColor={cardBackgroundColor}
        padding="$1"
        minHeight={120}
      >
        <Card.Header >
          <Text 
            fontSize="$6" 
            fontWeight="bold" 
            numberOfLines={2}
            fontFamily="$heading"
            paddingHorizontal={isWeb ? 10 : 5}
          >
            {note.title || 'Untitled Note'}
          </Text>
        </Card.Header>
        <Paragraph 
          size={paragraphSize} 
          numberOfLines={4}
          fontFamily="$body"
          paddingHorizontal={isWeb ? 30 : 10}
        >
          {note.content}
        </Paragraph>
        {note.tags && note.tags.length > 0 && (
          <YStack marginTop="$2" flexDirection="row" flexWrap="wrap">
            {note.tags.slice(0, 3).map((tag) => (
              <Text
                key={tag.id}
                fontSize="$1"
                fontFamily="$body"
                marginRight="$1"
                marginBottom="$1"
                paddingHorizontal="$1"
                backgroundColor={tag.color || theme.backgroundHover.val}
                borderRadius="$1"
              >
                {tag.name}
              </Text>
            ))}
          </YStack>
        )}
        <Text 
          fontSize="$1" 
          color={theme.gray10.val} 
          marginTop="$2"
          fontFamily="$body"
        >
          {new Date(note.updatedAt).toLocaleDateString()}
        </Text>
      </Card>
    </TouchableOpacity>
  );
});

NoteCard.displayName = 'NoteCard';