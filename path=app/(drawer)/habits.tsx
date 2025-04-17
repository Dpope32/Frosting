import React, { useState, useMemo } from 'react';
import { Platform, ScrollView, Pressable } from 'react-native';
import { XStack, YStack, Text, Switch, Button } from 'tamagui';
import { Pencil, Plus } from '@tamagui/lucide-icons';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import { AddHabitModal } from '@/components/cardModals/AddHabitModal';
import { getRandomTagColor } from '@/utils/styleUtils';

interface HabitCardProps {
  title: string;
  themeColor: string;
}

function HabitCard({ title, themeColor }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 30 days of mock data
  const [activity, setActivity] = useState<boolean[]>(
    () => Array.from({ length: 30 }, () => Math.random() < 0.5)
  );
  const [doneToday, setDoneToday] = useState(activity[29]);

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

  // compute streaks
  const { currentStreak, longestStreak } = useMemo(() => {
    let curr = 0;
    for (let i = 29; i >= 0 && activity[i]; i--) curr++;
    let max = 0, run = 0;
    for (let done of activity) {
      if (done) { run++; max = Math.max(max, run); }
      else run = 0;
    }
    return { currentStreak: curr, longestStreak: max };
  }, [activity]);

  const squareSize = 16;
  const gap = 4;

  return (
    <YStack
      mb={16}
      p={16}
      borderRadius={12}
      backgroundColor={isDark ? '#121212' : '#FFF'}
      borderWidth={1}
      borderColor={isDark ? '#333' : '#E0E0E0'}
    >
      {/* title + edit */}
      <XStack justifyContent="space-between" alignItems="center" mb={12}>
        <Text fontFamily="$body" fontSize={16} fontWeight="600" color={themeColor}>
          {title}
        </Text>
        <Pencil size={18} color={themeColor} />
      </XStack>

      {/* streaks */}
      <XStack justifyContent="space-between" mb={12}>
        <Text fontFamily="$body" fontSize={14} color={isDark ? '#CCC' : '#555'}>
          Current: {currentStreak}
        </Text>
        <Text fontFamily="$body" fontSize={14} color={isDark ? '#CCC' : '#555'}>
          Longest: {longestStreak}
        </Text>
      </XStack>

      {/* day labels every 7 days */}
      <XStack mb={4}>
        {Array.from({ length: 30 }).map((_, i) =>
          i % 7 === 0 ? (
            <Text
              key={i}
              fontFamily="$body"
              fontSize={10}
              color={isDark ? '#666' : '#888'}
              mr={gap + (squareSize - 10) / 2}
            >
              {i + 1}
            </Text>
          ) : (
            <YStack key={i} width={squareSize + gap} />
          )
        )}
      </XStack>

      {/* combined row: switch + grid */}
      <XStack alignItems="center">
        <Pressable onPress={toggleToday} style={{ padding: 8 }}>
          <Switch
            checked={doneToday}
            // let Pressable handle web clicks
            pointerEvents="none"
          />
        </Pressable>
        <XStack flexWrap="wrap" ml={8}>
          {activity.map((done, idx) => (
            <YStack
              key={idx}
              width={squareSize}
              height={squareSize}
              mr={gap}
              mb={gap}
              borderRadius={3}
              backgroundColor={done ? themeColor : isDark ? '#333' : '#E0E0E0'}
            />
          ))}
        </XStack>
      </XStack>
    </YStack>
  );
}

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

  useNotifications();

  const habitTitles = ['Drink Water', 'Meditate', 'Exercise', 'Read a Book'];
  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      <Header title="Habit Tracker" />

      <YStack f={1} pt={isWeb ? 50 : 90} px={isWeb ? 24 : 16} bg={isDark ? '#000' : '#F6F6F6'}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <Text
            fontFamily="$body"
            fontSize={14}
            color={isDark ? '#CCC' : '#555'}
            mb={16}
          >
            This screen is under maintenance and will be available soon :)
          </Text>

          {habitTitles.map((t) => (
            <HabitCard key={t} title={t} themeColor={getRandomTagColor()} />
          ))}
        </ScrollView>

        <Button
          onPress={() => setShowAdd(true)}
          position="absolute"
          bottom={32}
          right={24}
          size="$4"
          circular
          bg={isDark ? '#444' : '#222'}
          icon={<Plus color="#FFF" size={24} />}
          pressStyle={{ scale: 0.95 }}
        />
      </YStack>

      <AddHabitModal open={showAdd} onOpenChange={setShowAdd} />
    </>
  );
} 