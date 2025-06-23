import React, { memo } from 'react';
// @ts-ignore
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, TouchableOpacity, Image, Platform, Pressable, Text } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ChangeLogButton } from './changeLogButton';
import { LegalButton } from './LegalButton';
// @ts-ignore
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import * as Haptics from 'expo-haptics';
import { debouncedNavigate } from '@/utils';
import { useHabits } from '@/hooks/useHabits';
import { RecentGithubCells } from '@/components/habits/RecentGithubCells';

export const DrawerContent = memo(({ props, username, profilePicture, styles, isWeb, isIpadDevice, premium }: { 
    props: DrawerContentComponentProps; 
    username: string | undefined;
    profilePicture: string | undefined | null;
    styles: any;
    isWeb: boolean;
    isIpadDevice: boolean;
    premium: boolean;
  }) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { habits, getRecentHistory, toggleHabit, isHabitDoneToday } = useHabits();
    const todayDate = new Date();
    const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
    const imageSource = profilePicture ? { uri: profilePicture } : require('@/assets/images/adaptive-icon.png');
    
    const handleHabitToggle = (habitId: string) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      toggleHabit(habitId);
    };
    
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => debouncedNavigate('/modals/sync')}>
              <Image 
                source={imageSource}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.username}>
                {username || 'User'}
              </Text>
              {premium && (
                <MaterialIcons 
                  name="verified" 
                  size={16} 
                  color="#0cbfe9"
                  style={{ marginLeft: 4 }} 
                />
              )}
            </View>
            {!isWeb && !isIpadDevice && (
                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                      props.navigation.closeDrawer();
                    }}
                    style={{  
                      padding: isIpadDevice ? 8 : 8,
                      marginLeft: 16,
                      ...(isWeb ? {
                        borderRadius: 8,
                        transition: 'all 0.2s ease',
                      } as any : {})
                    }}
                  >
                    <Ionicons
                      name="caret-back"
                      size={isWeb ? 24 : 20}
                      color={isDark ? '#fff' : '#000'}
                    />
                  </Pressable>
                )}
          </View>
          <View style={styles.content}>
            <DrawerContentScrollView 
              {...props}
              contentContainerStyle={styles.scrollViewContent}
              style={styles.scrollView}
            >
              <DrawerItemList {...props} />
              
              {habits.length > 0 && (isWeb || isIpadDevice) && (
                <YStack marginHorizontal={-16} paddingVertical={16} gap={12}>
                  {habits.slice(0, 3).map((habit, index) => (
                    <YStack key={habit.id} paddingHorizontal={isWeb ? 0 : 8}>
                      <Text 
                        numberOfLines={1}
                        style={{
                          fontSize: isIpadDevice ? 13 : 11,
                          fontWeight: '600',
                          color: isDark ? '#999' : '#666',
                          marginBottom: 6,
                          textAlign: 'center',
                          flexShrink: 0,
                          width: '100%'
                        }}
                      >
                        {habit.title}
                      </Text>
                      <RecentGithubCells 
                        history={getRecentHistory(habit)} 
                        today={today} 
                        compact={true}
                        showTitle={false}
                        multiRow={true}
                        onTodayClick={() => handleHabitToggle(habit.id)}
                        todayCompleted={isHabitDoneToday(habit.id)}
                      />
                    </YStack>
                  ))}
                </YStack>
              )}
            </DrawerContentScrollView>
          </View>
          <XStack alignItems="center" justifyContent="space-between" marginBottom={32} paddingHorizontal={isWeb ? 24 : isIpadDevice ? 20 : 16}>
            <ChangeLogButton />
            <LegalButton />
          </XStack>
      </View>
    );
  });
  