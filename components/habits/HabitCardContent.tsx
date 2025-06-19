import React, { useState, useRef } from 'react';
import { Pressable, View, Platform, Modal, Dimensions } from 'react-native';
import { XStack, YStack, Text, isWeb } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { getCategoryColor, isIpad } from '@/utils';
import { useHabits } from '@/hooks/useHabits';
import type { Habit } from '@/types';
import { styles } from './styles';
import { Middle } from './Middle';
import { Message } from './Message';
import { RecentGithubCells } from './RecentGithubCells';

interface HabitCardContentProps {
  habit: Habit;
  doneToday: boolean;
}

export const HabitCardContent = ({ habit, doneToday }: HabitCardContentProps) => {   
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = Platform.OS !== 'web';
  const { getRecentHistory } = useHabits();
  const [showStats, setShowStats] = useState(false);
  const statsButtonRef = useRef<View>(null);
  const [statsButtonLayout, setStatsButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const screenWidth = Dimensions.get('window').width;
  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const notificationTime = habit.notificationTimeValue;
  const notificationTimeDate = notificationTime ? notificationTime : 'none';

  
  const history = getRecentHistory(habit);

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
    <YStack
      p={isMobile ? 2 : 10}
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
        colors={isDark ? 
          ['#171c21', '#1a1f25', '#1d2228', '#20252c'] : 
          ['#f5f7f4', '#f0f3ee', '#ebeee9', '#e6e9e4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: 11,
          borderWidth: 1,
          borderColor: isDark ? '#282e36' : '#dde3d8',
          opacity: 0.98,
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
            zIndex: 10,
            borderRadius: 11,
          }}
          pointerEvents="none"
        >
          <Ionicons name="checkmark-circle" size={24} color="#00C851" style={{ zIndex: 11 }} />
        </View>
      )}
      <XStack justifyContent="space-between" alignItems="center" mt={isIpad() ? 8 : 0}>
        <XStack alignItems="center" flex={1} gap="$1.5" style={{ zIndex: 2, paddingTop: isIpad() ? 0 : 8 }}>
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

        <View style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32 }} />
      </XStack>
      <XStack>
      {(notificationTimeDate !== 'none' || habit.customMessage || habit.description) && (
        <Middle habit={habit} doneToday={doneToday} />
          )}
          {habit.customMessage && (
            <Message habit={habit} doneToday={doneToday} />
          )}
      </XStack>
      <XStack alignItems="center" style={{ zIndex: 2 }}>
        <RecentGithubCells history={history} today={today} />
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
  );
};