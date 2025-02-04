// PersonCard.tsx
import React from "react";
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
  Linking
} from "react-native";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
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

export function PersonCard({
  person,
  onEdit,
  isExpanded = false,
  onPress,
  containerStyle
}: PersonCardProps) {
  const nicknameColor = getColorForPerson(person.id || person.name);
  const fullAddress =
    person.address &&
    [
      person.address.street,
      person.address.city,
      person.address.state,
      person.address.zipCode,
      person.address.country
    ]
      .filter(Boolean)
      .join(", ");

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
              <Image
                source={{ uri: person.profilePicture || "https://via.placeholder.com/80" }}
                width={50}
                height={50}
                borderRadius={25}
              />
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
              <Image
                source={{ uri: person.profilePicture || "https://via.placeholder.com/200" }}
                width={150}
                height={150}
                borderRadius={75}
              />
              <Paragraph
                fontWeight="800"
                fontSize={26}
                color={nicknameColor}
                textAlign="center"
              >
                {person.nickname || person.name}
              </Paragraph>
            </YStack>
            <YStack gap="$4">
              {person.email && (
                <Paragraph fontSize={16} fontWeight="600" numberOfLines={2}>
                  {person.email}
                </Paragraph>
              )}
              {person.phoneNumber && (
                <Paragraph fontSize={16} fontWeight="600" numberOfLines={1}>
                  {person.phoneNumber}
                </Paragraph>
              )}
              {person.birthday && (
                <Paragraph fontSize={16} fontWeight="600" numberOfLines={1}>
                  {new Date(person.birthday).toLocaleDateString()}
                </Paragraph>
              )}
              {person.occupation && (
                <Paragraph fontSize={16} fontWeight="600" numberOfLines={2}>
                  {person.occupation}
                </Paragraph>
              )}
              <Paragraph fontSize={16} fontWeight="600" numberOfLines={1}>
                {person.registered ? "Registered" : "Not Registered"}
              </Paragraph>
              {person.address && (
                <Paragraph fontSize={16} fontWeight="600" numberOfLines={3}>
                  {fullAddress}
                </Paragraph>
              )}
            </YStack>
            <XStack justifyContent="space-evenly" alignItems="center" mt="$4">
              {person.address && (
                <TouchableOpacity
                  onPress={() =>
                    Clipboard.setStringAsync(fullAddress || "")
                  }
                >
                  <Ionicons name="copy-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              {person.email && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${person.email}`)}
                >
                  <Ionicons name="mail-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              {person.phoneNumber && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${person.phoneNumber}`)}
                >
                  <Ionicons name="call-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              {person.phoneNumber && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`sms:${person.phoneNumber}`)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => onEdit(person)}>
                <Ionicons name="pencil" size={24} color="#fff" />
              </TouchableOpacity>
            </XStack>
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
    padding: 24,
    marginVertical: 12,
    overflow: "hidden"
  }
});
