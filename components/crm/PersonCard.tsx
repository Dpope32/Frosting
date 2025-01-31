import { Card, H5, Image, Paragraph, XStack, YStack } from "tamagui";
import { PlatformIcons } from "./PlatformIcons";
import type { Person } from "@/types/people";

export function PersonCard({ person }: { person: Person }) {
  return (
    <Card elevate p="$3">
      <XStack gap="$3">
        {person.profilePicture && (
          <Image
            source={{ uri: person.profilePicture }}
            width={80}
            height={80}
            br="$3"
          />
        )}
        
        <YStack flex={1}>
          <H5>{person.name}</H5>
          {person.nickname && <Paragraph color="$gray10">{person.nickname}</Paragraph>}
          
          <XStack mt="$2" gap="$2" flexWrap="wrap">
            {person.email && <PlatformIcons type="email" value={person.email} />}
            {person.phoneNumber && <PlatformIcons type="phone" value={person.phoneNumber} />}
            {person.payments?.map((payment, i) => (
              <PlatformIcons key={i} type={payment.platform} value={payment.username} />
            ))}
          </XStack>
        </YStack>
      </XStack>

      <YStack mt="$3" gap="$2">
        {person.address && (
          <Paragraph>
            📍 {[person.address.street, person.address.city, person.address.state].filter(Boolean).join(', ')}
          </Paragraph>
        )}
        
        {person.birthday && (
          <Paragraph>🎂 {new Date(person.birthday).toLocaleDateString()}</Paragraph>
        )}
        
        {person.socialMedia?.map((social, i) => (
          <Paragraph key={i}>
            🌐 {social.platform}: {social.username}
          </Paragraph>
        ))}
      </YStack>
    </Card>
  );
}
