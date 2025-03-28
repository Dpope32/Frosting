import { Alert } from 'react-native'

export const handleSharedContact = (url: string) => {
  try {
    // Handle both full clipboard content and direct links
    const shareUrl = url.includes('---') ? url.split('\n')[0] : url;
    
    const data = shareUrl.split('?data=')[1];
    if (!data) {
      // If no data parameter, check if it's a plain text contact
      if (url.includes('Contact:')) {
        Alert.alert("Contact Info", url.split('---')[1].trim());
      }
      return;
    }

    const decodedData = JSON.parse(atob(data));
    const name = decodedData.name || decodedData.nickname;
    Alert.alert(
      "Add Contact",
      `Would you like to add ${name} to your contacts list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: () => {
            const { usePeopleStore } = require('@/store/People');
            usePeopleStore.getState().addPerson(decodedData);
          }
        }
      ]
    );
  } catch (error) {
    // If error occurs, check if it's a plain text contact
    if (url.includes('Contact:')) {
      Alert.alert("Contact Info", url.split('---')[1].trim());
    } else {
      Alert.alert("Error", "Invalid contact link");
    }
  }
};
