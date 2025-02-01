// PersonCard.tsx
import React, { useState } from "react";
import { Card, Image, Paragraph, XStack, YStack, Theme } from "tamagui";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Person } from "@/types/people";

const colors = ["#007AFF", "#FF2D55", "#FF9500", "#4CD964", "#5856D6", "#5AC8FA"];

const getColorForPerson = (id: string | undefined) => {
  if (!id) return colors[0];
  const hash = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function PersonCard({ person, onEdit }: { person: Person; onEdit: (person: Person) => void }) {
  const [expanded, setExpanded] = useState(false);
  const nicknameColor = getColorForPerson(person.id || person.name);

  return (
    <Theme name="dark">
      <Card
        elevate
        p="$3"
        backgroundColor={expanded ? "$gray3" : "$gray2"}
        borderRadius="$4"
        style={{ width: "48%", marginBottom: 16, position: "relative" }}
      >
        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
          <XStack alignItems="center" gap="$3">
            <Image
              source={{ uri: person.profilePicture || "https://via.placeholder.com/80" }}
              width={50}
              height={50}
              borderRadius={25}
            />
            <Paragraph fontWeight="700" fontSize={18} color={nicknameColor} numberOfLines={1}>
              {person.nickname || person.name}
            </Paragraph>
          </XStack>
        </TouchableOpacity>

        {expanded && (
          <>
            {/* Edit Icon in Top Right, shown only when expanded */}
            <TouchableOpacity onPress={() => onEdit(person)} style={{ position: "absolute", top: 8, right: 8 }}>
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
            <YStack mt="$3" gap="$2" paddingHorizontal="$2" animation="bouncy">
              {person.email && <Paragraph fontSize={14}>📧 {person.email}</Paragraph>}
              {person.phoneNumber && <Paragraph fontSize={14}>📞 {person.phoneNumber}</Paragraph>}
              {person.birthday && (
                <Paragraph fontSize={14}>🎂 {new Date(person.birthday).toLocaleDateString()}</Paragraph>
              )}
              {person.occupation && <Paragraph fontSize={14}>💼 {person.occupation}</Paragraph>}
              <Paragraph fontSize={14}>✅ {person.registered ? "Registered" : "Not Registered"}</Paragraph>
              {person.address && (
                <Paragraph fontSize={14}>
                  🏠{" "}
                  {`${person.address.street}, ${person.address.city}, ${person.address.state}, ${person.address.zipCode}, ${person.address.country}`
                    .replace(/(,\s*)+$/, "")}
                </Paragraph>
              )}
              {person.payments && person.payments.length > 0 && (
                <Paragraph fontSize={14}>
                  💰 {person.payments.map((p) => `${p.type}: ${p.details}`).join(", ")}
                </Paragraph>
              )}
              {person.notes && <Paragraph fontSize={14}>📝 {person.notes}</Paragraph>}
              {person.socialMedia && person.socialMedia.length > 0 && (
                <Paragraph fontSize={14}>
                  🌐{" "}
                  {person.socialMedia
                    .map((s) => `${s.platform}: ${s.username}`)
                    .join(", ")}
                </Paragraph>
              )}
            </YStack>
          </>
        )}
      </Card>
    </Theme>
  );
}
