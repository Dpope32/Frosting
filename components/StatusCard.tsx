import { Stack, Text, XStack } from 'tamagui';

interface StatusCardProps {
  label: string;
  value: string;
  color?: string;
}

export function StatusCard({ label, value, color = '#4CAF50' }: StatusCardProps) {
  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      borderRadius={8}
      padding="$2"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.5)"
      minWidth={70}
      alignItems="center"
      justifyContent="center"
    >
      <Text
        color={color}
        fontSize={11}
        opacity={0.9}
        marginBottom="$0.5"
      >
        {label}
      </Text>
      <Text
        color="white"
        fontSize={14}
        fontWeight="bold"
      >
        {value}
      </Text>
    </Stack>
  );
}
