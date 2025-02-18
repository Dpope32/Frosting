import React, { useEffect, useState, useCallback } from 'react'
import { View, useWindowDimensions, Image, Pressable, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import MyTracker from '@splicer97/react-native-mytracker'
import { useUserStore } from '@/store/UserStore'
import { useProjectStore, useStoreHydrated, Task } from '@/store/ToDo'
import { LinearGradient } from 'expo-linear-gradient'
import { YStack, Text, Stack, XStack, ScrollView, Button } from 'tamagui'
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated'
import { TaskCard } from './TaskCard'
import { NewTaskModal } from './NewTaskModal'
import { getCategoryColor } from './utils'
import { getWallpaperPath } from '../constants/Backgrounds'
import { TemperatureCard } from '../utils/TemperatureCard'
import { WifiCard } from '../utils/WifiCard'
import { PortfolioCard } from '../utils/PortfolioCard'
import { TemperatureModal } from './cardModals/TemperatureModal'
import { WifiModal } from './cardModals/WifiModal'
import { PortfolioModal } from './cardModals/PortfolioModal'
import { TaskListModal } from './cardModals/TaskListModal'
//import { ClockCard } from '../utils/ClockCard'
import { QuoteSection } from '@/components/home/QuoteSection'
import { Ionicons } from '@expo/vector-icons'

type ProjectState = {
  toggleTaskCompletion: (id: string) => void
  todaysTasks: Task[]
}

export function LandingPage() {
  useEffect(() => {
    MyTracker.initTracker('initTracker')
  }, [])

const username = useUserStore(s => s.preferences.username)
const primaryColor = useUserStore(s => s.preferences.primaryColor)
const backgroundStyle = useUserStore(s => s.preferences.backgroundStyle)
const quoteEnabled = useUserStore(s => s.preferences.quoteEnabled ?? true)
const userHydrated = useUserStore(s => s.hydrated)

const toggleTaskCompletion = useProjectStore(React.useCallback((s: ProjectState) => s.toggleTaskCompletion, []))
const deleteTask = useProjectStore(React.useCallback((s: any) => s.deleteTask, []))
const projectHydrated = useStoreHydrated()
const todaysTasks = useProjectStore(React.useCallback((s: ProjectState) => s.todaysTasks, []))

  if (!userHydrated || !projectHydrated) {
    return (
      <Stack flex={1} backgroundColor="black" alignItems="center" justifyContent="center">
        <Text color="white">Loading...</Text>
      </Stack>
    )
  }

  const [sheetOpen, setSheetOpen] = useState(false)
  const [tempModalOpen, setTempModalOpen] = useState(false)
  const [wifiModalOpen, setWifiModalOpen] = useState(false)
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)
  const [taskListModalOpen, setTaskListModalOpen] = useState(false)

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours()
    switch (Math.floor(hour / 2)) {
      case 0:
        return "I AINT NO"
      case 1:
        return 'Still up'
      case 2:
        return 'Early bird'
      case 3:
        return 'Rise and shine'
      case 4:
        return 'Gm'
      case 5:
        return 'Gm'
      case 6:
        return 'Lunch time'
      case 7:
        return 'Good afternoon'
      case 8:
        return 'Whats good'
      case 9:
        return 'Good evening'
      case 10:
        return 'Gn'
      default:
        return 'Gn'
    }
  }, [])

  const handleNewTaskPress = () => {
    const startTime = Date.now()
    setSheetOpen(true)
    setTimeout(() => {
      const endTime = Date.now()
      const duration = endTime - startTime
      console.log('Modal Open Time', `Time taken: ${duration}ms`)
    }, 0)
  }

  const handleTemperaturePress = () => {
    setTempModalOpen(true)
  }

  const handleWifiPress = () => {
    setWifiModalOpen(true)
  }

  const handlePortfolioPress = () => {
    setPortfolioModalOpen(true)
  }

  const adjustColor = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])

  const completedTasksCount = React.useMemo(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    return todaysTasks.filter((t: Task) => t.completionHistory[currentDate]).length;
  }, [todaysTasks])

  const background = React.useMemo(() => {
    switch (backgroundStyle) {
      case 'gradient': {
        const lighterColor = adjustColor(primaryColor, 100)
        const darkerColor = adjustColor(primaryColor, -250)
        return (
          <LinearGradient
            colors={[lighterColor, primaryColor, darkerColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            locations={[0, 0.5, 1]}
          />
        )
      }
      case 'opaque':
        return (
          <Stack backgroundColor={primaryColor} position="absolute" width="100%" height="100%">
            <Stack position="absolute" width="100%" height="100%" />
          </Stack>
        )
      default:
        if (backgroundStyle.startsWith('wallpaper-')) {
          const wallpaper = getWallpaperPath(backgroundStyle)
          return wallpaper ? (
            <Stack position="absolute" width="100%" height="100%">
              <Image
                source={wallpaper}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
                onError={error => {
                  console.warn('Wallpaper load error:', error.nativeEvent)
                  if (backgroundStyle === 'wallpaper-1') {
                    useUserStore.getState().setPreferences({ backgroundStyle: 'gradient' })
                  }
                }}
                loadingIndicatorSource={wallpaper}
              />
              <BlurView
                intensity={10}
                tint="dark"
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            </Stack>
          ) : null
        }
        return null
    }
  }, [backgroundStyle, primaryColor, adjustColor])

  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  useEffect(() => {
    const animationConfig = { duration: 60000 }
    translateX.value = withRepeat(withTiming(-screenWidth, animationConfig), -1, false)
    translateY.value = withRepeat(withTiming(-screenHeight / 2, animationConfig), -1, false)
    return () => {
      translateX.value = 0
      translateY.value = 0
    }
  }, [])

  const starsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }))

  const stars = React.useMemo(() => (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: screenWidth * 2, height: screenHeight * 2, zIndex: 1 },
        starsAnimatedStyle,
      ]}
    >
      {[...Array(100)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 1,
            left: Math.random() * screenWidth * 2,
            top: Math.random() * screenHeight * 2,
          }}
        />
      ))}
    </Animated.View>
  ), [screenWidth, screenHeight, starsAnimatedStyle])

  return (
    <Stack flex={1} backgroundColor="black">
      {background}
      {stars}
      <ScrollView flex={1} paddingHorizontal="$3" contentContainerStyle={{ paddingBottom: 80 }}>
        <YStack paddingTop={100} gap="$2">
          <Stack
            backgroundColor="rgba(0, 0, 0, 0.85)"
            borderRadius={12}
            padding="$4"
            borderColor="rgba(255, 255, 255, 0.05)"
            borderWidth={2}
            style={{
              shadowColor: "rgba(255, 255, 255, 0.05)",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 10
            }}
          >
            <XStack alignItems="center" justifyContent="space-between" >
              <XStack alignItems="center" gap="$2" paddingLeft="$3">
                <XStack alignItems="center" gap="$1">
                  <Text
                    fontFamily="$body"
                    fontSize={20}
                    color="#dbd0c6"
                    fontWeight="bold"
                    numberOfLines={1}
                    style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}
                  >
                    {getGreeting()},
                  </Text>
                  <Text
                    fontFamily="$body"
                    fontSize={20}
                    color="#dbd0c6"
                    fontWeight="bold"
                    numberOfLines={1}
                    style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}
                  >
                    {' '}{username}
                  </Text>
                </XStack>
              </XStack>
            </XStack>
            <XStack marginTop="$3" gap="$3" flexWrap="nowrap">
              <Pressable onPress={handlePortfolioPress}>
                <PortfolioCard />
              </Pressable>
              <Pressable onPress={handleTemperaturePress}>
                <TemperatureCard />
              </Pressable>
              <Pressable onPress={handleWifiPress}>
                <WifiCard />
              </Pressable>
            </XStack>
            {Boolean(quoteEnabled) && (
              <Stack marginTop="$4">
                <QuoteSection />
              </Stack>
            )}
          </Stack>

          <Stack
            backgroundColor="rgba(0, 0, 0, 0.85)"
            borderRadius={16}
            padding="$4"
            paddingBottom="$9"
            borderWidth={2.5}
            borderColor="rgba(255, 255, 255, 0.15)"
            minHeight={300}
            style={{
              shadowColor: "rgba(255, 255, 255, 0.05)",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 10
            }}
          >
            <XStack alignItems="center" justifyContent="space-between" width="100%" marginBottom="$2" paddingLeft="$4">
              <Text 
                color="#dbd0c6" 
                fontSize={20} 
                fontWeight="bold"
                style={{
                  textShadowColor: 'rgba(219, 208, 198, 0.15)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4
                }}
              >
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
              <Pressable
                onPress={() => setTaskListModalOpen(true)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}
              >
                <Ionicons 
                  name="list-circle-outline" 
                  size={26} 
                  color="#dbd0c6"
                  style={{
                    textShadowColor: 'rgba(219, 208, 198, 0.15)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 4
                  }}
                />
              </Pressable>
            </XStack>
            <Stack gap="$2" paddingHorizontal={6} flex={1} position="relative">
              {todaysTasks.length === 0 ? (
                <XStack 
                  bg="rgba(0, 0, 0, 0.85)"
                  p="$6" 
                  borderRadius="$4" 
                  ai="center" 
                  jc="center"
                  borderWidth={1}
                  borderColor="rgba(255, 255, 255, 0.15)"
                >
                  <Text color="#dbd0c6" fontSize="$3" textAlign="center">
                    Add repeating or one-time tasks for personal, work, or anything else to get started
                  </Text>
                </XStack>
              ) : (
                todaysTasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    title={task.name}
                    time={task.time}
                    category={task.category}
                    status={task.recurrencePattern === 'one-time' ? 'One-time' : task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                    categoryColor={getCategoryColor(task.category)}
                    checked={task.completionHistory[new Date().toISOString().split('T')[0]] || false}
                    onCheck={() => toggleTaskCompletion(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
              <Pressable
                onPress={handleNewTaskPress}
                style={{
                  position: 'absolute',
                  bottom: -40,
                  right: -0,
                  backgroundColor: 'rgba(219, 208, 198, 0.2)',
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: 'rgba(219, 208, 198, 0.2)',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4
                }}
              >
                <Ionicons 
                  name="add" 
                  size={26} 
                  color="#dbd0c6"
                  style={{
                    textShadowColor: 'rgba(219, 208, 198, 0.15)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 4
                  }}
                />
              </Pressable>
            </Stack>
          </Stack>

        </YStack>
      </ScrollView>
      <TemperatureModal open={tempModalOpen} onOpenChange={setTempModalOpen} />
      <WifiModal open={wifiModalOpen} onOpenChange={setWifiModalOpen} speed="169ms" />
      <PortfolioModal open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen} />
      {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} />}
      {taskListModalOpen && <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />}
    </Stack>
  )
}
