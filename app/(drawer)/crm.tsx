import React, { useState } from "react";
import { FlatList, View, Dimensions, Alert, Platform } from "react-native";
import { H4, Separator, YStack, Text, Button, isWeb, XStack } from "tamagui";
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
          <XStack 
            bg={isDark ? "#1A1A1A" : "#f5f5f5"}
            p="$4" 
            br="$4" 
            ai="flex-start" 
            jc="center"
            borderWidth={1}
            borderColor={isDark ? "#333" : "#e0e0e0"}
            width={isWeb ? "80%" : "90%"}
            maxWidth={isWeb ? 800 : "100%"}
            mx="auto"
            my="$4"
          >
            <YStack gap="$4" width="100%" paddingTop={16}>
              <YStack gap="$3" px="$2">
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                      Track Important Contacts
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                      Add your contacts and keep track of important information in one place.
                    </Text>
                  </YStack>
                </XStack>
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                      Birthday Reminders
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                      Never miss a birthday with automatic calendar integration.
                    </Text>
                  </YStack>
                </XStack>
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                      Contact Details
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                      Store phone numbers, emails, addresses, and more for easy access.
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
              <XStack justifyContent="center" px={isWeb ? "$2" : "$1"} gap="$2" mt="$2">
                {isWeb ? (
                  <YStack alignItems="center" gap="$2">
                    <Button
                      size="$4"
                      backgroundColor={isDark ? "$gray5" : "$gray3"}
                      borderColor={isDark ? "$gray7" : "$gray4"}
                      borderWidth={2}
                      px="$4"
                      py="$2"
                      br="$4"
                      opacity={0.7}
                      pressStyle={{ opacity: 0.7 }}
                      animation="quick"
                      disabled
                    />
                  </YStack>
                ) : (
                  <Button
                    size="$3"
                    onPress={async () => {
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
                          } else {
                            Alert.alert("No Contacts", "No contacts found on your device.");
                          }
                        } else {
                          Alert.alert("Permission Denied", "Please grant contacts permission to import contacts.");
                        }
                      } catch (error) {
                        console.error("Error importing contacts:", error);
                        Alert.alert("Error", "Failed to import contacts. Please try again.");
                      }
                    }}
                    bc={primaryColor}
                    borderColor={primaryColor}
                    borderWidth={2}
                    px="$4"
                    py="$2"
                    br="$4"
                    pressStyle={{ opacity: 0.8 }}
                    animation="quick"
                    icon={<FontAwesome5 name="address-book" size={16} color="white" style={{ marginRight: 8 }} />}
                  >
                    <Text color="white" fontWeight="600">
                      Import Contacts
                    </Text>
                  </Button>
                )}
              </XStack>
              <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
                Or click the + button below to add a contact manually
              </Text>
            </YStack>
          </XStack>
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
