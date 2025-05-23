import React, { useRef, useMemo, useCallback } from 'react';
import { Platform, Dimensions } from 'react-native';
import { isWeb } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { FloatingAction } from "react-native-floating-action";
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store';
import { isIpad } from '@/utils';
import { ActionButton } from './ActionButton';
import { ActionButtonTitle } from './ActionButtonTitle';

const { width } = Dimensions.get('window');
const dteWidth = width * 0.31;

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
  const textColor = isDark ? "#f9f9f9" : "#f9f9f9";
  const darkerPrimary = darkenColor(primaryColor, 0.7);
  const [isOpen, setIsOpen] = React.useState(false);
  const actionRef = useRef<any>(null); 
  const iconSize = isIpad() ? 26 : 17;

  const closeFab = useCallback(() => {
    const fabRef = actionRef.current;
    if (fabRef) {
      if (isWeb) {
        setIsOpen(false);
      } else {
        setTimeout(() => {
          fabRef.animateButton();
        }, 1000);
      }
    }
  }, [actionRef, setIsOpen]);

  const handleActionPress = useCallback((name: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onActionPress(name);
    closeFab();
  }, [onActionPress, closeFab]);

  const actions = useMemo(() => [
    {
      text: "Whats New?",
      icon: <MaterialIcons name="info" size={isIpad() ? 26 : 20} color={textColor} />,
      name: "bt_title",
      position: 1,
      render: () => (
        <ActionButtonTitle
          key="title-action"
          onPress={() => {}}
          isDark={isDark}
          icon=""
          primaryColor={primaryColor}
          text="Whats New?"
        />
      )
    },
    {
      text: "Contact",
      icon: <MaterialIcons name="contact-page" size={iconSize} color={"$orange10"} />,
      name: "bt_contact",
      position: 2,
      render: () => (
        <ActionButton
          key="contact-action"
          onPress={() => handleActionPress("bt_contact")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="contact-page"
          text="Contact"
        />
      )
    },
    {
      text: "Stock",
      icon: <MaterialIcons name="show-chart" size={iconSize} color={"$green6"} />,
      name: "bt_stock",
      position: 3,
      render: () => (
        <ActionButton
          key="stock-action"
          onPress={() => handleActionPress("bt_stock")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="show-chart"
          text="Stock"
        />
      )
    },
    {
      text: "Password",
      icon: <MaterialIcons name="lock" size={iconSize} color={textColor} />,
      name: "bt_password",
      position: 4,
      render: () => (
        <ActionButton
          key="password-action"
          onPress={() => handleActionPress("bt_password")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="lock"
          text="Password"
        />
      )
    },
    {
      text: "Habit",
      icon: <MaterialIcons name="repeat" size={iconSize} color={textColor} />,
      name: "bt_habit",
      position: 5,
      render: () => (
        <ActionButton
          key="habit-action"
          onPress={() => handleActionPress("bt_habit")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="repeat"
          text="Habit"
        />
      )
    },
    {
      text: "Note",
      icon: <MaterialIcons name="sticky-note-2" size={iconSize} color={textColor} />,
      name: "bt_note",
      position: 6,
      render: () => (
        <ActionButton
          key="note-action"
          onPress={() => handleActionPress("bt_note")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="sticky-note-2"
          text="Note"
        />
      )
    },
    {
      text: "Project",
      icon: <MaterialIcons name="folder" size={iconSize} color={isDark ? "#f3f3f3" : "#000"} />,
      name: "bt_project",
      position: 7,
      render: () => (
        <ActionButton
          key="project-action"
          onPress={() => handleActionPress("bt_project")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="folder"
          text="Project"
        />
      )
    },
    {
      text: "Bill",
      icon: <MaterialIcons name="currency-exchange" size={iconSize} color={textColor} />,
      name: "bt_bill",
      position: 8,
      render: () => (
        <ActionButton
          key="bill-action"
          onPress={() => handleActionPress("bt_bill")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="currency-exchange"
          text="Bill"
        />
      )
    },
    {
      text: "Event",
      icon: <MaterialIcons name="calendar-month" size={iconSize} color={textColor} />,
      name: "bt_event",
      position: 9,
      render: () => (
        <ActionButton
          key="event-action"
          onPress={() => handleActionPress("bt_event")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="calendar-month"
          text="Event"
        />
      )
    },
    {
      text: "ToDo",
      icon: <MaterialIcons name="check-box" size={iconSize} color={textColor} />,
      name: "bt_todo",
      position: 10,
      render: () => (
        <ActionButton
          key="todo-action"
          onPress={() => handleActionPress("bt_todo")}
          isDark={isDark}
          primaryColor={primaryColor}
          icon="check-box"
          text="ToDo"
        />
      )
    },
  ], [handleActionPress, iconSize, textColor, isDark, primaryColor]);

  return (
    <>
      <FloatingAction
        ref={actionRef} 
        actions={actions}
        onPressItem={(name?: string) => name && handleActionPress(name)}
        color={isOpen ? darkerPrimary : primaryColor}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        position={isWeb ? "right" : isIpad() ? "right" : "center"}
        distanceToEdge={{vertical: isWeb ? 65 : isIpad() ? 65 : 55, horizontal: isWeb ? 30 : isIpad() ? dteWidth : 30}}
        buttonSize={isIpad() ? 64 : 56}
        iconWidth={isWeb ? 20 : iconSize}
        iconHeight={isWeb ? 20 : isIpad() ? 17 : 15}
        overlayColor={isDark ? 'rgba(0, 0, 0, 0.92)' : 'rgba(0, 0, 0, 0.8)'}
        actionsPaddingTopBottom={isWeb ? 8 : isIpad() ? 12 : 4}
        shadow={{
          shadowOpacity: 0.4,
          shadowOffset: { width: 0, height: 4 },
          shadowColor: "#000000",
          shadowRadius: 4
        }}
        openOnMount={false}
        floatingIcon={<MaterialIcons name={isOpen ? "close" : "add"} size={isIpad() ? 32 : 24} color={textColor} />}
        showBackground={true}
        animated={true}
      />
    </>
  );
}
