import React, { useState, useEffect, useCallback, useRef } from 'react';
import { YStack, XStack, Text, Button, isWeb, ScrollView } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform  } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { isIpad } from '@/utils/deviceUtils';

interface DeadlineInputterProps {
    deadline: string;
    setDeadline: (deadline: string) => void;
    isDark: boolean;
}

export const DeadlineInputter = ({ deadline, setDeadline, isDark }: DeadlineInputterProps) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (_e: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
          setDeadline(date.toISOString().split('T')[0]);
        }
      };

    return (
        <YStack gap="$1.5" px={isIpad() ? '$2' : '$1'}>
            {isWeb ? (
                <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.currentTarget.value)}
                style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 4,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                color: isDark ? '#f6f6f6' : '#111',
                fontSize: isIpad() ? 17 : 15,
                fontFamily: 'inherit',
                outline: 'none',
                }}
            />
            ) : (
            <>
                {!deadline && (
                <Button
                    onPress={() => setShowDatePicker(true)}
                    borderWidth={1}
                    borderRadius={12}
                    backgroundColor={"transparent"}
                    px="$3"
                    py="$2"
                    width="100%"
                    borderColor={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}
                    ai="center"
                    jc="space-between"
                    pressStyle={{ opacity: 0.8 }}
                >
                    <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="bold">
                    Set Deadline (optional)
                    </Text>
                    <MaterialIcons name="event" size={24} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
                </Button>
                )}
                {deadline ? (
                <XStack ai="center" jc="space-between" width="100%">
                    <XStack ai="center" gap="$2" px={8}>
                    <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="bold">
                        Deadline:
                    </Text>
                    <Text color={isDark ? '#f6f6f6' : '#222'} fontSize={isIpad() ? 17 : 15} fontFamily="$body">
                        {new Date(deadline).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                    </Text>
                    </XStack>
                    <Button
                    size="$2"
                    circular
                    backgroundColor="transparent"
                    onPress={() => setShowDatePicker(true)}
                    pressStyle={{ opacity: 0.7 }}
                    >
                    <MaterialIcons name="edit" size={20} color={isDark ? '#5c5c5c' : '#666'} />
                    </Button>
                </XStack>
                ) : (
                <Text opacity={0}>No deadline set</Text>
                )}
                {showDatePicker && (
                <YStack gap="$1">
                    <DateTimePicker
                        value={deadline ? new Date(deadline) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={handleDateChange}
                        style={{ width: '100%', backgroundColor: isDark ? '#121212' : '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', paddingHorizontal: 16}}
                    />
                </YStack>
                )}
            </>
            )}
        </YStack>
    );
};
