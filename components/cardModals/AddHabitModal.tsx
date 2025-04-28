import React, { useState } from 'react';
import { TextInput, View, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import { XStack, YStack, Text, Button, Sheet, ListItem } from 'tamagui';
import { BaseCardAnimated } from './BaseCardAnimated';
import { scheduleEventNotification } from '@/services/notificationServices';
import { CategorySelector } from '@/components/shared/debouncedInput';
import { TaskCategory } from '@/types/task';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { NotificationTimeLabel } from '@/store/HabitStore';
import { useToastStore } from '@/store/ToastStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { DebouncedTextInput } from '@/components/recModals/BillRecommendationModal';

interface AddHabitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (name: string, category: TaskCategory, notificationTimeLabel: NotificationTimeLabel, notificationTimeValue: string) => void;
}

export function AddHabitModal({ isVisible, onClose, onSave }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('health');
  const [notificationTime, setNotificationTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToastStore();

  const resetForm = () => {
    setName('');
    setCategory('health');
    setNotificationTime(null);
    setShowTimePicker(false);
    setCustomMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

  const handleSave = async () => {
    if (!name.trim()) return;

    if (notificationTime) {
      const notificationDate = new Date();
      notificationDate.setHours(notificationTime.getHours(), notificationTime.getMinutes(), 0, 0);
      
      if (notificationDate <= new Date()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      console.log('📅 Scheduling habit notification:', {
        habitName: name,
        notificationTime: format(notificationTime, 'h:mm a'),
        customMessage: customMessage.trim() || 'Using default message',
        scheduledFor: format(notificationDate, 'MMM d, yyyy h:mm a'),
        identifier: `${name}-${format(notificationTime, 'HH:mm')}`
      });

      const result = await scheduleEventNotification(
        notificationDate,
        `${name} Reminder`,
        customMessage.trim() || `Don't forget to complete "${name}" today`,
        `${name}-${format(notificationTime, 'HH:mm')}`,
        'kaiba-nexus://habits'
      );

      if (result === 'habit-completed') {
        console.log('⚠️ Notification not scheduled: Habit already completed today');
        showToast('Habit already completed today, notification not scheduled', 'info', { duration: 3000 });
      } else if (result === 'error') {
        console.error('❌ Failed to schedule notification:', result);
        showToast('Failed to schedule notification', 'error', { duration: 3000 });
      } else {
        console.log('✅ Notification scheduled successfully with ID:', result);
      }
    }

    let notificationTimeLabel: NotificationTimeLabel = 'none';
    let notificationTimeValue = '';
    if (notificationTime) {
      const hours = notificationTime.getHours();
      notificationTimeValue = format(notificationTime, 'HH:mm');
      if (hours >= 5 && hours < 12) {
        notificationTimeLabel = 'morning';
      } else if (hours >= 12 && hours < 17) {
        notificationTimeLabel = 'afternoon';
      } else if (hours >= 17 && hours < 21) {
        notificationTimeLabel = 'evening';
      } else {
        notificationTimeLabel = 'night';
      }
    }

    console.log('💾 Saving habit:', {
      name: name.trim(),
      category,
      notificationTime: notificationTimeValue,
      hasCustomMessage: !!customMessage.trim()
    });

    onSave(name.trim(), category, notificationTimeLabel, notificationTimeValue);
    resetForm();
    onClose();
    setTimeout(() => {
      showToast('Habit added successfully!', 'success', { duration: 3000 });
    }, 200);
  };

  return (
    <BaseCardAnimated
      onClose={handleClose}
      title="New Habit"
      visible={isVisible}
    >
      <YStack style={{  borderRadius: 16 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 600, minHeight: 200 }}
          contentContainerStyle={{ paddingVertical: 2, paddingHorizontal: 0 }}
        >
          <DebouncedTextInput
            style={[styles.input, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', color: isDark ? '#fff' : '#000' }]}
            placeholder="Habit Name"
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            value={name}
            onDebouncedChange={(value) => setName(value)}
          />

          <CategorySelector 
            value={category} 
            onChange={(cat) => setCategory(cat as TaskCategory)}
            categories={['health', 'personal', 'work', 'wealth', 'family']}
          />

          {notificationTime ? (
            <Pressable onPress={() => setShowTimePicker(true)}>
              <XStack 
                borderRadius={8}
                paddingHorizontal={12}
                paddingVertical={12}
                alignItems="center"
                justifyContent="space-between"
              >
                <Text fontFamily="$body" color={isDark ? '#fff' : '#000'}>
                  {format(notificationTime, 'h:mm a')}
                </Text>
                <XStack alignItems="center" gap="$2">
                  <Ionicons name="checkmark-circle" size={18} color="#00C851" />
                  <Ionicons name="pencil" size={16} color={isDark ? '#fff' : '#000'} opacity={0.5} />
                </XStack>
              </XStack>
            </Pressable>
          ) : (
            <Button
              onPress={() => setShowTimePicker(true)}
              width="100%"
              backgroundColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
              borderColor="rgba(255, 255, 255, 0.1)"
              borderWidth={1}
              borderRadius={8}
              height={44}
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={12}
              flexDirection="row"
              paddingHorizontal={12}
            >
              <Text fontFamily="$body" color={isDark ? '#fff' : '#000'}>
                Select notification time
              </Text>
              <Ionicons name="chevron-down" size={16} color={isDark ? '#fff' : '#000'} />
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
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', 
                color: isDark ? '#fff' : '#000',
                minHeight: 60,
                textAlignVertical: 'top',
                paddingTop: 8,
                marginBottom: 16
              }]}
              placeholder="Custom notification message (optional)"
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
              value={customMessage}
              onChangeText={setCustomMessage}
              multiline
              numberOfLines={2}
            />
          )}
        </ScrollView>
      </YStack>
      <Button 
        onPress={handleSave} 
        opacity={!name.trim() ? 0.5 : 1}
        disabled={!name.trim()}
        backgroundColor={name.trim() ? '#007AFF' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderWidth={1}
        borderRadius={8}
        height={44}
        justifyContent="center"
        alignItems="center"
        marginBottom={8}
      >
        <Text 
          color={name.trim() ? '#fff' : (isDark ? '#fff' : '#000')}
          fontFamily="$body"
        >
          Save Habit
        </Text>
      </Button>
    </BaseCardAnimated>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
  }
});
