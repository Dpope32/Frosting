import React from 'react';
import { Card, Image, Paragraph, XStack, isWeb } from 'tamagui';
import { TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import type { Person } from '@/types/people';
import { isIpad } from '@/utils/deviceUtils';
import { adjustColor, getDarkerHslColor } from './utils';

type CollapsedViewProps = {
  person: Person;
  onPress: () => void;
  isDark: boolean;
  nicknameColor: string;
  applyWebStyle: any;
};

export default function CollapsedView({
  person,
  onPress,
  isDark,
  nicknameColor,
  applyWebStyle
}: CollapsedViewProps) {
  return (
    <Card
      elevate
      br="$4"
      animation="quick"
      pressStyle={{ scale: 0.90 }}
      style={[
        styles.card,
        {
          borderColor: nicknameColor,
          backgroundColor: isDark
            ? getDarkerHslColor(nicknameColor)
            : `${nicknameColor}15`
        },
        applyWebStyle('card')
      ] as any}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable as any}>
        <XStack alignItems="center" gap="$3" style={styles.cardContent as any}>
          <View style={[styles.avatarContainer, applyWebStyle('avatarContainer')] as any}>
            <View style={[styles.avatarWrapper, applyWebStyle('avatarWrapper')] as any}>
              <Image
                source={{ uri: person.profilePicture || 'https://via.placeholder.com/80' }}
                width={Platform.OS === 'web' ? 80 : isIpad() ? 60 : 34}
                height={Platform.OS === 'web' ? 60 : isIpad() ? 40 : 34}
                br={Platform.OS === 'web' ? 30 : isIpad() ? 30 : 27}
                style={styles.avatarImage as any}
              />
            </View>
            {person.priority && (
              <View style={styles.starIndicator as any}>
                <Ionicons name="star" size={12} color="#FFD700" />
              </View>
            )}
          </View>
          <View style={styles.textContainer as any}>
            <XStack alignItems="center" gap="$1">
              {person.favorite && (
                <Ionicons
                  name="heart"
                  size={14}
                  color="#4CAF50"
                  style={styles.checkmark as any}
                />
              )}
              <Paragraph
                fontWeight="600"
                fontSize={isWeb ? 18 : isIpad() ? 18 : 16}
                color={isDark ? adjustColor(nicknameColor, 250) : adjustColor(nicknameColor, -40)}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {person.nickname || person.name}
              </Paragraph>
            </XStack>
            {person.occupation && (
              <Paragraph
                fontSize={isWeb ? 16 : isIpad() ? 14 : 12}
                color={isDark ? '#999' : '#333'}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ marginTop: -2 }}
              >
                {person.occupation}
              </Paragraph>
            )}
          </View>
        </XStack>
      </TouchableOpacity>
    </Card>
  );
} 