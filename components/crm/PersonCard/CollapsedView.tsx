import React from 'react';
import { Card, Image, Paragraph, XStack, isWeb } from 'tamagui';
import { TouchableOpacity, View, Platform, Text } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';
import type { Person } from '@/types';
import { isIpad } from '@/utils/deviceUtils';
import { adjustColor, getDarkerHslColor } from './utils';
import { formatDistanceToNow, format } from 'date-fns';

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
  // Format last contacted date if available
  const getLastContactedText = () => {
    if (!person.lastContactDate) return null;
    try {
      return formatDistanceToNow(new Date(person.lastContactDate), { addSuffix: true });
    } catch (e) {
      return null;
    }
  };

  // Format birthday in a readable way
  const formatBirthday = () => {
    if (!person.birthday) return null;
    try {
      // Just format the month and day (not the year) to keep it compact
      return format(new Date(person.birthday), 'MMM d');
    } catch (e) {
      return null;
    }
  };

  const birthdayText = formatBirthday();
  const lastContacted = getLastContactedText();
  const hasTags = person.tags && person.tags.length > 0;

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
            <XStack key="name-row" alignItems="center" gap="$1">
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
            
            <View style={styles.additionalInfoRow as any}>
              {birthdayText && (
                <XStack key="birthday-row" alignItems="center" gap="$1" marginRight={6} marginBottom={2}>
                  <MaterialIcons 
                    name="cake" 
                    size={10} 
                    color={isDark ? "#777" : "#555"} 
                  />
                  <Text 
                    style={[
                      styles.contactInfo as any, 
                      {color: isDark ? "#888" : "#555"}
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {birthdayText}
                  </Text>
                </XStack>
              )}
              
              {hasTags && (
                <React.Fragment key="tags-list">
                  {person.tags!.map(tag => {
                    console.log(`Mapping tag: ${JSON.stringify(tag)}, ID for key: ${tag.id}`);
                    return (
                      <View 
                        key={tag.id} 
                        style={[
                          styles.tagContainer as any,
                          {
                            backgroundColor: tag.color ? `${tag.color}15` : isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                            marginBottom: 2,
                          }
                        ]}
                      >
                        <Ionicons
                          name="pricetag-outline"
                          size={10}
                          color={tag.color || (isDark ? "rgb(180, 180, 180)" : "rgb(100, 100, 100)")}
                          style={{ marginRight: 3 }}
                        />
                        <Text
                          style={[
                            styles.tagText as any,
                            {
                              color: tag.color || (isDark ? "rgb(180, 180, 180)" : "rgb(100, 100, 100)"),
                            }
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {tag.name}
                        </Text>
                      </View>
                    );
                  })}
                </React.Fragment>
              )}
              
              {!hasTags && lastContacted && (
                <Text 
                  key="last-contacted"
                  style={[
                    styles.lastContactText as any, 
                    {color: isDark ? "#777" : "#555"}
                  ]}
                >
                  {lastContacted}
                </Text>
              )}
            </View>
          </View>
        </XStack>
      </TouchableOpacity>
    </Card>
  );
} 