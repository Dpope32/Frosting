import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { XStack, YStack, Text, Switch, Button } from 'tamagui';
import { StockCardAnimated } from '@/components/baseModals/StockCardAnimated';
import { scheduleEventNotification } from '@/services/notificationServices';
import { CategorySelector } from '@/components/shared/debouncedInput';
import { TaskCategory } from '@/types/task';

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (name: string, category: TaskCategory) => void;
}

export function AddHabitModal({ open, onOpenChange, onSave }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('health');
  const [notifyMorning, setNotifyMorning] = useState(true);
  const [notifyNight, setNotifyNight] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    if (notifyMorning) {
      const m = new Date();
      m.setHours(9, 0, 0, 0);
      if (m <= new Date()) m.setDate(m.getDate() + 1);
      await scheduleEventNotification(
        m,
        `${name} Reminder`,
        `Don't forget to complete "${name}" this morning`,
        `${name}-morning`
      );
    }

    if (notifyNight) {
      const n = new Date();
      n.setHours(21, 0, 0, 0);
      if (n <= new Date()) n.setDate(n.getDate() + 1);
      await scheduleEventNotification(
        n,
        `${name} Reminder`,
        `Don't forget to complete "${name}" tonight`,
        `${name}-night`
      );
    }

    if (onSave) {
      onSave(name, category);
    }

    onOpenChange(false);
    setName('');
    setCategory('health');
    setNotifyMorning(true);
    setNotifyNight(false);
  };

  return (
    <StockCardAnimated open={open} title="Add New Habit" onClose={() => onOpenChange(false)}>
      <YStack gap="$3">
        <Text fontFamily="$body" fontSize={14}>Habit Name</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#888',
            borderRadius: 6,
            paddingHorizontal: 10,
            height: 40,
            color: '#000'
          }}
          placeholder="e.g. Drink Water"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <CategorySelector 
          value={category} 
          onChange={(cat) => setCategory(cat as TaskCategory)} 
        />

        <XStack justifyContent="space-between" alignItems="center">
          <Text fontFamily="$body">Notify Morning</Text>
          <Switch checked={notifyMorning} onCheckedChange={setNotifyMorning} />
        </XStack>

        <XStack justifyContent="space-between" alignItems="center">
          <Text fontFamily="$body">Notify Night</Text>
          <Switch checked={notifyNight} onCheckedChange={setNotifyNight} />
        </XStack>

        <Button onPress={handleSave} mt="$2">Save Habit</Button>
      </YStack>
    </StockCardAnimated>
  );
} 