import React, { useState, useMemo } from 'react';
import { Pressable, View, StyleSheet, Platform } from 'react-native';
import { XStack, YStack, Text, Button } from 'tamagui';
import { Pencil } from '@tamagui/lucide-icons';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getHabitColor, getCategoryColor, withOpacity } from '@/utils/styleUtils';
import { TaskCategory } from '@/types/task';

interface HabitCardProps {
  title: string;
  category: TaskCategory;
}

export function HabitCard({ title, category }: HabitCardProps) {
  const themeColor = getHabitColor(category);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = Platform.OS !== 'web';

  // 30 days of mock data
  const [activity, setActivity] = useState<boolean[]>(
    () => Array.from({ length: 30 }, () => Math.random() < 0.5)
  );
  const [doneToday, setDoneToday] = useState(activity[29]);
  const [showStats, setShowStats] = useState(false);

  const toggleToday = () => {
    setDoneToday(prev => {
      const nxt = !prev;
      setActivity(arr => {
        const copy = [...arr];
        copy[29] = nxt;
        return copy;
      });
      return nxt;
    });
  };

  // compute streaks and stats
  const { currentStreak, longestStreak, totalCompletions, percentComplete } = useMemo(() => {
    // Current streak: count consecutive true values ending at today (index 29)
    let curr = 0;
    for (let i = 29; i >= 0; i--) {
      if (activity[i]) curr++;
      else break;
    }
    // Longest streak: max consecutive trues anywhere
    let max = 0, run = 0;
    for (let done of activity) {
      if (done) { run++; max = Math.max(max, run); }
      else run = 0;
    }
    // Total completions
    const total = activity.filter(Boolean).length;
    // Percent complete (out of days tracked)
    const percent = Math.round((total / activity.length) * 100);
    return { currentStreak: curr, longestStreak: max, totalCompletions: total, percentComplete: percent };
  }, [activity]);

  const squareSize = isMobile ? 14 : 16;
  const gap = isMobile ? 3 : 4;

  return (
    <YStack
      mb={10}
      p={isMobile ? 8 : 10}
      px={isMobile ? 12 : 16}
      borderRadius={12}
      backgroundColor={doneToday ? 'transparent' : withOpacity(getCategoryColor(category), 0.05)}
      borderWidth={1}
      borderColor={isDark ? '#333' : '#E0E0E0'}
    >
      <XStack justifyContent="space-between" alignItems="center" mb={isMobile ? 10 : 12}>
        <XStack alignItems="center" flex={1}>
          <Pressable
            onPress={toggleToday}
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
            color={themeColor}
            style={{
              marginLeft: 8,
              textDecorationLine: doneToday ? 'line-through' : 'none',
              opacity: doneToday ? 0.6 : 1,
            }}
          >
            {title}
          </Text>
          <XStack
            alignItems="center"
            backgroundColor={getCategoryColor(category) + '25'}
            px={isMobile ? 12 : 8}
            py={isMobile ? 1 : 2}
            br={10}
            ml={12}
            mr={-2}
            opacity={doneToday ? 0.6 : 0.9}
          >
            <Ionicons
              name="bookmark"
              size={isMobile ? 14 : 16}
              color={getCategoryColor(category)}
              style={{ marginRight: 3, marginTop: 1 }}
            />
            <Text
              fontFamily="$body"
              color={getCategoryColor(category)}
              fontSize={isMobile ? 14 : 16}
              fontWeight="500"
              style={{ textTransform: 'capitalize' }}
            >
              {category}
            </Text>
          </XStack>
        </XStack>
        <Pressable onPress={() => setShowStats(true)} style={{ marginRight: 24, padding: 4 }}>
          <Ionicons 
            name="stats-chart-outline" 
            size={isMobile ? 16 : 20} 
            color={isDark ? '#fff' : '#000'} 
          />
        </Pressable>
        <Pencil size={isMobile ? 16 : 18} color={isDark ? '#333' : '#111'} />
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
          <Text fontFamily="$body" fontSize={15} fontWeight="700" mb={8} color={themeColor}>
            Habit Stats
          </Text>
          <Text fontFamily="$body" fontSize={14} mb={4}>
            Current Streak: <Text fontWeight="700">{currentStreak}</Text>
          </Text>
          <Text fontFamily="$body" fontSize={14} mb={4}>
            Longest Streak: <Text fontWeight="700">{longestStreak}</Text>
          </Text>
          <Text fontFamily="$body" fontSize={14} mb={4}>
            Total Completions: <Text fontWeight="700">{totalCompletions}</Text>
          </Text>
          <Text fontFamily="$body" fontSize={14} mb={8}>
            Completion %: <Text fontWeight="700">{percentComplete}%</Text>
          </Text>
          <Button
            size="$2"
            onPress={() => setShowStats(false)}
            bg={themeColor}
            color="#FFF"
            mt={4}
            br={8}
            alignSelf="flex-end"
          >
            Close
          </Button>
        </View>
      )}


      <XStack alignItems="center">
        <XStack flexWrap="wrap">
          {activity.map((done, idx) => {
            const showNumber = [0, 7, 14, 21, 28].includes(idx);
            const isToday = idx === 29;
            return (
              <YStack
                key={idx}
                width={squareSize}
                height={squareSize}
                mr={gap}
                mb={gap}
                borderRadius={3}
                backgroundColor={done ? themeColor : isDark ? '#333' : '#E0E0E0'}
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                {showNumber && (
                  <Text
                    fontFamily="$body"
                    fontSize={isMobile ? 8 : 9}
                    color={done ? "#fff" : isDark ? "#aaa" : "#666"}
                    fontWeight="700"
                  >
                    {idx + 1}
                  </Text>
                )}
                {isToday && (
                  <Ionicons
                    name="ellipse"
                    size={isMobile ? 6 : 8}
                    color={done ? "#FFD600" : "#888"}
                    style={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                    }}
                  />
                )}
              </YStack>
            );
          })}
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