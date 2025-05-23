
import { Alert, Platform, Linking } from "react-native";
import * as Haptics from 'expo-haptics';
import * as Contacts from 'expo-contacts';
import { usePeopleStore } from "@/store";
import { StorageUtils } from "@/store/AsyncStorage";
import type { Person } from "@/types";
import { requestNotificationPermissions } from "@/services/notificationServices";

const STORAGE_KEY = 'contacts-store';

export const importContacts = async (data: Contacts.Contact[]) => {
    let importedCount = 0;
    let skippedCount = 0;
    
    const hasBirthdays = data.some(contact => contact.birthday);
    if (hasBirthdays) {
      await requestNotificationPermissions();
    }
    
    const currentContacts = usePeopleStore.getState().contacts;
    const newContacts = { ...currentContacts };
    
    for (const contact of data) {
      if (contact.name) {
        let birthdayStr = undefined;
        
        if (contact.birthday) {
          try {
            birthdayStr = new Date(contact.birthday.toString()).toISOString().split('T')[0];
          } catch (error) {
          }
        }
        
        const newPerson: Person = {
          name: contact.name,
          phoneNumber: contact.phoneNumbers?.[0]?.number,
          email: contact.emails?.[0]?.email,
          birthday: birthdayStr || '',
          profilePicture: contact.imageAvailable ? contact.image?.uri : undefined,
          occupation: contact.jobTitle,
          priority: true, 
          address: contact.addresses?.[0] ? {
            street: contact.addresses[0].street || '',
            city: contact.addresses[0].city || '',
            state: contact.addresses[0].region || '',
            zipCode: contact.addresses[0].postalCode || '',
            country: contact.addresses[0].country || ''
          } : undefined,
          id: Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        newContacts[newPerson.id] = newPerson;
        
        importedCount++;
      } else {
        skippedCount++;
      }
    }
    
    if (importedCount > 0) {
      await StorageUtils.set(STORAGE_KEY, newContacts);
      usePeopleStore.setState({ contacts: newContacts });
      
      if (hasBirthdays) {
        const { syncBirthdays } = require('@/store/CalendarStore').useCalendarStore.getState();
        syncBirthdays(); 
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", `${importedCount} contacts imported successfully!`);
    } else {
      Alert.alert("No Contacts", "No valid contacts were found to import.");
    }
  };

export const handleDebugPress = () => {
    const peopleState = JSON.parse(JSON.stringify(usePeopleStore.getState()));
    if (peopleState.contacts) {
      Object.values(peopleState.contacts).forEach((contact: any) => {
        if (contact.profilePicture) {
          contact.profilePicture = '[PROFILE_PICTURE_DATA_REMOVED]';
        }
      });
    }
    Alert.alert("Debug Info", "People store data logged to console (profilePicture data removed)");
  };

 export const handleImportContacts = async () => {
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
           // Guide user to settings if permission denied
           Alert.alert(
             "Permission Required",
             "Contact permission is needed to import contacts. Please enable it in your device settings.",
             [
               { text: "Cancel", style: "cancel" },
               { 
                 text: "Open Settings", 
                 onPress: () => Linking.openSettings() // Open app settings
               }
             ]
           );
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
  