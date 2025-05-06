import React from 'react';
import { Text, XStack } from 'tamagui';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task';
import { isWeb } from 'tamagui';
import { getCategoryColor, getPriorityColor, getRecurrenceColor, getRecurrenceIcon, getCategoryIcon } from '@/utils/styleUtils';
import { useCustomCategoryStore } from '@/store/CustomCategoryStore';
import { useUserStore } from '@/store/UserStore';
import { Tag } from '@/types/tag';

interface TaskChipsProps {
  category?: string;
  priority?: TaskPriority;
  status: string;
  time?: string;
  recurrencePattern?: RecurrencePattern;
  tags?: Tag[];
  checked?: boolean;
}

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

export function TaskChips({ category, priority, status, time, checked = false, tags = [] }: TaskChipsProps) {
  const customCategories = useCustomCategoryStore((s) => s.categories);
  const userColor = useUserStore(s => s.preferences.primaryColor);
  let calculatedCategoryColor = category ? getCategoryColor(category as TaskCategory) : '#17A589';
  let categoryIcon = getCategoryIcon(category as TaskCategory);
  if (category) {
    const customCat = customCategories.find(catObj => catObj.name === category);
    if (customCat) {
      categoryIcon = customCat.icon || getCategoryIcon(category as TaskCategory);
    }
  }
  const isCustom = category && customCategories.some(catObj => catObj.name === category);
  const recurrencePattern = mapStatusToRecurrencePattern(status);
  const recurrenceColor = getRecurrenceColor(recurrencePattern);
  const recurrenceIcon = getRecurrenceIcon(recurrencePattern);

  return (
    <View style={styles.tagsRow}>
      {category && (
        <XStack
          alignItems="center"
          backgroundColor={isCustom ? `${userColor}15` : `${calculatedCategoryColor}15`}
          px="$1"
          py="$0.5"
          br={12}
          opacity={checked ? 0.6 : 0.9}
          marginRight={6}
          marginBottom={4}
        >
          {!isCustom && (
            <Ionicons
              name={categoryIcon as any}
              size={10}
              color={calculatedCategoryColor}
              style={{ marginLeft: 4, marginRight: 2, marginTop: 1 }}
            />
          )}
          <Text
            fontFamily="$body"
            color={isCustom ? "$gray11" : calculatedCategoryColor}
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
          py="$1"
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
      

      {recurrencePattern && (
        <XStack 
          alignItems="center" 
          backgroundColor={`${recurrenceColor}15`}
        px="$1.5"
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
      )}
      {time && (
        <XStack 
          alignItems="center" 
          backgroundColor="rgba(255, 255, 255, 0.05)"
          px="$1.5"
          py="$0.5"
          br={12}
          borderWidth={1}
          borderColor="rgb(52, 54, 55)"
          opacity={checked ? 0.6 : 0.9}
          marginRight={6}
          marginBottom={4}
        >
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
      
      {tags && tags.length > 0 && tags.map(tag => (
        <XStack
          key={tag.id}
          alignItems="center"
          backgroundColor={tag.color ? `${tag.color}15` : "rgba(255, 255, 255, 0.1)"}
          px="$1.5"
          py="$0.5"
          br={12}
          opacity={checked ? 0.6 : 0.9}
          marginRight={6}
          marginBottom={4}
        >
          <Ionicons
            name="pricetag-outline"
            size={10}
            color={tag.color || "rgb(157, 157, 157)"}
            style={{ marginRight: 3, marginTop: 1 }}
          />
          <Text
            fontFamily="$body"
            color={tag.color || "rgb(157, 157, 157)"}
            fontSize={11}
            fontWeight="500"
          >
            {tag.name}
          </Text>
        </XStack>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    marginLeft: isWeb ? -10 : 0
  }
});
