import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput } from 'react-native';
import { YStack, Text, Button } from 'tamagui';
import { BaseCardAnimated } from '../baseModals/BaseCardAnimated';
import {  scheduleDailyHabitNotification } from '@/services/notificationServices';
import { CategorySelector } from '@/components/shared/debouncedInput';
import { TaskCategory } from '@/types/task';
import { useColorScheme } from 'react-native';
import { useToastStore } from '@/store/ToastStore';
import { format } from 'date-fns';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { NotificationTimePicker } from '@/components/shared/NotificationTimePicker';
import { isIpad } from '@/utils/deviceUtils';
interface AddHabitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (name: string, category: TaskCategory, notificationTimeValue: string, customMessage: string, description: string) => void;
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
  const [description, setDescription] = useState('');
  const { showToast } = useToastStore();
  const nameInputRef = React.useRef<any>(null);
  useAutoFocus(nameInputRef, 750, isVisible);

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

  const handleSave = async () => {
    if (!name.trim()) return;
    let notificationTimeValue = '';
    if (notificationTime) {
      notificationTimeValue = format(notificationTime, 'HH:mm');
      await scheduleDailyHabitNotification(
        notificationTime.getHours(),
        notificationTime.getMinutes(),
        `${name} Reminder`,
        customMessage.trim() || `Don't forget to complete "${name}" today`,
        `${name}-${notificationTimeValue}`,
        'kaiba-nexus://habits'
      );
    }
    onSave(name.trim(), category, notificationTimeValue, customMessage.trim(), description.trim());
    resetForm();
    onClose();
    setTimeout(() => {
      showToast('Habit added successfully!', 'success', { duration: 2000 });
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
          style={{ maxHeight: 800, minHeight: 200 }}
          contentContainerStyle={{ paddingVertical: 2, paddingHorizontal: 0, paddingBottom: 20 }}
        >
          <DebouncedInput
            ref={nameInputRef}
            style={[styles.input, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)', color: isDark ? '#fff' : '#000' }]}
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

          <YStack mb={12} width="100%" >
            <TextInput
              style={[
                {
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: isIpad() ? 17 : 15,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  paddingTop: 8,
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              placeholder="Habit Description"
              multiline={true}
              numberOfLines={2}
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
              value={description}
              onChangeText={setDescription}
            />
          </YStack>

          <NotificationTimePicker
            notificationTime={notificationTime}
            setNotificationTime={setNotificationTime}
            isDark={isDark}
            customMessage={customMessage}
            setCustomMessage={setCustomMessage}
          />

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
