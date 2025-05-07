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
];

export function StatusSelector({ selectedStatus, onStatusSelect }: StatusSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <XStack px={isIpad() ? '$2.5' : '$1.5'} gap={isIpad() ? '$2' : '$2.5'} alignItems="center">
      <XStack gap={isIpad() ? '$2' : '$2'}>
        {statuses.map(({ key, label, color }) => (
          <Button
            key={key}
            onPress={() => onStatusSelect(key)}
            backgroundColor={selectedStatus === key ? `${color}22` : isDark ? '$gray2' : '$white'}
            borderColor={selectedStatus === key ? color : isDark ? '$gray7' : '$gray4'}
            borderWidth={1}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            br={isIpad() ? 20 : 20}
            px={isIpad() ? '$2.5' : "$2.5"}
            py={isIpad() ? '$2.5' : "$1.5"}
          >
            <Text color={selectedStatus === key ? color : isDark ? '$gray9' : '$gray11'} fontSize={isIpad() ? 17 : 14} fontFamily="$body">
              {label}
            </Text>
          </Button>
        ))}
      </XStack>
    </XStack>
  );
}

export default StatusSelector;
