import React from 'react';
import { Platform, View } from 'react-native';
import { isWeb } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { FloatingAction } from "react-native-floating-action";
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { isIpad } from '@/utils/deviceUtils';

interface FloatingActionSectionProps {
  onActionPress: (name: string) => void;
  isDark: boolean;
}

function darkenColor(hex: string, amount = 0.50) {
  let col = hex.replace('#', '');
  if (col.length === 3) col = col.split('').map(x => x + x).join('');
  const num = parseInt(col, 16);
  let r = (num >> 16) - Math.round(255 * amount);
  let g = ((num >> 8) & 0x00FF) - Math.round(255 * amount);
  let b = (num & 0x0000FF) - Math.round(255 * amount);
  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export function FloatingActionSection({ onActionPress, isDark }: FloatingActionSectionProps) {
  const primaryColor = useUserStore(s => s.preferences.primaryColor);
  const textColor = isDark ? "#ffffff" : "#ffffff";
  const darkerPrimary = darkenColor(primaryColor, 0.7);
  const [isOpen, setIsOpen] = React.useState(false);

  const actions = [
    {
      text: "Password",
      icon: <MaterialIcons name="lock" size={isIpad() ? 26 : 20} color={textColor} />,
      name: "bt_password",
      position: 1,
      textBackground: "rgba(0, 0, 0, 0.0)",
      color: primaryColor,
      textStyle: { 
        color: textColor,
        fontSize: isIpad() ? 20 : 18,
        fontFamily: "$heading",
        fontWeight: "600",
        textShadow: "0px 1px 2px rgba(0,0,0,0.3)"
      }
    },
    {
      text: "Habit",
      icon: <MaterialIcons name="repeat" size={isIpad() ? 26 : 20} color={textColor} />,
      name: "bt_habit",
      position: 2,
      textBackground: "rgba(0, 0, 0, 0.0)",
      color: primaryColor,
      textStyle: { 
        color: textColor,
        fontSize: isIpad() ? 20 : 18,
        fontFamily: "$heading",
        fontWeight: "600",
        textShadow: "0px 1px 2px rgba(0,0,0,0.3)"
      }
    },
    {
      text: "Note",
      icon: <MaterialIcons name="sticky-note-2" size={isIpad() ? 26 : 20} color={textColor} />,
      name: "bt_note",
      position: 3,
      textBackground: "rgba(0, 0, 0, 0.0)",
      color: primaryColor,
      textStyle: { 
        color: textColor,
        fontSize: isIpad() ? 20 : 18,
        fontFamily: "$heading",
        fontWeight: "600",
        textShadow: "0px 1px 2px rgba(0,0,0,0.3)"
      }
    },
    {
      text: "Bill",
      icon: <MaterialIcons name="currency-exchange" size={isIpad() ? 26 : 20} color={textColor} />,
      name: "bt_bill",
      position: 4,
      textBackground: "rgba(0, 0, 0, 0.0)",
      color: primaryColor,
      textStyle: { 
        color: textColor,
        fontSize: isIpad() ? 20 : 18,
        fontFamily: "$heading",
        fontWeight: "600",
        textShadow: "0px 1px 2px rgba(0,0,0,0.3)"
      }
    },
    {
      text: "Event",
      icon: <MaterialIcons name="calendar-month" size={isIpad() ? 26 : 20} color={textColor} />,
      name: "bt_event",
      position: 5,
      textBackground: "rgba(0, 0, 0, 0.0)",
      color: primaryColor,
      textStyle: { 
        color: textColor,
        fontSize: isIpad() ? 20 : 18,
        fontFamily: "$heading",
        fontWeight: "600",
        textShadow: "0px 1px 2px rgba(0,0,0,0.3)"
      }
    },
    {
      text: "ToDo",
      icon: <MaterialIcons name="check-box" size={isIpad() ? 26 : 20} color={textColor} />,
      name: "bt_todo",
      position: 6,
      textBackground: "rgba(0, 0, 0, 0.0)",
      color: primaryColor,
      textStyle: { 
        color: textColor,
        fontSize: isIpad() ? 20 : 18,
        fontFamily: "$heading",
        fontWeight: "600",
        textShadow: "0px 1px 2px rgba(0,0,0,0.3)"
      }
    },
  ];

  const handleActionPress = (name?: string) => {
    if (!name) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onActionPress(name);
  };

  return (
    <>
      <FloatingAction
        actions={actions}
        onPressItem={handleActionPress}
        color={isOpen ? darkerPrimary : primaryColor}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        position="right"
        distanceToEdge={{ vertical: 70, horizontal: 50 }}
        buttonSize={isIpad() ? 64 : 56}
        iconWidth={isWeb ? 20 : isIpad() ? 17 : 17}
        iconHeight={isWeb ? 20 : isIpad() ? 17 : 17}
        overlayColor={isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'}
        actionsPaddingTopBottom={isWeb ? 12 : isIpad() ? 12 : 8}
        shadow={{
          shadowOpacity: 0.4,
          shadowOffset: { width: 0, height: 6 },
          shadowColor: "#000000",
          shadowRadius: 4
        }}
      />
    </>
  );
} 