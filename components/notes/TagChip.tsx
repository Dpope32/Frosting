import React from 'react';
import { XStack, Text, isWeb } from 'tamagui';
import { useMarkdownStyles } from '@/hooks/useMarkdownStyles';

export const TagChip = ({ tag }: { tag: { id: string, name: string, color?: string } }) => {
  const { colors } = useMarkdownStyles();
  
  return (
    <XStack
      key={tag.id}
      backgroundColor={`${tag.color || '#888888'}20`}
      borderRadius={isWeb ? '$8' : '$6'}
      paddingVertical={isWeb ? 6 : 4}
      paddingHorizontal="$3"
      borderWidth={1}
      borderColor={tag.color || colors.textSecondary}
      alignItems="center"
      margin={isWeb ? 2 : 0}
      className={isWeb ? "note-tag" : undefined}
    >
      <Text
        fontSize={isWeb ? 12 : 11}
        color={tag.color}
        fontWeight="700"
        fontFamily="$body"
        className={isWeb ? "note-text" : undefined}
      >
        {tag.name}
      </Text>
    </XStack>
  );
};
  