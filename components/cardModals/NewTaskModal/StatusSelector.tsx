import React from 'react';
import { useColorScheme } from 'react-native';
import { XStack, Text, Button } from 'tamagui';
import { isIpad } from '@/utils';
import type { Project } from '@/types';

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
    <XStack px={isIpad() ? '$3.5' : '$2'} gap={isIpad() ? '$2' : '$2.5'} alignItems="center" mb="$2" mt="$-3">
      <XStack gap={isIpad() ? '$2' : '$2'}>
       
        {statuses.map(({ key, label, color }: { key: ProjectStatus; label: string; color: string }    ) => (
          <Button
            height={isIpad() ? 40 : 35}
            key={key}
            onPress={() => onStatusSelect(key)}
            backgroundColor={selectedStatus === key ? `${color}22` : isDark ? '$gray2' : '$white'}
            borderColor={selectedStatus === key ? color : isDark ? '$gray7' : '$gray4'}
            borderWidth={1}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            br={isIpad() ? 20 : 20}
            px={isIpad() ? '$2.5' : "$2.5"}
            py={isIpad() ? '$2.5' : "$0.5"}
          >
            <Text color={selectedStatus === key ? color : isDark ? '$gray9' : '$gray11'} fontSize={isIpad() ? 17 : 15} fontFamily="$body">
              {label}
            </Text>
          </Button>
        ))}
      </XStack>
    </XStack>
  );
}

export default StatusSelector;