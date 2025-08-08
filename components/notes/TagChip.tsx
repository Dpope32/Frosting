import React from 'react';
import { XStack, Text, isWeb } from 'tamagui';
import { useMarkdownStyles } from '@/hooks/useMarkdownStyles';
import { isIpad } from '@/utils';
import { useColorScheme } from '@/hooks/useColorScheme';

// Simple color utilities to ensure readable tag text, especially in light mode
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length >= 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return { r, g, b };
  }
  return { r: 100, g: 100, b: 100 };
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

const getRelativeLuminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const toLinear = (c: number) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

// Darken or lighten by a delta on RGB values
const adjustColor = (hex: string, delta: number) => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + delta, g + delta, b + delta);
};

export const TagChip = ({ tag }: { tag: { id: string, name: string, color?: string } }) => {
  const { colors } = useMarkdownStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const baseColor = tag.color || '#888888';
  const baseRgb = hexToRgb(baseColor);
  const luminance = getRelativeLuminance(baseRgb);

  // For light mode, avoid semi-transparent bright text; use a darker, fully-opaque variant.
  // Increase darkening for very bright colors (e.g., neon green/blue)
  const darkenAmount = !isDark ? (luminance > 0.7 ? -120 : luminance > 0.55 ? -90 : -70) : 0;
  const readableTextHex = !isDark ? adjustColor(baseColor, darkenAmount) : adjustColor(baseColor, 0);
  const borderColorHex = isDark ? baseColor : readableTextHex;

  return (
    <XStack
      key={tag.id}
      backgroundColor={`${baseColor}20`}
      borderRadius={isWeb ? '$8' : '$6'}
      paddingVertical={isWeb ? 5 : 3}
      paddingHorizontal={isWeb && isIpad() ? "$2.5" : "$2"}
      borderWidth={1}
      borderColor={`${borderColorHex}66`}
      alignItems="center"
      margin={isWeb ? 0 : 2}
      className={isWeb ? "note-tag" : undefined}
    >
      <Text
        fontSize={isWeb ? 11 : 10}
        color={isDark ? `${baseColor}CC` : readableTextHex}
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