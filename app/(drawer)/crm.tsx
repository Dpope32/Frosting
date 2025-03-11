// crm.tsx
import React, { useState } from "react";
import { FlatList, View, Dimensions, Alert, Platform } from "react-native";
import { H4, Separator, YStack, Text, Button, isWeb, XStack } from "tamagui";
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Contacts from 'expo-contacts';
import { usePeopleStore } from "@/store/People";
import { StorageUtils } from "@/store/AsyncStorage";
import { PersonCard } from "@/components/crm/PersonCard/PersonCard";
import { AddPersonForm } from "@/components/crm/Forms/AddPersonForm";
import { EditPersonForm } from "@/components/crm/Forms/EditPersonForm";
import type { Person } from "@/types/people";
import { generateTestContacts } from "@/components/crm/testContacts";
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from "@/store/UserStore";
import { requestNotificationPermissions } from "@/services/notificationServices";

const { width } = Dimensions.get("window");
const PADDING = Platform.OS === 'web' ? 18: 12;
const GAP = Platform.OS === 'web' ? 24 : 12; 
const NUM_COLUMNS = Platform.OS === 'web' ? 4 : 2;
const CARD_WIDTH = (width - (22 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS;
const CARD_WIDTH_MOBILE = (width - (2 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS;
const STORAGE_KEY = 'contacts-store';

export default function CRM() {
  const { contacts, updatePerson } = usePeopleStore();
  const allContacts = Object.values(contacts);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const importContacts = async (data: Contacts.Contact[]) => {
    // Track how many contacts were actually imported
    let importedCount = 0;
    let skippedCount = 0;
    
    // Check if any contacts have birthdays to determine if we need notifications
    const hasBirthdays = data.some(contact => contact.birthday);
    if (hasBirthdays) {
      // Request permissions
      await requestNotificationPermissions();
    }
    
    // Get the current contacts from the store
    const currentContacts = usePeopleStore.getState().contacts;
    const newContacts = { ...currentContacts };
    
    // Process all contacts first
    for (const contact of data) {
      if (contact.name) {
        let birthdayStr = undefined;
        
        if (contact.birthday) {
          try {
            birthdayStr = new Date(contact.birthday.toString()).toISOString().split('T')[0];
          } catch (error) {
            console.log("Error parsing birthday:", error, "for contact:", contact.name);
          }
        }
        
        const newPerson: Person = {
          name: contact.name,
          phoneNumber: contact.phoneNumbers?.[0]?.number,
          email: contact.emails?.[0]?.email,
          birthday: birthdayStr || '',
          profilePicture: contact.imageAvailable ? contact.image?.uri : undefined,
          occupation: contact.jobTitle,
          priority: true, // Mark all imported contacts with birthdays as priority
          address: contact.addresses?.[0] ? {
            street: contact.addresses[0].street || '',
            city: contact.addresses[0].city || '',
            state: contact.addresses[0].region || '',
            zipCode: contact.addresses[0].postalCode || '',
            country: contact.addresses[0].country || ''
          } : undefined,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Add to our new contacts object
        newContacts[newPerson.id] = newPerson;
        
        importedCount++;
        console.log(`Processed contact: ${contact.name}`);
      } else {
        skippedCount++;
        console.log("Skipped contact without name");
      }
    }
    
    // Now update the store with all contacts at once
    if (importedCount > 0) {
      // Save to AsyncStorage and update the store
      await StorageUtils.set(STORAGE_KEY, newContacts);
      usePeopleStore.setState({ contacts: newContacts });
      
      // Sync birthdays for all new contacts
      if (hasBirthdays) {
        const { syncBirthdays } = require('@/store/CalendarStore').useCalendarStore.getState();
        syncBirthdays(); // Sync all birthdays
      }
      
      console.log(`Import summary: ${importedCount} imported, ${skippedCount} skipped`);
      console.log("New contacts state:", Object.keys(newContacts).length, "contacts");
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", `${importedCount} contacts imported successfully!`);
    } else {
      Alert.alert("No Contacts", "No valid contacts were found to import.");
    }
  };

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
          marginBottom: GAP /2
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

  const handleDebugPress = () => {
    const peopleState = JSON.parse(JSON.stringify(usePeopleStore.getState()));
    if (peopleState.contacts) {
      Object.values(peopleState.contacts).forEach((contact: any) => {
        if (contact.profilePicture) {
          contact.profilePicture = '[PROFILE_PICTURE_DATA_REMOVED]';
        }
      });
    }
    console.log("People Store:", JSON.stringify(peopleState, null, 2));
    Alert.alert("Debug Info", "People store data logged to console (profilePicture data removed)");
  };

  return (
    <YStack flex={1} paddingTop={isWeb ? 12 : 80}>
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
      <H4  marginTop={isWeb ? 16 : 0} textAlign="center" marginBottom={8}>
        All Contacts {allContacts.length > 0 && `(${allContacts.length})`}
      </H4>
      <Separator borderColor="$gray8" borderWidth={1}  marginBottom={16} />
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
            borderRadius="$4" 
            ai="flex-start" 
            jc="center"
            borderWidth={1}
            borderColor={isDark ? "#333" : "#e0e0e0"}
            width={isWeb ? "80%" : "90%"}
            maxWidth={isWeb ? 800 : "100%"}
            mx="auto"
            my="$4"
          >
            <YStack gap="$4" width="100%">
              <Text color={isDark ? "#fff" : "#333"} fontSize="$5" fontWeight="bold" textAlign="center" fontFamily="$body">
                Contact Management
              </Text>
              
              <YStack gap="$3" px="$2">
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
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
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
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
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
                      Contact Details
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                      Store phone numbers, emails, addresses, and more for easy access.
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
              
              <XStack 
                justifyContent="center"
                paddingHorizontal={isWeb ? "$2" : "$1"}
                gap="$2"
                mt="$2"
              >
                {isWeb ? (
                  <YStack alignItems="center" gap="$2">
                    <Button
                      size="$4"
                      backgroundColor={isDark ? "$gray5" : "$gray3"}
                      borderColor={isDark ? "$gray7" : "$gray4"}
                      borderWidth={2}
                      paddingHorizontal="$4"
                      paddingVertical="$2"
                      borderRadius="$4"
                      opacity={0.7}
                      pressStyle={{ opacity: 0.7 }}
                      animation="quick"
                      disabled
                    >
                    </Button>
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
                    backgroundColor={primaryColor}
                    borderColor={primaryColor}
                    borderWidth={2}
                    paddingHorizontal="$4"
                    paddingVertical="$2"
                    borderRadius="$4"
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
