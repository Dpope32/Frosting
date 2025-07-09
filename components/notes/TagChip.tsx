import React from 'react';
import { XStack, Text, isWeb } from 'tamagui';
import { useMarkdownStyles } from '@/hooks/useMarkdownStyles';
import { isIpad } from '@/utils';

export const TagChip = ({ tag }: { tag: { id: string, name: string, color?: string } }) => {
  const { colors } = useMarkdownStyles();

  return (
    <XStack
      key={tag.id}
      backgroundColor={`${tag.color || '#888888'}20`}
      borderRadius={isWeb ? '$8' : '$6'}
      paddingVertical={isWeb ? 5 : 3}
      paddingHorizontal={isWeb && isIpad() ? "$2.5" : "$2"}
      borderWidth={1}
      borderColor={`${tag.color || colors.textSecondary}50`}
      alignItems="center"
      margin={isWeb ? 0 : 2}
      className={isWeb ? "note-tag" : undefined}
    >
      <Text
        fontSize={isWeb ? 11 : 10}
        color={`${tag.color}99`}
        fontWeight="500"
        lineHeight={isWeb ? 15 : 13}
        paddingHorizontal={isWeb ? 6 : isIpad() ? 4 : 2}
        fontFamily="$body"
        className={isWeb ? "note-text" : undefined}
      >
        {tag.name}
      </Text>
    </XStack>
  );
};