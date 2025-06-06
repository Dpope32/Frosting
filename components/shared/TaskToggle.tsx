import React, { useRef, useEffect } from 'react';
import { XStack, YStack, Text, View, isWeb } from 'tamagui';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, runOnJS } from 'react-native-reanimated';

interface TaskToggleProps {
  createTask: boolean;
  onToggle: (value: boolean) => void;
  billName?: string;
  isEdit?: boolean;
  hasExistingTask?: boolean;
}

export function TaskToggle({ 
  createTask, 
  onToggle, 
  billName = "bill", 
  isEdit = false, 
  hasExistingTask = false 
}: TaskToggleProps) {
  const hasAnimated = useRef(false);

  const handleToggle = () => {
    onToggle(!createTask);
  };

  return (
    <Animated.View 
      entering={hasAnimated.current ? undefined : FadeInDown.delay(400).duration(500)}
      onLayout={() => {
        if (!hasAnimated.current) {
          hasAnimated.current = true;
        }
      }}
    >
      <XStack 
        backgroundColor="$backgroundHover" 
        borderColor="$borderColor" 
        borderWidth={1} 
        br={8} 
        padding="$3" 
        alignItems="center" 
        justifyContent="space-between"
        marginTop="$2"
      >
        <YStack flex={1} marginRight="$3">
          <Text fontFamily="$body" color="$color" fontSize={isWeb ? "$5" : "$4"} fontWeight="500">
            Create Tasks
          </Text>
          <Text fontFamily="$body" color="$color" fontSize="$3" opacity={0.7} marginTop="$1">
            {createTask 
              ? `This ${billName} will display as a task on the home screen on the due date`
              : `This ${billName} will only display in your calendar, not as a task on the home screen`
            }
          </Text>
          
          {isEdit && hasExistingTask && !createTask && (
            <Text fontFamily="$body" color="$red10" fontSize="$2" marginTop="$1" fontWeight="500">
              ⚠️ Turning this off will remove existing tasks for this {billName}
            </Text>
          )}
          {isEdit && !hasExistingTask && createTask && (
            <Text fontFamily="$body" color="$green10" fontSize="$2" marginTop="$1" fontWeight="500">
              ✅ This will create monthly tasks for this {billName}
            </Text>
          )}
          
          {!isEdit && createTask && (
            <Text fontFamily="$body" color="$green10" fontSize="$2" marginTop="$1" fontWeight="500">
              ✅ Display {billName} as a task on the home screen on the due date
            </Text>
          )}
        </YStack>
        
        <TouchableOpacity
          onPress={handleToggle}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 8,
            alignSelf: 'flex-start',
          }}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          accessibilityRole="button"
          accessibilityLabel={createTask ? "Disable task creation" : "Enable task creation"}
        >
          <View style={{
            width: 20,
            height: 20,
            borderWidth: 1.5,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: createTask ? '#00C851' : 'rgb(52, 54, 55)',
            backgroundColor: createTask ? 'rgba(0, 200, 81, 0.1)' : 'rgba(255, 255, 255, 0.65)',
          }}>
            {createTask && (
              <Ionicons 
                name="checkmark-sharp" 
                size={13} 
                color="#00C851"
              />
            )}
          </View>
        </TouchableOpacity>
      </XStack>
    </Animated.View>
  );
} 