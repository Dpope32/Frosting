import { Stack, Text, XStack, Checkbox } from 'tamagui';
import { View } from 'react-native';

interface TaskCardProps {
  title: string;
  time?: string;
  category: string;
  status: string;
  categoryColor?: string;
  checked?: boolean;
  onCheck?: (checked: boolean) => void;
}

export function TaskCard({ 
  title, 
  time, 
  category, 
  status, 
  categoryColor = '#9C27B0',
  checked = false,
  onCheck 
}: TaskCardProps) {
  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      borderRadius={8}
      padding="$2"
      marginVertical="$1"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: categoryColor,
      }}
      position="relative"
    >
      {checked && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 8,
            zIndex: 1,
          }}
        />
      )}
      
      <XStack justifyContent="space-between" alignItems="center" gap="$2" zIndex={2}>
        <Checkbox 
          checked={checked}
          onCheckedChange={onCheck}
          backgroundColor={checked ? categoryColor : 'transparent'}
          borderColor="rgba(255, 255, 255, 0.2)"
        />
        <Text 
          color="white" 
          fontSize={14} 
          fontWeight="500"
          flex={1}
          opacity={checked ? 0.5 : 1}
          textDecorationLine={checked ? 'line-through' : 'none'}
        >
          {title}
        </Text>
        {time && (
          <Text color="white" opacity={checked ? 0.4 : 0.7} fontSize={12}>
            {time}
          </Text>
        )}
      </XStack>
      
      <XStack gap="$2" marginTop="$2" zIndex={2}>
        <Text
          color={categoryColor}
          fontSize={10}
          opacity={checked ? 0.6 : 0.9}
          backgroundColor="rgba(0, 0, 0, 0.15)"
          paddingHorizontal="$1.5"
          paddingVertical="$0.5"
          borderRadius={4}
        >
          {category}
        </Text>
        <Text
          color="white"
          fontSize={10}
          opacity={checked ? 0.4 : 0.7}
          backgroundColor="rgba(0, 0, 0, 0.15)"
          paddingHorizontal="$1.5"
          paddingVertical="$0.5"
          borderRadius={4}
        >
          {status}
        </Text>
      </XStack>
    </Stack>
  );
}