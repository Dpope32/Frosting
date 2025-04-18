import React from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack } from 'tamagui';
import { RefreshCw } from '@tamagui/lucide-icons';
import { handleAddTestNotes } from '@/services/noteService';
import { useNoteStore } from '@/store/NoteStore';
import { useToastStore } from '@/store/ToastStore';

interface DevToolsButtonProps {
  isDark: boolean;
}

export const DevToolsButton: React.FC<DevToolsButtonProps> = ({ isDark }) => {
  const noteStore = useNoteStore();
  const showToast = useToastStore(state => state.showToast);

  if (!__DEV__) return null;

  return (
    <XStack
      position="absolute"
      bottom={50}
      left={40}
      gap={10}
      zIndex={100}
    >
      <TouchableOpacity
        onPress={() => handleAddTestNotes(noteStore, showToast)}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: isDark ? '#333' : '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 3,
        }}
      >
        <RefreshCw size={20} color={isDark ? '#4dabf7' : '#3498db'} />
      </TouchableOpacity>
    </XStack>
  );
}; 