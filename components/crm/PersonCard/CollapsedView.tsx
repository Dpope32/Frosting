import React, { useState } from 'react';
import { Card, Image, Paragraph, XStack, isWeb } from 'tamagui';
import { TouchableOpacity, View, Platform, Text, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';
import type { Person } from '@/types';
import { isIpad } from '@/utils';
import { adjustColor, getDarkerHslColor, getLighterHslColor } from './utils';
import { formatDistanceToNow, format } from 'date-fns';
import { LongPressDelete } from "@/components/common/LongPressDelete";
import { usePeopleStore } from "@/store/People";
import { useToastStore } from "@/store";

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
  const deletePerson = usePeopleStore(state => state.deletePerson);
  const showToast = useToastStore(state => state.showToast);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

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
      // Fix timezone issue by adjusting for local timezone offset
      const date = new Date(person.birthday);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      return format(date, 'MMM d');
    } catch (e) {
      return null;
    }
  };

  const birthdayText = formatBirthday();
  const lastContacted = getLastContactedText();
  const hasTags = person.tags && person.tags.length > 0;

  return (
    <LongPressDelete 
      onDelete={(onComplete) => {
        if (Platform.OS === 'web') {
          if (window.confirm('Delete this contact?')) {
            deletePerson(person.id!);
            showToast('Contact deleted', 'success');
            onComplete(true);
          } else {
            onComplete(false);
          }
        } else {
          Alert.alert(
            'Delete Contact',
            'Are you sure you want to delete this contact?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => onComplete(false) },
              { text: 'Delete', style: 'destructive', onPress: () => {
                  deletePerson(person.id!);
                  showToast('Contact deleted', 'success');
                  onComplete(true);
                }
              }
            ],
            { cancelable: true }
          );
        }
      }}
      longPressDuration={1000}
      isDark={isDark}
    >
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
        style={{ width: '100%' }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        delayPressIn={0}
        delayPressOut={50}
      >
        <View
          style={[
            styles.card,
            {
              borderColor: nicknameColor,
              backgroundColor: isDark
                ? getDarkerHslColor(nicknameColor)
                :  getLighterHslColor(nicknameColor)
            },
            applyWebStyle('card')
          ] as any}
        >
          <XStack alignItems="center" gap="$3" style={styles.cardContent as any}>
                          <View style={[styles.avatarContainer, applyWebStyle('avatarContainer')] as any}>
                <View style={[styles.avatarWrapper, applyWebStyle('avatarWrapper')] as any}>
                  {person.profilePicture && !imageLoadFailed ? (
                    <Image
                      source={{ uri: person.profilePicture }}
                      width={Platform.OS === 'web' ? 80 : isIpad() ? 60 : 34}
                      height={Platform.OS === 'web' ? 60 : isIpad() ? 40 : 34}
                      br={Platform.OS === 'web' ? 30 : isIpad() ? 30 : 27}
                      style={styles.avatarImage as any}
                      onError={() => {
                        setImageLoadFailed(true);
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: Platform.OS === 'web' ? 80 : isIpad() ? 60 : 34,
                        height: Platform.OS === 'web' ? 60 : isIpad() ? 40 : 34,
                        borderRadius: Platform.OS === 'web' ? 30 : isIpad() ? 30 : 27,
                        backgroundColor: nicknameColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: isDark ? '#000' : '#fff',
                          fontSize: Platform.OS === 'web' ? 32 : isIpad() ? 24 : 16,
                          fontWeight: 'bold',
                          textAlign: 'center',
                        }}
                      >
                        {(person.nickname || person.name).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
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
              {(person.birthday || person.occupation || hasTags) && (
                <XStack key="birthday-occupation-tags-info" alignItems="center" justifyContent="flex-start" alignSelf="flex-start"  gap={isWeb || isIpad() ? "$2" : "$1"} style={{ marginTop: 2, flexWrap: 'nowrap', flexShrink: 1 }}>
                  {person.birthday && (
                    <>
                      <MaterialIcons
                        name="cake"
                        size={10}
                        color={isDark ? "#777" : "#555"}
                      />
                      <Text
                        style={[
                          styles.contactInfo as any,
                          { color: isDark ? "#888" : "#555", flexShrink: 0, minWidth: 0 }
                        ]}
                      >
                        {birthdayText}
                      </Text>
                    </>
                  )}
                  {person.occupation && (
                    <Text
                      style={{
                        fontSize: isWeb ? 12 : isIpad() ? 14 : 12,
                        color: isDark ? '#999' : '#555',
                        marginLeft: person.birthday ? (isWeb || isIpad() ? 8 : 4) : 0,
                        flexShrink: 0,
                        minWidth: 0,
                      }}
                    >
                      {person.occupation}
                    </Text>
                  )}
                  {hasTags && (
                    <View style={{ flexDirection: 'row', marginTop: 2, flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
                      {person.tags!.map(tag => (
                        <View 
                          key={tag.id} 
                          style={[
                            styles.tagContainer as any,
                            {
                              backgroundColor: tag.color ? `${tag.color}15` : isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                              marginBottom: 2,
                              marginLeft: 6,
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
                                flexShrink: 1,
                                minWidth: 0,
                              }
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {tag.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </XStack>
              )}
              <View style={styles.additionalInfoRow as any}>
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
        </View>
      </TouchableOpacity>
    </LongPressDelete>
  );
}
