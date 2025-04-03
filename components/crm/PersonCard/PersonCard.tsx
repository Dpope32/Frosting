import React, { useMemo, useEffect } from "react";
import { useCRMStore } from "@/store/CRMStore";
import { Card, Image, Paragraph, XStack, YStack, Theme, Sheet, isWeb } from "tamagui";
import { TouchableOpacity, View, StyleProp, ViewStyle, Linking, Alert, useColorScheme, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import type { Person } from "@/types/people";
import { styles } from "./styles";
import { webStyles } from "./webStyles";

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]}-${match[3]}`;
  }
  return phone;
};

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

// Function to get a darker version of an HSL color while preserving hue
const getDarkerHslColor = (hslColor: string): string => {
  // Extract HSL components
  const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslColor;
  
  const hue = parseInt(match[1], 10);
  const saturation = parseInt(match[2], 10);
  const lightness = parseInt(match[3], 10);
  
  // Create a darker version by reducing lightness
  return `hsl(${hue}, ${saturation}%, ${Math.max(10, lightness - 80)}%)`;
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
  containerStyle
}: PersonCardProps) {
  const {
    expandedPersonId,
    expandPersonCard,
    collapsePersonCard,
    openEditModal
  } = useCRMStore();

  const isExpanded = expandedPersonId === person.id;

  useEffect(() => {
    return () => {
      if (isExpanded) {
        collapsePersonCard();
      }
    };
  }, [isExpanded, collapsePersonCard]);

  const handlePress = () => {
    if (isExpanded) {
      collapsePersonCard();
    } else {
      expandPersonCard(person.id!);
    }
  };

  const handleEdit = (person: Person) => {
    collapsePersonCard();
    openEditModal(person);
    onEdit(person);
  };

  const nicknameColor = getColorForPerson(person.id || person.name);
  const fullAddress = useMemo(() => {
    if (!person.address) return "";
    return person.address.street || "";
  }, [person.address]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Apply web-specific styles conditionally
  const applyWebStyle = (styleKey: keyof typeof webStyles) => {
    return Platform.OS === 'web' ? webStyles[styleKey] as any : {};
  };

  return (
    <Theme name="dark">
      <View style={[styles.container, containerStyle]}>
        <Card
          elevate
          br="$4"
          animation="quick"
          pressStyle={{ scale: 0.90 }}
          style={[
            styles.card,
            {
              borderColor: nicknameColor,
              backgroundColor: isDark ? getDarkerHslColor(nicknameColor) : `${nicknameColor}15`
            },
            applyWebStyle('card')
          ] as any}
        >
          <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.touchable as any}>
            <XStack alignItems="center" gap="$3" style={styles.cardContent as any}>
              <View style={[styles.avatarContainer, applyWebStyle('avatarContainer')] as any}>
                <View style={[styles.avatarWrapper, applyWebStyle('avatarWrapper')] as any}>
                  <Image
                    source={{
                      uri: person.profilePicture || "https://via.placeholder.com/80"
                    }}
                    width={Platform.OS === 'web' ? 80 : 30}
                    height={Platform.OS === 'web' ? 60 : 30}
                    br={Platform.OS === 'web' ? 30 : 15}
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
                  {person.registered && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#4CAF50"
                      style={styles.checkmark as any}
                    />
                  )}
                  <Paragraph
                    fontWeight="600"
                    fontSize={isWeb? 18 : 16}
                    color={isDark ? adjustColor(nicknameColor, 250) : adjustColor(nicknameColor, -40)}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {person.nickname || person.name}
                  </Paragraph>

                  </XStack>
                  {person.occupation && (
                  <Paragraph
                  fontSize={isWeb? 16 : 12}
                  color={isDark ? "#999" : "#333"}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ marginTop: -2,}}
                >
                  {person.occupation}
                </Paragraph>
                )}
              </View>
            </XStack>
          </TouchableOpacity>
        </Card>

        <Sheet
          modal
          open={isExpanded}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) collapsePersonCard();
          }}
          snapPoints={[80, 95]}
          dismissOnSnapToBottom
          dismissOnOverlayPress
          animation="quick"
          zIndex={100000}
        >
          <Sheet.Overlay animation="quick" style={styles.overlay as any} />
          <Sheet.Frame 
              style={[
                styles.modalContainer, 
                {
                  backgroundColor: isDark ? "rgba(20,20,20,0.95)" : "rgba(255,255,255,0.95)",
                  borderColor: isDark ? "rgba(200,200,200,0.8)" : "rgba(100,100,100,0.3)",
                  overflow: "hidden"
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
                    { backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(100,100,100,0.5)" }
                  ] as any}
                  onPress={() => {
                    const shareData = btoa(JSON.stringify(person));
                    const shareUrl = `kaiba-nexus://share?data=${shareData}`;
                    const plainText = `Contact: ${person.nickname || person.name}\n` +
                      (person.phoneNumber ? `Phone: ${formatPhoneNumber(person.phoneNumber)}\n` : '') +
                      (person.email ? `Email: ${person.email}\n` : '') +
                      (person.occupation ? `Occupation: ${person.occupation}\n` : '');
                    const clipboardContent = `${shareUrl}\n---\n${plainText}`;
                    Clipboard.setStringAsync(clipboardContent);
                    Alert.alert("Success", "Contact info copied to clipboard!");
                  }}
                >
                  <Ionicons name="share-outline" size={24} color={isDark ? "#fff" : "#fff"} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.closeIcon,
                    { backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(100,100,100,0.5)" }
                  ] as any}
                  onPress={() => handlePress?.()}
                >
                  <Ionicons name="close-outline" size={24} color={isDark ? "#fff" : "#fff"} />
                </TouchableOpacity>
              </View>

              <View style={[styles.headerRow, applyWebStyle('headerRow')] as any}>
                <View style={[styles.modalAvatarContainer] as any}>
                  <Image
                    source={{
                      uri: person.profilePicture || "https://via.placeholder.com/200"
                    }}
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
                    <Paragraph fontSize={15} color={isDark ? "#999" : "#666"} numberOfLines={1}>
                      {person.occupation}
                    </Paragraph>
                    {person.priority && (
                      <Ionicons name="star" size={15} color="#FFD700" />
                    )}
                  </XStack>
                </View>
              </View>

              <XStack style={styles.pillRow as any}>
                {person.birthday && (
                  <View style={[
                    styles.statusPill, 
                    { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(100,100,100,0.2)" }
                  ] as any}>
                    <XStack alignItems="center" gap="$1">
                      <Paragraph fontSize={13} fontFamily="$body" color={isDark ? "#666" : "#555"}>Notification:</Paragraph>
                      <Paragraph fontSize={13} fontFamily="$body" color="#4CAF50">Scheduled</Paragraph>
                    </XStack>
                  </View>
                )}
                {person.priority && person.birthday && (
                  <View style={[
                    styles.statusPill, 
                    styles.reminderPill,
                    { backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(100,100,100,0.2)" }
                  ] as any}>
                    <XStack alignItems="center" gap="$1">
                      <Paragraph fontSize={13} fontFamily="$body" color={isDark ? "#666" : "#555"}>Reminder:</Paragraph>
                      <Paragraph fontSize={13} fontFamily="$body" color="#FFD700">Scheduled</Paragraph>
                    </XStack>
                  </View>
                )}
              </XStack>

              <YStack style={styles.infoSection as any}>
                {person.birthday && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="gift-outline" size={22} color={nicknameColor} />
                    <Paragraph fontSize={14} fontFamily="$body" color={isDark ? "#fff" : "#333"}>
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
                {person.occupation && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="briefcase-outline" size={22} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                      {person.occupation}
                    </Paragraph>
                  </XStack>
                )}
                {person.email && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="mail-outline" size={22} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                      {person.email}
                    </Paragraph>
                  </XStack>
                )}
                {person.phoneNumber && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="call-outline" size={22} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                      {formatPhoneNumber(person.phoneNumber)}
                    </Paragraph>
                  </XStack>
                )}
                {fullAddress && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="location-outline" size={22} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                      {fullAddress}
                    </Paragraph>
                  </XStack>
                )}
                {person.relationship && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="people-outline" size={22} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                      {person.relationship}
                    </Paragraph>
                  </XStack>
                )}
                {person.additionalInfo && (
                  <XStack gap="$3" alignItems="center">
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                      {person.additionalInfo}
                    </Paragraph>
                  </XStack>
                )}
                {person.notes && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="document-text-outline" size={22} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                      {person.notes}
                    </Paragraph>
                  </XStack>
                )}
                {person.tags && person.tags.length > 0 && (
                  <XStack gap="$3" alignItems="flex-start">
                    <Ionicons name="pricetag-outline" size={22} color={isDark ? "#fff" : "#555"} style={{ marginTop: 2 }} />
                    <YStack>
                      <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                        {person.tags.join(", ")}
                      </Paragraph>
                    </YStack>
                  </XStack>
                )}
                {person.lastContactDate && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="time-outline" size={22} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
                      Last Contact: {new Date(person.lastContactDate).toLocaleDateString()}
                    </Paragraph>
                  </XStack>
                )}
                {person.importantDates && person.importantDates.length > 0 && (
                  <XStack gap="$3" alignItems="flex-start">
                    <Ionicons name="calendar-outline" size={22} color={isDark ? "#fff" : "#555"} style={{ marginTop: 2 }} />
                    <YStack>
                      {person.importantDates.map((date, index) => (
                        <Paragraph key={index} fontSize={14} color={isDark ? "#fff" : "#333"}>
                          {date.description}: {new Date(date.date).toLocaleDateString()}
                        </Paragraph>
                      ))}
                    </YStack>
                  </XStack>
                )}
                {person.socialMedia && person.socialMedia.length > 0 && (
                  <XStack gap="$3" alignItems="flex-start">
                    <Ionicons name="cash-outline" size={22} color={isDark ? "#fff" : "#555"} style={{ marginTop: 2 }} />
                    <YStack>
                      {person.socialMedia.map((social, index) => (
                        <Paragraph fontFamily="$body" key={index} fontSize={14} color={isDark ? "#fff" : "#333"}>
                          {social.platform}: {social.username}
                        </Paragraph>
                      ))}
                    </YStack>
                  </XStack>
                )}
                {person.additionalInfo && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="information-circle-outline" size={22} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#333"}>
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
                  backgroundColor: isDark ? "rgba(20,20,20,0.95)" : "rgba(240,240,240,0.95)",
                  borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
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
                    <Ionicons name="chatbubble-outline" size={24} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? "#fff" : "#555" }] as any}>Text</Paragraph>
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
                    <Ionicons name="call-outline" size={24} color={isDark ? "#fff" : "#555"} />
                    <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? "#fff" : "#555" }] as any}>Call</Paragraph>
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
                  <Ionicons name="mail-outline" size={24} color={isDark ? "#fff" : "#555"} />
                  <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? "#fff" : "#555" }] as any}>eMail</Paragraph>
                </TouchableOpacity>
              )}
              {fullAddress && (
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setStringAsync(fullAddress)
                      .then(() => Alert.alert("Success", "Address copied to clipboard!"))
                      .catch(err => console.error('Could not copy address', err));
                  }}
                  style={styles.actionButton as any}
                  activeOpacity={0.6}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="copy-outline" size={24} color={isDark ? "#fff" : "#555"} />
                  <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? "#fff" : "#555" }] as any}>Copy</Paragraph>
                </TouchableOpacity>
              )}
                <TouchableOpacity
                onPress={(e) => {
                  if (e) {
                    if (typeof e.preventDefault === 'function') e.preventDefault();
                    if (typeof e.stopPropagation === 'function') e.stopPropagation();
                  }
                  handleEdit(person);
                }}
                style={[styles.actionButton, { zIndex: 99 }] as any}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="pencil-outline" size={24} color={isDark ? "#fff" : "#555"} />
                <Paragraph fontFamily="$body" style={[styles.actionText, { color: isDark ? "#fff" : "#555" }] as any}>Edit</Paragraph>
              </TouchableOpacity>
            </View>
          </Sheet.Frame>
        </Sheet>
      </View>
    </Theme>
  );
}
