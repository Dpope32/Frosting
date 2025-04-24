
import React, { useState } from 'react';
import { Pressable, View, StyleSheet, Platform, Alert } from 'react-native';
import { XStack, YStack, Text, Button } from 'tamagui';
import { Pencil } from '@tamagui/lucide-icons';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getHabitColor, getCategoryColor } from '@/utils/styleUtils';
import { useHabits } from '@/hooks/useHabits';
import type { Habit } from '@/store/HabitStore';
import { useToastStore } from '@/store/ToastStore';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = Platform.OS !== 'web';
  const { getRecentHistory } = useHabits();
  const [showStats, setShowStats] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const today = new Date().toISOString().split('T')[0];
  const doneToday = habit.completionHistory[today] || false;
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

  const squareSize = isMobile ? 14 : 16;
  const gap = isMobile ? 3 : 4;

  const handleDelete = () => {
    if (isMobile) {
      Alert.alert(
        'Delete Habit',
        'Are you sure you want to delete this habit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onDelete();
              showToast('Habit deleted successfully', 'success');
            },
          },
        ],
      );
    } else {
      if (window.confirm('Are you sure you want to delete this habit?')) {
        onDelete();
        showToast('Habit deleted successfully', 'success');
      }
    }
  };

  return (
    <YStack
      mb={10}
      p={isMobile ? 8 : 10}
      px={isMobile ? 12 : 16}
      borderRadius={12}
      backgroundColor={isDark ? '#111' : '#fff'}
      borderWidth={1}
      borderColor={isDark ? '#333' : '#E0E0E0'}
      position="relative"
      overflow="hidden"
    >
      {/* Dark overlay when habit is completed for the day */}
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
            borderRadius: 11, // slightly smaller than parent to respect border
          }}
          pointerEvents="none"
        >
          <Ionicons name="checkmark-circle" size={24} color="#00C851" />
        </View>
      )}
      
      <XStack justifyContent="space-between" alignItems="center" mb={isMobile ? 10 : 12}>
        <XStack alignItems="center" flex={1} gap="$3" style={{ zIndex: 2 }}>
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
                    ? '#181818'
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
          
          <Text
            fontFamily="$body"
            fontSize={isMobile ? 15 : 16}
            fontWeight="600"
            color={isDark ? '#fff' : '#000'}
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
              fontSize={isMobile ? 14 : 16}
              fontWeight="500"
              style={{ textTransform: 'capitalize' }}
            >
              {habit.category}
            </Text>
          </XStack>
        </XStack>

        <XStack gap="$3" alignItems="center" style={{ zIndex: 2 }}>
          <Pressable onPress={() => setShowStats(true)} style={{ padding: 4 }}>
            <Ionicons 
              name="stats-chart" 
              size={isMobile ? 16 : 20} 
              color={isDark ? '#666' : '#999'} 
            />
          </Pressable>
          <Pressable onPress={handleDelete} style={{ padding: 4 }}>
            <Ionicons 
              name="trash-outline" 
              size={isMobile ? 16 : 20} 
              color="$red10"
            />
          </Pressable>
        </XStack>
      </XStack>

      {showStats && (
        <View
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 100,
            backgroundColor: isDark ? '#181818' : '#FFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E0E0E0',
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            minWidth: 180,
          }}
        >
          <Text fontFamily="$body" fontSize={15} fontWeight="700" mb={8} color={isDark ? '#fff' : '#000'}>
            Habit Stats
          </Text>
          <Text fontFamily="$body" fontSize={14} mb={4} color={isDark ? '#ccc' : '#666'}>
            Current Streak: <Text fontWeight="700" color={isDark ? '#fff' : '#000'}>{currentStreak}</Text>
          </Text>
          <Text fontFamily="$body" fontSize={14} mb={4} color={isDark ? '#ccc' : '#666'}>
            Longest Streak: <Text fontWeight="700" color={isDark ? '#fff' : '#000'}>{longestStreak}</Text>
          </Text>
          <Text fontFamily="$body" fontSize={14} mb={4} color={isDark ? '#ccc' : '#666'}>
            Total Completions: <Text fontWeight="700" color={isDark ? '#fff' : '#000'}>{totalCompletions}</Text>
          </Text>
          <Text fontFamily="$body" fontSize={14} mb={8} color={isDark ? '#ccc' : '#666'}>
            Completion %: <Text fontWeight="700" color={isDark ? '#fff' : '#000'}>{percentComplete}%</Text>
          </Text>
          <Button
            size="$2"
            onPress={() => setShowStats(false)}
            backgroundColor="#00C851"
            color="#FFF"
            mt={4}
            br={8}
            alignSelf="flex-end"
          >
            Close
          </Button>
        </View>
      )}

      {/* Improved history display */}
      <XStack alignItems="center" style={{ zIndex: 2 }}>
        <XStack
          flexWrap="wrap"
          gap={gap}
          borderRadius={6}
          padding={6}
          backgroundColor={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
          mb={history.length === 1 ? 4 : 0}
        >
          {history.length > 0 ? (
            history.map((day, idx) => (
              <YStack
                key={day.date}
                width={squareSize}
                height={squareSize}
                borderRadius={3}
                backgroundColor={day.completed ? '#00C851' : isDark ? '#333' : '#E0E0E0'}
                alignItems="center"
                justifyContent="center"
                opacity={day.date === today ? 1 : 0.8}
              >
                {day.date === today && (
                  <View
                    style={{
                      position: "absolute",
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "#FFD600",
                    }}
                  />
                )}
              </YStack>
            ))
          ) : (
            <Text fontFamily="$body" fontSize={12} color={isDark ? '#777' : '#999'}>
              No history yet
            </Text>
          )}
        </XStack>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 2,
    marginRight: 2,
    alignSelf: 'flex-start',
  },
  checkbox: {
    borderWidth: 1,
    marginLeft: -4,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});