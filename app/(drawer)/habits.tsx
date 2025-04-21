import React, { useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { YStack, Text, Button } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import { AddHabitModal } from '@/components/cardModals/AddHabitModal';
import { HabitCard } from '@/components/habits/HabitCard';
import { TaskCategory } from '@/types/task';

// Example habits with TaskCategory categories
const defaultHabits = [
  { title: 'Drink Water', category: 'health' as TaskCategory },
  { title: 'Meditate', category: 'personal' as TaskCategory },
  { title: 'Empty Trash', category: 'task' as TaskCategory },
  { title: 'Read a Book', category: 'work' as TaskCategory },
  { title: 'Journal', category: 'bills' as TaskCategory },
  { title: 'Pay Bills', category: 'bills' as TaskCategory },
  { title: 'Review Investments', category: 'wealth' as TaskCategory },
  { title: 'Family Dinner', category: 'family' as TaskCategory },
  { title: 'Work on Project', category: 'work' as TaskCategory },
  { title: 'Daily Task', category: 'task' as TaskCategory },
];

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const [habits, setHabits] = useState(defaultHabits);
  const [showAdd, setShowAdd] = useState(false);

  useNotifications();

  const handleAddHabit = (name: string, category: TaskCategory) => {
    setHabits([...habits, { title: name, category }]);
  };

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
            Track your daily habits and build consistency
          </Text>

          {habits.map((h) => (
            <HabitCard key={h.title} title={h.title} category={h.category} />
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

      <AddHabitModal 
        open={showAdd} 
        onOpenChange={setShowAdd} 
        onSave={handleAddHabit}
      />
    </>
  );
}
