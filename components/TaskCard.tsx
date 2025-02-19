import { Stack, Text, XStack } from 'tamagui';
import { View, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TaskCardProps {
  title: string;
  time?: string;
  category: string;
  status: string;
  categoryColor?: string;
  checked?: boolean;
  oneTime?: boolean;
  onCheck?: (checked: boolean) => void;
  onDelete?: () => void;
}

export function TaskCard({ 
  title, 
  time, 
  category, 
  status,
  categoryColor = '#9C27B0',
  checked = false,
  oneTime = false,
  onCheck,
  onDelete
}: TaskCardProps) {
  return (
    <Stack
      backgroundColor="rgba(32, 35, 36, 0.95)"
      borderRadius={6}
      padding="$1.5"
      marginVertical="$0.5"
      borderWidth={1}
      borderColor="rgba(52, 54, 55, 0.8)"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: categoryColor,
      }}
    >
      <XStack justifyContent="space-between" alignItems="center" gap="$1">
        <Pressable 
          onPress={() => onCheck?.(!checked)}
          style={{ paddingHorizontal: 4 }}
        >
          <View style={[
            styles.checkbox,
            { borderColor: 'rgb(52, 54, 55)' }
          ]}>
            {checked && (
              <Ionicons 
                name="checkmark-sharp" 
                size={14} 
                color="#00C851"
              />
            )}
          </View>
        </Pressable>

        <Stack flex={1} gap="$1">
          <XStack justifyContent="space-between" alignItems="center" gap="$1">
            <Text 
              color="rgb(232, 230, 227)" 
              fontSize={13}
              flex={1}
              opacity={checked ? 0.6 : 1}
            >
              {title}
            </Text>
            <Pressable 
              onPress={() => {
                if (onDelete) {
                  if (Platform.OS === 'web') {
                    if (confirm('Are you sure you want to delete this task?')) {
                      onDelete();
                    }
                  } else {
                    Alert.alert(
                      'Delete Task',
                      'Are you sure you want to delete this task?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', onPress: onDelete, style: 'destructive' }
                      ]
                    );
                  }
                }
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 4
              })}
            >
              <Text color="#ff4444" fontSize={14}>✕</Text>
            </Pressable>
          </XStack>

          <XStack gap="$1" alignItems="center">
            <Text
              color={categoryColor}
              fontSize={10}
              opacity={checked ? 0.6 : 0.9}
              backgroundColor={`${categoryColor}15`}
              paddingHorizontal="$1.5"
              paddingVertical="$0.5"
              borderRadius={12}
            >
              {category.toLowerCase()}
            </Text>
            {oneTime && (
              <Text
                color="#607d8b"
                fontSize={10}
                opacity={checked ? 0.6 : 0.9}
                backgroundColor="rgba(96, 125, 139, 0.15)"
                paddingHorizontal="$1.5"
                paddingVertical="$0.5"
                borderRadius={12}
              >
                one-time
              </Text>
            )}
            <Text
              color={checked ? "#00C851" : "#2196F3"}
              fontSize={10}
              opacity={checked ? 0.6 : 0.9}
              backgroundColor={checked ? "rgba(0, 200, 81, 0.15)" : "rgba(33, 150, 243, 0.15)"}
              paddingHorizontal="$1.5"
              paddingVertical="$0.5"
              borderRadius={12}
            >
              {status.toLowerCase()}
            </Text>
            {time && (
              <Text
                color="rgb(157, 157, 157)"
                fontSize={10}
                opacity={checked ? 0.6 : 0.9}
                backgroundColor="rgba(255, 255, 255, 0.05)"
                paddingHorizontal="$1.5"
                paddingVertical="$0.5"
                borderRadius={12}
                borderWidth={1}
                borderColor="rgb(52, 54, 55)"
              >
                {time}
              </Text>
            )}
          </XStack>
        </Stack>
      </XStack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  }
});