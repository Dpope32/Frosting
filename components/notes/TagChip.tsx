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
      paddingVertical={isWeb ? 6 : 3}
      paddingHorizontal={isIpad() ? "$3" : "$2"}
      borderWidth={1}
      borderColor={`${tag.color || colors.textSecondary}50`}
      alignItems="center"
      margin={isWeb ? 0 : 2}
      className={isWeb ? "note-tag" : undefined}
    >
      <Text
        fontSize={isWeb ? 12 : 11}
        color={`${tag.color}99`}
        fontWeight="500"
        lineHeight={isWeb ? 16 : 14}
        paddingHorizontal={isWeb ? 6 : isIpad() ? 4 : 2}
        fontFamily="$body"
        className={isWeb ? "note-text" : undefined}
      >
        {tag.name}
      </Text>
    </XStack>
  );
};