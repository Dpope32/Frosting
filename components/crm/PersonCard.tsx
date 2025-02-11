import React, { useMemo, useCallback } from "react";
import {
  Card,
  Image,
  Paragraph,
  XStack,
  YStack,
  Theme,
  Sheet
} from "tamagui";
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
    if (!person.address) return "";
    return [
      person.address.street,
      person.address.city,
      person.address.state,
      person.address.zipCode,
      person.address.country
    ]
      .filter(Boolean)
      .join(", ");
  }, [person.address]);

  return (
    <Theme name="dark">
      <View style={[styles.container, containerStyle]}>
        <Card
          elevate
          backgroundColor="rgba(20,20,20,0.8)"
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
                <XStack alignItems="center" gap="$1">
                  <XStack alignItems="center">
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
                </XStack>
                {person.occupation && person.occupation !== "None" && (
                  <Paragraph
                    fontSize={12}
                    color="rgba(255,255,255,0.7)"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.occupation}
                  >
                    {person.occupation}
                  </Paragraph>
                )}
              </YStack>
            </XStack>
          </TouchableOpacity>
        </Card>
        <Sheet
          modal
          open={isExpanded}
          onOpenChange={(isOpen: boolean) => !isOpen && onPress?.()}
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
              <YStack alignItems="center" gap="$4">
              <View style={{ position: "relative", width: 120, height: 120 }}>
                <Image
                  source={{
                    uri: person.profilePicture || "https://via.placeholder.com/200"
                  }}
                  style={[styles.modalAvatar, { width: 120, height: 120 }]}
                  objectFit="cover"
                />
                {person.priority && (
                  <View
                    style={[
                      styles.starIndicator,
                      { top: 2, right: 2, bottom: undefined, left: undefined }
                    ]}
                  >
                    <Ionicons name="star" size={18} color="#FFD700" />
                  </View>
                )}
              </View>
                <YStack alignItems="center" gap="$2">
                  <XStack gap="$2" alignItems="center">
                    <Paragraph fontSize={32} fontWeight="700" color={nicknameColor} pt={8}>
                      {person.nickname || person.name}
                    </Paragraph>
                    {person.registered && (
                      <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    )}
                  </XStack>
                  {person.occupation && person.occupation !== "None" && (
                    <Paragraph fontSize={18} color="#999">
                      {person.occupation}
                    </Paragraph>
                  )}
                </YStack>
              </YStack>
              <YStack gap="$4" style={styles.infoSection}>
                {person.birthday && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="gift-outline" size={24} color={nicknameColor} />
                    <Paragraph fontSize={18} color="#fff">
                      {new Date(person.birthday).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric"
                      })}
                    </Paragraph>
                  </XStack>
                )}
                {person.email && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="mail-outline" size={24} color="#fff" />
                    <Paragraph fontSize={18} color="#fff">
                      {person.email}
                    </Paragraph>
                  </XStack>
                )}
                {person.phoneNumber && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="call-outline" size={24} color="#fff" />
                    <Paragraph fontSize={18} color="#fff">
                      {person.phoneNumber}
                    </Paragraph>
                  </XStack>
                )}
                {person.payments && person.payments.length > 0 && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="card-outline" size={24} color="#fff" />
                    <Paragraph fontSize={18} color="#fff">
                      {person.payments[0].type}
                      {person.payments[0].details ? ` - ${person.payments[0].details}` : ""}
                    </Paragraph>
                  </XStack>
                )}
                {fullAddress && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="location-outline" size={24} color="#fff" />
                    <Paragraph fontSize={18} color="#fff">
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
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${person.phoneNumber}`)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="call-outline" size={28} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
              {person.email && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${person.email}`)}
                  style={styles.actionButton}
                >
                  <Ionicons name="mail-outline" size={28} color="#fff" />
                </TouchableOpacity>
              )}
              {fullAddress && (
                <TouchableOpacity
                  onPress={() => Clipboard.setStringAsync(fullAddress)}
                  style={styles.actionButton}
                >
                  <Ionicons name="copy-outline" size={28} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </Sheet.Frame>
        </Sheet>
      </View>
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
  touchable: {
    width: "100%"
  },
  avatarContainer: {
    position: "relative"
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
    minHeight: "50%" // Add this to ensure enough space
  },
  modalContent: {
    padding: 20,
    paddingBottom: 100,
    position: 'relative'
  },
  modalHeaderIcons: {
    position: 'absolute',
    top: 10,
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
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 60,
    overflow: 'hidden'
  },
  infoSection: {
    marginTop: 32,
    paddingBottom: 20 // Add some padding at the bottom
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 16
  },
  actionButton: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center"
  }
});
