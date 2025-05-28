import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput } from 'react-native';
import { YStack, Text, Button } from 'tamagui';
import { BaseCardAnimated } from '@/components/baseModals/BaseCardAnimated';
import { scheduleDailyHabitNotification } from '@/services/notificationServices';
import { CategorySelector } from '@/components/cardModals/NewTaskModal/CategorySelector';
import { TaskCategory } from '@/types';
import { useColorScheme } from 'react-native';
import { useToastStore, useUserStore } from '@/store';
import { format } from 'date-fns';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { NotificationTimePicker } from '@/components/shared/NotificationTimePicker';
import { isIpad } from '@/utils';

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
  const preferences = useUserStore((state) => state.preferences);
  useAutoFocus(nameInputRef, 750, isVisible);

  // Adjust color function for light/dark mode button styling
  const adjustColor = (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
  };

  // Standardized colors matching AddNoteSheet style
  const inputBgColor = isDark ? 'rgba(0, 0, 0, 0.1)' : '#f1f1f1';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const titleBorderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.25)';
  const textColor = isDark ? '#fff' : '#000';
  const placeholderColor = isDark ? "#888" : "#999";

  const resetForm = () => {
    setName('');
    setCategory('health');
    setNotificationTime(null);
    setShowTimePicker(false);
    setCustomMessage('');
    setDescription('');
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
      <YStack style={{ borderRadius: 16 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 800, minHeight: 200 }}
          contentContainerStyle={{ paddingVertical: 2, paddingHorizontal: 0, paddingBottom: 20 }}
        >
          <DebouncedInput
            ref={nameInputRef}
            borderColor={borderColor}
            borderWidth={1}
            focusStyle={{ 
              borderColor: borderColor,
              borderWidth: 1
            }}
            hoverStyle={{
              borderColor: borderColor,
              borderWidth: 1
            }}
            backgroundColor={inputBgColor}
            color={textColor} 
            placeholder="Habit Name"
            placeholderTextColor={placeholderColor}
            value={name}
            onDebouncedChange={(value) => setName(value)}
            borderRadius={8}
          />
          <YStack py={8} width="100%" >
            <CategorySelector 
              selectedCategory={category} 
              onCategorySelect={(cat) => setCategory(cat as TaskCategory)}
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
        backgroundColor={name.trim() ? 
          (isDark ? `${preferences.primaryColor}40` :`${preferences.primaryColor}30`) : 
          (isDark ? 'rgba(255,255,255,0.1)' :'rgba(255,255,255,0.1)')}
        borderColor={name.trim() ? preferences.primaryColor : preferences.primaryColor }
        borderWidth={name.trim() ? 2 : 1}
        borderRadius={12}
        height={44}
        justifyContent="center"
        alignItems="center"
        marginBottom={8}
        pressStyle={{ opacity: 0.7 }}
      >
        <Text 
          color={name.trim() ? 
            (isDark ? "#f9f9f9" :   `${preferences.primaryColor}95`) : 
            textColor}
          fontFamily="$body"
          fontSize={15}
          fontWeight="500"
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
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
  }
});
