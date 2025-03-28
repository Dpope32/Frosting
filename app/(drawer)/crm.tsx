import React, { useState } from "react";
import { FlatList, View, Dimensions, Alert, Platform } from "react-native";
import { H4, Separator, YStack, Text, Button, isWeb, XStack } from "tamagui";
import { PersonEmpty } from "@/components/crm/PersonEmpty";
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Contacts from 'expo-contacts';
import { usePeopleStore } from "@/store/People";
import { PersonCard } from "@/components/crm/PersonCard/PersonCard";
import { AddPersonForm } from "@/components/crm/Forms/AddPersonForm";
import { EditPersonForm } from "@/components/crm/Forms/EditPersonForm";
import type { Person } from "@/types/people";
import { generateTestContacts } from "@/components/crm/testContacts";
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from "@/store/UserStore";
import { importContacts, handleDebugPress } from "@/services/peopleService";

const { width } = Dimensions.get("window");
const PADDING = Platform.OS === 'web' ? 18 : 12;
const GAP = Platform.OS === 'web' ? 24 : 12; 
const NUM_COLUMNS = Platform.OS === 'web' ? 4 : 2;
const CARD_WIDTH = (width - (22 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS;
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
    setTimeout(() => {
      setSelectedPerson(null);
      setExpandedId(null);
    }, 300);
  };

  const handleImportContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
            Contacts.Fields.Birthday,
            Contacts.Fields.Image,
            Contacts.Fields.Addresses,
            Contacts.Fields.JobTitle
          ]
        });
        
        if (data.length > 0) {
          if (Platform.OS === 'web') {
            if (confirm(`Found ${data.length} contacts. Would you like to import them?`)) {
              importContacts(data);
            }
          } else {
            Alert.alert(
              "Import Contacts",
              `Found ${data.length} contacts. Would you like to import them?`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Import", 
                  onPress: () => importContacts(data)
                }
              ]
            );
          }
        } else {
          if (Platform.OS === 'web') {
            alert("No contacts found on your device.");
          } else {
            Alert.alert("No Contacts", "No contacts found on your device.");
          }
        }
      } else {
        if (Platform.OS === 'web') {
          alert("Please grant contacts permission to import contacts.");
        } else {
          Alert.alert("Permission Denied", "Please grant contacts permission to import contacts.");
        }
      }
    } catch (error) {
      console.error("Error importing contacts:", error);
      if (Platform.OS === 'web') {
        alert("Failed to import contacts. Please try again.");
      } else {
        Alert.alert("Error", "Failed to import contacts. Please try again.");
      }
    }
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
    <YStack flex={1} paddingTop={isWeb ? 60 : 85}>
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
      {!isWeb && (
        <>
          <H4 fontFamily="$heading" fontSize="$7" fontWeight="bold" mt={0} textAlign="center" marginBottom={8}>
            All Contacts {allContacts.length > 0 && `(${allContacts.length})`}
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
          paddingBottom: 100,
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
