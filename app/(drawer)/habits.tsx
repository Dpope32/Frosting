import React, { useState, useCallback } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { YStack, Text, Button, XStack } from 'tamagui';
import { Plus, Database, Trash } from '@tamagui/lucide-icons';
import { HabitEmpty } from '@/components/habits/HabitEmpty';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AddHabitModal } from '@/components/cardModals/creates/AddHabitModal';
import { HabitCard } from '@/components/habits/HabitCard';
import { useHabits } from '@/hooks/useHabits';
import { useUserStore } from '@/store/UserStore';
import { generateTestHabits } from '@/services';
import { isIpad } from '@/utils/deviceUtils';
import { useHabitStore } from '@/store/HabitStore';
import { format } from 'date-fns';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const [showAdd, setShowAdd] = useState(false);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const hydrated = useHabitStore((state) => state.hydrated);
  const { habits, addHabit, toggleHabit, deleteHabit, completedToday, progressPercentage } = useHabits();

  const deleteAllDevHabits = useCallback(() => {
    habits.forEach((habit, index) => {
      setTimeout(() => deleteHabit(habit.id), index * 200);
    });
  }, [habits, deleteHabit]);

  if (!hydrated) {
    return null;
  }

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <YStack 
        f={1} 
        pt={100} 
        px={isWeb ? 24 : 16} 
        bg={isDark ? '#000' : '$backgroundLight'}
      >
        <YStack gap="$2" mb="$1">
          {habits.length > 0 && (
            <>
              <XStack alignItems="center" gap={isIpad() ? "$3" : "$2"}>
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

        <View style={{ flex: 1, position: 'relative' }}>
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
                paddingTop: 12,
                paddingBottom: 140,
              }}
              style={{
                height: '100%',
              }}
            >
              <View style={{ position: 'relative', zIndex: 1, gap: isIpad() ? 8 : 4}}>
                {habits.map((habit) => {
                  const today = format(new Date(), 'yyyy-MM-dd');
                  const doneToday = habit.completionHistory[today] || false;

                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      doneToday={doneToday}
                      onToggle={() => toggleHabit(habit.id)}
                      onDelete={() => deleteHabit(habit.id)}
                    />
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

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
          zIndex={1}
        />

        {__DEV__ && (
          <XStack position="absolute" bottom={40} left={24} gap="$2" zIndex={1}>
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
              onPress={deleteAllDevHabits}
              icon={<Trash color="#FFF" size={20} />}
            />
          </XStack>
        )}
      </YStack>

      <AddHabitModal 
        isVisible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={addHabit}
      />
    </View>
  );
}
