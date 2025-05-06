import React from 'react';
import { Stack, Text, XStack } from 'tamagui';
import { View, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useToastStore } from '@/store/ToastStore';
import { TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task';
import { Tag } from '@/types/tag';
import { isWeb } from 'tamagui';
import { getCategoryColor, getPriorityColor, getRecurrenceColor, getRecurrenceIcon, withOpacity } from '@/utils/styleUtils';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isIpad } from '@/utils/deviceUtils';
import { LongPressDelete } from '@/components/common/LongPressDelete';
import { variants } from '@/constants/variants';
import { TaskChips } from './TaskChips';
import { useCustomCategoryStore } from '@/store/CustomCategoryStore';
import { useUserStore } from '@/store/UserStore';

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

export function TaskCard({ 
  title, 
  time, 
  category, 
  status,
  priority,
  checked = false,
  tags = [],
  onCheck,
  onDelete
}: TaskCardProps) {
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

  const mapStatusToRecurrencePattern = (status: string): RecurrencePattern | undefined => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'one-time') return 'one-time';
    if (lowerStatus === 'tomorrow') return 'tomorrow';
    if (lowerStatus === 'everyday') return 'everyday';
    if (lowerStatus === 'weekly') return 'weekly';
    if (lowerStatus === 'biweekly') return 'biweekly';
    if (lowerStatus === 'monthly') return 'monthly';
    if (lowerStatus === 'yearly') return 'yearly';
    return undefined;
  };

  const recurrencePattern = mapStatusToRecurrencePattern(status);
  const recurrenceColor = getRecurrenceColor(recurrencePattern);

  const baseOpacity = 0.075; 
  
  let cardBgColor = isDark ? "rgba(22, 22, 22, 0.3)" : "rgba(25, 25, 25, 0.7)"; 
  let gradientColors: readonly [string, string, string] | undefined;
  
  // Dark mode
  if (isDark && category) {
    let categoryColor = calculatedCategoryColor;
    gradientColors = [
      withOpacity(categoryColor, baseOpacity * 0.7),  // Top - darker
      withOpacity(categoryColor, baseOpacity),        // Middle
      withOpacity(categoryColor, baseOpacity * 1.3)   // Bottom - brighter
    ] as const;
  } else if (isDark && priority) {
    const priorityColor = getPriorityColor(priority);
    gradientColors = [
      withOpacity(priorityColor, baseOpacity * 0.7),  // Top - darker
      withOpacity(priorityColor, baseOpacity),        // Middle
      withOpacity(priorityColor, baseOpacity * 1.3)   // Bottom - brighter
    ] as const;
  } else if (isDark && recurrencePattern) {
    gradientColors = [
      withOpacity(recurrenceColor, baseOpacity * 0.7),  // Top - darker
      withOpacity(recurrenceColor, baseOpacity),        // Middle
      withOpacity(recurrenceColor, baseOpacity * 1.3)   // Bottom - brighter
    ] as const;
  } 
  // Light mode
    else if (!isDark && category) {
    let categoryColor = calculatedCategoryColor;
     gradientColors = [
      withOpacity(categoryColor, baseOpacity * 0.9),  // Top - darker
      withOpacity(categoryColor, baseOpacity),        // Middle
      withOpacity(categoryColor, baseOpacity * 1.3)   // Bottom - brighter
    ] as const;
  } else if (!isDark && priority) {
    const priorityColor = getPriorityColor(priority);
    gradientColors = [
      withOpacity(priorityColor, baseOpacity * 0.7),  // Top - darker
      withOpacity(priorityColor, baseOpacity),        // Middle
      withOpacity(priorityColor, baseOpacity * 1.3)   // Bottom - brighter
    ] as const;
  } else if (!isDark && recurrencePattern) {
    gradientColors = [
      withOpacity(recurrenceColor, baseOpacity * 0.7),  // Top - darker
      withOpacity(recurrenceColor, baseOpacity),        // Middle
      withOpacity(recurrenceColor, baseOpacity * 1.3)   // Bottom - brighter
    ] as const;
  }
  
  return (
    <LongPressDelete 
      onDelete={(onComplete) => {
        if (onDelete) {
          if (Platform.OS === 'web') {
            if (confirm('Are you sure you want to delete this task?')) {
              console.log('Deleting task:', title);
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
                    console.log('Deleting task:', title);
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
      }}
      progressBarStyle={{
        paddingHorizontal: 8
      }}
      longPressDuration={1600}
    >
      <Stack
        backgroundColor={cardBgColor}
        br={12}
        paddingHorizontal={3}
        marginVertical={isWeb ? "$1" : "$0"}
        borderWidth={1}
        borderColor="rgba(52, 54, 55, 0.9)"
        style={{
          borderLeftWidth: 3,
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
          <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
              <Text 
                fontFamily="$body"
                color="rgb(232, 230, 227)" 
                fontSize={isIpad() ? 15 : 14}
                fontWeight="500"
                opacity={checked ? 0.6 : 1}
                style={{
                  flex: 1,
                  marginVertical: -2,
                  marginLeft: isIpad() ? 2 : 0,
                  textDecorationLine: checked ? 'line-through' : 'none',
                  textShadowColor: 'rgba(0, 0, 0, 0.5)',
                  textShadowOffset: { width: 0.5, height: 0.5 },
                  textShadowRadius: 1
                }}
              >
                {title}
              </Text>
              <Pressable 
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  const newValue = !checked;
                  onCheck?.(newValue);
                  if (newValue) {
                    const msg = variants[Math.floor(Math.random() * variants.length)];
                    showToast(msg, 'success');
                  } else {
                    showToast("Undo successful", 'success');
                  }
                }}
                style={styles.checkboxContainer}
              >
                <View style={[
                  styles.checkbox,
                  { 
                    borderColor: checked ? '#00C851' : 'rgb(52, 54, 55)',
                    backgroundColor: checked ? 'rgba(0, 200, 81, 0.1)' : 'rgba(255, 255, 255, 0.65)'
                  }
                ]}>
                  {checked && (
                    <Ionicons 
                      name="checkmark-sharp" 
                      size={13} 
                      color="#00C851"
                    />
                  )}
                </View>
              </Pressable>
            </View>
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
        </View>
      </Stack>
    </LongPressDelete>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  checkboxContainer: {
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 2,
    marginRight: 2,
    alignSelf: 'flex-start'
  },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1,
    marginLeft: -4,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingLeft: isWeb ? 12 : isIpad() ? 4 : 0
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
