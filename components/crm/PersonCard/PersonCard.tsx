import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  Card,
  Image,
  Paragraph,
  XStack,
  YStack,
  Theme,
  Sheet
} from "tamagui";
import { EditPersonForm } from "../Forms/EditPersonForm";
import {
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  Linking,
  Alert,
  useColorScheme
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import type { Person } from "@/types/people";
import { styles } from "./styles";

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
  const fullAddress = useMemo(() => person.address?.street || "", [person.address]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleEditPress = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(person);
  }, [onEdit, person]);

  return (
    <Theme name="dark">
      <View style={[styles.container, containerStyle]}>
        <Card
          elevate
          backgroundColor={adjustColor(nicknameColor, -160)}
          borderRadius="$4"
          animation="quick"
          pressStyle={{ scale: 0.90 }}
          style={[
            styles.card,
            {
              borderColor: nicknameColor,
              backgroundColor: isDark ? "rgba(40,40,40,0.85)" : "rgba(200,200,200,0.95)"
            }
          ]}
        >
          <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable}>
            <XStack alignItems="center" gap="$3" style={styles.cardContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{
                      uri: person.profilePicture || "https://via.placeholder.com/80"
                    }}
                    width={40}
                    height={40}
                    borderRadius={20}
                    style={styles.avatarImage}
                  />
                </View>
                {person.priority && (
                  <View style={styles.starIndicator}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
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
                    fontWeight="500"
                    fontSize={15}
                    color={nicknameColor}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.nameText}
                  >
                    {person.nickname || person.name}
                  </Paragraph>
                </XStack>
                <Paragraph
                  fontSize={12}
                  color={isDark ? "#999" : "#666"}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.occupationText}
                >
                  {person.occupation}
                </Paragraph>
              </View>
            </XStack>
          </TouchableOpacity>
        </Card>

        <Sheet
          modal
          open={isExpanded}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) onPress?.();
          }}
          snapPoints={[80, 95]}
          dismissOnSnapToBottom
          dismissOnOverlayPress
          animation="quick"
          zIndex={100000}
        >
          <Sheet.Overlay animation="quick" style={styles.overlay} />
          <Sheet.Frame style={styles.modalContainer}>
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

              <View style={styles.headerRow}>
                <View style={[styles.modalAvatarContainer]}>
                  <Image
                    source={{
                      uri: person.profilePicture || "https://via.placeholder.com/200"
                    }}
                    style={styles.modalAvatar}
                    objectFit="cover"
                  />
                  {person.priority && (
                    <View style={styles.modalStarIndicator}>
                      <Ionicons name="star" size={16} color="#FFD700"/>
                    </View>
                  )}
                </View>
                <View style={styles.nameColumn}>
                  <Paragraph
                    color={nicknameColor}
                    style={styles.modalNameText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {person.nickname || person.name}
                  </Paragraph>
                  <XStack alignItems="center" gap="$2">
                    <Paragraph fontSize={16} color="#999" numberOfLines={1}>
                      {person.occupation}
                    </Paragraph>
                    {person.priority && (
                      <Ionicons name="star" size={16} color="#FFD700" />
                    )}
                  </XStack>
                </View>
              </View>

              <XStack style={styles.pillRow}>
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

              <YStack style={styles.infoSection}>
                {person.birthday && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="gift-outline" size={22} color={nicknameColor} />
                    <Paragraph fontSize={14} color="#fff">
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
                    <Paragraph fontSize={14} color="#fff">
                      {person.email}
                    </Paragraph>
                  </XStack>
                )}
                {person.phoneNumber && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="call-outline" size={22} color="#fff" />
                    <Paragraph fontSize={14} color="#fff">
                      {formatPhoneNumber(person.phoneNumber)}
                    </Paragraph>
                  </XStack>
                )}
                {fullAddress && (
                  <XStack gap="$3" alignItems="center">
                    <Ionicons name="location-outline" size={22} color="#fff" />
                    <Paragraph fontSize={14} color="#fff">
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
                    <Ionicons name="chatbubble-outline" size={24} color="#fff" />
                    <Paragraph style={styles.actionText}>Text</Paragraph>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${person.phoneNumber}`)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="call-outline" size={24} color="#fff" />
                    <Paragraph style={styles.actionText}>Call</Paragraph>
                  </TouchableOpacity>
                </>
              )}
              {person.email && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${person.email}`)}
                  style={styles.actionButton}
                >
                  <Ionicons name="mail-outline" size={24} color="#fff" />
                  <Paragraph style={styles.actionText}>eMail</Paragraph>
                </TouchableOpacity>
              )}
              {fullAddress && (
                <TouchableOpacity
                  onPress={() => Clipboard.setStringAsync(fullAddress)}
                  style={styles.actionButton}
                >
                  <Ionicons name="copy-outline" size={24} color="#fff" />
                  <Paragraph style={styles.actionText}>Copy</Paragraph>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleEditPress}
                style={[styles.actionButton, { zIndex: 9999 }]}
              >
                <Ionicons name="pencil-outline" size={24} color="#fff" />
                <Paragraph style={styles.actionText}>Edit</Paragraph>
              </TouchableOpacity>
            </View>
          </Sheet.Frame>
        </Sheet>
      </View>

    </Theme>
  );
}

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
        { text: "Cancel", style: "cancel" },
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
