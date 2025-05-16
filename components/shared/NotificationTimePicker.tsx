import React, { useState } from 'react';
import { TextInput, Platform } from 'react-native';
import { XStack, YStack, Text, Button } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { isIpad } from '@/utils';

interface NotificationTimePickerProps {
  notificationTime: Date | null;
  setNotificationTime: (date: Date | null) => void;
  isDark: boolean;
  customMessage: string;
  setCustomMessage: (msg: string) => void;
}

export const NotificationTimePicker: React.FC<NotificationTimePickerProps> = ({
  notificationTime,
  setNotificationTime,
  isDark,
  customMessage,
  setCustomMessage,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date | null>(null);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const handleTimeConfirm = () => {
    if (tempTime) {
      setNotificationTime(tempTime);
    }
    setShowTimePicker(false);
  };

  const handleTimeCancel = () => {
    setTempTime(null);
    setShowTimePicker(false);
  };

  return (
    <YStack>
      {notificationTime ? (
        <Button
          onPress={() => setShowTimePicker(true)}
          width="100%"
          height={44}
          justifyContent="space-between"
          alignItems="center"
          paddingVertical={12}
          flexDirection="row"
          paddingHorizontal={12}
        >
          <XStack alignItems="center" gap="$2">
            <Ionicons name="notifications-outline" size={18} color="#00C851" />
            <Text fontFamily="$body" fontWeight="bold" fontSize={isIpad() ? 17 : 15} color={isDark ? '#f9f9f9' : '#000'}>
              Everyday at {format(notificationTime, 'h:mm a')}
            </Text>
          </XStack>
          <Ionicons name="pencil" size={16} color={isDark ? '#fff' : '#000'} opacity={0.5} />
        </Button>
      ) : (
        <Button
          onPress={() => setShowTimePicker(true)}
          width="100%"
          backgroundColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0,0,0,0.1)"}
          borderWidth={1}
          borderRadius={8}
          height={44}
          justifyContent="space-between"
          alignItems="center"
          paddingVertical={12}
          flexDirection="row"
          paddingHorizontal={12}
        >
          <Text fontFamily="$body" color={isDark ? '#999999' : '#9c9c9c'}>
            Select notification time (optional)
          </Text>
          <Ionicons name="chevron-down" size={16} color={isDark ? '#555555' : '#000'} />
        </Button>
      )}

      {showTimePicker && (
        <YStack gap={12} paddingVertical={16}>
          <DateTimePicker
            value={tempTime || notificationTime || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            style={{ width: '100%' }}
          />
          <XStack gap={8} justifyContent="flex-end" paddingTop={8}>
            <Button
              onPress={handleTimeCancel}
              backgroundColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
              borderColor="rgba(255, 255, 255, 0.1)"
              borderWidth={1}
              borderRadius={8}
              height={36}
              paddingHorizontal={12}
            >
              <Text color={isDark ? '#fff' : '#000'} fontFamily="$body">
                Cancel
              </Text>
            </Button>
            <Button
              onPress={handleTimeConfirm}
              backgroundColor="#007AFF"
              borderRadius={8}
              height={36}
              paddingHorizontal={12}
            >
              <Text color="#fff" fontFamily="$body">
                OK
              </Text>
            </Button>
          </XStack>
        </YStack>
      )}

      {notificationTime && (
        <YStack gap={6} paddingTop={12}>
        <TextInput
          style={{ 
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 75,
            fontSize: 16,
            backgroundColor: isDark ? 'rgba(24, 24, 24, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            color: isDark ? '#fff' : '#000',
            minHeight: 80,
            textAlignVertical: 'top',
            paddingTop: 8,
            marginBottom: 16
          }}
          placeholder="Custom notification message (optional)"
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
          value={customMessage}
          onChangeText={setCustomMessage}
          multiline
          numberOfLines={3}
        />
        </YStack>
      )}
    </YStack>
  );
}; 