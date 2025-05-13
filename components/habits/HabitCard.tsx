import React, { useState, useRef } from 'react';
import { Pressable, View, StyleSheet, Platform, Alert, findNodeHandle, Modal } from 'react-native';
import { XStack, YStack, Text, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { getCategoryColor } from '@/utils/styleUtils';
import { useHabits } from '@/hooks/useHabits';
import type { Habit } from '@/types/habits';
import { useToastStore } from '@/store/ToastStore';
import { LongPressDelete } from '@/components/common/LongPressDelete';
import { isIpad } from '@/utils/deviceUtils';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
  doneToday: boolean; 
}

const styles = StyleSheet.create({
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

export function HabitCard({ habit, onToggle, onDelete, doneToday }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = Platform.OS !== 'web';
  const { getRecentHistory } = useHabits();
  const [showStats, setShowStats] = useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const statsButtonRef = useRef<View>(null);
  const [statsButtonLayout, setStatsButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const today = new Date().toISOString().split('T')[0];
  const notificationTime = habit.notificationTimeValue;
  const notificationTimeDate = notificationTime ? notificationTime : 'none';
  
  // Convert military time to standard 12-hour format with AM/PM
  const formatTimeToStandard = (time: string): string => {
    if (!time || time === 'none') return 'No time set';

    const [hoursStr, minutesStr] = time.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (isNaN(hours) || isNaN(minutes)) {
      return 'No time set';
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const standardHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${standardHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  const history = getRecentHistory(habit);

  // compute streaks and stats
  const { currentStreak, longestStreak, totalCompletions, percentComplete } = React.useMemo(() => {
    let curr = 0;
    let max = 0;
    let run = 0;
    let total = 0;

    for (const day of history) {
      if (day.completed) {
        run++;
        total++;
        max = Math.max(max, run);
      } else {
        run = 0;
      }
    }
    
    curr = run;
    const percent = Math.round((total / history.length) * 100);
    
    return { currentStreak: curr, longestStreak: max, totalCompletions: total, percentComplete: percent };
  }, [history]);

  const squareSize = 20;
  const gap = isMobile ? 3 : 4;
  const cellsToShow = isMobile ? 15 : 73;

  const handleDelete = (onComplete: (deleted: boolean) => void) => {
    if (isMobile) {
      Alert.alert(
        'Delete Habit',
        'Are you sure you want to delete this habit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => onComplete(false),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onDelete();
              showToast('Habit deleted successfully', 'success');
              onComplete(true);
            },
          },
        ],
      );
    } else {
      if (window.confirm('Are you sure you want to delete this habit?')) {
        onDelete();
        showToast('Habit deleted successfully', 'success');
        onComplete(true);
      } else {
        onComplete(false);
      }
    }
  };

  const handleStatsPress = () => {
    if (statsButtonRef.current && Platform.OS === 'web') {
      statsButtonRef.current.measure(
        (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          setStatsButtonLayout({ x: pageX, y: pageY, width, height });
          setShowStats(true);
        }
      );
    } else {
      setShowStats(true);
    }
  };

  return (
    <LongPressDelete onDelete={handleDelete}>
      <YStack
        mb={10}
        p={isMobile ? 8 : 10}
        px={isMobile ? 12 : 16}
        borderRadius={12}
        backgroundColor={isDark ? (doneToday ? '#000' : '#151515') : 'rgba(255, 255, 255, 0.7)'}
        borderWidth={1}
        borderColor={isDark ? '#333' : '#e0e0e0'}
        position="relative"
        overflow="hidden"
        style={{
          backgroundColor: isDark ? (doneToday ? '#000' : '#151515') : 'rgba(255, 255, 255, 0.7)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <LinearGradient
          colors={isDark ? ['rgb(7, 7, 7)', 'rgb(15, 15, 15)', 'rgb(20, 19, 19)', 'rgb(25, 25, 25)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: 11,
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? undefined : '#9c9c9c',
          }}
        />
        {doneToday && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
              borderRadius: 11,
            }}
            pointerEvents="none"
          >
            <Ionicons name="checkmark-circle" size={24} color="#00C851" />
          </View>
        )}
        
        <XStack justifyContent="space-between" alignItems="center" mt={isIpad() ? 8 : 0}>
          <XStack alignItems="center" flex={1} gap="$2" style={{ zIndex: 2 }}>
            <Pressable 
              ref={statsButtonRef}
              onPress={handleStatsPress}
              style={{ padding: 4 }}
            >
              <Ionicons 
                name="stats-chart" 
                size={isMobile ? 16 : 20} 
                color={isDark ? '#666' : '#999'} 
              />
            </Pressable>
            <Text
              fontFamily="$body"
              fontSize={isIpad() ? 18 : 16}
              fontWeight="600"
              color={isDark ? '#f9f9f9' : '#000'}
              opacity={doneToday ? 0.6 : 1}
              style={{
                textDecorationLine: doneToday ? 'line-through' : 'none',
              }}
            >
              {habit.title}
            </Text>

            <XStack
              alignItems="center"
              backgroundColor={getCategoryColor(habit.category) + '15'}
              px={isMobile ? 12 : 8}
              py={isMobile ? 1 : 2}
              br={10}
              opacity={doneToday ? 0.6 : 0.9}
            >
              <Text
                fontFamily="$body"
                color={getCategoryColor(habit.category)}
                fontSize={isIpad() ? 15 : 14}
                fontWeight="500"
                style={{ textTransform: 'capitalize' }}
              >
                {habit.category}
              </Text>
            </XStack>
          </XStack>

          <XStack gap="$3" alignItems="center"  pb={2} style={{ zIndex: 2 }}>
            <Pressable
              onPress={onToggle}
              style={styles.checkboxContainer}
              hitSlop={8}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: doneToday ? '#00C851' : isDark ? '#333' : 'rgb(52, 54, 55)',
                    backgroundColor: doneToday
                      ? 'rgba(0, 200, 81, 0.1)'
                      : isDark
                      ? 'rgba(110, 110, 110, 0.65)'
                      : 'rgba(255,255,255,0.65)',
                    width: isMobile ? 20 : 24,
                    height: isMobile ? 20 : 24,
                  },
                ]}
              >
                {doneToday && (
                  <Ionicons 
                    name="checkmark-sharp" 
                    size={isMobile ? 14 : 16} 
                    color="#00C851" 
                  />
                )}
              </View>
            </Pressable>
          </XStack>
        </XStack>
        {(notificationTimeDate !== 'none' || habit.customMessage || habit.description) && (
          <XStack mt={2} pb={isIpad() ? 4 : 3} gap={4} >
              {notificationTimeDate !== 'none' && (
              <XStack
                alignItems="center"
                backgroundColor={isDark ? 'rgba(100, 148, 237, 0.07)' : 'rgba(100, 149, 237, 0.1)'}
                px={isMobile ? 10 : 8}
                py={1.5}
                br={10}
                alignSelf="flex-start"
                opacity={doneToday ? 0.6 : 0.9}
              >
                <Ionicons 
                  name="time-outline" 
                  size={isMobile ? 12 : 14} 
                  color={isDark ? '#6495ED' : '#4682B4'} 
                  style={{ marginRight: 4 }}
                />
                <Text 
                  fontFamily="$body" 
                  fontSize={isIpad() ? 14 : 12} 
                  color={isDark ? '#6495ED' : '#4682B4'} 
                  fontWeight="500"
                >
                  {formatTimeToStandard(notificationTimeDate)}
                </Text>
              </XStack>
            )}
            {habit.customMessage && (
              <XStack 
                alignItems="center"
                backgroundColor={isDark ? 'rgba(177, 156, 217, 0.07)' : 'rgba(147, 112, 219, 0.08)'}
                px={isMobile ? 4 : 2}
                py={isMobile ? 2 : 1}
                borderRadius={10}
                alignSelf="flex-start"
                opacity={doneToday ? 0.6 : 0.7}
              >
                <Ionicons 
                  name="notifications-outline" 
                  size={isMobile ? 14 : 10} 
                  color={isDark ? '#B19CD9' : '#9370DB'} 
                  style={{ paddingRight: 2 }}
                />
                <Text 
                  fontFamily="$body" 
                  fontSize={isIpad() ? 15 : 12} 
                  color={isDark ? '#B19CD9' : '#9370DB'} 
                  fontWeight="500"
                >
                  {habit.customMessage}
                </Text>
              </XStack>
            )}
            {habit.description && (
              <XStack
                alignItems="center"
                alignSelf="flex-start"
                opacity={doneToday ? 0.6 : 0.9}
              >
                <Text
                  fontFamily="$body"
                  fontSize={isIpad() ? 15 : 13}
                  color={isDark ? '#ccc' : '#666'}
                  style={{ marginLeft: 2 }}
                >
                  {habit.description}
                </Text>
              </XStack>
            )}
          </XStack>
        )}

        <XStack alignItems="center" style={{ zIndex: 2 }}>
          <YStack
            borderRadius={6}
            padding={8}
            backgroundColor={isDark ? 'rgba(0, 0, 0, 0.2)' : 'transparent'}
            mb={history.length === 1 ? 4 : 0}
            gap={6}
            maxWidth="100%"
          >
            <XStack gap={gap} minWidth={isMobile ? undefined : `${cellsToShow * (squareSize + gap)}px`}>
              {Array.from({ length: cellsToShow }).map((_, idx) => {
                const day = history[history.length - 1 - idx];
                return (
                  <YStack
                    key={day ? day.date : idx}
                    width={squareSize}
                    height={squareSize}
                    borderRadius={3}
                    backgroundColor={day
                      ? day.completed
                        ? '#00C851'
                        : isDark
                          ? '#333'
                          : '#E0E0E0'
                      : isDark
                        ? '#333'
                        : '#E0E0E0'}
                    alignItems="center"
                    justifyContent="center"
                    opacity={day && day.date === today ? 1 : 0.8}
                  />
                );
              })}
            </XStack>
          </YStack>
        </XStack>

        <Modal
          visible={showStats}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStats(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowStats(false)}
          >
            <View 
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDark ? '#181818' : '#FFF',
                  borderColor: isDark ? '#333' : '#E0E0E0',
                }
              ]}
            >
              <XStack justifyContent="space-between" alignItems="center" mb={4} mt={-4}>
                <Text fontFamily="$body" fontSize={18} fontWeight="700" color={isDark ? '#fff' : '#000'}>
                  {habit.title} Stats
                </Text>
                <Pressable 
                  onPress={() => setShowStats(false)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    padding: 4,
                  })}
                  hitSlop={8}
                >
                  <Ionicons 
                    name="close" 
                    size={24} 
                    color={isDark ? '#666' : '#999'} 
                  />
                </Pressable>
              </XStack>
              <Text fontFamily="$body" fontSize={16} ml={8} mb={8} color={isDark ? '#ccc' : '#666'}>
                Current Streak: <Text fontWeight="700" color={isDark ? '#fff' : '#000'}>{currentStreak}</Text>
              </Text>
              <Text fontFamily="$body" fontSize={16} ml={8} mb={8} color={isDark ? '#ccc' : '#666'}>
                Longest Streak: <Text fontWeight="700" color={isDark ? '#fff' : '#000'}>{longestStreak}</Text>
              </Text>
              <Text fontFamily="$body" fontSize={16} ml={8} mb={8} color={isDark ? '#ccc' : '#666'}>
                Total Completions: <Text fontWeight="700" color={isDark ? '#fff' : '#000'}>{totalCompletions}</Text>
              </Text>
              <Text fontFamily="$body" fontSize={16} ml={8} mb={8} color={isDark ? '#ccc' : '#666'}>
                Completion %: <Text fontWeight="700" color={isDark ? '#fff' : '#000'}>{percentComplete}%</Text>
              </Text>
            </View>
          </Pressable>
        </Modal>
      </YStack>
    </LongPressDelete>
  );
}
