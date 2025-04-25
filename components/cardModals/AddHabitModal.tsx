import React, { useState } from 'react';
import { TextInput, View, StyleSheet, Platform, Pressable } from 'react-native';
import { XStack, YStack, Text, Button, Sheet, ListItem } from 'tamagui';
import { StockCardAnimated } from '@/components/baseModals/StockCardAnimated';
import { scheduleEventNotification } from '@/services/notificationServices';
import { CategorySelector } from '@/components/shared/debouncedInput';
import { TaskCategory } from '@/types/task';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { NotificationTime } from '@/store/HabitStore';
import { useToastStore } from '@/store/ToastStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, category: TaskCategory, notificationTime: NotificationTime) => void;
}

export function AddHabitModal({ open, onOpenChange, onSave }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('health');
  const [notificationTime, setNotificationTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToastStore();

  const resetForm = () => {
    setName('');
    setCategory('health');
    setNotificationTime(null);
    setShowTimePicker(false);
  };

  const handleClose: () => void = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNotificationTime(selectedTime);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (notificationTime) {
      const notificationDate = new Date();
      notificationDate.setHours(notificationTime.getHours(), notificationTime.getMinutes(), 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (notificationDate <= new Date()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      const result = await scheduleEventNotification(
        notificationDate,
        `${name} Reminder`,
        `Don't forget to complete "${name}" today`,
        `${name}-${format(notificationTime, 'HH:mm')}`,
        'kaiba-nexus://habits'
      );

      if (result === 'habit-completed') {
        showToast('Habit already completed today, notification not scheduled', 'info', { duration: 3000 });
      } else if (result === 'error') {
        showToast('Failed to schedule notification', 'error', { duration: 3000 });
      }
    }

    // Convert the time to one of the predefined notification times
    let notificationTimeValue: NotificationTime = 'none';
    if (notificationTime) {
      const hours = notificationTime.getHours();
      if (hours >= 5 && hours < 12) {
        notificationTimeValue = 'morning';
      } else if (hours >= 12 && hours < 17) {
        notificationTimeValue = 'afternoon';
      } else if (hours >= 17 && hours < 21) {
        notificationTimeValue = 'evening';
      } else {
        notificationTimeValue = 'night';
      }
    }

    onSave(name.trim(), category, notificationTimeValue);
    showToast('Habit added successfully!', 'success', { duration: 3000 });
    resetForm();
    onOpenChange(false);
  };

  return (
    <StockCardAnimated open={open} title="New Habit" onClose={handleClose} >
      <YStack px="$2" py="$2" gap="$3">
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              color: isDark ? '#fff' : '#000',
            }
          ]}
          placeholder="Habit Name"
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
          value={name}
          onChangeText={setName}
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
              paddingVertical={10}
              alignItems="center"
              justifyContent="space-between"
              backgroundColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
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
          <DateTimePicker
            value={notificationTime || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            style={{ width: '100%' }}
          />
        )}

        <Button 
          onPress={handleSave} 
          mt="$2"
          opacity={!name.trim() ? 0.5 : 1}
          disabled={!name.trim()}
          backgroundColor={name.trim() ? '#007AFF' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')}
          borderColor="rgba(255, 255, 255, 0.1)"
          borderWidth={1}
          borderRadius={8}
          height={44}
          justifyContent="center"
          alignItems="center"
        >
          <Text 
            color={name.trim() ? '#fff' : (isDark ? '#fff' : '#000')}
            fontFamily="$body"
          >
            Save Habit
          </Text>
        </Button>
      </YStack>
    </StockCardAnimated>
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
