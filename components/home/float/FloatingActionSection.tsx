import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Platform, View, TouchableOpacity, Modal, StyleSheet, Dimensions, Vibration } from 'react-native';
import { isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store';
import { isIpad } from '@/utils';
import { Text, YStack, XStack } from 'tamagui';
import { Animated } from 'react-native';

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
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation refs - using useRef to prevent recreation on re-renders
  const animationRefs = useRef({
    fabRotation: new Animated.Value(0),
    fabScale: new Animated.Value(1),
    backdropOpacity: new Animated.Value(0),
    actionAnimations: ACTIONS.map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    })),
    buttonPressAnimations: ACTIONS.map(() => new Animated.Value(1)),
  }).current;

  // Cleanup ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Timeout refs for cleanup
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Memoize static values - only recalculate when dependencies actually change
  const staticValues = useMemo(() => ({
    textColor: isDark ? '#f9f9f9' : '#fff',
    iconSize: isIpad() ? 20 : 16,
    fabIconSize: isIpad() ? 28 : 24,
    fabStyle: [
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
    ],
    modalYStackProps: {
      position: "absolute" as const,
      bottom: isWeb ? 120 : isIpad() ? 140 : 100,
      right: isWeb ? 40 : isIpad() ? 50 : 30,
      gap: "$1" as const,
      backgroundColor: 'transparent',
      borderRadius: 20,
      padding: "$2" as const,
      zIndex: 100,
      minWidth: 140,
    },
  }), [primaryColor, isDark]);

  // Cleanup function for timeouts
  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  }, []);

  // Haptic feedback function
  const triggerHaptic = useCallback(() => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([1]);
    } else if (Platform.OS === 'android') {
      Vibration.vibrate(50);
    }
  }, []);

  // Enhanced animations with race condition prevention
  const openModal = useCallback(() => {
    if (isAnimating || open) return;
    
    setIsAnimating(true);
    setOpen(true);

    const { fabRotation, fabScale, backdropOpacity, actionAnimations } = animationRefs;
    
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
    ]).start(() => {
      if (isMountedRef.current) {
        setIsAnimating(false);
      }
    });

    // Staggered action animations (bottom-up) with reduced complexity
    const staggerDelay = 30; // Reduced delay for faster opening
    actionAnimations.forEach((anim, index) => {
      const reverseIndex = actionAnimations.length - 1 - index;
      const delay = reverseIndex * staggerDelay;
      
      const timeout = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 400,
            friction: 8,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 400,
            friction: 10,
          }),
        ]).start();
      }, delay);
      
      timeoutRefs.current.push(timeout);
    });
  }, [isAnimating, open, animationRefs]);

  const closeModal = useCallback(() => {
    if (isAnimating || !open) return;
    
    setIsAnimating(true);
    clearTimeouts();

    const { fabRotation, fabScale, backdropOpacity, actionAnimations } = animationRefs;

    // Animate out with improved timing
    Animated.parallel([
      Animated.spring(fabRotation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 12,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Reset action animations simultaneously for faster closing
    const resetAnimations = actionAnimations.map(anim => 
      Animated.parallel([
        Animated.timing(anim.scale, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 20,
          duration: 80,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(resetAnimations).start(() => {
      if (isMountedRef.current) {
        setOpen(false);
        setIsAnimating(false);
      }
    });
  }, [isAnimating, open, clearTimeouts, animationRefs]);

  const handleActionPress = useCallback((actionName: string, index: number) => {
    if (isAnimating) return;
    
    triggerHaptic();
    
    // Quick scale animation for the pressed button
    const buttonAnim = animationRefs.buttonPressAnimations[index];
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 25,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        onActionPress(actionName);
        closeModal();
      }
    }, 100); // Reduced timeout for faster response
    
    timeoutRefs.current.push(timeout);
  }, [isAnimating, onActionPress, closeModal, triggerHaptic, animationRefs]);

  // FAB press animations with debouncing
  const handleFabPress = useCallback(() => {
    if (isAnimating) return;
    
    if (open) {
      closeModal();
    } else {
      openModal();
    }
  }, [isAnimating, open, closeModal, openModal]);

  const handleFabPressIn = useCallback(() => {
    if (isAnimating) return;
    
    Animated.spring(animationRefs.fabScale, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 400,
      friction: 8,
    }).start();
  }, [isAnimating, animationRefs]);

  const handleFabPressOut = useCallback(() => {
    if (isAnimating) return;
    
    Animated.spring(animationRefs.fabScale, {
      toValue: open ? 1.1 : 1,
      useNativeDriver: true,
      tension: 400,
      friction: 8,
    }).start();
  }, [isAnimating, open, animationRefs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearTimeouts();
      
      // Reset all animations
      const { fabRotation, fabScale, backdropOpacity, actionAnimations, buttonPressAnimations } = animationRefs;
      fabRotation.setValue(0);
      fabScale.setValue(1);
      backdropOpacity.setValue(0);
      actionAnimations.forEach(anim => {
        anim.scale.setValue(0);
        anim.opacity.setValue(0);
        anim.translateY.setValue(20);
      });
      buttonPressAnimations.forEach(anim => anim.setValue(1));
    };
  }, [clearTimeouts, animationRefs]);

  // Optimized modal rendering with fewer re-renders
  const renderModal = useMemo(() => {
    if (!open) return null;
    
    return (
      <Modal
        visible={open}
        animationType="none"
        transparent
        onRequestClose={closeModal}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <Animated.View style={[styles.overlay, { opacity: animationRefs.backdropOpacity }]}>
          {/* Backdrop TouchableOpacity - only covers empty areas */}
          <TouchableOpacity
            style={styles.backdropTouch}
            activeOpacity={1}
            onPress={closeModal}
          />
          
          {/* Action buttons container - separate from backdrop */}
          <YStack {...staticValues.modalYStackProps} pointerEvents="box-none">
            {ACTIONS.map((action, index) => {
              const animationStyle = {
                transform: [
                  { 
                    scale: Animated.multiply(
                      animationRefs.actionAnimations[index].scale, 
                      animationRefs.buttonPressAnimations[index]
                    ) 
                  },
                  { translateY: animationRefs.actionAnimations[index].translateY },
                ],
                opacity: animationRefs.actionAnimations[index].opacity,
              };

              return (
                <Animated.View
                  key={action.name}
                  style={[styles.actionContainer, animationStyle]}
                  pointerEvents="box-none"
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
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      handleActionPress(action.name, index);
                    }}
                    disabled={isAnimating}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // Increase touch target
                  >
                    <XStack alignItems="center" gap="$2" flex={1}>
                      <View style={[
                        styles.iconContainer,
                        { backgroundColor: action.gradient[0] }
                      ]}>
                        <MaterialIcons name={action.icon as any} size={staticValues.iconSize} color="#fff" />
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
              );
            })}
          </YStack>
        </Animated.View>
      </Modal>
    );
  }, [open, isDark, staticValues, isAnimating, closeModal, handleActionPress, animationRefs]);

  const fabRotationInterpolate = animationRefs.fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      <View pointerEvents="box-none" style={styles.fabContainer}>
        <Animated.View
          style={[
            staticValues.fabStyle,
            {
              transform: [
                { scale: animationRefs.fabScale },
                { rotate: fabRotationInterpolate },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.fabTouchable}
            onPress={handleFabPress}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            disabled={isAnimating}
          >
            <MaterialIcons name="add" size={staticValues.fabIconSize} color={staticValues.textColor} />
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
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  actionContainer: {
    marginBottom: 4,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 48,
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
