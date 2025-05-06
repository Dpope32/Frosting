import React from 'react';
import { useColorScheme } from 'react-native';
import { XStack, Text, Button } from 'tamagui';
import { isIpad } from '@/utils/deviceUtils';
import type { Project } from '@/types/project';

type ProjectStatus = Project['status'];

interface StatusSelectorProps {
  selectedStatus: ProjectStatus;
  onStatusSelect: (status: ProjectStatus) => void;
}

const statuses: { key: ProjectStatus; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: '#FBBF24' },
  { key: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { key: 'completed', label: 'Completed', color: '#10B981' },
  { key: 'past_deadline', label: 'Past Deadline', color: '#EF4444' },
];

export function StatusSelector({ selectedStatus, onStatusSelect }: StatusSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <XStack px={isIpad() ? '$2.5' : '$2'} gap={isIpad() ? '$2' : '$1'} alignItems="center">
      <Text color={isDark ? '$gray10' : '$gray8'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">
        Status?
      </Text>
      <XStack gap={isIpad() ? '$2' : '$1'}>
        {statuses.map(({ key, label, color }) => (
          <Button
            key={key}
            onPress={() => onStatusSelect(key)}
            backgroundColor={selectedStatus === key ? `${color}22` : isDark ? '$gray2' : '$white'}
            borderColor={selectedStatus === key ? color : isDark ? '$gray7' : '$gray4'}
            borderWidth={1}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            br={20}
            px={12}
            py={8}
          >
            <Text color={selectedStatus === key ? color : isDark ? '$gray12' : '$gray11'} fontSize={isIpad() ? 17 : 15} fontFamily="$body">
              {label}
            </Text>
          </Button>
        ))}
      </XStack>
    </XStack>
  );
}

export default StatusSelector; 