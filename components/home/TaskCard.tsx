import React from 'react';
import { Stack, Text } from 'tamagui';
import { View, StyleSheet, Pressable, Platform, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { TaskPriority, TaskCategory, RecurrencePattern, Tag } from '@/types';
import { isWeb } from 'tamagui';
import { getCategoryColor, getPriorityColor, getRecurrenceColor, withOpacity, isIpad } from '@/utils';
import { useColorScheme } from '@/hooks';
import { LongPressDelete } from '@/components/common/LongPressDelete';
import { variants } from '@/constants';
import { TaskChips } from './TaskChips';
import { useCustomCategoryStore, useUserStore, useToastStore } from '@/store'

interface TaskCardProps {
  title: string;
  time?: string;
  category?: string;
  status: string;
  priority?: TaskPriority;
  checked?: boolean;
  oneTime?: boolean;
  tags?: Tag[];
  onCheck?: (checked: boolean) => void;
  onDelete?: () => void;
}

export const TaskCard = React.memo<TaskCardProps>(({ 
  title, 
  time, 
  category, 
  status,
  priority,
  checked = false,
  tags = [],
  onCheck,
  onDelete
}) => {
  // Subscribe to primaryColor for reactivity
  const userColor = useUserStore(s => s.preferences.primaryColor);
  const customCategories = useCustomCategoryStore((s) => s.categories);
  let calculatedCategoryColor = category ? getCategoryColor(category as TaskCategory) : '#2196F3';
  if (category) {
    const customCat = customCategories.find(catObj => catObj.name === category);
    if (customCat) {
      calculatedCategoryColor = userColor;
    }
  }
  const showToast = useToastStore(s => s.showToast);
  const isDark = useColorScheme() === 'dark';

  // Debouncing and animation refs
  const isProcessingRef = React.useRef(false);
  const animatedScale = React.useRef(new Animated.Value(1)).current;
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const mapStatusToRecurrencePattern = React.useCallback((status: string): RecurrencePattern | undefined => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'one-time') return 'one-time';
    if (lowerStatus === 'tomorrow') return 'tomorrow';
    if (lowerStatus === 'everyday') return 'everyday';
    if (lowerStatus === 'weekly') return 'weekly';
    if (lowerStatus === 'biweekly') return 'biweekly';
    if (lowerStatus === 'monthly') return 'monthly';
    if (lowerStatus === 'yearly') return 'yearly';
    return undefined;
  }, []);

  const recurrencePattern = React.useMemo(() => mapStatusToRecurrencePattern(status), [mapStatusToRecurrencePattern, status]);
  const recurrenceColor = React.useMemo(() => getRecurrenceColor(recurrencePattern), [recurrencePattern]);

  const baseOpacity = 0.075; 
  
  const { cardBgColor, gradientColors } = React.useMemo(() => {
    let cardBgColor = isDark ? "rgba(22, 22, 22, 0.3)" : "rgba(25, 25, 25, 0.7)"; 
    let gradientColors: readonly [string, string, string] | undefined;
    
    // Dark mode
    if (isDark && category) {
      let categoryColor = calculatedCategoryColor;
      gradientColors = [
        withOpacity(categoryColor, baseOpacity * 0.5),  // Top - darker
        withOpacity(categoryColor, baseOpacity),        // Middle
        withOpacity(categoryColor, baseOpacity * 1.3)   // Bottom - brighter
      ] as const;
    } else if (isDark && priority) {
      const priorityColor = getPriorityColor(priority);
      gradientColors = [
        withOpacity(priorityColor, baseOpacity * 0.5),  // Top - darker
        withOpacity(priorityColor, baseOpacity),        // Middle
        withOpacity(priorityColor, baseOpacity * 1.3)   // Bottom - brighter
      ] as const;
    } else if (isDark && recurrencePattern) {
      gradientColors = [
        withOpacity(recurrenceColor, baseOpacity * 0.5),  // Top - darker
        withOpacity(recurrenceColor, baseOpacity),        // Middle
        withOpacity(recurrenceColor, baseOpacity * 1.3)   // Bottom - brighter
      ] as const;
    } 
    // Light mode
      else if (!isDark && category) {
      let categoryColor = calculatedCategoryColor;
       gradientColors = [
        withOpacity(categoryColor, baseOpacity * 0.5),  // Top - darker
        withOpacity(categoryColor, baseOpacity),        // Middle
        withOpacity(categoryColor, baseOpacity * 1.3)   // Bottom - brighter
      ] as const;
    } else if (!isDark && priority) {
      const priorityColor = getPriorityColor(priority);
      gradientColors = [
        withOpacity(priorityColor, baseOpacity * 0.5),  // Top - darker
        withOpacity(priorityColor, baseOpacity),        // Middle
        withOpacity(priorityColor, baseOpacity * 1.3)   // Bottom - brighter
      ] as const;
    } else if (!isDark && recurrencePattern) {
      gradientColors = [
        withOpacity(recurrenceColor, baseOpacity * 0.5),  // Top - darker
        withOpacity(recurrenceColor, baseOpacity),        // Middle
        withOpacity(recurrenceColor, baseOpacity * 1.3)   // Bottom - brighter
      ] as const;
    }
    
    return { cardBgColor, gradientColors };
  }, [isDark, category, calculatedCategoryColor, priority, recurrencePattern, recurrenceColor, baseOpacity]);

  const handleDelete = React.useCallback((onComplete: (deleted: boolean) => void) => {
    if (onDelete) {
      if (Platform.OS === 'web') {
        if (confirm('Are you sure you want to delete this task?')) {
          onDelete();
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showToast('Task deleted successfully', 'success');
          onComplete(true);
        } else {
          onComplete(false);
        }
      } else {
        Alert.alert(
          'Delete Task',
          'Are you sure you want to delete this task?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => onComplete(false) },
            { 
              text: 'Delete', 
              onPress: () => {
                onDelete();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                showToast('Task deleted successfully', 'success');
                onComplete(true);
              }, 
              style: 'destructive' 
            }
          ]
        );
      }
    } else {
      console.warn('No delete handler provided for task:', title);
      onComplete(false);
    }
  }, [onDelete, showToast, title]);

  const handleCheck = React.useCallback(() => {
    // Prevent multiple rapid taps
    if (isProcessingRef.current) {
      return;
    }

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set processing flag
    isProcessingRef.current = true;

    // Animate checkbox press
    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();

    // ⚡ INSTANT FEEDBACK FIRST - Don't wait for store update
    const hapticStart = performance.now();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const newValue = !checked;
    
    // Debounce the actual processing
    debounceTimeoutRef.current = setTimeout(() => {
      const toastStart = performance.now();
      if (newValue) {
        const msg = variants[Math.floor(Math.random() * variants.length)];
        showToast(msg, 'success');
      } else {
        showToast("Undo successful", 'success');
      }
      
      onCheck?.(newValue);
      
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);
      
    }, 100);
    
  }, [checked, onCheck, showToast, title, animatedScale]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <LongPressDelete 
      onDelete={handleDelete}
      progressBarStyle={{
        paddingHorizontal: 8
      }}
      longPressDuration={800}
      isDark={isDark}
    >
      <Stack
        backgroundColor={cardBgColor}
        br={12}
        paddingHorizontal={3}
        marginVertical={isWeb ? "$1" : "$0"}
        borderWidth={0.5}
        overflow="hidden"
        borderColor="rgba(52, 54, 55, 0.9)"
        style={{
          borderLeftWidth: 2.5,
          borderLeftColor: calculatedCategoryColor,

          position: 'relative',
          overflow: 'hidden',
          ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }
          } : {})
        }}
      >
        {gradientColors && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {checked && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            zIndex: 1
          }}
          pointerEvents="none">
            <Ionicons name="checkmark-circle" size={24} color="#00C851" />
          </View>
        )}
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text 
              fontFamily="$body"
              color="rgb(232, 230, 227)" 
              fontSize={isIpad() ? 15 : 13}
              fontWeight="500"
              opacity={checked ? 0.6 : 1}
              style={{
                marginVertical: -2,
                marginLeft: isIpad() ? 2 : 0,
                textDecorationLine: checked ? 'line-through' : 'none',
                textShadowColor: checked ?  isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: checked ? { width: 0.5, height: 0.5 } : { width: 0, height: 0 },
                textShadowRadius: checked ? 1 : 0,
                lineHeight: isIpad() ? 20 : 18,
              }}
            >
              {title}
            </Text>
          </View>
          <Pressable 
            onPress={handleCheck}
            style={styles.checkboxContainer}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
            accessibilityRole="button"
            accessibilityLabel={checked ? "Mark task as incomplete" : "Mark task as complete"}
          >
            <Animated.View style={[
              styles.checkbox,
              { 
                borderColor: checked ? '#00C851' : 'rgb(52, 54, 55)',
                backgroundColor: checked ? 'rgba(0, 200, 81, 0.1)' : 'rgba(255, 255, 255, 0.65)',
                zIndex: 10,
                transform: [{ scale: animatedScale }]
              }
            ]}>
              {checked && (
                <Ionicons 
                  name="checkmark-sharp" 
                  size={13} 
                  color="#00C851"
                />
              )}
            </Animated.View>
          </Pressable>
        </View>
        <View style={styles.chipsContainer}>
          <TaskChips
            category={category}
            priority={priority}
            recurrencePattern={recurrencePattern}
            status={status}
            time={time}
            checked={checked}
            tags={tags}
          />
        </View>
      </Stack>
    </LongPressDelete>
  );
})

TaskCard.displayName = 'TaskCard'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isIpad() ? 7 : 6,
    paddingTop: isIpad() ? 7 : 6,
    position: 'relative',
    zIndex: 2
  },
  textContainer: {
    flex: 1,
    paddingLeft: isWeb ? 12 : isIpad() ? 0 : 0,
    justifyContent: 'center',
    marginBottom: -1,
  },
  checkboxContainer: {
    paddingHorizontal: 3,
    paddingTop: 2,
    alignSelf: 'flex-start',
    zIndex: 10,
    marginTop: isIpad() ? 1 : 0,
  },
  checkbox: {
    width: isIpad() ? 20 : 18,
    height: isIpad() ? 20 : 18,
    borderWidth: 1.5,
    marginRight: -4,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  chipsContainer: {
    paddingHorizontal: 8,
    paddingLeft: isWeb ? 20 : isIpad() ? 8 : 6,
    paddingBottom: isIpad() ? 5 : 3,
  }
});
