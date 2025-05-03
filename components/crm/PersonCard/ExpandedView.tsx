import React from 'react';
import { Sheet, Image, Paragraph, XStack, YStack } from 'tamagui';
import { TouchableOpacity, View, Platform, Linking, Alert } from 'react-native';
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
        style={[
          styles.modalContainer,
          {
            backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? 'rgba(200,200,200,0.8)' : 'rgba(100,100,100,0.3)'
          },
          applyWebStyle('modalContainer')
        ] as any}
      >
        <Sheet.Handle />
        <View style={[styles.modalContent, { zIndex: 1 }, applyWebStyle('modalContent')] as any}>
          <View style={styles.modalHeaderIcons as any}>
            <TouchableOpacity
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
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.closeIcon,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(100,100,100,0.5)' }
              ] as any}
              onPress={onClose}
            >
              <Ionicons name="close-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={[styles.headerRow, applyWebStyle('headerRow')] as any}>
            <View style={styles.modalAvatarContainer as any}>
              <Image
                source={{ uri: person.profilePicture || 'https://via.placeholder.com/200' }}
                style={[styles.modalAvatar, applyWebStyle('modalAvatar')] as any}
                objectFit="cover"
              />
            </View>
            <View style={styles.nameColumn as any}>
              <Paragraph
                color={nicknameColor}
                style={styles.modalNameText as any}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {person.nickname || person.name}
              </Paragraph>
              <XStack alignItems="center" gap="$2">
                <Paragraph fontSize={15} color={isDark ? '#999' : '#666'} numberOfLines={1}>
                  {person.occupation}
                </Paragraph>
                {person.priority && (<Ionicons name="star" size={15} color="#FFD700" />)}
              </XStack>
            </View>
          </View>

          <XStack style={styles.pillRow as any}>
            {person.birthday && (
              <View style={[
                styles.statusPill,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(100,100,100,0.2)' }
              ] as any}>
                <XStack alignItems="center" gap="$1">
                  <Paragraph fontSize={13} fontFamily="$body" color={isDark ? '#666' : '#555'}>Notification:</Paragraph>
                  <Paragraph fontSize={13} fontFamily="$body" color="#4CAF50">Scheduled</Paragraph>
                </XStack>
              </View>
            )}
            {person.priority && person.birthday && (
              <View style={[
                styles.statusPill,
                styles.reminderPill,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(100,100,100,0.2)' }
              ] as any}>
                <XStack alignItems="center" gap="$1">
                  <Paragraph fontSize={13} fontFamily="$body" color={isDark ? '#666' : '#555'}>Reminder:</Paragraph>
                  <Paragraph fontSize={13} fontFamily="$body" color="#FFD700">Scheduled</Paragraph>
                </XStack>
              </View>
            )}
          </XStack>

          <YStack style={styles.infoSection as any}>
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
            {person.occupation && (
              <XStack gap="$3" alignItems="center">
                <Ionicons name="briefcase-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {person.occupation}
                </Paragraph>
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
            {person.additionalInfo && (
              <XStack gap="$3" alignItems="center">
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {person.additionalInfo}
                </Paragraph>
              </XStack>
            )}
            {person.notes && (
              <XStack gap="$3" alignItems="center">
                <Ionicons name="document-text-outline" size={22} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                  {person.notes}
                </Paragraph>
              </XStack>
            )}
            {person.tags && person.tags.length > 0 && (
              <XStack gap="$3" alignItems="flex-start">
                <Ionicons name="pricetag-outline" size={22} color={isDark ? '#fff' : '#555'} style={{ marginTop: 2 }} />
                <YStack>
                  <Paragraph fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
                    {person.tags.join(', ')}
                  </Paragraph>
                </YStack>
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
                    <Paragraph key={idx} fontSize={14} color={isDark ? '#fff' : '#333'}>
                      {date.description}: {new Date(date.date).toLocaleDateString()}
                    </Paragraph>
                  ))}
                </YStack>
              </XStack>
            )}
            {person.socialMedia && person.socialMedia.length > 0 && (
              <XStack gap="$3" alignItems="flex-start">
                <Ionicons name="cash-outline" size={22} color={isDark ? '#fff' : '#555'} style={{ marginTop: 2 }} />
                <YStack>
                  {person.socialMedia.map((social, idx) => (
                    <Paragraph key={idx} fontFamily="$body" fontSize={14} color={isDark ? '#fff' : '#333'}>
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
        </View>

        <View
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
          {person.phoneNumber && (
            <>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(`sms:${person.phoneNumber}`).catch(err => {
                    console.error('Could not open SMS app', err);
                    Alert.alert('Error', 'Could not open SMS app');
                  });
                }}
                style={styles.actionButton as any}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chatbubble-outline" size={24} color={isDark ? '#fff' : '#555'} />
                <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? '#fff' : '#555' }] as any}>Text</Paragraph>
              </TouchableOpacity>

              <TouchableOpacity
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
                <Ionicons name="call-outline"size={24}color={isDark? '#fff':'#555'} />
                <Paragraph fontFamily="$body"style={[styles.actionText, { color: isDark? '#fff':'#555'}] as any}>Call</Paragraph>
              </TouchableOpacity>
            </>
          )}
          {person.email && (
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(`mailto:${person.email}`).catch(err => {
                  console.error('Could not open email app', err);
                  Alert.alert('Error', 'Could not open email app');
                });
              }}
              style={styles.actionButton as any}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="mail-outline" size={24} color={isDark ? '#fff' : '#555'} />
              <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? '#fff' : '#555' }] as any}>eMail</Paragraph>
            </TouchableOpacity>
          )}
          {fullAddress && (
            <TouchableOpacity
              onPress={() => {
                Clipboard.setStringAsync(fullAddress)
                  .then(() => Alert.alert('Success', 'Address copied to clipboard!'))
                  .catch(err => console.error('Could not copy address', err));
              }}
              style={styles.actionButton as any}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="copy-outline" size={24} color={isDark ? '#fff' : '#555'} />
              <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? '#fff' : '#555' }] as any}>Copy</Paragraph>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={e => {
              if (typeof e.preventDefault === 'function') e.preventDefault();
              if (typeof e.stopPropagation === 'function') e.stopPropagation();
              onEdit(person);
            }}
            style={[styles.actionButton, { zIndex: 99 }] as any}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pencil-outline" size={24} color={isDark ? '#fff' : '#555'} />
            <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? '#fff' : '#555' }] as any}>Edit</Paragraph>
          </TouchableOpacity>
        </View>
      </Sheet.Frame>
    </Sheet>
  );
} 