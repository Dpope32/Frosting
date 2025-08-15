import React from 'react';
import { Pressable, View, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Habit } from '@/types';
import { useToastStore } from '@/store'
import { LongPressDelete } from '@/components/common/LongPressDelete';
import { styles } from './styles';
import { HabitCardContent } from './HabitCardContent';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
  doneToday: boolean; 
}

export function HabitCard({ habit, onToggle, onDelete, doneToday }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = Platform.OS !== 'web';
  const showToast = useToastStore((state) => state.showToast);
  
  const handleDelete = (onComplete: (deleted: boolean) => void) => {
    const getAddSyncLog = () => {
      try {
        return require('@/components/sync/syncUtils').addSyncLog;
      } catch {
        return () => {};
      }
    };

    getAddSyncLog()(`[HabitCard] 🗑️ Delete requested for habit: ${habit.title} (ID: ${habit.id})`, 'info');

    if (isMobile) {
      Alert.alert(
        'Delete Habit',
        'Are you sure you want to delete this habit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              getAddSyncLog()(`[HabitCard] Delete cancelled for habit: ${habit.title}`, 'info');
              onComplete(false);
            },
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              getAddSyncLog()(`[HabitCard] Delete confirmed for habit: ${habit.title} - calling onDelete()`, 'info');
              onDelete();
              showToast('Habit deleted successfully', 'success');
              onComplete(true);
            },
          },
        ],
      );
    } else {
      if (window.confirm('Are you sure you want to delete this habit?')) {
        getAddSyncLog()(`[HabitCard] Delete confirmed (web) for habit: ${habit.title} - calling onDelete()`, 'info');
        onDelete();
        showToast('Habit deleted successfully', 'success');
        onComplete(true);
      } else {
        getAddSyncLog()(`[HabitCard] Delete cancelled (web) for habit: ${habit.title}`, 'info');
        onComplete(false);
      }
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <LongPressDelete onDelete={handleDelete} longPressDuration={750} isDark={isDark}>
        <HabitCardContent habit={habit} doneToday={doneToday} />
      </LongPressDelete>
      
      <View
        style={{
          position: 'absolute',
          top: isMobile ? 12 : 14,
          right: isMobile ? 18 : 20,
          zIndex: 10,
        }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={onToggle}
          style={[
            styles.checkboxContainer,
            {
              backgroundColor: 'transparent',
            }
          ]}
          hitSlop={16}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: doneToday ? '#00C851' : isDark ? '#333' : 'rgb(52, 54, 55)',
                backgroundColor: doneToday
                  ? 'rgba(0, 200, 81, 0.1)'
                  : isDark
                  ? 'rgba(179, 178, 178, 0.65)'
                  : 'rgba(255,255,255,0.65)',
                width: isMobile ? 20 : 24,
                height: isMobile ? 20 : 24,
              },
            ]}
          >
            {doneToday && (
              <Ionicons 
                name="checkmark-sharp" 
                size={isMobile ? 14 : 16} 
                color="#00C851" 
              />
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}