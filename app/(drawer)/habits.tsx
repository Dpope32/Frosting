import React, { useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { YStack, Text, Button, XStack } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import { AddHabitModal } from '@/components/cardModals/AddHabitModal';
import { HabitCard } from '@/components/habits/HabitCard';
import { useHabits } from '@/hooks/useHabits';
import { useUserStore } from '@/store/UserStore';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const [showAdd, setShowAdd] = useState(false);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { habits, addHabit, toggleHabit, deleteHabit, completedToday, progressPercentage } = useHabits();

  return (
    <>
      <Header title="Habit Tracker" />

      <YStack 
        f={1} 
        pt={isWeb ? 60 : 95} 
        px={isWeb ? 24 : 16} 
        bg={isDark ? '#000' : '#F6F6F6'}
      >
        <YStack gap="$2" mb="$4">
          <Text
            fontFamily="$body"
            color={isDark ? "#dbd0c6" : "#dbd0c6"}
            fontSize={20}
            fontWeight="bold"
          >
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          <XStack alignItems="center" gap="$2">
            <Text
              fontFamily="$body"
              color={isDark ? "#dbd0c6" : "#dbd0c6"}
              fontSize={16}
            >
              {completedToday} of {habits.length} habits completed
            </Text>
          </XStack>

          <YStack
            height={4}
            backgroundColor={isDark ? '#222' : '#e0e0e0'}
            borderRadius={2}
            overflow="hidden"
          >
            <YStack
              height="100%"
              width={`${progressPercentage}%`}
              backgroundColor="#00C851"
              borderRadius={2}
            />
          </YStack>
        </YStack>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ 
            gap: 16,
            paddingTop: 16,
            paddingBottom: 140,
          }}
        >
          {habits.map((habit) => (
            <HabitCard 
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabit(habit.id)}
              onDelete={() => deleteHabit(habit.id)}
            />
          ))}
        </ScrollView>

        <Button
          onPress={() => setShowAdd(true)}
          position="absolute"
          bottom={40}
          right={24}
          size="$4"
          circular
          backgroundColor={primaryColor}
          icon={<Plus color="#FFF" size={24} />}
          pressStyle={{ scale: 0.95 }}
          animation="quick"
          elevation={4}
        />
      </YStack>

      <AddHabitModal 
        open={showAdd} 
        onOpenChange={setShowAdd} 
        onSave={addHabit}
      />
    </>
  );
}
