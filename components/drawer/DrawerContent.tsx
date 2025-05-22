import React, { memo } from 'react';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, TouchableOpacity, Image, Platform, Pressable, Text } from 'react-native';
import { XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { ChangeLogButton } from './changeLogButton';
import { LegalButton } from './LegalButton';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import * as Haptics from 'expo-haptics';

export const DrawerContent = memo(({ props, username, profilePicture, styles, isWeb, isIpadDevice }: { 
    props: DrawerContentComponentProps; 
    username: string | undefined;
    profilePicture: string | undefined | null;
    styles: any;
    isWeb: boolean;
    isIpadDevice: boolean;
  }) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const imageSource = (() => {
      if (!profilePicture) {
        return require('@/assets/images/adaptive-icon.png');
      }
      if (isWeb) {
        if (profilePicture.startsWith('data:')) {
          return { uri: profilePicture };
        }
        if (profilePicture.startsWith('file:')) {
          return require('@/assets/images/adaptive-icon.png');
        }
        return { uri: profilePicture };
      }
      // Native: fallback for file:// URIs
      if (profilePicture.startsWith('file:')) {
        return require('@/assets/images/adaptive-icon.png');
      }
      return { uri: profilePicture };
    })();
    
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/modals/sync')}>
              <Image 
                source={imageSource}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <Text style={styles.username}>
              {username || 'User'}
            </Text>
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
            </DrawerContentScrollView>
          </View>
          <XStack alignItems="center" justifyContent="space-between" marginBottom={32} paddingHorizontal={isWeb ? 24 : isIpadDevice ? 20 : 16}>
            <ChangeLogButton />
            <LegalButton />
          </XStack>
      </View>
    );
  });
  