// CRM.tsx
import React, { useState } from "react";
import { FlatList } from "react-native";
import { H4, Separator, YStack, Text } from "tamagui";
import { usePeopleStore } from "@/store/People";
import { PersonCard } from "@/components/crm/PersonCard";
import { AddPersonForm } from "@/components/crm/AddPersonForm";
import { EditPersonForm } from "@/components/crm/EditPersonForm";
import type { Person } from "@/types/people";

export default function CRM() {
  const { contacts, updatePerson } = usePeopleStore();
  const allContacts = Object.values(contacts);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const handleEdit = (person: Person) => {
    setSelectedPerson(person);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (updatedPerson: Person) => {
    updatePerson(updatedPerson.id, updatedPerson);
    setEditModalVisible(false);
  };

  return (
    <YStack flex={1} paddingTop={80} paddingHorizontal={16}>
      <H4 marginTop={16} textAlign="center" marginBottom={8}>
        All Contacts {allContacts.length > 0 && `(${allContacts.length})`}
      </H4>
      <Separator borderColor="$gray8" borderWidth={1} my="$2"marginBottom={16} />
      <FlatList
        data={allContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PersonCard person={item} onEdit={handleEdit} />}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <YStack padding="$4" alignItems="center">
            <Text color="$gray11">No contacts yet</Text>
          </YStack>
        }
      />
      <AddPersonForm />

      {selectedPerson && (
        <EditPersonForm
          person={selectedPerson}
          visible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveEdit}
        />
      )}
    </YStack>
  );
}
