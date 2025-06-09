import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform, View, TouchableOpacity, Modal, StyleSheet, Dimensions, Vibration } from 'react-native';
import { isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store';
import { isIpad } from '@/utils';
import { Text, YStack, XStack } from 'tamagui';
import { Animated } from 'react-native';
import { useRef } from 'react';

interface FloatingActionSectionProps {
  onActionPress: (name: string) => void;
  isDark: boolean;
}

const ACTIONS = [
  { name: 'bt_contact', label: 'Contact', icon: 'contact-page', gradient: ['#667eea', '#764ba2'] },
  { name: 'bt_password', label: 'Password', icon: 'lock', gradient: ['#f093fb', '#f5576c'] },
  { name: 'bt_stock', label: 'Stock', icon: 'show-chart', gradient: ['#4facfe', '#00f2fe'] },
  { name: 'bt_habit', label: 'Habit', icon: 'repeat', gradient: ['#43e97b', '#38f9d7'] },
  { name: 'bt_note', label: 'Note', icon: 'sticky-note-2', gradient: ['#fa709a', '#fee140'] },
  { name: 'bt_project', label: 'Project', icon: 'folder', gradient: ['#a8edea', '#fed6e3'] },
  { name: 'bt_bill', label: 'Bill', icon: 'currency-exchange', gradient: ['#ffecd2', '#fcb69f'] },
  { name: 'bt_event', label: 'Event', icon: 'calendar-month', gradient: ['#667eea', '#764ba2'] },
  { name: 'bt_todo', label: 'ToDo', icon: 'check-box', gradient: ['#a18cd1', '#fbc2eb'] },
];

const { width: screenWidth } = Dimensions.get('window');

export const FloatingActionSection = React.memo<FloatingActionSectionProps>(({ onActionPress, isDark }) => {
  const primaryColor = useUserStore(s => s.preferences.primaryColor);
  const [open, setOpen] = useState(false);
  
  // Animation refs
  const fabRotation = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const actionAnimations = useRef(ACTIONS.map(() => ({
    scale: new Animated.Value(0),
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }))).current;
  
  // Individual press animations for each button
  const buttonPressAnimations = useRef(ACTIONS.map(() => new Animated.Value(1))).current;

  // Memoize static values
  const textColor = useMemo(() => isDark ? '#f9f9f9' : '#fff', [isDark]);
  const iconSize = useMemo(() => isIpad() ? 20 : 16, []);
  const fabIconSize = useMemo(() => isIpad() ? 28 : 24, []);
  
  // Memoize FAB style with gradient-like effect
  const fabStyle = useMemo(() => [
    styles.fab,
    {
      backgroundColor: primaryColor,
      bottom: isWeb ? 40 : isIpad() ? 50 : 30,
      right: isWeb ? 40 : isIpad() ? 50 : 30,
      shadowColor: primaryColor,
      shadowOpacity: 0.4,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 12,
    },
  ], [primaryColor]);

  // Enhanced modal positioning with better backdrop
  const modalYStackProps = useMemo(() => ({
    position: "absolute" as const,
    bottom: isWeb ? 120 : isIpad() ? 140 : 100,
    right: isWeb ? 40 : isIpad() ? 50 : 30,
    gap: "$1" as const,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: "$2" as const,
    zIndex: 100,
    minWidth: 140,
  }), []);

  // Haptic feedback function
  const triggerHaptic = useCallback(() => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([1]);
    } else if (Platform.OS === 'android') {
      Vibration.vibrate(50);
    }
  }, []);

  // Enhanced animations
  const openModal = useCallback(() => {
    setOpen(true);

    
    // Animate FAB
    Animated.parallel([
      Animated.spring(fabRotation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.spring(fabScale, {
        toValue: 1.1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

         // Staggered action animations (bottom-up)
     const staggerDelay = 40;
     actionAnimations.forEach((anim, index) => {
       // Reverse the delay so bottom items animate first
       const reverseIndex = actionAnimations.length - 1 - index;
       Animated.parallel([
         Animated.spring(anim.scale, {
           toValue: 1,
           useNativeDriver: true,
           delay: reverseIndex * staggerDelay,
           tension: 300,
           friction: 6,
         }),
         Animated.timing(anim.opacity, {
           toValue: 1,
           duration: 200,
           delay: reverseIndex * staggerDelay,
           useNativeDriver: true,
         }),
         Animated.spring(anim.translateY, {
           toValue: 0,
           useNativeDriver: true,
           delay: reverseIndex * staggerDelay,
           tension: 300,
           friction: 8,
         }),
       ]).start();
     });
  }, [fabRotation, fabScale, backdropOpacity, actionAnimations]);

  const closeModal = useCallback(() => {
    // Animate out
    Animated.parallel([
      Animated.spring(fabRotation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Reset action animations
    actionAnimations.forEach(anim => {
      Animated.parallel([
        Animated.timing(anim.scale, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 20,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });

    setTimeout(() => setOpen(false), 150);
  }, [fabRotation, fabScale, backdropOpacity, actionAnimations]);

  const handleActionPress = useCallback((actionName: string, index: number) => {
    
    // Quick scale animation for the pressed button
    Animated.sequence([
      Animated.timing(buttonPressAnimations[index], {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonPressAnimations[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 6,
      }),
    ]).start();

    setTimeout(() => {
      onActionPress(actionName);
      closeModal();
    }, 150);
  }, [onActionPress, closeModal, buttonPressAnimations]);

  // FAB press animation
  const handleFabPressIn = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 6,
    }).start();
  }, [fabScale]);

  const handleFabPressOut = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: open ? 1.1 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 6,
    }).start();
  }, [fabScale, open]);

  // Reset animations when component unmounts
  useEffect(() => {
    return () => {
      actionAnimations.forEach(anim => {
        anim.scale.setValue(0);
        anim.opacity.setValue(0);
        anim.translateY.setValue(20);
      });
      buttonPressAnimations.forEach(anim => anim.setValue(1));
    };
  }, []);

  // Enhanced modal rendering with individual button animations
  const renderModal = useMemo(() => {
    if (!open) return null;
    
    return (
      <Modal
        visible={open}
        animationType="none"
        transparent
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={styles.overlayTouch}
            activeOpacity={1}
            onPress={closeModal}
          >
            <YStack {...modalYStackProps}>
              {ACTIONS.map((action, index) => (
                <Animated.View
                  key={action.name}
                  style={[
                    styles.actionContainer,
                    {
                      transform: [
                        { scale: Animated.multiply(actionAnimations[index].scale, buttonPressAnimations[index]) },
                        { translateY: actionAnimations[index].translateY },
                      ],
                      opacity: actionAnimations[index].opacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
                        shadowColor: action.gradient[0],
                      }
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleActionPress(action.name, index)}
                  >
                                         <XStack alignItems="center" gap="$2" flex={1}>
                       <View style={[
                         styles.iconContainer,
                         { backgroundColor: action.gradient[0] }
                       ]}>
                         <MaterialIcons name={action.icon as any} size={iconSize} color="#fff" />
                       </View>
                       <Text 
                         color={isDark ? '#f9f9f9' : '#222'} 
                         fontSize={14} 
                         fontFamily="$body"
                         fontWeight="600"
                         flex={1}
                       >
                         {action.label}
                       </Text>
                     </XStack>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </YStack>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    );
  }, [open, modalYStackProps, actionAnimations, buttonPressAnimations, iconSize, isDark, closeModal, handleActionPress, backdropOpacity]);

  const fabRotationInterpolate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      <View pointerEvents="box-none" style={styles.fabContainer}>
        <Animated.View
          style={[
            fabStyle,
            {
              transform: [
                { scale: fabScale },
                { rotate: fabRotationInterpolate },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.fabTouchable}
            onPress={open ? closeModal : openModal}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
          >
            <MaterialIcons name="add" size={fabIconSize} color={textColor} />
          </TouchableOpacity>
        </Animated.View>
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
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayTouch: {
    flex: 1,
  },
  actionContainer: {
    marginBottom: 4,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
