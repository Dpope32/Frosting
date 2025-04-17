import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { XStack, YStack, Text, Switch, Button } from 'tamagui';
import { StockCardAnimated } from '@/components/baseModals/StockCardAnimated';
import { scheduleEventNotification } from '@/services/notificationServices';

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHabitModal({ open, onOpenChange }: AddHabitModalProps) {
  const [name, setName] = useState('');
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

    // TODO: persist habit

    onOpenChange(false);
    setName('');
    setNotifyMorning(true);
    setNotifyNight(false);
  };

  return (
    <StockCardAnimated open={open} title="Add New Habit" onClose={() => onOpenChange(false)}>
      <YStack space="$3">
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