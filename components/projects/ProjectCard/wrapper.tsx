import React, { useState } from 'react'
import { XStack, Button } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types'
import { isIpad } from '@/utils'
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { isWeb } from 'tamagui'
import { Alert, Platform, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics' 

interface ProjectCardWrapperProps {
  project: Project
  isDark: boolean
  priorityColor: string
  onEdit?: (projectId: string) => void
  children: React.ReactNode
  onArchive?: (projectId: string) => void
  hideCompletedOverlay?: boolean
}

// Helper function for border color
const borderColor = (project: Project, isDark: boolean) => {
  if (project.tasks && project.tasks.length == 0) {
    return isDark ? '#222' : '#ccc'
  }
  return 'transparent'
}

export const ProjectCardWrapper = ({ project, isDark, priorityColor, onEdit, children, onArchive, hideCompletedOverlay = false }: ProjectCardWrapperProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleLongPress = () => {
    if (project.status === 'completed') {
      // Trigger haptic feedback on mobile devices
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      setIsPressed(true);
      
      // Platform-specific confirmation dialog
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Do you want to archive this completed project?');
        if (confirmed && onArchive) {
          onArchive(project.id);
        }
        setIsPressed(false);
      } else {
        Alert.alert(
          'Archive Project',
          'Do you want to archive this completed project?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsPressed(false)
            },
            { 
              text: 'Yes', 
              onPress: () => {
                if (onArchive) {
                  onArchive(project.id);
                }
                setIsPressed(false);
              }
            }
          ]
        );
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isPressed ? 1.05 : 1, { duration: 200 }) }
      ]
    };
  });
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={{
        width: '100%',
        borderRadius: 12,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        marginHorizontal: 0,
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        overflow: 'hidden',
        position: 'relative',
        borderTopWidth: project.status === 'completed' ? 0 : 2,
        borderRightWidth: project.status === 'completed' ? 0 : 2,
        borderBottomWidth: project.status === 'completed' ? 0 : 2,
        borderLeftWidth: project.status === 'completed' ? 0 : 3,
        borderColor: project.status === 'completed' ? 'transparent' : priorityColor,
        backgroundColor: isDark ? "rgba(22, 22, 22, 0.3)" : "rgba(255, 255, 255, 0.7)",
        ...(isWeb ? {} : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 10,
        })
      }}
    >
      {project.status === 'completed' && !hideCompletedOverlay && (
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={600}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.7)',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              },
              animatedStyle
            ]}
          >
            <XStack
              bg="transparent"
              borderWidth={1}
              borderColor={isDark ? '#00ff00' : '#00ff00'}
              width={50}
              height={50}
              br={25}
              ai="center"
              jc="center"
              opacity={0.9}
            >
              <MaterialIcons name="check" size={30} color="#00ff00" />
            </XStack>
          </Animated.View>
        </Pressable>
      )}
      
      {onEdit && (
        <Button
          size="$2"
          circular
          backgroundColor="transparent"
          onPress={() => onEdit(project.id)}
          position="absolute"
          top={isIpad() ? 14 : 12}
          right={isIpad() ? 16 : 14}
          zIndex={30}
        >
          <MaterialIcons name="edit" size={18} color={isDark ? '#696969' : '#9c9c9c'} />
        </Button>
      )}

      <LinearGradient
        colors={isDark ? 
          ['#171c22', '#1a1f25', '#1d2228', '#20252c'] : 
          ['#f0f2f0', '#e8eae7', '#e0e2df', '#d8dad7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          borderWidth: 1, 
          borderRadius: 12,
          borderRightColor: borderColor(project, isDark),
          borderTopColor: borderColor(project, isDark),
          borderBottomColor: borderColor(project, isDark),
          borderColor: isDark ? '#282e36' : '#c9cec5',
          opacity: 0.98,
        }}
      />
      
      {children}
    </Animated.View>
  )
}
