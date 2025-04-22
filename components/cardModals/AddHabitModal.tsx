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

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, category: TaskCategory, notificationTime: NotificationTime) => void;
}

export function AddHabitModal({ open, onOpenChange, onSave }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('health');
  const [notificationTime, setNotificationTime] = useState<NotificationTime | ''>('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToastStore();

  const resetForm = () => {
    setName('');
    setCategory('health');
    setNotificationTime('');
    setNotificationOpen(false);
  };

  const handleClose: () => void = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (notificationTime && notificationTime !== 'none') {
      const notificationTimes = {
        morning: { hour: 9, minute: 0 },
        afternoon: { hour: 14, minute: 0 },
        evening: { hour: 18, minute: 0 },
        night: { hour: 21, minute: 0 }
      };

      const time = notificationTimes[notificationTime];
      const notificationDate = new Date();
      notificationDate.setHours(time.hour, time.minute, 0, 0);
      if (notificationDate <= new Date()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      await scheduleEventNotification(
        notificationDate,
        `${name} Reminder`,
        `Don't forget to complete "${name}" this ${notificationTime}`,
        `${name}-${notificationTime}`
      );
    }

    onSave(name.trim(), category, notificationTime as NotificationTime);
    showToast('Habit added successfully!', 'success', { duration: 3000 });
    resetForm();
    onOpenChange(false);
  };

  const notificationOptions = [
    { label: 'No Notification', value: 'none' },
    { label: 'Morning (9:00 AM)', value: 'morning' },
    { label: 'Afternoon (2:00 PM)', value: 'afternoon' },
    { label: 'Evening (6:00 PM)', value: 'evening' },
    { label: 'Night (9:00 PM)', value: 'night' }
  ];

  const SelectedValue = ({ label, value, onPress }: { label: string; value: string; onPress: () => void }) => (
    <Pressable onPress={onPress}>
      <XStack 
        borderRadius={8}
        paddingHorizontal={12}
        paddingVertical={10}
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontFamily="$body" color={isDark ? '#fff' : '#000'}>
          {value}
        </Text>
        <XStack alignItems="center" gap="$2">
          <Ionicons name="checkmark-circle" size={18} color="#00C851" />
          <Ionicons name="pencil" size={16} color={isDark ? '#fff' : '#000'} opacity={0.5} />
        </XStack>
      </XStack>
    </Pressable>
  );

  const SelectButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Button
      onPress={onPress}
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
        Select {label.toLowerCase()}
      </Text>
      <Ionicons name="chevron-down" size={16} color={isDark ? '#fff' : '#000'} />
    </Button>
  );

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
          <SelectedValue 
            label="Notification"
            value={notificationOptions.find(opt => opt.value === notificationTime)?.label || ''}
            onPress={() => setNotificationOpen(true)}
          />
        ) : (
          <SelectButton 
            label="Notification"
            onPress={() => setNotificationOpen(true)}
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

        <Sheet
          modal
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
          snapPoints={[55]}
          dismissOnSnapToBottom
          zIndex={100000}
          animation="quick"
        >
          <Sheet.Overlay 
            backgroundColor="rgba(0,0,0,0.4)"
            animation="quick"
          />
          <Sheet.Frame
            backgroundColor={isDark ? '#161616' : '#fff'}
            padding="$4"
          >
            <Sheet.Handle backgroundColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
            <YStack gap="$4">
              <Text fontFamily="$body" fontSize={18} fontWeight="600" color={isDark ? '#fff' : '#000'}>
                Select Notification Time
              </Text>
              {notificationOptions.map((option) => (
                <ListItem
                  key={option.value}
                  pressTheme
                  hoverTheme
                  onPress={() => {
                    setNotificationTime(option.value as NotificationTime);
                    setNotificationOpen(false);
                  }}
                  backgroundColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  borderRadius={8}
                  paddingHorizontal="$3"
                  paddingVertical="$2.5"
                >
                  <Text fontFamily="$body" fontSize={16} color={isDark ? '#fff' : '#000'}>
                    {option.label}
                  </Text>
                  {notificationTime === option.value && (
                    <Ionicons name="checkmark" size={20} color="#00C851" />
                  )}
                </ListItem>
              ))}
            </YStack>
          </Sheet.Frame>
        </Sheet>
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
