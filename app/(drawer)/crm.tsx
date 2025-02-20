// crm.tsx
import React, { useState } from "react";
import { FlatList, View, Dimensions, Alert } from "react-native";
import { H4, Separator, YStack, Text, Button } from "tamagui";
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePeopleStore } from "@/store/People";
import { PersonCard } from "@/components/crm/PersonCard/PersonCard";
import { AddPersonForm } from "@/components/crm/Forms/AddPersonForm";
import { EditPersonForm } from "@/components/crm/Forms/EditPersonForm";
import type { Person } from "@/types/people";
import { generateTestContacts } from "@/components/crm/testContacts";

const { width } = Dimensions.get("window");
const PADDING = 16;
const GAP = 16;
const CARD_WIDTH = (width - PADDING * 2 - GAP) / 2;

export default function CRM() {
  const { contacts, updatePerson } = usePeopleStore();
  const allContacts = Object.values(contacts);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const handleEdit = (person: Person) => {
    setSelectedPerson(person);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (updatedPerson: Person) => {
    updatePerson(updatedPerson.id, updatedPerson);
    handleCloseEdit();
  };

  const handleCloseEdit = () => {
    // First close the edit modal
    setEditModalVisible(false);
    // Wait for animation to complete before resetting other states
    setTimeout(() => {
      setSelectedPerson(null);
      setExpandedId(null);
    }, 300);
  };

  const renderItem = ({ item, index }: { item: Person; index: number }) => (
    <View
      style={{
        width: CARD_WIDTH,
        marginLeft: index % 2 === 0 ? PADDING : GAP / 2,
        marginRight: index % 2 === 0 ? GAP / 2 : PADDING,
        marginBottom: GAP
      }}
    >
      <PersonCard
        person={item}
        onEdit={handleEdit}
        isExpanded={expandedId === item.id}
        onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
      />
    </View>
  );

  return (
    <YStack flex={1} paddingTop={80}>
      <View style={{ position: 'absolute', bottom: 32, left: 24, zIndex: 1000, flexDirection: 'row', gap: 12 }}>
        <Button
          size="$4"
          circular
          backgroundColor="#ff6b6b"
          pressStyle={{ scale: 0.95 }}
          animation="quick"
          elevation={4}
          onPress={generateTestContacts}
          icon={<FontAwesome5 name="database" size={20} color="white" />}
        />
        <Button
          size="$4"
          circular
          backgroundColor="#e74c3c"
          pressStyle={{ scale: 0.95 }}
          animation="quick"
          elevation={4}
          onPress={() => {
            Alert.alert(
              'Clear All Contacts',
              'Are you sure you want to clear all contacts? This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: () => {
                    usePeopleStore.getState().clearContacts();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }
              ]
            );
          }}
          icon={<MaterialIcons name="clear-all" size={24} color="white" />}
        />
      </View>
      <H4 marginTop={16} textAlign="center" marginBottom={8}>
        All Contacts {allContacts.length > 0 && `(${allContacts.length})`}
      </H4>
      <Separator borderColor="$gray8" borderWidth={1} my="$2" marginBottom={16} />
      <FlatList
        key={JSON.stringify(allContacts)} // Force re-render when contacts change
        data={allContacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingBottom: 100
        }}
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
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </YStack>
  );
}
