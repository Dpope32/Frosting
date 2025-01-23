import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type TabBarIconProps = {
  focused: boolean;
  color: string;
};

export default function TabLayout() {
  console.log('[TabLayout] Attempting to render tabs layout');
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'relative',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          height: 60,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        },
        tabBarActiveTintColor: "#dbd0c6",
        tabBarInactiveTintColor: "#666",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        // 
        
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cloud"
        options={{
          title: "Cloud",
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <Ionicons
              name={focused ? "cloud" : "cloud-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
