import { FlatList } from "react-native";
import { Card, H4, Paragraph, ScrollView, Separator, YStack } from "tamagui";
import { usePeopleStore } from "@/store/People";
import { PersonCard } from "@/components/crm/PersonCard";
import { AddPersonForm } from "@/components/crm/AddPersonForm";

export default function CRM() {
  const { people, families } = usePeopleStore();

  return (
    <ScrollView p="$4" bg="$background" pt="$15">
      <YStack gap="$4">
        <H4>Family Groups</H4>
        <FlatList
          horizontal
          data={Object.values(families)}
          renderItem={({ item }) => (
            <Card elevate p="$3" minWidth={200} mr="$3">
              <Card.Header>
                <Paragraph fontWeight="800">{item.name}</Paragraph>
                {item.description && <Paragraph color="$gray10">{item.description}</Paragraph>}
              </Card.Header>
            </Card>
          )}
        />

        <Separator />

        <H4>All Contacts</H4>
        <FlatList
          data={Object.values(people)}
          renderItem={({ item }) => <PersonCard person={item} />}
          ItemSeparatorComponent={() => <Separator my="$4" />}
        />

        <AddPersonForm />
      </YStack>
    </ScrollView>
  );
}
