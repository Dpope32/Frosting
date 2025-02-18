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
  onCheck,
  onDelete
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
      
      <View style={{ position: 'relative' }}>
        <XStack justifyContent="space-between" alignItems="center" gap="$2" zIndex={2}>
          <Pressable onPress={() => onCheck?.(!checked)}>
            <View style={[
              styles.checkbox,
              { borderColor: categoryColor }
            ]}>
              {checked && (
                <Ionicons 
                  name="checkmark-sharp" 
                  size={18} 
                  color={categoryColor}
                  style={{ marginTop: -1 }}
                />
              )}
            </View>
          </Pressable>
          <XStack flex={1} justifyContent="space-between" alignItems="center">
            <Text 
              color="white" 
              fontSize={14} 
              fontWeight="500"
              flex={1}
              opacity={checked ? 0.5 : 1}
            >
              {title}
            </Text>
            <Pressable 
              onPress={() => {
                if (onDelete) {
                  if (Platform.OS === 'web') {
                    if (confirm('Are you sure you want to delete this task? It will not affect future tasks if recurring.')) {
                      onDelete();
                    }
                  } else {
                    Alert.alert(
                      'Delete Task',
                      'Are you sure you want to delete this task? It will not affect future tasks if recurring.',
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
                padding: 8
              })}
            >
              <Text color="#ff4444" fontSize={16}>✕</Text>
            </Pressable>
          </XStack>
        </XStack>
        {checked && (
          <View style={[
            styles.strikethrough,
            { backgroundColor: categoryColor }
          ]} />
        )}
      </View>
      
      <XStack gap="$2" marginTop="$2" zIndex={2} alignItems="center">
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
        {time && (
          <Text 
            color="white" 
            opacity={checked ? 0.4 : 0.7} 
            fontSize={10}
            backgroundColor="rgba(0, 0, 0, 0.15)"
            paddingHorizontal="$1.5"
            paddingVertical="$0.5"
            borderRadius={4}
          >
            {time}
          </Text>
        )}
      </XStack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  strikethrough: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1.5,
    transform: [{ translateY: -0.75 }],
    zIndex: 1,
  },
});
