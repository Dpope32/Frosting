import React from 'react';
import { Stack, Text, XStack } from 'tamagui';
import { View, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskPriority } from '@/store/ToDo';
import { isWeb } from 'tamagui';

interface TaskCardProps {
  title: string;
  time?: string;
  category?: string;
  status: string;
  priority?: TaskPriority;
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
  priority,
  categoryColor = '#9C27B0',
  checked = false,
  oneTime = false,
  onCheck,
  onDelete
}: TaskCardProps) {
  // Get priority color
  const getPriorityColor = (priority?: TaskPriority): string => {
    if (!priority) return '#607d8b'; // Default gray for undefined
    const colors: Record<TaskPriority, string> = {
      high: '#F44336', // Red
      medium: '#FF9800', // Orange
      low: '#4CAF50', // Green
    };
    return colors[priority];
  };

  // Get priority icon
  const getPriorityIcon = (priority?: TaskPriority) => {
    if (!priority) return 'flag-outline';
    const icons: Record<TaskPriority, any> = {
      high: 'alert-circle',
      medium: 'alert',
      low: 'information-circle-outline',
    };
    return icons[priority];
  };

  return (
    <Stack
      backgroundColor="rgba(14, 14, 14, 0.77)"
      br={10}
      padding={isWeb ? "$2" : "$2"}
      marginVertical={isWeb ? "$1" : "$0"}
      borderWidth={1}
      borderColor="rgba(52, 54, 55, 0.9)"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: categoryColor,
        position: 'relative',
        overflow: 'hidden',
        ...(Platform.OS === 'web' ? {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }
        } : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3
        })
      }}
    >
      {checked && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 10,
          zIndex: 1
        }}>
          <Ionicons name="checkmark-circle" size={24} color="#00C851" />
        </View>
      )}
      <XStack justifyContent="space-between" alignItems="center" gap="$1.5">
        <Pressable 
          onPress={() => onCheck?.(!checked)}
          style={{ paddingHorizontal: 4 }}
        >
          <View style={[
            styles.checkbox,
            { 
              borderColor: checked ? '#00C851' : 'rgb(52, 54, 55)',
              backgroundColor: checked ? 'rgba(0, 200, 81, 0.1)' : 'rgba(255, 255, 255, 0.65)'
            }
          ]}>
            {checked && (
              <Ionicons 
                name="checkmark-sharp" 
                size={13} 
                color="#00C851"
              />
            )}
          </View>
        </Pressable>

        <Stack flex={1} gap="$1.5">
          <XStack justifyContent="space-between" alignItems="center" gap="$1" mt={-2}>
                <Text 
                  fontFamily="$body"
                  color="rgb(232, 230, 227)" 
                  fontSize={14}
                  fontWeight="500"
                  flex={1}
                  opacity={checked ? 0.6 : 1}
                  style={{
                textDecorationLine: checked ? 'line-through' : 'none',
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 0.5, height: 0.5 },
                textShadowRadius: 1
              }}
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
                padding: 6,
                marginRight: -4
              })}
            >
              <Text fontFamily="$body" color="#ff4444" fontSize={14}>✕</Text>
            </Pressable>
          </XStack>

          <XStack gap="$1.5" alignItems="center" flexWrap="wrap" marginLeft={-6} mt={-4}>
            {/* Category chip */}
            {category && (
              <XStack 
                alignItems="center" 
                backgroundColor={`${categoryColor}15`}
                px="$1"
                py="$0.5"
                br={12}
                opacity={checked ? 0.6 : 0.9}
              >
                <Ionicons 
                  name="bookmark" 
                  size={10} 
                  color={categoryColor} 
                  style={{ marginLeft: 4, marginTop: 1 }}
                />
                <Text
                  fontFamily="$body"
                  color={categoryColor}
                  fontSize={11}
                  fontWeight="500"
                >
                  {category.toLowerCase()}
                </Text>
              </XStack>
            )}

            {/* Priority chip */}
            {priority && (
              <XStack 
                alignItems="center" 
                backgroundColor={`${getPriorityColor(priority)}15`}
                py="$0.5"
                px="$1"
                br={12}
                opacity={checked ? 0.6 : 0.9}
              >
                <Ionicons 
                  name={getPriorityIcon(priority)} 
                  size={10} 
                  color={getPriorityColor(priority)} 
                  style={{ marginRight: 2, marginTop: 1 }}
                />
                <Text
                  fontFamily="$body"
                  color={getPriorityColor(priority)}
                  fontSize={11}
                  fontWeight="500"
                >
                  {priority}
                </Text>
              </XStack>
            )}

            {/* Recurrence chip */}
            <XStack 
              alignItems="center" 
              backgroundColor={checked ? "rgba(0, 200, 81, 0.15)" : "rgba(33, 150, 243, 0.15)"}
              px="$1"
              py="$0.5"
              br={12}
              opacity={checked ? 0.6 : 0.9}
            >
              <Ionicons 
                name="repeat" 
                size={10} 
                color={checked ? "#00C851" : "#2196F3"} 
                style={{ marginRight: 2, marginTop: 1 }}
              />
              <Text
                fontFamily="$body"
                color={checked ? "#00C851" : "#2196F3"}
                fontSize={11}
                fontWeight="500"
              >
                {status.toLowerCase()}
              </Text>
            </XStack>

            {/* Time chip */}
            {time && (
              <XStack 
                alignItems="center" 
                backgroundColor="rgba(255, 255, 255, 0.05)"
                px="$1"
                py="$0.5"
                br={12}
                borderWidth={1}
                borderColor="rgb(52, 54, 55)"
                opacity={checked ? 0.6 : 0.9}
              >
                <Ionicons 
                  name="time-outline" 
                  size={10} 
                  color="rgb(157, 157, 157)" 
                  style={{ marginRight: 4, marginTop: 1 }}
                />
                <Text
                  fontFamily="$body"
                  color="rgb(157, 157, 157)"
                  fontSize={11}
                  fontWeight="500"
                >
                  {time}
                </Text>
              </XStack>
            )}
          </XStack>
        </Stack>
      </XStack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
