import React from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FloatingAction } from "react-native-floating-action";
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';

interface FloatingActionSectionProps {
  onActionPress: (name: string) => void;
}

export function FloatingActionSection({ onActionPress }: FloatingActionSectionProps) {
  const primaryColor = useUserStore(s => s.preferences.primaryColor);

  const actions = [
    {
      text: "ToDo",
      icon: <MaterialIcons name="check-box" size={24} color="white" />,
      name: "bt_todo",
      position: 1
    },
    {
      text: "Bill",
      icon: <MaterialIcons name="receipt" size={24} color="white" />,
      name: "bt_bill",
      position: 2
    },
    {
      text: "Note",
      icon: <MaterialIcons name="note" size={24} color="white" />,
      name: "bt_note",
      position: 3
    },
    {
      text: "Password",
      icon: <MaterialIcons name="lock" size={24} color="white" />,
      name: "bt_password",
      position: 4
    },
    {
      text: "Habit",
      icon: <MaterialIcons name="repeat" size={24} color="white" />,
      name: "bt_habit",
      position: 5
    }
  ];

  const handleActionPress = (name?: string) => {
    if (!name) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onActionPress(name);
  };

  return (
    <FloatingAction
      actions={actions}
      onPressItem={handleActionPress}
      color={primaryColor}
      position="right"
      distanceToEdge={30}
      overlayColor="rgba(68, 68, 68, 0.6)"
      buttonSize={56}
      iconWidth={15}
      iconHeight={15}
      actionsPaddingTopBottom={8}
      shadow={{
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 5 },
        shadowColor: "#000000",
        shadowRadius: 3
      }}
    />
  );
} 