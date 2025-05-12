import React from 'react';
import { Sheet, Image, Paragraph, XStack, YStack } from 'tamagui';
import { TouchableOpacity, View, Platform, Linking, Alert, Text, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import type { Person } from '@/types/people';
import { styles } from './styles';
import { webStyles } from './webStyles';
import { formatPhoneNumber } from './utils';

export type ExpandedViewProps = {
  isExpanded: boolean;
  person: Person;
  isDark: boolean;
  nicknameColor: string;
  fullAddress: string;
  applyWebStyle: (styleKey: keyof typeof webStyles) => Record<string, unknown>;
  onClose: () => void;
  onEdit: (person: Person) => void;
};

export default function ExpandedView({
  isExpanded,
  person,
  isDark,
  nicknameColor,
  fullAddress,
  applyWebStyle,
  onClose,
  onEdit
}: ExpandedViewProps) {
  return (
    <Sheet
      modal
      open={isExpanded}
      onOpenChange={(open: boolean) => { if (!open) onClose(); }}
      snapPoints={[85, 95]}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      animation="modal"
      zIndex={100000}
    >
      <Sheet.Overlay animation="modal" style={styles.overlay as any} />
      <Sheet.Frame
        key="sheet-frame"
        style={[
          styles.modalContainer,
          {
            backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? 'rgba(200,200,200,0.8)' : 'rgba(100,100,100,0.3)'
          },
          applyWebStyle('modalContainer')
        ] as any}
      >
        <Sheet.Handle key="sheet-handle" />
        <ScrollView key="scroll-view" style={[styles.modalContent, { zIndex: 1 }, applyWebStyle('modalContent')] as any}>
          <View key="header-icons" style={styles.modalHeaderIcons as any}>
            <TouchableOpacity
              key="share-icon"
              style={[
                styles.shareIcon,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(100,100,100,0.5)' }
              ] as any}
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
            >
              <Ionicons key="share-outline-icon" name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              key="close-icon"
              style={[
                styles.closeIcon,
                { 
                  marginTop: Platform.OS === 'web' ? 10 : 0,
                  marginRight: Platform.OS === 'web' ? 10 : 0,
                }
              ] as any}
              onPress={onClose}
            >
              <Ionicons key="close-outline-icon" name="close-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View key="header-row" style={[styles.headerRow, applyWebStyle('headerRow')] as any}>
            <View key="avatar-container" style={styles.modalAvatarContainer as any}>
              <Image
                key="profile-image"
                source={{ uri: person.profilePicture || 'https://via.placeholder.com/200' }}
                style={[styles.modalAvatar, applyWebStyle('modalAvatar')] as any}
                objectFit="cover"
              />
              {person.priority && (
                <View key="star-indicator" style={styles.modalStarIndicator as any}>
                  <Ionicons key="star-icon" name="star" size={16} color="#FFD700" />
                </View>
              )}
            </View>
            <View key="name-column" style={styles.nameColumn as any}>
              <Paragraph
                key="name-text"
                color={nicknameColor}
                style={styles.modalNameText as any}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {person.nickname || person.name}
              </Paragraph>
              <XStack key="occupation-row" alignItems="center" gap="$2">
                <Paragraph key="occupation-text" fontSize={15} color={isDark ? '#999' : '#666'} numberOfLines={1}>
                  {person.occupation}
                </Paragraph>
                {person.favorite && (<Ionicons key="favorite-icon" name="heart" size={15} color="#4CAF50" />)}
              </XStack>
            </View>
          </View>

          <XStack key="pills-container" style={styles.pillRow as any}>
            {person.birthday && (
              <View 
                key="notification-pill"
                style={[
                  styles.statusPill,
                ] as any}>
                <XStack key="notification-content" alignItems="center" gap="$1">
                  <Paragraph key="notification-label" fontSize={13} fontFamily="$body" color={isDark ? '#666' : '#555'}>Notification:</Paragraph>
                  <Paragraph key="notification-value" fontSize={13} fontFamily="$body" color="#4CAF50">Scheduled</Paragraph>
                </XStack>
              </View>
            )}
            {person.priority && person.birthday && (
              <View 
                key="reminder-pill"
                style={[
                  styles.statusPill,
                  styles.reminderPill,
                ] as any}>
                <XStack key="reminder-content" alignItems="center" gap="$1">
                  <Paragraph key="reminder-label" fontSize={13} fontFamily="$body" color={isDark ? '#666' : '#555'}>Reminder:</Paragraph>
                  <Paragraph key="reminder-value" fontSize={13} fontFamily="$body" color="#FFD700">Scheduled</Paragraph>
                </XStack>
              </View>
            )}
          </XStack>

          <YStack style={styles.infoSection as any}>
            {person.birthday && (
              <XStack key="birthday-info" gap="$3" alignItems="center">
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
              <XStack key="tags-info" gap="$3" alignItems="flex-start">
                <Ionicons name="pricetag-outline" size={22} color={isDark ? '#fff' : '#555'} style={{ marginTop: 2 }} />
                <View style={styles.modalTagsContainer as any}>
                  {person.tags.map(tag => (
                    <View
                      key={`tag-${tag.id}`}
                      style={[
                        styles.modalTag as any,
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
                          styles.modalTagText as any,
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

            {person.occupation && (
              <XStack key="occupation-info" gap="$3" alignItems="center">
                <Ionicons name="briefcase-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {person.occupation}
                </Paragraph>
              </XStack>
            )}
            {person.email && (
              <XStack key="email-info" gap="$3" alignItems="center">
                <Ionicons name="mail-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {person.email}
                </Paragraph>
              </XStack>
            )}
            {person.phoneNumber && (
              <XStack key="phone-info" gap="$3" alignItems="center">
                <Ionicons name="call-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {formatPhoneNumber(person.phoneNumber)}
                </Paragraph>
              </XStack>
            )}
            {fullAddress && (
              <XStack key="address-info" gap="$3" alignItems="center">
                <Ionicons name="location-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {fullAddress}
                </Paragraph>
              </XStack>
            )}
            {person.relationship && (
              <XStack key="relationship-info" gap="$3" alignItems="center">
                <Ionicons name="people-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {person.relationship}
                </Paragraph>
              </XStack>
            )}
            {person.notes && (
              <XStack key="notes-info" gap="$3" alignItems="center">
                <Ionicons name="document-text-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'} style={{ flex: 1 }}>
                  {person.notes}
                </Paragraph>
              </XStack>
            )}
            {person.lastContactDate && (
              <XStack key="lastcontact-info" gap="$3" alignItems="center">
                <Ionicons name="time-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  Last Contact: {new Date(person.lastContactDate).toLocaleDateString()}
                </Paragraph>
              </XStack>
            )}
            {person.importantDates && person.importantDates.length > 0 && (
              <XStack key="importantdates-info" gap="$3" alignItems="flex-start">
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
              <XStack key="socialmedia-info" gap="$3" alignItems="flex-start">
                <Ionicons name="cash-outline" size={22} color={isDark ? '#fff' : '#555'} style={{ marginTop: 2 }} />
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
              <XStack key="additionalinfo-info" gap="$3" alignItems="center">
                <Ionicons name="information-circle-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {person.additionalInfo}
                </Paragraph>
              </XStack>
            )}
          </YStack>
        </ScrollView>

        <View
          key="action-bar"
          style={[
            styles.actionBar,
            {
              backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(240,240,240,0.95)',
              borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            },
            applyWebStyle('actionBar')
          ] as any}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            key="copy-action"
            onPress={() => Clipboard.setStringAsync(person.name).then(() => Alert.alert('Success', 'Name copied to clipboard!'))}
            style={styles.actionButton as any}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons key="copy-outline-icon" name="copy-outline" size={24} color={isDark ? '#fff' : '#555'} />
            <Paragraph key="copy-text" fontFamily="$body" style={[styles.actionText, { color: isDark ? '#fff' : '#555' }] as any}>Copy</Paragraph>
          </TouchableOpacity>

          {person.phoneNumber && (
            <TouchableOpacity
              key="call-action"
              onPress={() => {
                Linking.openURL(`tel:${person.phoneNumber}`).catch(err => {
                  console.error('Could not open phone app', err);
                  Alert.alert('Error', 'Could not open phone app');
                });
              }}
              style={styles.actionButton as any}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons key="call-outline-icon" name="call-outline" size={24} color={isDark ? '#fff' : '#555'} />
              <Paragraph key="call-text" fontFamily="$body" style={[styles.actionText, { color: isDark ? '#fff' : '#555' }] as any}>Call</Paragraph>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            key="edit-action"
            onPress={e => {
              if (typeof e.preventDefault === 'function') e.preventDefault();
              if (typeof e.stopPropagation === 'function') e.stopPropagation();
              onEdit(person);
            }}
            style={[styles.actionButton, { zIndex: 99 }] as any}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons key="edit-outline-icon" name="pencil-outline" size={24} color={isDark ? '#fff' : '#555'} />
            <Paragraph key="edit-text" fontFamily="$body" style={[styles.actionText, { color: isDark ? '#fff' : '#555' }] as any}>Edit</Paragraph>
          </TouchableOpacity>
        </View>
      </Sheet.Frame>
    </Sheet>
  );
} 