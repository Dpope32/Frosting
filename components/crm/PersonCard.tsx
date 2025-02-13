import React, { useMemo, useCallback, useState } from "react";
import {
  Card,
  Image,
  Paragraph,
  XStack,
  YStack,
  Theme,
  Sheet
} from "tamagui";
import { EditPersonForm } from "./EditPersonForm";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  Linking,
  Alert
} from "react-native";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Person } from "@/types/people";

const generateColors = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * (360 / count)) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  });
};

const colors = generateColors(24);

const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((b | (g << 8) | (r << 16)) | 0)
    .toString(16)
    .padStart(6, "0")}`;
};

const getColorForPerson = (id: string | undefined) => {
  if (!id) return colors[0];
  const hash = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

type PersonCardProps = {
  person: Person;
  onEdit: (person: Person) => void;
  isExpanded?: boolean;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export function PersonCard({
  person,
  onEdit,
  isExpanded = false,
  onPress,
  containerStyle
}: PersonCardProps) {
  const nicknameColor = getColorForPerson(person.id || person.name);
  const fullAddress = useMemo(() => {
    return person.address?.street || "";
  }, [person.address]);

  const [isEditFormVisible, setIsEditFormVisible] = useState(false);

  const handleEditPress = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditFormVisible(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditFormVisible(false);
  }, []);

  const handleEditSave = useCallback((updatedPerson: Person) => {
    onEdit(updatedPerson);
    setIsEditFormVisible(false);
  }, [onEdit]);

  return (
    <Theme name="dark">
      <View style={[styles.container, containerStyle]}>
        <Card
          elevate
          backgroundColor={adjustColor(nicknameColor, -80)}
          borderRadius="$4"
          animation="quick"
          pressStyle={{ scale: 0.98 }}
          style={[styles.card, { borderColor: nicknameColor }]}
        >
          <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable}>
            <XStack alignItems="center" gap="$3">
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={[nicknameColor, adjustColor(nicknameColor, 40)]}
                    style={styles.avatarGradient}
                  >
                    <Image
                      source={{
                        uri: person.profilePicture || "https://via.placeholder.com/80"
                      }}
                      width={40}
                      height={40}
                      borderRadius={20}
                      style={styles.avatarImage}
                    />
                  </LinearGradient>
                </View>
                {person.priority && (
                  <View style={styles.starIndicator}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                  </View>
                )}
              </View>
              <YStack flex={1} gap="$1">
                <XStack alignItems="center" gap="$2">
                  {person.registered && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#4CAF50"
                      style={styles.checkmark}
                    />
                  )}
                  <Paragraph
                    fontWeight="700"
                    fontSize={16}
                    color={nicknameColor}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {person.nickname || person.name}
                  </Paragraph>
                </XStack>
                <Paragraph fontSize={12} color="#999">
                  {person.occupation}
                </Paragraph>
              </YStack>
            </XStack>
          </TouchableOpacity>
        </Card>
        <Sheet
          modal
          open={isExpanded}
          onOpenChange={(isOpen: boolean) => {
            if (isOpen) {
              console.log('Expanded Person Details:', person);
            }
            !isOpen && onPress?.();
          }}
          snapPoints={[82]}
          dismissOnSnapToBottom
          dismissOnOverlayPress
          zIndex={100000}
        >
          <Sheet.Overlay animation="quick" style={styles.overlay} />
          <Sheet.Frame style={styles.modalContainer}>
            <BlurView intensity={50} tint="dark" style={[StyleSheet.absoluteFill, { zIndex: 0 }]} />
            <Sheet.Handle />
            <View style={[styles.modalContent, { zIndex: 1 }]}>
              <View style={styles.modalHeaderIcons}>
                <TouchableOpacity 
                  style={styles.shareIcon}
                  onPress={() => {
                    const shareData = btoa(JSON.stringify(person));
                    const shareUrl = `frosting://share?data=${shareData}`;
                    Clipboard.setStringAsync(shareUrl);
                    Alert.alert("Success", "Contact link copied to clipboard!");
                  }}
                >
                  <Ionicons name="share-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeIcon}
                  onPress={() => onPress?.()}
                >
                  <Ionicons name="close-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
                <YStack width="100%" marginTop="$4">
                  <XStack width="100%" gap="$4">
                    <View style={styles.modalAvatarContainer}>
                      <Image
                        source={{
                          uri: person.profilePicture || "https://via.placeholder.com/200"
                        }}
                        style={styles.modalAvatar}
                        objectFit="cover"
                      />
                      {person.priority && (
                        <View style={styles.modalStarIndicator}>
                          <Ionicons name="star" size={16} color="#FFD700" />
                        </View>
                      )}
                    </View>
                    <YStack flex={1} gap="$2">
                      <XStack alignItems="center" gap="$2">
                        {person.registered && (
                          <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                        )}
                        <Paragraph 
                          fontSize={28} 
                          fontWeight="700" 
                          color={nicknameColor}
                          style={styles.modalNameText}
                        >
                          {person.nickname || person.name}
                        </Paragraph>
                      </XStack>
                      
                      <XStack alignItems="center" gap="$2">
                        <Paragraph fontSize={16} color="#999">
                          {person.occupation}
                        </Paragraph>
                        {person.priority && (
                          <Ionicons name="star" size={16} color="#FFD700" />
                        )}
                      </XStack>
                    </YStack>
                  </XStack>
                  <XStack gap="$2" marginTop="$2" alignItems="flex-start">
                    {person.birthday && (
                      <View style={styles.statusPill}>
                        <XStack alignItems="center" gap="$1">
                          <Paragraph fontSize={12} color="#666">Notification:</Paragraph>
                          <Paragraph fontSize={12} color="#4CAF50">Scheduled</Paragraph>
                        </XStack>
                      </View>
                    )}
                    {person.priority && person.birthday && (
                      <View style={[styles.statusPill, styles.reminderPill]}>
                        <XStack alignItems="center" gap="$1">
                          <Paragraph fontSize={12} color="#666">Reminder:</Paragraph>
                          <Paragraph fontSize={12} color="#FFD700">Scheduled</Paragraph>
                        </XStack>
                      </View>
                    )}
                  </XStack>
                </YStack>
              <YStack gap="$3" style={styles.infoSection}>
                {person.birthday && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="gift-outline" size={22} color={nicknameColor} />
                    <Paragraph fontSize={16} color="#fff">
                      {(() => {
                        const date = new Date(person.birthday);
                        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                        return date.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric"
                        });
                      })()}
                    </Paragraph>
                  </XStack>
                )}
                {person.email && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="mail-outline" size={22} color="#fff" />
                    <Paragraph fontSize={16} color="#fff">
                      {person.email}
                    </Paragraph>
                  </XStack>
                )}
                {person.phoneNumber && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="call-outline" size={22} color="#fff" />
                    <Paragraph fontSize={16} color="#fff">
                      {person.phoneNumber}
                    </Paragraph>
                  </XStack>
                )}
                  {person.payments && person.payments.length > 0 && (
                    <XStack gap="$3" alignItems="center">
                      <Ionicons name="card-outline" size={22} color="#fff" />
                      <Paragraph fontSize={16} color="#fff">
                        {person.payments.map((payment, index) => (
                          typeof payment === 'string' ? 
                            payment : 
                            payment.details || payment.type || ''
                        )).join('\n')}
                      </Paragraph>
                    </XStack>
                  )}
                {fullAddress && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="location-outline" size={22} color="#fff" />
                    <Paragraph fontSize={16} color="#fff">
                      {fullAddress}
                    </Paragraph>
                  </XStack>
                )}
              </YStack>
            </View>
            <View style={styles.actionBar}>
              {person.phoneNumber && (
                <>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`sms:${person.phoneNumber}`)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="chatbubble-outline" size={28} color="#fff" />
                    <Paragraph style={styles.actionText}>Text</Paragraph>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${person.phoneNumber}`)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="call-outline" size={28} color="#fff" />
                    <Paragraph style={styles.actionText}>Call</Paragraph>
                  </TouchableOpacity>
                </>
              )}
              {person.email && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${person.email}`)}
                  style={styles.actionButton}
                >
                  <Ionicons name="mail-outline" size={28} color="#fff" />
                  <Paragraph style={styles.actionText}>Mail</Paragraph>
                </TouchableOpacity>
              )}
              {fullAddress && (
                <TouchableOpacity
                  onPress={() => Clipboard.setStringAsync(fullAddress)}
                  style={styles.actionButton}
                >
                  <Ionicons name="copy-outline" size={28} color="#fff" />
                  <Paragraph style={styles.actionText}>Copy</Paragraph>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleEditPress}
                style={[styles.actionButton, { zIndex: 9999 }]}
              >
                <Ionicons name="pencil-outline" size={28} color="#fff" />
                <Paragraph style={styles.actionText}>Edit</Paragraph>
              </TouchableOpacity>
            </View>
          </Sheet.Frame>
        </Sheet>
      </View>
      <EditPersonForm
        person={person}
        visible={isEditFormVisible}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </Theme>
  );
}

// Function to handle shared contact links
export const handleSharedContact = (url: string) => {
  try {
    const data = url.split('?data=')[1];
    if (!data) return;
    
    const decodedData = JSON.parse(atob(data));
    const name = decodedData.name || decodedData.nickname;
    
    Alert.alert(
      "Add Contact",
      `Would you like to add ${name} to your contacts list?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Add",
          onPress: () => {
            const { usePeopleStore } = require('@/store/People');
            usePeopleStore.getState().addPerson(decodedData);
          }
        }
      ]
    );
  } catch (error) {
    Alert.alert("Error", "Invalid contact link");
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 2
  },
  statusPill: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  modalAvatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: 16 // Added to ensure space below for pills
  },
  reminderPill: {
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalNameText: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 4,
    paddingTop: 8,
    flexShrink: 1,
    maxWidth: '85%'
  },
  modalNotificationRow: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50'
  },
  modalReminderRow: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  modalScheduledText: {
    fontWeight: '600'
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    borderWidth: 2,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
    backgroundColor: "rgba(20,20,20,0.85)"
  },
  nameText: {
    flexShrink: 1,
    marginRight: 8,
    paddingVertical: 4
  },
  labelText: {
    marginRight: 4,
    flexShrink: 0
  },
  notificationWrapper: {
    marginTop: 8,
    marginBottom: 4
  },
  touchable: {
    width: "100%"
  },
  avatarContainer: {
    position: "relative"
  },
  statusBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8
  },
  reminderBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  occupationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  avatarGradient: {
    borderRadius: 22,
    padding: 2
  },
  avatarImage: {
    width: 40,
    height: 40
  },
  starIndicator: {
    position: "absolute",
    bottom: -2,
    left: -2,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: "#FFD700"
  },
  checkmark: {
    marginRight: 4
  },
  occupation: {
    marginTop: 2
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContainer: {
    borderRadius: 16,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "rgba(20,20,20,0.95)",
    borderColor: "rgba(200,200,200,0.8)",
    borderWidth: 2,
    padding: 0,
    overflow: "hidden",
    maxHeight: "80%",
    minHeight: "50%"
  },
  modalContent: {
    padding: 20,
    paddingBottom: 120, // Increased to prevent button overlap
    position: 'relative'
  },
  modalHeaderIcons: {
    position: 'absolute',
    top: -12, // This pulls it up
    left: 10,
    right: 10,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  shareIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20
  },
  closeIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#fff"
  },
  modalStarIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  infoSection: {
    marginTop: 16,
    paddingBottom: 20,
    gap: 12
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)"
  },
  actionButton: {
    width: 60,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500"
  }
});