
import { Alert} from "react-native";
import * as Haptics from 'expo-haptics';
import * as Contacts from 'expo-contacts';
import { usePeopleStore } from "@/store/People";
import { StorageUtils } from "@/store/AsyncStorage";
import type { Person } from "@/types/people";
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
          priority: true, 
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
    console.log("People Store:", JSON.stringify(peopleState, null, 2));
    Alert.alert("Debug Info", "People store data logged to console (profilePicture data removed)");
  };

  