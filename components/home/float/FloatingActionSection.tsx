import React, { useState } from 'react';
import { Platform, View, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store';
import { isIpad } from '@/utils';
import { Text, YStack, XStack } from 'tamagui';

interface FloatingActionSectionProps {
  onActionPress: (name: string) => void;
  isDark: boolean;
}

const ACTIONS = [
  { name: 'bt_contact', label: 'Contact', icon: 'contact-page' },
  { name: 'bt_password', label: 'Password', icon: 'lock' },
  { name: 'bt_stock', label: 'Stock', icon: 'show-chart' },
  { name: 'bt_habit', label: 'Habit', icon: 'repeat' },
  { name: 'bt_note', label: 'Note', icon: 'sticky-note-2' },
  { name: 'bt_project', label: 'Project', icon: 'folder' },
  { name: 'bt_bill', label: 'Bill', icon: 'currency-exchange' },
  { name: 'bt_event', label: 'Event', icon: 'calendar-month' },
  { name: 'bt_todo', label: 'ToDo', icon: 'check-box' },
];

export function FloatingActionSection({ onActionPress, isDark }: FloatingActionSectionProps) {
  const primaryColor = useUserStore(s => s.preferences.primaryColor);
  const textColor = isDark ? '#f9f9f9' : '#222';
  const [open, setOpen] = useState(false);
  const iconSize = isIpad() ? 26 : 20;

  // FAB position
  const fabStyle = [
    styles.fab,
    {
      backgroundColor: primaryColor,
      bottom: isWeb ? 40 : isIpad() ? 50 : 30,
      right: isWeb ? 40 : isIpad() ? 50 : 30,
      shadowColor: isDark ? '#000' : '#222',
    },
  ];

  return (
    <>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={fabStyle}
          onPress={() => setOpen(true)}
        >
          <MaterialIcons name={open ? 'close' : 'add'} size={isIpad() ? 32 : 28} color={textColor} />
        </TouchableOpacity>
      </View>
      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <YStack
            position="absolute"
            bottom={isWeb ? 100 : isIpad() ? 120 : 80}
            right={isWeb ? 40 : isIpad() ? 50 : 30}
            gap="$3"
            backgroundColor={isDark ? 'rgba(20,20,20,0.98)' : 'rgba(255,255,255,0.98)'}
            borderRadius={18}
            padding="$3"
            shadowColor="#000"
            shadowOpacity={0.18}
            shadowRadius={12}
            shadowOffset={{ width: 0, height: 4 }}
            zIndex={100}
            minWidth={170}
          >
            {ACTIONS.map(action => (
              <TouchableOpacity
                key={action.name}
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={() => {
                  onActionPress(action.name);
                  setOpen(false);
                }}
              >
                <XStack alignItems="center" gap="$2">
                  <MaterialIcons name={action.icon as any} size={iconSize} color={primaryColor} />
                  <Text color={isDark ? '#f9f9f9' : '#222'} fontSize={16}>
                    {action.label}
                  </Text>
                </XStack>
              </TouchableOpacity>
            ))}
          </YStack>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    zIndex: 100,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
});
