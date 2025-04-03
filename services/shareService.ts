import { Alert } from 'react-native';
import { usePeopleStore } from '@/store/People';

export const handleSharedContact = (contactData: {
  name: string;
  nickname?: string;
  phoneNumber?: string;
  email?: string;
  occupation?: string;
}) => {
  try {
    const name = contactData.name || contactData.nickname || 'this contact';
    Alert.alert(
      "Add Contact",
      `Would you like to add ${name} to your contacts list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: () => {
            usePeopleStore.getState().addPerson({
              ...contactData,
              id: Math.random().toString(36).substr(2, 9),
              birthday: '', // Required field with empty default
              profilePicture: '', // Required field with empty default
              registered: false, // Required field with default
              priority: false, // Required field with default
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              address: undefined,
              notes: '',
              tags: [],
              lastContactDate: '',
              importantDates: [],
              socialMedia: [],
              favoriteColor: '',
              relationship: '',
              additionalInfo: ''
            });
          }
        }
      ]
    );
  } catch (error) {
    Alert.alert("Error", "Failed to process contact data");
  }
};
