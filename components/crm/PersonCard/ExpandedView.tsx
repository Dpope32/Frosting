import React, { useState } from 'react';
import { Image, Paragraph, XStack, YStack, Theme, Button, isWeb } from 'tamagui';
import { TouchableOpacity, TouchableWithoutFeedback, View, Platform, Linking, Alert, Text, ScrollView, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { ZoomIn, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { Person } from '@/types';
import { formatPhoneNumber } from './utils';
import { isIpad } from '@/utils';

export type ExpandedViewProps = {
  isExpanded: boolean;
  person: Person;
  isDark: boolean;
  nicknameColor: string;
  fullAddress: string;
  applyWebStyle?: (styleKey: string) => Record<string, unknown>;
  onClose: () => void;
  onEdit: (person: Person) => void;
};

export default function ExpandedView({
  isExpanded,
  person,
  nicknameColor,
  fullAddress,
  onClose,
  onEdit
}: ExpandedViewProps) {
  // console.log('🔍 [ExpandedView] Render:', person.name, 'isExpanded:', isExpanded);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const modalWidth = isWeb ? 600 : isIpad() ? 500 : 360;
  const actualWidth = Math.min(modalWidth, screenWidth * 0.92);

  if (!isExpanded) return null;

  // Web implementation with position:fixed
  if (isWeb) {
    return (
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        width="100%"
        height="100%"
        backgroundColor="rgba(0, 0, 0, 0.85)"
        alignItems="center"
        justifyContent="center"
        zIndex={10000}
        enterStyle={{ opacity: 0 }}
        animation="quick"
        {...(isWeb ? { style: { position: 'fixed' } as any } : {})}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            height: '100%',
            paddingTop: 80
          }}>
            <Theme name={isDark ? 'dark' : 'light'}>
              <Animated.View
                entering={ZoomIn.duration(300).springify()}
                exiting={FadeOut.duration(300)} 
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: isDark ? '#222' : '#fff',
                    marginTop: insets.top + 60, 
                    marginBottom: insets.bottom + 40,
                    width: actualWidth,
                    maxHeight: screenHeight * 0.9,
                  }
                ]}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                {/* Close button - positioned absolutely */}
                <Button
                  backgroundColor="transparent"
                  onPress={onClose} 
                  padding={8}
                  pressStyle={{ opacity: 0.7 }}
                  icon={<MaterialIcons name="close" size={22} color={isDark ? "#999" : "#666"}/>}
                  position="absolute"
                  top={12}
                  right={12}
                  zIndex={10}
                />
                
                {/* Content */}
                <ScrollView style={{ position: 'relative', maxHeight: screenHeight * 0.7 }}>
                  {renderContent(person, isDark, nicknameColor, fullAddress, onEdit)}
                </ScrollView>
              </Animated.View>
            </Theme>
          </View>
        </TouchableWithoutFeedback>
      </YStack>
    )
  }

  // Native implementation
  return (
    <Animated.View
      style={styles.overlay}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      pointerEvents="box-none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: screenHeight * 0.15,
            paddingTop: 60,
          }}
        >
          <Theme name={isDark ? 'dark' : 'light'}>
            <Animated.View
              entering={ZoomIn.duration(300).springify()}
              exiting={FadeOut.duration(300)} 
              style={[
                styles.modalContainer,
                {
                  backgroundColor: isDark ? '#141415' : '#fff',
                  marginTop: insets.top + 40, 
                  marginBottom: insets.bottom + 20,
                  width: actualWidth,
                  maxHeight: screenHeight * 0.8,
                  borderColor: isDark ? '#3c3c3c' : '#e0e0e0',
                  borderWidth: 1,
                }
              ]}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              {/* Close button - positioned absolutely */}
              <Button
                backgroundColor="transparent"
                onPress={onClose} 
                padding={8}
                pressStyle={{ opacity: 0.7 }}
                icon={<MaterialIcons name="close" size={22} color={isDark ? "#999" : "#666"}/>}
                position="absolute"
                top={12}
                right={8}
                zIndex={10}
              />
              
              <ScrollView style={{ position: 'relative', maxHeight: screenHeight * 0.6 }}>
                {renderContent(person, isDark, nicknameColor, fullAddress, onEdit)}
              </ScrollView>
            </Animated.View>
          </Theme>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  )
}

// Render content helper function
function renderContent(person: Person, isDark: boolean, nicknameColor: string, fullAddress: string, onEdit: (person: Person) => void) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  return (
    <YStack gap="$4" paddingRight="$4" paddingLeft="$4" paddingTop="$4" paddingBottom="$3">
      {/* Main profile section */}
      <XStack gap="$4" alignItems="flex-start">
        <View style={styles.avatarContainer}>
          {person.profilePicture && !imageLoadFailed ? (
            <Image
              source={{ uri: person.profilePicture }}
              style={styles.avatar}
              objectFit="cover"
              onError={() => {
                console.log('Failed to load profile picture for:', person.name, '- falling back to letter avatar');
                setImageLoadFailed(true);
              }}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: nicknameColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              ]}
            >
              <Text
                style={{
                  color: isDark ? '#000' : '#fff',
                  fontSize: 32,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {(person.nickname || person.name).charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {person.priority && (
            <View style={styles.starIndicator}>
              <Ionicons name="star" size={16} color="#FFD700" />
            </View>
          )}
        </View>
        
        <YStack flex={1} gap="$2" paddingTop="$1">
          {/* Name - integrated into content, not as title */}
          <Paragraph
            fontSize={22}
            fontWeight="600"
            fontFamily="$body"
            color={isDark ? '#fff' : '#000'}
            marginBottom="$1"
            numberOfLines={2}
          >
            {person.nickname || person.name}
          </Paragraph>
          
          <XStack alignItems="center" gap="$2">
            <Paragraph fontSize={15} color={isDark ? '#999' : '#666'} numberOfLines={1}>
              {person.occupation}
            </Paragraph>
            {person.favorite && (<Ionicons name="heart" size={15} color="#4CAF50" />)}
          </XStack>
        </YStack>
      </XStack>

      {/* Status pills section */}
      {(person.birthday || (person.priority && person.birthday)) && (
        <XStack gap="$2" justifyContent="flex-start" flexWrap="wrap">
          {person.birthday && (
            <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)' }]}>
              <XStack alignItems="center" gap="$1">
                <Paragraph fontSize={12} fontFamily="$body" color={isDark ? '#999' : '#666'}>Notification:</Paragraph>
                <Paragraph fontSize={12} fontFamily="$body" color="#4CAF50" fontWeight="500">Scheduled</Paragraph>
              </XStack>
            </View>
          )}
          {person.priority && person.birthday && (
            <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.1)' }]}>
              <XStack alignItems="center" gap="$1">
                <Paragraph fontSize={12} fontFamily="$body" color={isDark ? '#999' : '#666'}>Reminder:</Paragraph>
                <Paragraph fontSize={12} fontFamily="$body" color="#FFD700" fontWeight="500">Scheduled</Paragraph>
              </XStack>
            </View>
          )}
        </XStack>
      )}

      {/* Details section */}
      <YStack gap="$3">
        {person.birthday && (
          <XStack gap="$3" alignItems="center">
            <Ionicons name="gift-outline" size={22} color={nicknameColor} />
            <Paragraph fontSize={14} fontFamily="$body" color={isDark ? '#fff' : '#333'}>
              {(() => {
                const date = new Date(person.birthday);
                date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
              })()}
            </Paragraph>
          </XStack>
        )}
        
        {person.tags && person.tags.length > 0 && (
          <XStack gap="$2" alignItems="flex-start">
            <Ionicons name="pricetag-outline" size={22} color={isDark ? '#fff' : '#555'} />
            <View style={styles.tagsContainer}>
              {person.tags.map(tag => (
                <View
                  key={`tag-${tag.id}`}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: tag.color ? `${tag.color}15` : isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                    }
                  ]}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={12}
                    color={tag.color || (isDark ? "rgb(180, 180, 180)" : "rgb(100, 100, 100)")}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.tagText,
                      {
                        color: tag.color || (isDark ? "rgb(180, 180, 180)" : "rgb(100, 100, 100)"),
                      }
                    ]}
                  >
                    {tag.name}
                  </Text>
                </View>
              ))}
            </View>
          </XStack>
        )}

        {person.email && (
          <XStack gap="$3" alignItems="center">
            <Ionicons name="mail-outline" size={22} color={isDark ? '#fff' : '#555'} />
            <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
              {person.email}
            </Paragraph>
          </XStack>
        )}
        
        {person.phoneNumber && (
          <XStack gap="$3" alignItems="center">
            <Ionicons name="call-outline" size={22} color={isDark ? '#fff' : '#555'} />
            <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
              {formatPhoneNumber(person.phoneNumber)}
            </Paragraph>
          </XStack>
        )}
        
        {fullAddress && (
          <XStack gap="$3" alignItems="center">
            <Ionicons name="location-outline" size={22} color={isDark ? '#fff' : '#555'} />
            <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
              {fullAddress}
            </Paragraph>
          </XStack>
        )}
        
        {person.relationship && (
          <XStack gap="$3" alignItems="center">
            <Ionicons name="people-outline" size={22} color={isDark ? '#fff' : '#555'} />
            <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
              {person.relationship}
            </Paragraph>
          </XStack>
        )}
        
        {person.notes && (
          <XStack gap="$3" alignItems="flex-start">
            <Ionicons name="document-text-outline" size={22} color={isDark ? '#fff' : '#555'} />
            <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'} style={{ flex: 1 }}>
              {person.notes}
            </Paragraph>
          </XStack>
        )}
        
        {person.lastContactDate && (
          <XStack gap="$3" alignItems="center">
            <Ionicons name="time-outline" size={22} color={isDark ? '#fff' : '#555'} />
            <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
              Last Contact: {new Date(person.lastContactDate).toLocaleDateString()}
            </Paragraph>
          </XStack>
        )}
        
        {person.importantDates && person.importantDates.length > 0 && (
          <XStack gap="$3" alignItems="flex-start">
            <Ionicons name="calendar-outline" size={22} color={isDark ? '#fff' : '#555'} style={{ marginTop: 2 }} />
            <YStack>
              {person.importantDates.map((date, idx) => (
                <Paragraph key={`importantDate-${idx}`} fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {date.description}: {new Date(date.date).toLocaleDateString()}
                </Paragraph>
              ))}
            </YStack>
          </XStack>
        )}
        
        {person.socialMedia && person.socialMedia.length > 0 && (
          <XStack gap="$3" alignItems="flex-start">
            <Ionicons name="at-outline" size={22} color={isDark ? '#fff' : '#555'} style={{ marginTop: 2 }} />
            <YStack>
              {person.socialMedia.map((social, idx) => (
                <Paragraph key={`social-${idx}`} fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {social.platform}: {social.username}
                </Paragraph>
              ))}
            </YStack>
          </XStack>
        )}
        
        {person.additionalInfo && (
          <XStack gap="$3" alignItems="center">
            <Ionicons name="information-circle-outline" size={22} color={isDark ? '#fff' : '#555'} />
            <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
              {person.additionalInfo}
            </Paragraph>
          </XStack>
        )}
      </YStack>

      {/* Action buttons */}
      <XStack gap="$3" justifyContent="space-around" paddingTop="$2">
        <TouchableOpacity
          onPress={() => {
            const shareUrl = `kaiba-nexus://share?name=${encodeURIComponent(person.name)}` +
              (person.nickname ? `&nickname=${encodeURIComponent(person.nickname)}` : '') +
              (person.phoneNumber ? `&phone=${encodeURIComponent(formatPhoneNumber(person.phoneNumber))}` : '') +
              (person.email ? `&email=${encodeURIComponent(person.email)}` : '') +
              (person.occupation ? `&occupation=${encodeURIComponent(person.occupation)}` : '');
            const plainText = `Contact: ${person.nickname || person.name}\n` +
              (person.phoneNumber ? `Phone: ${formatPhoneNumber(person.phoneNumber)}\n` : '') +
              (person.email ? `Email: ${person.email}\n` : '') +
              (person.occupation ? `Occupation: ${person.occupation}\n` : '');
            const clipboardContent = `${shareUrl}\n---\n${plainText}`;
            Clipboard.setStringAsync(clipboardContent);
            Alert.alert('Success', 'Contact info copied to clipboard!');
          }}
          style={styles.actionButton}
          activeOpacity={0.6}
        >
          <Ionicons name="copy-outline" size={24} color={isDark ? '#fff' : '#555'} />
          <Text style={[styles.actionText, { color: isDark ? '#fff' : '#555' }]}>Copy</Text>
        </TouchableOpacity>

        {person.phoneNumber && (
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(`tel:${person.phoneNumber}`).catch(err => {
                console.error('Could not open phone app', err);
                Alert.alert('Error', 'Could not open phone app');
              });
            }}
            style={styles.actionButton}
            activeOpacity={0.6}
          >
            <Ionicons name="call-outline" size={24} color={isDark ? '#fff' : '#555'} />
            <Text style={[styles.actionText, { color: isDark ? '#fff' : '#555' }]}>Call</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={() => onEdit(person)}
          style={styles.actionButton}
          activeOpacity={0.6}
        >
          <Ionicons name="pencil-outline" size={24} color={isDark ? '#fff' : '#555'} />
          <Text style={[styles.actionText, { color: isDark ? '#fff' : '#555' }]}>Edit</Text>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, 
  },
  modalContainer: {
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  starIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'System',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'System',
    marginTop: 4,
  },
});
