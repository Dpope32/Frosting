import React, { useMemo } from "react";
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
  ScrollView
} from "react-native";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Person } from "@/types/people";

const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A8",
  "#FF8C33",
  "#8C33FF",
  "#33FFF2",
  "#F2FF33",
  "#FF3333",
  "#33FF33",
  "#3333FF",
  "#FF33FF",
  "#33FFFF",
  "#FFFF33",
  "#FF9900",
  "#99FF00",
  "#0099FF",
  "#9900FF",
  "#FF0099",
  "#00FF99"
];

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

type InfoRowProps = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ iconName, label, value }) => {
  return (
    <XStack alignItems="center" gap="$2" style={styles.infoRow}>
      <Ionicons name={iconName} size={20} color="#fff" />
      <Paragraph fontWeight="600" fontSize={16} color="#ccc" style={styles.infoLabel}>
        {label}:
      </Paragraph>
      <Paragraph
        fontWeight="700"
        fontSize={16}
        color="#fff"
        numberOfLines={label === "Email" ? 1 : undefined}
        ellipsizeMode="tail"
        style={styles.infoValue}
      >
        {value}
      </Paragraph>
    </XStack>
  );
};

type ActionButtonProps = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({ iconName, label, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionButton}>
      <Ionicons name={iconName} size={16} color="#fff" />
      <Paragraph fontWeight="600" fontSize={12} color="#fff" style={styles.actionLabel}>
        {label}
      </Paragraph>
    </TouchableOpacity>
  );
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
          p="$3"
          backgroundColor="$gray2"
          borderRadius="$4"
          animation="quick"
          pressStyle={{ scale: 0.98 }}
          style={[styles.card, { borderColor: nicknameColor }]}
        >
          <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable}>
            <XStack alignItems="center" gap="$3">
              <View style={styles.avatarWrapper}>
                <LinearGradient colors={["#FF7E5F", "#FEB47B"]} style={styles.avatarGradient}>
                  <Image
                    source={{ uri: person.profilePicture || "https://via.placeholder.com/80" }}
                    width={50}
                    height={50}
                    borderRadius={25}
                    style={styles.avatarImage}
                  />
                </LinearGradient>
              </View>
              <Paragraph
                fontWeight="700"
                fontSize={18}
                color={nicknameColor}
                numberOfLines={1}
                flex={1}
              >
                {person.nickname || person.name}
              </Paragraph>
            </XStack>
          </TouchableOpacity>
        </Card>
        <Sheet
          modal
          open={isExpanded}
          onOpenChange={(isOpen: boolean) => !isOpen && onPress?.()}
          snapPoints={[85]}
          dismissOnSnapToBottom
          dismissOnOverlayPress
          zIndex={100000}
        >
          <Sheet.Overlay animation="quick" style={styles.overlay} />
          <Sheet.Frame style={styles.sheetFrameExpanded}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
            <Sheet.Handle />
            <YStack alignItems="center" gap="$5" mb="$4">
              <View style={styles.avatarLargeWrapper}>
                <LinearGradient colors={["#FF7E5F", "#FEB47B"]} style={styles.avatarLargeGradient}>
                  <Image
                    source={{ uri: person.profilePicture || "https://via.placeholder.com/200" }}
                    width={150}
                    height={150}
                    borderRadius={75}
                    style={styles.avatarLargeImage}
                  />
                </LinearGradient>
              </View>
              <Paragraph
                fontWeight="800"
                fontSize={26}
                color={nicknameColor}
                textAlign="center"
              >
                {person.nickname || person.name}
              </Paragraph>
            </YStack>
            <YStack gap="$3" style={styles.infoContainer}>
              {person.email && (
                <InfoRow iconName="mail-outline" label="Email" value={person.email} />
              )}
              {person.phoneNumber && (
                <InfoRow iconName="call-outline" label="Phone" value={person.phoneNumber} />
              )}
              {person.birthday && (
                <InfoRow
                  iconName="calendar-outline"
                  label="Birthday"
                  value={new Date(person.birthday).toLocaleDateString()}
                />
              )}
              {person.occupation && (
                <InfoRow iconName="briefcase-outline" label="Occupation" value={person.occupation} />
              )}
              <InfoRow
                iconName={person.registered ? "checkmark-circle-outline" : "close-circle-outline"}
                label="Status"
                value={person.registered ? "Registered" : "Not Registered"}
              />
              {person.address && (
                <InfoRow iconName="location-outline" label="Address" value={fullAddress} />
              )}
            </YStack>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actionButtonContainer}
            >
              {person.address && (
                <ActionButton
                  iconName="copy-outline"
                  label="Copy Address"
                  onPress={() => Clipboard.setStringAsync(fullAddress || "")}
                />
              )}
              {person.email && (
                <ActionButton
                  iconName="mail-outline"
                  label="Email"
                  onPress={() => Linking.openURL(`mailto:${person.email}`)}
                />
              )}
              {person.phoneNumber && (
                <ActionButton
                  iconName="call-outline"
                  label="Call"
                  onPress={() => Linking.openURL(`tel:${person.phoneNumber}`)}
                />
              )}
              {person.phoneNumber && (
                <ActionButton
                  iconName="chatbubble-outline"
                  label="SMS"
                  onPress={() => Linking.openURL(`sms:${person.phoneNumber}`)}
                />
              )}
              <ActionButton iconName="pencil" label="Edit" onPress={() => onEdit(person)} />
            </ScrollView>
          </Sheet.Frame>
        </Sheet>
      </View>
    </Theme>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    borderWidth: 2,
    shadowRadius: 3.84,
    elevation: 5
  },
  touchable: {
    width: "100%"
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  sheetFrameExpanded: {
    borderRadius: 16,
    maxHeight: "83%",
    width: "80%",
    alignSelf: "center",
    justifyContent: "flex-start",
    padding: 16, // Reduced from 24
    marginVertical: 12,
    overflow: "hidden",
    backgroundColor: "rgba(20,20,20,0.9)"
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 26,
    overflow: 'hidden'  // Make sure image doesn't overflow
  },
  avatarGradient: {
    borderRadius: 27,
    padding: 2
  },
  avatarImage: {
    width: 50,
    height: 50
  },
  avatarLargeWrapper: {
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 75,
    overflow: 'hidden'
  },
  avatarLargeGradient: {
    borderRadius: 77,
    padding: 3
  },
  avatarLargeImage: {
    width: 75,
    height: 75
  },
  infoContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    marginBottom: 8 // Add small margin instead of using gap
  },
  infoRow: {
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center"
  },
  infoLabel: {
    marginLeft: 4,
    minWidth: 90,
    flexShrink: 0
  },
  infoValue: {
    flex: 1,
    marginRight: 4 // Add some right margin to prevent text from touching edge
  },
  actionButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4, // Add minimal padding
    gap: 8
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    flexShrink: 0,
    minWidth: 60
  },
  actionLabel: {
    marginTop: 2
  }
});
