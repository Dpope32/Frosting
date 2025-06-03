import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    checkboxContainer: {
      padding: 4,
    },
    checkbox: {
      borderWidth: 1,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      maxWidth: 400,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: -40
    },
  });