import React from 'react';
import { Stack, Text, XStack } from 'tamagui';
import { View, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task';
import { isWeb } from 'tamagui';
import { getCategoryColor, getRecurrenceColor, getRecurrenceIcon } from '@/utils/styleUtils';

interface TaskCardProps {
  title: string;
  time?: string;
  category?: string;
  status: string;
  priority?: TaskPriority;
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
  checked = false,
  onCheck,
  onDelete
}: TaskCardProps) {
  const calculatedCategoryColor = category ? getCategoryColor(category as TaskCategory) : '#17A589';

  const getPriorityColor = (priority?: TaskPriority): string => {
    if (!priority) return '#607d8b';
    const colors: Record<TaskPriority, string> = {
      high: '#F44336', 
      medium: '#FF9800', 
      low: '#4CAF50', 
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority?: TaskPriority) => {
    if (!priority) return 'flag-outline';
    const icons: Record<TaskPriority, any> = {
      high: 'alert-circle',
      medium: 'alert',
      low: 'information-circle-outline',
    };
    return icons[priority];
  };

  const mapStatusToRecurrencePattern = (status: string): RecurrencePattern | undefined => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'one-time') return 'one-time';
    if (lowerStatus === 'tomorrow') return 'tomorrow';
    if (lowerStatus === 'everyday') return 'everyday';
    if (lowerStatus === 'weekly') return 'weekly';
    if (lowerStatus === 'biweekly') return 'biweekly';
    if (lowerStatus === 'monthly') return 'monthly';
    if (lowerStatus === 'yearly') return 'yearly';
    return undefined;
  };

  const recurrencePattern = mapStatusToRecurrencePattern(status);
  const recurrenceColor = getRecurrenceColor(recurrencePattern);
  const recurrenceIcon = getRecurrenceIcon(recurrencePattern);

  return (
    <Stack
      backgroundColor="rgba(14, 14, 14, 0.77)"
      br={12}
      padding={isWeb ? "$2" : "$2"}
      marginVertical={isWeb ? "$1" : "$0"}
      borderWidth={1}
      borderColor="rgba(52, 54, 55, 0.9)"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: calculatedCategoryColor,
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

      {/* Changed to View for better layout control */}
      <View style={styles.container}>
        <Pressable 
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onCheck?.(!checked);
          }}
          style={styles.checkboxContainer}
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

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text 
              fontFamily="$body"
              color="rgb(232, 230, 227)" 
              fontSize={14}
              fontWeight="500"
              opacity={checked ? 0.6 : 1}
              style={{
                flex: 1,
                marginTop: -2,
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
          </View>

          <View style={styles.tagsRow}>
            {category && (
              <XStack
                alignItems="center"
                backgroundColor={`${calculatedCategoryColor}15`}
                px="$0.5"
                py="$0.5"
                br={12}
                opacity={checked ? 0.6 : 0.9}
                marginRight={6}
                marginBottom={4}
              >
                <Ionicons
                  name="bookmark"
                  size={10}
                  color={calculatedCategoryColor} 
                  style={{ marginLeft: 4, marginRight: 2, marginTop: 1 }}
                />
                <Text
                  fontFamily="$body"
                  color={calculatedCategoryColor}
                  fontSize={11}
                  fontWeight="500"
                >
                  {category.toLowerCase()}
                </Text>
              </XStack>
            )}

            {priority && (
              <XStack 
                alignItems="center" 
                backgroundColor={`${getPriorityColor(priority)}15`}
                py="$0.5"
                px="$1"
                br={12}
                opacity={checked ? 0.6 : 0.9}
                marginRight={6}
                marginBottom={4}
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
            
            <XStack 
              alignItems="center" 
              backgroundColor={`${recurrenceColor}15`}
              px="$1"
              py="$0.5"
              br={12}
              opacity={checked ? 0.6 : 0.9}
              marginRight={6}
              marginBottom={4}
            >
              <Ionicons 
                name={recurrenceIcon as any}
                size={10} 
                color={recurrenceColor}
                style={{ marginRight: 2, marginTop: 1 }}
              />
              <Text
                fontFamily="$body"
                color={recurrenceColor}
                fontSize={11}
                fontWeight="500"
              >
                {status.toLowerCase()}
              </Text>
            </XStack>

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
                marginBottom={4}
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
          </View>
        </View>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 2,
    marginRight: 6,
    alignSelf: 'flex-start'
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    marginLeft: -4,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginTop: 2,
    marginLeft: isWeb ? -10 : -2
  }
});