import React, { useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { YStack, Text, Button, XStack } from 'tamagui';
import { Plus, Database, Trash } from '@tamagui/lucide-icons';
import { HabitEmpty } from '@/components/habits/HabitEmpty';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AddHabitModal } from '@/components/cardModals/AddHabitModal';
import { HabitCard } from '@/components/habits/HabitCard';
import { useHabits } from '@/hooks/useHabits';
import { useUserStore } from '@/store/UserStore';
import { generateTestHabits, clearAllHabits } from '@/services/habitService';
import { isIpad } from '@/utils/deviceUtils';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const [showAdd, setShowAdd] = useState(false);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { habits, addHabit, toggleHabit, deleteHabit, completedToday, progressPercentage } = useHabits();

  return (
    <>
      <YStack 
        f={1} 
        pt={isWeb ? 60 : isIpad() ? 100 : 85} 
        px={isWeb ? 24 : 16} 
        bg={isDark ? '#000' : '#F6F6F6'}
      >
        <YStack gap="$2" mb="$4">
          {habits.length > 0 && ( 
            <>
              <XStack alignItems="center" gap="$2">
                <Text
                  fontFamily="$body"
                  color={isDark ? "#dbd0c6" : "#111"}
                  fontSize={isWeb ? 20 : isIpad() ? 18 : 16}
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
            </>
          )} 
        </YStack>

        {habits.length === 0 ? (
          <HabitEmpty 
            isDark={isDark} 
            primaryColor={primaryColor} 
            isWeb={isWeb} 
          />
        ) : (
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
        )}

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

        {__DEV__ && (
          <XStack position="absolute" bottom={40} left={24} gap="$2">
            <Button
              size="$4"
              circular
              backgroundColor="#ff6b6b"
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              elevation={4}
              onPress={generateTestHabits}
              icon={<Database color="#FFF" size={20} />}
            />
            <Button
              size="$4"
              circular
              backgroundColor="#e74c3c"
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              elevation={4}
              onPress={clearAllHabits}
              icon={<Trash color="#FFF" size={20} />}
            />
          </XStack>
        )}

      </YStack>

      <AddHabitModal 
        open={showAdd} 
        onOpenChange={setShowAdd} 
        onSave={addHabit}
      />
    </>
  );
}
