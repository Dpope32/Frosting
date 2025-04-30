import React, { useState } from "react";
import { FlatList, View, Dimensions, Alert, Platform } from "react-native";
import { H4, Separator, YStack, Button, isWeb } from "tamagui";
import { PersonEmpty } from "@/components/crm/PersonEmpty";
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePeopleStore } from "@/store/People";
import { PersonCard } from "@/components/crm/PersonCard/PersonCard";
import { AddPersonForm } from "@/components/crm/Forms/AddPersonForm";
import { EditPersonForm } from "@/components/crm/Forms/EditPersonForm";
import type { Person } from "@/types/people";
import { generateTestContacts } from "@/components/crm/testContacts";
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from "@/store/UserStore";
import { handleDebugPress, handleImportContacts } from "@/services/peopleService";

const { width } = Dimensions.get("window");
const PADDING = Platform.OS === 'web' ? 16 : 12;
const GAP = Platform.OS === 'web' ? 24 : 12; 
const NUM_COLUMNS = Platform.OS === 'web' ? 4 : 2;
const CARD_WIDTH = (width - (24 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS;
const CARD_WIDTH_MOBILE = (width - (2 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS;

export default function CRM() {
  const { contacts, updatePerson } = usePeopleStore();
  const allContacts = Object.values(contacts);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    setEditModalVisible(false);
    setSelectedPerson(null);
    setExpandedId(null);
  };

  const renderItem = ({ item, index }: { item: Person; index: number }) => {
    const isFirstInRow = index % NUM_COLUMNS === 0;
    const isLastInRow = index % NUM_COLUMNS === NUM_COLUMNS;
    
    return (
      <View
        style={{
          width: isWeb ? CARD_WIDTH : CARD_WIDTH_MOBILE,
          marginLeft: isFirstInRow ? PADDING : GAP / 1,
          paddingLeft: isWeb ? 24 : 0,
          marginRight: isLastInRow ? PADDING : GAP / 2,
          marginBottom: GAP / 2
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
  };

  return (
    <YStack flex={1} paddingTop={isWeb ? 80 : 85}>
      {__DEV__ && (
        <View style={{ position: 'absolute', bottom: 32, left: 24, zIndex: 1000, flexDirection: 'row', gap: 12 }}>
          <Button
            size="$4"
            circular
            backgroundColor="#666666"
            pressStyle={{ scale: 0.95 }}
            animation="quick"
            elevation={4}
            onPress={handleDebugPress}
            icon={<MaterialIcons name="bug-report" size={24} color="white" />}
          />
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
              if (Platform.OS === 'web') {
                if (window.confirm('Are you sure you want to clear all contacts? This cannot be undone.')) {
                  usePeopleStore.getState().clearContacts();
                }
              } else {
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
              }
            }}
            icon={<MaterialIcons name="clear-all" size={24} color="white" />}
          />
        </View>
      )}
      {!isWeb && allContacts.length > 0 && (
        <>
          <H4 fontFamily="$heading" fontSize="$7" fontWeight="bold" mt={12} textAlign="center" marginBottom={8}>
            All Contacts ({allContacts.length})
          </H4>
          <Separator borderColor="$gray8" borderWidth={1} marginBottom={2} />
        </>
      )}
      <FlatList
        key={JSON.stringify(allContacts)}
        data={allContacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 8 : 0
        }}
        ListEmptyComponent={
          <PersonEmpty 
            isDark={isDark}
            primaryColor={primaryColor}
            isWeb={isWeb}
            onImportContacts={!isWeb ? handleImportContacts : undefined}
          />
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
