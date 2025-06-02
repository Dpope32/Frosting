import React, { useState, useCallback, useMemo } from 'react';
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

export const FloatingActionSection = React.memo<FloatingActionSectionProps>(({ onActionPress, isDark }) => {
  const primaryColor = useUserStore(s => s.preferences.primaryColor);
  const [open, setOpen] = useState(false);
  
  // Memoize static values
  const textColor = useMemo(() => isDark ? '#f9f9f9' : '#fff', [isDark]);
  const iconSize = useMemo(() => isIpad() ? 26 : 20, []);
  const fabIconSize = useMemo(() => isIpad() ? 32 : 28, []);
  
  // Memoize FAB style to prevent recalculation
  const fabStyle = useMemo(() => [
    styles.fab,
    {
      backgroundColor: primaryColor,
      bottom: isWeb ? 40 : isIpad() ? 50 : 30,
      right: isWeb ? 40 : isIpad() ? 50 : 30,
      shadowColor: isDark ? '#000' : '#222',
    },
  ], [primaryColor, isDark]);

  // Memoize modal positioning
  const modalYStackProps = useMemo(() => ({
    position: "absolute" as const,
    bottom: isWeb ? 100 : isIpad() ? 120 : 80,
    right: isWeb ? 40 : isIpad() ? 50 : 30,
    gap: "$3" as const,
    backgroundColor: isDark ? 'rgba(20,20,20,0.98)' : 'rgba(255,255,255,0.98)',
    borderRadius: 18,
    padding: "$3" as const,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100,
    minWidth: 170,
  }), [isDark]);

  // Memoize callbacks to prevent recreating functions
  const handleFabPress = useCallback(() => {
    setOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleActionPress = useCallback((actionName: string) => {
    onActionPress(actionName);
    setOpen(false);
  }, [onActionPress]);

  // Only render modal when open to reduce overhead
  const renderModal = useMemo(() => {
    if (!open) return null;
    
    return (
      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={handleModalClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleModalClose}
        >
          <YStack {...modalYStackProps}>
            {ACTIONS.map(action => (
              <TouchableOpacity
                key={action.name}
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={() => handleActionPress(action.name)}
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
    );
  }, [open, modalYStackProps, iconSize, primaryColor, isDark, handleModalClose, handleActionPress]);

  return (
    <>
      <View pointerEvents="box-none" style={styles.fabContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={fabStyle}
          onPress={handleFabPress}
        >
          <MaterialIcons name={open ? 'close' : 'add'} size={fabIconSize} color={textColor} />
        </TouchableOpacity>
      </View>
      {renderModal}
    </>
  );
});

FloatingActionSection.displayName = 'FloatingActionSection';

const styles = StyleSheet.create({
  fabContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
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
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
});
