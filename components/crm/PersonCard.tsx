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
  ViewStyle
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Person } from "@/types/people";

const colors = [
  "#007AFF",
  "#FF2D55",
  "#FF9500",
  "#4CD964",
  "#5856D6",
  "#5AC8FA"
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

  const renderDetails = () => (
    <YStack gap="$2" paddingHorizontal="$2">
      {person.email && (
        <Paragraph fontSize={14} numberOfLines={2}>
          📧 {person.email}
        </Paragraph>
      )}
      {person.phoneNumber && (
        <Paragraph fontSize={14} numberOfLines={1}>
          📞 {person.phoneNumber}
        </Paragraph>
      )}
      {person.birthday && (
        <Paragraph fontSize={14} numberOfLines={1}>
          🎂 {new Date(person.birthday).toLocaleDateString()}
        </Paragraph>
      )}
      {person.occupation && (
        <Paragraph fontSize={14} numberOfLines={2}>
          💼 {person.occupation}
        </Paragraph>
      )}
      <Paragraph fontSize={14} numberOfLines={1}>
        ✅ {person.registered ? "Registered" : "Not Registered"}
      </Paragraph>
      {person.address && (
        <Paragraph fontSize={14} numberOfLines={3}>
          🏠{" "}
          {[
            person.address.street,
            person.address.city,
            person.address.state,
            person.address.zipCode,
            person.address.country
          ]
            .filter(Boolean)
            .join(", ")}
        </Paragraph>
      )}
      {person.payments && person.payments.length > 0 && (
        <Paragraph fontSize={14} numberOfLines={2}>
          💰 {person.payments.map((p) => `${p.type}: ${p.details}`).join(", ")}
        </Paragraph>
      )}
      {person.notes && (
        <Paragraph fontSize={14} numberOfLines={3}>
          📝 {person.notes}
        </Paragraph>
      )}
      {person.socialMedia && person.socialMedia.length > 0 && (
        <Paragraph fontSize={14} numberOfLines={2}>
          🌐{" "}
          {person.socialMedia
            .map((s) => `${s.platform}: ${s.username}`)
            .join(", ")}
        </Paragraph>
      )}
    </YStack>
  );

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
          style={styles.card}
        >
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.touchable}
          >
            <XStack alignItems="center" gap="$3">
              <Image
                source={{
                  uri:
                    person.profilePicture ||
                    "https://via.placeholder.com/80"
                }}
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
          snapPoints={[90]}
          dismissOnSnapToBottom
          dismissOnOverlayPress
          zIndex={100000}
        >
          <Sheet.Overlay animation="quick" style={styles.overlay} />
          <Sheet.Frame
            padding="$4"
            backgroundColor="$gray1"
            style={styles.sheetFrame}
          >
            <Sheet.Handle />
            <XStack justifyContent="space-between" alignItems="center" mb="$4">
              <XStack alignItems="center" gap="$3" flex={1}>
                <Image
                  source={{
                    uri:
                      person.profilePicture ||
                      "https://via.placeholder.com/80"
                  }}
                  width={60}
                  height={60}
                  borderRadius={30}
                />
                <Paragraph
                  fontWeight="700"
                  fontSize={24}
                  color={nicknameColor}
                  flex={1}
                  numberOfLines={1}
                >
                  {person.nickname || person.name}
                </Paragraph>
              </XStack>
              <TouchableOpacity
                onPress={() => onEdit(person)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="pencil" size={24} color="#fff" />
              </TouchableOpacity>
            </XStack>
            <YStack gap="$3">{renderDetails()}</YStack>
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
    borderColor: "#ffffff",
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
  sheetFrame: {
    borderRadius: 16,
    maxHeight: "80%",
    width: "90%",
    alignSelf: "center",
    paddingBottom: 20,
    justifyContent: "flex-start",
    marginVertical: 40
  }
});
